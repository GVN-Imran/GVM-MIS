import {
  Investor,
  SimCard,
  Expense,
  Sale,
  WithdrawalRecord,
  InvestorFinancialStats,
  CustomerSummary
} from '../types';

const STORAGE_KEYS = {
  INVESTORS: 'gvn_investors_v1',
  SIM_CARDS: 'gvn_sim_cards_v1',
  EXPENSES: 'gvn_expenses_v1',
  SALES: 'gvn_sales_v1',
  WITHDRAWALS: 'gvn_withdrawals_v1',
  AUTH: 'gvn_user_session_v1',
};

// Initial Seed Data
const INITIAL_INVESTORS: Investor[] = [
  {
    id: 'inv_gvn',
    name: 'GVN (Company Treasury)',
    contact: '+971 4 888 0000',
    email: 'treasury@goldenvipnumbers.ae',
    amountInvested: 250000,
    startDate: '2026-01-01',
    timelineDays: 730,
    timelineLabel: '2 Years',
    profitSharePercent: 100,
    status: 'active',
    notes: 'Default internal inventory capital pool for Golden VIP Numbers stock.'
  },
  {
    id: 'inv_1',
    name: 'Sheikh Rashid Al-Qasimi',
    contact: '+971 50 111 2233',
    email: 'rashid.qasimi@holding.ae',
    amountInvested: 120000,
    startDate: '2026-02-15',
    timelineDays: 180,
    timelineLabel: '180 Days (6 Months)',
    profitSharePercent: 65,
    status: 'active',
    notes: 'Focus on Quad & Penta 7s and 8s numbers in UAE & GCC.'
  },
  {
    id: 'inv_2',
    name: 'Singhania Global Telecom Fund',
    contact: '+91 98200 44555',
    email: 'invest@singhaniacapital.in',
    amountInvested: 85000,
    startDate: '2026-03-01',
    timelineDays: 365,
    timelineLabel: '365 Days (1 Year)',
    profitSharePercent: 60,
    status: 'active',
    notes: 'High-margin mirror numbers and Royal 000 series.'
  },
  {
    id: 'inv_3',
    name: 'Apex TeleVentures Group',
    contact: '+44 20 7946 0912',
    email: 'partnerships@apextele.co.uk',
    amountInvested: 45000,
    startDate: '2026-05-10',
    timelineDays: 90,
    timelineLabel: '90 Days',
    profitSharePercent: 55,
    status: 'active',
    notes: 'Short-term high turnover numbers.'
  },
  {
    id: 'inv_4',
    name: 'Royale Heritage Capital',
    contact: '+971 55 909 0000',
    email: 'admin@royaleheritage.com',
    amountInvested: 35000,
    startDate: '2026-01-10',
    timelineDays: 120,
    timelineLabel: '120 Days',
    profitSharePercent: 50,
    status: 'closed',
    closedDate: '2026-09-28', // closed last week
    notes: 'Successfully completed full cycle. Principal + profit fully paid out.'
  }
];

