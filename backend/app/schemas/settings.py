from pydantic import BaseModel
from typing import Dict, Any

class BusinessProfileUpdate(BaseModel):
    company_name: str
    industry: str
    fiscal_start_month: str
    currency: str

class NotificationsUpdate(BaseModel):
    monthlyReportReady: bool
    cashFlowAlert: bool
    overdueInvoiceReminder: bool
    weeklySummary: bool

class PlanUpdate(BaseModel):
    current_plan: str
    plan_price: str
    renewal_date: str = ""

class ProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    company_name: str
    industry: str
    fiscal_start_month: str
    currency: str
    current_plan: str
    plan_price: str
    renewal_date: str
    role: str = "client"
    notifications: Dict[str, bool]
