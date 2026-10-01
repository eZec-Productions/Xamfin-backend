import uuid
import json
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.chat import ChatConversation, ChatMessage
from app.services.auth_service import get_current_user
from app.services.ai_service import generate_grounded_ai_response, stream_ai_response, get_ai_client
from app.schemas.chat import (
    SendMessageRequest,
    SendMessageResponse,
    StreamMessageRequest,
    RenameConversationRequest,
    ChatConversationOut,
    ChatMessageOut,
)

router = APIRouter(prefix="/chat", tags=["AI Chat"])


# ──────────────────────────────────────────────────────────────
# GET /chat/conversations  — list all conversations for user
# ──────────────────────────────────────────────────────────────
@router.get("/conversations", response_model=List[ChatConversationOut])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    convs = (
        db.query(ChatConversation)
        .filter(ChatConversation.user_id == current_user.id)
        .order_by(ChatConversation.created_at.desc())
        .all()
    )

    result = []
    for c in convs:
        msgs = (
            db.query(ChatMessage)
            .filter(ChatMessage.conversation_id == c.id)
            .order_by(ChatMessage.created_at.asc())
            .all()
        )
        result.append(
            ChatConversationOut(
                id=c.id,
                title=c.title,
                created_at=c.created_at.strftime("%b %d, %H:%M") if c.created_at else "Recent",
                messages=[
                    ChatMessageOut(
                        id=m.id,
                        sender=m.sender,
                        text=m.text,
                        sources=m.sources or [],
                        timestamp=m.timestamp,
                    )
                    for m in msgs
                ],
            )
        )
    return result


