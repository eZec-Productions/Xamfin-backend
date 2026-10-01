from pydantic import BaseModel
from typing import Optional, List

class DocumentOut(BaseModel):
    id: str
    name: str
    type: str
    size: str
    date: str
    status: str
    transaction_count: int

    class Config:
        from_attributes = True

class DocumentUploadResponse(BaseModel):
    message: str
    document: DocumentOut
    extracted_transactions_count: int
