import React, { useState } from 'react';
import { SimCard, Investor, UserSession, ActivationPeriod, ApprovalStatus } from '../types';
import { X } from 'lucide-react';

interface SimInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sim: Partial<SimCard>) => void;
  investors: Investor[];
  session: UserSession;
  editingSim?: SimCard | null;
}

export const SimInventoryModal: React.FC<SimInventoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  investors,
  session,
  editingSim
}) => {
  if (!isOpen) return null;

  const isFounder = session.role === 'founder';
  const [simNumber, setSimNumber] = useState(editingSim?.simNumber || '');
  const [carrier, setCarrier] = useState(editingSim?.carrier || 'VI');
  const [category, setCategory] = useState(editingSim?.category || 'VIP Hexa');
  const [additionalDetails, setAdditionalDetails] = useState(editingSim?.additionalDetails || '');
  const [activationPeriod, setActivationPeriod] = useState<ActivationPeriod>(
    editingSim?.activationPeriod || 'Under 90 Days'
  );
  const [purchasePrice, setPurchasePrice] = useState<number>(editingSim?.purchasePrice || 15000);
  const [purchaseDate, setPurchaseDate] = useState(
    editingSim?.purchaseDate || new Date().toISOString().split('T')[0]
  );
  const [mappedInvestorId, setMappedInvestorId] = useState(
    editingSim?.mappedInvestorId || 'inv_gvn'
  );
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(
    editingSim?.approvalStatus || (isFounder ? 'Approved' : 'Pending Purchase Approval')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simNumber.trim()) return;

    onSave({
      id: editingSim?.id,
      simNumber: simNumber.trim(),
      carrier: carrier.trim(),
      category: category.trim(),
      additionalDetails: additionalDetails.trim(),
      activationPeriod,
      purchasePrice: Number(purchasePrice) || 0,
      purchaseDate,
      mappedInvestorId,
      approvalStatus,
      status: editingSim?.status || 'Available',
      sourcedBy: editingSim?.sourcedBy || session.userId,
      purchasedBy: approvalStatus === 'Approved' ? 'Imran' : undefined
    });
    onClose();
  };

  const selectedInvestor = investors.find((inv) => inv.id === mappedInvestorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-white">
              {editingSim ? 'Edit VIP SIM Card' : 'Register / Purchase New VIP SIM'}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Connect VIP mobile number with investor capital and activation cycle
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                VIP SIM Mobile Number *
              </label>
              <input
                type="text"
                value={simNumber}
                onChange={(e) => setSimNumber(e.target.value)}
                placeholder="+91 99999 77777"
                required
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Carrier / Telecom Operator
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-amber-400 focus:outline-hidden"
              >
                <option value="VI">VI (Vodafone Idea)</option>
                <option value="Airtel">Airtel</option>
                <option value="JiO">JiO</option>
                <option value="Airtel Black VIP">Airtel Black VIP</option>
                <option value="Jio Prime VIP">Jio Prime VIP</option>
                <option value="Etisalat UAE">Etisalat UAE</option>
                <option value="du Luxury Telecom">du Luxury Telecom</option>
                <option value="Other International VIP">Other International VIP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                VIP Classification / Pattern
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Royal Septa 7s, Mirror 888, Ladder 1-7"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Activation Period *
              </label>
              <select
                value={activationPeriod}
                onChange={(e) => setActivationPeriod(e.target.value as ActivationPeriod)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-amber-400 focus:outline-hidden"
              >
                <option value="Under 90 Days">Under 90 Days (Fast Turnover)</option>
                <option value="Above 90 Days">Above 90 Days (Long-term / Vault)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Purchase Price (₹ INR / Capital Cost) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-mono text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 pl-7 pr-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-amber-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Connected Investor Mapping */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-amber-300">
                Connected Active Investor Entity (Default: GVN) *
              </label>
              <span className="text-[11px] text-amber-400/80">
                Active Investors Only
              </span>
            </div>
            <select
              value={mappedInvestorId}
              onChange={(e) => setMappedInvestorId(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-amber-400 focus:outline-hidden"
            >
              {investors
                .filter((inv) => inv.status === 'active')
                .map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} ({inv.id === 'inv_gvn' ? 'Company Stock' : `${inv.profitSharePercent}% profit share`})
                  </option>
                ))}
            </select>
            {selectedInvestor && (
              <p className="text-[11px] text-neutral-400">
                Funded by: <span className="text-neutral-200 font-medium">{selectedInvestor.name}</span>
                {selectedInvestor.id !== 'inv_gvn' && (
                  <> · Profit Split: <span className="text-amber-400 font-mono">{selectedInvestor.profitSharePercent}%</span> Investor / <span className="text-amber-400 font-mono">{100 - selectedInvestor.profitSharePercent}%</span> GVN</>
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              SIM Package Details & Provenance
            </label>
            <textarea
              rows={2}
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="e.g. Clean line, VIP boxed packaging, KYC transfer ready, eSIM profile available"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden"
            />
          </div>

          {/* Sourcing / Purchase Approval Status */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs font-medium text-neutral-300 block">Purchase Authorization:</span>
              <span className="text-[11px] text-neutral-500">
                {isFounder
                  ? 'Founder authorization active (Immediate purchase)'
                  : 'Submitted by Admin for Founder approval'}
              </span>
            </div>
            {isFounder ? (
              <select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value as ApprovalStatus)}
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-amber-400 focus:border-amber-400 focus:outline-hidden"
              >
                <option value="Approved">Approved & Purchased</option>
                <option value="Pending Purchase Approval">Pending Review</option>
              </select>
            ) : (
              <span className="text-xs font-medium text-blue-400 px-2 py-1 bg-blue-950/40 rounded border border-blue-900/60">
                {approvalStatus}
              </span>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {editingSim ? 'Update VIP SIM' : 'Confirm Purchase & Map SIM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
