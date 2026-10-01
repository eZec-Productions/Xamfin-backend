from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # Bank Statement, Invoice Sent, Invoice Received, Receipt, Other
    size = Column(String(50), nullable=False)
    date = Column(String(50), nullable=False)   # Upload date formatted (YYYY-MM-DD)
    status = Column(String(50), default="Completed") # Uploading, Processing, Completed, Error
    file_path = Column(String(500), nullable=True)
    transaction_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