const INITIAL_SIM_CARDS: SimCard[] = [
  {
    id: 'sim_1',
    simNumber: '+971 50 777 7777',
    carrier: 'Etisalat UAE',
    category: 'Royal Septa 7777777',
    additionalDetails: 'Clean postpaid tier, VIP golden billing package, active line with zero spam score.',
    activationPeriod: 'Under 90 Days',
    purchasePrice: 28000,
    purchaseDate: '2026-06-12',
    mappedInvestorId: 'inv_1',
    status: 'Sold',
    approvalStatus: 'Approved',
    sourcedBy: 'admin',
    purchasedBy: 'Imran'
  },
  {
    id: 'sim_2',
    simNumber: '+971 52 888 8888',
    carrier: 'du Luxury Telecom',
    category: 'Diamond Octa 8s',
    additionalDetails: 'Pre-activated VIP eSIM with certificate of ownership and priority customer status.',
    activationPeriod: 'Under 90 Days',
    purchasePrice: 22000,
    purchaseDate: '2026-07-01',
    mappedInvestorId: 'inv_1',
    status: 'Sold',
    approvalStatus: 'Approved',
    sourcedBy: 'admin',
    purchasedBy: 'Imran'
  },
  {
    id: 'sim_3',
    simNumber: '+971 55 000 0007',
    carrier: 'du Luxury Telecom',
    category: 'Crown James Bond 007',
    additionalDetails: 'Hexa zeroes ending in lucky 7, high-net-worth business registration available.',
    activationPeriod: 'Under 90 Days',
    purchasePrice: 18500,
    purchaseDate: '2026-08-04',
    mappedInvestorId: 'inv_1',
    status: 'Available',
    approvalStatus: 'Approved',
    sourcedBy: 'admin',
    purchasedBy: 'Imran'
  },
  {
    id: 'sim_4',
    simNumber: '+971 50 123 4567',
    carrier: 'Etisalat UAE',
    category: 'Ascending Royal Ladder',
    additionalDetails: 'Flawless 1-7 consecutive sequence. Extremely rare heritage telecom series.',
    activationPeriod: 'Above 90 Days',
    purchasePrice: 34000,
    purchaseDate: '2026-03-15',
    mappedInvestorId: 'inv_2',
    status: 'Sold',
    approvalStatus: 'Approved',
    sourcedBy: 'admin',
    purchasedBy: 'Imran'
  },
  {
    id: 'sim_5',
    simNumber: '+971 58 999 9999',
    carrier: 'Virgin VIP',
    category: 'Imperial Septa 9s',
    additionalDetails: 'Unallocated golden physical SIM kit with golden VIP gift box presentation.',
    activationPeriod: 'Under 90 Days',
    purchasePrice: 19000,
    purchaseDate: '2026-08-18',
    mappedInvestorId: 'inv_2',
    status: 'Available',
    approvalStatus: 'Approved',
    sourcedBy: 'admin',
    purchasedBy: 'Imran'
  },
  {
    id: 'sim_6',
    simNumber: '+971 54 555 5555',
    carrier: 'Etisalat UAE',
    category: 'Platinum Hexa 5s',
    additionalDetails: 'Prestige corporate line, ready for instant ownership transfer in Dubai.',
    activationPeriod: 'Above 90 Days',
    purchasePrice: 14500,
    purchaseDate: '2026-04-20',
    mappedInvestorId: 'inv_3',
    status: 'Sold',
    approvalStatus: 'Approved',
    sourcedBy: 'admin',
    purchasedBy: 'Imran'
  },
  {
    id: 'sim_7',
    simNumber: '+971 56 111 1111',
    carrier: 'du Luxury Telecom',
    category: 'Ace Imperial Hexa 1s',
    additionalDetails: 'Unused brand new batch, valid for immediate eSIM swap and delivery.',
    activationPeriod: 'Under 90 Days',
    purchasePrice: 16000,
    purchaseDate: '2026-09-02',
    mappedInvestorId: 'inv_3',
    status: 'Available',
    approvalStatus: 'Approved',
    sourcedBy: 'admin',
    purchasedBy: 'Imran'
  },
  {
    id: 'sim_8',
    simNumber: '+971 50 800 0000',
    carrier: 'Etisalat UAE',
    category: 'Corporate Prestige 8M',
    additionalDetails: 'Commercial toll-free style mobile identifier for luxury conglomerate.',
    activationPeriod: 'Above 90 Days',
    purchasePrice: 24000,
    purchaseDate: '2026-05-18',
    mappedInvestorId: 'inv_gvn',
    status: 'Available',
    approvalStatus: 'Approved',
    sourcedBy: 'Imran',
    purchasedBy: 'Imran'
  },
  {
    id: 'sim_9',
    simNumber: '+971 55 786 7860',
    carrier: 'du Luxury Telecom',
    category: 'Auspicious Double 786',
    additionalDetails: 'Highly coveted religious auspicious sequence, gold-tier SIM carrier badge.',
    activationPeriod: 'Above 90 Days',
    purchasePrice: 12000,
    purchaseDate: '2026-05-30',
    mappedInvestorId: 'inv_gvn',
    status: 'Sold',
    approvalStatus: 'Approved',
    sourcedBy: 'admin',
    purchasedBy: 'Imran'
  },
  {
    id: 'sim_10',
    simNumber: '+971 52 333 3333',
    carrier: 'du Luxury Telecom',
    category: 'Golden Triple Trio',
    additionalDetails: 'Sourced via telecom broker auction in Abu Dhabi. Awaiting founder approval to buy.',
    activationPeriod: 'Under 90 Days',
    purchasePrice: 15500,
    purchaseDate: '2026-09-28',
    mappedInvestorId: 'inv_gvn',
    status: 'Available',
    approvalStatus: 'Pending Purchase Approval',
    sourcedBy: 'admin'
  }
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    date: '2026-06-14',
    simCardId: 'sim_1',
    simNumber: '+971 50 777 7777',
    amount: 850,
    description: 'VIP carrier activation fee & golden line setup at Etisalat Flagship.',
    expenseType: 'Activating Cost',
    loggedBy: 'admin',
    loggedByName: 'Admin (Operations)'
  },
  {
    id: 'exp_2',
    date: '2026-06-18',
    simCardId: 'sim_1',
    simNumber: '+971 50 777 7777',
    amount: 400,
    description: 'Chauffeur courier delivery of physical golden SIM card to client concierge.',
    expenseType: 'Travel',
    loggedBy: 'Sales1',
    loggedByName: 'Sales 1'
  },
  {
    id: 'exp_3',
    date: '2026-07-03',
    simCardId: 'sim_2',
    simNumber: '+971 52 888 8888',
    amount: 600,
    description: 'du VIP eSIM generation and 12-month line reservation recharge.',
    expenseType: 'Other Indirect / Recharge',
    loggedBy: 'sales2',
    loggedByName: 'Sales 2'
  },
  {
    id: 'exp_4',
    date: '2026-03-18',
    simCardId: 'sim_4',
    simNumber: '+971 50 123 4567',
    amount: 1100,
    description: 'Operator line transfer verification and biometric KYC filing.',
    expenseType: 'Activating Cost',
    loggedBy: 'admin',
    loggedByName: 'Admin (Operations)'
  },
  {
    id: 'exp_5',
    date: '2026-04-22',
    simCardId: 'sim_6',
    simNumber: '+971 54 555 5555',
    amount: 350,
    description: 'Travel expenses for client identity authentication at airport terminal.',
    expenseType: 'Travel',
    loggedBy: 'Imran',
    loggedByName: 'Imran (Founder)'
  },
  {
    id: 'exp_6',
    date: '2026-06-01',
    simCardId: 'sim_9',
    simNumber: '+971 55 786 7860',
    amount: 500,
    description: 'Prepaid line buffer recharge and VIP packaging velvet presentation box.',
    expenseType: 'Other Indirect / Recharge',
    loggedBy: 'Sales1',
    loggedByName: 'Sales 1'
  }
];

