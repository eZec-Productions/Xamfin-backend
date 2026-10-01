'use client';

import React from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function AiChatPage() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
            Finlytics AI Financial Advisor
          </h1>
          <span className="badge badge-green">
            <ShieldCheck size={13} />
            Client Data Isolated
          </span>
        </div>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Ask plain-language questions about your cash flow, profit margins, expense spikes, and invoice collection timing.
        </p>
      </div>

      <ChatInterface />
    </div>
  );
}
