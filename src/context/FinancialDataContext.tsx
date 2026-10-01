'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ClientProfile,
  Transaction,
  MonthlyBarData,
  ExpenseCategory,
  AIInsight,
  HealthScore,
  UploadedDocument,
  FinancialReport,
  ChatConversation,
} from '@/types/finance';

const API_BASE = 'http://localhost:8000/api';

const EMPTY_CLIENT: ClientProfile = {
  id: '',
  name: '',
  email: '',
  companyName: '',
  isFirstTimeLogin: false,
  industry: '',
  fiscalStartMonth: 'January',
  currency: 'USD ($)',
  currentPlan: 'Monthly Plan',
  planPrice: '$50/mo',
  renewalDate: 'Oct 1, 2026',
  role: 'client',
  notifications: {
    monthlyReportReady: true,
    cashFlowAlert: true,
    overdueInvoiceReminder: false,
    weeklySummary: false,
  },
};

interface FinancialDataContextType {
  currentClient: ClientProfile;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; isFirstTime?: boolean; role?: string; error?: string }>;
  logout: () => void;
  completeFirstTimePasswordChange: (newPassword: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPasswordWithToken: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateClientProfile: (updates: Partial<ClientProfile>) => Promise<void>;
  updateNotifications: (notifications: Record<string, boolean>) => Promise<void>;
  updateSubscriptionPlan: (planName: string, planPrice: string, renewalDate: string) => Promise<void>;

  metrics: {
    revenue: { value: string; num: number; trend: string; isUp: boolean; percentageGoal: number };
    expenses: { value: string; num: number; trend: string; isUp: boolean; percentageGoal: number };
    netProfit: { value: string; num: number; trend: string; isUp: boolean; percentageGoal: number };
    cashBalance: { value: string; num: number; trend: string; isUp: boolean; percentageGoal: number };
  };
  monthlyBars: MonthlyBarData[];
  expenseBreakdown: ExpenseCategory[];
  recentTransactions: Transaction[];
  allTransactions: Transaction[];
  aiInsights: AIInsight[];
  healthScore: HealthScore | null;

  documents: UploadedDocument[];
  addDocument: (fileObj: File, docType: string) => Promise<{ success: boolean; count?: number; error?: string }>;
  retryDocument: (docId: string) => void;

  approvedReports: FinancialReport[];
  getReportById: (id: string) => FinancialReport | undefined;
  updateActionItemStatus: (reportId: string, actionId: string, status: 'done' | 'dismissed') => Promise<void>;

  conversations: ChatConversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  createNewConversation: () => void;
  sendChatMessage: (messageText: string) => Promise<void>;
  deleteConversation: (convId: string) => Promise<void>;
  renameConversation: (convId: string, title: string) => Promise<void>;
  stopStreaming: () => void;
  isAiTyping: boolean;
  streamingMessageId: string | null;

  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  refreshAllData: () => Promise<void>;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialDataProvider({ children }: { children: React.ReactNode }) {
  const [currentClient, setCurrentClient] = useState<ClientProfile>(EMPTY_CLIENT);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [metrics, setMetrics] = useState({
    revenue:     { value: '$0', num: 0, trend: '0%', isUp: false, percentageGoal: 0 },
    expenses:    { value: '$0', num: 0, trend: '0%', isUp: false, percentageGoal: 0 },
    netProfit:   { value: '$0', num: 0, trend: '0%', isUp: false, percentageGoal: 0 },
    cashBalance: { value: '$0', num: 0, trend: '0%', isUp: false, percentageGoal: 0 },
  });
  const [monthlyBars, setMonthlyBars] = useState<MonthlyBarData[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseCategory[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);

  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Restore token from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('Finlytics AI_token') || localStorage.getItem('finlytics_token');
      const savedUser = localStorage.getItem('Finlytics AI_user') || localStorage.getItem('finlytics_user');
      if (savedToken && savedUser) {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setCurrentClient(parsed);
        setIsAuthenticated(true);
        if (parsed.role === 'admin') {
          localStorage.setItem('Finlytics AI_admin_token', savedToken);
          localStorage.setItem('Finlytics AI_admin_user', JSON.stringify(parsed));
          localStorage.setItem('finlytics_admin_token', savedToken);
          localStorage.setItem('finlytics_admin_user', JSON.stringify(parsed));
        }
        refreshDashboardData(savedToken);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const refreshDashboardData = async (authToken: string) => {
    if (!authToken) return;
    const headers = { Authorization: `Bearer ${authToken}` };

    try {
      // 1. Dashboard Overview
      const dashRes = await fetch(`${API_BASE}/dashboard/overview`, { headers });
      if (dashRes.ok) {
        const data = await dashRes.json();
        if (data.hasData) {
          setMetrics(data.metrics);
          setMonthlyBars(data.monthlyBars || []);
          setExpenseBreakdown(data.expenseBreakdown || []);
          setRecentTransactions(data.recentTransactions || []);
          setAiInsights(data.aiInsights || []);
          setHealthScore(data.healthScore || null);
        }
      }

      // 2. Documents
      const docsRes = await fetch(`${API_BASE}/documents`, { headers });
      if (docsRes.ok) {
        const docsList = await docsRes.json();
        setDocuments(
          docsList.map((d: any) => ({
            id: d.id,
            fileName: d.name,
            documentType: d.type,
            date: d.date,
            status: d.status,
            extractedCount: d.transaction_count,
            extractedTransactions: [],
          }))
        );
      }

      // 3. Transactions
      const txRes = await fetch(`${API_BASE}/transactions`, { headers });
      if (txRes.ok) {
        const txData = await txRes.json();
        setAllTransactions(
          (txData.transactions || []).map((t: any) => ({
            id: t.id,
            date: t.date,
            description: t.description,
            category: t.category,
            amount: t.amount,
            type: t.type,
            sourceDocName: t.source_document,
          }))
        );
      }

      // 4. Approved Reports
      const repRes = await fetch(`${API_BASE}/reports`, { headers });
      if (repRes.ok) {
        const repList = await repRes.json();
        const parseNum = (val: any): number => {
          if (typeof val === 'number') return isNaN(val) ? 0 : val;
          if (!val) return 0;
          const match = String(val).match(/-?[\d,]+(\.\d+)?/);
          if (!match) return 0;
          const n = parseFloat(match[0].replace(/,/g, ''));
          return isNaN(n) ? 0 : n;
        };

        const detailedReports = await Promise.all(
          repList.map(async (r: any) => {
            const dRes = await fetch(`${API_BASE}/reports/${r.id}`, { headers });
            if (dRes.ok) {
              const full = await dRes.json();
              const revStreams = full.pl_statement?.revenueStreams || full.pl_statement?.revenue_streams || [];
              const expCategories = full.pl_statement?.expenseCategories || full.pl_statement?.expense_categories || [];
              const calcRev = full.pl_statement?.totalRevenue || revStreams.reduce((acc: number, cur: any) => acc + (Number(cur.amount) || 0), 0);
              const calcExp = full.pl_statement?.totalExpenses || expCategories.reduce((acc: number, cur: any) => acc + (Number(cur.amount) || 0), 0);
              const calcNet = full.pl_statement?.netIncome !== undefined ? full.pl_statement?.netIncome : (calcRev - calcExp);

              const revVal = typeof full.summary_metrics?.revenue === 'object' ? full.summary_metrics?.revenue?.value : (full.summary_metrics?.revenue || '$0');
              const expVal = typeof full.summary_metrics?.expenses === 'object' ? full.summary_metrics?.expenses?.value : (full.summary_metrics?.expenses || '$0');
              const netVal = typeof full.summary_metrics?.net_profit === 'object' ? full.summary_metrics?.net_profit?.value : (full.summary_metrics?.net_profit || '$0');
              const cashVal = typeof full.summary_metrics?.cash_flow === 'object' ? full.summary_metrics?.cash_flow?.value : (full.summary_metrics?.cash_flow || '$0');

              const revNum = calcRev || parseNum(revVal);
              const expNum = calcExp || parseNum(expVal);
              const netNum = calcNet !== undefined ? calcNet : (revNum - expNum);
              const cashNum = Number(full.cash_flow?.endingCashBalance) || Number(full.cash_flow?.endingCash) || parseNum(cashVal);

              const revChange = parseNum(full.summary_metrics?.revenue?.change ?? full.summary_metrics?.revenue_change);
              const expChange = parseNum(full.summary_metrics?.expenses?.change ?? full.summary_metrics?.expenses_change);
              const profitChange = parseNum(full.summary_metrics?.net_profit?.change ?? full.summary_metrics?.net_profit_change);
              const cashChange = parseNum(full.summary_metrics?.cash_flow?.change ?? full.summary_metrics?.cash_flow_change);

              const catPalette = ['#35577D', '#487EB0', '#679436', '#E1B12C', '#E84118', '#8c7ae6', '#00a8ff'];
              const expenseBreakdown = expCategories.map((cat: any, idx: number) => {
                const amt = Number(cat.amount) || 0;
                const pct = expNum > 0 ? Math.round((amt / expNum) * 100) : 0;
                return {
                  name: cat.name || 'Expense',
                  amount: amt,
                  percentage: pct,
                  color: catPalette[idx % catPalette.length],
                  changeVsLastMonth: 0,
                };
              });

              return {
                id: full.id,
                month: full.month,
                year: full.year,
                publishedDate: full.date_generated || 'Recent',
                dateGenerated: full.date_generated,
                isApproved: full.is_approved,
                approvedBy: full.approved_by,
                revenue: revNum,
                expenses: expNum,
                netProfit: netNum,
                cashBalance: cashNum,
                revChangePercent: revChange,
                expChangePercent: expChange,
                profitChangePercent: profitChange,
                cashChangePercent: cashChange,
                summaryMetrics: {
                  revenue: revVal,
                  revenueChangePct: revChange,
                  expenses: expVal,
                  expensesChangePct: expChange,
                  netProfit: netVal,
                  netProfitChangePct: profitChange,
                  cashFlow: cashVal,
                  cashFlowChangePct: cashChange,
                },
                plStatement: {
                  revenueSources: revStreams.map((s: any) => ({ name: s.name, amount: Number(s.amount) || 0 })),
                  revenueStreams: revStreams,
                  totalRevenue: revNum,
                  expenseCategories: expCategories.map((c: any) => ({ name: c.name, amount: Number(c.amount) || 0 })),
                  totalExpenses: expNum,
                  netIncome: netNum,
                },
                cashFlow: {
                  moneyIn: Number(full.cash_flow?.moneyIn) || 0,
                  moneyOut: Number(full.cash_flow?.moneyOut) || 0,
                  netMovement: Number(full.cash_flow?.netChange ?? (Number(full.cash_flow?.moneyIn || 0) - Number(full.cash_flow?.moneyOut || 0))),
                  endingCash: cashNum,
                },
                expenseBreakdown,
                growthAnalysis: full.growth_analysis || '',
                actionPlan: (full.action_plan || []).map((a: any) => ({
                  id: a.id,
                  title: a.title,
                  explanation: a.description,
                  estimatedImpact: a.impact,
                  status: a.status || 'active',
                })),
              };
            }

            const revFallback = parseNum(typeof r.summary_metrics?.revenue === 'object' ? r.summary_metrics?.revenue?.value : r.summary_metrics?.revenue);
            const expFallback = parseNum(typeof r.summary_metrics?.expenses === 'object' ? r.summary_metrics?.expenses?.value : r.summary_metrics?.expenses);
            const netFallback = parseNum(typeof r.summary_metrics?.net_profit === 'object' ? r.summary_metrics?.net_profit?.value : r.summary_metrics?.net_profit);
            const cashFallback = parseNum(typeof r.summary_metrics?.cash_flow === 'object' ? r.summary_metrics?.cash_flow?.value : r.summary_metrics?.cash_flow);

            return {
              ...r,
              revenue: revFallback,
              expenses: expFallback,
              netProfit: netFallback,
              cashBalance: cashFallback,
              publishedDate: r.date_generated || 'Recent',
              revChangePercent: 0,
              expChangePercent: 0,
              profitChangePercent: 0,
              cashChangePercent: 0,
              plStatement: { revenueSources: [], expenseCategories: [], totalRevenue: revFallback, totalExpenses: expFallback, netIncome: netFallback },
              cashFlow: { moneyIn: 0, moneyOut: 0, netMovement: 0, endingCash: cashFallback },
              expenseBreakdown: [],
              growthAnalysis: '',
              actionPlan: [],
            };
          })
        );
        setReports(detailedReports);
      }

      // 5. Chat History
      const chatRes = await fetch(`${API_BASE}/chat/conversations`, { headers });
      if (chatRes.ok) {
        const convList = await chatRes.json();
        setConversations(
          convList.map((c: any) => ({
            id: c.id,
            title: c.title,
            createdAt: c.created_at,
            messages: (c.messages || []).map((m: any) => ({
              id: m.id,
              sender: m.sender,
              text: m.text,
              timestamp: m.timestamp,
              sources: m.sources || [],
            })),
          }))
        );
        if (convList.length > 0) {
          setActiveConversationId(convList[0].id);
        }
      }

      // 6. User Profile
      const profRes = await fetch(`${API_BASE}/settings/profile`, { headers });
      if (profRes.ok) {
        const prof = await profRes.json();
        setCurrentClient((prev) => ({
          ...prev,
          id: prof.id,
          email: prof.email,
          name: prof.name,
          companyName: prof.company_name,
          industry: prof.industry,
          fiscalStartMonth: prof.fiscal_start_month,
          currency: prof.currency,
          currentPlan: prof.current_plan,
          planPrice: prof.plan_price,
          renewalDate: prof.renewal_date,
          notifications: prof.notifications || prev.notifications,
        }));
      }
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.detail || 'Invalid email or password.' };
      }

      const data = await res.json();
      const userProfile: ClientProfile = {
        ...EMPTY_CLIENT,
        ...data.user,
        role: data.user?.role || 'client',
      };

      setToken(data.access_token);
      setCurrentClient(userProfile);
      setIsAuthenticated(true);

      // Save to localStorage for browser persistence
      try {
        localStorage.setItem('Finlytics AI_token', data.access_token);
        localStorage.setItem('Finlytics AI_user', JSON.stringify(userProfile));
        localStorage.setItem('finlytics_token', data.access_token);
        localStorage.setItem('finlytics_user', JSON.stringify(userProfile));

        if (data.user?.role === 'admin') {
          localStorage.setItem('Finlytics AI_admin_token', data.access_token);
          localStorage.setItem('Finlytics AI_admin_user', JSON.stringify(userProfile));
          localStorage.setItem('finlytics_admin_token', data.access_token);
          localStorage.setItem('finlytics_admin_user', JSON.stringify(userProfile));
        }
      } catch (e) {}

      // Fetch all PostgreSQL data
      await refreshDashboardData(data.access_token);

      return { success: true, isFirstTime: data.is_first_time_login, role: data.user?.role };
    } catch (err) {
      return { success: false, error: 'Could not connect to FastAPI server (http://127.0.0.1:8000). Ensure backend is running.' };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('Finlytics AI_token');
      localStorage.removeItem('Finlytics AI_user');
      localStorage.removeItem('finlytics_token');
      localStorage.removeItem('finlytics_user');
    } catch (e) {}
    setToken(null);
    setCurrentClient(EMPTY_CLIENT);
    setIsAuthenticated(false);
    setAllTransactions([]);
    setDocuments([]);
    setReports([]);
    setConversations([]);
    setActiveConversationId('');
  };

  const completeFirstTimePasswordChange = async (newPassword: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_password: newPassword }),
      });
      if (res.ok) {
        setCurrentClient((prev) => ({ ...prev, isFirstTimeLogin: false }));
        try {
          const stored = localStorage.getItem('Finlytics AI_user') || localStorage.getItem('finlytics_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.isFirstTimeLogin = false;
            localStorage.setItem('Finlytics AI_user', JSON.stringify(parsed));
            localStorage.setItem('finlytics_user', JSON.stringify(parsed));
          }
        } catch (e) {}
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, message: data.detail || 'Failed to dispatch reset email.' };
      }
      return { success: true, message: data.message || 'If an account exists, a reset link has been dispatched.' };
    } catch (e) {
      return { success: false, message: 'Could not connect to authentication server. Please verify backend is running.' };
    }
  };

  const resetPasswordWithToken = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), new_password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, message: data.detail || 'Password reset failed. Link may have expired.' };
      }
      return { success: true, message: data.message || 'Your password has been successfully reset.' };
    } catch (e) {
      return { success: false, message: 'Could not connect to authentication server. Please verify backend is running.' };
    }
  };

  const updateClientProfile = async (updates: Partial<ClientProfile>) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/settings/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company_name: updates.companyName || currentClient.companyName,
          industry: updates.industry || currentClient.industry,
          fiscal_start_month: updates.fiscalStartMonth || currentClient.fiscalStartMonth,
          currency: updates.currency || currentClient.currency,
        }),
      });
      if (res.ok) {
        const prof = await res.json();
        setCurrentClient((prev) => ({ ...prev, ...updates, companyName: prof.company_name }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateNotifications = async (notifications: Record<string, boolean>) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/settings/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notifications),
      });
    } catch (e) {}
  };

  const updateSubscriptionPlan = async (planName: string, planPrice: string, renewalDate: string) => {
    setCurrentClient((prev) => ({
      ...prev,
      currentPlan: planName,
      planPrice: planPrice,
      renewalDate: renewalDate,
    }));
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/settings/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_plan: planName,
          plan_price: planPrice,
          renewal_date: renewalDate,
        }),
      });
      if (res.ok) {
        const prof = await res.json();
        setCurrentClient((prev) => ({
          ...prev,
          currentPlan: prof.current_plan,
          planPrice: prof.plan_price,
          renewalDate: prof.renewal_date,
        }));
      }
    } catch (e) {
      console.error('Failed to update subscription plan:', e);
    }
  };

  // Upload file to FastAPI PostgreSQL backend
  const addDocument = async (
    fileObj: File,
    docType: string
  ): Promise<{ success: boolean; count?: number; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const formData = new FormData();
    formData.append('file', fileObj);
    formData.append('document_type', docType);

    try {
      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.detail || 'Upload failed' };
      }

      const data = await res.json();
      // Refresh all state from PostgreSQL
      await refreshDashboardData(token);
      return { success: true, count: data.extracted_transactions_count };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during upload' };
    }
  };

  const retryDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: 'Processing' } : d))
    );
  };

  const approvedReports = reports.filter((r) => r.isApproved);
  const getReportById = (id: string) => approvedReports.find((r) => r.id === id);

  const updateActionItemStatus = async (reportId: string, actionId: string, status: 'done' | 'dismissed') => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/reports/${reportId}/actions/${actionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      setReports((prev) =>
        prev.map((rep) =>
          rep.id === reportId
            ? {
                ...rep,
                actionPlan: rep.actionPlan.map((item) =>
                  item.id === actionId ? { ...item, status } : item
                ),
              }
            : rep
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const createNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: ChatConversation = {
      id: newId,
      title: 'New Conversation',
      createdAt: 'Just now',
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAiTyping(false);
    setStreamingMessageId(null);
  };

  const sendChatMessage = async (messageText: string) => {
    if (!messageText.trim() || !token) return;

    setIsAiTyping(true);
    setStreamingMessageId(null);

    // Create an abort controller for stop-streaming support
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: activeConversationId || undefined,
          message: messageText,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error('Stream request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let convId = activeConversationId;
      let aiMsgId = '';
      let streamingText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const evt = JSON.parse(raw);

            if (evt.type === 'meta') {
              convId = evt.conversation_id;
              aiMsgId = evt.ai_message_id;
              setActiveConversationId(convId);
              setStreamingMessageId(aiMsgId);

              // Add user message + placeholder AI message immediately
              const userMsg = evt.user_message;
              const placeholderAI = { id: aiMsgId, sender: 'ai', text: '', sources: [], timestamp: '' };
              setConversations((prev) => {
                const exists = prev.find((c) => c.id === convId);
                if (exists) {
                  return prev.map((c) =>
                    c.id === convId
                      ? { ...c, messages: [...c.messages, userMsg, placeholderAI] }
                      : c
                  );
                }
                return [{
                  id: convId,
                  title: messageText.slice(0, 40) + (messageText.length > 40 ? '...' : ''),
                  createdAt: 'Just now',
                  messages: [userMsg, placeholderAI],
                }, ...prev];
              });
            }

            if (evt.type === 'delta' && evt.content) {
              streamingText += evt.content;
              const currentText = streamingText;
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === convId
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === aiMsgId ? { ...m, text: currentText } : m
                        ),
                      }
                    : c
                )
              );
            }

            if (evt.type === 'done') {
              // Replace placeholder with final saved message
              const finalMsg = evt.ai_message;
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === convId
                    ? { ...c, messages: c.messages.map((m) => (m.id === aiMsgId ? finalMsg : m)) }
                    : c
                )
              );
              setStreamingMessageId(null);
            }

            if (evt.type === 'error') {
              const errText = evt.message || 'Something went wrong. Please try again.';
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === convId
                    ? { ...c, messages: c.messages.map((m) => (m.id === aiMsgId ? { ...m, text: errText } : m)) }
                    : c
                )
              );
              setStreamingMessageId(null);
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Chat streaming error:', err);
      }
    } finally {
      setIsAiTyping(false);
      setStreamingMessageId(null);
      abortControllerRef.current = null;
    }
  };

  const deleteConversation = async (convId: string) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/chat/conversations/${convId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations((prev) => {
        const remaining = prev.filter((c) => c.id !== convId);
        if (activeConversationId === convId) {
          setActiveConversationId(remaining.length > 0 ? remaining[0].id : '');
        }
        return remaining;
      });
    } catch (err) {
      console.error('Delete conversation error:', err);
    }
  };

  const renameConversation = async (convId: string, title: string) => {
    if (!token || !title.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/chat/conversations/${convId}/title`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, title: title.trim() } : c))
        );
      }
    } catch (err) {
      console.error('Rename error:', err);
    }
  };

  const refreshAllData = async () => {
    if (token) await refreshDashboardData(token);
  };

  return (
    <FinancialDataContext.Provider
      value={{
        currentClient,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        completeFirstTimePasswordChange,
        requestPasswordReset,
        resetPasswordWithToken,
        updateClientProfile,
        updateNotifications,
        updateSubscriptionPlan,
        metrics,
        monthlyBars,
        expenseBreakdown,
        recentTransactions,
        allTransactions,
        aiInsights,
        healthScore,
        documents,
        addDocument,
        retryDocument,
        approvedReports,
        getReportById,
        updateActionItemStatus,
        conversations,
        activeConversationId,
        setActiveConversationId,
        createNewConversation,
        sendChatMessage,
        deleteConversation,
        renameConversation,
        stopStreaming,
        isAiTyping,
        streamingMessageId,
        isSearchOpen,
        setIsSearchOpen,
        refreshAllData,
      }}
    >
      {children}
    </FinancialDataContext.Provider>
  );
}

export function useFinancialData() {
  const context = useContext(FinancialDataContext);
  if (!context) throw new Error('useFinancialData must be used within a FinancialDataProvider');
  return context;
}
