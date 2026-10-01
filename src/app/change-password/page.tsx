'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFinancialData } from '@/context/FinancialDataContext';
import { KeyRound, ShieldAlert, CheckCircle, ArrowRight, Lock } from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { currentClient, completeFirstTimePasswordChange } = useFinancialData();

  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match');
      return;
    }

    completeFirstTimePasswordChange(newPassword);
    setSuccess(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0c121e 0%, #141E30 50%, #0d1524 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <KeyRound size={26} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
            Change Your Password
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
            Welcome to Finlytics AI, <strong>{currentClient.name}</strong>. As this is your first login, please replace your temporary password with a secure permanent password.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '16px',
            }}
          >
            <ShieldAlert size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div
            style={{
              padding: '18px',
              borderRadius: '14px',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              textAlign: 'center',
            }}
          >
            <CheckCircle size={28} style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '16px', fontWeight: 700 }}>Password Updated Successfully!</div>
            <p style={{ fontSize: '12px', color: '#166534', marginTop: '4px' }}>
              Redirecting you to your business dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Temporary Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter temporary password"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  backgroundColor: '#f8fafc',
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
                placeholder="Enter new permanent password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  backgroundColor: '#f8fafc',
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
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  backgroundColor: '#f8fafc',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '13px', borderRadius: '12px', marginTop: '8px' }}
            >
              <span>Save Password & Enter Portal</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
