'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Save,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Receipt,
  ChevronRight,
  BellRing,
  BarChart3,
  X,
  AlertCircle,
  DollarSign,
  Calendar,
  Activity,
} from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CY = new Date().getFullYear();
const YEARS = [CY-1, CY, CY+1];

function getBillingHistory(plan: string, price: string, since: string) {
  const recs: {date:string;desc:string;amount:string}[] = [];
  const cursor = new Date(since);
  let i = 0;
  while (cursor <= new Date() && i < 24) {
    recs.push({ date: cursor.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}), desc: plan + ' Subscription', amount: price });
    if (plan.includes('Annual')) cursor.setFullYear(cursor.getFullYear()+1);
    else if (plan.includes('6 Month')) cursor.setMonth(cursor.getMonth()+6);
    else cursor.setMonth(cursor.getMonth()+1);
    i++;
  }
  return recs.reverse();
}

interface ClientDetail {
  id: string;
  name: string;
  email: string;
  company_name: string;
  industry: string;
  fiscal_start_month: string;
  currency: string;
  current_plan: string;
  plan_price: string;
  renewal_date: string;
  account_status: string;
  internal_notes?: string;
  created_at: string;
  documents: any[];
  reports: any[];
  transactions: any[];
}

export default function AdminClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { apiFetch } = useAdminAuth();
  const clientId = params?.clientId as string;

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview'|'documents'|'reports'|'transactions'|'billing'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingBilling, setIsSendingBilling] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [toast, setToast] = useState<{type:'success'|'error';text:string}|null>(null);
  const [showGenModal, setShowGenModal] = useState(false);
  const [genMonth, setGenMonth] = useState(MONTHS[new Date().getMonth()===0?11:new Date().getMonth()-1]);
  const [genYear, setGenYear] = useState(CY);

  // Editable fields
  const [plan, setPlan] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [status, setStatus] = useState('active');
  const [internalNotes, setInternalNotes] = useState('');

  const loadClient = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/admin/clients/${clientId}`);
      if (!res.ok) throw new Error('Client not found');
      const data = (await res.json()) as ClientDetail;
      setClient(data);
      setPlan(data.current_plan);
      setPlanPrice(data.plan_price);
      setStatus(data.account_status || 'active');
      setInternalNotes(data.internal_notes || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) loadClient();
  }, [clientId]);

  const showFeedback = (type: 'success'|'error', text: string) => {
    setToast({type, text}); setTimeout(() => setToast(null), 4500);
  };

  const handleGenerate = async () => {
    setIsGenerating(true); setShowGenModal(false);
    try {
      const res = await apiFetch(`/admin/clients/${clientId}/generate-report`, {
        method: 'POST', body: JSON.stringify({month: genMonth, year: genYear}),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', `Report generated for ${genMonth} ${genYear}. Redirecting...`);
        setTimeout(() => router.push(`/admin/review/${data.report_id||data.id}`), 1500);
        loadClient();
      } else showFeedback('error', data.detail||'Failed to generate report.');
    } catch(e) { showFeedback('error','Network error.'); } finally { setIsGenerating(false); }
  };

  const handleBillingReminder = async () => {
    setIsSendingBilling(true);
    try {
      const res = await apiFetch(`/admin/clients/${clientId}/send-billing-reminder`, {method:'POST'});
      if (res.ok) showFeedback('success','Billing reminder sent to client.'); else showFeedback('error','Failed to send.');
    } catch { showFeedback('error','Network error.'); } finally { setIsSendingBilling(false); }
  };

  const handleCashAlert = async () => {
    setIsSendingAlert(true);
    try {
      const res = await apiFetch(`/admin/clients/${clientId}/send-cash-flow-alert`, {method:'POST'});
      if (res.ok) showFeedback('success','Cash flow alert sent to client.'); else showFeedback('error','Failed to send.');
    } catch { showFeedback('error','Network error.'); } finally { setIsSendingAlert(false); }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveMsg('');
    try {
      const res = await apiFetch(`/admin/clients/${clientId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          current_plan: plan,
          plan_price: planPrice,
          account_status: status,
          internal_notes: internalNotes,
        }),
      });
      if (res.ok) {
        setSaveMsg('Client configuration and notes saved successfully.');
        setTimeout(() => setSaveMsg(''), 4000);
        loadClient();
      }
    } catch (e) {
      alert('Error updating client');
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
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: 500 }}>Loading Client Profile...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ padding: '40px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <h2 style={{ color: '#ef4444', fontSize: '18px', fontWeight: 800 }}>Client not found</h2>
        <Link href="/admin/clients" style={{ color: '#ff6b00', fontSize: '13px', fontWeight: 600 }}>
          &larr; Return to Client Directory
        </Link>
      </div>
    );
  }

  const billing = getBillingHistory(client.current_plan, client.plan_price, client.created_at);

  return (
    <div style={{ padding: '32px', maxWidth: '1300px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <style>{`
        .admin-select{width:100%;margin-top:6px;padding:9px 12px;background:#fff;border:1.5px solid #e2e8f0;border-radius:9px;color:#0f172a;font-size:13px;font-weight:600;outline:none;font-family:'Plus Jakarta Sans',sans-serif;transition:border-color .15s;}
        .admin-select:focus{border-color:#ff6b00;box-shadow:0 0 0 3px rgba(255,107,0,.1);}
        .open-editor-btn{padding:6px 12px;border-radius:7px;background:#fff5ed;border:1px solid #fed7aa;color:#ff6b00;font-size:12px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:4px;transition:all .15s;}
        .open-editor-btn:hover{background:#ff6b00;color:#fff;}
        .abtn{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:9px;border:none;font-size:12.5px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;}
        .abtn:disabled{opacity:.6;cursor:not-allowed;}
        .abtn:hover:not(:disabled){transform:translateY(-1px);}
        .movl{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px);}
        .mcard{background:#fff;border-radius:20px;padding:32px;width:440px;max-width:90vw;box-shadow:0 25px 60px rgba(0,0,0,.2);animation:mIn .2s ease;}
        @keyframes mIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {showGenModal && (
        <div className="movl" onClick={() => setShowGenModal(false)}>
          <div className="mcard" onClick={e => e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px'}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                  <Sparkles size={18} color="#ff6b00"/>
                  <h2 style={{fontSize:'18px',fontWeight:800,color:'#0f172a',margin:0}}>Generate AI Report</h2>
                </div>
                <p style={{fontSize:'12.5px',color:'#64748b',margin:0}}>For <strong>{client.company_name}</strong></p>
              </div>
              <button onClick={() => setShowGenModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'#64748b'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'20px'}}>
              <div>
                <label style={{fontSize:'11px',fontWeight:800,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em'}}>Month</label>
                <select value={genMonth} onChange={e => setGenMonth(e.target.value)} className="admin-select">
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:'11px',fontWeight:800,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em'}}>Year</label>
                <select value={genYear} onChange={e => setGenYear(Number(e.target.value))} className="admin-select">
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div style={{padding:'12px 16px',borderRadius:'10px',background:'#fff7ed',border:'1px solid #fed7aa',marginBottom:'20px',fontSize:'12.5px',color:'#92400e',display:'flex',gap:'8px',alignItems:'flex-start'}}>
              <AlertCircle size={15} style={{flexShrink:0,marginTop:'1px',color:'#d97706'}}/>
              <span>AI will analyze all uploaded transactions for this period and generate a full financial report draft.</span>
            </div>
            <div style={{display:'flex',gap:'12px'}}>
              <button onClick={() => setShowGenModal(false)} style={{flex:1,padding:'11px',borderRadius:'10px',background:'#f1f5f9',border:'none',color:'#475569',fontSize:'13px',fontWeight:700,cursor:'pointer'}}>Cancel</button>
              <button onClick={handleGenerate} style={{flex:2,padding:'11px',borderRadius:'10px',background:'linear-gradient(135deg,#ff6b00,#ff881a)',border:'none',color:'#fff',fontSize:'13px',fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',boxShadow:'0 4px 14px rgba(255,107,0,.3)'}}>
                <Sparkles size={15}/>Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/admin/clients"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              textDecoration: 'none',
              fontSize: '12.5px',
              fontWeight: 600,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}
          >
            <ArrowLeft size={14} color="#ff6b00" />
            <span>Clients</span>
          </Link>

          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              {client.company_name}
            </h1>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Account Lead: <strong style={{ color: '#0f172a' }}>{client.name}</strong> ({client.email}) • Member Since {client.created_at}
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #ff6b00, #ff881a)',
            border: 'none',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255,107,0,0.35)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <Save size={15} />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {saveMsg && (
        <div style={{padding:'12px 18px',borderRadius:'10px',background:'#ecfdf5',border:'1px solid #a7f3d0',color:'#059669',fontSize:'13px',fontWeight:700,marginBottom:'20px',display:'flex',alignItems:'center',gap:'8px'}}>
          <CheckCircle2 size={16}/><span>{saveMsg}</span>
        </div>
      )}
      {toast && (
        <div style={{padding:'12px 18px',borderRadius:'10px',background:toast.type==='success'?'#ecfdf5':'#fef2f2',border:`1px solid ${toast.type==='success'?'#a7f3d0':'#fecaca'}`,color:toast.type==='success'?'#059669':'#dc2626',fontSize:'13px',fontWeight:700,marginBottom:'20px',display:'flex',alignItems:'center',gap:'8px'}}>
          {toast.type==='success'?<CheckCircle2 size={16}/>:<AlertCircle size={16}/>}<span>{toast.text}</span>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div style={{background:'linear-gradient(135deg,#0f172a,#1e293b)',borderRadius:'16px',padding:'20px 24px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap',boxShadow:'0 4px 20px rgba(0,0,0,.1)'}}>
        <div style={{flex:1,minWidth:'160px'}}>
          <div style={{fontSize:'11px',fontWeight:800,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'4px'}}>Quick Actions</div>
          <div style={{fontSize:'13px',fontWeight:700,color:'rgba(255,255,255,.9)'}}>{client.company_name}</div>
        </div>
        <button onClick={() => setShowGenModal(true)} disabled={isGenerating} className="abtn" style={{background:'linear-gradient(135deg,#ff6b00,#ff881a)',color:'#fff',boxShadow:'0 4px 12px rgba(255,107,0,.4)'}}>
          <Sparkles size={14}/>{isGenerating?'Generating...':'Generate Report'}
        </button>
        <button onClick={handleBillingReminder} disabled={isSendingBilling} className="abtn" style={{background:'rgba(255,255,255,.1)',color:'#fff',border:'1px solid rgba(255,255,255,.15)'}}>
          <BellRing size={14}/>{isSendingBilling?'Sending...':'Billing Reminder'}
        </button>
        <button onClick={handleCashAlert} disabled={isSendingAlert} className="abtn" style={{background:'rgba(255,255,255,.1)',color:'#fff',border:'1px solid rgba(255,255,255,.15)'}}>
          <Activity size={14}/>{isSendingAlert?'Sending...':'Cash Flow Alert'}
        </button>
        <button onClick={() => setActiveTab('billing')} className="abtn" style={{background:'rgba(255,255,255,.1)',color:'#fff',border:'1px solid rgba(255,255,255,.15)'}}>
          <DollarSign size={14}/>View Billing
        </button>
      </div>

      {/* Subscription & Account Status Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div>
          <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Subscription Tier
          </label>
          <select
            value={plan}
            onChange={(e) => {
              setPlan(e.target.value);
              if (e.target.value.includes('Annual')) setPlanPrice('$350/yr');
              else if (e.target.value.includes('6 Months')) setPlanPrice('$250/6mo');
              else setPlanPrice('$50/mo');
            }}
            className="admin-select"
          >
            <option value="Monthly Plan">Monthly Plan ($50/mo)</option>
            <option value="6 Months Plan">6 Months Plan ($250/6mo)</option>
            <option value="Annual Plan">Annual Plan ($350/yr)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Account Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="admin-select"
            style={{
              color: status === 'active' ? '#059669' : status === 'paused' ? '#d97706' : '#dc2626',
            }}
          >
            <option value="active">Active (Full Access)</option>
            <option value="paused">Paused (Access Suspended)</option>
            <option value="cancelled">Cancelled (Closed)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Reporting Currency & Fiscal
          </label>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '12px' }}>
            {client.currency} • Year Starts {client.fiscal_start_month}
          </div>
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Renewal Date
          </label>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#ff6b00', marginTop: '12px' }}>
            {client.renewal_date}
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div style={{display:'flex',gap:'4px',borderBottom:'1.5px solid #e2e8f0',marginBottom:'20px',overflowX:'auto'}}>
        {[
          { id: 'overview', label: 'Notes & Overview' },
          { id: 'documents', label: `Documents (${client.documents?.length || 0})` },
          { id: 'reports', label: `Reports (${client.reports?.length || 0})` },
          { id: 'transactions', label: `Transactions (${client.transactions?.length || 0})` },
          { id: 'billing', label: 'Billing History' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{padding:'12px 18px',border:'none',background:'transparent',borderBottom:isSelected?'2.5px solid #ff6b00':'2.5px solid transparent',color:isSelected?'#ff6b00':'#64748b',fontSize:'13.5px',fontWeight:isSelected?800:600,cursor:'pointer',fontFamily:"'Plus Jakarta Sans', sans-serif",whiteSpace:'nowrap',transition:'all 0.15s ease'}}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Notes & Overview */}
      {activeTab === 'overview' && (
        <div style={{display:'grid',gap:'20px'}}>
          <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',padding:'24px',boxShadow:'0 4px 20px rgba(0,0,0,.03)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}>
              <MessageSquare size={16} color="#ff6b00"/>
              <h3 style={{fontSize:'15px',fontWeight:800,color:'#0f172a',margin:0}}>Internal Team Notes</h3>
              <span style={{fontSize:'10px',fontWeight:800,textTransform:'uppercase',padding:'3px 8px',borderRadius:'6px',background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',letterSpacing:'0.06em'}}>Never visible to client</span>
            </div>
            <p style={{fontSize:'12.5px',color:'#64748b',margin:'0 0 14px 0'}}>Use this space for account observations, advisory contact history, or billing notes.</p>
            <textarea rows={6} value={internalNotes} onChange={e => setInternalNotes(e.target.value)} placeholder="e.g. Client requested customized Q3 EBITDA add-backs..." style={{width:'100%',padding:'14px',borderRadius:'10px',background:'#f8fafc',border:'1.5px solid #e2e8f0',color:'#0f172a',fontSize:'13px',lineHeight:'1.6',outline:'none',resize:'vertical',boxSizing:'border-box',fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'16px'}}>
            {[
              {icon:<FileText size={18} color="#ff6b00"/>,label:'Documents Uploaded',value:client.documents?.length||0,bg:'#fff7ed',border:'#fed7aa'},
              {icon:<BarChart3 size={18} color="#7c3aed"/>,label:'Reports Generated',value:client.reports?.length||0,bg:'#f5f3ff',border:'#ddd6fe'},
              {icon:<Receipt size={18} color="#059669"/>,label:'Transactions',value:client.transactions?.length||0,bg:'#ecfdf5',border:'#a7f3d0'},
              {icon:<TrendingUp size={18} color="#0284c7"/>,label:'Approved Reports',value:client.reports?.filter((r:any)=>r.status==='APPROVED').length||0,bg:'#eff6ff',border:'#bfdbfe'},
            ].map((s,i) => (
              <div key={i} style={{background:s.bg,borderRadius:'14px',border:`1px solid ${s.border}`,padding:'20px'}}>
                <div style={{marginBottom:'10px'}}>{s.icon}</div>
                <div style={{fontSize:'26px',fontWeight:800,color:'#0f172a',lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:'12px',color:'#64748b',fontWeight:600,marginTop:'4px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Uploaded Documents */}
      {activeTab === 'documents' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '14px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>File Name</th>
                <th style={{ padding: '14px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</th>
                <th style={{ padding: '14px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</th>
                <th style={{ padding: '14px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Size</th>
                <th style={{ padding: '14px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {client.documents?.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No documents uploaded yet.
                  </td>
                </tr>
              ) : (
                client.documents?.map((doc: any) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
                      {doc.filename}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '12.5px' }}>
                      {doc.type}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '12.5px' }}>
                      {doc.date}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '12px' }}>
                      {doc.size}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          padding: '4px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#059669',
                        }}
                      >
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Reports History */}
      {activeTab === 'reports' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '14px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Period</th>
                <th style={{ padding: '14px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Revenue</th>
                <th style={{ padding: '14px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Net Profit</th>
                <th style={{ padding: '14px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Review</th>
              </tr>
            </thead>
            <tbody>
              {client.reports?.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No reports generated yet.
                  </td>
                </tr>
              ) : (
                client.reports?.map((rep: any) => (
                  <tr key={rep.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
                      {rep.month} {rep.year}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#ff6b00', fontSize: '13px', fontWeight: 800 }}>
                      {rep.revenue}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#10b981', fontSize: '13px', fontWeight: 800 }}>
                      {rep.net_profit}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          padding: '4px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: rep.status === 'APPROVED' ? '#ecfdf5' : '#fffbeb',
                          border: rep.status === 'APPROVED' ? '1px solid #a7f3d0' : '1px solid #fde68a',
                          color: rep.status === 'APPROVED' ? '#059669' : '#d97706',
                        }}
                      >
                        {rep.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <Link
                        href={`/admin/review/${rep.id}`}
                        className="open-editor-btn"
                      >
                        <span>Open Editor</span>
                        <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Transactions */}
      {activeTab === 'transactions' && (
        <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.03)'}}>
          <table style={{width:'100%',borderCollapse:'collapse',textAlign:'left'}}>
            <thead><tr style={{borderBottom:'1px solid #e2e8f0',background:'#f8fafc'}}>
              {['Date','Description','Category'].map(h => <th key={h} style={{padding:'14px 20px',fontSize:'11.5px',fontWeight:800,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</th>)}
              <th style={{padding:'14px 20px',fontSize:'11.5px',fontWeight:800,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',textAlign:'right'}}>Amount</th>
            </tr></thead>
            <tbody>
              {!client.transactions?.length
                ? <tr><td colSpan={4} style={{padding:'40px',textAlign:'center',color:'#94a3b8',fontSize:'13px'}}>No transactions found.</td></tr>
                : client.transactions.map((t:any) => (
                  <tr key={t.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                    <td style={{padding:'14px 20px',color:'#64748b',fontSize:'12.5px'}}>{t.date}</td>
                    <td style={{padding:'14px 20px',color:'#0f172a',fontSize:'13.5px',fontWeight:700}}>{t.description}</td>
                    <td style={{padding:'14px 20px',color:'#64748b',fontSize:'12.5px'}}>{t.category}</td>
                    <td style={{padding:'14px 20px',textAlign:'right',fontWeight:800,color:t.type==='income'?'#059669':'#dc2626'}}>
                      {t.type==='income'?'+':'-'}${Math.abs(t.amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Billing History */}
      {activeTab === 'billing' && (
        <div>
          <div style={{background:'linear-gradient(135deg,#0f172a,#1e293b)',borderRadius:'16px',padding:'24px',marginBottom:'20px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'20px',color:'#fff'}}>
            {[
              {l:'Current Plan',v:client.current_plan,c:'#ff6b00'},
              {l:'Price',v:client.plan_price,c:'#fff'},
              {l:'Next Renewal',v:client.renewal_date,c:'#10b981'},
              {l:'Total Payments',v:String(billing.length),c:'#fff'},
            ].map((s,i) => (
              <div key={i}>
                <div style={{fontSize:'11px',fontWeight:800,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'6px'}}>{s.l}</div>
                <div style={{fontSize:'18px',fontWeight:800,color:s.c}}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.03)'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:'8px'}}>
              <DollarSign size={16} color="#ff6b00"/>
              <h3 style={{margin:0,fontSize:'14px',fontWeight:800,color:'#0f172a'}}>Payment History</h3>
              <span style={{marginLeft:'auto',fontSize:'12px',color:'#64748b',fontWeight:600}}>{billing.length} records</span>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',textAlign:'left'}}>
              <thead><tr style={{borderBottom:'1px solid #e2e8f0',background:'#f8fafc'}}>
                {['Date','Description'].map(h => <th key={h} style={{padding:'12px 20px',fontSize:'11.5px',fontWeight:800,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</th>)}
                <th style={{padding:'12px 20px',fontSize:'11.5px',fontWeight:800,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',textAlign:'right'}}>Amount</th>
                <th style={{padding:'12px 20px',fontSize:'11.5px',fontWeight:800,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',textAlign:'center'}}>Status</th>
              </tr></thead>
              <tbody>
                {!billing.length
                  ? <tr><td colSpan={4} style={{padding:'40px',textAlign:'center',color:'#94a3b8'}}>No payment records.</td></tr>
                  : billing.map((b,i) => (
                    <tr key={i} style={{borderBottom:'1px solid #f1f5f9'}}>
                      <td style={{padding:'13px 20px',color:'#64748b',fontSize:'12.5px',display:'flex',alignItems:'center',gap:'8px'}}><Calendar size={13} color="#94a3b8"/>{b.date}</td>
                      <td style={{padding:'13px 20px',fontWeight:700,color:'#0f172a',fontSize:'13px'}}>{b.desc}</td>
                      <td style={{padding:'13px 20px',fontWeight:800,color:'#ff6b00',fontSize:'13px',textAlign:'right'}}>{b.amount}</td>
                      <td style={{padding:'13px 20px',textAlign:'center'}}>
                        <span style={{padding:'3px 10px',borderRadius:'6px',fontSize:'11px',fontWeight:700,background:'#ecfdf5',border:'1px solid #a7f3d0',color:'#059669'}}>Paid</span>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
