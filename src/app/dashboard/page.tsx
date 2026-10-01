'use client';

import React from 'react';
import { useFinancialData } from '@/context/FinancialDataContext';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { RevenueExpensesBarChart } from '@/components/dashboard/RevenueExpensesBarChart';
import { ExpenseBreakdown } from '@/components/dashboard/ExpenseBreakdown';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { HealthScoreGauge } from '@/components/dashboard/HealthScoreGauge';
import { EmptyStateBanner } from '@/components/dashboard/EmptyStateBanner';
import { BarChart2, PieChart, Clock, Sparkles, Activity } from 'lucide-react';

export default function DashboardPage() {
  const {
    metrics,
    monthlyBars,
    expenseBreakdown,
    recentTransactions,
    aiInsights,
    healthScore,
    allTransactions,
    approvedReports,
  } = useFinancialData();

  // Show empty state when client has no real data yet
  const hasData = allTransactions.length > 0 || approvedReports.length > 0;
  const showEmptyState = !hasData;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Empty State Banner (no data yet) ── */}
      {showEmptyState && <EmptyStateBanner />}

      {/* ── 4 Top Summary Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
        }}
      >
        <SummaryCard
          title="Revenue This Month"
          value={metrics.revenue.value}
          trend={metrics.revenue.trend}
          isUp={metrics.revenue.isUp}
          isPositive={true}
          percentage={metrics.revenue.percentageGoal}
          gaugeColor="#ff6b00"
        />
        <SummaryCard
          title="Expenses This Month"
          value={metrics.expenses.value}
          trend={metrics.expenses.trend}
          isUp={metrics.expenses.isUp}
          isPositive={false}
          percentage={metrics.expenses.percentageGoal}
          gaugeColor="#ef4444"
        />
        <SummaryCard
          title="Net Profit"
          value={metrics.netProfit.value}
          trend={metrics.netProfit.trend}
          isUp={metrics.netProfit.isUp}
          isPositive={true}
          percentage={metrics.netProfit.percentageGoal}
          gaugeColor="#ff6b00"
        />
        <SummaryCard
          title="Cash Balance"
          value={metrics.cashBalance.value}
          trend={metrics.cashBalance.trend}
          isUp={metrics.cashBalance.isUp}
          isPositive={true}
          percentage={metrics.cashBalance.percentageGoal}
          gaugeColor="#ff8533"
        />
      </div>

      {/* ── Charts: Revenue vs Expenses + Expense Breakdown ── */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}
        className="analytics-grid"
      >
        {monthlyBars.length > 0 ? (
          <RevenueExpensesBarChart data={monthlyBars} />
        ) : (
          <div className="fin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px', gap: '12px' }}>
            <BarChart2 size={36} color="#cbd5e1" />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>Revenue vs Expenses chart</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', textAlign: 'center' }}>Will appear once monthly financial data is uploaded and processed.</div>
          </div>
        )}

        {expenseBreakdown.length > 0 ? (
          <ExpenseBreakdown categories={expenseBreakdown} />
        ) : (
          <div className="fin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px', gap: '12px' }}>
            <PieChart size={36} color="#cbd5e1" />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>Expense Breakdown</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', textAlign: 'center' }}>Will appear once expense transactions are uploaded.</div>
          </div>
        )}
      </div>

      {/* ── AI Insights + Health Score ── */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}
        className="insights-grid"
      >
        {aiInsights.length > 0 ? (
          <AIInsightsPanel insights={aiInsights} />
        ) : (
          <div className="fin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', gap: '12px' }}>
            <Sparkles size={36} color="#cbd5e1" />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>AI Monthly Insights</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', textAlign: 'center' }}>Insights will be generated once your first report is approved.</div>
          </div>
        )}

        {healthScore ? (
          <HealthScoreGauge healthScore={healthScore} />
        ) : (
          <div className="fin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', gap: '12px' }}>
            <Activity size={36} color="#cbd5e1" />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>Financial Health Score</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', textAlign: 'center' }}>Score calculated after your first approved report.</div>
          </div>
        )}
      </div>

      {/* ── Recent Transactions ── */}
      {recentTransactions.length > 0 ? (
        <RecentTransactions transactions={recentTransactions} />
      ) : (
        <div className="fin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', gap: '12px' }}>
          <Clock size={36} color="#cbd5e1" />
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>No Transactions Yet</div>
          <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Upload bank statements or invoices to see your transaction history here.</div>
        </div>
      )}
    </div>
  );
}
