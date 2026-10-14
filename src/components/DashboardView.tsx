import React from 'react';
import {
  UserSession,
  Investor,
  SimCard,
  Expense,
  Sale,
  WithdrawalRecord
} from '../types';
import {
  calculateGlobalAccounts,
  calculateInvestorStats,
  formatCurrency,
  formatDate
} from '../services/storage';
import { StockTimelineRadar } from './StockTimelineRadar';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Coins,
  Receipt,
  Briefcase,
  UserPlus
} from 'lucide-react';

interface DashboardViewProps {
  session: UserSession;
  investors: Investor[];
  simCards: SimCard[];
  expenses: Expense[];
  sales: Sale[];
  withdrawals: WithdrawalRecord[];
  onOpenSimModal: () => void;
  onOpenSaleModal: (simId?: string) => void;
  onOpenExpenseModal: (simId?: string) => void;
  onOpenInvestorModal: () => void;
  onOpenWithdrawalModal: (investorId?: string) => void;
  onOpenUserManagement?: () => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  session,
  investors,
  simCards,
  expenses,
  sales,
  withdrawals,
  onOpenSimModal,
  onOpenSaleModal,
  onOpenExpenseModal,
  onOpenInvestorModal,
  onOpenWithdrawalModal,
  onOpenUserManagement,
  setActiveTab
}) => {
  const isFounder = session.role === 'founder';
  const isAdmin = session.role === 'admin';
  const isSales = session.role === 'sales1' || session.role === 'sales2';

  const globalAccounts = calculateGlobalAccounts(simCards, expenses, sales);

  // Compute investor stats
  const allInvestorStats = investors.map((inv) =>
    calculateInvestorStats(inv, simCards, expenses, sales, withdrawals)
  );

  // Active investors (excluding closed)
  const activeInvestorStats = allInvestorStats.filter((s) => s.investor.status === 'active');

  // Max and Min balance investors
  const sortedByBalance = [...activeInvestorStats].sort(
    (a, b) => b.currentBalance - a.currentBalance
  );
  const maxBalanceInvestor = sortedByBalance[0];
  const minBalanceInvestor = sortedByBalance[sortedByBalance.length - 1];

  const closedRecently = allInvestorStats.filter(
    (s) => s.investor.status === 'closed'
  );

  // Investor utilization alert: find investors who have reached 90% or higher utilization
  const fullyUtilizedInvestors = activeInvestorStats.filter(
    (s) => s.utilizationRate >= 90 && s.investor.id !== 'inv_gvn'
  );

  // Sales executive personal performance
  const mySales = sales.filter((s) => s.soldBy.toLowerCase() === session.userId.toLowerCase());
  const myRevenue = mySales.reduce((sum, s) => sum + s.amountCollected, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
              Live Operations Terminal
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-xs text-neutral-400">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Welcome back, {session.name}
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isFounder && 'Master executive oversight for VIP inventory, investor capital deployment, staff logins, and profit splits.'}
            {isAdmin && 'SIM card intake, carrier specifications, timeline tracking, and operational expenses.'}
            {isSales && 'VIP numbers catalog, client sale registrations, and expense punch-in console.'}
          </p>
        </div>

        {/* Action shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          {isFounder && (
            <>
              {onOpenUserManagement && (
                <button
                  onClick={onOpenUserManagement}
                  className="px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Create / Manage Users</span>
                </button>
              )}
              <button
                onClick={onOpenInvestorModal}
                className="px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors cursor-pointer"
              >
                + Add Investor
              </button>
              <button
                onClick={() => onOpenWithdrawalModal()}
                className="px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-950/40 hover:bg-amber-900/40 rounded-lg border border-amber-800/50 transition-colors cursor-pointer"
              >
                Process Withdrawal
              </button>
            </>
          )}
          {(isFounder || isAdmin) && (
            <button
              onClick={onOpenSimModal}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              + Buy / Add VIP SIM
            </button>
          )}
          {(isFounder || isSales) && (
            <button
              onClick={() => onOpenSaleModal()}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              + Register Sale
            </button>
          )}
          <button
            onClick={() => onOpenExpenseModal()}
            className="px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors cursor-pointer"
          >
            + Punch Expense
          </button>
        </div>
      </div>

      {/* Portfolio Operations Radar: Investor Timeline Watch & Unsold SIMs Matrix */}
      <StockTimelineRadar
        session={session}
        investors={investors}
        simCards={simCards}
        expenses={expenses}
        sales={sales}
        withdrawals={withdrawals}
        onOpenSaleModal={onOpenSaleModal}
        onOpenWithdrawalModal={onOpenWithdrawalModal}
      />

      {/* Founder Specific Utilization Alerts */}
      {isFounder && fullyUtilizedInvestors.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="w-full">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Investor Fund Utilization Alert
              </h3>
              <p className="text-xs text-neutral-300 mt-1">
                The following investor accounts have utilized their capital for VIP SIM acquisitions. Review balances or re-allocate:
              </p>
              <div className="mt-3 space-y-2">
                {fullyUtilizedInvestors.map((stat) => (
                  <div
                    key={stat.investor.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs gap-2"
                  >
                    <div>
                      <span className="font-semibold text-white">{stat.investor.name}</span>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Amount Invested: <span className="text-neutral-200 font-mono">{formatCurrency(stat.amountInvested)}</span> · SIMs Purchased: <span className="text-amber-400 font-mono">{formatCurrency(stat.simsPurchasedCost)}</span> ({stat.simsPurchasedCount} SIMs) · Balance: <span className="text-emerald-400 font-mono">{formatCurrency(stat.currentBalance)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {Math.round(stat.utilizationRate)}% Utilized
                      </span>
                      <button
                        onClick={() => onOpenWithdrawalModal(stat.investor.id)}
                        className="px-2.5 py-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                      >
                        Reconcile & Withdraw →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Accounts Summary (Till Date) - Founder / Management view */}
      {isFounder && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
              Global Accounts Ledger (Till Date)
            </h2>
            <span className="text-xs text-neutral-400 font-mono">
              Purchase vs Expenses vs Sales
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
              <div className="text-xs text-neutral-400 flex items-center justify-between">
                <span>Total Purchase Capital</span>
                <Coins className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">
                {formatCurrency(globalAccounts.totalPurchaseCost)}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {globalAccounts.totalSims} total VIP SIM lines acquired
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
              <div className="text-xs text-neutral-400 flex items-center justify-between">
                <span>Total Operational Expenses</span>
                <Receipt className="h-4 w-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-400 font-mono mt-1 tabular-nums">
                {formatCurrency(globalAccounts.totalExpenses)}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Activation, travel, recharge & packaging
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
              <div className="text-xs text-neutral-400 flex items-center justify-between">
                <span>Total Sales Revenue</span>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">
                {formatCurrency(globalAccounts.totalSalesRevenue)}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                From {globalAccounts.soldCount} VIP SIM transfers
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
              <div className="text-xs text-neutral-400 flex items-center justify-between">
                <span>Unsold Stock (Sales Target)</span>
                <Briefcase className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-300 font-mono mt-1 tabular-nums">
                {formatCurrency(globalAccounts.availableSimsStockValue)}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {globalAccounts.availableCount} available SIMs awaiting buyers
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active SIMs Widget (Categorized by Timelines: Under 90 vs Above 90) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
              Current Active SIMs Pipeline (Timelines)
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Categorized by fast turnover (&lt;90 days) and vault / high-tier lines (&gt;90 days)
            </p>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Full VIP Catalog</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Under 90 Days Card */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-bold text-neutral-100">
                  Under 90 Days Cycle (Fast Turnover)
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 font-mono">
                {globalAccounts.under90.total} SIMs Total
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3.5 text-xs">
              <div className="bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
                <div className="text-[11px] text-neutral-400">Available in Stock</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5 tabular-nums">
                  {globalAccounts.under90.available}
                </div>
              </div>

              <div className="bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
                <div className="text-[11px] text-neutral-400">Sold & Delivered</div>
                <div className="text-base font-bold text-neutral-200 font-mono mt-0.5 tabular-nums">
                  {globalAccounts.under90.sold}
                </div>
              </div>

              <div className="bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
                <div className="text-[11px] text-neutral-400">Total Purchase Value</div>
                <div className="text-base font-bold text-amber-400 font-mono mt-0.5 tabular-nums">
                  {formatCurrency(globalAccounts.under90.cost)}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
              <span>Sold Revenue Realized:</span>
              <span className="font-bold text-emerald-400 font-mono tabular-nums">
                {formatCurrency(globalAccounts.under90.soldRevenue)}
              </span>
            </div>
          </div>

          {/* Above 90 Days Card */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-bold text-neutral-100">
                  Above 90 Days Cycle (Vault / Prestige)
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 font-mono">
                {globalAccounts.above90.total} SIMs Total
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3.5 text-xs">
              <div className="bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
                <div className="text-[11px] text-neutral-400">Available in Stock</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5 tabular-nums">
                  {globalAccounts.above90.available}
                </div>
              </div>

              <div className="bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
                <div className="text-[11px] text-neutral-400">Sold & Delivered</div>
                <div className="text-base font-bold text-neutral-200 font-mono mt-0.5 tabular-nums">
                  {globalAccounts.above90.sold}
                </div>
              </div>

              <div className="bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
                <div className="text-[11px] text-neutral-400">Total Purchase Value</div>
                <div className="text-base font-bold text-amber-400 font-mono mt-0.5 tabular-nums">
                  {formatCurrency(globalAccounts.above90.cost)}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
              <span>Sold Revenue Realized:</span>
              <span className="font-bold text-emerald-400 font-mono tabular-nums">
                {formatCurrency(globalAccounts.above90.soldRevenue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Investor Health Widget (Founder Only) */}
      {isFounder && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
              Investor Health & Capital Positions
            </h2>
            <button
              onClick={() => setActiveTab('investors')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Investors</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Maximum Balance Investor */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
              <div className="text-xs text-neutral-400 flex items-center justify-between">
                <span>Maximum Balance Account</span>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">PEAK CAPITAL</span>
              </div>
              {maxBalanceInvestor ? (
                <div className="mt-2">
                  <div className="text-sm font-bold text-white truncate">
                    {maxBalanceInvestor.investor.name}
                  </div>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5 tabular-nums">
                    {formatCurrency(maxBalanceInvestor.currentBalance)}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Invested: {formatCurrency(maxBalanceInvestor.amountInvested)} · {maxBalanceInvestor.simsPurchasedCount} SIMs mapped
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 mt-2">No active investors</p>
              )}
            </div>

            {/* Minimum Balance Investor */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
              <div className="text-xs text-neutral-400 flex items-center justify-between">
                <span>Minimum Balance Account</span>
                <span className="text-[10px] text-amber-400 font-mono font-semibold">CAPITAL UTILIZED</span>
              </div>
              {minBalanceInvestor ? (
                <div className="mt-2">
                  <div className="text-sm font-bold text-white truncate">
                    {minBalanceInvestor.investor.name}
                  </div>
                  <div className="text-xl font-black text-amber-300 font-mono mt-0.5 tabular-nums">
                    {formatCurrency(minBalanceInvestor.currentBalance)}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Invested: {formatCurrency(minBalanceInvestor.amountInvested)} · {Math.round(minBalanceInvestor.utilizationRate)}% deployed
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 mt-2">No active investors</p>
              )}
            </div>

            {/* Closed Accounts in Last Week */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
              <div className="text-xs text-neutral-400 flex items-center justify-between">
                <span>Closed Accounts (Last Week)</span>
                <span className="text-[10px] text-neutral-400 font-mono font-semibold">SETTLED</span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-black text-neutral-200 font-mono tabular-nums">
                  {closedRecently.length} Account(s)
                </div>
                {closedRecently.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {closedRecently.map((c) => (
                      <div key={c.investor.id} className="text-xs text-neutral-400 flex justify-between">
                        <span className="truncate">{c.investor.name}</span>
                        <span className="text-neutral-500">{formatDate(c.investor.closedDate || '')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-neutral-500 mt-1">
                    No accounts liquidated recently.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Executive Specific Stat Banner */}
      {isSales && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
              My Sales Rep Performance
            </h3>
            <span className="text-xs text-emerald-400 font-mono font-semibold">
              Logged in as {session.name}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-neutral-950/60 rounded-lg border border-neutral-800">
              <div className="text-xs text-neutral-400">My Completed VIP Deals</div>
              <div className="text-xl font-bold text-white font-mono mt-0.5 tabular-nums">
                {mySales.length} SIMs
              </div>
            </div>

            <div className="p-3 bg-neutral-950/60 rounded-lg border border-neutral-800">
              <div className="text-xs text-neutral-400">Total Revenue Generated</div>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5 tabular-nums">
                {formatCurrency(myRevenue)}
              </div>
            </div>

            <div className="p-3 bg-neutral-950/60 rounded-lg border border-neutral-800">
              <div className="text-xs text-neutral-400">Ready to Sell (In Stock)</div>
              <div className="text-xl font-bold text-amber-400 font-mono mt-0.5 tabular-nums">
                {globalAccounts.availableCount} VIP Numbers
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Dual Feed: Recent Sales & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Recent VIP Sales & Transfers
            </h3>
            <button
              onClick={() => setActiveTab('sales')}
              className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              All Sales ({sales.length})
            </button>
          </div>
          <div className="divide-y divide-neutral-800/60 mt-2">
            {sales.slice(0, 4).map((sale) => (
              <div key={sale.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white font-mono">{sale.simNumber}</div>
                  <div className="text-neutral-400 text-[11px] mt-0.5">
                    Client: <span className="text-neutral-200">{sale.customerName}</span> · Rep: {sale.soldByName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400 font-mono tabular-nums">
                    {formatCurrency(sale.amountCollected)}
                  </div>
                  <div className="text-neutral-500 text-[10px] mt-0.5">
                    {formatDate(sale.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Recent Logged Expenses
            </h3>
            <button
              onClick={() => setActiveTab('sales')}
              className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              All Expenses ({expenses.length})
            </button>
          </div>
          <div className="divide-y divide-neutral-800/60 mt-2">
            {expenses.slice(0, 4).map((exp) => (
              <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white font-mono">{exp.simNumber}</div>
                  <div className="text-neutral-400 text-[11px] mt-0.5">
                    Type: <span className="text-amber-400">{exp.expenseType}</span> · By: {exp.loggedByName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-400 font-mono tabular-nums">
                    {formatCurrency(exp.amount)}
                  </div>
                  <div className="text-neutral-500 text-[10px] mt-0.5">
                    {formatDate(exp.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
