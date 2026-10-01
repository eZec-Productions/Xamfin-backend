'use client';

import React from 'react';
import Link from 'next/link';
import { UploadCloud, FileText, ArrowRight } from 'lucide-react';

export function EmptyStateBanner() {
  return (
    <div
      className="fin-card"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
        border: '1.5px dashed #86efac',
        borderRadius: '24px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#dcfce7',
          color: '#15803d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
        }}
      >
        <UploadCloud size={32} />
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
        Upload your first documents to get started
      </h2>
      <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '520px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
        Finlytics AI engine extracts transactions from your bank statements, invoices, and receipts, generating your first approved monthly financial report.
      </p>

      <Link
        href="/dashboard/upload"
        className="btn-primary"
        style={{ padding: '12px 28px', fontSize: '15px' }}
      >
        <span>Go to Upload Documents</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
