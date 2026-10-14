import React, { useState, useMemo } from 'react';
import { SimCard, Investor, UserSession } from '../types';
import { formatCurrency, formatDate } from '../services/storage';
import {
  Search,
  Plus,
  Clock,
  Trash2,
  Edit,
  ShoppingCart,
  Receipt,
  Check
} from 'lucide-react';

interface SimInventoryViewProps {
  session: UserSession;
  simCards: SimCard[];
  investors: Investor[];
  onOpenAddSim: () => void;
  onEditSim: (sim: SimCard) => void;
  onDeleteSim: (simId: string) => void;
  onApproveSim: (simId: string) => void;
  onOpenSaleModal: (simId?: string) => void;
  onOpenExpenseModal: (simId?: string) => void;
}

export const SimInventoryView: React.FC<SimInventoryViewProps> = ({
  session,
  simCards,
  investors,
  onOpenAddSim,
  onEditSim,
  onDeleteSim,
  onApproveSim,
  onOpenSaleModal,
  onOpenExpenseModal
}) => {
  const isFounder = session.role === 'founder';
  const isAdmin = session.role === 'admin';
  const isSales = session.role === 'sales1' || session.role === 'sales2';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Sold'>('All');
  const [timelineFilter, setTimelineFilter] = useState<'All' | 'Under 90 Days' | 'Above 90 Days'>('All');
  const [investorFilter, setInvestorFilter] = useState<string>('All');

  const filteredSims = useMemo(() => {
    return simCards.filter((sim) => {
      const matchesSearch =
        sim.simNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.additionalDetails.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || sim.status === statusFilter;
      const matchesTimeline = timelineFilter === 'All' || sim.activationPeriod === timelineFilter;
      const matchesInvestor = investorFilter === 'All' || sim.mappedInvestorId === investorFilter;

      return matchesSearch && matchesStatus && matchesTimeline && matchesInvestor;
    });
  }, [simCards, searchQuery, statusFilter, timelineFilter, investorFilter]);

  const getInvestorName = (investorId: string) => {
    const inv = investors.find((i) => i.id === investorId);
    return inv ? inv.name : 'GVN (Company Treasury)';
  };

  return (
    <div className="space-y-5">
      {/* Top action & header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            VIP Mobile Numbers Inventory
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Total of {simCards.length} premium lines cataloged with investor allocations and timelines
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(isFounder || isAdmin) && (
            <button
              onClick={onOpenAddSim}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{isFounder ? 'Purchase VIP SIM' : 'Enter Sourced SIM'}</span>
            </button>
          )}
          {(isFounder || isSales) && (
            <button
              onClick={() => onOpenSaleModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Register Sale</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by VIP number (e.g. 7777, 8888), carrier, pattern..."
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 pl-9 pr-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden font-mono"
            />
          </div>

          {/* Timeline filter */}
          <div>
            <select
              value={timelineFilter}
              onChange={(e) => setTimelineFilter(e.target.value as any)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-amber-400 focus:outline-hidden"
            >
              <option value="All">All Timelines (Under & Above 90d)</option>
              <option value="Under 90 Days">Under 90 Days (Fast Turnover)</option>
              <option value="Above 90 Days">Above 90 Days (Vault)</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-amber-400 focus:outline-hidden"
            >
              <option value="All">All Statuses (Available & Sold)</option>
              <option value="Available">Available (In Stock)</option>
              <option value="Sold">Sold & Transferred</option>
            </select>
          </div>
        </div>

        {/* Investor Filter for Founder */}
        {isFounder && (
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80 text-xs">
            <span className="text-neutral-400 font-medium whitespace-nowrap">Filter by Mapped Investor:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setInvestorFilter('All')}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  investorFilter === 'All'
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'bg-neutral-950 text-neutral-300 border border-neutral-800 hover:border-neutral-600'
                }`}
              >
                All Entities
              </button>
              {investors.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => setInvestorFilter(inv.id)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    investorFilter === inv.id
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'bg-neutral-950 text-neutral-300 border border-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  {inv.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SIM Cards Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
              <tr>
                <th className="px-4 py-3">VIP Mobile Number</th>
                <th className="px-4 py-3">Carrier / Pattern</th>
                <th className="px-4 py-3">Timeline Cycle</th>
                <th className="px-4 py-3">Purchase Cost</th>
                <th className="px-4 py-3">Connected Investor</th>
                <th className="px-4 py-3">Status / Approval</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredSims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                    No VIP SIM cards match your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSims.map((sim) => {
                  const isAvailable = sim.status === 'Available';
                  const isPendingApproval = sim.approvalStatus === 'Pending Purchase Approval';

                  return (
                    <tr
                      key={sim.id}
                      className="hover:bg-neutral-800/30 transition-colors"
                    >
                      {/* VIP Number */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-sm text-neutral-100 font-mono tracking-wide">
                          {sim.simNumber}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                          {sim.additionalDetails || 'VIP Line Specification'}
                        </div>
                      </td>

                      {/* Carrier & Category */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-neutral-200">{sim.carrier}</div>
                        <div className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                          {sim.category}
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[11px] ${
                            sim.activationPeriod === 'Under 90 Days'
                              ? 'text-amber-400'
                              : 'text-blue-400'
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          <span>{sim.activationPeriod}</span>
                        </span>
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          Acquired {formatDate(sim.purchaseDate)}
                        </div>
                      </td>

                      {/* Purchase Cost */}
                      <td className="px-4 py-3.5 font-mono tabular-nums font-semibold text-neutral-200">
                        {formatCurrency(sim.purchasePrice)}
                      </td>

                      {/* Investor */}
                      <td className="px-4 py-3.5">
                        <div className="text-neutral-200 font-medium">
                          {getInvestorName(sim.mappedInvestorId)}
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          {sim.mappedInvestorId === 'inv_gvn' ? 'Internal Treasury' : 'Mapped Capital'}
                        </div>
                      </td>

                      {/* Status & Approval */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                              isAvailable ? 'text-emerald-400' : 'text-neutral-400'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                            <span>{sim.status}</span>
                          </span>
                          {isPendingApproval && (
                            <span className="text-[10px] text-amber-400 font-mono">
                              Pending Approval
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Founder Approval Button */}
                          {isFounder && isPendingApproval && (
                            <button
                              onClick={() => onApproveSim(sim.id)}
                              title="Approve and finalize purchase"
                              className="p-1.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* Sell Button if Available */}
                          {isAvailable && (isFounder || isSales) && (
                            <button
                              onClick={() => onOpenSaleModal(sim.id)}
                              title="Register sale to customer"
                              className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-[11px] font-medium cursor-pointer"
                            >
                              Sell
                            </button>
                          )}

                          {/* Expense Button */}
                          <button
                            onClick={() => onOpenExpenseModal(sim.id)}
                            title="Log expense on this SIM"
                            className="p-1.5 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                          </button>

                          {/* Edit (Founder or Admin) */}
                          {(isFounder || isAdmin) && (
                            <button
                              onClick={() => onEditSim(sim)}
                              title="Edit SIM details"
                              className="p-1.5 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Delete (Founder only) */}
                          {isFounder && (
                            <button
                              onClick={() => onDeleteSim(sim.id)}
                              title="Delete SIM card record"
                              className="p-1.5 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
