'use client';

import React, { useState, useMemo } from 'react';
import { useFinancialData } from '@/context/FinancialDataContext';
import { Transaction, TransactionType } from '@/types/finance';
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  DollarSign,
  Tag,
  RotateCcw,
} from 'lucide-react';

export default function TransactionsPage() {
  const { allTransactions } = useFinancialData();

  // Search input
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    allTransactions.forEach((tx) => set.add(tx.category));
    return Array.from(set);
  }, [allTransactions]);

  // Dynamic month options from actual transaction dates
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    allTransactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        // Extract YYYY-MM prefix
        const prefix = tx.date.substring(0, 7); // e.g. "2026-09"
        monthSet.add(prefix);
      }
    });
    return Array.from(monthSet).sort().reverse(); // newest first
  }, [allTransactions]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions
      .filter((tx) => {
        // Query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = tx.description.toLowerCase().includes(q);
          const matchCat = tx.category.toLowerCase().includes(q);
          const matchDoc = tx.sourceDocName?.toLowerCase().includes(q) || false;
          if (!matchDesc && !matchCat && !matchDoc) return false;
        }

        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
          return false;
        }

        // Amount min/max
        if (minAmount && tx.amount < parseFloat(minAmount)) {
          return false;
        }
        if (maxAmount && tx.amount > parseFloat(maxAmount)) {
          return false;
        }

        // Date filter — dateRange contains a YYYY-MM prefix (e.g. "2026-09")
        if (dateRange !== 'all' && !tx.date.startsWith(dateRange)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          return sortOrder === 'asc'
            ? a.date.localeCompare(b.date)
            : b.date.localeCompare(a.date);
        }
        if (sortField === 'amount') {
          return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
        if (sortField === 'category') {
          return sortOrder === 'asc'
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        }
        return 0;
      });
  }, [
    allTransactions,
    searchQuery,
    selectedType,
    selectedCategory,
    dateRange,
    minAmount,
    maxAmount,
    sortField,
    sortOrder,
  ]);

  const toggleSort = (field: 'date' | 'amount' | 'category') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCsv = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Source Document'];
    const rows = filteredTransactions.map((tx) => [
      `"${tx.date}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${tx.category}"`,
      `"${tx.type}"`,
      tx.amount,
      `"${tx.sourceDocName || 'Direct'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Finlytics_Ledger_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setDateRange('all');
    setMinAmount('');
    setMaxAmount('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
            Full Transaction Ledger & Search
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
            Search, filter, and audit all extracted ledger rows across bank statements and vendor invoices.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="btn-primary"
          style={{ padding: '9px 18px', fontSize: '13px' }}
        >
          <Download size={15} />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Two Column Layout: Left Filter Panel + Right Results Table */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
        className="tx-layout-grid"
      >
        {/* LEFT SIDE: Filter Panel */}
        <div className="fin-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              <Filter size={17} color="#ff6b00" />
              <span>Filters</span>
            </div>
            <button
              onClick={resetFilters}
              style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Search Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Description Search
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="e.g. Amazon, Rent, AWS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>

            {/* Transaction Type Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Transaction Type
              </label>
              <div style={{ display: 'flex', borderRadius: '10px', backgroundColor: '#f1f5f9', padding: '3px' }}>
                {(['all', 'income', 'expense'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      backgroundColor: selectedType === t ? '#ffffff' : 'transparent',
                      color: selectedType === t ? '#0f172a' : '#64748b',
                      boxShadow: selectedType === t ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                }}
              >
                <option value="all">All Dates</option>
                {availableMonths.map((m) => {
                  const [yr, mo] = m.split('-');
                  const label = new Date(Number(yr), Number(mo) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  return <option key={m} value={m}>{label}</option>;
                })}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                }}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Range Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Amount Range ($)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  style={{
                    width: '50%',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                />
                <span style={{ color: '#94a3b8' }}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  style={{
                    width: '50%',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Results Table */}
        <div className="fin-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              Showing {filteredTransactions.length} transaction{filteredTransactions.length === 1 ? '' : 's'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Sorted by <strong style={{ color: '#0f172a' }}>{sortField} ({sortOrder})</strong>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {/* Date sortable */}
                  <th
                    onClick={() => toggleSort('date')}
                    style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Date</span>
                      <ArrowUpDown size={13} color="#94a3b8" />
                    </div>
                  </th>

                  {/* Description */}
                  <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Description
                  </th>

                  {/* Category sortable */}
                  <th
                    onClick={() => toggleSort('category')}
                    style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Category</span>
                      <ArrowUpDown size={13} color="#94a3b8" />
                    </div>
                  </th>

                  {/* Amount sortable */}
                  <th
                    onClick={() => toggleSort('amount')}
                    style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                      <span>Amount</span>
                      <ArrowUpDown size={13} color="#94a3b8" />
                    </div>
                  </th>

                  {/* Source document */}
                  <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                    Source Document
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8' }}>
                      No transactions found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <tr
                        key={tx.id}
                        style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s ease' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Date */}
                        <td style={{ padding: '14px', fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {tx.date}
                        </td>

                        {/* Description */}
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                backgroundColor: isIncome ? '#dcfce7' : '#fee2e2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isIncome ? '#15803d' : '#dc2626',
                                flexShrink: 0,
                              }}
                            >
                              {isIncome ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                              {tx.description}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: '14px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                            }}
                          >
                            {tx.category}
                          </span>
                        </td>

                        {/* Amount */}
                        <td
                          style={{
                            padding: '14px',
                            fontSize: '14px',
                            fontWeight: 700,
                            textAlign: 'right',
                            whiteSpace: 'nowrap',
                            color: isIncome ? '#16a34a' : '#dc2626',
                          }}
                        >
                          {isIncome ? '+' : '-'}${tx.amount.toLocaleString()}
                        </td>

                        {/* Source Document */}
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                            <FileText size={14} color="#94a3b8" />
                            <span>{tx.sourceDocName || 'Bank Sync'}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
