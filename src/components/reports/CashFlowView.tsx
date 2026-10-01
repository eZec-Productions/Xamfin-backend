'use client';

import React from 'react';
import { FinancialReport } from '@/types/finance';
import { ArrowDownLeft, ArrowUpRight, Wallet, Check } from 'lucide-react';

interface CashFlowViewProps {
  cashFlow: FinancialReport['cashFlow'];
  cashBalance: number;
}

export function CashFlowView({ cashFlow, cashBalance }: CashFlowViewProps) {
  const moneyIn = cashFlow?.moneyIn ?? 0;
  const moneyOut = cashFlow?.moneyOut ?? 0;
  const netMovement = cashFlow?.netMovement ?? (moneyIn - moneyOut);
  const isNetPositive = netMovement >= 0;

  return (
    <div className="fin-card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            Cash Flow Summary
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Liquidity movement across verified bank accounts
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
          <Wallet size={16} />
          <span>Total Balance: ${(cashBalance ?? 0).toLocaleString()}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Money In */}
        <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
              <ArrowDownLeft size={16} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
              Money That Came In
            </span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803d' }}>
            +${moneyIn.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#166534', marginTop: '4px' }}>
            Customer payments, invoices cleared & retainer fees
          </div>
        </div>

        {/* Money Out */}
        <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <ArrowUpRight size={16} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>
              Money That Went Out
            </span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#b91c1c' }}>
            -${moneyOut.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#991b1b', marginTop: '4px' }}>
            Salaries, software vendors, lease payments & operating bills
          </div>
        </div>

        {/* Net Movement */}
        <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: isNetPositive ? '#ecfdf5' : '#fff1f2', border: `1px solid ${isNetPositive ? '#a7f3d0' : '#fecdd3'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: isNetPositive ? '#d1fae5' : '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isNetPositive ? '#047857' : '#e11d48' }}>
              <Check size={16} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: isNetPositive ? '#047857' : '#e11d48', textTransform: 'uppercase' }}>
              Net Movement
            </span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: isNetPositive ? '#047857' : '#e11d48' }}>
            {isNetPositive ? '+' : '-'}${Math.abs(netMovement).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: isNetPositive ? '#065f46' : '#9f1239', marginTop: '4px' }}>
            {isNetPositive ? 'Positive cash generation added to bank vault' : 'Net cash outflow during this billing cycle'}
          </div>
        </div>
      </div>
    </div>
  );
}
