from pydantic import BaseModel
from typing import Optional, List

class TransactionOut(BaseModel):
    id: str
    date: str
    description: str
    category: str
    amount: float
    type: str
    source_document: str

    class Config:
        from_attributes = True

class TransactionListResponse(BaseModel):
    total: int
    transactions: List[TransactionOut]
