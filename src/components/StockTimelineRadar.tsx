import React, { useState } from 'react';
import { Investor, SimCard, Expense, Sale, WithdrawalRecord, UserSession } from '../types';
import { calculateInvestorStats, formatCurrency } from '../services/storage';
import {
  Clock,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Tag,
  AlertTriangle,
  Target,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface StockTimelineRadarProps {
  session: UserSession;
  investors: Investor[];
  simCards: SimCard[];
  expenses: Expense[];
  sales: Sale[];
  withdrawals: WithdrawalRecord[];
  onOpenSaleModal?: (simId?: string) => void;
  onOpenWithdrawalModal?: (investorId?: string) => void;
}

export const StockTimelineRadar: React.FC<StockTimelineRadarProps> = ({
  session,
  investors,
  simCards,
  expenses,
  sales,
  withdrawals,
  onOpenSaleModal,
  onOpenWithdrawalModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'timelines' | 'unsold' | 'summary'>('timelines');

  // 1. Calculate Near Timelines
  const today = new Date();
  const activeInvestors = investors.filter((i) => i.status === 'active');

  const investorsTimelineAnalysis = activeInvestors.map((inv) => {
    const stats = calculateInvestorStats(inv, simCards, expenses, sales, withdrawals);
    const start = new Date(inv.startDate);
    const elapsedDays = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const totalDays = inv.timelineDays || 180;
    const daysRemaining = totalDays - elapsedDays;

    let urgency: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'NORMAL' = 'NORMAL';
    if (daysRemaining <= 0) {
      urgency = 'CRITICAL'; // Overdue / Expired
    } else if (daysRemaining <= 30) {
      urgency = 'HIGH'; // Due within 30 days
    } else if (daysRemaining <= 60) {
      urgency = 'MODERATE'; // Due within 60 days
    }

    return {
      investor: inv,
      stats,
      elapsedDays,
      totalDays,
      daysRemaining,
      urgency
    };
  });

  // Sort: most urgent first (lowest days remaining)
  const sortedTimelineInvestors = [...investorsTimelineAnalysis].sort(
    (a, b) => a.daysRemaining - b.daysRemaining
  );

  const nearTimelineInvestors = sortedTimelineInvestors.filter(
    (item) => item.urgency === 'CRITICAL' || item.urgency === 'HIGH' || item.urgency === 'MODERATE'
  );

  // 2. Calculate Unsold SIM Cards
  const unsoldSims = simCards.filter((s) => s.status === 'Available');
  const unsoldTotalValue = unsoldSims.reduce((sum, s) => sum + s.purchasePrice, 0);

  const unsoldSimsAnalysis = unsoldSims.map((sim) => {
    const purchaseDate = new Date(sim.purchaseDate);
    const daysInStock = Math.max(0, Math.ceil((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)));
    const mappedInv = investors.find((i) => i.id === sim.mappedInvestorId);

    // Aging risk calculation
    let agingRisk: 'High Aging (>90d)' | 'Moderate (30-90d)' | 'Fresh (<30d)' = 'Fresh (<30d)';
    if (daysInStock > 90 || sim.activationPeriod === 'Above 90 Days') {
      agingRisk = 'High Aging (>90d)';
    } else if (daysInStock > 30) {
      agingRisk = 'Moderate (30-90d)';
    }

    return {
      sim,
      daysInStock,
      agingRisk,
      mappedInvestorName: mappedInv ? mappedInv.name : 'GVN Company Treasury',
      recommendedTargetPrice: Math.round(sim.purchasePrice * 1.45)
    };
  });

  // Sort unsold SIMs by highest capital cost / holding duration
  const sortedUnsoldSims = [...unsoldSimsAnalysis].sort(
    (a, b) => b.sim.purchasePrice - a.sim.purchasePrice
  );

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-neutral-900/60 p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
              Portfolio Operations Radar
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
            Investor Timeline Watch & Unsold Stock Matrix
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time tracking of nearing investor agreement maturities and available unsold VIP SIM inventory.
          </p>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
        {/* Metric 1: Near Timelines */}
        <div
          onClick={() => setActiveSubTab('timelines')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'timelines'
              ? 'border-amber-500/60 bg-amber-950/20 shadow-xs'
              : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Timelines Nearing Maturity</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono mt-1 tabular-nums">
            {nearTimelineInvestors.length} Investors
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Due in ≤ 60 days or cycle overdue
          </div>
        </div>

        {/* Metric 2: Unsold VIP SIMs */}
        <div
          onClick={() => setActiveSubTab('unsold')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'unsold'
              ? 'border-amber-500/60 bg-amber-950/20 shadow-xs'
              : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Unsold VIP Numbers (In Stock)</span>
            <Tag className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1 tabular-nums">
            {unsoldSims.length} Numbers
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            Capital tied: <strong className="text-neutral-300 font-mono">{formatCurrency(unsoldTotalValue)}</strong>
          </div>
        </div>

        {/* Metric 3: Executive Action Summary */}
        <div
          onClick={() => setActiveSubTab('summary')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeSubTab === 'summary'
              ? 'border-amber-500/60 bg-amber-950/20 shadow-xs'
              : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Capital Strategy Plan</span>
            <Target className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-neutral-200 mt-1">
            Active Liquidation Directives
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Pricing markup & sales target push
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-neutral-800 mt-6 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('timelines')}
          className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'timelines'
              ? 'border-amber-400 text-amber-400 font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Investors With Near Timelines ({nearTimelineInvestors.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('unsold')}
          className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'unsold'
              ? 'border-amber-400 text-amber-400 font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          <span>Unsold VIP Mobile Numbers ({unsoldSims.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('summary')}
          className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'summary'
              ? 'border-amber-400 text-amber-400 font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span>Sales & Liquidation Strategy</span>
        </button>
      </div>

      {/* Tab 1: Investors With Near Timelines */}
      {activeSubTab === 'timelines' && (
        <div className="mt-4 space-y-3">
          <div className="text-xs text-neutral-400 flex items-center justify-between">
            <span>Investors sorted by timeline deadline urgency (agreement days remaining):</span>
            <span className="font-mono text-[11px] text-amber-400">Total active entities: {activeInvestors.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {sortedTimelineInvestors.map((item) => {
              const isOverdue = item.daysRemaining <= 0;
              const isNear = item.daysRemaining <= 30 && !isOverdue;
              const isModerate = item.daysRemaining > 30 && item.daysRemaining <= 60;

              return (
                <div
                  key={item.investor.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isOverdue
                      ? 'border-red-500/60 bg-red-950/20'
                      : isNear
                      ? 'border-amber-500/60 bg-amber-950/20'
                      : isModerate
                      ? 'border-yellow-600/40 bg-neutral-950/60'
                      : 'border-neutral-800 bg-neutral-950/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.investor.name}</h4>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Agreement Timeline: <span className="text-neutral-200 font-medium">{item.totalDays} Days</span> ({item.elapsedDays}d elapsed)
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                        isOverdue
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : isNear
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : isModerate
                          ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {isOverdue
                        ? `OVERDUE (${Math.abs(item.daysRemaining)}d)`
                        : `${item.daysRemaining} DAYS LEFT`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-neutral-800/80 text-xs">
                    <div>
                      <div className="text-[10px] text-neutral-500">Committed Capital</div>
                      <div className="font-bold text-white font-mono mt-0.5 tabular-nums">
                        {formatCurrency(item.investor.amountInvested)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-500">SIMs Sold / Total</div>
                      <div className="font-bold text-emerald-400 font-mono mt-0.5 tabular-nums">
                        {item.stats.simsSoldCount} of {item.stats.simsPurchasedCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-500">Current Balance</div>
                      <div className="font-bold text-amber-300 font-mono mt-0.5 tabular-nums">
                        {formatCurrency(item.stats.currentBalance)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-400">
                      Split: <strong className="text-amber-400 font-mono">{item.investor.profitSharePercent}%</strong> / <strong className="text-neutral-300 font-mono">{100 - item.investor.profitSharePercent}%</strong>
                    </span>
                    {session.role === 'founder' && item.investor.id !== 'inv_gvn' && onOpenWithdrawalModal && (
                      <button
                        type="button"
                        onClick={() => onOpenWithdrawalModal(item.investor.id)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <span>Reconcile / Settle</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Unsold VIP SIM Cards */}
      {activeSubTab === 'unsold' && (
        <div className="mt-4 space-y-3">
          <div className="text-xs text-neutral-400 flex items-center justify-between">
            <span>List of VIP numbers currently available for sale in inventory:</span>
            <span className="font-mono text-emerald-400 font-semibold">Total Stock Cost: {formatCurrency(unsoldTotalValue)}</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900/90 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
                  <tr>
                    <th className="px-4 py-3">Unsold VIP Number</th>
                    <th className="px-4 py-3">Carrier / Pattern</th>
                    <th className="px-4 py-3">Capital Locked (Cost)</th>
                    <th className="px-4 py-3">Holding Duration</th>
                    <th className="px-4 py-3">Connected Investor</th>
                    <th className="px-4 py-3">Target Selling Price</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {sortedUnsoldSims.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                        All VIP numbers have been sold! Zero unsold stock in inventory.
                      </td>
                    </tr>
                  ) : (
                    sortedUnsoldSims.map((item) => (
                      <tr key={item.sim.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-amber-300 text-sm">
                          {item.sim.simNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{item.sim.carrier}</div>
                          <div className="text-[10px] text-neutral-400">{item.sim.category}</div>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-white tabular-nums">
                          {formatCurrency(item.sim.purchasePrice)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-[11px] ${
                              item.daysInStock > 60 ? 'text-amber-400 font-semibold' : 'text-neutral-400'
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            <span>{item.daysInStock} Days in Stock</span>
                          </span>
                          <div className="text-[10px] text-neutral-500">
                            {item.sim.activationPeriod}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-300">
                          {item.mappedInvestorName}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400 tabular-nums">
                          {formatCurrency(item.recommendedTargetPrice)}
                          <span className="text-[10px] text-neutral-500 font-normal ml-1">(+45%)</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {(session.role === 'founder' || session.role === 'sales1' || session.role === 'sales2') && onOpenSaleModal && (
                            <button
                              type="button"
                              onClick={() => onOpenSaleModal(item.sim.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded shadow-xs transition-colors cursor-pointer"
                            >
                              Sell Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sales & Liquidation Strategy */}
      {activeSubTab === 'summary' && (
        <div className="mt-4 space-y-4">
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/70 space-y-3">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              <span>Capital Exposure & Inventory Action Plan</span>
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              GVN currently holds <strong className="text-white">{unsoldSims.length} unsold VIP mobile numbers</strong> representing{' '}
              <strong className="text-amber-300 font-mono">{formatCurrency(unsoldTotalValue)}</strong> in acquisition capital.
              There are <strong className="text-white">{nearTimelineInvestors.length} investor agreements</strong> requiring attention within 60 days or currently overdue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-2">
              <span className="font-bold text-white block">Priorities for Sales Team (Sales 1 & Sales 2)</span>
              <ul className="space-y-1.5 list-disc list-inside text-neutral-400 text-[11px]">
                <li>Focus customer presentations on high-cost unsold stock to recover investor capital.</li>
                <li>Pitch rare sequences to luxury real estate executives, corporate brands, and HNW patrons.</li>
                <li>Target a baseline markup of 40% to 50% above original acquisition cost.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-2">
              <span className="font-bold text-white block">Directives for Founder (Imran)</span>
              <ul className="space-y-1.5 list-disc list-inside text-neutral-400 text-[11px]">
                <li>Review the {nearTimelineInvestors.length} investors nearing maturity for interim profit dividend payouts.</li>
                <li>Offer timeline extensions or roll-over tranches for high-performing capital partners.</li>
                <li>Maintain minimum unallocated capital buffer before purchasing new speculative inventory.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
