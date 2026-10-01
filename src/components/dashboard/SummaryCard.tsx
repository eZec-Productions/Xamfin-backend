'use client';

import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  CreditCard, 
  Activity, 
  Wallet,
  Sparkles,
  Percent
} from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  trend: string;
  isUp: boolean;
  isPositive?: boolean;
  percentage: number;
  gaugeColor?: string;
}

export function SummaryCard({
  title,
  value,
  trend,
  isUp,
  isPositive = true,
  percentage,
  gaugeColor = '#ff6b00',
}: SummaryCardProps) {
  // Format negative currency values cleanly (e.g. "$-3,900.00" -> "-$3,900.00")
  const formattedValue = value.includes('$-')
    ? value.replace('$-', '-$')
    : value.startsWith('-')
    ? value
    : value;

  const isNegative = formattedValue.startsWith('-');

  // Select appropriate icon and color theme per title
  const getTheme = () => {
    const t = title.toLowerCase();
    if (t.includes('revenue')) {
      return {
        icon: TrendingUp,
        iconBg: '#fff5ed',
        iconColor: '#ff6b00',
        borderColor: '#fed7aa',
        glowColor: 'rgba(255, 107, 0, 0.15)',
        accentBg: 'linear-gradient(90deg, #ff6b00, #ff8533)',
      };
    }
    if (t.includes('expense')) {
      return {
        icon: CreditCard,
        iconBg: '#fef2f2',
        iconColor: '#ef4444',
        borderColor: '#fecaca',
        glowColor: 'rgba(239, 68, 68, 0.15)',
        accentBg: 'linear-gradient(90deg, #ef4444, #f87171)',
      };
    }
    if (t.includes('profit')) {
      return {
        icon: isNegative ? Activity : Sparkles,
        iconBg: isNegative ? '#fef2f2' : '#ecfdf5',
        iconColor: isNegative ? '#ef4444' : '#10b981',
        borderColor: isNegative ? '#fecaca' : '#a7f3d0',
        glowColor: isNegative ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
        accentBg: isNegative ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #10b981, #059669)',
      };
    }
    return {
      icon: Wallet,
      iconBg: '#eff6ff',
      iconColor: '#0284c7',
      borderColor: '#bfdbfe',
      glowColor: 'rgba(2, 132, 199, 0.15)',
      accentBg: 'linear-gradient(90deg, #0284c7, #38bdf8)',
    };
  };

  const theme = getTheme();
  const Icon = theme.icon;

  // SVG circular gauge calculation
  const radius = 21;
  const strokeWidth = 3.8;
  const circumference = 2 * Math.PI * radius;
  const safePct = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (safePct / 100) * circumference;

  return (
    <div
      className="fin-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        borderRadius: '20px',
        padding: '22px 20px',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03), 0 6px 16px -2px rgba(15, 23, 42, 0.03)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Top subtle highlight line */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: '20px',
          right: '20px',
          height: '2px',
          background: theme.accentBg,
          borderRadius: '999px',
          opacity: 0.8,
        }} 
      />

      {/* Header Row: Title & Category Icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: theme.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.iconColor,
              border: `1px solid ${theme.borderColor}`,
              boxShadow: `0 2px 8px ${theme.glowColor}`,
            }}
          >
            <Icon size={16} />
          </div>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, letterSpacing: '-0.1px' }}>
            {title}
          </span>
        </div>

        {/* Circular Gauge */}
        <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
          <svg viewBox="0 0 50 50" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle
              cx="25"
              cy="25"
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />
            <circle
              cx="25"
              cy="25"
              r={radius}
              fill="none"
              stroke={gaugeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 800,
              color: '#1e293b',
              letterSpacing: '-0.3px',
            }}
          >
            {safePct}%
          </div>
        </div>
      </div>

      {/* Main Metric Value */}
      <div 
        style={{ 
          fontSize: '26px', 
          fontWeight: 800, 
          color: isNegative ? '#b91c1c' : '#0f172a', 
          letterSpacing: '-0.7px', 
          marginBottom: '12px',
          lineHeight: 1.15,
        }}
      >
        {formattedValue}
      </div>

      {/* Footer / Trend Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '11.5px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '999px',
              backgroundColor: isPositive && !isNegative ? '#ecfdf5' : '#fef2f2',
              color: isPositive && !isNegative ? '#059669' : '#b91c1c',
              border: `1px solid ${isPositive && !isNegative ? '#a7f3d0' : '#fecaca'}`,
            }}
          >
            {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            <span>{trend}</span>
          </span>
          <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 500 }}>
            vs last month
          </span>
        </div>
      </div>
    </div>
  );
}
