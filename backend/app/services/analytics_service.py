from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.models.report import Report
from app.schemas.dashboard import (
    DashboardOverviewResponse,
    DashboardMetrics,
    MetricItem,
    MonthlyBar,
    ExpenseCategoryItem,
    AIInsightItem,
    HealthScoreItem
)

CATEGORY_COLORS = {
    "Payroll": "#10b981",
    "Payroll & Salaries": "#10b981",
    "Software and Tools": "#3b82f6",
    "Cloud Infrastructure (AWS/Vercel)": "#3b82f6",
    "Rent": "#8b5cf6",
    "Office Space & Utilities": "#f59e0b",
    "Utilities": "#f59e0b",
    "Marketing": "#ec4899",
    "Marketing & Growth Campaigns": "#ec4899",
    "Professional Services": "#64748b",
    "Professional & Legal Fees": "#64748b",
    "Travel": "#14b8a6",
    "Food and Dining": "#f97316",
    "Bank Fees": "#94a3b8",
    "Tax": "#ef4444",
    "Sales Revenue": "#10b981",
    "Client Retainer": "#10b981",
    "Other": "#94a3b8",
}

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

def parse_month_label(date_str: str) -> str:
    if not date_str:
        return "Current"
    if "-" in date_str:
        parts = date_str.split("-")
        if len(parts) >= 2:
            try:
                m_idx = int(parts[1]) - 1
                if 0 <= m_idx < 12:
                    return MONTH_NAMES[m_idx]
            except ValueError:
                pass
    elif "/" in date_str:
        parts = date_str.split("/")
        if len(parts) >= 2:
            try:
                m_idx = int(parts[0]) - 1
                if 0 <= m_idx < 12:
                    return MONTH_NAMES[m_idx]
            except ValueError:
                pass
    return "Current"

