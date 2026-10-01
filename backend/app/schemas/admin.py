from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class AdminReportListItem(BaseModel):
    id: str
    user_id: str
    client_name: str
    client_email: Optional[str] = ""
    company_name: str
    month: str
    year: str
    date_generated: str
    created_at: Optional[str] = ""
    status: str          # PENDING | IN_REVIEW | HELD | APPROVED | REJECTED
    is_approved: bool
    revenue: str
    net_profit: str
    health_score: int
    has_reviewer_notes: bool

class AdminDashboardActivityItem(BaseModel):
    id: str
    type: str # client_joined | document_uploaded | report_ready | report_approved | report_rejected | report_held
    title: str
    description: str
    client_name: str
    company_name: str
    timestamp: str
    target_id: Optional[str] = None

class AdminDashboardOverview(BaseModel):
    total_active_clients: int
    pending_reviews_count: int
    monthly_revenue: str
    documents_uploaded_this_week: int
    recent_activity: List[AdminDashboardActivityItem]

class AdminReportDetail(BaseModel):
    id: str
    user_id: str
    client_name: str
    company_name: str
    month: str
    year: str
    date_generated: str
    status: str
    is_approved: bool
    approved_by: str
    reviewer_notes: Optional[str] = None
    
    # Read-only original AI draft
    ai_draft: Optional[Dict[str, Any]] = None

    # Editable final version
    summary_metrics: Dict[str, Any]
    pl_statement: Dict[str, Any]
    cash_flow: Dict[str, Any]
    growth_analysis: str
    action_plan: List[Dict[str, Any]]

class AdminReportUpdateRequest(BaseModel):
    summary_metrics: Optional[Dict[str, Any]] = None
    pl_statement: Optional[Dict[str, Any]] = None
    cash_flow: Optional[Dict[str, Any]] = None
    growth_analysis: Optional[str] = None
    action_plan: Optional[List[Dict[str, Any]]] = None
    reviewer_notes: Optional[str] = None

class AdminReportHoldRequest(BaseModel):
    reviewer_notes: str

class AdminClientListItem(BaseModel):
    id: str
    name: str
    email: str
    company_name: str
    industry: str
    plan: str
    plan_price: str
    status: str          # active | paused | cancelled
    created_at: str
    documents_count: int
    transactions_count: int
    latest_report_status: Optional[str] = None

class AdminClientDetail(BaseModel):
    id: str
    name: str
    email: str
    company_name: str
    industry: str
    fiscal_start_month: str
    currency: str
    current_plan: str
    plan_price: str
    renewal_date: str
    account_status: str
    internal_notes: Optional[str] = None
    created_at: str
    documents: List[Dict[str, Any]]
    reports: List[Dict[str, Any]]
    transactions: List[Dict[str, Any]]

class AdminClientUpdateRequest(BaseModel):
    current_plan: Optional[str] = None
    plan_price: Optional[str] = None
    account_status: Optional[str] = None # active | paused | cancelled
    internal_notes: Optional[str] = None

class AdminClientCreateRequest(BaseModel):
    name: str
    email: str
    password: str
    company_name: str
    industry: Optional[str] = "Technology"
    fiscal_start_month: Optional[str] = "January"
    currency: Optional[str] = "USD ($)"
    current_plan: Optional[str] = "Monthly Plan"
    plan_price: Optional[str] = "$50/mo"

class AdminDocumentListItem(BaseModel):
    id: str
    user_id: str
    client_name: str
    company_name: str
    filename: str
    type: str
    size: str
    date: str
    status: str
    extracted_transactions_count: int
    error_message: Optional[str] = None
