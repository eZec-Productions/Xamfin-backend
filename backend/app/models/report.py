from sqlalchemy import Column, String, Boolean, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from app.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    month = Column(String(50), nullable=False)   # e.g. August 2026
    year = Column(String(10), nullable=False)    # 2026
    date_generated = Column(String(50), nullable=False)
    
    # CRITICAL: Client can ONLY see reports where is_approved is True and status == 'APPROVED'
    status = Column(String(20), default="PENDING", nullable=False, index=True) # PENDING | IN_REVIEW | HELD | APPROVED | REJECTED
    is_approved = Column(Boolean, default=False, nullable=False, index=True)
    approved_by = Column(String(100), default="Finlytics AI Advisory Team")
    reviewer_notes = Column(Text, nullable=True) # Internal notes - NEVER visible to client

    # Original AI-Generated Draft (Read-Only reference for split-screen comparison)
    ai_draft = Column(JSON, nullable=True)

    # Metrics JSON
    # revenue, expenses, net_profit, cash_flow, trends
    summary_metrics = Column(JSON, nullable=False)
    
    # P&L, Cash Flow, Growth Analysis, Action Plan
    pl_statement = Column(JSON, nullable=False)
    cash_flow = Column(JSON, nullable=False)
    growth_analysis = Column(Text, nullable=False)
    action_plan = Column(JSON, nullable=False) # list of items with id, title, desc, impact, status ('pending'|'done'|'dismissed')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
