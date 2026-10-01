'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  FileText, RefreshCw, Search, CheckCircle2, Clock,
  AlertTriangle, FolderOpen, BarChart3, ChevronDown,
} from 'lucide-react';

interface AdminDocItem {
  id: string;
  user_id: string;
  client_name: string;
  company_name: string;
  filename: string;
  type: string;
  size: string;
  date: string;
  status: string;
  extracted_transactions_count: number;
  error_message?: string;
}

export default function AdminDocumentsPage() {
  const { apiFetch } = useAdminAuth();
  const [documents, setDocuments] = useState<AdminDocItem[]>([]);
  const [docTypeFilter, setDocTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (docTypeFilter !== 'all') params.append('doc_type', docTypeFilter);
      if (statusFilter !== 'all') params.append('status_filter', statusFilter);
      const res = await apiFetch(`/admin/documents?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setDocuments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadDocuments(); }, [docTypeFilter, statusFilter]);

  const handleReprocess = async (docId: string, filename: string) => {
    setReprocessingId(docId);
    try {
      const res = await apiFetch(`/admin/documents/${docId}/reprocess`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setToastMsg(`'${filename}' re-processed — extracted ${data.extracted_count ?? ''} transactions.`);
        setTimeout(() => setToastMsg(''), 4500);
        loadDocuments();
      } else {
        alert(data.detail || 'Re-process failed');
      }
    } catch { alert('Error re-processing document'); } finally { setReprocessingId(null); }
  };

  const filteredDocs = documents.filter((d) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.filename.toLowerCase().includes(term) ||
      d.company_name.toLowerCase().includes(term) ||
      d.client_name.toLowerCase().includes(term) ||
      d.type.toLowerCase().includes(term)
    );
  });

  const getDocStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'processed') return { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
    if (s === 'error' || s === 'failed') return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
    return { color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  };

  const getDocTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('bank')) return '🏦';
    if (t.includes('invoice')) return '📄';
    if (t.includes('receipt')) return '🧾';
    return '📁';
  };

  const completedCount = documents.filter(d => ['completed','processed'].includes(d.status.toLowerCase())).length;
  const errorCount = documents.filter(d => ['error','failed'].includes(d.status.toLowerCase())).length;
  const totalTxns = documents.reduce((s, d) => s + (d.extracted_transactions_count || 0), 0);

  return (
    <div style={{ padding: '30px 32px', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .doc-row { transition: background 0.15s ease; }
        .doc-row:hover { background: #f8fafc; }
        .filter-select {
          padding: 9px 34px 9px 14px; border-radius: 10px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          color: #0f172a; font-size: 13px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif; outline: none;
          cursor: pointer; appearance: none;
          transition: all 0.15s ease;
        }
        .filter-select:focus { border-color: #ff6b00; box-shadow: 0 0 0 3px rgba(255,107,0,0.1); }
        .search-input {
          width: 100%; padding: 10px 16px 10px 40px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px; color: #0f172a; font-size: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: all 0.2s ease;
        }
        .search-input:focus { border-color: #ff6b00; box-shadow: 0 0 0 3px rgba(255,107,0,0.1); }
        .search-input::placeholder { color: #94a3b8; }
        .reprocess-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 8px;
          background: #fff5ed;
          border: 1px solid #fed7aa;
          color: #ff6b00; font-size: 11.5px; font-weight: 700;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.15s ease; white-space: nowrap;
        }
        .reprocess-btn:hover:not(:disabled) {
          background: #ff6b00;
          border-color: #ff6b00;
          color: #ffffff;
        }
        .reprocess-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* ─── Header ─── */}
      <div style={{ marginBottom: '26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #ff6b00, #ff881a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255,107,0,0.3)',
          }}>
            <FolderOpen size={18} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Document Tracker
          </h1>
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px',
            background: '#fff5ed', color: '#ff6b00',
            border: '1px solid #fed7aa',
          }}>
            {documents.length} Files
          </span>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          Track document ingestion across all clients. Monitor extraction confidence and trigger manual AI re-processing.
        </p>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 18px', borderRadius: '10px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#059669', fontSize: '13px', fontWeight: 700,
          marginBottom: '18px', animation: 'fadeIn 0.25s ease',
        }}>
          <CheckCircle2 size={16} /> {toastMsg}
        </div>
      )}

      {/* ─── Stat Cards ─── */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '22px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Documents', value: documents.length, color: '#0f172a', bg: '#ffffff', border: '#e2e8f0' },
          { label: 'Processed', value: completedCount, color: '#10b981', bg: '#ffffff', border: '#e2e8f0' },
          { label: 'Errors', value: errorCount, color: '#ef4444', bg: '#ffffff', border: '#e2e8f0' },
          { label: 'Transactions Extracted', value: totalTxns, color: '#ff6b00', bg: '#ffffff', border: '#e2e8f0' },
        ].map((s) => (
          <div key={s.label} style={{
            padding: '14px 20px', borderRadius: '12px',
            background: s.bg, border: `1px solid ${s.border}`,
            minWidth: '150px', flex: '1 1 180px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Filter Bar ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px', marginBottom: '18px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <select value={docTypeFilter} onChange={(e) => setDocTypeFilter(e.target.value)} className="filter-select">
              <option value="all">All Document Types</option>
              <option value="Bank Statement">Bank Statements</option>
              <option value="Invoice Sent">Invoices Sent</option>
              <option value="Invoice Received">Invoices Received</option>
              <option value="Receipt">Receipts</option>
              <option value="Other">Other</option>
            </select>
            <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="error">Failed / Error</option>
            </select>
            <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="#ff6b00" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search filename or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* ─── Documents Table ─── */}
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
              border: '2px solid rgba(255,107,0,0.2)', borderTopColor: '#ff6b00',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px auto',
            }} />
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: 500 }}>Loading document tracker...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div style={{ padding: '70px 20px', textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: '#fff5ed', border: '1px solid #fed7aa',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}>
              <FileText size={24} color="#ff6b00" />
            </div>
            <h3 style={{ fontSize: '15px', color: '#0f172a', margin: '0 0 6px 0', fontWeight: 700 }}>No documents found</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1.5fr 1.2fr 110px 170px 130px',
              padding: '14px 24px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}>
              {['Document', 'Client', 'Type & Size', 'Date', 'Status', ''].map((h, i) => (
                <div key={i} style={{
                  fontSize: '11px', fontWeight: 700, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  textAlign: i === 5 ? 'right' : 'left',
                }}>
                  {h}
                </div>
              ))}
            </div>

            {filteredDocs.map((doc, idx) => {
              const st = getDocStatusStyle(doc.status);
              return (
                <div
                  key={doc.id}
                  className="doc-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 1.5fr 1.2fr 110px 170px 130px',
                    padding: '16px 24px',
                    borderBottom: idx < filteredDocs.length - 1 ? '1px solid #f1f5f9' : 'none',
                    alignItems: 'center',
                  }}
                >
                  {/* Document name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', flexShrink: 0,
                    }}>
                      {getDocTypeIcon(doc.type)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px', marginBottom: '2px' }}>
                        {doc.filename}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {doc.id.slice(0, 16)}...
                      </div>
                    </div>
                  </div>

                  {/* Client */}
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px', marginBottom: '2px' }}>
                      {doc.company_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {doc.client_name}
                    </div>
                  </div>

                  {/* Type & Size */}
                  <div>
                    <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600, marginBottom: '2px' }}>{doc.type}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>{doc.size}</div>
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500 }}>{doc.date}</div>

                  {/* Status */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '4px 10px', borderRadius: '7px',
                        background: st.bg, border: `1px solid ${st.border}`,
                        color: st.color, fontSize: '11.5px', fontWeight: 700,
                      }}>
                        {doc.status.toLowerCase() === 'completed' || doc.status.toLowerCase() === 'processed'
                          ? <CheckCircle2 size={12} />
                          : doc.status.toLowerCase() === 'error'
                          ? <AlertTriangle size={12} />
                          : <Clock size={12} />
                        }
                        {doc.status}
                      </span>
                    </div>
                    {doc.extracted_transactions_count > 0 && (
                      <div style={{ fontSize: '11.5px', color: '#ff6b00', marginTop: '3px', fontWeight: 700 }}>
                        {doc.extracted_transactions_count} transactions
                      </div>
                    )}
                    {doc.error_message && (
                      <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '3px', fontWeight: 500 }}>
                        {doc.error_message}
                      </div>
                    )}
                  </div>

                  {/* Re-process */}
                  <div style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleReprocess(doc.id, doc.filename)}
                      disabled={reprocessingId === doc.id}
                      className="reprocess-btn"
                    >
                      <RefreshCw
                        size={12}
                        style={{ animation: reprocessingId === doc.id ? 'spin 0.8s linear infinite' : 'none' }}
                      />
                      {reprocessingId === doc.id ? 'Processing...' : 'Re-process'}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {!isLoading && filteredDocs.length > 0 && (
        <div style={{ marginTop: '14px', textAlign: 'right', fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
          Showing {filteredDocs.length} of {documents.length} documents
        </div>
      )}
    </div>
  );
}