def calculate_dashboard_overview(user_id: str, db: Session) -> DashboardOverviewResponse:
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    approved_report = db.query(Report).filter(
        Report.user_id == user_id,
        Report.is_approved == True,
        Report.status == "APPROVED"
    ).order_by(Report.created_at.desc()).first()

    has_data = len(transactions) > 0 or approved_report is not None

    if not has_data:
        empty_metric = MetricItem(value="$0", num=0, trend="No data yet", isUp=False, percentageGoal=0)
        return DashboardOverviewResponse(
            hasData=False,
            metrics=DashboardMetrics(
                revenue=empty_metric,
                expenses=empty_metric,
                netProfit=empty_metric,
                cashBalance=empty_metric
            ),
            monthlyBars=[],
            expenseBreakdown=[],
            recentTransactions=[],
            aiInsights=[],
            healthScore=None
        )

    # 1. Calculate genuine transaction sums
    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expense = sum(t.amount for t in transactions if t.type == "expense")
    net_profit = total_income - total_expense
    cash_balance = net_profit if net_profit > 0 else 0.0

    # 2. Group transactions into actual real month buckets
    month_buckets: Dict[str, Dict[str, float]] = {}
    for t in transactions:
        m_label = parse_month_label(t.date)
        if m_label not in month_buckets:
            month_buckets[m_label] = {"revenue": 0.0, "expenses": 0.0}
        if t.type == "income":
            month_buckets[m_label]["revenue"] += t.amount
        elif t.type == "expense":
            month_buckets[m_label]["expenses"] += t.amount

    # Build monthly bars in chronological order if possible
    monthly_bars: List[MonthlyBar] = [
        MonthlyBar(
            month=m,
            revenue=round(data["revenue"], 2),
            expenses=round(data["expenses"], 2)
        )
        for m, data in month_buckets.items()
    ]

    # Calculate real month-over-month trend if multiple months exist
    rev_trend = "Current Period"
    exp_trend = "Current Period"
    if len(monthly_bars) >= 2:
        prev_rev = monthly_bars[-2].revenue
        curr_rev = monthly_bars[-1].revenue
        if prev_rev > 0:
            diff_pct = ((curr_rev - prev_rev) / prev_rev) * 100
            rev_trend = f"{'+' if diff_pct >= 0 else ''}{diff_pct:.1f}% vs last mo"

        prev_exp = monthly_bars[-2].expenses
        curr_exp = monthly_bars[-1].expenses
        if prev_exp > 0:
            diff_pct = ((curr_exp - prev_exp) / prev_exp) * 100
            exp_trend = f"{'+' if diff_pct >= 0 else ''}{diff_pct:.1f}% vs last mo"

    # Summary Metrics
    margin_pct = (net_profit / total_income * 100) if total_income > 0 else 0
    net_val_str = f"-${abs(net_profit):,.2f}" if net_profit < 0 else f"${net_profit:,.2f}"
    revenue_metric = MetricItem(
        value=f"${total_income:,.2f}",
        num=total_income,
        trend=rev_trend,
        isUp=True,
        percentageGoal=min(100, int(margin_pct)) if margin_pct > 0 else 0
    )
    expenses_metric = MetricItem(
        value=f"${total_expense:,.2f}",
        num=total_expense,
        trend=exp_trend,
        isUp=False,
        percentageGoal=min(100, int((total_expense / (total_income or 1)) * 100))
    )
    net_metric = MetricItem(
        value=net_val_str,
        num=net_profit,
        trend=f"{margin_pct:.1f}% Net Margin",
        isUp=net_profit >= 0,
        percentageGoal=min(100, max(0, int(margin_pct)))
    )
    cash_metric = MetricItem(
        value=f"${cash_balance:,.2f}",
        num=cash_balance,
        trend="Net Positive" if cash_balance > 0 else "Low Liquidity",
        isUp=cash_balance > 0,
        percentageGoal=100 if cash_balance > 0 else 0
    )

    # 3. Expense breakdown by real categories
    category_map: Dict[str, float] = {}
    for t in transactions:
        if t.type == "expense":
            category_map[t.category] = category_map.get(t.category, 0.0) + t.amount

    expense_breakdown: List[ExpenseCategoryItem] = []
    for cat_name, amt in sorted(category_map.items(), key=lambda x: x[1], reverse=True):
        pct = int((amt / total_expense * 100)) if total_expense > 0 else 0
        expense_breakdown.append(ExpenseCategoryItem(
            name=cat_name,
            amount=round(amt, 2),
            percentage=pct,
            color=CATEGORY_COLORS.get(cat_name, "#94a3b8")
        ))

    # 4. Recent transactions
    recent = sorted(transactions, key=lambda t: t.date, reverse=True)[:10]
    recent_list = [
        {
            "id": t.id,
            "date": t.date,
            "description": t.description,
            "category": t.category,
            "amount": t.amount,
            "type": t.type,
            "sourceDocName": t.source_document
        }
        for t in recent
    ]

    # 5. Real Health Score calculation from operating margin and income
    if total_income > 0:
        base_score = 50 + int(margin_pct * 0.5)
        score = max(30, min(96, base_score))
    else:
        score = 45 if net_profit >= 0 else 30

    rating = "Excellent" if score >= 85 else "Good" if score >= 70 else "Fair" if score >= 50 else "Needs Attention"
    status_label = "high" if score >= 75 else "medium" if score >= 50 else "low"
    hs_title = "Strong Financial Health" if status_label == "high" else "Stable Operating Health" if status_label == "medium" else "Attention Needed"
    hs_desc = f"Net margin is {margin_pct:.1f}% based on verified ledger transactions."

    health_score = HealthScoreItem(
        score=score,
        rating=rating,
        status=status_label,
        title=hs_title,
        description=hs_desc,
        changeVsLastMonth=f"Margin: {margin_pct:.1f}%"
    )

    # 6. Real data-grounded AI insights
    top_cat = expense_breakdown[0].name if expense_breakdown else "Operating"
    top_cat_amt = expense_breakdown[0].amount if expense_breakdown else 0

    ai_insights = [
        AIInsightItem(
            type="strong" if net_profit >= 0 else "warning",
            title="Operating Margin Overview",
            description=f"Current transactions show total revenue of ${total_income:,.2f} against ${total_expense:,.2f} in expenses, yielding a {margin_pct:.1f}% net margin.",
            impact=f"${net_profit:,.2f} Net Income",
            tag=f"${net_profit:,.2f} Net Income"
        ),
        AIInsightItem(
            type="warning",
            title="Largest Cost Driver",
            description=f"The highest single expenditure is '{top_cat}' with ${top_cat_amt:,.2f} ({int((top_cat_amt / (total_expense or 1))*100)}% of total expenses).",
            impact="Top Expense",
            tag=top_cat
        ),
    ]

    return DashboardOverviewResponse(
        hasData=True,
        metrics=DashboardMetrics(
            revenue=revenue_metric,
            expenses=expenses_metric,
            netProfit=net_metric,
            cashBalance=cash_metric
        ),
        monthlyBars=monthly_bars,
        expenseBreakdown=expense_breakdown,
        recentTransactions=recent_list,
        aiInsights=ai_insights,
        healthScore=health_score
    )
