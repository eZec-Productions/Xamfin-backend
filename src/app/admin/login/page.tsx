'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, Zap, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim()) { setErrorMsg('Admin email is required.'); return; }
    if (!password.trim()) { setErrorMsg('Security key is required.'); return; }

    setIsLoading(true);
    const res = await adminLogin(email, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Invalid credentials or insufficient privileges.');
      return;
    }
    router.push('/admin/review');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 107, 0, 0.08) 0%, #f8fafc 70%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .login-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          color: #0f172a;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: all 0.2s ease;
        }
        .login-input:focus {
          border-color: #ff6b00;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(255,107,0,0.12);
        }
        .login-input::placeholder { color: #94a3b8; }
        .login-btn {
          width: 100%;
          padding: 13px 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #ff6b00 0%, #ff881a 100%);
          border: none;
          color: #ffffff;
          font-size: 14.5px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(255,107,0,0.35);
          letter-spacing: 0.01em;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255,107,0,0.45);
        }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .eye-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.15s ease;
        }
        .eye-btn:hover { color: #0f172a; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .login-card { animation: fadeIn 0.4s ease; }
      `}</style>

      {/* Glow orbs - Neon Orange */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
      }} />

      {/* Login Card */}
      <div className="login-card" style={{
        width: '100%',
        maxWidth: '420px',
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        padding: '40px 36px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.02)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: '2px',
          background: 'linear-gradient(90deg, transparent, #ff6b00, transparent)',
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #ff6b00 0%, #ff881a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px auto',
            boxShadow: '0 8px 24px rgba(255,107,0,0.35)',
          }}>
            <ShieldCheck size={26} color="#ffffff" />
          </div>
          <h1 style={{
            fontSize: '22px', fontWeight: 800, color: '#0f172a',
            margin: '0 0 6px 0', letterSpacing: '-0.02em',
          }}>
            Advisory Operations
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
            Internal access only — Finlytics Operations Team
          </p>
        </div>

        {/* Security notice */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 14px', borderRadius: '10px',
          background: '#fff5ed',
          border: '1px solid #fed7aa',
          marginBottom: '26px',
        }}>
          <Zap size={14} color="#ff6b00" />
          <span style={{ fontSize: '12px', color: '#ea580c', fontWeight: 600 }}>
            Admin credentials required • All actions audited
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', fontWeight: 700, color: '#0f172a',
              marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              <Mail size={12} color="#ff6b00" /> Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@finlytics.ai"
              className="login-input"
              autoComplete="email"
            />
          </div>

          <div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', fontWeight: 700, color: '#0f172a',
              marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              <Lock size={12} color="#ff6b00" /> Security Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="login-input"
                style={{ paddingRight: '44px' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-btn"
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div style={{
              padding: '11px 14px', borderRadius: '10px',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#dc2626', fontSize: '13px', fontWeight: 600,
            }}>
              {errorMsg}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="login-btn" style={{ marginTop: '4px' }}>
            {isLoading ? (
              <>
                <div style={{
                  width: '16px', height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Authenticating...
              </>
            ) : (
              <>
                Access Operations Portal
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer note */}
        <div style={{
          textAlign: 'center', marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid #f1f5f9',
        }}>
          <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            Authorized Finlytics personnel only.<br />
            Activity is securely logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
