'use client';

import React from 'react';
import { UploadedDocument } from '@/types/finance';
import { X, FileText, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

interface ExtractedTxModalProps {
  document: UploadedDocument | null;
  onClose: () => void;
}

export function ExtractedTxModal({ document, onClose }: ExtractedTxModalProps) {
  if (!document) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#fff5ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff6b00',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                {document.fileName}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Extracted Transactions ({document.extractedCount} found) • {document.documentType}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: '#94a3b8',
              backgroundColor: '#f8fafc',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {document.extractedTransactions && document.extractedTransactions.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Date
                  </th>
                  <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Description
                  </th>
                  <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Category
                  </th>
                  <th style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right' }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {document.extractedTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '12px 10px', fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {tx.date}
                      </td>
                      <td style={{ padding: '12px 10px', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {tx.description}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
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
                      <td
                        style={{
                          padding: '12px 10px',
                          fontSize: '13px',
                          fontWeight: 700,
                          textAlign: 'right',
                          color: isIncome ? '#16a34a' : '#dc2626',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isIncome ? '+' : '-'}${tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              No individual transactions record available for this file.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
            <CheckCircle2 size={16} />
            <span>Extracted and verified by Finlytics OCR</span>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '13px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
