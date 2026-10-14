import React, { useState } from 'react';
import { Sale } from '../types';
import { generateCustomerLeaderboard, formatCurrency, formatDate } from '../services/storage';
import { Award, Search, Download } from 'lucide-react';

interface CustomerLeaderboardViewProps {
  sales: Sale[];
  onOpenSaleModal: () => void;
}

export const CustomerLeaderboardView: React.FC<CustomerLeaderboardViewProps> = ({
  sales
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const customerList = generateCustomerLeaderboard(sales);

  const filteredCustomers = customerList.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const topClient = customerList[0];
  const totalClientSpend = customerList.reduce((sum, c) => sum + c.totalPurchasedValue, 0);

  const exportCustomerCSV = () => {
    const headers = ['Rank', 'Customer Name', 'Contact Phone', 'Email', 'Total Spend (INR)', 'VIP SIMs Acquired', 'Last Purchase Date'];
    const rows = filteredCustomers.map((c, idx) => [
      idx + 1,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email || ''}"`,
      c.totalPurchasedValue,
      c.totalSimsBought,
      c.lastPurchaseDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GVN_Customer_Database_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60 font-semibold uppercase tracking-wider">
              Client Wealth Intelligence
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            VIP Customer Database & Spend Ranking
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Ranked sequentially from maximum lifetime purchase value to minimum
          </p>
        </div>
        <button
          onClick={exportCustomerCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="h-4 w-4" />
          <span>Export Customer DB (CSV)</span>
        </button>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-xs text-neutral-400">Total Unique VIP Clients</div>
          <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">
            {customerList.length} High-Net-Worth Buyers
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Across UAE, GCC & International
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-xs text-neutral-400">Total Client Capital Captured</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">
            {formatCurrency(totalClientSpend)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Cumulative sales value
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-xs text-neutral-400 flex items-center justify-between">
            <span>Top Tier VIP Patron</span>
            <Award className="h-4 w-4 text-amber-400" />
          </div>
          {topClient ? (
            <div className="mt-1">
              <div className="text-base font-bold text-white truncate">{topClient.name}</div>
              <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                {formatCurrency(topClient.totalPurchasedValue)} ({topClient.totalSimsBought} SIMs)
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 mt-1">No client data</p>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search client by name, phone number, or email..."
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 pl-9 pr-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden"
        />
      </div>

      {/* Ranked Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
              <tr>
                <th className="px-4 py-3 text-center">Rank</th>
                <th className="px-4 py-3">VIP Customer Name</th>
                <th className="px-4 py-3">Phone & Contact</th>
                <th className="px-4 py-3">Total Spend Value</th>
                <th className="px-4 py-3">SIMs Acquired</th>
                <th className="px-4 py-3">Acquired VIP Numbers</th>
                <th className="px-4 py-3">Last Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-neutral-500">
                    No customers found matching the search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((client, index) => {
                  return (
                    <tr
                      key={client.phone || client.name}
                      className="hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-center font-mono font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            index === 0
                              ? 'bg-amber-400 text-neutral-950 font-black shadow-xs'
                              : index === 1
                              ? 'bg-neutral-300 text-neutral-950 font-bold'
                              : index === 2
                              ? 'bg-amber-700/60 text-amber-200 font-bold'
                              : 'text-neutral-500'
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-white text-sm">
                        {client.name}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-neutral-400">
                        <div>{client.phone}</div>
                        {client.email && (
                          <div className="text-[10px] text-neutral-500">{client.email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-400 font-mono text-base tabular-nums">
                        {formatCurrency(client.totalPurchasedValue)}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-semibold text-neutral-300">
                        {client.totalSimsBought} SIM card{client.totalSimsBought > 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {client.sims.map((sim, i) => (
                            <span
                              key={i}
                              className="font-mono text-[11px] text-amber-300 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800"
                            >
                              {sim.simNumber}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-neutral-400">
                        {formatDate(client.lastPurchaseDate)}
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
