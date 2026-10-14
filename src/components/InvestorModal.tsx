import React, { useState } from 'react';
import { Investor } from '../types';
import { X, Briefcase } from 'lucide-react';

interface InvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (investor: Omit<Investor, 'id'>) => void;
  editingInvestor?: Investor | null;
}

export const InvestorModal: React.FC<InvestorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingInvestor
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(editingInvestor?.name || '');
  const [contact, setContact] = useState(editingInvestor?.contact || '');
  const [email, setEmail] = useState(editingInvestor?.email || '');
  const [amountInvested, setAmountInvested] = useState<number>(
    editingInvestor?.amountInvested || 50000
  );
  const [startDate, setStartDate] = useState(
    editingInvestor?.startDate || new Date().toISOString().split('T')[0]
  );
  const [timelineDays, setTimelineDays] = useState<number>(
    editingInvestor?.timelineDays || 180
  );
  const [timelineLabel, setTimelineLabel] = useState(
    editingInvestor?.timelineLabel || '180 Days (6 Months)'
  );
  const [profitSharePercent, setProfitSharePercent] = useState<number>(
    editingInvestor?.profitSharePercent || 60
  );
  const [notes, setNotes] = useState(editingInvestor?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amountInvested <= 0) return;

    onSave({
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim() || undefined,
      amountInvested: Number(amountInvested),
      startDate,
      timelineDays: Number(timelineDays),
      timelineLabel,
      profitSharePercent: Number(profitSharePercent),
      status: editingInvestor?.status || 'active',
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-amber-400" />
              <span>{editingInvestor ? 'Update Investor Profile' : 'Onboard New Capital Investor'}</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Founder exclusive: define capital commitment, timelines, and profit distribution share
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
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Investor Full Name / Fund Entity *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Tele Holdings"
              required
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Contact Phone Number *
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91 98200 44555"
                required
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@holding.com"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Capital Invested (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-mono text-sm">₹</span>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={amountInvested}
                  onChange={(e) => setAmountInvested(Number(e.target.value))}
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 pl-8 pr-3 py-2 text-sm text-amber-300 font-bold font-mono focus:border-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Investor Profit Share (%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="90"
                  value={profitSharePercent}
                  onChange={(e) => setProfitSharePercent(Number(e.target.value))}
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 font-mono focus:border-amber-400 focus:outline-hidden pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">%</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                GVN Treasury receives: <span className="text-amber-400 font-mono">{100 - profitSharePercent}%</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Capital Deployment Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-amber-400 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Investment Timeline (in Days: 30 to 360) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="360"
                  value={timelineDays}
                  onChange={(e) => {
                    const days = Number(e.target.value);
                    setTimelineDays(days);
                    setTimelineLabel(`${days} Days`);
                  }}
                  required
                  placeholder="Enter 30 to 360 days"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 font-mono focus:border-amber-400 focus:outline-hidden pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-mono">
                  Days
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Flexible duration between 30 and 360 days
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Investor Strategy & Portfolio Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Priority acquisition of Royal Septa sequences, preferred payout cadence monthly."
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
              className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {editingInvestor ? 'Save Changes' : 'Confirm Investor Onboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
