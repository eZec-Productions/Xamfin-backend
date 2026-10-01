from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(String(50), ForeignKey("documents.id"), nullable=True, index=True)
    date = Column(String(50), nullable=False)   # YYYY-MM-DD
    description = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String(20), nullable=False)   # income | expense
    source_document = Column(String(255), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

Index("idx_user_trans_date", Transaction.user_id, Transaction.date)
Index("idx_user_trans_cat", Transaction.user_id, Transaction.category)
