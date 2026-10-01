from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.transaction import Transaction
from app.services.auth_service import get_current_user
from app.services.document_service import process_and_store_document, VALID_DOCUMENT_TYPES
from app.schemas.document import DocumentOut, DocumentUploadResponse
from app.schemas.transaction import TransactionOut

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("Other"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Case-insensitive document type normalization
    normalized_type = "Other"
    for vt in VALID_DOCUMENT_TYPES:
        if vt.lower() == (document_type or "").strip().lower():
            normalized_type = vt
            break

    doc_record, extracted_count = await process_and_store_document(
        file=file,
        doc_type=normalized_type,
        user_id=current_user.id,
        db=db
    )

    return DocumentUploadResponse(
        message="Document uploaded and processed successfully.",
        document=DocumentOut.from_orm(doc_record),
        extracted_transactions_count=extracted_count
    )

@router.get("", response_model=List[DocumentOut])
def get_documents(
    month: Optional[str] = None,
    doc_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Document).filter(Document.user_id == current_user.id)

    if month and month.lower() != "all":
        query = query.filter(Document.date.like(f"%{month}%"))

    if doc_type and doc_type.lower() != "all":
        query = query.filter(Document.type.ilike(f"%{doc_type}%"))

    if status_filter and status_filter.lower() != "all":
        query = query.filter(Document.status == status_filter)

    docs = query.order_by(Document.created_at.desc()).all()
    return [DocumentOut.from_orm(d) for d in docs]

@router.get("/{document_id}/transactions", response_model=List[TransactionOut])
def get_document_transactions(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Security: Verify document belongs to current user
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied.")

    txs = db.query(Transaction).filter(Transaction.document_id == document_id, Transaction.user_id == current_user.id).all()
    return [TransactionOut.from_orm(t) for t in txs]
