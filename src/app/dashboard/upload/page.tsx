'use client';

import React from 'react';
import { UploadZone } from '@/components/upload/UploadZone';
import { UploadHistoryTable } from '@/components/upload/UploadHistoryTable';

export default function UploadPage() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
          Document Intake & AI OCR
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
          Upload your bank statements, supplier invoices, customer receipts, and expense vouchers for automated reconciliation.
        </p>
      </div>

      {/* Upload Zone */}
      <UploadZone />

      {/* Upload History Table */}
      <UploadHistoryTable />
    </div>
  );
}
