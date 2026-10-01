from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_first_time_login = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    role = Column(String(20), default="client", nullable=False) # "client" | "admin"
    account_status = Column(String(20), default="active", nullable=False) # "active" | "paused" | "cancelled"
    internal_notes = Column(Text, nullable=True)

    # Business Profile
    industry = Column(String(100), default="Digital Marketing & Tech")
    fiscal_start_month = Column(String(50), default="January")
    currency = Column(String(20), default="USD ($)")

    # Plan details
    current_plan = Column(String(100), default="Monthly Plan")
    plan_price = Column(String(50), default="$50/mo")
    renewal_date = Column(String(50), default="Oct 1, 2026")

    # Notifications JSON
    notifications = Column(JSON, default=lambda: {
        "monthlyReportReady": True,
        "cashFlowAlert": True,
        "overdueInvoiceReminder": False,
        "weeklySummary": False,
    })

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
