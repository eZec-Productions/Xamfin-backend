'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Users, Search, ArrowRight, FileText, CreditCard, Sparkles,
  CheckCircle2, Building2, Mail, Activity, Zap, BarChart3,
  UserPlus, Trash2, X, AlertCircle, Shield,
} from 'lucide-react';

interface ClientItem {
  id: string;
  name: string;
  email: string;
  company_name: string;
  industry: string;
  plan: string;
  plan_price: string;
  status: 'active' | 'paused' | 'cancelled';
  created_at: string;
  documents_count: number;
  transactions_count: number;
  latest_report_status?: string;
}

const STATUS_MAP = {
  active: { label: 'Active', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', dot: '#10b981' },
  paused: { label: 'Paused', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', dot: '#f59e0b' },
  cancelled: { label: 'Cancelled', color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', dot: '#f87171' },
};

export default function AdminClientsPage() {
  const { apiFetch } = useAdminAuth();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  // Add Client Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [newClient, setNewClient] = useState({
    name: '',
    company_name: '',
    email: '',
    password: '',
    industry: 'Technology & SaaS',
    current_plan: 'Monthly Plan',
    plan_price: '$50/mo',
  });

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/admin/clients${statusFilter !== 'all' ? `?status_filter=${statusFilter}` : ''}`);
      const data = await res.json();
      if (Array.isArray(data)) setClients(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadClients(); }, [statusFilter]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newClient.name.trim() || !newClient.email.trim() || !newClient.password.trim() || !newClient.company_name.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (newClient.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/admin/clients', {
        method: 'POST',
        body: JSON.stringify(newClient),
      });
      const data = await res.json();

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewClient({
          name: '',
          company_name: '',
          email: '',
          password: '',
          industry: 'Technology & SaaS',
          current_plan: 'Monthly Plan',
          plan_price: '$50/mo',
        });
        setActionMsg(`✓ Client "${newClient.name}" created successfully!`);
        setTimeout(() => setActionMsg(''), 5000);
        await loadClients();
      } else {
        setFormError(data.detail || 'Failed to create client.');
      }
    } catch {
      setFormError('Network error while creating client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${clientName}" and all associated data? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await apiFetch(`/admin/clients/${clientId}`, { method: 'DELETE' });
      if (res.ok) {
        setActionMsg(`✓ Client "${clientName}" deleted.`);
        setTimeout(() => setActionMsg(''), 4000);
        await loadClients();
      } else {
        const d = await res.json();
        alert(d.detail || 'Failed to delete client.');
      }
    } catch {
      alert('Error deleting client.');
    }
  };

  const handleGenerateReport = async (clientId: string, companyName: string) => {
    if (!confirm(`Trigger AI monthly report for ${companyName}?`)) return;
    try {
      const res = await apiFetch(`/admin/clients/${clientId}/generate-report`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`✓ Report queued for ${companyName}`);
        setTimeout(() => setActionMsg(''), 4000);
      } else {
        alert(data.detail || 'Failed to trigger report');
      }
    } catch { alert('Error triggering report'); }
  };

  const filteredClients = clients.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.company_name.toLowerCase().includes(term) ||
      c.industry.toLowerCase().includes(term)
    );
  });

  const counts = {
    all: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    paused: clients.filter(c => c.status === 'paused').length,
    cancelled: clients.filter(c => c.status === 'cancelled').length,
  };

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  const COMPANY_COLORS = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899',
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .client-row { transition: all 0.15s ease; }
        .client-row:hover { background-color: #f8fafc; }
        .filter-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 20px;
          font-size: 12.5px; font-weight: 600; cursor: pointer;
          border: 1px solid transparent; transition: all 0.15s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .filter-pill.active {
          background: #ff6b00; color: #ffffff;
          border-color: #ff6b00;
          box-shadow: 0 2px 8px rgba(255,107,0,0.3);
        }
        .filter-pill:not(.active) {
          background: #ffffff; color: #64748b;
          border-color: #e2e8f0;
        }
        .filter-pill:not(.active):hover {
          color: #0f172a; border-color: #cbd5e1;
        }
        .trigger-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 12px; border-radius: 8px;
          background: #fff5ed;
          border: 1px solid #fed7aa;
          color: #ff6b00; font-size: 11.5px; font-weight: 700;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.15s ease; white-space: nowrap;
        }
        .trigger-btn:hover { background: #ff6b00; color: #ffffff; border-color: #ff6b00; }
        .manage-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 13px; border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #0f172a; font-size: 11.5px; font-weight: 600;
          text-decoration: none; transition: all 0.15s ease; white-space: nowrap;
        }
        .manage-btn:hover { background: #ffffff; border-color: #cbd5e1; }
        .delete-btn {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 7px 10px; border-radius: 8px;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #ef4444; font-size: 11.5px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease;
        }
        .delete-btn:hover { background: #fee2e2; border-color: #fca5a5; }
        .modal-input {
          width: 100%; box-sizing: border-box;
          padding: 10px 14px; border-radius: 10px;
          border: 1.5px solid #e2e8f0; font-size: 13.5px;
          color: #0f172a; background: #f8fafc; outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: border-color 0.2s;
        }
        .modal-input:focus { border-color: #ff6b00; background: #ffffff; }
      `}</style>

      {/* ─── Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '26px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff6b00, #ff881a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255,107,0,0.3)',
            }}>
              <Users size={18} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Client Directory
            </h1>
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
              background: '#fff5ed', color: '#ea580c',
              border: '1px solid #fed7aa',
            }}>
              {clients.length} Real Accounts
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Manage client subscriptions, credentials, and trigger professional AI reports.
          </p>
        </div>

        {/* Action Button: Add Client */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #ff6b00 0%, #ff881a 100%)',
            color: '#ffffff', border: 'none', cursor: 'pointer',
            fontSize: '13.5px', fontWeight: 700,
            boxShadow: '0 4px 14px rgba(255,107,0,0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          <UserPlus size={16} />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Toast */}
      {actionMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 16px', borderRadius: '10px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46', fontSize: '13px', fontWeight: 600,
          marginBottom: '18px', animation: 'fadeIn 0.25s ease',
        }}>
          <CheckCircle2 size={15} color="#10b981" /> {actionMsg}
        </div>
      )}

      {/* ─── Stat chips ─── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(
          [
            { key: 'all', label: 'All Clients', count: counts.all },
            { key: 'active', label: 'Active', count: counts.active },
            { key: 'paused', label: 'Paused', count: counts.paused },
            { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
          ] as const
        ).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`filter-pill ${statusFilter === key ? 'active' : ''}`}
          >
            <span>{label}</span>
            <span style={{
              fontSize: '11px', padding: '1px 6px', borderRadius: '10px',
              background: statusFilter === key ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
              color: statusFilter === key ? '#ffffff' : '#64748b',
            }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Search Bar ─── */}
      <div style={{ position: 'relative', marginBottom: '18px' }}>
        <Search
          size={16}
          color="#94a3b8"
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search clients by name, email, company, or industry..."
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '11px 16px 11px 40px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: '13.5px',
            outline: 'none',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        />
      </div>

      {/* ─── Client Table ─── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2.4fr 1.3fr 1.3fr 1fr 1.6fr',
          padding: '12px 20px',
          borderBottom: '1px solid #f1f5f9',
          background: '#f8fafc',
          fontSize: '11.5px',
          fontWeight: 700,
          color: '#64748b',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          <div>Client & Company</div>
          <div>Current Plan</div>
          <div>Activity</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            Loading client directory...
          </div>
        ) : filteredClients.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Users size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              {searchTerm ? 'No matching clients found' : 'No Clients Yet'}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              {searchTerm
                ? 'Try clearing your search term or filter.'
                : 'Click "Add New Client" above to create your first real client account.'}
            </div>
            {!searchTerm && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '8px',
                  background: '#ff6b00', color: '#ffffff',
                  border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                }}
              >
                <UserPlus size={15} /> Add First Client
              </button>
            )}
          </div>
        ) : (
          <>
            {filteredClients.map((client, idx) => {
              const st = STATUS_MAP[client.status] || STATUS_MAP.active;
              const avatarBg = COMPANY_COLORS[idx % COMPANY_COLORS.length];

              return (
                <div
                  key={client.id}
                  className="client-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.4fr 1.3fr 1.3fr 1fr 1.6fr',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: '1px solid #f8fafc',
                  }}
                >
                  {/* Client Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      background: avatarBg, color: '#ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '13px', flexShrink: 0,
                    }}>
                      {getInitials(client.company_name || client.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {client.company_name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
                        {client.name} · {client.email}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px', fontWeight: 500 }}>
                        {client.industry}
                      </div>
                    </div>
                  </div>

                  {/* Plan */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                      {client.plan}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ff6b00' }}>
                      {client.plan_price}
                    </div>
                  </div>

                  {/* Activity */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <FileText size={12} color="#ff6b00" />
                      <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500 }}>
                        <strong style={{ color: '#0f172a' }}>{client.documents_count}</strong> docs
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BarChart3 size={12} color="#ff6b00" />
                      <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500 }}>
                        <strong style={{ color: '#0f172a' }}>{client.transactions_count}</strong> txns
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 10px', borderRadius: '7px',
                      background: st.bg, border: `1px solid ${st.border}`,
                      color: st.color, fontSize: '11.5px', fontWeight: 700,
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.dot }} />
                      {st.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleGenerateReport(client.id, client.company_name)}
                      className="trigger-btn"
                      title="Trigger AI Monthly Report"
                    >
                      <Zap size={12} /> Report
                    </button>
                    <Link href={`/admin/clients/${client.id}`} className="manage-btn">
                      Manage <ArrowRight size={12} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteClient(client.id, client.name)}
                      className="delete-btn"
                      title="Delete Client"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* ─── ADD CLIENT MODAL ─── */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            width: '100%', maxWidth: '520px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease',
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '9px',
                  background: '#fff5ed', color: '#ff6b00',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Create Real Client Account
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Enter client details to set up their portal access
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#94a3b8', display: 'flex', padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateClient} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', borderRadius: '10px',
                  backgroundColor: '#fef2f2', border: '1px solid #fecaca',
                  color: '#dc2626', fontSize: '12.5px', fontWeight: 600,
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{formError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Farooq"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="modal-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Company / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nexus Logix"
                    value={newClient.company_name}
                    onChange={(e) => setNewClient({ ...newClient, company_name: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="client@company.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="modal-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Initial Password *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Set secure password"
                    value={newClient.password}
                    onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Industry
                  </label>
                  <select
                    value={newClient.industry}
                    onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                    className="modal-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Technology & SaaS">Technology & SaaS</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="Marketing & Advertising">Marketing & Advertising</option>
                    <option value="Real Estate & Construction">Real Estate & Construction</option>
                    <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                    <option value="Financial & Legal Services">Financial & Legal Services</option>
                    <option value="Consulting & Agency">Consulting & Agency</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Subscription Plan
                  </label>
                  <select
                    value={newClient.current_plan}
                    onChange={(e) => {
                      const val = e.target.value;
                      let price = '$50/mo';
                      if (val === '6 Months Plan') price = '$250/6mo';
                      if (val === 'Annual Plan') price = '$350/yr';
                      setNewClient({ ...newClient, current_plan: val, plan_price: price });
                    }}
                    className="modal-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Monthly Plan">Monthly Plan ($50/mo)</option>
                    <option value="6 Months Plan">6 Months Plan ($250/6mo)</option>
                    <option value="Annual Plan">Annual Plan ($350/yr)</option>
                  </select>
                </div>
              </div>

              {/* Security notice */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                <Shield size={14} color="#ff6b00" style={{ flexShrink: 0 }} />
                <span>The client can log in to both Web Dashboard and Mobile App with these credentials.</span>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '9px 18px', borderRadius: '10px',
                    border: '1px solid #e2e8f0', background: '#ffffff',
                    color: '#64748b', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '9px 22px', borderRadius: '10px',
                    background: isSubmitting ? '#fdba74' : 'linear-gradient(135deg, #ff6b00 0%, #ff881a 100%)',
                    border: 'none', color: '#ffffff',
                    fontSize: '13px', fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 3px 12px rgba(255,107,0,0.35)',
                  }}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Client Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
