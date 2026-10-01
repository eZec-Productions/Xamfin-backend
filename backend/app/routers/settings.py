from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.schemas.settings import (
    BusinessProfileUpdate,
    NotificationsUpdate,
    PlanUpdate,
    ProfileResponse
)

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/profile", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return ProfileResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        company_name=current_user.company_name,
        industry=current_user.industry or "Technology",
        fiscal_start_month=current_user.fiscal_start_month or "January",
        currency=current_user.currency or "USD ($)",
        current_plan=current_user.current_plan or "Monthly Plan",
        plan_price=current_user.plan_price or "$50/mo",
        renewal_date=current_user.renewal_date or "Oct 1, 2026",
        role=getattr(current_user, "role", "client"),
        notifications=current_user.notifications or {}
    )

@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    payload: BusinessProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.company_name = payload.company_name
    current_user.industry = payload.industry
    current_user.fiscal_start_month = payload.fiscal_start_month
    current_user.currency = payload.currency

    db.commit()
    db.refresh(current_user)

    return get_profile(current_user)

@router.put("/notifications")
def update_notifications(
    payload: NotificationsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.notifications = payload.dict()
    db.commit()

    return {"message": "Notification preferences updated.", "notifications": current_user.notifications}

@router.put("/plan", response_model=ProfileResponse)
def update_plan(
    payload: PlanUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.current_plan = payload.current_plan
    current_user.plan_price = payload.plan_price
    if payload.renewal_date:
        current_user.renewal_date = payload.renewal_date
    db.commit()
    db.refresh(current_user)

    return get_profile(current_user)
