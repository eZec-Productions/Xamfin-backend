from pydantic import BaseModel
from typing import List, Optional


class SendMessageRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str


class StreamMessageRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str


class RenameConversationRequest(BaseModel):
    title: str


class ChatMessageOut(BaseModel):
    id: str
    sender: str
    text: str
    sources: List[str]
    timestamp: str


class ChatConversationOut(BaseModel):
    id: str
    title: str
    created_at: str
    messages: List[ChatMessageOut] = []


class SendMessageResponse(BaseModel):
    conversation_id: str
    user_message: ChatMessageOut
    ai_message: ChatMessageOut