const INITIAL_SALES: Sale[] = [
  {
    id: 'sale_1',
    date: '2026-06-25',
    simCardId: 'sim_1',
    simNumber: '+971 50 777 7777',
    customerName: 'Tariq Al-Futtaim',
    customerPhone: '+971 50 499 8888',
    customerEmail: 'tariq@futtaim-invest.ae',
    amountCollected: 45000,
    soldBy: 'Sales1',
    soldByName: 'Sales 1',
    paymentMethod: 'Bank Wire Transfer',
    notes: 'Sold to prominent family office in Downtown Dubai.'
  },
  {
    id: 'sale_2',
    date: '2026-07-15',
    simCardId: 'sim_2',
    simNumber: '+971 52 888 8888',
    customerName: 'Alexander Rostov',
    customerPhone: '+971 56 333 4444',
    customerEmail: 'rostov.holding@monaco.mc',
    amountCollected: 36000,
    soldBy: 'sales2',
    soldByName: 'Sales 2',
    paymentMethod: 'USDT Crypto Settlement',
    notes: 'Palm Jumeirah luxury resident for private yacht communication.'
  },
  {
    id: 'sale_3',
    date: '2026-04-10',
    simCardId: 'sim_4',
    simNumber: '+971 50 123 4567',
    customerName: 'Kunal Singhania',
    customerPhone: '+91 99999 12345',
    customerEmail: 'kunal@singhania-infra.in',
    amountCollected: 52000,
    soldBy: 'Imran',
    soldByName: 'Imran (Founder)',
    paymentMethod: 'Direct Bank Wire',
    notes: 'Direct founder deal for flagship ascending sequence.'
  },
  {
    id: 'sale_4',
    date: '2026-05-12',
    simCardId: 'sim_6',
    simNumber: '+971 54 555 5555',
    customerName: 'Fahad Bin Khalid',
    customerPhone: '+966 50 222 9999',
    customerEmail: 'fahad@riyadh-estates.sa',
    amountCollected: 24500,
    soldBy: 'Sales1',
    soldByName: 'Sales 1',
    paymentMethod: 'Corporate Cheque',
    notes: 'Sold to Saudi real estate mogul visiting Dubai DIFC.'
  },
  {
    id: 'sale_5',
    date: '2026-06-20',
    simCardId: 'sim_9',
    simNumber: '+971 55 786 7860',
    customerName: 'Mohammed Al-Noor',
    customerPhone: '+971 52 786 0000',
    customerEmail: 'm.noor@alnoor-trading.com',
    amountCollected: 21000,
    soldBy: 'sales2',
    soldByName: 'Sales 2',
    paymentMethod: 'Cash Deposit',
    notes: 'Gold Souk merchant acquisition.'
  }
];

