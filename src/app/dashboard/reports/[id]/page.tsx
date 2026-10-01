'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFinancialData } from '@/context/FinancialDataContext';
import { PLStatement } from '@/components/reports/PLStatement';
import { CashFlowView } from '@/components/reports/CashFlowView';
import { ActionPlanWidget } from '@/components/reports/ActionPlanWidget';
import {
  ArrowLeft,
  Download,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  FileCheck2,
  PieChart,
  Sparkles,
  Building,
} from 'lucide-react';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getReportById, updateActionItemStatus, currentClient } = useFinancialData();

  const reportId = params.id as string;
  const report = getReportById(reportId);

  if (!report) {
    return (
      <div className="fin-card" style={{ padding: '48px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Report Not Found
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
          The requested report does not exist or has not been approved yet.
        </p>
        <Link href="/dashboard/reports" className="btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Approved Reports</span>
        </Link>
      </div>
    );
  }

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Breadcrumb & PDF Download Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
        className="no-print"
      >
        <Link
          href="/dashboard/reports"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#64748b',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Reports List</span>
        </Link>

        {/* PDF Download Button */}
        <button
          onClick={handlePrintPdf}
          className="btn-primary"
          style={{ padding: '9px 18px', fontSize: '13px' }}
        >
          <Download size={16} />
          <span>Download Report (PDF)</span>
        </button>
      </div>

      {/* Report Header */}
      <div
        className="fin-card"
        style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
          border: '1px solid #dcfce7',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <ShieldCheck size={14} />
                Reviewed and approved by Finlytics AI Team.
              </span>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              {report.month} {report.year} Monthly Financial Report
            </h1>
            <p style={{ fontSize: '14px', color: '#475569', marginTop: '4px' }}>
              Verified business intelligence prepared for <strong>{currentClient.companyName}</strong> • Published {report.publishedDate}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>
              Audit Ref
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
              #XAM-REC-{report.year}-{report.month.slice(0, 3).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Numbers with Percentage Change versus Previous Month */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Revenue */}
        <div className="fin-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
            Revenue
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            ${(report.revenue ?? 0).toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: (report.revChangePercent ?? 0) >= 0 ? '#15803d' : '#b91c1c' }}>
            {(report.revChangePercent ?? 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{(report.revChangePercent ?? 0) >= 0 ? `+${report.revChangePercent ?? 0}%` : `${report.revChangePercent ?? 0}%`}</span>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>vs previous month</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="fin-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
            Expenses
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            ${(report.expenses ?? 0).toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: (report.expChangePercent ?? 0) <= 0 ? '#15803d' : '#b91c1c' }}>
            {(report.expChangePercent ?? 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{(report.expChangePercent ?? 0) >= 0 ? `+${report.expChangePercent ?? 0}%` : `${report.expChangePercent ?? 0}%`}</span>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>vs previous month</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="fin-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
            Net Profit
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#35577D', marginBottom: '6px' }}>
            ${(report.netProfit ?? 0).toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: (report.profitChangePercent ?? 0) >= 0 ? '#15803d' : '#b91c1c' }}>
            {(report.profitChangePercent ?? 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{(report.profitChangePercent ?? 0) >= 0 ? `+${report.profitChangePercent ?? 0}%` : `${report.profitChangePercent ?? 0}%`}</span>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>vs previous month</span>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="fin-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
            Cash Balance
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            ${(report.cashBalance ?? 0).toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: (report.cashChangePercent ?? 0) >= 0 ? '#15803d' : '#b91c1c' }}>
            {(report.cashChangePercent ?? 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{(report.cashChangePercent ?? 0) >= 0 ? `+${report.cashChangePercent ?? 0}%` : `${report.cashChangePercent ?? 0}%`}</span>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>vs previous month</span>
          </div>
        </div>
      </div>

      {/* Growth Analysis (Plain Language) */}
      <div className="fin-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Growth Analysis & Executive Commentary
            </h3>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Plain language explanation written for business owners (no confusing financial jargon)
            </div>
          </div>
        </div>

        <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.7, backgroundColor: '#f8fafc', padding: '18px 20px', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
          {report.growthAnalysis}
        </p>
      </div>

      {/* Profit & Loss Statement Component */}
      <PLStatement report={report} />

      {/* Cash Flow Component */}
      <CashFlowView cashFlow={report.cashFlow} cashBalance={report.cashBalance} />

      {/* Expense Breakdown: Chart & Table with Comparison */}
      <div className="fin-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div className="card-title">
              <PieChart size={18} color="#35577D" />
              <span>Expense Breakdown Analysis</span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Comparative breakdown showing category spend and trend versus last month
            </p>
          </div>
        </div>

        {/* Visual Progress Bars */}
        <div style={{ display: 'flex', height: '14px', borderRadius: '999px', overflow: 'hidden', marginBottom: '20px', gap: '2px' }}>
          {(report.expenseBreakdown || []).map((cat) => (
            <div
              key={cat.name}
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
                height: '100%',
              }}
              title={`${cat.name}: ${cat.percentage}%`}
            />
          ))}
        </div>

        {/* Expense Breakdown Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Category
                </th>
                <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right' }}>
                  Amount
                </th>
                <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'center' }}>
                  % of Total
                </th>
                <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right' }}>
                  Comparison vs Last Month
                </th>
              </tr>
            </thead>
            <tbody>
              {(report.expenseBreakdown || []).map((cat) => (
                <tr key={cat.name} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cat.color, display: 'inline-block' }} />
                      <span>{cat.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: 700, textAlign: 'right', color: '#0f172a' }}>
                    ${(cat.amount ?? 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                      {cat.percentage}%
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        color: cat.changeVsLastMonth <= 0 ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {cat.changeVsLastMonth >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      <span>{cat.changeVsLastMonth >= 0 ? `+${cat.changeVsLastMonth}%` : `${cat.changeVsLastMonth}%`}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Plan — Top 3 Things To Do */}
      <ActionPlanWidget
        actionPlan={report.actionPlan}
        onStatusChange={(actionId, status) => updateActionItemStatus(report.id, actionId, status)}
      />
    </div>
  );
}
