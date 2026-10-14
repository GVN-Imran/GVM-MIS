import React, { useState } from 'react';
import { Investor, SimCard, Expense, Sale, WithdrawalRecord } from '../types';
import { calculateInvestorStats, formatCurrency } from '../services/storage';
import { X, ArrowDownRight, AlertTriangle } from 'lucide-react';

interface InvestorWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  investors: Investor[];
  simCards: SimCard[];
  expenses: Expense[];
  sales: Sale[];
  withdrawals: WithdrawalRecord[];
  initialInvestorId?: string;
  onConfirmWithdrawal: (
    investorId: string,
    withdrawalAmount: number,
    isClosingAccount: boolean,
    notes: string
  ) => void;
}

export const InvestorWithdrawalModal: React.FC<InvestorWithdrawalModalProps> = ({
  isOpen,
  onClose,
  investors,
  simCards,
  expenses,
  sales,
  withdrawals,
  initialInvestorId,
  onConfirmWithdrawal
}) => {
  if (!isOpen) return null;

  // Filter out default internal treasury GVN from investor withdrawals if needed, or allow all
  const activeInvestors = investors.filter((i) => i.status === 'active' && i.id !== 'inv_gvn');
  const defaultId = initialInvestorId || activeInvestors[0]?.id || investors[0]?.id;
  const [selectedInvestorId, setSelectedInvestorId] = useState(defaultId);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(10000);
  const [withdrawalType, setWithdrawalType] = useState<'part' | 'full_closure'>('part');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedInvestor = investors.find((i) => i.id === selectedInvestorId);
  const stats = selectedInvestor
    ? calculateInvestorStats(selectedInvestor, simCards, expenses, sales, withdrawals)
    : null;

  const handleSetMax = () => {
    if (stats) {
      setWithdrawalAmount(stats.currentBalance);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!selectedInvestor || !stats) {
      setErrorMessage('Please select a valid investor.');
      return;
    }
    if (withdrawalAmount <= 0) {
      setErrorMessage('Withdrawal amount must be greater than zero.');
      return;
    }
    if (withdrawalAmount > stats.currentBalance) {
      setErrorMessage(
        `Withdrawal amount cannot exceed available balance of ${formatCurrency(stats.currentBalance)}.`
      );
      return;
    }

    onConfirmWithdrawal(
      selectedInvestor.id,
      Number(withdrawalAmount),
      withdrawalType === 'full_closure',
      notes.trim() ||
        (withdrawalType === 'full_closure'
          ? 'Full settlement and account closure.'
          : 'Part withdrawal dividend/principal payout.')
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-7 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60 font-semibold uppercase tracking-wider">
                Founder Restricted Access
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Investor Withdrawal & Profit Settlement
            </h2>
            <p className="text-xs text-neutral-400">
              Real-time portfolio reconciliation: Revenue, capital cost, expense deduction, and percentage split.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Investor Selector */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Select Active Investor Account
          </label>
          <select
            value={selectedInvestorId}
            onChange={(e) => {
              setSelectedInvestorId(e.target.value);
              setErrorMessage('');
            }}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-amber-300 font-semibold focus:border-amber-400 focus:outline-hidden"
          >
            {investors.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.name} — Invested: {formatCurrency(inv.amountInvested)} ({inv.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Real-time Formula Breakdown */}
        {stats && selectedInvestor && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2 mb-3">
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Reconciliation Ledger Breakdown
                </span>
                <span className="text-xs text-neutral-400">
                  Split Ratio: <strong className="text-amber-400 font-mono">{selectedInvestor.profitSharePercent}% Investor</strong> / <strong className="text-neutral-200 font-mono">{100 - selectedInvestor.profitSharePercent}% GVN</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-lg bg-neutral-900/60 p-2.5 border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">1. Amount Invested</div>
                  <div className="text-sm font-bold text-neutral-100 font-mono mt-0.5 tabular-nums">
                    {formatCurrency(stats.amountInvested)}
                  </div>
                </div>

                <div className="rounded-lg bg-neutral-900/60 p-2.5 border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">2. SIM Purchased</div>
                  <div className="text-sm font-semibold text-amber-400 font-mono mt-0.5 tabular-nums">
                    {formatCurrency(stats.simsPurchasedCost)}
                  </div>
                  <div className="text-[10px] text-neutral-500">{stats.simsPurchasedCount} SIM cards total</div>
                </div>

                <div className="rounded-lg bg-neutral-900/60 p-2.5 border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">3. Amount Spent</div>
                  <div className="text-sm font-semibold text-red-400 font-mono mt-0.5 tabular-nums">
                    {formatCurrency(stats.simsPurchasedCost + stats.totalExpenses)}
                  </div>
                  <div className="text-[10px] text-neutral-500">SIM cost + expenses</div>
                </div>

                <div className="rounded-lg bg-neutral-900/60 p-2.5 border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">4. SIM Sold</div>
                  <div className="text-sm font-semibold text-emerald-400 font-mono mt-0.5 tabular-nums">
                    {stats.simsSoldCount} Sold
                  </div>
                  <div className="text-[10px] text-neutral-500">{stats.simsPurchasedCount - stats.simsSoldCount} in stock</div>
                </div>

                <div className="rounded-lg bg-neutral-900/60 p-2.5 border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">5. Total Revenue</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5 tabular-nums">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                </div>

                <div className="rounded-lg bg-neutral-900/60 p-2.5 border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">6. Expenses</div>
                  <div className="text-sm font-semibold text-red-400 font-mono mt-0.5 tabular-nums">
                    {formatCurrency(stats.totalExpenses)}
                  </div>
                  <div className="text-[10px] text-neutral-500">Activation/Travel</div>
                </div>

                <div className="rounded-lg bg-amber-950/20 p-2.5 border border-amber-500/30">
                  <div className="text-[11px] text-amber-300 font-medium">7. Investor Share ({selectedInvestor.profitSharePercent}%)</div>
                  <div className="text-sm font-bold text-amber-300 font-mono mt-0.5 tabular-nums">
                    {formatCurrency(stats.investorProfitShareAmount)}
                  </div>
                  <div className="text-[10px] text-neutral-400">Realized Profit Cut</div>
                </div>

                <div className="rounded-lg bg-neutral-900/60 p-2.5 border border-neutral-800">
                  <div className="text-[11px] text-neutral-400">8. GVN Treasury Share</div>
                  <div className="text-sm font-bold text-amber-400 font-mono mt-0.5 tabular-nums">
                    {formatCurrency(stats.gvnProfitShareAmount)}
                  </div>
                  <div className="text-[10px] text-neutral-400">{100 - selectedInvestor.profitSharePercent}% Company Cut</div>
                </div>
              </div>

              {/* Balance Highlight Card */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-neutral-900/40 p-3 rounded-lg">
                <div>
                  <div className="text-xs text-neutral-400">
                    Net Available Withdrawable Balance:
                  </div>
                  <div className="text-2xl font-black text-white font-mono mt-0.5 tabular-nums">
                    {formatCurrency(stats.currentBalance)}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    (Invested - SIM Purchases + Realized Revenue - Expenses - Past Withdrawals: {formatCurrency(stats.totalWithdrawn)})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-400 border border-amber-500/40 hover:bg-amber-950/40 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
                >
                  Withdraw Max ({formatCurrency(stats.currentBalance)})
                </button>
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-lg border border-red-500/40 bg-red-950/40 text-xs text-red-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Input Withdrawal Amount (₹ INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 font-mono font-bold">₹</span>
                  <input
                    type="number"
                    min="100"
                    max={stats.currentBalance || undefined}
                    step="500"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                    required
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 pl-8 pr-3.5 py-2.5 text-base text-amber-300 font-bold font-mono focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
                  <span>Minimum: ₹100</span>
                  <span>Balance after payout: <strong className="text-neutral-200 font-mono">{formatCurrency(Math.max(0, stats.currentBalance - withdrawalAmount))}</strong></span>
                </div>
              </div>

              {/* Account Status Question */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <label className="block text-xs font-semibold text-neutral-200 mb-2">
                  Account Resolution Protocol *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      withdrawalType === 'part'
                        ? 'border-amber-500/60 bg-amber-950/20'
                        : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="withdrawalType"
                      value="part"
                      checked={withdrawalType === 'part'}
                      onChange={() => setWithdrawalType('part')}
                      className="mt-0.5 text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <div className="text-xs font-semibold text-neutral-200">
                        Continue with Part Withdrawal
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Deduct amount and keep investor active for ongoing cycles & new SIMs.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      withdrawalType === 'full_closure'
                        ? 'border-red-500/60 bg-red-950/20'
                        : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="withdrawalType"
                      value="full_closure"
                      checked={withdrawalType === 'full_closure'}
                      onChange={() => setWithdrawalType('full_closure')}
                      className="mt-0.5 text-red-500 focus:ring-red-400"
                    />
                    <div>
                      <div className="text-xs font-semibold text-neutral-200">
                        Close Account (Full Settlement)
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Liquidate remaining position, mark account as Closed, and archive record.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Settlement Notes / Wire Reference
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Standard Chartered wire TXN #882910 to investor holding account."
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stats.currentBalance <= 0}
                  className="px-5 py-2.5 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  <ArrowDownRight className="h-4 w-4" />
                  <span>
                    Execute {withdrawalType === 'full_closure' ? 'Final Settlement & Closure' : 'Payout'} (
                    {formatCurrency(withdrawalAmount)})
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
