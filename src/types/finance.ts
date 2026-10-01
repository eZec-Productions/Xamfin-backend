export type DocumentType = 
  | 'Bank statement' 
  | 'Invoice sent' 
  | 'Invoice received' 
  | 'Receipt' 
  | 'Other';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  sourceDocId?: string;
  sourceDocName?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role?: string;
  isFirstTimeLogin: boolean;
  industry: string;
  fiscalStartMonth: string;
  currency: string;
  currentPlan: string;
  planPrice: string;
  renewalDate: string;
  notifications: {
    monthlyReportReady: boolean;
    cashFlowAlert: boolean;
    overdueInvoiceReminder: boolean;
    weeklySummary: boolean;
  };
}

export interface MetricCardData {
  title: string;
  value: string;
  numericValue: number;
  trend: string;
  isUp: boolean;
  isPositive: boolean;
  percentageGoal: number; // for circular gauge
}

export interface MonthlyBarData {
  month: string;
  revenue: number;
  expenses: number;
}

export interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  changeVsLastMonth: number;
  color: string;
}

export interface AIInsight {
  type: 'strong' | 'warning' | 'opportunity';
  tag?: string;
  title: string;
  description: string;
  impact?: string;
}

export interface HealthScore {
  score: number;
  rating?: string; // e.g. "Excellent" | "Good" | "Fair" | "Needs Attention"
  status: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  changeVsLastMonth?: string;
}

export interface UploadedDocument {
  id: string;
  fileName: string;
  documentType: DocumentType;
  date: string;
  status: 'Uploading' | 'Processing' | 'Completed' | 'Error';
  extractedCount: number;
  extractedTransactions: Transaction[];
  errorMessage?: string;
}

export interface ActionPlanItem {
  id: string;
  title: string;
  explanation: string;
  estimatedImpact: string;
  status: 'active' | 'done' | 'dismissed';
}

export interface FinancialReport {
  id: string;
  month: string;
  year: number;
  publishedDate: string;
  dateGenerated?: string;
  isApproved: boolean; // MUST be true to show to client
  approvedBy?: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  cashBalance: number;
  revChangePercent: number;
  expChangePercent: number;
  profitChangePercent: number;
  cashChangePercent: number;
  summaryMetrics?: {
    revenue: string;
    revenueChangePct: number;
    expenses: string;
    expensesChangePct: number;
    netProfit: string;
    netProfitChangePct: number;
    cashFlow: string;
    cashFlowChangePct: number;
  };
  plStatement: {
    revenueSources: { name: string; amount: number }[];
    revenueStreams?: { name: string; amount: number }[];
    totalRevenue?: number;
    expenseCategories: { name: string; amount: number }[];
    totalExpenses?: number;
    netIncome?: number;
  };
  cashFlow: {
    moneyIn: number;
    moneyOut: number;
    netMovement: number;
    endingCash?: number;
  };
  expenseBreakdown: ExpenseCategory[];
  growthAnalysis: string;
  actionPlan: ActionPlanItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: string[];
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}
