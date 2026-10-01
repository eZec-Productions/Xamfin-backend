'use client';

import React from 'react';
import { HealthScore } from '@/types/finance';
import { ShieldCheck, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

interface HealthScoreGaugeProps {
  healthScore: HealthScore;
}

export function HealthScoreGauge({ healthScore }: HealthScoreGaugeProps) {
  const { score, status, title, description } = healthScore;

  const getStatusColor = () => {
    if (status === 'high') return {
      stroke: '#10b981',
      glow: 'rgba(16, 185, 129, 0.3)',
      bg: '#ecfdf5',
      text: '#059669',
      border: '#a7f3d0',
      label: 'Excellent',
      gradient: ['#10b981', '#34d399'],
      icon: TrendingUp,
    };
    if (status === 'medium') return {
      stroke: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.3)',
      bg: '#fef3c7',
      text: '#b45309',
      border: '#fde68a',
      label: 'Fair',
      gradient: ['#f59e0b', '#fbbf24'],
      icon: Activity,
    };
    return {
      stroke: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.3)',
      bg: '#fef2f2',
      text: '#b91c1c',
      border: '#fecaca',
      label: 'Low Rating',
      gradient: ['#ef4444', '#f87171'],
      icon: AlertTriangle,
    };
  };

  const sc = getStatusColor();
  const StatusIcon = sc.icon;

  // Full arc gauge (270° sweep)
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = 46;
  const strokeWidth = 9;
  const sweepAngle = 270;
  const startAngle = 135;

  const polarToCartesian = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const describeArc = (startDeg: number, endDeg: number) => {
    const start = polarToCartesian(startDeg);
    const end = polarToCartesian(endDeg);
    const largeArcFlag = endDeg - startDeg <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const trackPath = describeArc(startAngle, startAngle + sweepAngle);
  const filledAngle = (score / 100) * sweepAngle;
  const fillPath = score > 0 ? describeArc(startAngle, startAngle + filledAngle) : '';

  const arcLen = (sweepAngle / 360) * 2 * Math.PI * r;
  const filledLen = (score / 100) * arcLen;

  // Score interpretation labels
  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Outstanding';
    if (s >= 65) return 'Good';
    if (s >= 45) return 'Moderate';
    return 'Needs Work';
  };

  return (
    <div
      className="fin-card"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        padding: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(226, 232, 240, 0.85)',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03), 0 6px 18px -3px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: '#fff5ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ff6b00',
            }}
          >
            <Activity size={16} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px' }}>
            Financial Health Score
          </h3>
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 9px',
            borderRadius: '999px',
            backgroundColor: sc.bg,
            color: sc.text,
            border: `1px solid ${sc.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <StatusIcon size={11} />
          {sc.label}
        </span>
      </div>

      {/* Gauge + Info Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
        {/* Arc Gauge SVG */}
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
          <svg width={size} height={size}>
            <defs>
              <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={sc.gradient[0]} />
                <stop offset="100%" stopColor={sc.gradient[1]} />
              </linearGradient>
            </defs>

            {/* Track */}
            <path
              d={trackPath}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Filled arc */}
            {fillPath && (
              <path
                d={fillPath}
                fill="none"
                stroke="url(#healthGrad)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 6px ${sc.glow})`,
                  transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            )}
          </svg>

          {/* Center Score */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: '8px',
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1, letterSpacing: '-1px' }}>
              {score}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.3px' }}>
              / 100
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '5px', lineHeight: 1.3, letterSpacing: '-0.2px' }}>
            {title}
          </div>
          <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.55, fontWeight: 500 }}>
            {description}
          </p>

          {/* Score badge */}
          <div style={{ marginTop: '12px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '999px',
                backgroundColor: sc.bg,
                color: sc.text,
                border: `1px solid ${sc.border}`,
              }}
            >
              <ShieldCheck size={11} />
              {getScoreLabel(score)} Performance
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footnote */}
      <div
        style={{
          marginTop: '14px',
          padding: '8px 12px',
          borderRadius: '10px',
          backgroundColor: '#f8fafc',
          border: '1px solid #f1f5f9',
          fontSize: '11px',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 500,
        }}
      >
        <ShieldCheck size={13} color="#ff6b00" />
        <span>Calculated from revenue consistency, margin buffer, and cash runway.</span>
      </div>
    </div>
  );
}
