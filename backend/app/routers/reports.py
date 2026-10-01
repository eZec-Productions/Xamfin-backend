from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.report import Report
from app.services.auth_service import get_current_user
from app.schemas.report import (
    ReportSummaryOut,
    ReportDetailOut,
    UpdateActionItemRequest
)

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("", response_model=List[ReportSummaryOut])
def get_approved_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    STRICT RULE: The client must ONLY see reports that have been reviewed and approved.
    Draft or unapproved reports are filtered out at query time.
    """
    reports = db.query(Report).filter(
        Report.user_id == current_user.id,
        Report.is_approved == True,
        Report.status == "APPROVED"
    ).order_by(Report.created_at.desc()).all()

    return [
        ReportSummaryOut(
            id=r.id,
            month=r.month,
            year=r.year,
            date_generated=r.date_generated,
            is_approved=r.is_approved,
            summary_metrics=r.summary_metrics,
            action_plan=r.action_plan
        )
        for r in reports
    ]

@router.get("/{report_id}", response_model=ReportDetailOut)
def get_report_detail(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id,
        Report.is_approved == True,
        Report.status == "APPROVED"
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found or not yet approved for client view."
        )

    return ReportDetailOut(
        id=report.id,
        month=report.month,
        year=report.year,
        date_generated=report.date_generated,
        is_approved=report.is_approved,
        approved_by=report.approved_by,
        summary_metrics=report.summary_metrics,
        pl_statement=report.pl_statement,
        cash_flow=report.cash_flow,
        growth_analysis=report.growth_analysis,
        action_plan=report.action_plan
    )

@router.patch("/{report_id}/actions/{action_id}")
def update_action_item_status(
    report_id: str,
    action_id: str,
    payload: UpdateActionItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id,
        Report.is_approved == True
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    updated_plan = []
    found = False
    for item in report.action_plan:
        if item.get("id") == action_id:
            item["status"] = payload.status
            found = True
        updated_plan.append(item)

    if not found:
        raise HTTPException(status_code=404, detail="Action item not found in report.")

    report.action_plan = updated_plan
    db.commit()

    return {"message": "Action item status updated successfully.", "action_id": action_id, "status": payload.status}
