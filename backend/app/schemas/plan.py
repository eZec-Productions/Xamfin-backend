from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class PlanResponse(BaseModel):
    id: str
    name: str
    tier_type: str
    price: float
    original_price: Optional[float] = None
    currency: str = "USD"
    billing_period: str = "month"
    price_display: str
    badge_text: Optional[str] = None
    badge_color: Optional[str] = "emerald"
    description: Optional[str] = None
    features: List[str] = []
    is_active: bool = True
    is_featured: bool = False
    display_order: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PlanCreate(BaseModel):
    id: Optional[str] = None
    name: str
    tier_type: str
    price: float
    original_price: Optional[float] = None
    currency: str = "USD"
    billing_period: str = "month"
    price_display: Optional[str] = None
    badge_text: Optional[str] = None
    badge_color: str = "emerald"
    description: Optional[str] = None
    features: List[str] = []
    is_active: bool = True
    is_featured: bool = False
    display_order: int = 0

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    tier_type: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    currency: Optional[str] = None
    billing_period: Optional[str] = None
    price_display: Optional[str] = None
    badge_text: Optional[str] = None
    badge_color: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    display_order: Optional[int] = None
