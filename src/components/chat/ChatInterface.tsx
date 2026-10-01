'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFinancialData } from '@/context/FinancialDataContext';
import {
  ArrowUp, Sparkles, Plus, MessageSquare, Shield,
  Trash2, Copy, RefreshCw, Square, Check, Edit2, X,
  ThumbsUp, ThumbsDown, ChevronDown, PanelLeftClose, PanelLeft,
  DollarSign, TrendingUp, Receipt, ShieldCheck, Zap
} from 'lucide-react';

/* ──────────────────────────────────────────────
   ChatGPT-Style Enhanced Markdown Renderer
   Renders bold, italic, inline code, codeblocks with copy,
   headings, bullet & numbered lists, blockquotes, and tables
────────────────────────────────────────────── */
function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div style={{
      margin: '12px 0',
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontSize: 13,
      border: '1px solid #334155'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 14px',
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        fontSize: 11,
        fontWeight: 600,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        <span>{lang || 'code'}</span>
        <button onClick={handleCopy} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: copied ? '#34d399' : '#94a3b8',
          fontSize: 11,
          padding: '2px 6px',
          borderRadius: 4
        }}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy code'}</span>
        </button>
      </div>
      <pre style={{
        padding: '14px 16px',
        margin: 0,
        overflowX: 'auto',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        lineHeight: 1.6
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;

  const inline = (raw: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    // Bold, italic, inline code
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let last = 0, m: RegExpExecArray | null;
    while ((m = regex.exec(raw)) !== null) {
      if (m.index > last) parts.push(raw.slice(last, m.index));
      if (m[2]) {
        parts.push(
          <strong key={key++} style={{ fontWeight: 700, color: '#0f172a' }}>
            {m[2]}
          </strong>
        );
      } else if (m[3]) {
        parts.push(<em key={key++}>{m[3]}</em>);
      } else if (m[4]) {
        parts.push(
          <code key={key++} style={{
            background: '#f1f5f9',
            color: '#0f172a',
            borderRadius: 5,
            padding: '2px 6px',
            fontSize: 13,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
            border: '1px solid #e2e8f0'
          }}>
            {m[4]}
          </code>
        );
      }
      last = m.index + m[0].length;
    }
    if (last < raw.length) parts.push(raw.slice(last));
    return parts;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Blank lines
    if (line.trim() === '') {
      nodes.push(<div key={key++} style={{ height: 8 }} />);
      i++;
      continue;
    }

    // Code blocks ```
    if (line.trim().startsWith('```')) {
      const lang = line.trim().replace(/^```/, '').trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith('```')) {
        i++; // skip closing ```
      }
      nodes.push(<CodeBlock key={key++} code={codeLines.join('\n')} lang={lang} />);
      continue;
    }

    // Headings
    const hm = line.match(/^(#{1,3})\s+(.+)/);
    if (hm) {
      const level = hm[1].length;
      const sz = level === 1 ? '19px' : level === 2 ? '17px' : '15px';
      nodes.push(
        <div key={key++} style={{
          fontSize: sz,
          fontWeight: 700,
          color: '#0f172a',
          margin: '14px 0 6px',
          letterSpacing: '-0.3px',
          lineHeight: 1.4
        }}>
          {inline(hm[2])}
        </div>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      nodes.push(
        <hr key={key++} style={{
          border: 'none',
          borderTop: '1px solid #e2e8f0',
          margin: '14px 0'
        }} />
      );
      i++;
      continue;
    }

    // Tables
    if (line.includes('|') && lines[i + 1]?.includes('---')) {
      const headers = line.split('|').filter(Boolean).map(h => h.trim());
      i += 2; // skip separator row
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(lines[i].split('|').filter(Boolean).map(c => c.trim()));
        i++;
      }
      nodes.push(
        <div key={key++} style={{
          overflowX: 'auto',
          margin: '14px 0',
          borderRadius: 8,
          border: '1px solid #e2e8f0'
        }}>
          <table style={{
            borderCollapse: 'collapse',
            width: '100%',
            fontSize: 13.5,
            textAlign: 'left'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {headers.map((h, hi) => (
                  <th key={hi} style={{
                    padding: '8px 14px',
                    fontWeight: 700,
                    color: '#1e293b'
                  }}>
                    {inline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{
                  borderBottom: ri === rows.length - 1 ? 'none' : '1px solid #f1f5f9',
                  backgroundColor: ri % 2 === 0 ? '#ffffff' : '#fafafa'
                }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '8px 14px', color: '#334155' }}>
                      {inline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Bullet lists
    if (/^[\-\*]\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[\-\*]\s/.test(lines[i])) {
        items.push(
          <li key={key++} style={{ marginBottom: 4 }}>
            {inline(lines[i].replace(/^[\-\*]\s/, ''))}
          </li>
        );
        i++;
      }
      nodes.push(
        <ul key={key++} style={{
          margin: '6px 0 10px 0',
          paddingLeft: 22,
          lineHeight: 1.7,
          color: '#1e293b'
        }}>
          {items}
        </ul>
      );
      continue;
    }

    // Numbered lists
    if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(
          <li key={key++} style={{ marginBottom: 4 }}>
            {inline(lines[i].replace(/^\d+\.\s/, ''))}
          </li>
        );
        i++;
      }
      nodes.push(
        <ol key={key++} style={{
          margin: '6px 0 10px 0',
          paddingLeft: 22,
          lineHeight: 1.7,
          color: '#1e293b'
        }}>
          {items}
        </ol>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      nodes.push(
        <blockquote key={key++} style={{
          borderLeft: '3px solid #ff6b00',
          paddingLeft: 12,
          margin: '8px 0',
          color: '#475569',
          fontStyle: 'italic',
          backgroundColor: '#fffaf5',
          padding: '6px 12px',
          borderRadius: '0 6px 6px 0'
        }}>
          {inline(line.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // Regular paragraph
    nodes.push(
      <p key={key++} style={{ margin: '0 0 8px', lineHeight: 1.72, color: '#1e293b' }}>
        {inline(line)}
      </p>
    );
    i++;
  }

  return nodes;
}

/* ──────────────────────────────────────────────
   ChatGPT-Style Streaming Cursor
────────────────────────────────────────────── */
function StreamingCursor() {
  return (
    <span style={{
      display: 'inline-block',
      width: '7px',
      height: '15px',
      backgroundColor: '#0f172a',
      marginLeft: '3px',
      borderRadius: '1px',
      verticalAlign: 'baseline',
      animation: 'chatgptBlink 0.9s infinite'
    }} />
  );
}

/* ──────────────────────────────────────────────
   Action Buttons for Assistant Responses
────────────────────────────────────────────── */
function MessageActions({
  text,
  sources,
  timestamp,
  onRegenerate
}: {
  text: string;
  sources?: string[];
  timestamp?: string;
  onRegenerate?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      paddingTop: 4,
      fontSize: 12,
      color: '#64748b'
    }}>
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        title="Copy response"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 7px',
          borderRadius: 6,
          color: copied ? '#10b981' : '#64748b',
          transition: 'all 0.15s'
        }}
        className="chatgpt-action-btn"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        <span style={{ fontSize: 11, fontWeight: 500 }}>{copied ? 'Copied' : ''}</span>
      </button>

      {/* Thumbs Feedback */}
      <button
        onClick={() => setFeedback(prev => prev === 'up' ? null : 'up')}
        title="Good response"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 6px',
          borderRadius: 6,
          color: feedback === 'up' ? '#ff6b00' : '#64748b'
        }}
        className="chatgpt-action-btn"
      >
        <ThumbsUp size={14} />
      </button>

      <button
        onClick={() => setFeedback(prev => prev === 'down' ? null : 'down')}
        title="Bad response"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 6px',
          borderRadius: 6,
          color: feedback === 'down' ? '#ef4444' : '#64748b'
        }}
        className="chatgpt-action-btn"
      >
        <ThumbsDown size={14} />
      </button>

      {/* Regenerate */}
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          title="Regenerate response"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 6px',
            borderRadius: 6,
            color: '#64748b'
          }}
          className="chatgpt-action-btn"
        >
          <RefreshCw size={13} />
        </button>
      )}

      {/* Sources badge */}
      {sources && sources.length > 0 && (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          {sources.map((src, i) => (
            <span
              key={i}
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 999,
                backgroundColor: src.includes('Gemini') ? '#eff6ff' : '#f8fafc',
                color: src.includes('Gemini') ? '#2563eb' : '#475569',
                border: `1px solid ${src.includes('Gemini') ? '#bfdbfe' : '#e2e8f0'}`,
                fontWeight: 600,
                letterSpacing: '0.2px'
              }}
            >
              {src}
            </span>
          ))}
          {timestamp && (
            <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>{timestamp}</span>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   ChatGPT-Style Starter Prompt Cards (2x2 Grid)
────────────────────────────────────────────── */
const STARTER_PROMPTS = [
  {
    icon: <TrendingUp size={18} color="#ff6b00" />,
    title: 'Analyze Profit Margins',
    desc: 'What is our current gross income, net profit, and margin percentage?',
    prompt: 'What is our current gross income, net profit, and profit margin?'
  },
  {
    icon: <Receipt size={18} color="#0284c7" />,
    title: 'Top Expense Audit',
    desc: 'Break down our largest spending categories and identify cost drivers.',
    prompt: 'What are our top expense categories and largest transactions?'
  },
  {
    icon: <DollarSign size={18} color="#10b981" />,
    title: 'Cash Runway & Burn',
    desc: 'Estimate our remaining runway in months based on monthly burn rate.',
    prompt: 'How much cash runway do we have and what is our estimated monthly burn?'
  },
  {
    icon: <ShieldCheck size={18} color="#8b5cf6" />,
    title: 'Quarterly Tax Reserve',
    desc: 'Calculate recommended tax withholdings to avoid cash crunches.',
    prompt: 'Give me tax planning advice and how much reserve to set aside.'
  }
];

const SUGGESTED_PILLS = [
  'What is my net profit?',
  'What are my top expenses?',
  'How much cash runway do I have?',
  'Give me tax planning advice.',
  'How can I improve profitability?',
  'Summarize our financial health.'
];

/* ──────────────────────────────────────────────
   Main ChatInterface (Full ChatGPT Experience)
────────────────────────────────────────────── */
export function ChatInterface() {
  const {
    currentClient, conversations, activeConversationId, setActiveConversationId,
    createNewConversation, sendChatMessage, deleteConversation, renameConversation,
    stopStreaming, isAiTyping, streamingMessageId,
  } = useFinancialData();

  const [inputVal, setInputVal] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hoveredConvId, setHoveredConvId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fallbackConv = { id: '', title: 'New Conversation', createdAt: 'Just now', messages: [] as any[] };
  const activeConv = conversations.length > 0
    ? (conversations.find(c => c.id === activeConversationId) || conversations[0])
    : fallbackConv;

  const messages = activeConv?.messages || [];

  // Scroll to bottom smoothly on new message or streaming update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isAiTyping]);

  // Auto-resize textarea like ChatGPT
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputVal]);

  const handleSend = useCallback((textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isAiTyping) return;
    setInputVal('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    sendChatMessage(text);
  }, [inputVal, isAiTyping, sendChatMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRegenerate = () => {
    const lastUser = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUser && !isAiTyping) {
      sendChatMessage(lastUser.text);
    }
  };

  const startRename = (conv: any) => {
    setRenamingId(conv.id);
    setRenameVal(conv.title);
  };

  const confirmRename = (convId: string) => {
    if (renameVal.trim()) renameConversation(convId, renameVal.trim());
    setRenamingId(null);
  };

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 140px)',
      minHeight: 680,
      backgroundColor: '#ffffff',
      borderRadius: 20,
      border: '1px solid #e2e8f0',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
      position: 'relative'
    }}>

      {/* ──────────────────────────────────────────────
          1. CHATGPT-STYLE SIDEBAR
      ────────────────────────────────────────────── */}
      <div style={{
        width: sidebarOpen ? 260 : 0,
        minWidth: sidebarOpen ? 260 : 0,
        backgroundColor: '#f8fafc',
        borderRight: sidebarOpen ? '1px solid #e2e8f0' : 'none',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        zIndex: 10
      }}>
        <div style={{ padding: '16px 14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* New Chat Button */}
          <button
            onClick={createNewConversation}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '10px 14px',
              borderRadius: 12,
              backgroundColor: '#ffffff',
              border: '1.5px solid #e2e8f0',
              color: '#0f172a',
              fontSize: 13.5,
              fontWeight: 600,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            className="chatgpt-sidebar-new-btn"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} color="#ff6b00" />
              <span>New chat</span>
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Ctrl+K</span>
          </button>

          {/* Section Header */}
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: '#94a3b8',
            padding: '8px 6px 2px'
          }}>
            Recent Chats
          </div>
        </div>

        {/* Conversation List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '24px 8px', fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
              No chats yet. Start a new session!
            </div>
          ) : (
            conversations.map(conv => {
              const isActive = conv.id === activeConversationId;
              const isHovered = hoveredConvId === conv.id;
              const isRenaming = renamingId === conv.id;

              return (
                <div
                  key={conv.id}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setHoveredConvId(conv.id)}
                  onMouseLeave={() => setHoveredConvId(null)}
                >
                  {isRenaming ? (
                    <div style={{ display: 'flex', gap: 4, padding: '6px 8px' }}>
                      <input
                        autoFocus
                        value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') confirmRename(conv.id);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        style={{
                          flex: 1,
                          fontSize: 12.5,
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1.5px solid #ff6b00',
                          outline: 'none',
                          backgroundColor: '#fff'
                        }}
                      />
                      <button
                        onClick={() => confirmRename(conv.id)}
                        style={{
                          padding: '4px 6px',
                          borderRadius: 6,
                          backgroundColor: '#ff6b00',
                          border: 'none',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        <Check size={12} />
                      </button>
                      <button
                        onClick={() => setRenamingId(null)}
                        style={{
                          padding: '4px 6px',
                          borderRadius: 6,
                          backgroundColor: '#e2e8f0',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveConversationId(conv.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 12px',
                        paddingRight: isHovered ? 52 : 12,
                        borderRadius: 10,
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        backgroundColor: isActive ? '#f1f5f9' : isHovered ? '#f1f5f988' : 'transparent',
                        color: isActive ? '#0f172a' : '#475569',
                        fontWeight: isActive ? 600 : 500,
                        fontSize: 13,
                        transition: 'all 0.12s'
                      }}
                    >
                      <MessageSquare
                        size={15}
                        color={isActive ? '#0f172a' : '#94a3b8'}
                        style={{ flexShrink: 0 }}
                      />
                      <span style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1
                      }}>
                        {conv.title}
                      </span>
                    </button>
                  )}

                  {/* Actions on hover */}
                  {isHovered && !isRenaming && (
                    <div style={{
                      position: 'absolute',
                      right: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      gap: 2
                    }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); startRename(conv); }}
                        title="Rename"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          color: '#64748b',
                          cursor: 'pointer'
                        }}
                        className="chatgpt-sidebar-icon-btn"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this conversation?')) deleteConversation(conv.id);
                        }}
                        title="Delete"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                        className="chatgpt-sidebar-icon-btn"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#0f172a',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700
          }}>
            {(currentClient.companyName || 'FP').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentClient.companyName || 'Finlytics Client'}
            </div>
            <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span>Ledger Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────
          2. MAIN CHAT AREA (CHATGPT CANVAS)
      ────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        position: 'relative',
        minWidth: 0
      }}>

        {/* Top bar hidden as requested */}

        {/* ──────────────────────────────────────────────
            3. CONVERSATION CANVAS (MESSAGES)
        ────────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px 140px 20px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {messages.length === 0 ? (
            /* ── CHATGPT EMPTY STATE ── */
            <div style={{
              maxWidth: 760,
              width: '100%',
              margin: 'auto',
              textAlign: 'center',
              padding: '20px 0 40px'
            }}>
              {/* Emblem */}
              <div style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#ff6b00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}>
                <Sparkles size={28} />
              </div>

              <h2 style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.6px',
                marginBottom: 8
              }}>
                What can I help you analyze today?
              </h2>

              <p style={{
                fontSize: 14.5,
                color: '#64748b',
                maxWidth: 520,
                margin: '0 auto 32px',
                lineHeight: 1.6
              }}>
                Finlytics AI is directly connected to your authenticated business ledger records.
              </p>

              {/* 2x2 Starter Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 12,
                textAlign: 'left'
              }}>
                {STARTER_PROMPTS.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(card.prompt)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      padding: '16px 18px',
                      borderRadius: 16,
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                    className="chatgpt-prompt-card"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #f1f5f9'
                      }}>
                        {card.icon}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                        {card.title}
                      </span>
                    </div>
                    <span style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5 }}>
                      {card.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── CHATGPT MESSAGE THREAD (CENTERED) ── */
            <div style={{
              maxWidth: 780,
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 28
            }}>
              {messages.map(msg => {
                const isUser = msg.sender === 'user';
                const isStreaming = msg.id === streamingMessageId;

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}
                  >
                    {/* USER MESSAGE: Modern sleek rounded bubble on right */}
                    {isUser ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '80%' }}>
                        <div style={{
                          padding: '12px 18px',
                          borderRadius: '22px 22px 6px 22px',
                          backgroundColor: '#f1f5f9',
                          color: '#0f172a',
                          fontSize: 15,
                          lineHeight: 1.6,
                          fontWeight: 500,
                          border: '1px solid #e2e8f0',
                          wordBreak: 'break-word',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}>
                          {msg.text}
                        </div>
                        {msg.timestamp && (
                          <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, marginRight: 6 }}>
                            {msg.timestamp}
                          </span>
                        )}
                      </div>
                    ) : (
                      /* ASSISTANT MESSAGE: Open canvas, iconic avatar, flawless typography */
                      <div style={{
                        display: 'flex',
                        gap: 16,
                        width: '100%',
                        alignItems: 'flex-start'
                      }}>
                        {/* Assistant Avatar */}
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                          color: '#ff6b00',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          <Sparkles size={16} />
                        </div>

                        {/* Message Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 15,
                            lineHeight: 1.72,
                            color: '#0f172a',
                            wordBreak: 'break-word'
                          }}>
                            {msg.text ? renderMarkdown(msg.text) : null}
                            {isStreaming && <StreamingCursor />}
                          </div>

                          {/* Message Actions (Copy, Regenerate, Sources) */}
                          {!isStreaming && msg.text && (
                            <MessageActions
                              text={msg.text}
                              sources={msg.sources || ['Gemini 3.8 Flash', 'Verified Ledger']}
                              timestamp={msg.timestamp}
                              onRegenerate={handleRegenerate}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing state before streaming starts */}
              {isAiTyping && !streamingMessageId && (
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: '#ff6b00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Sparkles size={16} />
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#64748b',
                    fontSize: 14
                  }}>
                    <span>Thinking</span>
                    <span style={{ display: 'inline-flex', gap: 4 }}>
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            backgroundColor: '#ff6b00',
                            animation: `chatgptDot 1.4s infinite ease-in-out ${i * 0.2}s`
                          }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ──────────────────────────────────────────────
            4. SIGNATURE CHATGPT FLOATING INPUT CAPSULE
        ────────────────────────────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(255,255,255,1) 75%, rgba(255,255,255,0) 100%)',
          padding: '16px 20px 14px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            maxWidth: 780,
            width: '100%',
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>

            {/* Quick Suggestions Pills (Scrollable above capsule) */}
            {messages.length > 0 && (
              <div style={{
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                paddingBottom: 2,
                scrollbarWidth: 'none'
              }}>
                {SUGGESTED_PILLS.map((pill, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(pill)}
                    disabled={isAiTyping}
                    style={{
                      fontSize: 12,
                      padding: '5px 12px',
                      borderRadius: 999,
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      cursor: isAiTyping ? 'not-allowed' : 'pointer',
                      opacity: isAiTyping ? 0.6 : 1,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s'
                    }}
                    className="chatgpt-pill-btn"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            )}

            {/* Floating Input Capsule */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 10,
              backgroundColor: '#ffffff',
              borderRadius: 24,
              border: '1.5px solid #e2e8f0',
              padding: '10px 12px 10px 18px',
              boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            className="chatgpt-input-capsule"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                id="chat-input"
                placeholder="Ask anything about your finances... (Shift + Enter for new line)"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAiTyping}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  backgroundColor: 'transparent',
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  color: '#0f172a',
                  maxHeight: 160,
                  fontFamily: 'inherit',
                  padding: '2px 0'
                }}
              />

              {/* Stop Streaming OR Circular Send Arrow Button */}
              {isAiTyping ? (
                <button
                  onClick={stopStreaming}
                  title="Stop generating"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'transform 0.15s'
                  }}
                  className="chatgpt-send-btn"
                >
                  <Square size={14} fill="#fff" />
                </button>
              ) : (
                <button
                  id="chat-send-btn"
                  onClick={() => handleSend()}
                  disabled={!inputVal.trim()}
                  title="Send message"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: inputVal.trim() ? '#0f172a' : '#f1f5f9',
                    color: inputVal.trim() ? '#ffffff' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: inputVal.trim() ? 'pointer' : 'default',
                    flexShrink: 0,
                    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: inputVal.trim() ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                  }}
                  className={inputVal.trim() ? 'chatgpt-send-btn active' : ''}
                >
                  <ArrowUp size={18} strokeWidth={2.6} />
                </button>
              )}
            </div>

            {/* Disclaimer under input */}
            <div style={{
              fontSize: 11.5,
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: 1.4
            }}>
              Finlytics AI is grounded in verified ledger data. For critical tax and accounting decisions, always confirm with your CPA.
            </div>
          </div>
        </div>
      </div>

      {/* Global Embedded Styles for Authentic ChatGPT Polish */}
      <style>{`
        @keyframes chatgptBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes chatgptDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        .chatgpt-input-capsule:focus-within {
          border-color: #0f172a !important;
          box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12) !important;
        }
        .chatgpt-prompt-card:hover {
          border-color: #ff6b00 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 107, 0, 0.08) !important;
        }
        .chatgpt-pill-btn:hover {
          border-color: #ff6b00 !important;
          color: #ff6b00 !important;
          background-color: #fff7ed !important;
        }
        .chatgpt-action-btn:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }
        .chatgpt-sidebar-new-btn:hover {
          border-color: #ff6b00 !important;
          background-color: #fffaf5 !important;
        }
        .chatgpt-sidebar-icon-btn:hover {
          background-color: #e2e8f0;
        }
        .chatgpt-send-btn.active:hover {
          transform: scale(1.06);
          background-color: #ff6b00 !important;
        }
      `}</style>
    </div>
  );
}
