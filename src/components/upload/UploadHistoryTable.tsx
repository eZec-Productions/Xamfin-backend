'use client';

import React, { useState, useMemo } from 'react';
import { useFinancialData } from '@/context/FinancialDataContext';
import { UploadedDocument } from '@/types/finance';
import { ExtractedTxModal } from './ExtractedTxModal';
import {
  FileText,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Search,
} from 'lucide-react';

export function UploadHistoryTable() {
  const { documents } = useFinancialData();

  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeDocForModal, setActiveDocForModal] = useState<UploadedDocument | null>(null);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (selectedMonth !== 'All' && !doc.date.includes(selectedMonth)) {
        return false;
      }
      if (selectedType !== 'All' && doc.documentType !== selectedType) {
        return false;
      }
      if (selectedStatus !== 'All' && doc.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [documents, selectedMonth, selectedType, selectedStatus]);

  const getStatusBadge = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="badge badge-green">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case 'Processing':
        return (
          <span className="badge badge-amber">
            <Clock size={12} />
            Processing
          </span>
        );
      case 'Uploading':
        return (
          <span className="badge badge-blue">
            <Clock size={12} />
            Uploading
          </span>
        );
      case 'Error':
        return (
          <span className="badge badge-rose">
            <AlertTriangle size={12} />
            Error
          </span>
        );
    }
  };

  return (
    <div className="fin-card">
      {/* Header & Filter Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            Upload History & Extracted Ledgers
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Click any row to inspect individual transactions extracted by Finlytics AI
          </p>
        </div>

        {/* Filter Selectors: Month, Type, Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                color: '#334155',
              }}
            >
              <option value="All">All Months</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                color: '#334155',
              }}
            >
              <option value="All">All Types</option>
              <option value="Bank statement">Bank statement</option>
              <option value="Invoice sent">Invoice sent</option>
              <option value="Invoice received">Invoice received</option>
              <option value="Receipt">Receipt</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                color: '#334155',
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                File Name
              </th>
              <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Document Type
              </th>
              <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Date Uploaded
              </th>
              <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Status
              </th>
              <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'center' }}>
                Transactions Extracted
              </th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }} />
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
                  No documents found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => setActiveDocForModal(doc)}
                  style={{
                    borderBottom: '1px solid #f8fafc',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* File Name */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#475569',
                          flexShrink: 0,
                        }}
                      >
                        <FileText size={16} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {doc.fileName}
                      </span>
                    </div>
                  </td>

                  {/* Document Type */}
                  <td style={{ padding: '14px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#475569',
                        padding: '3px 8px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '6px',
                        fontWeight: 500,
                      }}
                    >
                      {doc.documentType}
                    </span>
                  </td>

                  {/* Date */}
                  <td style={{ padding: '14px', fontSize: '13px', color: '#64748b' }}>
                    {doc.date}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px' }}>
                    {getStatusBadge(doc.status)}
                  </td>

                  {/* Number of Extracted Transactions */}
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: doc.extractedCount > 0 ? '#15803d' : '#94a3b8',
                        backgroundColor: doc.extractedCount > 0 ? '#dcfce7' : '#f1f5f9',
                        padding: '3px 10px',
                        borderRadius: '999px',
                      }}
                    >
                      {doc.extractedCount} tx
                    </span>
                  </td>

                  {/* Action arrow */}
                  <td style={{ padding: '14px', textAlign: 'right', color: '#cbd5e1' }}>
                    <ChevronRight size={18} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <ExtractedTxModal
        document={activeDocForModal}
        onClose={() => setActiveDocForModal(null)}
      />
    </div>
  );
}
