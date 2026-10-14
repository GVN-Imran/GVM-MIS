export type UserRole = 'founder' | 'admin' | 'sales1' | 'sales2';

export interface UserSession {
  userId: string;
  name: string;
  role: UserRole;
  token: string;
  loginTime: string;
}

export type ActivationPeriod = 'Under 90 Days' | 'Above 90 Days';
export type SimStatus = 'Available' | 'Sold';
export type ApprovalStatus = 'Approved' | 'Pending Purchase Approval';
export type ExpenseType = 'Activating Cost' | 'Travel' | 'Other Indirect / Recharge';

export interface Investor {
  id: string;
  name: string;
  contact: string;
  email?: string;
  amountInvested: number;
  startDate: string;
  timelineDays: number;
  timelineLabel: string;
  profitSharePercent: number; // Investor percentage (e.g. 60 means 60% to investor, 40% to GVN)
  status: 'active' | 'closed';
  closedDate?: string;
  notes?: string;
}

export interface WithdrawalRecord {
  id: string;
  investorId: string;
  investorName: string;
  date: string;
  amount: number;
  type: 'part' | 'full_closure';
  balanceBefore: number;
  balanceAfter: number;
  notes: string;
  processedBy: string;
}

export interface SimCard {
  id: string;
  simNumber: string;
  carrier: string;
  category: string;
  additionalDetails: string;
  activationPeriod: ActivationPeriod;
  purchasePrice: number;
  purchaseDate: string;
  mappedInvestorId: string; // 'inv_gvn' for default GVN
  status: SimStatus;
  approvalStatus: ApprovalStatus;
  sourcedBy: string;
  purchasedBy?: string;
}

export interface Expense {
  id: string;
  date: string;
  simCardId: string;
  simNumber: string;
  amount: number;
  description: string;
  expenseType: ExpenseType;
  loggedBy: string;
  loggedByName: string;
}

export interface Sale {
  id: string;
  date: string;
  simCardId: string;
  simNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  amountCollected: number;
  soldBy: string;
  soldByName: string;
  paymentMethod?: string;
  notes?: string;
}

export interface CustomerSummary {
  name: string;
  phone: string;
  email?: string;
  totalPurchasedValue: number;
  totalSimsBought: number;
  sims: { simNumber: string; amount: number; date: string }[];
  firstPurchaseDate: string;
  lastPurchaseDate: string;
}

export interface InvestorFinancialStats {
  investor: Investor;
  amountInvested: number;
  simsPurchasedCost: number;
  simsPurchasedCount: number;
  simsExpenses: number;
  simsSoldCount: number;
  simsSoldPurchaseCost: number;
  totalRevenue: number;
  totalExpenses: number;
  grossProfitOnSold: number;
  investorProfitShareAmount: number;
  gvnProfitShareAmount: number;
  totalWithdrawn: number;
  unallocatedCapital: number;
  currentBalance: number;
  utilizationRate: number;
  isOverUtilized: boolean;
  isFullyUtilized: boolean;
  activeDays: number;
}
