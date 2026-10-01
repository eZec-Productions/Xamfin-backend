'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Lock,
  Edit3,
  CheckCircle2,
  ArrowLeft,
  Save,
  PauseCircle,
  Trash2,
  Sparkles,
  MessageSquare,
  Plus,
  AlertTriangle,
  XCircle,
  FileCheck2,
  TrendingUp,
  Receipt,
  DollarSign,
  HelpCircle,
  Calendar,
} from 'lucide-react';

interface ReportDetailData {
  id: string;
  user_id: string;
  client_name: string;
  company_name: string;
  month: string;
  year: string;
  date_generated: string;
  status: 'PENDING' | 'IN_REVIEW' | 'HELD' | 'APPROVED' | 'REJECTED';
  is_approved: boolean;
  approved_by: string;
  reviewer_notes?: string;
  ai_draft: {
    summary_metrics: any;
    pl_statement: any;
    cash_flow: any;
    growth_analysis: string;
    action_plan: any[];
  };
  summary_metrics: any;
  pl_statement: any;
  cash_flow: any;
  growth_analysis: string;
  action_plan: any[];
}

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  PENDING: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Pending Review' },
  IN_REVIEW: { color: '#ff6b00', bg: '#fff5ed', border: '#fed7aa', label: 'In Review' },
  HELD: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'On Hold' },
  APPROVED: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', label: 'Approved & Published' },
  REJECTED: { color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', label: 'Rejected' },
};

