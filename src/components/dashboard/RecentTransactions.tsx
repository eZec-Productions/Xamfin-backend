'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Transaction } from '@/types/finance';
import { ArrowRight, TrendingUp, TrendingDown, Clock, ExternalLink } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const formatAmount = (amount: number, type: Transaction['type']) => {
    const abs = Math.abs(amount);
    const formatted = abs.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
    return { label: type === 'income' ? `+${formatted}` : `-${formatted}`, isIncome: type === 'income' };
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      'Revenue': { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
      'Invoice': { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
      'Salary': { bg: '#faf5ff', text: '#7c3aed', border: '#ddd6fe' },
      'Marketing': { bg: '#fff5ed', text: '#ea580c', border: '#fed7aa' },
      'Software': { bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' },
      'Operations': { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
      'Tax': { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
    };
    for (const key of Object.keys(styles)) {
      if (category.toLowerCase().includes(key.toLowerCase())) return styles[key];
    }
    return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  };

  return (
    <div
      className="fin-card"
      style={{
        borderRadius: '20px',
        padding: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(226, 232, 240, 0.85)',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03), 0 6px 18px -3px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
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
              <Clock size={16} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
              Recent Transactions
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, paddingLeft: '36px' }}>
            Latest verified ledger movements from approved invoices &amp; bank sync
          </p>
        </div>

        <Link
          href="/dashboard/transactions"
          style={{
            fontSize: '12px',
            color: '#ff6b00',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '7px 14px',
            borderRadius: '999px',
            backgroundColor: '#fff5ed',
            border: '1px solid #fed7aa',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            textDecoration: 'none',
          }}
        >
          <span>View All</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
              {['Date', 'Description', 'Category', 'Amount'].map((col, i) => (
                <th
                  key={col}
                  style={{
                    padding: '10px 14px',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.7px',
                    textAlign: i === 3 ? 'right' : 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const { label, isIncome } = formatAmount(tx.amount, tx.type);
              const catStyle = getCategoryStyle(tx.category);
              const isHovered = hoveredRow === tx.id;

              return (
                <tr
                  key={tx.id}
                  onMouseEnter={() => setHoveredRow(tx.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    borderBottom: '1px solid #f8fafc',
                    backgroundColor: isHovered ? '#fafafa' : 'transparent',
                    transition: 'background 0.15s ease',
                    cursor: 'default',
                  }}
                >
                  {/* Date */}
                  <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                      {formatDate(tx.date)}
                    </span>
                  </td>

                  {/* Description */}
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isIncome ? '#ecfdf5' : '#fef2f2',
                          border: isIncome ? '1px solid #a7f3d0' : '1px solid #fecaca',
                        }}
                      >
                        {isIncome
                          ? <TrendingUp size={14} color="#059669" />
                          : <TrendingDown size={14} color="#dc2626" />
                        }
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.description}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '999px',
                        backgroundColor: catStyle.bg,
                        color: catStyle.text,
                        border: `1px solid ${catStyle.border}`,
                      }}
                    >
                      {tx.category}
                    </span>
                  </td>

                  {/* Amount */}
                  <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: isIncome ? '#059669' : '#dc2626',
                        letterSpacing: '-0.3px',
                      }}
                    >
                      {label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
          Showing {transactions.length} of all transactions
        </span>
        <Link
          href="/dashboard/transactions"
          style={{
            fontSize: '11.5px',
            color: '#ff6b00',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
          }}
        >
          <span>See complete ledger</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
