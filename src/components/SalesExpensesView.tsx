import React, { useState } from 'react';
import { Sale, Expense, UserSession, SimCard } from '../types';
import { formatCurrency, formatDate } from '../services/storage';
import {
  ShoppingCart,
  Receipt,
  Search,
  TrendingUp,
  CreditCard,
  Edit,
  Trash2
} from 'lucide-react';

interface SalesExpensesViewProps {
  session: UserSession;
  sales: Sale[];
  expenses: Expense[];
  simCards: SimCard[];
  onOpenSaleModal: () => void;
  onOpenExpenseModal: () => void;
  onEditSale?: (sale: Sale) => void;
  onDeleteSale?: (saleId: string, simCardId: string) => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: string) => void;
}

export const SalesExpensesView: React.FC<SalesExpensesViewProps> = ({
  session,
  sales,
  expenses,
  onOpenSaleModal,
  onOpenExpenseModal,
  onEditSale,
  onDeleteSale,
  onEditExpense,
  onDeleteExpense
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');
  const [searchQuery, setSearchQuery] = useState('');
  const [expenseTypeFilter, setExpenseTypeFilter] = useState<string>('All');

  const isFounder = session.role === 'founder';
  const isSales = session.role === 'sales1' || session.role === 'sales2';

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.amountCollected, 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filteredSales = sales.filter((sale) => {
    const q = searchQuery.toLowerCase();
    return (
      sale.simNumber.toLowerCase().includes(q) ||
      sale.customerName.toLowerCase().includes(q) ||
      sale.customerPhone.toLowerCase().includes(q) ||
      sale.soldByName.toLowerCase().includes(q)
    );
  });

  const filteredExpenses = expenses.filter((exp) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      exp.simNumber.toLowerCase().includes(q) ||
      exp.description.toLowerCase().includes(q) ||
      exp.loggedByName.toLowerCase().includes(q);
    const matchesType = expenseTypeFilter === 'All' || exp.expenseType === expenseTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Sales Transactions & Operational Expenses
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time ledger of VIP number client acquisitions and operational disbursements.{' '}
            {isFounder && 'Founder master privileges active: Edit and delete any entry.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(isFounder || isSales) && (
            <button
              onClick={onOpenSaleModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Register New Sale</span>
            </button>
          )}
          <button
            onClick={onOpenExpenseModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Receipt className="h-4 w-4 text-amber-400" />
            <span>Punch In Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-xs text-neutral-400 flex items-center justify-between">
            <span>Total Sales Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">
            {formatCurrency(totalSalesRevenue)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {sales.length} client sales logged
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-xs text-neutral-400 flex items-center justify-between">
            <span>Total Logged Expenses</span>
            <Receipt className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono mt-1 tabular-nums">
            {formatCurrency(totalExpensesAmount)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {expenses.length} expense tickets recorded
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-xs text-neutral-400 flex items-center justify-between">
            <span>Net Sales Over Expenses</span>
            <CreditCard className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">
            {formatCurrency(totalSalesRevenue - totalExpensesAmount)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Excluding initial capital purchase cost
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 gap-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'sales'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Sales & Client Transactions ({sales.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'expenses'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Receipt className="h-3.5 w-3.5" />
          <span>Operational & Logistics Expenses ({expenses.length})</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'sales'
                ? 'Search by VIP number, customer name, phone, or sales rep...'
                : 'Search by VIP number, description, or logged by...'
            }
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 pl-9 pr-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden"
          />
        </div>
        {activeTab === 'expenses' && (
          <select
            value={expenseTypeFilter}
            onChange={(e) => setExpenseTypeFilter(e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-amber-400 focus:outline-hidden"
          >
            <option value="All">All Expense Types</option>
            <option value="Activating Cost">Activating Cost</option>
            <option value="Travel">Travel</option>
            <option value="Other Indirect / Recharge">Other Indirect / Recharge</option>
          </select>
        )}
      </div>

      {/* Tables */}
      {activeTab === 'sales' ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Sale Date</th>
                  <th className="px-4 py-3">VIP Mobile Number</th>
                  <th className="px-4 py-3">Customer Profile</th>
                  <th className="px-4 py-3">Contact Details</th>
                  <th className="px-4 py-3">Amount Collected</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Sold By</th>
                  <th className="px-4 py-3">Notes</th>
                  {isFounder && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={isFounder ? 9 : 8} className="px-4 py-10 text-center text-neutral-500">
                      No sales records match your query.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-neutral-800/30">
                      <td className="px-4 py-3.5 font-mono text-neutral-300">
                        {formatDate(sale.date)}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-white tracking-wide">
                        {sale.simNumber}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-neutral-100">
                        {sale.customerName}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-neutral-400">
                        <div>{sale.customerPhone}</div>
                        {sale.customerEmail && (
                          <div className="text-[10px] text-neutral-500">{sale.customerEmail}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-400 font-mono text-sm tabular-nums">
                        {formatCurrency(sale.amountCollected)}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-300">
                        {sale.paymentMethod || 'Wire Transfer'}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-300">
                        {sale.soldByName}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-400 max-w-xs truncate">
                        {sale.notes || '—'}
                      </td>
                      {isFounder && (
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditSale && onEditSale(sale)}
                              title="Edit sale details"
                              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteSale && onDeleteSale(sale.id, sale.simCardId)}
                              title="Delete sale and restore SIM to available"
                              className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">VIP SIM Number</th>
                  <th className="px-4 py-3">Expense Category</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Logged By</th>
                  {isFounder && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={isFounder ? 7 : 6} className="px-4 py-10 text-center text-neutral-500">
                      No expense records found.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-neutral-800/30">
                      <td className="px-4 py-3.5 font-mono text-neutral-300">
                        {formatDate(exp.date)}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-white">
                        {exp.simNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-[11px] text-amber-400">
                          {exp.expenseType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-red-400 font-mono text-sm tabular-nums">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-300 max-w-sm">
                        {exp.description}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-400">
                        {exp.loggedByName}
                      </td>
                      {isFounder && (
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditExpense && onEditExpense(exp)}
                              title="Edit expense details"
                              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteExpense && onDeleteExpense(exp.id)}
                              title="Delete expense entry"
                              className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
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
