import React, { useState, useMemo } from 'react';
import {
  Sale,
  Expense,
  SimCard,
  Investor,
  WithdrawalRecord,
  UserSession
} from '../types';
import {
  calculateInvestorStats,
  formatCurrency,
  formatDate
} from '../services/storage';
import {
  Download,
  Printer,
  TrendingUp,
  Target,
  Users,
  Shield
} from 'lucide-react';

interface ReportsViewProps {
  session: UserSession;
  sales: Sale[];
  expenses: Expense[];
  simCards: SimCard[];
  investors: Investor[];
  withdrawals: WithdrawalRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  sales,
  expenses,
  simCards,
  investors,
  withdrawals
}) => {
  // Date-range filter states
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedReport, setSelectedReport] = useState<
    'customers' | 'investors' | 'stock' | 'sales_team'
  >('stock');

  // Quick Presets
  const handlePreset = (type: 'all' | 'last7' | 'last30' | 'ytd') => {
    const today = new Date().toISOString().split('T')[0];
    setToDate(today);
    if (type === 'all') {
      setFromDate('2026-01-01');
    } else if (type === 'last7') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setFromDate(d.toISOString().split('T')[0]);
    } else if (type === 'last30') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setFromDate(d.toISOString().split('T')[0]);
    } else if (type === 'ytd') {
      setFromDate(`${new Date().getFullYear()}-01-01`);
    }
  };

  // Filter items by date range
  const isWithinRange = (dateStr: string) => {
    if (!dateStr) return false;
    const itemDate = new Date(dateStr).getTime();
    const fromTime = new Date(fromDate).getTime();
    const toTime = new Date(`${toDate}T23:59:59`).getTime();
    return itemDate >= fromTime && itemDate <= toTime;
  };

  const filteredSales = useMemo(() => sales.filter((s) => isWithinRange(s.date)), [sales, fromDate, toDate]);
  const filteredExpenses = useMemo(() => expenses.filter((e) => isWithinRange(e.date)), [expenses, fromDate, toDate]);
  const filteredPurchasedSims = useMemo(() => simCards.filter((s) => isWithinRange(s.purchaseDate)), [simCards, fromDate, toDate]);

  // 1. Customer Report Data
  const customerReportData = useMemo(() => {
    return filteredSales.map((sale) => ({
      customerName: sale.customerName,
      contactNumber: sale.customerPhone,
      simCard: sale.simNumber,
      purchaseDate: sale.date,
      amount: sale.amountCollected,
      soldBy: sale.soldByName
    }));
  }, [filteredSales]);

  // 2. Investor Report Data
  const investorReportData = useMemo(() => {
    return investors.map((inv) => {
      const stats = calculateInvestorStats(inv, simCards, expenses, sales, withdrawals);
      return {
        name: inv.name,
        contact: inv.contact,
        amountInvested: inv.amountInvested,
        startDate: inv.startDate,
        totalDays: stats.activeDays,
        simsPurchased: stats.simsPurchasedCount,
        simsSold: stats.simsSoldCount,
        revenue: stats.totalRevenue,
        expenses: stats.totalExpenses,
        withdrawnAmount: stats.totalWithdrawn,
        currentBalance: stats.currentBalance,
        profitSharePercent: inv.profitSharePercent,
        status: inv.status
      };
    });
  }, [investors, simCards, expenses, sales, withdrawals]);

  // 3. Stock / Target Report Data
  const stockReportData = useMemo(() => {
    // Purchased in date range
    const under90Purchased = filteredPurchasedSims.filter((s) => s.activationPeriod === 'Under 90 Days');
    const above90Purchased = filteredPurchasedSims.filter((s) => s.activationPeriod === 'Above 90 Days');

    // Sold in date range
    const soldUnder90 = filteredSales.filter((sale) => {
      const sim = simCards.find((s) => s.id === sale.simCardId);
      return sim?.activationPeriod === 'Under 90 Days';
    });
    const soldAbove90 = filteredSales.filter((sale) => {
      const sim = simCards.find((s) => s.id === sale.simCardId);
      return sim?.activationPeriod === 'Above 90 Days';
    });

    const totalPurchaseValue = filteredPurchasedSims.reduce((sum, s) => sum + s.purchasePrice, 0);
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.amountCollected, 0);

    // Unsold (Balance) SIMs currently in inventory (Sales target value)
    const unsoldSims = simCards.filter((s) => s.status === 'Available');
    const unsoldStockCost = unsoldSims.reduce((sum, s) => sum + s.purchasePrice, 0);

    return {
      under90PurchasedCount: under90Purchased.length,
      under90PurchasedCost: under90Purchased.reduce((sum, s) => sum + s.purchasePrice, 0),
      above90PurchasedCount: above90Purchased.length,
      above90PurchasedCost: above90Purchased.reduce((sum, s) => sum + s.purchasePrice, 0),
      soldUnder90Count: soldUnder90.length,
      soldUnder90Revenue: soldUnder90.reduce((sum, s) => sum + s.amountCollected, 0),
      soldAbove90Count: soldAbove90.length,
      soldAbove90Revenue: soldAbove90.reduce((sum, s) => sum + s.amountCollected, 0),
      totalPurchaseValue,
      totalRevenue,
      unsoldSimsCount: unsoldSims.length,
      unsoldStockCost
    };
  }, [filteredPurchasedSims, filteredSales, simCards]);

  // 4. Sales Team Performance Data
  const salesTeamData = useMemo(() => {
    const reps = ['Imran', 'Sales1', 'sales2'];
    return reps.map((repId) => {
      const repSales = filteredSales.filter((s) => s.soldBy.toLowerCase() === repId.toLowerCase());
      const repExpenses = filteredExpenses.filter((e) => e.loggedBy.toLowerCase() === repId.toLowerCase());
      const totalSimsSold = repSales.length;
      const totalRevenue = repSales.reduce((sum, s) => sum + s.amountCollected, 0);
      const totalExpensesLogged = repExpenses.reduce((sum, e) => sum + e.amount, 0);
      const netContribution = totalRevenue - totalExpensesLogged;

      let repName = repId;
      if (repId === 'Imran') repName = 'Imran (Founder)';
      else if (repId.toLowerCase() === 'sales1') repName = 'Sales 1 (Executive)';
      else if (repId.toLowerCase() === 'sales2') repName = 'Sales 2 (Executive)';

      return {
        repId,
        repName,
        totalSimsSold,
        totalRevenue,
        totalExpensesLogged,
        netContribution
      };
    });
  }, [filteredSales, filteredExpenses]);

  // CSV Export functions
  const downloadCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = '';

    if (selectedReport === 'customers') {
      filename = `GVN_Customer_Report_${fromDate}_to_${toDate}.csv`;
      headers = ['Customer Name', 'Contact Phone', 'SIM Card Purchased', 'Purchase Date', 'Amount Collected (₹ INR)', 'Sold By'];
      rows = customerReportData.map((c) => [
        `"${c.customerName}"`,
        `"${c.contactNumber}"`,
        `"${c.simCard}"`,
        c.purchaseDate,
        c.amount,
        `"${c.soldBy}"`
      ]);
    } else if (selectedReport === 'investors') {
      filename = `GVN_Investor_Details_Report_${fromDate}_to_${toDate}.csv`;
      headers = [
        'Investor Name',
        'Contact Phone',
        'Amount Invested (₹ INR)',
        'Start Date',
        'Total Days Active',
        'SIMs Purchased',
        'SIMs Sold',
        'Total Revenue (₹ INR)',
        'Total Expenses (₹ INR)',
        'Withdrawn Amount (₹ INR)',
        'Current Balance (₹ INR)',
        'Profit Share %',
        'Account Status'
      ];
      rows = investorReportData.map((inv) => [
        `"${inv.name}"`,
        `"${inv.contact}"`,
        inv.amountInvested,
        inv.startDate,
        inv.totalDays,
        inv.simsPurchased,
        inv.simsSold,
        inv.revenue,
        inv.expenses,
        inv.withdrawnAmount,
        inv.currentBalance,
        inv.profitSharePercent,
        inv.status
      ]);
    } else if (selectedReport === 'stock') {
      filename = `GVN_SIM_Stock_Report_${fromDate}_to_${toDate}.csv`;
      headers = ['Metric / Category', 'Count / Quantity', 'Financial Value (₹ INR)', 'Notes'];
      rows = [
        ['Purchased (<90 Days Fast Turnover)', stockReportData.under90PurchasedCount, stockReportData.under90PurchasedCost, 'Acquisitions in date range'],
        ['Purchased (>90 Days Vault)', stockReportData.above90PurchasedCount, stockReportData.above90PurchasedCost, 'Acquisitions in date range'],
        ['Total Purchased Value (Range)', filteredPurchasedSims.length, stockReportData.totalPurchaseValue, 'Total capital expended'],
        ['Sold (<90 Days)', stockReportData.soldUnder90Count, stockReportData.soldUnder90Revenue, 'Sales realized'],
        ['Sold (>90 Days)', stockReportData.soldAbove90Count, stockReportData.soldAbove90Revenue, 'Sales realized'],
        ['Total Sales Revenue (Range)', filteredSales.length, stockReportData.totalRevenue, 'Total revenue collected'],
        ['Unsold (Balance) SIMs (Sales Target)', stockReportData.unsoldSimsCount, stockReportData.unsoldStockCost, 'Baseline stock value to set sales targets']
      ];
    } else if (selectedReport === 'sales_team') {
      filename = `GVN_Sales_Team_Performance_${fromDate}_to_${toDate}.csv`;
      headers = ['Sales Representative', 'Total SIMs Sold', 'Total Revenue Generated (₹ INR)', 'Total Expenses Logged (₹ INR)', 'Net Revenue Contribution (₹ INR)'];
      rows = salesTeamData.map((rep) => [
        `"${rep.repName}"`,
        rep.totalSimsSold,
        rep.totalRevenue,
        rep.totalExpensesLogged,
        rep.netContribution
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60 font-semibold uppercase tracking-wider">
              Executive Analytics
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Date-Range Audit & Downloadable Reports
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Export verified financial ledgers, customer intelligence, stock valuation targets, and sales team rankings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV Report</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Date Filter Control Bar */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-100 focus:border-amber-400 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-100 focus:border-amber-400 focus:outline-hidden"
              />
            </div>

            {/* Quick Presets */}
            <div className="self-end flex gap-1 pb-0.5">
              <button
                onClick={() => handlePreset('all')}
                className="px-2.5 py-1 text-[11px] rounded bg-neutral-950 text-neutral-300 border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer"
              >
                All Time
              </button>
              <button
                onClick={() => handlePreset('last7')}
                className="px-2.5 py-1 text-[11px] rounded bg-neutral-950 text-neutral-300 border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => handlePreset('last30')}
                className="px-2.5 py-1 text-[11px] rounded bg-neutral-950 text-neutral-300 border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer"
              >
                Last 30 Days
              </button>
              <button
                onClick={() => handlePreset('ytd')}
                className="px-2.5 py-1 text-[11px] rounded bg-neutral-950 text-neutral-300 border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer"
              >
                This Year
              </button>
            </div>
          </div>
          <div className="text-xs text-neutral-400 font-mono">
            Active Period: <strong className="text-amber-400">{formatDate(fromDate)}</strong> to <strong className="text-amber-400">{formatDate(toDate)}</strong>
          </div>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setSelectedReport('stock')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedReport === 'stock'
              ? 'border-amber-400/80 bg-amber-950/20 text-neutral-100 shadow-sm'
              : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Target className="h-4 w-4" />
            <span>SIM Card & Stock Report</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Turnover & Sales Target Valuation
          </div>
        </button>

        <button
          onClick={() => setSelectedReport('customers')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedReport === 'customers'
              ? 'border-amber-400/80 bg-amber-950/20 text-neutral-100 shadow-sm'
              : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Users className="h-4 w-4" />
            <span>Customer Database</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Patron spend & SIM acquisitions
          </div>
        </button>

        <button
          onClick={() => setSelectedReport('investors')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedReport === 'investors'
              ? 'border-amber-400/80 bg-amber-950/20 text-neutral-100 shadow-sm'
              : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Shield className="h-4 w-4" />
            <span>Investor Details</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Capital, days, SIMs, payouts & balance
          </div>
        </button>

        <button
          onClick={() => setSelectedReport('sales_team')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedReport === 'sales_team'
              ? 'border-amber-400/80 bg-amber-950/20 text-neutral-100 shadow-sm'
              : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <TrendingUp className="h-4 w-4" />
            <span>Sales Team Performance</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Rep volume, revenue & expenses
          </div>
        </button>
      </div>

      {/* Render Selected Report View */}
      {selectedReport === 'stock' && (
        <div className="space-y-4">
          {/* Highlight Card for Unsold Balance / Sales Target */}
          <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-neutral-900/60 to-neutral-950 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
                Executive Sales Target Benchmark
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Total Purchase Value of Unsold (Balance) SIMs
              </h2>
              <p className="text-xs text-neutral-300 mt-1 max-w-xl">
                This is the total capital tied up in unsold VIP SIM cards in inventory. Use this exact figure to set your team's upcoming sales target quota.
              </p>
            </div>
            <div className="text-left md:text-right bg-neutral-950/80 p-3.5 rounded-lg border border-neutral-800">
              <div className="text-xs text-neutral-400">Balance Stock Purchase Value:</div>
              <div className="text-3xl font-black text-amber-300 font-mono mt-0.5 tabular-nums">
                {formatCurrency(stockReportData.unsoldStockCost)}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                {stockReportData.unsoldSimsCount} Unsold VIP numbers waiting to be sold
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Purchase breakdown */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
              <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                SIM Purchases (In Filtered Date Range)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                  <span className="text-neutral-400">Purchased &lt; 90 Days (Fast Turnover):</span>
                  <span className="font-mono text-neutral-200 font-semibold">
                    {stockReportData.under90PurchasedCount} SIMs ({formatCurrency(stockReportData.under90PurchasedCost)})
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                  <span className="text-neutral-400">Purchased &gt; 90 Days (Vault):</span>
                  <span className="font-mono text-neutral-200 font-semibold">
                    {stockReportData.above90PurchasedCount} SIMs ({formatCurrency(stockReportData.above90PurchasedCost)})
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-amber-300">
                  <span className="font-semibold">Total Purchase Value in Range:</span>
                  <span className="font-mono font-bold tabular-nums">
                    {formatCurrency(stockReportData.totalPurchaseValue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sold breakdown */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
              <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                SIM Sales Realized (In Filtered Date Range)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                  <span className="text-neutral-400">Sold of &lt; 90 Days Cycle:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {stockReportData.soldUnder90Count} SIMs ({formatCurrency(stockReportData.soldUnder90Revenue)})
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                  <span className="text-neutral-400">Sold of &gt; 90 Days Cycle:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {stockReportData.soldAbove90Count} SIMs ({formatCurrency(stockReportData.soldAbove90Revenue)})
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                  <span className="font-semibold">Total Revenue Realized in Range:</span>
                  <span className="font-mono font-bold tabular-nums">
                    {formatCurrency(stockReportData.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'customers' && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Contact Number</th>
                  <th className="px-4 py-3">VIP SIM Card</th>
                  <th className="px-4 py-3">Purchase Date</th>
                  <th className="px-4 py-3">Amount Collected</th>
                  <th className="px-4 py-3">Sales Executive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {customerReportData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-neutral-500">
                      No sales recorded within the selected date range.
                    </td>
                  </tr>
                ) : (
                  customerReportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-neutral-800/30">
                      <td className="px-4 py-3.5 font-bold text-white">{row.customerName}</td>
                      <td className="px-4 py-3.5 font-mono text-neutral-300">{row.contactNumber}</td>
                      <td className="px-4 py-3.5 font-mono font-semibold text-amber-300">{row.simCard}</td>
                      <td className="px-4 py-3.5 font-mono text-neutral-400">{formatDate(row.purchaseDate)}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-400 font-mono text-sm tabular-nums">
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-300">{row.soldBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReport === 'investors' && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
                <tr>
                  <th className="px-3 py-3">Investor Name</th>
                  <th className="px-3 py-3">Contact</th>
                  <th className="px-3 py-3">Amount Invested</th>
                  <th className="px-3 py-3">Start Date</th>
                  <th className="px-3 py-3 text-center">Active Days</th>
                  <th className="px-3 py-3 text-center">SIMs Bought / Sold</th>
                  <th className="px-3 py-3">Total Revenue</th>
                  <th className="px-3 py-3">Expenses</th>
                  <th className="px-3 py-3">Withdrawn</th>
                  <th className="px-3 py-3">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {investorReportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-800/30">
                    <td className="px-3 py-3.5 font-bold text-white font-sans">{row.name}</td>
                    <td className="px-3 py-3.5 text-neutral-400 text-[11px]">{row.contact}</td>
                    <td className="px-3 py-3.5 text-neutral-200 font-semibold tabular-nums">
                      {formatCurrency(row.amountInvested)}
                    </td>
                    <td className="px-3 py-3.5 text-neutral-400 text-[11px]">{formatDate(row.startDate)}</td>
                    <td className="px-3 py-3.5 text-center text-neutral-300 tabular-nums">{row.totalDays}d</td>
                    <td className="px-3 py-3.5 text-center text-neutral-200 tabular-nums">
                      {row.simsPurchased} / <strong className="text-emerald-400">{row.simsSold}</strong>
                    </td>
                    <td className="px-3 py-3.5 text-emerald-400 font-bold tabular-nums">
                      {formatCurrency(row.revenue)}
                    </td>
                    <td className="px-3 py-3.5 text-red-400 tabular-nums">
                      {formatCurrency(row.expenses)}
                    </td>
                    <td className="px-3 py-3.5 text-amber-300 tabular-nums">
                      {formatCurrency(row.withdrawnAmount)}
                    </td>
                    <td className="px-3 py-3.5 text-amber-400 font-bold tabular-nums">
                      {formatCurrency(row.currentBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReport === 'sales_team' && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Sales Representative</th>
                  <th className="px-4 py-3 text-center">SIMs Sold (Count)</th>
                  <th className="px-4 py-3">Total Sales Revenue</th>
                  <th className="px-4 py-3">Total Expenses Logged</th>
                  <th className="px-4 py-3">Net Capital Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {salesTeamData.map((rep) => (
                  <tr key={rep.repId} className="hover:bg-neutral-800/30">
                    <td className="px-4 py-3.5 font-bold text-white">{rep.repName}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-neutral-200 font-mono tabular-nums text-sm">
                      {rep.totalSimsSold} VIP SIMs
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-400 font-mono text-sm tabular-nums">
                      {formatCurrency(rep.totalRevenue)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-red-400 font-mono text-sm tabular-nums">
                      {formatCurrency(rep.totalExpensesLogged)}
                    </td>
                    <td className="px-4 py-3.5 font-black text-amber-300 font-mono text-base tabular-nums">
                      {formatCurrency(rep.netContribution)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
