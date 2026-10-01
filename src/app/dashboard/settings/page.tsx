'use client';

import React, { useState, useEffect } from 'react';
import { useFinancialData } from '@/context/FinancialDataContext';
import {
  Building2,
  CreditCard,
  Bell,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Check,
} from 'lucide-react';

type TabType = 'profile' | 'billing' | 'notifications' | 'security';

export default function SettingsPage() {
  const { currentClient, updateClientProfile, updateNotifications, updateSubscriptionPlan } = useFinancialData();

  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Business Profile Form State
  const [companyName, setCompanyName] = useState(currentClient.companyName);
  const [industry, setIndustry] = useState(currentClient.industry);
  const [fiscalStartMonth, setFiscalStartMonth] = useState(currentClient.fiscalStartMonth);
  const [currency, setCurrency] = useState(currentClient.currency);
  const [profileSaved, setProfileSaved] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState(currentClient.notifications);
  const [notifSaved, setNotifSaved] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Subscription Plan State
  const [planSuccessMsg, setPlanSuccessMsg] = useState('');
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [livePlansLoading, setLivePlansLoading] = useState(true);

  // Default fallback plans (used if API is unreachable)
  const DEFAULT_PLANS = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: '$50',
      priceDisplay: '$50/mo',
      period: 'Billed monthly ($50)',
      effectivePrice: null as string | null,
      savings: null as string | null,
      popular: false,
      desc: 'Flexible month-to-month access with full financial AI copilot.',
      renewalCalc: () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); },
      features: ['Verified Financial Ledger Sync', 'Gemini AI Financial Copilot', 'Automated Monthly P&L Packages', 'Real-time Cash Flow & Runway', 'Standard Email Support'],
    },
    {
      id: 'semi_annual',
      name: '6 Months Plan',
      price: '$250',
      priceDisplay: '$250/6mo',
      period: 'Billed every 6 months ($250)',
      effectivePrice: '≈ $41.67 / month' as string | null,
      savings: 'Save $50 (17% OFF)' as string | null,
      popular: false,
      desc: 'Half-year continuous oversight with priority document extraction.',
      renewalCalc: () => { const d = new Date(); d.setMonth(d.getMonth() + 6); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); },
      features: ['Everything in Monthly Plan', 'Priority Statement & Receipt OCR', 'Multi-Period Expense Trend Audits', 'Quarterly Estimated Tax Forecaster', 'Priority Support Response'],
    },
    {
      id: 'annual',
      name: 'Annual Plan',
      price: '$350',
      priceDisplay: '$350/yr',
      period: 'Billed annually ($350)',
      effectivePrice: '≈ $29.17 / month' as string | null,
      savings: 'Best Value — Save $250 (42% OFF)' as string | null,
      popular: true,
      desc: 'Full year of automated advisory, year-end package & top savings.',
      renewalCalc: () => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); },
      features: ['Everything in 6 Months Plan', 'Custom CPA-Ready Year-End Reports', 'Highest Priority AI Token Processing', 'Dedicated Advisory Audit Workflow', '24/7 VIP Priority Support'],
    },
  ];

  type PlanEntry = typeof DEFAULT_PLANS[0];
  const [SUBSCRIPTION_PLANS, setSubscriptionPlans] = useState<PlanEntry[]>(DEFAULT_PLANS);

  // Fetch live plans from admin-managed backend

  useEffect(() => {
    setLivePlansLoading(true);
    fetch('http://127.0.0.1:8000/api/plans')
      .then((res) => res.json())
      .then((data: Array<{
        id: string; name: string; price: number; price_display: string;
        billing_period: string; original_price: number | null;
        badge_text: string | null; is_featured: boolean;
        description: string | null; features: string[];
      }>) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: PlanEntry[] = data.map((p) => {
            const effectiveMonthly = p.billing_period === '6 months'
              ? `≈ $${(p.price / 6).toFixed(2)} / month`
              : p.billing_period === 'year'
              ? `≈ $${(p.price / 12).toFixed(2)} / month`
              : null;
            const renewalCalc = () => {
              const d = new Date();
              if (p.billing_period === '6 months') d.setMonth(d.getMonth() + 6);
              else if (p.billing_period === 'year') d.setFullYear(d.getFullYear() + 1);
              else d.setMonth(d.getMonth() + 1);
              return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            };
            return {
              id: p.id,
              name: p.name,
              price: `$${p.price}`,
              priceDisplay: p.price_display,
              period: `Billed ${p.billing_period} ($${p.price})`,
              effectivePrice: effectiveMonthly,
              savings: p.badge_text ?? null,
              popular: p.is_featured,
              desc: p.description ?? '',
              renewalCalc,
              features: p.features ?? [],
            };
          });
          setSubscriptionPlans(mapped);
        }
      })
      .catch(() => { /* keep defaults on network error */ })
      .finally(() => setLivePlansLoading(false));
  }, []);

  const handleSelectPlan = async (p: PlanEntry) => {
    setIsUpdatingPlan(true);
    const renewal = p.renewalCalc();
    if (updateSubscriptionPlan) {
      await updateSubscriptionPlan(p.name, p.priceDisplay, renewal);
    }
    setIsUpdatingPlan(false);
    setPlanSuccessMsg(`Successfully updated to ${p.name} (${p.priceDisplay})!`);
    setTimeout(() => setPlanSuccessMsg(''), 4000);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateClientProfile({
      companyName,
      industry,
      fiscalStartMonth,
      currency,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleToggleNotification = (key: keyof typeof notifications) => {
    const updated = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(updated);
    updateClientProfile({ notifications: updated });
    // Call backend
    if (updateNotifications) {
      updateNotifications(updated);
    }
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('finlytics_token') || ''}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setPasswordError(err.detail || 'Could not update password.');
        return;
      }

      setPasswordError('');
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (e) {
      setPasswordError('Server connection error.');
    }
  };

  const tabs: { id: TabType; name: string; icon: React.ComponentType<{ size: number }> }[] = [
    { id: 'profile', name: 'Business Profile', icon: Building2 },
    { id: 'billing', name: 'Plan & Billing', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Lock },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
          Client Settings & Preferences
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
          Manage your business entities, reporting currency, alert subscriptions, and security credentials.
        </p>
      </div>

      {/* Tabs Header */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '2px',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: '12px 12px 0 0',
                borderBottom: isActive ? '2px solid #35577D' : '2px solid transparent',
                color: isActive ? '#0f172a' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '14px',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={17} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Business Profile */}
      {activeTab === 'profile' && (
        <div className="fin-card" style={{ maxWidth: '640px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Business Profile
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            Update your business identity and financial reporting calendar.
          </p>

          {profileSaved && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Business profile saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Business Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Industry
              </label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Fiscal Year Start Month
                </label>
                <select
                  value={fiscalStartMonth}
                  onChange={(e) => setFiscalStartMonth(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="PKR (Rs)">PKR (Rs)</option>
                  <option value="CAD ($)">CAD ($)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: '8px' }}
            >
              <span>Save Changes</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Plan & Billing */}
      {activeTab === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
          {/* Success Banner */}
          {planSuccessMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 18px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
            }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span>{planSuccessMsg}</span>
            </div>
          )}

          {/* Current Active Plan Overview */}
          <div className="fin-card" style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '24px 28px',
            borderRadius: '20px',
            border: '1px solid #334155',
            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 107, 0, 0.2)',
                  color: '#ff881a',
                  border: '1px solid rgba(255, 107, 0, 0.3)'
                }}>
                  Current Active Plan
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Verified Subscription</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.4px', marginBottom: '4px' }}>
                {currentClient.currentPlan}
              </div>
              <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                Next billing renewal: <strong style={{ color: '#ffffff' }}>{currentClient.renewalDate}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#ff881a' }}>
                {currentClient.planPrice}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Auto-renews safely
              </div>
            </div>
          </div>

          {/* Available Subscription Tiers */}
          <div>
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
                Choose Your Subscription Model
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '2px' }}>
                Upgrade or switch your billing cycle anytime. All plans include full Gemini AI financial copilot.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '20px',
              alignItems: 'stretch'
            }}>
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isCurrent = currentClient.currentPlan.toLowerCase().includes(plan.id.replace('_', '')) ||
                  currentClient.planPrice === plan.priceDisplay ||
                  currentClient.currentPlan.toLowerCase() === plan.name.toLowerCase();

                return (
                  <div
                    key={plan.id}
                    className="fin-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '20px',
                      padding: '26px 24px',
                      backgroundColor: '#ffffff',
                      border: plan.popular ? '2px solid #ff6b00' : '1.5px solid #e2e8f0',
                      boxShadow: plan.popular ? '0 8px 30px rgba(255, 107, 0, 0.08)' : '0 2px 10px rgba(0,0,0,0.02)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Badge */}
                    {plan.popular ? (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: '#ff6b00',
                        color: '#ffffff',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        padding: '4px 14px',
                        borderRadius: '0 0 0 12px'
                      }}>
                        Best Value
                      </div>
                    ) : plan.savings ? (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        padding: '4px 14px',
                        borderRadius: '0 0 0 12px'
                      }}>
                        {plan.savings}
                      </div>
                    ) : null}

                    {/* Title */}
                    <div style={{ marginBottom: '14px' }}>
                      <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                        {plan.name}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.5, minHeight: '38px' }}>
                        {plan.desc}
                      </p>
                    </div>

                    {/* Price */}
                    <div style={{
                      padding: '16px 0',
                      borderTop: '1px solid #f1f5f9',
                      borderBottom: '1px solid #f1f5f9',
                      marginBottom: '18px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                          {plan.price}
                        </span>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                          {plan.id === 'monthly' ? '/ month' : plan.id === 'semi_annual' ? '/ 6 months' : '/ year'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                          {plan.period}
                        </span>
                        {plan.effectivePrice && (
                          <span style={{
                            fontSize: '11.5px',
                            color: '#059669',
                            fontWeight: 700,
                            backgroundColor: '#ecfdf5',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            {plan.effectivePrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Features list */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        What's Included:
                      </div>
                      {plan.features.map((feat, fi) => (
                        <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: '#fff5ed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Check size={11} color="#ff6b00" strokeWidth={3} />
                          </div>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isCurrent || isUpdatingPlan}
                      style={{
                        width: '100%',
                        padding: '12px 18px',
                        borderRadius: '12px',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: isCurrent ? 'default' : 'pointer',
                        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                        backgroundColor: isCurrent ? '#f1f5f9' : plan.popular ? '#ff6b00' : '#0f172a',
                        color: isCurrent ? '#64748b' : '#ffffff',
                        border: isCurrent ? '1.5px solid #e2e8f0' : 'none',
                        boxShadow: isCurrent ? 'none' : plan.popular ? '0 4px 14px rgba(255, 107, 0, 0.3)' : '0 4px 14px rgba(15, 23, 42, 0.15)'
                      }}
                    >
                      {isCurrent ? (
                        <>
                          <CheckCircle2 size={16} color="#10b981" />
                          <span>Current Plan</span>
                        </>
                      ) : (
                        <>
                          <Zap size={15} />
                          <span>Switch to {plan.name}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <div className="fin-card" style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Notification Preferences
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                Configure real-time automated alerts for your business finances.
              </p>
            </div>
            {notifSaved && (
              <span style={{ fontSize: '12px', color: '#35577D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> Saved
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                id: 'monthlyReportReady' as const,
                title: 'Monthly Report Ready',
                description: 'Receive an alert as soon as your verified monthly report is published.',
              },
              {
                id: 'cashFlowAlert' as const,
                title: 'Cash Flow Alert',
                description: 'Immediate alert if cash runway drops below 3 months of operational burn.',
              },
              {
                id: 'overdueInvoiceReminder' as const,
                title: 'Overdue Invoice Reminder',
                description: 'Weekly digest of customer invoices exceeding 30+ payment terms.',
              },
              {
                id: 'weeklySummary' as const,
                title: 'Weekly Summary',
                description: 'Condensed Monday morning snapshot of ledger inflows and expenses.',
              },
            ].map((item) => {
              const isEnabled = notifications[item.id];
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {item.description}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleNotification(item.id)}
                    style={{
                      width: '46px',
                      height: '24px',
                      borderRadius: '999px',
                      backgroundColor: isEnabled ? '#35577D' : '#cbd5e1',
                      position: 'relative',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer',
                    }}
                    aria-label={`Toggle ${item.title}`}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '2px',
                        left: isEnabled ? '24px' : '2px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        transition: 'left 0.2s',
                      }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'security' && (
        <div className="fin-card" style={{ maxWidth: '640px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Security & Authentication
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            Update your account password and security credentials.
          </p>

          {passwordSaved && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Password updated successfully!</span>
            </div>
          )}

          {passwordError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Current Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                New Password (minimum 8 characters)
              </label>
              <input
                type="password"
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: '8px' }}
            >
              <span>Update Password</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
