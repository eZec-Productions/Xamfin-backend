'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  FileCheck2, Clock, CheckCircle2, AlertCircle, XCircle,
  ArrowRight, HeartPulse, FileText, Search, MessageSquare, Zap,
  TrendingUp, TrendingDown, Activity, BarChart3, X,
} from 'lucide-react';

interface AdminReportItem {
  id: string;
  user_id: string;
  client_name: string;
  client_email?: string;
  company_name: string;
  month: string;
  year: string;
  date_generated: string;
  created_at?: string;
  status: 'PENDING' | 'IN_REVIEW' | 'HELD' | 'APPROVED' | 'REJECTED';
  is_approved: boolean;
  revenue: string;
  net_profit: string;
  health_score: number;
  has_reviewer_notes: boolean;
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.2)',
    icon: Clock,
  },
  IN_REVIEW: {
    label: 'In Review',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.2)',
    icon: Activity,
  },
  HELD: {
    label: 'On Hold',
    color: '#f87171',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.2)',
    icon: AlertCircle,
  },
  APPROVED: {
    label: 'Approved',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.2)',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    color: '#64748b',
    bg: 'rgba(100,116,139,0.1)',
    border: 'rgba(100,116,139,0.2)',
    icon: XCircle,
  },
};

export default function AdminReviewQueuePage() {
  const { apiFetch } = useAdminAuth();
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Trigger Report Modal State
  const [clients, setClients] = useState<{ id: string; name: string; company_name: string; email: string }[]>([]);
  const [showGenModal, setShowGenModal] = useState<boolean>(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [genMonth, setGenMonth] = useState<string>('October');
  const [genYear, setGenYear] = useState<string>('2026');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/admin/reports${activeTab !== 'ALL' ? `?status=${activeTab}` : ''}`);
      const data = await res.json();
      if (Array.isArray(data)) setReports(data);
    } catch (e) {
      console.error('Failed to load reports', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [activeTab]);

  const openGenModal = async () => {
    setShowGenModal(true);
    try {
      const res = await apiFetch('/admin/clients');
      const data = await res.json();
      if (Array.isArray(data)) {
        setClients(data);
        if (data.length > 0 && !selectedClientId) {
          setSelectedClientId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load clients', err);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedClientId) return;
    setIsGenerating(true);
    try {
      const res = await apiFetch(`/admin/clients/${selectedClientId}/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: genMonth, year: genYear }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowGenModal(false);
        const reportId = data.report_id || data.id;
        setToast({
          type: 'success',
          text: `Report draft generated for ${genMonth} ${genYear}! Added to review queue.`,
          link: reportId ? `/admin/review/${reportId}` : undefined,
        });
        fetchReports();
        setTimeout(() => setToast(null), 8000);
      } else {
        setToast({ type: 'error', text: data.detail || 'Failed to generate report.' });
      }
    } catch {
      setToast({ type: 'error', text: 'Network error while generating report.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.client_name.toLowerCase().includes(term) ||
      r.company_name.toLowerCase().includes(term) ||
      r.month.toLowerCase().includes(term) ||
      r.year.toLowerCase().includes(term)
    );
  });

  const counts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === 'PENDING').length,
    inReview: reports.filter((r) => r.status === 'IN_REVIEW').length,
    held: reports.filter((r) => r.status === 'HELD').length,
    approved: reports.filter((r) => r.status === 'APPROVED').length,
    rejected: reports.filter((r) => r.status === 'REJECTED').length,
  };

  const getStatusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    if (!cfg) return <span style={{ color: '#64748b', fontSize: '12px' }}>{status}</span>;
    const Icon = cfg.icon;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '4px 10px', borderRadius: '7px',
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        color: cfg.color, fontSize: '11.5px', fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>
        <Icon size={11} />
        {cfg.label}
      </span>
    );
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#f87171';
  };

  const getWaitingTimeInfo = (createdAtStr?: string, dateGenerated?: string) => {
    if (!createdAtStr && !dateGenerated) {
      return { text: '< 1 day', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
    }
    const dStr = createdAtStr || dateGenerated || '';
    const date = new Date(dStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays < 1) {
      const text = diffHours <= 1 ? 'Just now' : `${diffHours}h waiting`;
      return { text, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
    } else if (diffDays <= 3) {
      return { text: `${diffDays}d waiting`, color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    } else {
      return { text: `${diffDays}d waiting`, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All', count: counts.all },
    { id: 'PENDING', label: 'Pending', count: counts.pending },
    { id: 'IN_REVIEW', label: 'In Review', count: counts.inReview },
    { id: 'HELD', label: 'Held', count: counts.held },
    { id: 'APPROVED', label: 'Approved', count: counts.approved },
    { id: 'REJECTED', label: 'Rejected', count: counts.rejected },
  ];

  return (
    <div style={{
      padding: '30px 32px',
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      maxWidth: '1500px',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .queue-row { transition: background 0.15s ease; cursor: default; }
        .queue-row:hover { background: #f8fafc !important; }
        .open-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 9px;
          background: #fff5ed;
          border: 1px solid #fed7aa;
          color: #ff6b00; font-size: 12.5px; font-weight: 700;
          text-decoration: none; transition: all 0.15s ease;
          white-space: nowrap; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .open-btn:hover {
          background: #ff6b00;
          color: #ffffff;
          border-color: #ff6b00;
          transform: translateX(2px);
          box-shadow: 0 2px 8px rgba(255,107,0,0.3);
        }
        .tab-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 8px;
          font-size: 12.5px; font-weight: 500;
          border: 1px solid transparent;
          cursor: pointer; transition: all 0.15s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
          white-space: nowrap;
        }
        .search-input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          color: #0f172a; font-size: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: all 0.2s ease;
        }
        .search-input:focus {
          border-color: #ff6b00;
          box-shadow: 0 0 0 3px rgba(255,107,0,0.1);
        }
        .search-input::placeholder { color: #94a3b8; }
      `}</style>

      {/* ─── Page Header ─── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: '28px', gap: '16px', flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff6b00, #ff881a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255,107,0,0.3)',
            }}>
              <FileCheck2 size={18} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Report Review Queue
            </h1>
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
              background: '#fff5ed', color: '#ea580c',
              border: '1px solid #fed7aa',
            }}>
              Advisory Gatekeeper
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, maxWidth: '580px', lineHeight: 1.5 }}>
            Review AI-generated report drafts before they reach clients. All reports remain hidden until explicitly approved.
          </p>
        </div>

        <button
          onClick={openGenModal}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '10px 18px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #ff6b00, #ff881a)',
            color: '#ffffff', fontSize: '13px', fontWeight: 700,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255,107,0,0.3)',
            transition: 'all 0.15s ease',
          }}
        >
          <Zap size={14} />
          Trigger New Report
        </button>
      </div>

      {/* ─── Stat Cards ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '26px',
      }}>
        {[
          {
            label: 'Pending Review', value: counts.pending, color: '#ff6b00',
            bg: '#fff5ed', border: '#fed7aa',
            icon: Clock, sub: 'Need attention',
          },
          {
            label: 'In Review', value: counts.inReview, color: '#0284c7',
            bg: '#f0f9ff', border: '#bae6fd',
            icon: Activity, sub: 'Currently open',
          },
          {
            label: 'On Hold', value: counts.held, color: '#ef4444',
            bg: '#fef2f2', border: '#fecaca',
            icon: AlertCircle, sub: 'Needs clarification',
          },
          {
            label: 'Approved & Live', value: counts.approved, color: '#10b981',
            bg: '#ecfdf5', border: '#a7f3d0',
            icon: CheckCircle2, sub: 'Visible to clients',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{
              padding: '18px 20px', borderRadius: '16px',
              background: stat.bg,
              border: `1px solid ${stat.border}`,
              animation: 'fadeIn 0.4s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stat.label}
                </span>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: '#ffffff',
                  border: `1px solid ${stat.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={14} color={stat.color} />
                </div>
              </div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: stat.color, lineHeight: 1, marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ─── Filter Tabs + Search ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px', marginBottom: '18px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          padding: '5px', borderRadius: '12px',
          flexWrap: 'wrap',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}>
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="tab-btn"
                style={{
                  color: isSelected ? '#ff6b00' : '#64748b',
                  background: isSelected ? '#fff5ed' : 'transparent',
                  border: isSelected ? '1px solid #fed7aa' : '1px solid transparent',
                  fontWeight: isSelected ? 700 : 500,
                  borderRadius: '9px',
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    fontSize: '10px', fontWeight: 800,
                    minWidth: '18px', height: '18px',
                    borderRadius: '9px',
                    background: isSelected ? '#ff6b00' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#64748b',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 5px',
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="#ff6b00" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search client or period..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* ─── Reports Table ─── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      }}>
        {isLoading ? (
          <div style={{ padding: '70px', textAlign: 'center' }}>
            <div style={{
              width: '36px', height: '36px',
              border: '3px solid #ffedd5',
              borderTopColor: '#ff6b00', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px auto',
            }} />
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: 500 }}>Loading review queue...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ padding: '70px 20px', textAlign: 'center' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: '#f8fafc', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}>
              <FileText size={22} color="#ff6b00" />
            </div>
            <h3 style={{ fontSize: '15px', color: '#0f172a', margin: '0 0 6px 0', fontWeight: 700 }}>
              No reports found
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
              {searchTerm ? 'No reports match your search.' : 'No reports in this queue yet. Generate a draft for any client to start reviewing.'}
            </p>
            <button
              onClick={openGenModal}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '9px 18px', borderRadius: '10px',
                background: '#ff6b00', color: '#ffffff',
                border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 700,
                boxShadow: '0 3px 12px rgba(255,107,0,0.25)',
              }}
            >
              <Zap size={14} />
              Generate First Report
            </button>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2.2fr 2fr 1.3fr 130px 140px 150px',
              padding: '13px 22px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}>
              {['Client Name', 'Email', 'Report Period', 'Waiting Time', 'Status', 'Review Action'].map((h, i) => (
                <div key={i} style={{
                  fontSize: '11px', fontWeight: 800, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  textAlign: i === 5 ? 'right' : 'left',
                }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {filteredReports.map((report, idx) => {
              const waitInfo = getWaitingTimeInfo(report.created_at, report.date_generated);

              return (
                <div
                  key={report.id}
                  className="queue-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.2fr 2fr 1.3fr 130px 140px 150px',
                    padding: '16px 22px',
                    borderBottom: idx < filteredReports.length - 1 ? '1px solid #f1f5f9' : 'none',
                    alignItems: 'center',
                  }}
                >
                  {/* 1. Client Name */}
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', marginBottom: '2px' }}>
                      {report.client_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                      {report.company_name}
                    </div>
                  </div>

                  {/* 2. Email */}
                  <div>
                    <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
                      {report.client_email || `${report.client_name.toLowerCase().replace(/\s+/g, '.')}@client.com`}
                    </div>
                  </div>

                  {/* 3. Report Period */}
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                      {report.month} {report.year}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {report.date_generated}
                    </div>
                  </div>

                  {/* 4. Waiting Time (Color Coded: Green < 1 day, Amber 1-3 days, Red > 3 days) */}
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 10px', borderRadius: '7px',
                      background: waitInfo.bg, border: `1px solid ${waitInfo.border}`,
                      color: waitInfo.color, fontSize: '11.5px', fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}>
                      <Clock size={11} />
                      {waitInfo.text}
                    </span>
                  </div>

                  {/* 5. Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getStatusBadge(report.status)}
                    {report.has_reviewer_notes && (
                      <span title="Internal reviewer notes" style={{
                        width: '22px', height: '22px', borderRadius: '6px',
                        background: '#fff5ed',
                        border: '1px solid #fed7aa',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        color: '#ea580c', cursor: 'help',
                      }}>
                        <MessageSquare size={10} />
                      </span>
                    )}
                  </div>

                  {/* 6. Review Button */}
                  <div style={{ textAlign: 'right' }}>
                    <Link href={`/admin/review/${report.id}`} className="open-btn">
                      Review Draft
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Footer count */}
      {!isLoading && filteredReports.length > 0 && (
        <div style={{ marginTop: '14px', textAlign: 'right', fontSize: '12px', color: '#64748b' }}>
          Showing {filteredReports.length} of {reports.length} reports
        </div>
      )}

      {/* ─── Feedback Toast ─── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          background: toast.type === 'success' ? '#0f172a' : '#7f1d1d',
          color: '#ffffff',
          padding: '14px 20px', borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          border: `1px solid ${toast.type === 'success' ? '#22c55e' : '#ef4444'}`,
          display: 'flex', alignItems: 'center', gap: '14px',
          animation: 'fadeIn 0.3s ease',
          maxWidth: '460px',
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} color="#22c55e" /> : <AlertCircle size={18} color="#ef4444" />}
          <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.4 }}>
            <span>{toast.text}</span>
            {toast.link && (
              <div style={{ marginTop: '6px' }}>
                <Link
                  href={toast.link}
                  style={{
                    color: '#ff6b00', fontWeight: 700, fontSize: '12px',
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    textDecoration: 'none',
                  }}
                >
                  Open in Report Editor <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ─── Trigger New Report Modal ─── */}
      {showGenModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            animation: 'fadeIn 0.25s ease',
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Zap size={17} color="#ff6b00" />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Trigger AI Report Draft
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Creates a draft in Review Queue (hidden from client)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                disabled={isGenerating}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#64748b', padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Client Selection */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Select Client *
                </label>
                {clients.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#64748b', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    Loading active clients...
                  </div>
                ) : (
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    disabled={isGenerating}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '10px',
                      border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a',
                      background: '#ffffff', outline: 'none', fontWeight: 600,
                    }}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.company_name || 'Business'} ({c.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Month & Year Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Reporting Month
                  </label>
                  <select
                    value={genMonth}
                    onChange={(e) => setGenMonth(e.target.value)}
                    disabled={isGenerating}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a',
                      background: '#ffffff', outline: 'none', fontWeight: 600,
                    }}
                  >
                    {[
                      'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'
                    ].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Reporting Year
                  </label>
                  <select
                    value={genYear}
                    onChange={(e) => setGenYear(e.target.value)}
                    disabled={isGenerating}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a',
                      background: '#ffffff', outline: 'none', fontWeight: 600,
                    }}
                  >
                    {['2025', '2026', '2027'].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Advisory Gatekeeper Notice */}
              <div style={{
                background: '#fff5ed',
                border: '1px solid #fed7aa',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '20px',
                display: 'flex', gap: '10px', alignItems: 'flex-start',
              }}>
                <Clock size={16} color="#ea580c" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '12px', color: '#9a3412', margin: 0, lineHeight: 1.4 }}>
                  <strong>Gatekeeper Protocol:</strong> The AI will synthesize transactions into an internal draft with status <code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: '4px' }}>PENDING</code>. The client cannot view it until you review and click <strong>Approve</strong>.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  disabled={isGenerating}
                  style={{
                    padding: '10px 18px', borderRadius: '9px',
                    border: '1px solid #cbd5e1', background: '#ffffff',
                    color: '#64748b', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateReport}
                  disabled={isGenerating || !selectedClientId}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    padding: '10px 20px', borderRadius: '9px',
                    border: 'none', background: 'linear-gradient(135deg, #ff6b00, #ff881a)',
                    color: '#ffffff', fontSize: '13px', fontWeight: 700,
                    cursor: isGenerating ? 'wait' : 'pointer',
                    boxShadow: '0 4px 14px rgba(255,107,0,0.3)',
                    opacity: isGenerating ? 0.7 : 1,
                  }}
                >
                  {isGenerating ? (
                    <>
                      <div style={{
                        width: '14px', height: '14px', border: '2px solid #ffffff',
                        borderTopColor: 'transparent', borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Synthesizing Draft...
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      Generate AI Draft
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
