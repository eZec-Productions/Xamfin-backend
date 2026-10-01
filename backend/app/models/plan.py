from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Float, Integer
from sqlalchemy.sql import func
from app.database import Base

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    tier_type = Column(String(50), nullable=False, default="monthly") # monthly, semi_annual, annual, custom
    price = Column(Float, nullable=False) # e.g. 50.0, 250.0, 350.0
    original_price = Column(Float, nullable=True) # e.g. 300.0, 600.0 for discount strikethrough
    currency = Column(String(20), default="USD")
    billing_period = Column(String(50), default="month") # month, 6 months, year
    price_display = Column(String(50), nullable=False, default="$50/mo") # $50/mo, $250/6mo, $350/yr
    badge_text = Column(String(100), nullable=True) # e.g. "Save $50 (17% OFF)", "Best Value", "Promo Offer"
    badge_color = Column(String(50), default="emerald") # emerald, blue, purple, amber, rose
    description = Column(Text, nullable=True)
    features = Column(JSON, default=list) # List of feature strings
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