export default function AdminReportEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { apiFetch } = useAdminAuth();
  const reportId = params?.reportId as string;

  const [report, setReport] = useState<ReportDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Editable Summary Numbers
  const [revenue, setRevenue] = useState('');
  const [expenses, setExpenses] = useState('');
  const [netProfit, setNetProfit] = useState('');
  const [cashFlow, setCashFlow] = useState('');
  const [healthScore, setHealthScore] = useState<number>(85);

  // Editable P&L Rows
  const [revenueStreams, setRevenueStreams] = useState<Array<{ name: string; amount: number }>>([]);
  const [operatingExpenses, setOperatingExpenses] = useState<Array<{ name: string; amount: number }>>([]);

  // Editable Cash Flow Figures
  const [moneyIn, setMoneyIn] = useState<string>('0');
  const [moneyOut, setMoneyOut] = useState<string>('0');
  const [netChange, setNetChange] = useState<string>('0');
  const [endingCash, setEndingCash] = useState<string>('0');

  // Editable Analysis & Action Items
  const [growthAnalysis, setGrowthAnalysis] = useState('');
  const [actionPlan, setActionPlan] = useState<any[]>([]);
  const [reviewerNotes, setReviewerNotes] = useState('');

  // Hold Modal
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [holdReason, setHoldReason] = useState('');

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/admin/reports/${reportId}`);
      if (!res.ok) throw new Error('Not found');
      const data = (await res.json()) as ReportDetailData;
      setReport(data);

      const sm = data.summary_metrics || {};
      setRevenue(sm.revenue?.value || sm.revenue || '$0');
      setExpenses(sm.expenses?.value || sm.expenses || '$0');
      setNetProfit(sm.net_profit?.value || sm.net_profit || '$0');
      setCashFlow(sm.cash_flow?.value || sm.cash_flow || '$0');
      setHealthScore(sm.health_score || 88);

      // P&L
      const pl = data.pl_statement || {};
      setRevenueStreams(pl.revenue_streams || [{ name: 'Sales Revenue', amount: 0 }]);
      setOperatingExpenses(pl.operating_expenses || pl.expense_categories || [{ name: 'Operating Expenses', amount: 0 }]);

      // Cash Flow
      const cf = data.cash_flow || {};
      setMoneyIn(String(cf.moneyIn ?? '0'));
      setMoneyOut(String(cf.moneyOut ?? '0'));
      setNetChange(String(cf.netChange ?? '0'));
      setEndingCash(String(cf.endingCash ?? cf.endingCashBalance ?? '0'));

      setGrowthAnalysis(data.growth_analysis || '');
      setActionPlan(data.action_plan || []);
      setReviewerNotes(data.reviewer_notes || '');
    } catch {
      /* silent */
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) loadReport();
  }, [reportId]);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setSaveMsg({ text, type });
    setTimeout(() => setSaveMsg(null), 4500);
  };

  // Direct Approve
  const handleDirectApprove = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch(`/admin/reports/${reportId}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error();
      showMsg('Report APPROVED! It is now published and visible to the client.');
      loadReport();
    } catch {
      showMsg('Failed to approve report.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Edits & Optionally Approve
  const handleSaveDraft = async (andApprove = false) => {
    setIsSaving(true);
    try {
      const updatedSummary = {
        ...(report?.summary_metrics || {}),
        revenue: { value: revenue, change: 'Verified by Advisor' },
        expenses: { value: expenses, change: 'Verified by Advisor' },
        net_profit: { value: netProfit, change: 'Verified by Advisor' },
        cash_flow: { value: cashFlow, change: 'Verified by Advisor' },
        health_score: healthScore,
      };

      const updatedPL = {
        ...(report?.pl_statement || {}),
        revenue_streams: revenueStreams,
        totalRevenue: revenueStreams.reduce((s, r) => s + (parseFloat(String(r.amount)) || 0), 0),
        operating_expenses: operatingExpenses,
        expense_categories: operatingExpenses,
        totalExpenses: operatingExpenses.reduce((s, r) => s + (parseFloat(String(r.amount)) || 0), 0),
        netIncome: (revenueStreams.reduce((s, r) => s + (parseFloat(String(r.amount)) || 0), 0)) -
                   (operatingExpenses.reduce((s, r) => s + (parseFloat(String(r.amount)) || 0), 0)),
      };

      const updatedCF = {
        ...(report?.cash_flow || {}),
        moneyIn: parseFloat(moneyIn) || 0,
        moneyOut: parseFloat(moneyOut) || 0,
        netChange: parseFloat(netChange) || 0,
        endingCash: parseFloat(endingCash) || 0,
        endingCashBalance: parseFloat(endingCash) || 0,
      };

      const res = await apiFetch(`/admin/reports/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify({
          summary_metrics: updatedSummary,
          pl_statement: updatedPL,
          cash_flow: updatedCF,
          growth_analysis: growthAnalysis,
          action_plan: actionPlan,
          reviewer_notes: reviewerNotes,
        }),
      });

      if (!res.ok) throw new Error();

      if (andApprove) {
        const appRes = await apiFetch(`/admin/reports/${reportId}/approve`, { method: 'POST' });
        if (!appRes.ok) throw new Error();
        showMsg('Edits saved and report APPROVED. Published to client dashboard.');
      } else {
        showMsg('Edits saved successfully. Report remains in review queue.');
      }
      loadReport();
    } catch {
      showMsg('Failed to save changes. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleHold = async () => {
    if (!holdReason.trim()) return;
    setIsSaving(true);
    try {
      const res = await apiFetch(`/admin/reports/${reportId}/hold`, {
        method: 'POST',
        body: JSON.stringify({ reviewer_notes: holdReason.trim() }),
      });
      if (res.ok) {
        setIsHoldModalOpen(false);
        setHoldReason('');
        showMsg('Report status updated to On Hold.');
        loadReport();
      }
    } catch {
      showMsg('Failed to place report on hold.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to REJECT this report? It will remain permanently hidden from the client.')) return;
    setIsSaving(true);
    try {
      const res = await apiFetch(`/admin/reports/${reportId}/reject`, { method: 'POST' });
      if (res.ok) {
        showMsg('Report has been REJECTED. Client will never see this report.');
        loadReport();
      }
    } catch {
      showMsg('Failed to reject report.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: '36px', height: '36px',
          border: '2px solid rgba(255,107,0,0.2)', borderTopColor: '#ff6b00',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px auto',
        }} />
        <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, fontWeight: 600 }}>Loading Split-Screen Report Editor...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ padding: '40px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <p style={{ color: '#ef4444', fontWeight: 700 }}>Report not found.</p>
        <Link href="/admin/review" style={{ color: '#ff6b00', fontSize: '13px', fontWeight: 600 }}>&larr; Return to Review Queue</Link>
      </div>
    );
  }

  const aiDraft = report.ai_draft || {
    summary_metrics: report.summary_metrics,
    pl_statement: report.pl_statement,
    cash_flow: report.cash_flow,
    growth_analysis: report.growth_analysis,
    action_plan: report.action_plan,
  };
  const aiSM = aiDraft.summary_metrics || {};
  const aiPL = aiDraft.pl_statement || {};
  const aiCF = aiDraft.cash_flow || {};
  const statusStyle = STATUS_STYLES[report.status] || STATUS_STYLES.PENDING;

  return (
    <div style={{ padding: '24px 28px 100px 28px', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", maxWidth: '1600px', margin: '0 auto' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .editor-input {
          width: 100%; padding: 8px 12px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px; color: #0f172a;
          font-size: 13.5px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; transition: all 0.15s ease;
          box-sizing: border-box;
        }
        .editor-input:focus {
          border-color: #ff6b00;
          box-shadow: 0 0 0 3px rgba(255,107,0,0.1);
        }
        .editor-textarea {
          width: 100%; padding: 12px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px; color: #0f172a;
          font-size: 13px; line-height: 1.6;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; resize: vertical;
          box-sizing: border-box; transition: all 0.15s ease;
        }
        .editor-textarea:focus { border-color: #ff6b00; box-shadow: 0 0 0 3px rgba(255,107,0,0.1); }
        .action-bar-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 18px; border-radius: 9px;
          font-size: 13px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.15s ease;
          border: 1px solid transparent;
          white-space: nowrap;
        }
        .action-bar-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .action-bar-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .scrollable-column {
          max-height: calc(100vh - 230px);
          overflow-y: auto;
          padding-right: 10px;
        }
        .scrollable-column::-webkit-scrollbar { width: 6px; }
        .scrollable-column::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.6);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 500;
          animation: slideIn 0.15s ease;
        }
        .modal-card {
          background: #ffffff; border-radius: 18px;
          border: 1px solid #e2e8f0;
          padding: 28px; width: 100%; max-width: 480px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.18);
        }
      `}</style>

      {/* ─── Top Header: Breadcrumb & Report Identity ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin/review" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px', borderRadius: '8px',
            background: '#ffffff', border: '1px solid #e2e8f0',
            color: '#0f172a', textDecoration: 'none',
            fontSize: '12.5px', fontWeight: 700,
          }}>
            <ArrowLeft size={13} color="#ff6b00" /> Back to Queue
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {report.company_name}
              </h1>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>·</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#475569' }}>
                {report.month} {report.year}
              </span>
              <span style={{
                fontSize: '11px', fontWeight: 700,
                padding: '3px 9px', borderRadius: '6px',
                background: statusStyle.bg, color: statusStyle.color,
                border: `1px solid ${statusStyle.border}`,
              }}>
                {statusStyle.label}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Client: <strong style={{ color: '#0f172a' }}>{report.client_name}</strong> · Generated: {report.date_generated} · Gatekeeper Rule: <strong style={{ color: '#ea580c' }}>Hidden from client until Approved</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {saveMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 18px', borderRadius: '10px', marginBottom: '18px',
          background: saveMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${saveMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: saveMsg.type === 'success' ? '#059669' : '#dc2626',
          fontSize: '13px', fontWeight: 700,
          animation: 'slideIn 0.2s ease',
        }}>
          <CheckCircle2 size={16} /> {saveMsg.text}
        </div>
      )}

      {/* ─── SPLIT-SCREEN: LEFT (AI READ-ONLY) VS RIGHT (EDITABLE VERSION) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px', alignItems: 'start' }}>

        {/* ═══════════════════════════════════════════════ */}
        {/*  LEFT COLUMN: AI GENERATED DRAFT (READ-ONLY)    */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="scrollable-column" style={{
          background: '#f8fafc',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          padding: '22px',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingBottom: '14px', borderBottom: '1px solid #e2e8f0', marginBottom: '18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: '#ffffff', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Lock size={14} color="#64748b" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                  AI Generated Baseline
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Immutable draft extracted from transaction receipts
                </div>
              </div>
            </div>
            <span style={{
              fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '5px',
              background: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Read Only
            </span>
          </div>

          {/* 1. AI Summary Numbers */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              1. AI Summary Numbers
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {[
                { label: 'Revenue', value: aiSM.revenue?.value || aiSM.revenue || '$0', color: '#ff6b00' },
                { label: 'Expenses', value: aiSM.expenses?.value || aiSM.expenses || '$0', color: '#ef4444' },
                { label: 'Net Profit', value: aiSM.net_profit?.value || aiSM.net_profit || '$0', color: '#10b981' },
                { label: 'Health Score', value: `${aiSM.health_score || 85}/100`, color: '#f59e0b' },
              ].map((m) => (
                <div key={m.label} style={{ padding: '12px', borderRadius: '10px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{m.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: m.color, marginTop: '2px' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. AI P&L Rows */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              2. AI Profit &amp; Loss Rows
            </div>
            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff6b00', marginBottom: '6px' }}>Revenue Categories</div>
              {(aiPL.revenue_streams || []).map((r: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px dashed #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>{r.name}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>${Number(r.amount).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', marginTop: '10px', marginBottom: '6px' }}>Operating Expenses</div>
              {(aiPL.operating_expenses || aiPL.expense_categories || []).map((e: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px dashed #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>{e.name}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>${Number(e.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. AI Cash Flow Figures */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              3. AI Cash Flow Figures
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '12px' }}>
              <div><span style={{ fontSize: '11px', color: '#64748b' }}>Money In:</span> <strong style={{ color: '#10b981' }}>${Number(aiCF.moneyIn || 0).toLocaleString()}</strong></div>
              <div><span style={{ fontSize: '11px', color: '#64748b' }}>Money Out:</span> <strong style={{ color: '#ef4444' }}>${Number(aiCF.moneyOut || 0).toLocaleString()}</strong></div>
              <div><span style={{ fontSize: '11px', color: '#64748b' }}>Net Change:</span> <strong style={{ color: '#0f172a' }}>${Number(aiCF.netChange || 0).toLocaleString()}</strong></div>
              <div><span style={{ fontSize: '11px', color: '#64748b' }}>Ending Balance:</span> <strong style={{ color: '#ff6b00' }}>${Number(aiCF.endingCash || aiCF.endingCashBalance || 0).toLocaleString()}</strong></div>
            </div>
          </div>

          {/* 4. AI Growth Narrative */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              4. AI Growth Narrative
            </div>
            <div style={{ padding: '14px', borderRadius: '10px', background: '#ffffff', border: '1px solid #e2e8f0', fontSize: '12.5px', color: '#475569', lineHeight: 1.6 }}>
              {aiDraft.growth_analysis || 'No initial narrative.'}
            </div>
          </div>

          {/* 5. AI Action Items */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              5. AI Recommendations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(aiDraft.action_plan || []).map((act: any, i: number) => (
                <div key={i} style={{ padding: '12px', borderRadius: '9px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>{act.title}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#ff6b00', background: '#fff5ed', padding: '2px 6px', borderRadius: '4px' }}>{act.impact}</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>{act.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/*  RIGHT COLUMN: EDITABLE VERSION (CLIENT-FACING) */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="scrollable-column" style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #fed7aa',
          padding: '22px',
          boxShadow: '0 4px 20px rgba(255,107,0,0.04)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingBottom: '14px', borderBottom: '1px solid #fed7aa', marginBottom: '18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: '#fff5ed', border: '1px solid #fed7aa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Edit3 size={14} color="#ff6b00" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                  Official Final Version (Editable)
                </div>
                <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 600 }}>
                  This version is published directly to the client
                </div>
              </div>
            </div>
            <span style={{
              fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '5px',
              background: '#fff5ed', color: '#ea580c', border: '1px solid #fed7aa',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Advisor Editable
            </span>
          </div>

          {/* 1. Summary Numbers */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              1. Editable Summary Numbers
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Revenue</label>
                <input type="text" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="editor-input" style={{ color: '#ff6b00', marginTop: '3px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Expenses</label>
                <input type="text" value={expenses} onChange={(e) => setExpenses(e.target.value)} className="editor-input" style={{ color: '#ef4444', marginTop: '3px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Net Profit</label>
                <input type="text" value={netProfit} onChange={(e) => setNetProfit(e.target.value)} className="editor-input" style={{ color: '#10b981', marginTop: '3px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Health Score (0-100)</label>
                <input type="number" min="0" max="100" value={healthScore} onChange={(e) => setHealthScore(parseInt(e.target.value) || 0)} className="editor-input" style={{ color: '#f59e0b', marginTop: '3px' }} />
              </div>
            </div>
          </div>

          {/* 2. P&L Rows */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                2. Editable P&amp;L Rows
              </span>
              <button
                type="button"
                onClick={() => setRevenueStreams([...revenueStreams, { name: 'New Stream', amount: 0 }])}
                style={{ fontSize: '11px', fontWeight: 700, color: '#ff6b00', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                + Add Stream
              </button>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '12px', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff6b00', marginBottom: '6px' }}>Revenue Streams</div>
              {revenueStreams.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <input
                    type="text"
                    value={r.name}
                    onChange={(e) => {
                      const updated = [...revenueStreams];
                      updated[i].name = e.target.value;
                      setRevenueStreams(updated);
                    }}
                    className="editor-input"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    value={r.amount}
                    onChange={(e) => {
                      const updated = [...revenueStreams];
                      updated[i].amount = parseFloat(e.target.value) || 0;
                      setRevenueStreams(updated);
                    }}
                    className="editor-input"
                    style={{ width: '110px' }}
                  />
                  <button type="button" onClick={() => setRevenueStreams(revenueStreams.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444' }}>Operating Expenses</span>
                <button
                  type="button"
                  onClick={() => setOperatingExpenses([...operatingExpenses, { name: 'Expense Category', amount: 0 }])}
                  style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  + Add Expense
                </button>
              </div>
              {operatingExpenses.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <input
                    type="text"
                    value={e.name}
                    onChange={(ev) => {
                      const updated = [...operatingExpenses];
                      updated[i].name = ev.target.value;
                      setOperatingExpenses(updated);
                    }}
                    className="editor-input"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    value={e.amount}
                    onChange={(ev) => {
                      const updated = [...operatingExpenses];
                      updated[i].amount = parseFloat(ev.target.value) || 0;
                      setOperatingExpenses(updated);
                    }}
                    className="editor-input"
                    style={{ width: '110px' }}
                  />
                  <button type="button" onClick={() => setOperatingExpenses(operatingExpenses.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Cash Flow Figures */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              3. Editable Cash Flow Figures
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Money In ($)</label>
                <input type="number" value={moneyIn} onChange={(e) => setMoneyIn(e.target.value)} className="editor-input" style={{ color: '#10b981', marginTop: '3px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Money Out ($)</label>
                <input type="number" value={moneyOut} onChange={(e) => setMoneyOut(e.target.value)} className="editor-input" style={{ color: '#ef4444', marginTop: '3px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Net Change ($)</label>
                <input type="number" value={netChange} onChange={(e) => setNetChange(e.target.value)} className="editor-input" style={{ marginTop: '3px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Ending Balance ($)</label>
                <input type="number" value={endingCash} onChange={(e) => setEndingCash(e.target.value)} className="editor-input" style={{ color: '#ff6b00', marginTop: '3px' }} />
              </div>
            </div>
          </div>

          {/* 4. Analysis Text & Growth Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              4. Official Growth Narrative (Executive Summary)
            </div>
            <textarea
              rows={5}
              value={growthAnalysis}
              onChange={(e) => setGrowthAnalysis(e.target.value)}
              className="editor-textarea"
              placeholder="Write the official verified analysis for the client..."
            />
          </div>

          {/* 5. Action Items */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                5. Strategic Action Items
              </span>
              <button
                type="button"
                onClick={() => setActionPlan([...actionPlan, { id: `act_${Date.now()}`, title: 'Advisor Recommendation', description: 'Actionable steps for business growth.', impact: 'High Impact', status: 'pending' }])}
                style={{ fontSize: '11px', fontWeight: 700, color: '#ff6b00', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                + Add Item
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {actionPlan.map((act, i) => (
                <div key={i} style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                    <input
                      type="text"
                      value={act.title}
                      onChange={(e) => {
                        const copy = [...actionPlan];
                        copy[i].title = e.target.value;
                        setActionPlan(copy);
                      }}
                      className="editor-input"
                      placeholder="Title"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      value={act.impact}
                      onChange={(e) => {
                        const copy = [...actionPlan];
                        copy[i].impact = e.target.value;
                        setActionPlan(copy);
                      }}
                      className="editor-input"
                      placeholder="Impact"
                      style={{ width: '120px', color: '#ff6b00' }}
                    />
                    <button type="button" onClick={() => setActionPlan(actionPlan.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={act.description}
                    onChange={(e) => {
                      const copy = [...actionPlan];
                      copy[i].description = e.target.value;
                      setActionPlan(copy);
                    }}
                    className="editor-textarea"
                    placeholder="Description"
                    style={{ fontSize: '12px' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 6. Internal Reviewer Notes (Private) */}
          <div style={{
            padding: '16px', borderRadius: '12px',
            background: '#fffbeb', border: '1.5px solid #fde68a',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MessageSquare size={14} color="#d97706" />
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#b45309' }}>
                Internal Reviewer Notes
              </span>
              <span style={{
                fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase',
                padding: '2px 6px', borderRadius: '4px',
                background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
              }}>
                Confidential — Never visible to client
              </span>
            </div>
            <textarea
              rows={3}
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="Record variance notes, team audit comments, or justification for adjustments..."
              className="editor-textarea"
              style={{ background: '#ffffff', borderColor: '#fde68a' }}
            />
          </div>
        </div>
      </div>

      {/* ─── FIXED ACTION BAR AT BOTTOM ─── */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '260px',
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid #e2e8f0',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
        zIndex: 100,
      }}>
        {/* Left: Status info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: report.is_approved ? '#10b981' : '#ff6b00',
          }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
            Current Status: {statusStyle.label}
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            {report.is_approved ? '(Live on client dashboard)' : '(Not published to client)'}
          </span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Action: Save Draft */}
          <button
            type="button"
            onClick={() => handleSaveDraft(false)}
            disabled={isSaving}
            className="action-bar-btn"
            style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569' }}
          >
            <Save size={14} />
            <span>Save Draft</span>
          </button>

          {/* Action: Hold (Note Required) */}
          <button
            type="button"
            onClick={() => setIsHoldModalOpen(true)}
            disabled={isSaving}
            className="action-bar-btn"
            style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706' }}
          >
            <PauseCircle size={14} />
            <span>Hold (Note Required)</span>
          </button>

          {/* Action: Reject */}
          <button
            type="button"
            onClick={handleReject}
            disabled={isSaving}
            className="action-bar-btn"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
          >
            <XCircle size={14} />
            <span>Reject</span>
          </button>

          {/* Action: Direct Approve (if no edits needed) */}
          <button
            type="button"
            onClick={handleDirectApprove}
            disabled={isSaving || report.is_approved}
            className="action-bar-btn"
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#059669',
            }}
          >
            <CheckCircle2 size={14} />
            <span>Approve Baseline</span>
          </button>

          {/* Action: Edit + Approve (Highest Priority) */}
          <button
            type="button"
            onClick={() => handleSaveDraft(true)}
            disabled={isSaving}
            className="action-bar-btn"
            style={{
              background: 'linear-gradient(135deg, #ff6b00 0%, #ff881a 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(255,107,0,0.3)',
              padding: '10px 22px',
            }}
          >
            {isSaving ? (
              <div style={{
                width: '14px', height: '14px',
                border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />
            ) : <Sparkles size={14} />}
            <span>Edit &amp; Approve</span>
          </button>
        </div>
      </div>

      {/* ─── HOLD MODAL (NOTE REQUIRED) ─── */}
      {isHoldModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: '#fffbeb', border: '1px solid #fde68a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertTriangle size={18} color="#d97706" />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Place Report On Hold</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Internal team reason is strictly required</p>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '14px' }}>
              Explain why this report is on hold (e.g. discrepancy in AWS expenses, awaiting bank feed reconciliation). It will be filed in the Review Queue under the <strong>Held</strong> tab and remain hidden from the client.
            </p>

            <textarea
              rows={4}
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              placeholder="e.g. Q3 transaction totals don't match bank statement ending balance; requested additional PDF..."
              className="editor-textarea"
              style={{ marginBottom: '18px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { setIsHoldModalOpen(false); setHoldReason(''); }}
                className="action-bar-btn"
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#64748b' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleHold}
                disabled={!holdReason.trim() || isSaving}
                className="action-bar-btn"
                style={{
                  background: '#f59e0b', color: '#ffffff',
                  opacity: !holdReason.trim() ? 0.5 : 1,
                }}
              >
                <PauseCircle size={14} /> Confirm Hold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
