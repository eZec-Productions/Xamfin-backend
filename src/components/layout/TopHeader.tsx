'use client';

import React from 'react';
import { useFinancialData } from '@/context/FinancialDataContext';
import { Search, Bell, Zap, Menu } from 'lucide-react';

interface TopHeaderProps {
  onToggleMobileSidebar: () => void;
}

export function TopHeader({ onToggleMobileSidebar }: TopHeaderProps) {
  const { currentClient, setIsSearchOpen } = useFinancialData();

  const firstName = currentClient.name
    ? currentClient.name.split(' ')[0]
    : 'there';

  return (
    <header
      style={{
        height: 'var(--header-height)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left: Hamburger + Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleMobileSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '10px',
            backgroundColor: '#f8fafc',
            color: '#334155',
          }}
          className="mobile-toggle-btn"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.2px' }}>
              Welcome back, {firstName}
            </h1>
            <span style={{ fontSize: '16px' }}>👋</span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }} className="subtext-responsive">
            {currentClient.companyName
              ? currentClient.companyName
              : 'Upload your first documents to get started'}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Global Search Bar */}
        <button
          id="global-search-btn"
          onClick={() => setIsSearchOpen(true)}
          className="search-bar-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '999px',
            padding: '8px 16px',
            color: '#64748b',
            fontSize: '13px',
            cursor: 'pointer',
            minWidth: '240px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ff6b00';
            e.currentTarget.style.backgroundColor = '#fff5ed';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.backgroundColor = '#f8fafc';
          }}
        >
          <Search size={16} color="#ff6b00" />
          <span style={{ flex: 1, textAlign: 'left' }}>Search transactions, reports...</span>
          <kbd
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 700,
              color: '#475569',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Search icon button (mobile) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ff6b00',
          }}
          title="Search"
          aria-label="Open search"
        >
          <Zap size={17} />
        </button>

        {/* Notification Bell with Neon Orange Dot */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
            }}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={17} />
          </button>
          <span
            style={{
              position: 'absolute',
              top: '3px',
              right: '3px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ff6b00',
              border: '2px solid #ffffff',
            }}
          />
        </div>
      </div>
    </header>
  );
}
