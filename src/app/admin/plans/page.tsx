'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  CreditCard, Tag, Edit3, Trash2, Plus, Check, X, Save,
  ToggleLeft, ToggleRight, Star, StarOff, RefreshCw,
  Users, DollarSign, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Percent,
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  tier_type: string;
  price: number;
  original_price: number | null;
  currency: string;
  billing_period: string;
  price_display: string;
  badge_text: string | null;
  badge_color: string;
  description: string | null;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  subscriber_count?: number;
}

const BADGE_COLORS = [
  { key: 'emerald', label: 'Emerald', hex: '#10b981', bg: '#d1fae5' },
  { key: 'blue', label: 'Blue', hex: '#3b82f6', bg: '#dbeafe' },
  { key: 'purple', label: 'Purple', hex: '#8b5cf6', bg: '#ede9fe' },
  { key: 'amber', label: 'Amber', hex: '#f59e0b', bg: '#fef3c7' },
  { key: 'rose', label: 'Rose', hex: '#f43f5e', bg: '#ffe4e6' },
  { key: 'orange', label: 'Orange', hex: '#ff6b00', bg: '#fff5ed' },
];

const BADGE_COLOR_MAP: Record<string, { hex: string; bg: string }> = {};
BADGE_COLORS.forEach((c) => { BADGE_COLOR_MAP[c.key] = { hex: c.hex, bg: c.bg }; });

