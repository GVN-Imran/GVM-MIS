import React, { useState, useEffect } from 'react';
import { SimCard, Sale, UserSession, Investor } from '../types';
import { X, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../services/storage';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sale: Partial<Sale>, mappedInvestorId?: string) => void;
  availableSims: SimCard[];
  allSims?: SimCard[];
  investors: Investor[];
  session: UserSession;
  preSelectedSimId?: string;
  editingSale?: Sale | null;
}

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  availableSims,
  allSims = [],
  investors,
  session,
  preSelectedSimId,
  editingSale
}) => {
  if (!isOpen) return null;

  // If editing an existing sale, allow finding its SIM from allSims
  const selectableSims = editingSale
    ? allSims.filter((s) => s.id === editingSale.simCardId || s.status === 'Available')
    : availableSims;

  const defaultSim = selectableSims.find(
    (s) => s.id === (editingSale?.simCardId || preSelectedSimId)
  ) || selectableSims[0];

  const [selectedSimId, setSelectedSimId] = useState(editingSale?.simCardId || defaultSim?.id || '');
  const [customerName, setCustomerName] = useState(editingSale?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(editingSale?.customerPhone || '');
  const [customerEmail, setCustomerEmail] = useState(editingSale?.customerEmail || '');
  const [amountCollected, setAmountCollected] = useState<number>(
    editingSale?.amountCollected || (defaultSim ? Math.round(defaultSim.purchasePrice * 1.4) : 25000)
  );
  const [paymentMethod, setPaymentMethod] = useState(editingSale?.paymentMethod || 'Bank Wire Transfer');
  const [notes, setNotes] = useState(editingSale?.notes || '');
  const [date, setDate] = useState(
    editingSale?.date || new Date().toISOString().split('T')[0]
  );

  // Active investors only
  const activeInvestors = investors.filter((i) => i.status === 'active');
  const currentSim = selectableSims.find((s) => s.id === selectedSimId) || allSims.find((s) => s.id === selectedSimId);
  const [selectedInvestorId, setSelectedInvestorId] = useState<string>(
    currentSim?.mappedInvestorId || 'inv_gvn'
  );

  useEffect(() => {
    if (currentSim?.mappedInvestorId) {
      setSelectedInvestorId(currentSim.mappedInvestorId);
    }
  }, [currentSim]);

  const handleSimChange = (simId: string) => {
    setSelectedSimId(simId);
    const sim = selectableSims.find((s) => s.id === simId);
    if (sim) {
      if (!editingSale) {
        setAmountCollected(Math.round(sim.purchasePrice * 1.4));
      }
      setSelectedInvestorId(sim.mappedInvestorId || 'inv_gvn');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSim || !customerName.trim() || !customerPhone.trim()) return;

    onSave(
      {
        id: editingSale?.id,
        date,
        simCardId: currentSim.id,
        simNumber: currentSim.simNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        amountCollected: Number(amountCollected) || 0,
        soldBy: editingSale?.soldBy || session.userId,
        soldByName: editingSale?.soldByName || session.name,
        paymentMethod,
        notes: notes.trim() || undefined
      },
      selectedInvestorId
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{editingSale ? 'Update VIP SIM Sale Record' : 'Register VIP SIM Sale'}</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Record customer acquisition, collected revenue, and ownership transfer
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {selectableSims.length === 0 && !editingSale ? (
          <div className="py-8 text-center">
            <p className="text-sm text-neutral-400">
              No available SIM cards in inventory right now. Please add or approve new VIP SIMs.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 text-xs font-medium text-white bg-neutral-800 rounded-lg hover:bg-neutral-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* SIM Card Selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Select VIP SIM Card *
              </label>
              <select
                value={selectedSimId}
                onChange={(e) => handleSimChange(e.target.value)}
                required
                disabled={!!editingSale}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-amber-300 font-mono focus:border-amber-400 focus:outline-hidden disabled:opacity-75"
              >
                {selectableSims.map((sim) => (
                  <option key={sim.id} value={sim.id}>
                    {sim.simNumber} · {sim.carrier} ({sim.category}) · Cost: {formatCurrency(sim.purchasePrice)}
                  </option>
                ))}
              </select>
              {currentSim && (
                <div className="mt-2 p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs flex justify-between items-center">
                  <span className="text-neutral-400">
                    Acquisition Cost: <strong className="text-neutral-200">{formatCurrency(currentSim.purchasePrice)}</strong>
                  </span>
                  <span className="text-neutral-400">
                    Cycle: <strong className="text-amber-400">{currentSim.activationPeriod}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Current Active Investor Mapping in Sales Input */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 space-y-1.5">
              <label className="block text-xs font-semibold text-amber-300">
                Connected Active Investor Entity *
              </label>
              <select
                value={selectedInvestorId}
                onChange={(e) => setSelectedInvestorId(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 focus:border-amber-400 focus:outline-hidden"
              >
                {activeInvestors.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} ({inv.id === 'inv_gvn' ? 'Company Treasury' : `${inv.profitSharePercent}% profit share`})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-neutral-400">
                Showing currently active investors only. Closed investor accounts are excluded.
              </p>
            </div>

            {/* Collected Revenue */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Amount Collected (Selling Price in ₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-mono text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={amountCollected}
                  onChange={(e) => setAmountCollected(Number(e.target.value))}
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 pl-8 pr-3 py-2 text-sm text-emerald-400 font-bold font-mono focus:border-emerald-400 focus:outline-hidden"
                />
              </div>
              {currentSim && amountCollected > 0 && (
                <p className="text-[11px] text-neutral-400 mt-1">
                  Gross Profit Margin: <span className="text-emerald-400 font-mono font-semibold">
                    {formatCurrency(amountCollected - currentSim.purchasePrice)}
                  </span> ({Math.round(((amountCollected - currentSim.purchasePrice) / currentSim.purchasePrice) * 100)}% Markup)
                </p>
              )}
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tariq Al-Futtaim"
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Customer Contact Phone *
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 99999 12345"
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Customer Email (Optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="client@vipholding.com"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Sale Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-amber-400 focus:outline-hidden"
                >
                  <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                  <option value="UPI / Instant Bank Transfer">UPI / Instant Bank Transfer</option>
                  <option value="Cash Deposit">Cash Deposit</option>
                  <option value="Corporate Cheque">Corporate Cheque</option>
                  <option value="USDT Crypto Settlement">USDT Crypto Settlement</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Registered By
                </label>
                <input
                  type="text"
                  disabled
                  value={editingSale ? editingSale.soldByName : `${session.name} (${session.userId})`}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Transaction Notes & Delivery Info
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. VIP line registered to client trade license, physical gold kit dispatched."
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden"
              />
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
                className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{editingSale ? 'Save Changes' : 'Confirm VIP Sale'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
