import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from app.database import get_db
from app.models.user import User
from app.models.plan import SubscriptionPlan
from app.services.auth_service import get_current_admin_user
from app.schemas.plan import PlanResponse, PlanCreate, PlanUpdate

router = APIRouter(tags=["Plans & Subscriptions"])

# ──────────────────────────────────────────────────────────────
# 1. PUBLIC / CLIENT ACCESS
# ──────────────────────────────────────────────────────────────

@router.get("/plans", response_model=List[PlanResponse])
def get_public_active_plans(db: Session = Depends(get_db)):
    """
    Returns all active subscription plans sorted by display order.
    Consumed by Client Dashboard (Settings / Billing tab) and landing pricing.
    """
    plans = (
        db.query(SubscriptionPlan)
        .filter(SubscriptionPlan.is_active == True)
        .order_by(asc(SubscriptionPlan.display_order), asc(SubscriptionPlan.price))
        .all()
    )
    return plans


# ──────────────────────────────────────────────────────────────
# 2. ADMIN ACCESS (PROTECTED)
# ──────────────────────────────────────────────────────────────

@router.get("/admin/plans")
def get_all_plans_admin(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Returns all plans (including inactive/drafts) along with active subscriber counts.
    """
    plans = (
        db.query(SubscriptionPlan)
        .order_by(asc(SubscriptionPlan.display_order), asc(SubscriptionPlan.price))
        .all()
    )

    result = []
    for p in plans:
        # Count clients subscribed to this plan
        subscriber_count = db.query(User).filter(
            User.role == "client",
            User.current_plan == p.name
        ).count()

        plan_data = PlanResponse.model_validate(p).model_dump()
        plan_data["subscriber_count"] = subscriber_count
        result.append(plan_data)

    return result


@router.post("/admin/plans", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(
    payload: PlanCreate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Create a new subscription plan or special promotional tier.
    """
    plan_id = payload.id.strip() if payload.id and payload.id.strip() else f"plan_{uuid.uuid4().hex[:8]}"

    existing = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"A plan with ID '{plan_id}' already exists.")

    # Format price display if not supplied
    price_display = payload.price_display
    if not price_display:
        if payload.billing_period in ["month", "monthly"]:
            price_display = f"${payload.price:,.0f}/mo"
        elif payload.billing_period in ["6 months", "semi_annual"]:
            price_display = f"${payload.price:,.0f}/6mo"
        elif payload.billing_period in ["year", "annual"]:
            price_display = f"${payload.price:,.0f}/yr"
        else:
            price_display = f"${payload.price:,.0f}"

    new_plan = SubscriptionPlan(
        id=plan_id,
        name=payload.name,
        tier_type=payload.tier_type,
        price=payload.price,
        original_price=payload.original_price,
        currency=payload.currency or "USD",
        billing_period=payload.billing_period or "month",
        price_display=price_display,
        badge_text=payload.badge_text,
        badge_color=payload.badge_color or "emerald",
        description=payload.description,
        features=payload.features or [],
        is_active=payload.is_active if payload.is_active is not None else True,
        is_featured=payload.is_featured if payload.is_featured is not None else False,
        display_order=payload.display_order or 0,
    )

    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    return new_plan


@router.put("/admin/plans/{plan_id}", response_model=PlanResponse)
def update_plan(
    plan_id: str,
    payload: PlanUpdate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Update pricing, promotional badges, strike-through rates, features, or active status.
    """
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan '{plan_id}' not found.")

    if payload.name is not None:
        plan.name = payload.name
    if payload.tier_type is not None:
        plan.tier_type = payload.tier_type
    if payload.price is not None:
        plan.price = payload.price
    if payload.original_price is not None:
        # Pass 0 or negative to clear original price
        plan.original_price = payload.original_price if payload.original_price > 0 else None
    if payload.currency is not None:
        plan.currency = payload.currency
    if payload.billing_period is not None:
        plan.billing_period = payload.billing_period
    if payload.price_display is not None and payload.price_display.strip():
        plan.price_display = payload.price_display
    elif payload.price is not None or payload.billing_period is not None:
        # Recompute price display if price or period changed and price_display wasn't overridden
        period = plan.billing_period
        if period in ["month", "monthly"]:
            plan.price_display = f"${plan.price:,.0f}/mo"
        elif period in ["6 months", "semi_annual"]:
            plan.price_display = f"${plan.price:,.0f}/6mo"
        elif period in ["year", "annual"]:
            plan.price_display = f"${plan.price:,.0f}/yr"
        else:
            plan.price_display = f"${plan.price:,.0f}"

    if payload.badge_text is not None:
        plan.badge_text = payload.badge_text.strip() if payload.badge_text.strip() else None
    if payload.badge_color is not None:
        plan.badge_color = payload.badge_color
    if payload.description is not None:
        plan.description = payload.description
    if payload.features is not None:
        plan.features = payload.features
    if payload.is_active is not None:
        plan.is_active = payload.is_active
    if payload.is_featured is not None:
        plan.is_featured = payload.is_featured
    if payload.display_order is not None:
        plan.display_order = payload.display_order

    db.commit()
    db.refresh(plan)

    return plan


@router.delete("/admin/plans/{plan_id}")
def delete_plan(
    plan_id: str,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Deactivates a plan. If no users are subscribed, permanently removes it;
    otherwise sets is_active = False to preserve historical integrity.
    """
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan '{plan_id}' not found.")

    # Check if any users have this plan
    active_subs = db.query(User).filter(User.current_plan == plan.name).count()
    if active_subs > 0:
        plan.is_active = False
        db.commit()
        return {
            "success": True,
            "message": f"Plan '{plan.name}' has {active_subs} active subscriber(s). It has been deactivated instead of deleted.",
            "status": "deactivated"
        }

    db.delete(plan)
    db.commit()
    return {
        "success": True,
        "message": f"Plan '{plan.name}' successfully deleted.",
        "status": "deleted"
    }
