import uuid
from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True, default=lambda: f"log_{uuid.uuid4().hex[:12]}")
    actor_id = Column(String(50), nullable=False)
    actor_name = Column(String(100), nullable=False)
    action = Column(String(50), nullable=False)  # REPORT_APPROVED, REPORT_HELD, REPORT_REJECTED, REPORT_EDITED, CLIENT_UPDATED, REPORT_GENERATED, DOCUMENT_REPROCESSED
    target_type = Column(String(50), nullable=False)  # report, client, document, user
    target_id = Column(String(50), nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
