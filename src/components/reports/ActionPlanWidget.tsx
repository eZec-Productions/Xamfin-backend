'use client';

import React from 'react';
import { ActionPlanItem } from '@/types/finance';
import { Sparkles, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

interface ActionPlanWidgetProps {
  actionPlan: ActionPlanItem[];
  onStatusChange: (actionId: string, status: 'done' | 'dismissed') => void;
}

export function ActionPlanWidget({ actionPlan, onStatusChange }: ActionPlanWidgetProps) {
  return (
    <div className="fin-card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div className="card-title">
            <Sparkles size={18} color="#ff6b00" />
            <span>Action Plan — Top 3 Things To Do</span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            High-impact financial recommendations formulated by Finlytics AI analysts
          </p>
        </div>
        <span className="badge badge-orange">
          AI Recommendations
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {actionPlan.map((item, index) => {
          const isDone = item.status === 'done';
          const isDismissed = item.status === 'dismissed';

          return (
            <div
              key={item.id}
              style={{
                borderRadius: '16px',
                border: '1px solid',
                borderColor: isDone ? '#bbf7d0' : isDismissed ? '#e2e8f0' : '#e5e7eb',
                backgroundColor: isDone ? '#f0fdf4' : isDismissed ? '#f8fafc' : '#ffffff',
                padding: '18px',
                transition: 'all 0.2s ease',
                opacity: isDismissed ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: isDone ? '#15803d' : '#ff6b00',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </span>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', textDecoration: isDismissed ? 'line-through' : 'none' }}>
                      {item.title}
                    </h4>
                  </div>

                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '10px', marginLeft: '34px' }}>
                    {item.explanation}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '34px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#d1fae5', padding: '3px 10px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingUp size={12} />
                      Estimated Impact: {item.estimatedImpact}
                    </span>
                  </div>
                </div>

                {/* Actions: Mark as Done / Dismiss */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  {item.status === 'active' ? (
                    <>
                      <button
                        onClick={() => onStatusChange(item.id, 'done')}
                        className="btn-primary"
                        style={{ padding: '7px 14px', fontSize: '12px' }}
                      >
                        <CheckCircle2 size={15} />
                        <span>Mark as Done</span>
                      </button>
                      <button
                        onClick={() => onStatusChange(item.id, 'dismissed')}
                        className="btn-secondary"
                        style={{ padding: '7px 14px', fontSize: '12px' }}
                      >
                        <XCircle size={15} color="#94a3b8" />
                        <span>Dismiss</span>
                      </button>
                    </>
                  ) : (
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: '999px',
                        backgroundColor: isDone ? '#dcfce7' : '#f1f5f9',
                        color: isDone ? '#15803d' : '#64748b',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isDone && <CheckCircle2 size={14} />}
                      {isDismissed && <XCircle size={14} />}
                      {isDone ? 'Completed' : 'Dismissed'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
