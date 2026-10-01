'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AdminAuthProvider,
  useAdminAuth,
} from '@/context/AdminAuthContext';
import {
  ShieldCheck,
  FileCheck2,
  Users,
  FolderOpen,
  LogOut,
  ChevronRight,
  ExternalLink,
  Zap,
  Bell,
  Activity,
  BarChart3,
  Circle,
  CreditCard,
  LayoutDashboard,
} from 'lucide-react';

const adminStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

  * { box-sizing: border-box; }
  
  .admin-nav-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: 12px;
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 500;
    color: #64748b;
    border: 1px solid transparent;
    transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    cursor: pointer;
    background: transparent;
    width: 100%;
    text-align: left;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .admin-nav-item:hover {
    color: #0f172a;
    background: #f8fafc;
    border-color: #e2e8f0;
  }
  .admin-nav-item.active {
    color: #ff6b00;
    font-weight: 700;
    background: #fff5ed;
    border-color: #fed7aa;
    box-shadow: 0 2px 8px rgba(255, 107, 0, 0.1);
  }
  .admin-nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    height: 60%;
    width: 3px;
    background: #ff6b00;
    border-radius: 0 2px 2px 0;
  }
  .admin-logout-btn {
    background: #fef2f2;
    border: 1px solid #fee2e2;
    cursor: pointer;
    color: #ef4444;
    padding: 7px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }
  .admin-logout-btn:hover {
    background: #fee2e2;
    color: #b91c1c;
  }
  .admin-portal-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 14px;
    border-radius: 10px;
    text-decoration: none;
    font-size: 12.5px;
    font-weight: 600;
    color: #64748b;
    border: 1px dashed #cbd5e1;
    background: #ffffff;
    transition: all 0.15s ease;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .admin-portal-link:hover {
    color: #ff6b00;
    border-color: #ff6b00;
    background: #fff5ed;
  }
  .pulse-dot {
    animation: pulse-orange 2s infinite;
  }
  @keyframes pulse-orange {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,0,0.5); }
    50% { box-shadow: 0 0 0 5px rgba(255,107,0,0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, isAdminAuthenticated, isLoading, adminLogout, apiFetch } = useAdminAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoading && !isAdminAuthenticated && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isLoading, isAdminAuthenticated, isLoginPage, router]);

  useEffect(() => {
    if (isAdminAuthenticated && !isLoginPage) {
      apiFetch('/admin/reports?status=PENDING')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setPendingCount(data.length);
        })
        .catch(() => {});
    }
  }, [isAdminAuthenticated, isLoginPage, pathname]);

  if (isLoginPage) return <>{children}</>;

  if (isLoading || !isAdminAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <style>{adminStyles}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '44px', height: '44px',
            border: '3px solid #ffedd5',
            borderTopColor: '#ff6b00',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 18px auto',
          }} />
          <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            Verifying admin credentials...
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      name: 'Overview Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      description: 'Metrics & live activity',
    },
    {
      name: 'Review Queue',
      href: '/admin/review',
      icon: FileCheck2,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeType: 'urgent',
      description: 'AI report gatekeeper',
    },
    {
      name: 'Client Manager',
      href: '/admin/clients',
      icon: Users,
      description: 'Accounts & subscriptions',
    },
    {
      name: 'Document Tracker',
      href: '/admin/documents',
      icon: FolderOpen,
      description: 'Uploads & extraction',
    },
    {
      name: 'Manage Plans',
      href: '/admin/plans',
      icon: CreditCard,
      description: 'Pricing & promo offers',
    },
  ];

  const adminInitials = (adminUser?.name || 'AD').slice(0, 2).toUpperCase();

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{adminStyles}</style>

      {/* ─── Sidebar ─── */}
      <aside style={{
        width: '260px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
        boxShadow: '2px 0 10px rgba(0,0,0,0.02)',
      }}>
        {/* Brand */}
        <div style={{
          padding: '20px 18px 16px 18px',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img
              src="/logo-black.png"
              alt="Finlytics AI"
              style={{ height: '24px', width: 'auto', objectFit: 'contain' }}
            />
            <span style={{
              fontSize: '9px', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              padding: '2px 6px', borderRadius: '4px',
              background: '#fff5ed',
              color: '#ea580c',
              border: '1px solid #fed7aa',
            }}>
              Admin
            </span>
          </div>
          <p style={{ fontSize: '10px', color: '#64748b', margin: 0, marginTop: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Operations Portal
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{
            fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase',
            color: '#94a3b8', padding: '0 10px 8px 10px', letterSpacing: '0.08em',
          }}>
            Operations
          </div>

          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/admin/review' && pathname.startsWith('/admin/review')) ||
              (item.href === '/admin/clients' && pathname.startsWith('/admin/clients')) ||
              (item.href === '/admin/plans' && pathname.startsWith('/admin/plans'));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item${isActive ? ' active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: isActive ? '#fff5ed' : '#f8fafc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    border: isActive ? '1px solid #fed7aa' : '1px solid #e2e8f0',
                  }}>
                    <Icon size={15} color={isActive ? '#ff6b00' : '#64748b'} />
                  </div>
                  <div>
                    <div style={{ lineHeight: 1.2, color: isActive ? '#ff6b00' : '#0f172a' }}>{item.name}</div>
                    {item.description && (
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '1px', fontWeight: 400 }}>
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
                {item.badge != null && (
                  <span style={{
                    fontSize: '10px', fontWeight: 800,
                    minWidth: '20px', height: '20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ff6b00, #ff881a)',
                    color: '#ffffff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 6px',
                    boxShadow: '0 2px 6px rgba(255,107,0,0.3)',
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div style={{
            margin: '14px 0',
            height: '1px',
            background: '#f1f5f9',
          }} />

          <div style={{
            fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase',
            color: '#94a3b8', padding: '0 10px 8px 10px', letterSpacing: '0.08em',
          }}>
            Quick Links
          </div>

          <Link href="/dashboard" target="_blank" className="admin-portal-link">
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <ExternalLink size={14} color="#64748b" />
              <span>Client Dashboard</span>
            </div>
            <ChevronRight size={12} color="#94a3b8" />
          </Link>
        </nav>

        {/* Footer user card */}
        <div style={{
          padding: '14px 14px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '9px',
              background: '#fff5ed',
              border: '1px solid #fed7aa',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 800, color: '#ff6b00', flexShrink: 0,
            }}>
              {adminInitials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '13px', fontWeight: 700, color: '#0f172a',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {adminUser?.name || 'Admin User'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                Operations
              </div>
            </div>
          </div>
          <button onClick={adminLogout} title="Log Out" className="admin-logout-btn">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header style={{
          height: '56px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px',
          flexShrink: 0,
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          {/* Left: Engine Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '5px 12px', borderRadius: '8px',
              background: '#fff5ed',
              border: '1px solid #fed7aa',
            }}>
              <Zap size={13} color="#ff6b00" />
              <span style={{ fontSize: '12px', color: '#ea580c', fontWeight: 700, letterSpacing: '0.01em' }}>
                Finlytics AI Advisory Engine
              </span>
              <span style={{
                fontSize: '10px', color: '#9a3412', fontWeight: 600,
                background: '#ffedd5',
                padding: '1px 5px', borderRadius: '4px',
              }}>
                v2.4
              </span>
            </div>
          </div>

          {/* Right: Status indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div className="pulse-dot" style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#ff6b00',
              }} />
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                AI Pipeline Active
              </span>
            </div>
            {pendingCount > 0 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 10px', borderRadius: '6px',
                background: '#fff5ed',
                border: '1px solid #fed7aa',
              }}>
                <Bell size={11} color="#ea580c" />
                <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: 700 }}>
                  {pendingCount} pending
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
