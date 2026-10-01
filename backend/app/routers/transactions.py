import io
import csv
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.services.auth_service import get_current_user
from app.schemas.transaction import TransactionOut, TransactionListResponse

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=TransactionListResponse)
def get_transactions(
    q: Optional[str] = None,
    tx_type: Optional[str] = None,       # all | income | expense
    category: Optional[str] = None,
    sort_by: str = "date",              # date | amount | category
    sort_order: str = "desc",           # asc | desc
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if q:
        query = query.filter(Transaction.description.ilike(f"%{q}%"))

    if tx_type and tx_type.lower() != "all":
        query = query.filter(Transaction.type == tx_type.lower())

    if category and category.lower() != "all":
        query = query.filter(Transaction.category == category)

    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)

    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)

    # Sorting
    sort_column = getattr(Transaction, sort_by, Transaction.date)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    total = query.count()
    txs = query.all()

    return TransactionListResponse(
        total=total,
        transactions=[TransactionOut.from_orm(t) for t in txs]
    )

@router.get("/export-csv")
def export_transactions_csv(
    q: Optional[str] = None,
    tx_type: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Streams a real CSV file of client's filtered transactions.
    """
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if q:
        query = query.filter(Transaction.description.ilike(f"%{q}%"))
    if tx_type and tx_type.lower() != "all":
        query = query.filter(Transaction.type == tx_type.lower())
    if category and category.lower() != "all":
        query = query.filter(Transaction.category == category)

    txs = query.order_by(desc(Transaction.date)).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Description", "Category", "Type", "Amount", "Source Document"])

    for t in txs:
        writer.writerow([
            t.date,
            t.description,
            t.category,
            t.type.capitalize(),
            f"{t.amount:.2f}",
            t.source_document
        ])

    csv_data = output.getvalue()
    filename = f"finlytics_transactions_{current_user.company_name.lower().replace(' ', '_')}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
