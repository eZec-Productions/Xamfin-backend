'use client';

import React, { useState } from 'react';
import { AIInsight } from '@/types/finance';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, Zap } from 'lucide-react';

interface AIInsightsPanelProps {
  insights: AIInsight[];
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const getInsightMeta = (type: AIInsight['type']) => {
    switch (type) {
      case 'strong':
        return {
          icon: TrendingUp,
          bgColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          borderHover: '#86efac',
          textColor: '#059669',
          tagLabel: 'Strong',
          tagBg: '#ecfdf5',
          tagBorder: '#a7f3d0',
          accentLine: 'linear-gradient(90deg, #10b981, #34d399)',
          iconBg: '#d1fae5',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: '#fffbeb',
          borderColor: '#fde68a',
          borderHover: '#fcd34d',
          textColor: '#b45309',
          tagLabel: 'Warning',
          tagBg: '#fef3c7',
          tagBorder: '#fde68a',
          accentLine: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
          iconBg: '#fef3c7',
        };
      case 'opportunity':
        return {
          icon: Lightbulb,
          bgColor: '#fff5ed',
          borderColor: '#fed7aa',
          borderHover: '#fdba74',
          textColor: '#ea580c',
          tagLabel: 'Opportunity',
          tagBg: '#fff5ed',
          tagBorder: '#fed7aa',
          accentLine: 'linear-gradient(90deg, #ff6b00, #ff8533)',
          iconBg: '#ffedd5',
        };
    }
  };

  return (
    <div
      className="fin-card"
      style={{
        borderRadius: '20px',
        padding: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(226, 232, 240, 0.85)',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03), 0 6px 18px -3px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff6b00, #ff8533)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)',
            }}
          >
            <Sparkles size={16} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
              AI Monthly Executive Insights
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px', fontWeight: 500 }}>
              Powered by Finlytics AI • Approved Report
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, #fff5ed, #ffedd5)',
            color: '#ff6b00',
            fontWeight: 700,
            border: '1px solid #fed7aa',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Zap size={11} />
          Live Analysis
        </span>
      </div>

      {/* Insight Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        {insights.map((ins, index) => {
          const meta = getInsightMeta(ins.type);
          const Icon = meta.icon;
          const isHovered = hoveredIdx === index;

          return (
            <div
              key={`${ins.type}-${ins.title}-${index}`}
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                backgroundColor: isHovered ? meta.bgColor : '#fafafa',
                border: `1px solid ${isHovered ? meta.borderHover : '#f1f5f9'}`,
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: isHovered ? `0 8px 24px rgba(15, 23, 42, 0.08)` : '0 1px 3px rgba(15,23,42,0.02)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top accent line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: meta.accentLine,
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.25s ease',
                }}
              />

              {/* Top Row: Tag + Icon */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: meta.textColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    backgroundColor: meta.tagBg,
                    border: `1px solid ${meta.tagBorder}`,
                    padding: '3px 8px',
                    borderRadius: '999px',
                  }}
                >
                  <Icon size={12} />
                  <span>{meta.tagLabel}</span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#94a3b8',
                    opacity: 0.9,
                  }}
                >
                  {ins.tag}
                </span>
              </div>

              {/* Content */}
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', lineHeight: 1.3, letterSpacing: '-0.2px' }}>
                  {ins.title}
                </div>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.55, fontWeight: 500 }}>
                  {ins.description}
                </p>
              </div>

              {/* Impact Footer */}
              {ins.impact && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: meta.textColor,
                    paddingTop: '8px',
                    borderTop: `1px solid ${isHovered ? meta.borderColor : '#f1f5f9'}`,
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <ArrowRight size={12} />
                  <span>{ins.impact}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