const INITIAL_WITHDRAWALS: WithdrawalRecord[] = [
  {
    id: 'wd_1',
    investorId: 'inv_1',
    investorName: 'Sheikh Rashid Al-Qasimi',
    date: '2026-07-28',
    amount: 25000,
    type: 'part',
    balanceBefore: 65000,
    balanceAfter: 40000,
    notes: 'Interim profit realization after sale of 7777777 and 8888888.',
    processedBy: 'Imran (Founder)'
  },
  {
    id: 'wd_2',
    investorId: 'inv_4',
    investorName: 'Royale Heritage Capital',
    date: '2026-09-28',
    amount: 42800,
    type: 'full_closure',
    balanceBefore: 42800,
    balanceAfter: 0,
    notes: 'Full cycle completion. Closed account with principal and final profit share distribution.',
    processedBy: 'Imran (Founder)'
  }
];

// Helper to safely load and save localStorage
export const storageService = {
  getInvestors(): Investor[] {
    const data = localStorage.getItem(STORAGE_KEYS.INVESTORS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.INVESTORS, JSON.stringify(INITIAL_INVESTORS));
      return INITIAL_INVESTORS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_INVESTORS;
    }
  },
  saveInvestors(investors: Investor[]) {
    localStorage.setItem(STORAGE_KEYS.INVESTORS, JSON.stringify(investors));
  },

  getSimCards(): SimCard[] {
    const data = localStorage.getItem(STORAGE_KEYS.SIM_CARDS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SIM_CARDS, JSON.stringify(INITIAL_SIM_CARDS));
      return INITIAL_SIM_CARDS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_SIM_CARDS;
    }
  },
  saveSimCards(simCards: SimCard[]) {
    localStorage.setItem(STORAGE_KEYS.SIM_CARDS, JSON.stringify(simCards));
  },

  getExpenses(): Expense[] {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_EXPENSES;
    }
  },
  saveExpenses(expenses: Expense[]) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  getSales(): Sale[] {
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
      return INITIAL_SALES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_SALES;
    }
  },
  saveSales(sales: Sale[]) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },

  getWithdrawals(): WithdrawalRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(INITIAL_WITHDRAWALS));
      return INITIAL_WITHDRAWALS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_WITHDRAWALS;
    }
  },
  saveWithdrawals(withdrawals: WithdrawalRecord[]) {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));
  },

  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.INVESTORS, JSON.stringify(INITIAL_INVESTORS));
    localStorage.setItem(STORAGE_KEYS.SIM_CARDS, JSON.stringify(INITIAL_SIM_CARDS));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(INITIAL_WITHDRAWALS));
  }
};

