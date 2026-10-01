'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFinancialData } from '@/context/FinancialDataContext';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, requestPasswordReset } = useFinancialData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetFeedbackMsg, setResetFeedbackMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim()) { setErrorMsg('Please enter your business email address.'); return; }
    if (!password.trim()) { setErrorMsg('Please enter your password.'); return; }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const res = await login(email, password);
    setIsLoading(false);
    if (!res.success) { setErrorMsg(res.error || 'Invalid email or password.'); return; }
    if (res.role === 'admin') {
      router.push('/admin/review');
    } else {
      router.push(res.isFirstTime ? '/change-password' : '/dashboard');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    const res = await requestPasswordReset(resetEmail);
    setResetLoading(false);
    setResetFeedbackMsg(res.message);
    setResetSent(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 107, 0, 0.08) 0%, #f8fafc 70%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'var(--font-main)',
      boxSizing: 'border-box',
    }}>
      {/* Glow Blobs - Neon Orange */}
      <div style={{ position: 'fixed', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)', top: '-150px', right: '-150px', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,0,0.05) 0%, transparent 70%)', bottom: '-100px', left: '-100px', pointerEvents: 'none' }} />

      {/* Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '40px 36px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.02)',
        border: '1px solid #e2e8f0',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 10,
      }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <img
              src="/logo-black.png"
              alt="Finlytics AI"
              style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Client Financial Portal
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 14px', borderRadius: '12px',
            backgroundColor: '#fef2f2', border: '1px solid #fecaca',
            color: '#dc2626', fontSize: '13px', fontWeight: 600,
            marginBottom: '20px',
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Email Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Business Email
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} color="#ff6b00" style={{ position: 'absolute', left: '14px', pointerEvents: 'none', flexShrink: 0 }} />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '14px',
                  color: '#0f172a',
                  backgroundColor: '#f8fafc',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#ff6b00')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(true)}
                style={{ fontSize: '12px', color: '#ff6b00', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} color="#ff6b00" style={{ position: 'absolute', left: '14px', pointerEvents: 'none', flexShrink: 0 }} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 44px 12px 42px',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '14px',
                  color: '#0f172a',
                  backgroundColor: '#f8fafc',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#ff6b00')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: '4px' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '14px 20px',
              borderRadius: '12px',
              background: isLoading ? '#fdba74' : 'linear-gradient(135deg, #ff6b00 0%, #ff881a 100%)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '6px',
              boxShadow: isLoading ? 'none' : '0 4px 16px rgba(255,107,0,0.35)',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {isLoading ? (
              <>
                <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Access Client Dashboard</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ margin: '24px 0', borderTop: '1px solid #f1f5f9' }} />

        {/* Security note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
          <ShieldCheck size={14} color="#ff6b00" />
          <span>Your data is encrypted and isolated to your account</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setForgotPasswordOpen(false)}
        >
          <div
            style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fff', borderRadius: '20px', padding: '32px', boxSizing: 'border-box', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Reset Password</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
              Enter your registered email and we will send a secure reset link.
            </p>

            {resetSent ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px', borderRadius: '12px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '13px', lineHeight: 1.5, fontWeight: 500, marginBottom: '16px' }}>
                  <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{resetFeedbackMsg || 'Password reset link sent! Check your inbox.'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setForgotPasswordOpen(false); setResetSent(false); setResetEmail(''); }}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#0f172a', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 14px', borderRadius: '10px',
                    border: '1.5px solid #e2e8f0', fontSize: '14px',
                    backgroundColor: '#f8fafc', fontFamily: 'inherit', outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#ff6b00')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setForgotPasswordOpen(false)} style={{ padding: '9px 18px', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    style={{
                      padding: '9px 18px', borderRadius: '10px',
                      background: resetLoading ? '#94a3b8' : 'linear-gradient(135deg, #ff6b00, #ff881a)',
                      color: '#fff', border: 'none', fontSize: '13px', fontWeight: 700,
                      cursor: resetLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {resetLoading ? 'Sending Link...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
