import React, { useState, useEffect } from 'react';
import { SimCard, Expense, ExpenseType, UserSession } from '../types';
import { X, Receipt } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Partial<Expense>) => void;
  simCards: SimCard[];
  session: UserSession;
  preSelectedSimId?: string;
  editingExpense?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  simCards,
  session,
  preSelectedSimId,
  editingExpense
}) => {
  if (!isOpen) return null;

  const defaultSim = simCards.find(
    (s) => s.id === (editingExpense?.simCardId || preSelectedSimId)
  ) || simCards[0];

  const [selectedSimId, setSelectedSimId] = useState(
    editingExpense?.simCardId || defaultSim?.id || ''
  );
  const [amount, setAmount] = useState<number>(editingExpense?.amount || 500);
  const [expenseType, setExpenseType] = useState<ExpenseType>(
    editingExpense?.expenseType || 'Activating Cost'
  );
  const [description, setDescription] = useState(editingExpense?.description || '');
  const [date, setDate] = useState(
    editingExpense?.date || new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (editingExpense) {
      setSelectedSimId(editingExpense.simCardId);
      setAmount(editingExpense.amount);
      setExpenseType(editingExpense.expenseType);
      setDescription(editingExpense.description);
      setDate(editingExpense.date);
    }
  }, [editingExpense]);

  const currentSim = simCards.find((s) => s.id === selectedSimId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSim || !description.trim() || amount <= 0) return;

    onSave({
      id: editingExpense?.id,
      date,
      simCardId: currentSim.id,
      simNumber: currentSim.simNumber,
      amount: Number(amount),
      description: description.trim(),
      expenseType,
      loggedBy: editingExpense ? editingExpense.loggedBy : session.userId,
      loggedByName: editingExpense ? editingExpense.loggedByName : session.name
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-amber-400" />
              <span>{editingExpense ? 'Update VIP SIM Expense' : 'Log VIP SIM Expense'}</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Punch in operational, activation, travel, or recharge expenses against a SIM card
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
          {/* SIM Card selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Select VIP SIM Number *
            </label>
            <select
              value={selectedSimId}
              onChange={(e) => setSelectedSimId(e.target.value)}
              required
              disabled={!!editingExpense}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 font-mono focus:border-amber-400 focus:outline-hidden disabled:opacity-75"
            >
              {simCards.map((sim) => (
                <option key={sim.id} value={sim.id}>
                  {sim.simNumber} · {sim.carrier} ({sim.status})
                </option>
              ))}
            </select>
            {currentSim && (
              <p className="text-[11px] text-neutral-400 mt-1">
                Category: <span className="text-neutral-200">{currentSim.category}</span> · Status: <span className="text-amber-400">{currentSim.status}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Expense Amount (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-mono text-sm">₹</span>
                <input
                  type="number"
                  min="1"
                  step="50"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 pl-8 pr-3 py-2 text-sm text-neutral-100 font-mono focus:border-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Expense Type / Category *
              </label>
              <select
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-amber-400 focus:outline-hidden"
              >
                <option value="Activating Cost">Activating Cost (KYC, Line Setup, Operator Fees)</option>
                <option value="Travel">Travel (Courier, Chauffeur Delivery, In-Person Meeting)</option>
                <option value="Other Indirect / Recharge">Other Indirect / Recharge (Package Renewal, Gift Box)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Expense Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-amber-400 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Courier delivery to client address, or official biometric KYC verification fee."
              required
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden"
            />
          </div>

          <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 text-xs text-neutral-400 flex items-center justify-between">
            <span>Logged By:</span>
            <span className="font-medium text-neutral-200">
              {editingExpense ? editingExpense.loggedByName : `${session.name} (${session.userId})`}
            </span>
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
              {editingExpense ? 'Save Expense Changes' : 'Punch In Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