// Calculate financial health and metrics for a specific investor
export function calculateInvestorStats(
  investor: Investor,
  simCards: SimCard[],
  expenses: Expense[],
  sales: Sale[],
  withdrawals: WithdrawalRecord[]
): InvestorFinancialStats {
  const mappedSims = simCards.filter((s) => s.mappedInvestorId === investor.id);
  const mappedSimIds = new Set(mappedSims.map((s) => s.id));

  const simsPurchasedCount = mappedSims.length;
  const simsPurchasedCost = mappedSims.reduce((sum, s) => sum + s.purchasePrice, 0);

  const soldSims = mappedSims.filter((s) => s.status === 'Sold');
  const simsSoldCount = soldSims.length;
  const simsSoldPurchaseCost = soldSims.reduce((sum, s) => sum + s.purchasePrice, 0);

  // Expenses logged on this investor's SIMs
  const mappedExpenses = expenses.filter((e) => mappedSimIds.has(e.simCardId));
  const totalExpenses = mappedExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Sales revenue on this investor's SIMs
  const mappedSales = sales.filter((sale) => mappedSimIds.has(sale.simCardId));
  const totalRevenue = mappedSales.reduce((sum, sale) => sum + sale.amountCollected, 0);

  // Gross profit on sold inventory: Total Revenue - (Purchase Price of Sold SIMs + Total Expenses)
  const grossProfitOnSold = Math.max(0, totalRevenue - simsSoldPurchaseCost - totalExpenses);

  // Split calculation
  const investorShareRatio = investor.profitSharePercent / 100;
  const investorProfitShareAmount = grossProfitOnSold * investorShareRatio;
  const gvnProfitShareAmount = grossProfitOnSold * (1 - investorShareRatio);

  // Withdrawals for this investor
  const investorWithdrawals = withdrawals.filter((w) => w.investorId === investor.id);
  const totalWithdrawn = investorWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  // Unallocated investment capital (Amount Invested - Total Purchase Price of Mapped SIMs)
  const unallocatedCapital = investor.amountInvested - simsPurchasedCost;

  // Realized net withdrawable balance:
  // (Amount Invested - simsPurchasedCost) + (Recovered Cost of Sold SIMs + Investor Profit Share) - totalWithdrawn
  const currentBalance = Math.max(
    0,
    (investor.amountInvested - simsPurchasedCost) + totalRevenue - totalExpenses - totalWithdrawn
  );

  const utilizationRate = investor.amountInvested > 0
    ? (simsPurchasedCost / investor.amountInvested) * 100
    : 0;

  const isFullyUtilized = simsPurchasedCost >= investor.amountInvested;
  const isOverUtilized = simsPurchasedCost > investor.amountInvested;

  // Active days since start date
  const start = new Date(investor.startDate);
  const end = investor.status === 'closed' && investor.closedDate ? new Date(investor.closedDate) : new Date();
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const activeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    investor,
    amountInvested: investor.amountInvested,
    simsPurchasedCost,
    simsPurchasedCount,
    simsExpenses: totalExpenses,
    simsSoldCount,
    simsSoldPurchaseCost,
    totalRevenue,
    totalExpenses,
    grossProfitOnSold,
    investorProfitShareAmount,
    gvnProfitShareAmount,
    totalWithdrawn,
    unallocatedCapital,
    currentBalance,
    utilizationRate,
    isOverUtilized,
    isFullyUtilized,
    activeDays
  };
}

