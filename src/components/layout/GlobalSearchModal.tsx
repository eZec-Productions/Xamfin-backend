'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFinancialData } from '@/context/FinancialDataContext';
import {
  Search,
  X,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export function GlobalSearchModal() {
  const router = useRouter();
  const { isSearchOpen, setIsSearchOpen, allTransactions, approvedReports } = useFinancialData();
  const [query, setQuery] = useState('');

  // Extract all action items from all approved reports
  const allActionItems = useMemo(() => {
    return approvedReports.flatMap((rep) =>
      rep.actionPlan.map((act) => ({
        ...act,
        reportMonth: `${rep.month} ${rep.year}`,
        reportId: rep.id,
      }))
    );
  }, [approvedReports]);

  // Filtered Results
  const filteredTransactions = useMemo(() => {
    if (!query.trim()) return allTransactions.slice(0, 5);
    const q = query.toLowerCase();
    return allTransactions.filter(
      (tx) =>
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        tx.amount.toString().includes(q)
    );
  }, [allTransactions, query]);

  const filteredReports = useMemo(() => {
    if (!query.trim()) return approvedReports.slice(0, 3);
    const q = query.toLowerCase();
    return approvedReports.filter(
      (rep) =>
        rep.month.toLowerCase().includes(q) ||
        rep.year.toString().includes(q) ||
        rep.growthAnalysis.toLowerCase().includes(q)
    );
  }, [approvedReports, query]);

  const filteredActionItems = useMemo(() => {
    if (!query.trim()) return allActionItems.slice(0, 3);
    const q = query.toLowerCase();
    return allActionItems.filter(
      (act) =>
        act.title.toLowerCase().includes(q) ||
        act.explanation.toLowerCase().includes(q) ||
        act.estimatedImpact.toLowerCase().includes(q)
    );
  }, [allActionItems, query]);

  if (!isSearchOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 16px 24px 16px',
      }}
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            gap: '12px',
          }}
        >
          <Search size={20} color="#ff6b00" />
          <input
            type="text"
            placeholder="Search transactions (e.g. Amazon, AWS, Payroll), reports, action items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              fontSize: '15px',
              color: '#1e293b',
              outline: 'none',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ padding: '4px', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#f1f5f9',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#64748b',
              fontWeight: 600,
            }}
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div style={{ maxHeight: '480px', overflowY: 'auto', padding: '16px 20px' }}>
          {/* Section 1: Transactions */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8' }}>
                Transactions ({filteredTransactions.length})
              </span>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  router.push('/dashboard/transactions');
                }}
                style={{ fontSize: '12px', color: '#ff6b00', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>View all in ledger</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {filteredTransactions.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#94a3b8', padding: '8px 0' }}>
                No transactions matching "{query}"
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push('/dashboard/transactions');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: tx.type === 'income' ? '#dcfce7' : '#fee2e2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: tx.type === 'income' ? '#16a34a' : '#dc2626',
                        }}
                      >
                        {tx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                          {tx.description}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {tx.category} • {tx.date}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: tx.type === 'income' ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Reports */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', marginBottom: '10px' }}>
              Approved Financial Reports ({filteredReports.length})
            </div>

            {filteredReports.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#94a3b8', padding: '8px 0' }}>
                No reports matching "{query}"
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredReports.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push(`/dashboard/reports/${rep.id}`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#e0f2fe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0284c7',
                        }}
                      >
                        <FileSpreadsheet size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{rep.month} {rep.year} Financial Review</span>
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '999px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                            Approved ✓
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Revenue: ${rep.revenue.toLocaleString()} • Net: ${rep.netProfit.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight size={16} color="#94a3b8" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Action Items */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', marginBottom: '10px' }}>
              Action Plan Recommendations ({filteredActionItems.length})
            </div>

            {filteredActionItems.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#94a3b8', padding: '8px 0' }}>
                No action recommendations matching "{query}"
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredActionItems.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push(`/dashboard/reports/${act.reportId}`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#fef3c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#b45309',
                          flexShrink: 0,
                        }}
                      >
                        <Sparkles size={16} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {act.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#ff6b00', fontWeight: 700 }}>
                          Impact: {act.estimatedImpact}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '999px',
                        backgroundColor: act.status === 'done' ? '#dcfce7' : '#f1f5f9',
                        color: act.status === 'done' ? '#15803d' : '#64748b',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#64748b',
          }}
        >
          <span>Use ↑ and ↓ to navigate, ESC to close</span>
          <span>Data isolated to your verified account</span>
        </div>
      </div>
    </div>
  );
}
