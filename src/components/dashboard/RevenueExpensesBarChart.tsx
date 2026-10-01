'use client';

import React, { useState } from 'react';
import { MonthlyBarData } from '@/types/finance';
import { TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface RevenueExpensesBarChartProps {
  data: MonthlyBarData[];
}

export function RevenueExpensesBarChart({ data }: RevenueExpensesBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activePeriod, setActivePeriod] = useState<string>('6M');

  // Ensure we have a balanced 6-month visual presentation
  const defaultMonths = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  
  // Merge incoming data with month list to always ensure a clean, rich multi-month graph
  const displayData: MonthlyBarData[] = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    if (data.length >= 6) return data.slice(-6);

    // If 1-5 months, pad previous months so the chart has proper perspective
    const lastMonth = data[data.length - 1]?.month || 'Aug';
    const foundIdx = defaultMonths.indexOf(lastMonth);
    const endIdx = foundIdx !== -1 ? foundIdx : defaultMonths.length - 1;
    const startIdx = Math.max(0, endIdx - 5);
    const targetMonths = defaultMonths.slice(startIdx, endIdx + 1);

    return targetMonths.map((m) => {
      const match = data.find((d) => d.month.toLowerCase().startsWith(m.toLowerCase()));
      if (match) return match;
      return { month: m, revenue: 0, expenses: 0 };
    });
  }, [data]);

  const maxVal = Math.max(
    ...displayData.flatMap((d) => [d.revenue, d.expenses]),
    2000
  ) * 1.18;

  // Grid steps (4 horizontal guide lines)
  const gridSteps = [1, 0.75, 0.5, 0.25, 0];

  return (
    <div 
      className="fin-card" 
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: '20px',
        padding: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(226, 232, 240, 0.85)',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03), 0 6px 18px -3px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Chart Header - Structured to prevent any text collisions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '22px',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
              Revenue vs Expenses
            </h3>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                border: '1px solid #a7f3d0',
              }}
            >
              <TrendingUp size={12} />
              +12.0% Growth
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
            Month-by-month cashflow velocity and operational margin analysis
          </p>
        </div>

        {/* Controls & Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          {/* Period Selector */}
          <div className="segmented-control">
            {['1M', '3M', '6M', '1Y'].map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`segmented-btn ${activePeriod === p ? 'active' : ''}`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: 'linear-gradient(135deg, #ff6b00 0%, #ff8533 100%)',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div 
        style={{ 
          flex: 1, 
          minHeight: '230px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-end',
          position: 'relative',
          paddingTop: '20px',
        }}
      >
        {/* Background Grid Guide Lines */}
        <div 
          style={{ 
            position: 'absolute', 
            inset: '0 0 28px 44px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          {gridSteps.map((step, i) => (
            <div 
              key={i} 
              style={{ 
                width: '100%', 
                borderBottom: i === gridSteps.length - 1 ? '1px solid #e2e8f0' : '1px dashed #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <span 
                style={{ 
                  position: 'absolute', 
                  right: 'calc(100% + 8px)', 
                  fontSize: '10px', 
                  color: '#94a3b8', 
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                ${Math.round((maxVal * step) / 1000)}k
              </span>
            </div>
          ))}
        </div>

        {/* Columns Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            height: '190px',
            marginLeft: '44px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {displayData.map((item, idx) => {
            const revHeight = maxVal > 0 ? (item.revenue / maxVal) * 100 : 0;
            const expHeight = maxVal > 0 ? (item.expenses / maxVal) * 100 : 0;
            const isHovered = hoveredIndex === idx;
            const netProfit = item.revenue - item.expenses;
            const hasDataForMonth = item.revenue > 0 || item.expenses > 0;

            return (
              <div
                key={item.month}
                style={{
                  flex: 1,
                  maxWidth: '90px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  position: 'relative',
                  cursor: hasDataForMonth ? 'pointer' : 'default',
                  padding: '0 6px',
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Floating Tooltip */}
                {isHovered && hasDataForMonth && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '105%',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '11.5px',
                      whiteSpace: 'nowrap',
                      zIndex: 30,
                      boxShadow: '0 12px 24px -4px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                      pointerEvents: 'none',
                      animation: 'fadeIn 0.2s ease',
                    }}
                  >
                    <div style={{ fontWeight: 800, marginBottom: '6px', color: '#f8fafc', fontSize: '12px' }}>
                      {item.month} 2026
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '3px' }}>
                      <span style={{ color: '#94a3b8' }}>Revenue</span>
                      <strong style={{ color: '#ff8533' }}>${item.revenue.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '6px' }}>
                      <span style={{ color: '#94a3b8' }}>Expenses</span>
                      <strong style={{ color: '#cbd5e1' }}>${item.expenses.toLocaleString()}</strong>
                    </div>
                    <div 
                      style={{ 
                        borderTop: '1px solid rgba(255, 255, 255, 0.15)', 
                        paddingTop: '6px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        gap: '16px' 
                      }}
                    >
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>Net Profit</span>
                      <strong style={{ color: netProfit >= 0 ? '#34d399' : '#f87171' }}>
                        {netProfit < 0 ? `-$${Math.abs(netProfit).toLocaleString()}` : `$${netProfit.toLocaleString()}`}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Bars side-by-side with rounded tops & subtle glow on hover */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '6px',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                  }}
                >
                  {/* Revenue Bar - Flame Orange Gradient */}
                  <div
                    style={{
                      width: '16px',
                      height: `${Math.max(revHeight, hasDataForMonth ? 6 : 2)}%`,
                      background: hasDataForMonth 
                        ? (isHovered ? 'linear-gradient(180deg, #ff8533 0%, #ff6b00 100%)' : 'linear-gradient(180deg, #ff6b00 0%, #ea580c 100%)')
                        : '#f1f5f9',
                      borderRadius: '5px 5px 0 0',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isHovered && hasDataForMonth ? '0 4px 14px rgba(255, 107, 0, 0.45)' : 'none',
                    }}
                    title={`Revenue: $${item.revenue}`}
                  />

                  {/* Expense Bar - Rich Slate Gradient */}
                  <div
                    style={{
                      width: '16px',
                      height: `${Math.max(expHeight, hasDataForMonth ? 6 : 2)}%`,
                      background: hasDataForMonth
                        ? (isHovered ? 'linear-gradient(180deg, #475569 0%, #1e293b 100%)' : 'linear-gradient(180deg, #334155 0%, #0f172a 100%)')
                        : '#f1f5f9',
                      borderRadius: '5px 5px 0 0',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isHovered && hasDataForMonth ? '0 4px 14px rgba(15, 23, 42, 0.3)' : 'none',
                    }}
                    title={`Expenses: $${item.expenses}`}
                  />
                </div>

                {/* Month Label */}
                <div
                  style={{
                    marginTop: '10px',
                    fontSize: '11.5px',
                    fontWeight: isHovered ? 800 : (hasDataForMonth ? 700 : 500),
                    color: isHovered ? '#ff6b00' : (hasDataForMonth ? '#1e293b' : '#94a3b8'),
                    transition: 'color 0.2s ease',
                  }}
                >
                  {item.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
