'use client';

import React from 'react';
import Link from 'next/link';
import { useFinancialData } from '@/context/FinancialDataContext';
import {
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export default function ReportsListPage() {
  const { approvedReports } = useFinancialData();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
            Monthly Financial Reports
          </h1>
          <span className="badge badge-green">
            <ShieldCheck size={13} />
            Verified & Approved
          </span>
        </div>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Official monthly financial packages audited and approved by the Finlytics AI Team. Unapproved drafts remain strictly confidential until reviewed.
        </p>
      </div>

      {/* Reports List */}
      {approvedReports.length === 0 ? (
        <div
          className="fin-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <Calendar size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            Your first report will be ready at the start of next month.
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '440px', margin: '0 auto' }}>
            Once you upload your monthly statements, our accounting analysts review each line item before publishing your executive briefing.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {approvedReports.map((report) => (
            <div
              key={report.id}
              className="fin-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                flexWrap: 'wrap',
                gap: '16px',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Report Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#e8eff6',
                    color: '#35577D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                      {report.month} {report.year} Financial Report
                    </h3>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={12} />
                      Approved
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                    Published on {report.publishedDate || 'Recent'}
                  </div>
                </div>
              </div>

              {/* High-level figures */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Total Revenue
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    ${(report.revenue ?? 0).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Net Profit
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#35577D' }}>
                    ${(report.netProfit ?? 0).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Cash Reserves
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    ${(report.cashBalance ?? 0).toLocaleString()}
                  </div>
                </div>

                {/* View Report Button */}
                <Link
                  href={`/dashboard/reports/${report.id}`}
                  className="btn-primary"
                  style={{ padding: '9px 18px', fontSize: '13px' }}
                >
                  <span>View Report</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
