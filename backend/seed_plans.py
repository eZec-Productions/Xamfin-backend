"""
Seed default subscription plans in database
"""
from app.database import engine, SessionLocal, Base
from app.models.plan import SubscriptionPlan

def seed_plans():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        plans = [
            {
                "id": "plan_monthly",
                "name": "Monthly Plan",
                "tier_type": "monthly",
                "price": 50.0,
                "original_price": None,
                "currency": "USD",
                "billing_period": "month",
                "price_display": "$50/mo",
                "badge_text": None,
                "badge_color": "emerald",
                "description": "Full AI financial intelligence, monthly advisory reporting, and real-time ledger tracking.",
                "features": [
                    "Full AI Financial Intelligence",
                    "Automated Monthly P&L & Cash Flow",
                    "Dedicated Financial Advisor Review",
                    "Email & Chat Advisor Support",
                    "Real-Time Ledger & Document Processing"
                ],
                "is_active": True,
                "is_featured": False,
                "display_order": 1,
            },
            {
                "id": "plan_semi_annual",
                "name": "6 Months Plan",
                "tier_type": "semi_annual",
                "price": 250.0,
                "original_price": 300.0,
                "currency": "USD",
                "billing_period": "6 months",
                "price_display": "$250/6mo",
                "badge_text": "Save $50 (17% OFF)",
                "badge_color": "blue",
                "description": "Mid-term financial clarity and consistency with priority advisory review.",
                "features": [
                    "Everything in Monthly Plan",
                    "Semi-Annual Strategic Financial Review",
                    "Priority Document & Receipt Ingestion",
                    "Priority Advisor Queue",
                    "Custom KPI Tracking & Alerting"
                ],
                "is_active": True,
                "is_featured": False,
                "display_order": 2,
            },
            {
                "id": "plan_annual",
                "name": "Annual Plan",
                "tier_type": "annual",
                "price": 350.0,
                "original_price": 600.0,
                "currency": "USD",
                "billing_period": "year",
                "price_display": "$350/yr",
                "badge_text": "Best Value - Save $250 (42% OFF)",
                "badge_color": "purple",
                "description": "Complete annual CFO-level advisory, maximum cost savings, and 24/7 priority support.",
                "features": [
                    "Everything in 6 Months Plan",
                    "Dedicated Senior Financial Strategist",
                    "Unlimited AI Chat Analysis & Inquiries",
                    "Tax-Ready Year-End Ledger & Dossiers",
                    "24/7 VIP White-Glove Support"
                ],
                "is_active": True,
                "is_featured": True,
                "display_order": 3,
            },
        ]

        for p_data in plans:
            existing = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == p_data["id"]).first()
            if not existing:
                plan = SubscriptionPlan(**p_data)
                db.add(plan)
                print(f"Created plan: {p_data['name']} ({p_data['price_display']})")
            else:
                # Update core rates and features if needed
                for key, val in p_data.items():
                    setattr(existing, key, val)
                print(f"Updated plan: {p_data['name']} ({p_data['price_display']})")

        db.commit()
        print("Successfully seeded all subscription plans!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding plans: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_plans()
