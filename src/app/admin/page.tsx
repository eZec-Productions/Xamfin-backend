'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Users,
  FileCheck2,
  DollarSign,
  FolderOpen,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  FileText,
  UserPlus,
  RefreshCw,
  Zap,
  TrendingUp,
  Shield,
  ChevronRight,
  Activity,
  AlertTriangle,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string; // 'client_joined' | 'document_uploaded' | 'report_ready' | 'report_approved' | 'report_rejected' | 'report_held'
  title: string;
  description: string;
  client_name: string;
  company_name: string;
  timestamp: string;
  target_id?: string;
}

interface DashboardOverview {
  total_active_clients: number;
  pending_reviews_count: number;
  monthly_revenue: string;
  documents_uploaded_this_week: number;
  recent_activity: ActivityItem[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { adminUser, apiFetch } = useAdminAuth();

  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOverview = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await apiFetch('/admin/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch admin dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleActivityClick = (act: ActivityItem) => {
    if (act.type === 'report_ready' && act.target_id) {
      router.push(`/admin/review/${act.target_id}`);
    } else if (act.type === 'report_approved' && act.target_id) {
      router.push(`/admin/review/${act.target_id}`);
    } else if (act.type === 'document_uploaded') {
      router.push('/admin/documents');
    } else if (act.type === 'client_joined' && act.target_id) {
      router.push(`/admin/clients/${act.target_id}`);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'report_ready':
        return <Sparkles size={16} color="#ff6b00" />;
      case 'report_approved':
        return <CheckCircle2 size={16} color="#10b981" />;
      case 'report_rejected':
        return <XCircle size={16} color="#ef4444" />;
      case 'report_held':
        return <PauseCircle size={16} color="#f59e0b" />;
      case 'document_uploaded':
        return <FolderOpen size={16} color="#3b82f6" />;
      case 'client_joined':
        return <UserPlus size={16} color="#8b5cf6" />;
      default:
        return <Activity size={16} color="#64748b" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'report_ready':
        return { label: 'Action Required', bg: '#fff5ed', color: '#ea580c', border: '#fed7aa' };
      case 'report_approved':
        return { label: 'Approved', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
      case 'report_rejected':
        return { label: 'Rejected', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
      case 'report_held':
        return { label: 'On Hold', bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
      case 'document_uploaded':
        return { label: 'Upload', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
      case 'client_joined':
        return { label: 'New Client', bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' };
      default:
        return { label: 'Event', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{ padding: '30px 32px 60px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .metric-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 22px 24px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          position: relative;
          overflow: hidden;
        }
        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.06);
          border-color: #cbd5e1;
        }
        .activity-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid #f1f5f9;
          transition: all 0.18s ease;
          cursor: pointer;
          margin-bottom: 10px;
        }
        .activity-row:hover {
          background: #fffbf7;
          border-color: #fed7aa;
          transform: translateX(3px);
          box-shadow: 0 4px 14px rgba(255,107,0,0.05);
        }
        .quick-action-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s ease;
        }
        .quick-action-card:hover {
          border-color: #ff6b00;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,107,0,0.08);
        }
      `}</style>

      {/* ─── Hero / Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff6b00, #ff881a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(255,107,0,0.3)',
            }}>
              <Shield size={19} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Advisory Command Center
            </h1>
            <span style={{
              fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px',
              background: '#fff5ed', color: '#ea580c', border: '1px solid #fed7aa',
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              Finlytics AI Internal
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
            Welcome back, <strong style={{ color: '#0f172a' }}>{adminUser?.name || 'Administrator'}</strong>. Real-time platform metrics and audit activity.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => fetchOverview(true)}
            disabled={isRefreshing}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '9px 15px', borderRadius: '10px',
              background: '#ffffff', border: '1.5px solid #e2e8f0',
              color: '#475569', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/review"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff6b00 0%, #ff881a 100%)',
              color: '#ffffff', fontSize: '13px', fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(255,107,0,0.3)',
            }}
          >
            <FileCheck2 size={15} />
            <span>Open Review Queue</span>
            {data && data.pending_reviews_count > 0 && (
              <span style={{
                background: '#ffffff', color: '#ff6b00',
                fontSize: '11px', fontWeight: 800,
                padding: '1px 6px', borderRadius: '10px',
              }}>
                {data.pending_reviews_count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ─── 1. TOP 4 METRICS CARDS ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        {/* Metric 1: Total Active Clients */}
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Active Clients
            </span>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: '#eff6ff', color: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {isLoading ? '...' : data?.total_active_clients || 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={13} /> Active enterprise accounts
            </span>
            <Link href="/admin/clients" style={{ fontSize: '12px', color: '#ff6b00', fontWeight: 700, textDecoration: 'none' }}>
              Manage &rarr;
            </Link>
          </div>
        </div>

        {/* Metric 2: Pending Reviews Count */}
        <div className="metric-card" style={{ borderColor: (data?.pending_reviews_count || 0) > 0 ? '#fed7aa' : '#e2e8f0', background: (data?.pending_reviews_count || 0) > 0 ? '#fffdfa' : '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pending Reviews Count
            </span>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: (data?.pending_reviews_count || 0) > 0 ? '#fff5ed' : '#f8fafc',
              color: (data?.pending_reviews_count || 0) > 0 ? '#ff6b00' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileCheck2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: (data?.pending_reviews_count || 0) > 0 ? '#ea580c' : '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {isLoading ? '...' : data?.pending_reviews_count || 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '11px', fontWeight: 700,
              padding: '2px 8px', borderRadius: '6px',
              background: (data?.pending_reviews_count || 0) > 0 ? '#fff5ed' : '#f1f5f9',
              color: (data?.pending_reviews_count || 0) > 0 ? '#ea580c' : '#64748b',
              border: (data?.pending_reviews_count || 0) > 0 ? '1px solid #fed7aa' : '1px solid #e2e8f0',
            }}>
              {(data?.pending_reviews_count || 0) > 0 ? 'Action Required' : 'Queue Cleared'}
            </span>
            <Link href="/admin/review" style={{ fontSize: '12px', color: '#ff6b00', fontWeight: 700, textDecoration: 'none' }}>
              Review &rarr;
            </Link>
          </div>
        </div>

        {/* Metric 3: Monthly Revenue */}
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Monthly Revenue
            </span>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: '#ecfdf5', color: '#059669',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {isLoading ? '...' : data?.monthly_revenue || '$0/mo'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              Annualized ARR: <strong style={{ color: '#0f172a' }}>Verified</strong>
            </span>
            <Link href="/admin/plans" style={{ fontSize: '12px', color: '#ff6b00', fontWeight: 700, textDecoration: 'none' }}>
              Plans &rarr;
            </Link>
          </div>
        </div>

        {/* Metric 4: Documents Uploaded This Week */}
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Documents This Week
            </span>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: '#fff5ed', color: '#ff6b00',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FolderOpen size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {isLoading ? '...' : data?.documents_uploaded_this_week || 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              Ingestion pipeline active
            </span>
            <Link href="/admin/documents" style={{ fontSize: '12px', color: '#ff6b00', fontWeight: 700, textDecoration: 'none' }}>
              Tracker &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN SPLIT: RECENT ACTIVITY FEED + QUICK ACTIONS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* LEFT: Live Activity Feed */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 3px 0' }}>
                Live Platform Activity Feed
              </h2>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                Real-time stream of client registrations, uploads, and AI gatekeeper actions.
              </p>
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 700, color: '#ff6b00',
              background: '#fff5ed', border: '1px solid #fed7aa',
              padding: '3px 9px', borderRadius: '6px',
            }}>
              Live Events
            </span>
          </div>

          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{
                width: '32px', height: '32px',
                border: '3px solid #fed7aa', borderTopColor: '#ff6b00',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                margin: '0 auto 14px auto',
              }} />
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: 600 }}>Loading activity stream...</p>
            </div>
          ) : !data?.recent_activity || data.recent_activity.length === 0 ? (
            <div style={{ padding: '50px 20px', textAlign: 'center' }}>
              <Activity size={32} color="#cbd5e1" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>No recent activity yet</h4>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>Activity events will appear here in real-time as users interact with the system.</p>
            </div>
          ) : (
            <div>
              {data.recent_activity.map((act) => {
                const badge = getActivityBadge(act.type);
                const isReportReady = act.type === 'report_ready';

                return (
                  <div
                    key={act.id}
                    className="activity-row"
                    onClick={() => handleActivityClick(act)}
                    title={isReportReady ? "Click to open Report Editor" : "View details"}
                    style={{
                      borderLeft: isReportReady ? '4px solid #ff6b00' : '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '10px',
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {getActivityIcon(act.type)}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                            {act.title}
                          </span>
                          <span style={{
                            fontSize: '10.5px', fontWeight: 700,
                            padding: '1px 7px', borderRadius: '5px',
                            background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                          }}>
                            {badge.label}
                          </span>
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                          {act.description}
                        </p>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>
                          {act.company_name} · {act.client_name}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '16px' }}>
                      <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {act.timestamp}
                      </span>
                      {isReportReady ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '5px 10px', borderRadius: '7px',
                          background: '#fff5ed', border: '1px solid #fed7aa',
                          color: '#ff6b00', fontSize: '11.5px', fontWeight: 800,
                          whiteSpace: 'nowrap',
                        }}>
                          Edit Draft &rarr;
                        </span>
                      ) : (
                        <ChevronRight size={15} color="#cbd5e1" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Quick Management Shortcuts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Action 1: Review Queue */}
          <Link href="/admin/review" className="quick-action-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '9px',
                  background: '#fff5ed', color: '#ff6b00',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileCheck2 size={18} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#ff6b00' }}>Review Gatekeeper</span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                Report Review Queue
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Inspect and approve pending monthly financial analysis drafts before client publication.
              </p>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#ea580c' }}>
                {data?.pending_reviews_count || 0} pending reports
              </span>
              <ArrowRight size={14} color="#ff6b00" />
            </div>
          </Link>

          {/* Quick Action 2: Client Manager */}
          <Link href="/admin/clients" className="quick-action-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '9px',
                  background: '#eff6ff', color: '#2563eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Users size={18} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>Directory</span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                Client Account Manager
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Onboard new clients, adjust subscription tiers, pause accounts, and view audit history.
              </p>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>
                {data?.total_active_clients || 0} active clients
              </span>
              <ArrowRight size={14} color="#2563eb" />
            </div>
          </Link>

          {/* Quick Action 3: Document Tracker */}
          <Link href="/admin/documents" className="quick-action-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '9px',
                  background: '#f0fdf4', color: '#059669',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FolderOpen size={18} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>Ingestion</span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                Document Tracker
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Monitor bank statements and invoices from all clients. Check error logs and trigger re-parsing.
              </p>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                {data?.documents_uploaded_this_week || 0} files this week
              </span>
              <ArrowRight size={14} color="#059669" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
