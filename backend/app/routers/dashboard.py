from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services.analytics_service import calculate_dashboard_overview
from app.schemas.dashboard import DashboardOverviewResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns personalized financial overview strictly isolated to the logged-in client.
    """
    return calculate_dashboard_overview(current_user.id, db)
