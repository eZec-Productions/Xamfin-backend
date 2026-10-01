'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFinancialData } from '@/context/FinancialDataContext';
import {
  LayoutDashboard,
  UploadCloud,
  FileSpreadsheet,
  MessageSquareText,
  Search,
  Settings,
  Sparkles,
  LogOut,
  ChevronRight,
  Building2,
  X,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { currentClient, logout } = useFinancialData();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      name: 'Upload Documents',
      href: '/dashboard/upload',
      icon: UploadCloud,
      badge: 'New',
    },
    {
      name: 'Reports',
      href: '/dashboard/reports',
      icon: FileSpreadsheet,
      badge: 'Approved',
    },
    {
      name: 'AI Chat',
      href: '/dashboard/ai-chat',
      icon: MessageSquareText,
      badge: 'Smart',
    },
    {
      name: 'Search Ledger',
      href: '/dashboard/transactions',
      icon: Search,
      badge: undefined,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      badge: undefined,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 40,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          padding: '24px 16px',
          borderRight: '1px solid #e2e8f0',
          overflowY: 'auto',
          transition: 'transform 0.3s ease',
          transform: mobileOpen ? 'translateX(0)' : undefined,
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.02)',
        }}
        className={mobileOpen ? 'sidebar-mobile-open' : 'sidebar-desktop'}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 24px 8px' }}>
          <Link href="/dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src="/logo-black.png"
                alt="Finlytics AI"
                style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', paddingLeft: '2px' }}>
              Client Financial Portal
            </div>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              style={{
                color: '#64748b',
                display: 'flex',
                padding: '6px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
              }}
              className="lg-hidden"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Client Business Badge */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: '14px',
            padding: '12px 14px',
            marginBottom: '22px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                backgroundColor: '#fff5ed',
                border: '1px solid #fed7aa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff6b00',
                flexShrink: 0,
              }}
            >
              <Building2 size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentClient.companyName || 'My Business'}
              </div>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    display: 'inline-block',
                  }}
                />
                Active Business
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 12px 6px 12px' }}>
            Menu
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  background: isActive ? '#fff5ed' : 'transparent',
                  border: isActive ? '1px solid #fed7aa' : '1px solid transparent',
                  boxShadow: isActive ? '0 2px 8px rgba(255, 107, 0, 0.12)' : 'none',
                  color: isActive ? '#ff6b00' : '#475569',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13.5px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = '#0f172a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={19} color={isActive ? '#ff6b00' : '#64748b'} />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 7px',
                      borderRadius: '999px',
                      backgroundColor: isActive ? '#ff6b00' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#64748b',
                      fontWeight: 700,
                      border: isActive ? 'none' : '1px solid #e2e8f0',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Admin Panel shortcut — visible only when logged-in user has role=admin */}
          {currentClient.role === 'admin' && (
            <>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 12px 4px 12px' }}>
                Admin
              </div>
              <Link
                href="/admin/review"
                onClick={onCloseMobile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  background: pathname.startsWith('/admin') ? 'linear-gradient(135deg, #fff5ed, #ffedd5)' : 'transparent',
                  border: pathname.startsWith('/admin') ? '1px solid #fed7aa' : '1px solid transparent',
                  color: pathname.startsWith('/admin') ? '#ff6b00' : '#475569',
                  fontWeight: pathname.startsWith('/admin') ? 700 : 500,
                  fontSize: '13.5px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!pathname.startsWith('/admin')) {
                    e.currentTarget.style.backgroundColor = '#fff5ed';
                    e.currentTarget.style.color = '#ea580c';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!pathname.startsWith('/admin')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                <ShieldCheck size={19} color={pathname.startsWith('/admin') ? '#ff6b00' : '#64748b'} />
                <span>Admin Panel</span>
              </Link>
            </>
          )}
        </div>

        {/* Finlytics Pro Card */}
        <div
          style={{
            margin: '18px 0',
            padding: '16px',
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #fffaf5 0%, #fff2e8 100%)',
            border: '1px solid #fed7aa',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                backgroundColor: '#ffedd5',
                color: '#ea580c',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #fed7aa',
              }}
            >
              FINLYTICS PRO
            </span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Autonomous Advisory
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.4, marginBottom: '12px' }}>
            Real-time cash flow alerts & automated monthly tax planning.
          </div>
          <Link
            href="/dashboard/settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              width: '100%',
              background: 'linear-gradient(135deg, #ff6b00 0%, #ff881a 100%)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              padding: '8px 12px',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(255, 107, 0, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>Upgrade Plan</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* User Info & Logout */}
        <div
          style={{
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#fff5ed',
                color: '#ff6b00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13.5px',
                fontWeight: 800,
                border: '2px solid #fed7aa',
              }}
            >
              {(currentClient.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentClient.name || 'Account User'}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#64748b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentClient.email}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              color: '#ef4444',
              padding: '7px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              transition: 'all 0.2s ease',
            }}
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
