'use client';

import React from 'react';
import { FinancialReport } from '@/types/finance';
import { DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PLStatementProps {
  report: FinancialReport;
}

export function PLStatement({ report }: PLStatementProps) {
  const { plStatement, revenue, expenses, netProfit } = report;

  return (
    <div className="fin-card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            Profit & Loss Statement (P&L)
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Audited financial breakdown for {report.month} {report.year}
          </p>
        </div>
        <span className="badge badge-green">
          Audited & Reconciled
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {/* Revenue Sources */}
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Revenue Sources
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a' }}>
              ${(revenue ?? 0).toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(plStatement?.revenueSources || []).map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#475569' }}>{item.name}</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>${(item.amount ?? 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Operating Expenses
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#dc2626' }}>
              ${(expenses ?? 0).toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(plStatement?.expenseCategories || []).map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#475569' }}>{item.name}</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>${(item.amount ?? 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* P&L Bottom Line Summary Bar */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px 20px',
          borderRadius: '14px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>
            Total Net Operating Profit
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#34d399', letterSpacing: '-0.3px' }}>
            ${(netProfit ?? 0).toLocaleString()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Gross Margin</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
              {revenue > 0 ? (((netProfit ?? 0) / revenue) * 100).toFixed(1) : '0.0'}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Status</div>
            <span style={{ fontSize: '12px', color: (netProfit ?? 0) >= 0 ? '#10b981' : '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {(netProfit ?? 0) >= 0 ? '✓ Profitable' : '⚠ Loss'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
