from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from app.database import Base

class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(50), primary_key=True, index=True)
    conversation_id = Column(String(50), ForeignKey("chat_conversations.id"), nullable=False, index=True)
    sender = Column(String(10), nullable=False) # 'user' or 'ai'
    text = Column(Text, nullable=False)
    sources = Column(JSON, default=list)        # list of strings
    timestamp = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