const getBadgeStyle = (color: string) => {
  const c = BADGE_COLOR_MAP[color] || BADGE_COLOR_MAP.emerald;
  return { background: c.bg, color: c.hex, border: `1px solid ${c.hex}30` };
};

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
      padding: '14px 20px', borderRadius: '14px',
      background: type === 'success' ? '#10b981' : '#ef4444',
      color: '#fff', fontSize: '13.5px', fontWeight: 600,
      boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', gap: '10px',
      maxWidth: '380px', animation: 'slideUpToast 0.25s ease',
    }}>
      {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

function EditModal({ plan, onClose, onSave }: {
  plan: Plan | null;
  onClose: () => void;
  onSave: (id: string, data: Partial<Plan> & { id?: string }) => Promise<void>;
}) {
  const isNew = !plan;
  const [form, setForm] = useState({
    name: plan?.name ?? '',
    tier_type: plan?.tier_type ?? 'monthly',
    price: plan?.price?.toString() ?? '',
    original_price: plan?.original_price?.toString() ?? '',
    currency: plan?.currency ?? 'USD',
    billing_period: plan?.billing_period ?? 'month',
    price_display: plan?.price_display ?? '',
    badge_text: plan?.badge_text ?? '',
    badge_color: plan?.badge_color ?? 'emerald',
    description: plan?.description ?? '',
    features: plan?.features?.join('\n') ?? '',
    is_active: plan?.is_active ?? true,
    is_featured: plan?.is_featured ?? false,
    display_order: plan?.display_order?.toString() ?? '0',
    custom_id: '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    const payload: Partial<Plan> & { id?: string } = {
      name: form.name.trim(),
      tier_type: form.tier_type,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      currency: form.currency,
      billing_period: form.billing_period,
      price_display: form.price_display.trim() || undefined,
      badge_text: form.badge_text.trim() || null,
      badge_color: form.badge_color,
      description: form.description.trim(),
      features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
      is_active: form.is_active,
      is_featured: form.is_featured,
      display_order: parseInt(form.display_order, 10) || 0,
    };
    if (isNew && form.custom_id.trim()) payload.id = form.custom_id.trim();
    try { await onSave(plan?.id ?? '', payload); } finally { setSaving(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: '10px',
    border: '1px solid #e2e8f0', fontSize: '13.5px', color: '#0f172a',
    background: '#f8fafc', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '12px', fontWeight: 700, color: '#475569',
    display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.45)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{`
        .modal-input:focus { border-color: #ff6b00 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(255,107,0,0.1); }
        @keyframes fadeInModal { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .tbtn { cursor: pointer; padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; border: 1.5px solid transparent; background: none; display: inline-flex; align-items: center; gap: 5px; }
        .ton { background: #fff5ed !important; color: #ff6b00 !important; border-color: #fed7aa !important; }
        .toff { background: #f8fafc !important; color: #94a3b8 !important; border-color: #e2e8f0 !important; }
      `}</style>
      <div style={{
        background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '660px',
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)', animation: 'fadeInModal 0.22s ease',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', borderRadius: '20px 20px 0 0', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fff5ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} color="#ff6b00" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{isNew ? 'Create New Plan' : `Edit: ${plan.name}`}</div>
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>{isNew ? 'Add a new subscription tier or promo offer' : 'Modify pricing, offers, and features'}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {isNew && (
            <div>
              <label style={labelStyle}>Custom Plan ID (optional)</label>
              <input className="modal-input" style={inputStyle} value={form.custom_id} onChange={(e) => set('custom_id', e.target.value)} placeholder="e.g. plan_promo_summer" />
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Plan Name *</label>
              <input className="modal-input" style={inputStyle} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Annual Plan" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Tier Type</label>
              <select className="modal-input" style={inputStyle} value={form.tier_type} onChange={(e) => set('tier_type', e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="semi_annual">Semi-Annual (6 Months)</option>
                <option value="annual">Annual (Yearly)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Current Price (USD) *</label>
              <input className="modal-input" style={inputStyle} type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="50" min="0" step="0.01" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Original / Strike Price</label>
              <input className="modal-input" style={inputStyle} type="number" value={form.original_price} onChange={(e) => set('original_price', e.target.value)} placeholder="300" min="0" step="0.01" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Billing Period</label>
              <select className="modal-input" style={inputStyle} value={form.billing_period} onChange={(e) => set('billing_period', e.target.value)}>
                <option value="month">Monthly</option>
                <option value="6 months">6 Months</option>
                <option value="year">Annual</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Price Display Label</label>
              <input className="modal-input" style={inputStyle} value={form.price_display} onChange={(e) => set('price_display', e.target.value)} placeholder="$50/mo (auto if blank)" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Promo / Offer Badge Text</label>
            <input className="modal-input" style={inputStyle} value={form.badge_text} onChange={(e) => set('badge_text', e.target.value)} placeholder="Save $50 (17% OFF)" />
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Leave blank to remove badge.</div>
          </div>
          <div>
            <label style={labelStyle}>Badge Color Theme</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {BADGE_COLORS.map((c) => (
                <button key={c.key} onClick={() => set('badge_color', c.key)} style={{ padding: '6px 14px', borderRadius: '8px', border: `2px solid ${form.badge_color === c.key ? c.hex : 'transparent'}`, background: c.bg, color: c.hex, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  {form.badge_color === c.key ? 'v ' : ''}{c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Short Description</label>
            <textarea className="modal-input" style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Full AI financial intelligence..." />
          </div>
          <div>
            <label style={labelStyle}>Features (one per line)</label>
            <textarea className="modal-input" style={{ ...inputStyle, minHeight: '110px', resize: 'vertical', fontFamily: 'monospace', fontSize: '12.5px' }} value={form.features} onChange={(e) => set('features', e.target.value)} placeholder={"Full AI Financial Intelligence\nAutomated Monthly P&L"} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Display Order</label>
              <input className="modal-input" style={inputStyle} type="number" value={form.display_order} onChange={(e) => set('display_order', e.target.value)} min="0" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Currency</label>
              <input className="modal-input" style={inputStyle} value={form.currency} onChange={(e) => set('currency', e.target.value)} placeholder="USD" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => set('is_active', !form.is_active)} className={`tbtn ${form.is_active ? 'ton' : 'toff'}`}>
              {form.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
              {form.is_active ? 'Active' : 'Inactive'}
            </button>
            <button onClick={() => set('is_featured', !form.is_featured)} className={`tbtn ${form.is_featured ? 'ton' : 'toff'}`}>
              {form.is_featured ? <Star size={14} fill="#ff6b00" /> : <StarOff size={14} />}
              {form.is_featured ? 'Featured (Best Value)' : 'Not Featured'}
            </button>
          </div>
          {form.badge_text && (
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px 16px', border: '1px dashed #e2e8f0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Badge Preview</div>
              <span style={{ ...getBadgeStyle(form.badge_color), padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'inline-block' }}>{form.badge_text}</span>
            </div>
          )}
        </div>

        <div style={{ padding: '18px 26px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', position: 'sticky', bottom: 0, background: '#fff', borderRadius: '0 0 20px 20px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.price} style={{ padding: '10px 24px', borderRadius: '10px', background: saving ? '#fed7aa' : 'linear-gradient(135deg, #ff6b00, #ff8c38)', border: 'none', color: '#fff', fontSize: '13.5px', fontWeight: 700, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(255,107,0,0.3)', opacity: !form.name.trim() || !form.price ? 0.6 : 1 }}>
            {saving ? <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Saving...' : isNew ? 'Create Plan' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan, onEdit, onDelete, onToggleActive, onToggleFeatured }: {
  plan: Plan;
  onEdit: (p: Plan) => void;
  onDelete: (p: Plan) => void;
  onToggleActive: (p: Plan) => void;
  onToggleFeatured: (p: Plan) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const discount = plan.original_price && plan.original_price > plan.price
    ? Math.round(((plan.original_price - plan.price) / plan.original_price) * 100) : null;

  return (
    <div style={{ background: '#fff', borderRadius: '18px', border: `2px solid ${plan.is_featured ? '#fed7aa' : plan.is_active ? '#e2e8f0' : '#f1f5f9'}`, boxShadow: plan.is_featured ? '0 8px 30px rgba(255,107,0,0.1)' : '0 2px 12px rgba(0,0,0,0.04)', opacity: plan.is_active ? 1 : 0.65, transition: 'all 0.2s ease', overflow: 'hidden', position: 'relative' }}>
      {plan.is_featured && (
        <div style={{ position: 'absolute', top: 0, right: 0, background: 'linear-gradient(135deg, #ff6b00, #ff8c38)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '4px 14px', borderRadius: '0 18px 0 12px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Best Value</div>
      )}
      <div style={{ padding: '22px 22px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{plan.name}</span>
              {!plan.is_active && <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', background: '#fee2e2', padding: '2px 8px', borderRadius: '6px' }}>Inactive</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{plan.price_display}</span>
              {plan.original_price && plan.original_price > plan.price && (
                <span style={{ fontSize: '16px', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 500 }}>${plan.original_price.toFixed(0)}</span>
              )}
              {discount && <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', background: '#d1fae5', padding: '2px 8px', borderRadius: '6px' }}>-{discount}%</span>}
            </div>
            {plan.badge_text && (
              <span style={{ ...getBadgeStyle(plan.badge_color), fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Tag size={11} />{plan.badge_text}
              </span>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>{plan.subscriber_count ?? 0}</span>
              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>subscribers</span>
            </div>
          </div>
        </div>
        {plan.description && <p style={{ fontSize: '12.5px', color: '#64748b', margin: '10px 0 0', lineHeight: 1.6 }}>{plan.description}</p>}
      </div>

      {plan.features?.length > 0 && (
        <>
          <button onClick={() => setExpanded((v) => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 22px', background: '#f8fafc', border: 'none', borderTop: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
            <span>{plan.features.length} Features included</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {expanded && (
            <div style={{ padding: '14px 22px 6px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '6px 0', borderBottom: i < plan.features.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={10} color="#10b981" />
                  </div>
                  <span style={{ fontSize: '12.5px', color: '#334155' }}>{f}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ padding: '14px 22px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onToggleActive(plan)} style={{ padding: '7px 14px', borderRadius: '8px', border: '1.5px solid', borderColor: plan.is_active ? '#fed7aa' : '#e2e8f0', background: plan.is_active ? '#fff5ed' : '#f8fafc', color: plan.is_active ? '#ff6b00' : '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
            {plan.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            {plan.is_active ? 'Active' : 'Inactive'}
          </button>
          <button onClick={() => onToggleFeatured(plan)} style={{ padding: '7px 14px', borderRadius: '8px', border: '1.5px solid', borderColor: plan.is_featured ? '#fed7aa' : '#e2e8f0', background: plan.is_featured ? '#fff5ed' : '#f8fafc', color: plan.is_featured ? '#ff6b00' : '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
            {plan.is_featured ? <Star size={13} fill="#ff6b00" /> : <StarOff size={13} />}
            {plan.is_featured ? 'Featured' : 'Set Featured'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onEdit(plan)} style={{ padding: '7px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #ff6b00, #ff8c38)', border: 'none', color: '#fff', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 3px 10px rgba(255,107,0,0.25)' }}>
            <Edit3 size={13} /> Edit Plan
          </button>
          <button onClick={() => onDelete(plan)} title="Delete / Deactivate" style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPlansPage() {
  const { apiFetch } = useAdminAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null | 'new'>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/plans');
      if (res.ok) setPlans(await res.json());
    } catch { showToast('Failed to load plans', 'error'); }
    finally { setLoading(false); }
  }, [apiFetch]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const handleSave = async (id: string, data: Partial<Plan> & { id?: string }) => {
    try {
      if (editingPlan === 'new') {
        const res = await apiFetch('/admin/plans', { method: 'POST', body: JSON.stringify(data) });
        if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Failed to create plan'); }
        showToast('Plan created successfully!');
      } else {
        const res = await apiFetch(`/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Failed to update plan'); }
        showToast('Plan updated successfully!');
      }
      setEditingPlan(null);
      fetchPlans();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Save failed', 'error');
      throw e;
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Delete "${plan.name}"? If active subscribers exist, it will be deactivated instead.`)) return;
    try {
      const res = await apiFetch(`/admin/plans/${plan.id}`, { method: 'DELETE' });
      const data = await res.json();
      showToast(data.message || 'Plan removed');
      fetchPlans();
    } catch { showToast('Delete failed', 'error'); }
  };

  const handleToggle = async (plan: Plan, field: 'is_active' | 'is_featured') => {
    try {
      await apiFetch(`/admin/plans/${plan.id}`, { method: 'PUT', body: JSON.stringify({ [field]: !plan[field] }) });
      showToast('Plan updated!');
      fetchPlans();
    } catch { showToast('Update failed', 'error'); }
  };

  const activePlans = plans.filter((p) => p.is_active);
  const totalSubs = plans.reduce((s, p) => s + (p.subscriber_count ?? 0), 0);
  const activeBadges = plans.filter((p) => p.badge_text && p.is_active).length;
  const monthly = plans.find((p) => p.tier_type === 'monthly');
  const semi = plans.find((p) => p.tier_type === 'semi_annual');
  const annual = plans.find((p) => p.tier_type === 'annual');

  const kpis = [
    { label: 'Active Plans', value: String(activePlans.length), icon: CreditCard, color: '#ff6b00', bg: '#fff5ed' },
    { label: 'Monthly Rate', value: monthly?.price_display ?? '—', icon: DollarSign, color: '#3b82f6', bg: '#dbeafe' },
    { label: '6-Month Rate', value: semi?.price_display ?? '—', icon: TrendingUp, color: '#8b5cf6', bg: '#ede9fe' },
    { label: 'Annual Rate', value: annual?.price_display ?? '—', icon: TrendingUp, color: '#10b981', bg: '#d1fae5' },
    { label: 'Active Offers', value: String(activeBadges), icon: Tag, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Total Subscribers', value: String(totalSubs), icon: Users, color: '#6366f1', bg: '#e0e7ff' },
  ];

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: '1100px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes slideUpToast { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {editingPlan !== null && (
        <EditModal plan={editingPlan === 'new' ? null : editingPlan} onClose={() => setEditingPlan(null)} onSave={handleSave} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #ff6b00, #ff8c38)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(255,107,0,0.3)' }}>
            <CreditCard size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>Manage Plans</h1>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Control subscription pricing, discount offers &amp; promotional badges</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchPlans} style={{ padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setEditingPlan('new')} style={{ padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #ff6b00, #ff8c38)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '13.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(255,107,0,0.3)' }}>
            <Plus size={16} /> Add New Plan
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} style={{ background: '#fff', borderRadius: '14px', padding: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <Icon size={16} color={kpi.color} />
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1, marginBottom: '4px' }}>{kpi.value}</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{kpi.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>All Subscription Plans ({plans.length})</div>
        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Changes reflect immediately on client portal</div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: '260px', borderRadius: '18px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e8edf2 50%, #f1f5f9 75%)', backgroundSize: '800px 100%', animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '18px', border: '2px dashed #e2e8f0' }}>
          <div style={{ marginBottom: '12px' }}><CreditCard size={40} color="#cbd5e1" /></div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>No plans yet</div>
          <button onClick={() => setEditingPlan('new')} style={{ padding: '10px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #ff6b00, #ff8c38)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13.5px' }}>
            Create First Plan
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan}
              onEdit={(p) => setEditingPlan(p)}
              onDelete={handleDelete}
              onToggleActive={(p) => handleToggle(p, 'is_active')}
              onToggleFeatured={(p) => handleToggle(p, 'is_featured')}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: '28px', padding: '14px 18px', borderRadius: '12px', background: '#fff5ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Percent size={16} color="#ff6b00" />
        <div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#9a3412' }}>Live Sync Active: </span>
          <span style={{ fontSize: '12.5px', color: '#c2410c' }}>Any price, badge, or feature change is immediately visible to all clients on their Plan &amp; Billing page. No redeployment needed.</span>
        </div>
      </div>
    </div>
  );
}
