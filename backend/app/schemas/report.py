from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ActionItemOut(BaseModel):
    id: str
    title: str
    description: str
    impact: str
    status: str  # pending | done | dismissed

class ReportSummaryOut(BaseModel):
    id: str
    month: str
    year: str
    date_generated: str
    is_approved: bool
    summary_metrics: Dict[str, Any]
    action_plan: Optional[List[Dict[str, Any]]] = None

class ReportDetailOut(BaseModel):
    id: str
    month: str
    year: str
    date_generated: str
    is_approved: bool
    approved_by: str
    summary_metrics: Dict[str, Any]
    pl_statement: Dict[str, Any]
    cash_flow: Dict[str, Any]
    growth_analysis: str
    action_plan: List[ActionItemOut]

class UpdateActionItemRequest(BaseModel):
    status: str # 'done' | 'dismissed'