// Global accounts summary
export function calculateGlobalAccounts(
  simCards: SimCard[],
  expenses: Expense[],
  sales: Sale[]
) {
  const totalPurchaseCost = simCards.reduce((sum, s) => sum + s.purchasePrice, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.amountCollected, 0);

  // Sold SIMs cost
  const soldSims = simCards.filter((s) => s.status === 'Sold');
  const soldSimsCost = soldSims.reduce((sum, s) => sum + s.purchasePrice, 0);

  // Available SIMs stock value (inventory balance for setting sales targets)
  const availableSims = simCards.filter((s) => s.status === 'Available');
  const availableSimsStockValue = availableSims.reduce((sum, s) => sum + s.purchasePrice, 0);

  const netGrossProfit = totalSalesRevenue - soldSimsCost - totalExpenses;
  const totalCashInvestedInStock = totalPurchaseCost + totalExpenses;

  // Timeline categorization
  const under90Total = simCards.filter((s) => s.activationPeriod === 'Under 90 Days');
  const above90Total = simCards.filter((s) => s.activationPeriod === 'Above 90 Days');
  const under90Available = under90Total.filter((s) => s.status === 'Available');
  const above90Available = above90Total.filter((s) => s.status === 'Available');
  const under90Sold = under90Total.filter((s) => s.status === 'Sold');
  const above90Sold = above90Total.filter((s) => s.status === 'Sold');

  return {
    totalPurchaseCost,
    totalExpenses,
    totalSalesRevenue,
    soldSimsCost,
    availableSimsStockValue,
    netGrossProfit,
    totalCashInvestedInStock,
    totalSims: simCards.length,
    availableCount: availableSims.length,
    soldCount: soldSims.length,
    under90: {
      total: under90Total.length,
      available: under90Available.length,
      sold: under90Sold.length,
      cost: under90Total.reduce((sum, s) => sum + s.purchasePrice, 0),
      soldRevenue: sales
        .filter((sale) => {
          const sim = simCards.find((s) => s.id === sale.simCardId);
          return sim?.activationPeriod === 'Under 90 Days';
        })
        .reduce((sum, s) => sum + s.amountCollected, 0)
    },
    above90: {
      total: above90Total.length,
      available: above90Available.length,
      sold: above90Sold.length,
      cost: above90Total.reduce((sum, s) => sum + s.purchasePrice, 0),
      soldRevenue: sales
        .filter((sale) => {
          const sim = simCards.find((s) => s.id === sale.simCardId);
          return sim?.activationPeriod === 'Above 90 Days';
        })
        .reduce((sum, s) => sum + s.amountCollected, 0)
    }
  };
}

// Customer Leaderboard Generator
export function generateCustomerLeaderboard(sales: Sale[]): CustomerSummary[] {
  const map = new Map<string, CustomerSummary>();

  for (const sale of sales) {
    const key = sale.customerPhone || sale.customerName;
    const existing = map.get(key);
    if (existing) {
      existing.totalPurchasedValue += sale.amountCollected;
      existing.totalSimsBought += 1;
      existing.sims.push({
        simNumber: sale.simNumber,
        amount: sale.amountCollected,
        date: sale.date
      });
      if (new Date(sale.date) < new Date(existing.firstPurchaseDate)) {
        existing.firstPurchaseDate = sale.date;
      }
      if (new Date(sale.date) > new Date(existing.lastPurchaseDate)) {
        existing.lastPurchaseDate = sale.date;
      }
    } else {
      map.set(key, {
        name: sale.customerName,
        phone: sale.customerPhone,
        email: sale.customerEmail,
        totalPurchasedValue: sale.amountCollected,
        totalSimsBought: 1,
        sims: [{ simNumber: sale.simNumber, amount: sale.amountCollected, date: sale.date }],
        firstPurchaseDate: sale.date,
        lastPurchaseDate: sale.date
      });
    }
  }

  // Sort maximum purchase value to minimum purchase value
  return Array.from(map.values()).sort((a, b) => b.totalPurchasedValue - a.totalPurchasedValue);
}

// Format numbers as currency in Indian Rupees
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Format dates
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}
