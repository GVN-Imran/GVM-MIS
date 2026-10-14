import React, { useState } from 'react';
import { Investor, SimCard, Expense, Sale, WithdrawalRecord, UserSession } from '../types';
import { calculateInvestorStats, formatCurrency, formatDate } from '../services/storage';
import {
  Plus,
  ArrowDownRight,
  History,
  Trash2,
  Edit
} from 'lucide-react';

interface InvestorsViewProps {
  session: UserSession;
  investors: Investor[];
  simCards: SimCard[];
  expenses: Expense[];
  sales: Sale[];
  withdrawals: WithdrawalRecord[];
  onOpenAddInvestor: () => void;
  onOpenWithdrawalModal: (investorId?: string) => void;
  onEditInvestor: (investor: Investor) => void;
  onDeleteInvestor: (investorId: string) => void;
  onDeleteWithdrawal: (withdrawalId: string) => void;
}

export const InvestorsView: React.FC<InvestorsViewProps> = ({
  session,
  investors,
  simCards,
  expenses,
  sales,
  withdrawals,
  onOpenAddInvestor,
  onOpenWithdrawalModal,
  onEditInvestor,
  onDeleteInvestor,
  onDeleteWithdrawal
}) => {
  const [activeTab, setActiveTab] = useState<'portfolios' | 'withdrawals'>('portfolios');
  const isFounder = session.role === 'founder';

  // Compute stats for all investors
  const statsList = investors.map((inv) =>
    calculateInvestorStats(inv, simCards, expenses, sales, withdrawals)
  );

  const totalCapitalCommitted = investors.reduce((sum, i) => sum + i.amountInvested, 0);
  const totalCapitalDeployedInSIMs = statsList.reduce((sum, s) => sum + s.simsPurchasedCost, 0);
  const totalRevenueGenerated = statsList.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalInvestorProfitPaidOut = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60 font-semibold uppercase tracking-wider">
              Founder Exclusive Portal
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Investors Portfolio & Capital Settlements
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Oversee investor capital commitments, VIP SIM allocations, profit split shares, and withdrawals. Full edit & delete permissions active.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddInvestor}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard Investor</span>
          </button>
          <button
            onClick={() => onOpenWithdrawalModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-950/80 hover:bg-amber-900 border border-amber-800/80 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowDownRight className="h-4 w-4 text-amber-400" />
            <span>Process Withdrawal</span>
          </button>
        </div>
      </div>

      {/* Aggregate Capital Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-xs text-neutral-400">Total Committed Capital</div>
          <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">
            {formatCurrency(totalCapitalCommitted)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Across {investors.length} investor entities (incl. GVN)
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-xs text-neutral-400">Capital Deployed in SIMs</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1 tabular-nums">
            {formatCurrency(totalCapitalDeployedInSIMs)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Active VIP stock purchase value
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-xs text-neutral-400">Total Sales Revenue</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">
            {formatCurrency(totalRevenueGenerated)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Realized cash collections
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-xs text-neutral-400">Total Payouts / Withdrawals</div>
          <div className="text-2xl font-bold text-amber-300 font-mono mt-1 tabular-nums">
            {formatCurrency(totalInvestorProfitPaidOut)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Principal + profit dividends distributed
          </div>
        </div>
      </div>

      {/* Segmented sub-tab */}
      <div className="flex border-b border-neutral-800 gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('portfolios')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'portfolios'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Active Investor Portfolios & Utilization ({investors.length})
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'withdrawals'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Withdrawals & Settlement Ledger ({withdrawals.length})</span>
        </button>
      </div>

      {activeTab === 'portfolios' ? (
        <div className="space-y-4">
          {statsList.map((stat) => {
            const isGvn = stat.investor.id === 'inv_gvn';
            const isClosed = stat.investor.status === 'closed';

            return (
              <div
                key={stat.investor.id}
                className={`rounded-xl border p-5 transition-all ${
                  isClosed
                    ? 'border-neutral-800 bg-neutral-950/40 opacity-75'
                    : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                }`}
              >
                {/* Investor Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-neutral-800/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {stat.investor.name}
                      </h3>
                      {isGvn && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold">
                          INTERNAL TREASURY
                        </span>
                      )}
                      {isClosed && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-900/60 font-mono font-semibold">
                          CLOSED ACCOUNT
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 mt-1 flex flex-wrap items-center gap-2">
                      <span>Phone: <strong className="text-neutral-200 font-mono">{stat.investor.contact}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Timeline: <strong className="text-amber-400">{stat.investor.timelineLabel || `${stat.investor.timelineDays} Days`}</strong> ({stat.activeDays} days active)</span>
                      <span aria-hidden="true">·</span>
                      <span>Profit Split: <strong className="text-amber-400 font-mono">{stat.investor.profitSharePercent}% Investor</strong> / <strong className="text-neutral-300 font-mono">{100 - stat.investor.profitSharePercent}% GVN</strong></span>
                    </div>
                  </div>

                  {/* Actions for Imran */}
                  <div className="flex items-center gap-2">
                    {!isClosed && !isGvn && (
                      <button
                        onClick={() => onOpenWithdrawalModal(stat.investor.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowDownRight className="h-3.5 w-3.5" />
                        <span>Withdraw / Close</span>
                      </button>
                    )}
                    {isFounder && (
                      <button
                        onClick={() => onEditInvestor(stat.investor)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                    {isFounder && !isGvn && (
                      <button
                        onClick={() => onDeleteInvestor(stat.investor.id)}
                        title="Delete investor profile"
                        className="flex items-center gap-1 p-1.5 text-neutral-400 hover:text-red-400 bg-neutral-800/80 hover:bg-red-950/30 rounded-lg border border-neutral-700 hover:border-red-900/50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Capital Utilization Progress Bar */}
                <div className="mt-4 pt-1">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-neutral-400 font-medium">
                      Capital Deployment / Utilization:
                    </span>
                    <span className="font-mono text-neutral-300">
                      {formatCurrency(stat.simsPurchasedCost)} of {formatCurrency(stat.amountInvested)} (
                      <strong className={stat.isFullyUtilized ? 'text-amber-400' : 'text-emerald-400'}>
                        {Math.round(stat.utilizationRate)}%
                      </strong>)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stat.isOverUtilized
                          ? 'bg-red-500'
                          : stat.isFullyUtilized
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, stat.utilizationRate)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
                    <span>
                      {stat.unallocatedCapital > 0
                        ? `Available Capital for more VIP SIMs: ${formatCurrency(stat.unallocatedCapital)}`
                        : 'Fully Allocated to VIP numbers'}
                    </span>
                    <span>{stat.simsPurchasedCount} SIM Cards Mapped</span>
                  </div>
                </div>

                {/* Formula Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-4 pt-3 border-t border-neutral-800/60 text-xs">
                  <div className="bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/80">
                    <div className="text-[10px] text-neutral-400">Amount Invested</div>
                    <div className="font-bold text-white font-mono mt-0.5 tabular-nums">
                      {formatCurrency(stat.amountInvested)}
                    </div>
                  </div>
                  <div className="bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/80">
                    <div className="text-[10px] text-neutral-400">SIM Purchased</div>
                    <div className="font-bold text-amber-400 font-mono mt-0.5 tabular-nums">
                      {formatCurrency(stat.simsPurchasedCost)}
                    </div>
                  </div>
                  <div className="bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/80">
                    <div className="text-[10px] text-neutral-400">Amount Spent</div>
                    <div className="font-bold text-neutral-300 font-mono mt-0.5 tabular-nums">
                      {formatCurrency(stat.simsPurchasedCost + stat.totalExpenses)}
                    </div>
                  </div>
                  <div className="bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/80">
                    <div className="text-[10px] text-neutral-400">SIM Sold</div>
                    <div className="font-bold text-emerald-400 font-mono mt-0.5 tabular-nums">
                      {stat.simsSoldCount} of {stat.simsPurchasedCount}
                    </div>
                  </div>
                  <div className="bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/80">
                    <div className="text-[10px] text-neutral-400">Total Revenue</div>
                    <div className="font-bold text-emerald-400 font-mono mt-0.5 tabular-nums">
                      {formatCurrency(stat.totalRevenue)}
                    </div>
                  </div>
                  <div className="bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/80">
                    <div className="text-[10px] text-neutral-400">Expenses</div>
                    <div className="font-bold text-red-400 font-mono mt-0.5 tabular-nums">
                      {formatCurrency(stat.totalExpenses)}
                    </div>
                  </div>
                  <div className="bg-amber-950/30 p-2 rounded-lg border border-amber-500/40">
                    <div className="text-[10px] text-amber-300 font-semibold">Balance Amount</div>
                    <div className="font-black text-amber-300 font-mono mt-0.5 tabular-nums">
                      {formatCurrency(stat.currentBalance)}
                    </div>
                  </div>
                </div>

                {stat.investor.notes && (
                  <p className="text-[11px] text-neutral-400 mt-3 pt-2 border-t border-neutral-800/40 italic">
                    Note: {stat.investor.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Withdrawals Ledger */
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Investor Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Payout Amount</th>
                  <th className="px-4 py-3">Balance Before</th>
                  <th className="px-4 py-3">Balance After</th>
                  <th className="px-4 py-3">Processed By</th>
                  <th className="px-4 py-3">Notes</th>
                  {isFounder && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={isFounder ? 9 : 8} className="px-4 py-10 text-center text-neutral-500">
                      No withdrawals or settlements executed yet.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-neutral-800/30">
                      <td className="px-4 py-3 font-mono text-neutral-300">
                        {formatDate(w.date)}
                      </td>
                      <td className="px-4 py-3 font-bold text-white">
                        {w.investorName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold text-[11px] ${
                            w.type === 'full_closure' ? 'text-red-400' : 'text-amber-400'
                          }`}
                        >
                          {w.type === 'full_closure' ? 'Full Closure' : 'Part Withdrawal'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-400 font-mono tabular-nums">
                        {formatCurrency(w.amount)}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 font-mono tabular-nums">
                        {formatCurrency(w.balanceBefore)}
                      </td>
                      <td className="px-4 py-3 text-neutral-200 font-mono tabular-nums font-semibold">
                        {formatCurrency(w.balanceAfter)}
                      </td>
                      <td className="px-4 py-3 text-neutral-400">
                        {w.processedBy}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 max-w-xs truncate">
                        {w.notes || '—'}
                      </td>
                      {isFounder && (
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onDeleteWithdrawal(w.id)}
                            title="Delete this withdrawal record"
                            className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