# ──────────────────────────────────────────────────────────────
# POST /chat/stream  — SSE streaming endpoint (primary)
# ──────────────────────────────────────────────────────────────
@router.post("/stream")
async def stream_chat_message(
    payload: StreamMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Server-Sent Events streaming endpoint.
    Streams OpenAI delta chunks as they arrive, saves both messages to DB.
    """
    conv_id = payload.conversation_id

    # Create or verify conversation
    if not conv_id:
        conv_id = f"conv_{uuid.uuid4().hex[:10]}"
        title = payload.message[:50].strip() + ("..." if len(payload.message) > 50 else "")
        db.add(ChatConversation(id=conv_id, user_id=current_user.id, title=title))
        db.commit()
    else:
        conv = db.query(ChatConversation).filter(
            ChatConversation.id == conv_id,
            ChatConversation.user_id == current_user.id,
        ).first()
        if not conv:
            conv_id = f"conv_{uuid.uuid4().hex[:10]}"
            title = payload.message[:50].strip() + ("..." if len(payload.message) > 50 else "")
            db.add(ChatConversation(id=conv_id, user_id=current_user.id, title=title))
            db.commit()

    # Save user message to DB immediately
    curr_time  = datetime.now().strftime("%I:%M %p")
    user_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    user_msg = ChatMessage(
        id=user_msg_id,
        conversation_id=conv_id,
        sender="user",
        text=payload.message,
        sources=[],
        timestamp=curr_time,
    )
    db.add(user_msg)
    db.commit()

    # Load conversation history for context (last 20 turns)
    history_msgs = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conv_id)
        .order_by(ChatMessage.created_at.asc())
        .limit(40)  # 20 turns × 2 sides
        .all()
    )
    # Map sender to OpenAI role
    conversation_history = [
        {"role": "user" if m.sender == "user" else "assistant", "content": m.text}
        for m in history_msgs
        if m.id != user_msg_id  # exclude the message we just saved (it's the new one)
    ]

    # Generate a unique AI message id so frontend can track it
    ai_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    ai_full_text = []

    async def event_generator():
        nonlocal ai_full_text

        # First event: metadata (conv_id, msg ids, user message)
        meta = {
            "type": "meta",
            "conversation_id": conv_id,
            "user_message": {
                "id": user_msg_id,
                "sender": "user",
                "text": payload.message,
                "sources": [],
                "timestamp": curr_time,
            },
            "ai_message_id": ai_msg_id,
        }
        yield f"data: {json.dumps(meta)}\n\n"

        # Stream AI response chunks
        async for chunk in stream_ai_response(
            user=current_user,
            db=db,
            conversation_history=conversation_history,
            new_message=payload.message,
        ):
            if chunk == "data: [DONE]\n\n":
                # Save complete AI response to DB
                full_response = "".join(ai_full_text)
                if not full_response.strip():
                    full_response = "I couldn't generate a response. Please try again."

                _, _, display_name = get_ai_client()
                active_sources = [display_name, "Verified Ledger"] if display_name else ["Verified Ledger"]

                ai_msg = ChatMessage(
                    id=ai_msg_id,
                    conversation_id=conv_id,
                    sender="ai",
                    text=full_response,
                    sources=active_sources,
                    timestamp=datetime.now().strftime("%I:%M %p"),
                )
                db.add(ai_msg)
                db.commit()

                done_event = {"type": "done", "ai_message": {
                    "id": ai_msg_id,
                    "sender": "ai",
                    "text": full_response,
                    "sources": active_sources,
                    "timestamp": ai_msg.timestamp,
                }}
                yield f"data: {json.dumps(done_event)}\n\n"
                return

            # Parse content chunk
            try:
                raw = chunk[len("data: "):]
                parsed = json.loads(raw)
                if "content" in parsed:
                    ai_full_text.append(parsed["content"])
                    yield f"data: {json.dumps({'type': 'delta', 'content': parsed['content']})}\n\n"
                elif "error" in parsed:
                    yield f"data: {json.dumps({'type': 'error', 'message': parsed['error']})}\n\n"
            except Exception:
                pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# ──────────────────────────────────────────────────────────────
# POST /chat/message  — non-streaming fallback (legacy)
# ──────────────────────────────────────────────────────────────
@router.post("/message", response_model=SendMessageResponse)
def send_chat_message(
    payload: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv_id = payload.conversation_id

    if not conv_id:
        conv_id = f"conv_{uuid.uuid4().hex[:10]}"
        title = payload.message[:35] + ("..." if len(payload.message) > 35 else "")
        db.add(ChatConversation(id=conv_id, user_id=current_user.id, title=title))
        db.commit()
    else:
        conv = db.query(ChatConversation).filter(
            ChatConversation.id == conv_id,
            ChatConversation.user_id == current_user.id,
        ).first()
        if not conv:
            title = payload.message[:35] + ("..." if len(payload.message) > 35 else "")
            conv = ChatConversation(id=conv_id, user_id=current_user.id, title=title)
            db.add(conv)
            db.commit()

    curr_time = datetime.now().strftime("%I:%M %p")

    # Save user message
    user_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    user_msg = ChatMessage(
        id=user_msg_id,
        conversation_id=conv_id,
        sender="user",
        text=payload.message,
        sources=[],
        timestamp=curr_time,
    )
    db.add(user_msg)
    db.commit()

    # Load history
    history_msgs = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conv_id)
        .order_by(ChatMessage.created_at.asc())
        .limit(40)
        .all()
    )
    conversation_history = [
        {"role": "user" if m.sender == "user" else "assistant", "content": m.text}
        for m in history_msgs
        if m.id != user_msg_id
    ]

    # Generate response
    ai_text, sources = generate_grounded_ai_response(
        current_user.id, payload.message, db, conversation_history
    )

    ai_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    ai_msg = ChatMessage(
        id=ai_msg_id,
        conversation_id=conv_id,
        sender="ai",
        text=ai_text,
        sources=sources,
        timestamp=datetime.now().strftime("%I:%M %p"),
    )
    db.add(ai_msg)
    db.commit()

    return SendMessageResponse(
        conversation_id=conv_id,
        user_message=ChatMessageOut(
            id=user_msg.id, sender=user_msg.sender,
            text=user_msg.text, sources=user_msg.sources or [],
            timestamp=user_msg.timestamp,
        ),
        ai_message=ChatMessageOut(
            id=ai_msg.id, sender=ai_msg.sender,
            text=ai_msg.text, sources=ai_msg.sources or [],
            timestamp=ai_msg.timestamp,
        ),
    )


# ──────────────────────────────────────────────────────────────
# PATCH /chat/conversations/{conv_id}/title  — rename
# ──────────────────────────────────────────────────────────────
@router.patch("/conversations/{conv_id}/title", status_code=200)
def rename_conversation(
    conv_id: str,
    payload: RenameConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(ChatConversation).filter(
        ChatConversation.id == conv_id,
        ChatConversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    conv.title = payload.title[:100].strip()
    db.commit()
    return {"id": conv_id, "title": conv.title}


# ──────────────────────────────────────────────────────────────
# DELETE /chat/conversations/{conv_id}  — delete
# ──────────────────────────────────────────────────────────────
@router.delete("/conversations/{conv_id}", status_code=204)
def delete_conversation(
    conv_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(ChatConversation).filter(
        ChatConversation.id == conv_id,
        ChatConversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    db.query(ChatMessage).filter(ChatMessage.conversation_id == conv_id).delete()
    db.delete(conv)
    db.commit()
