'use client';

import React, { useState } from 'react';
import { ExpenseCategory } from '@/types/finance';
import { PieChart, ArrowUpRight, TrendingDown, Layers } from 'lucide-react';

interface ExpenseBreakdownProps {
  categories: ExpenseCategory[];
}

export function ExpenseBreakdown({ categories }: ExpenseBreakdownProps) {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const totalExpenses = categories.reduce((sum, c) => sum + c.amount, 0);

  // Modern category palette with rich gradients
  const categoryGradients: Record<string, string> = {
    'Software and Tools': 'linear-gradient(90deg, #3b82f6, #60a5fa)',
    'Rent': 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
    'Payroll': 'linear-gradient(90deg, #10b981, #34d399)',
    'Marketing': 'linear-gradient(90deg, #ec4899, #f472b6)',
    'Utilities': 'linear-gradient(90deg, #f59e0b, #fbbf24)',
    'Default': 'linear-gradient(90deg, #ff6b00, #ff8533)',
  };

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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: '#fff5ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff6b00',
              }}
            >
              <PieChart size={16} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px' }}>
              Expense Breakdown
            </h3>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
            Total active monthly spend: <strong style={{ color: '#0f172a', fontWeight: 700 }}>${totalExpenses.toLocaleString()}</strong>
          </div>
        </div>

        <span
          style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '999px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#475569',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Layers size={11} />
          {categories.length} Categories
        </span>
      </div>

      {/* Multi-segment visual proportion bar */}
      <div
        style={{
          width: '100%',
          height: '10px',
          backgroundColor: '#f1f5f9',
          borderRadius: '999px',
          overflow: 'hidden',
          display: 'flex',
          gap: '2px',
          marginBottom: '20px',
          padding: '1px',
        }}
      >
        {categories.map((cat) => {
          const isTarget = hoveredCat === cat.name;
          const bg = categoryGradients[cat.name] || categoryGradients['Default'];
          return (
            <div
              key={cat.name}
              style={{
                width: `${cat.percentage}%`,
                height: '100%',
                background: bg,
                borderRadius: '999px',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: hoveredCat && !isTarget ? 0.4 : 1,
                transform: isTarget ? 'scaleY(1.3)' : 'scaleY(1)',
              }}
              title={`${cat.name}: ${cat.percentage}% ($${cat.amount.toLocaleString()})`}
            />
          );
        })}
      </div>

      {/* Categories List */}
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '14px', 
          flex: 1, 
          justifyContent: 'center' 
        }}
      >
        {categories.map((cat) => {
          const isHovered = hoveredCat === cat.name;
          const grad = categoryGradients[cat.name] || categoryGradients['Default'];

          return (
            <div 
              key={cat.name}
              onMouseEnter={() => setHoveredCat(cat.name)}
              onMouseLeave={() => setHoveredCat(null)}
              style={{
                padding: '8px 10px',
                borderRadius: '12px',
                backgroundColor: isHovered ? '#f8fafc' : 'transparent',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '3px',
                      background: grad,
                      display: 'inline-block',
                      boxShadow: isHovered ? `0 0 8px ${cat.color}` : 'none',
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: isHovered ? 700 : 600, color: '#1e293b' }}>
                    {cat.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    ${cat.amount.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '999px',
                      backgroundColor: isHovered ? '#fff5ed' : '#f1f5f9',
                      color: isHovered ? '#ff6b00' : '#475569',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {cat.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${cat.percentage}%`,
                    height: '100%',
                    background: grad,
                    borderRadius: '999px',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
