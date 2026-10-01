from pydantic import BaseModel
from typing import List, Optional

class MetricItem(BaseModel):
    value: str
    num: float
    trend: str
    isUp: bool
    percentageGoal: int

class DashboardMetrics(BaseModel):
    revenue: MetricItem
    expenses: MetricItem
    netProfit: MetricItem
    cashBalance: MetricItem

class MonthlyBar(BaseModel):
    month: str
    revenue: float
    expenses: float

class ExpenseCategoryItem(BaseModel):
    name: str
    amount: float
    percentage: int
    color: str

class AIInsightItem(BaseModel):
    type: str  # strong | warning | opportunity
    title: str
    description: str
    impact: str
    tag: Optional[str] = None

class HealthScoreItem(BaseModel):
    score: int
    rating: str
    changeVsLastMonth: str
    status: Optional[str] = "medium"  # high | medium | low
    title: Optional[str] = "Operating Health"
    description: Optional[str] = ""


class DashboardOverviewResponse(BaseModel):
    hasData: bool
    metrics: DashboardMetrics
    monthlyBars: List[MonthlyBar]
    expenseBreakdown: List[ExpenseCategoryItem]
    recentTransactions: List[dict]
    aiInsights: List[AIInsightItem]
    healthScore: Optional[HealthScoreItem]
