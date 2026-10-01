'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFinancialData } from '@/context/FinancialDataContext';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const { resetPasswordWithToken } = useFinancialData();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!token) {
      setErrorMsg('Invalid or missing password reset token. Please request a new reset link.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify and re-type.');
      return;
    }

    setLoading(true);
    const res = await resetPasswordWithToken(token, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push('/login');
    }, 2500);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '440px',
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08)',
      padding: '40px',
      boxSizing: 'border-box',
    }}>
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.12), rgba(255, 136, 26, 0.06))',
          border: '1px solid rgba(255, 107, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
        }}>
          <Lock size={26} color="#ff6b00" />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
          Set New Password
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Create a secure password for your Finlytics AI account
        </p>
      </div>

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '12px 14px',
          borderRadius: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          fontSize: '13px',
          lineHeight: 1.5,
          marginBottom: '20px',
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {success ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            color: '#10b981',
            marginBottom: '16px',
          }}>
            <CheckCircle2 size={28} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
            Password Reset Complete
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
            Your account credentials have been updated. Redirecting to login...
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ff6b00',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            Go to Login now <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 42px 12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '14px',
                  backgroundColor: '#f8fafc',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                fontSize: '14px',
                backgroundColor: '#f8fafc',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
              padding: '14px',
              borderRadius: '12px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #ff6b00 0%, #ff881a 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(255, 107, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <Link
              href="/login"
              style={{
                fontSize: '13px',
                color: '#64748b',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 107, 0, 0.08) 0%, #f8fafc 70%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-main, sans-serif)',
      boxSizing: 'border-box',
    }}>
      <Suspense fallback={
        <div style={{ color: '#64748b', fontSize: '14px' }}>Loading password reset...</div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
