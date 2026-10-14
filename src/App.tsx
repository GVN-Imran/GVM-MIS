import React, { useState, useEffect } from 'react';
import {
  UserSession,
  Investor,
  SimCard,
  Expense,
  Sale,
  WithdrawalRecord
} from './types';
import { authService } from './services/auth';
import { storageService } from './services/storage';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/DashboardView';
import { SimInventoryView } from './components/SimInventoryView';
import { InvestorsView } from './components/InvestorsView';
import { SalesExpensesView } from './components/SalesExpensesView';
import { CustomerLeaderboardView } from './components/CustomerLeaderboardView';
import { ReportsView } from './components/ReportsView';
import { SimInventoryModal } from './components/SimInventoryModal';
import { SaleModal } from './components/SaleModal';
import { ExpenseModal } from './components/ExpenseModal';
import { InvestorModal } from './components/InvestorModal';
import { InvestorWithdrawalModal } from './components/InvestorWithdrawalModal';
import { UserManagementModal } from './components/UserManagementModal';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(() => authService.getCurrentSession());
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data Entities
  const [investors, setInvestors] = useState<Investor[]>(() => storageService.getInvestors());
  const [simCards, setSimCards] = useState<SimCard[]>(() => storageService.getSimCards());
  const [expenses, setExpenses] = useState<Expense[]>(() => storageService.getExpenses());
  const [sales, setSales] = useState<Sale[]>(() => storageService.getSales());
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(() => storageService.getWithdrawals());

  // Modal visibility states
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [editingSim, setEditingSim] = useState<SimCard | null>(null);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [preSelectedSimIdForSale, setPreSelectedSimIdForSale] = useState<string | undefined>(undefined);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [preSelectedSimIdForExpense, setPreSelectedSimIdForExpense] = useState<string | undefined>(undefined);

  const [isInvestorModalOpen, setIsInvestorModalOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);

  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [selectedInvestorIdForWithdrawal, setSelectedInvestorIdForWithdrawal] = useState<string | undefined>(undefined);

  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);

  // Sync state to storage
  useEffect(() => {
    storageService.saveInvestors(investors);
  }, [investors]);

  useEffect(() => {
    storageService.saveSimCards(simCards);
  }, [simCards]);

  useEffect(() => {
    storageService.saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    storageService.saveSales(sales);
  }, [sales]);

  useEffect(() => {
    storageService.saveWithdrawals(withdrawals);
  }, [withdrawals]);

  // Auth handlers
  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setSession(null);
  };

  // If user is not authenticated, ONLY show the login screen!
  if (!session) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 1. SIM Card Handlers
  const handleSaveSim = (simData: Partial<SimCard>) => {
    if (simData.id) {
      // Edit existing
      setSimCards((prev) =>
        prev.map((s) => (s.id === simData.id ? ({ ...s, ...simData } as SimCard) : s))
      );
    } else {
      // Create new
      const newSim: SimCard = {
        id: `sim_${Date.now()}`,
        simNumber: simData.simNumber || '',
        carrier: simData.carrier || 'VI',
        category: simData.category || 'VIP Hexa',
        additionalDetails: simData.additionalDetails || '',
        activationPeriod: simData.activationPeriod || 'Under 90 Days',
        purchasePrice: Number(simData.purchasePrice) || 0,
        purchaseDate: simData.purchaseDate || new Date().toISOString().split('T')[0],
        mappedInvestorId: simData.mappedInvestorId || 'inv_gvn',
        status: 'Available',
        approvalStatus: simData.approvalStatus || (session.role === 'founder' ? 'Approved' : 'Pending Purchase Approval'),
        sourcedBy: simData.sourcedBy || session.userId,
        purchasedBy: simData.purchasedBy
      };
      setSimCards((prev) => [newSim, ...prev]);
    }
    setEditingSim(null);
  };

  const handleDeleteSim = (simId: string) => {
    if (window.confirm('Are you sure you want to delete this VIP SIM card from the inventory?')) {
      setSimCards((prev) => prev.filter((s) => s.id !== simId));
    }
  };

  const handleApproveSim = (simId: string) => {
    setSimCards((prev) =>
      prev.map((s) =>
        s.id === simId
          ? { ...s, approvalStatus: 'Approved', purchasedBy: 'Imran' }
          : s
      )
    );
  };

  // 2. Sale Handlers (with Edit & Delete support for Imran)
  const handleSaveSale = (saleData: Partial<Sale>, mappedInvestorId?: string) => {
    if (saleData.id) {
      // Update existing sale
      setSales((prev) =>
        prev.map((s) => (s.id === saleData.id ? ({ ...s, ...saleData } as Sale) : s))
      );
    } else {
      // New sale
      const newSale: Sale = {
        id: `sale_${Date.now()}`,
        date: saleData.date || new Date().toISOString().split('T')[0],
        simCardId: saleData.simCardId || '',
        simNumber: saleData.simNumber || '',
        customerName: saleData.customerName || '',
        customerPhone: saleData.customerPhone || '',
        customerEmail: saleData.customerEmail,
        amountCollected: Number(saleData.amountCollected) || 0,
        soldBy: saleData.soldBy || session.userId,
        soldByName: saleData.soldByName || session.name,
        paymentMethod: saleData.paymentMethod,
        notes: saleData.notes
      };
      setSales((prev) => [newSale, ...prev]);

      // Mark SIM as Sold & update mapped investor if selected
      setSimCards((prev) =>
        prev.map((s) =>
          s.id === saleData.simCardId
            ? {
                ...s,
                status: 'Sold',
                mappedInvestorId: mappedInvestorId || s.mappedInvestorId
              }
            : s
        )
      );
    }
    setEditingSale(null);
  };

  const handleDeleteSale = (saleId: string, simCardId: string) => {
    if (window.confirm('Delete this sale record? The VIP SIM will be restored back to Available status.')) {
      setSales((prev) => prev.filter((s) => s.id !== saleId));
      setSimCards((prev) =>
        prev.map((s) => (s.id === simCardId ? { ...s, status: 'Available' } : s))
      );
    }
  };

  // 3. Expense Handlers (with Edit & Delete support for Imran)
  const handleSaveExpense = (expenseData: Partial<Expense>) => {
    if (expenseData.id) {
      setExpenses((prev) =>
        prev.map((e) => (e.id === expenseData.id ? ({ ...e, ...expenseData } as Expense) : e))
      );
    } else {
      const newExpense: Expense = {
        id: `exp_${Date.now()}`,
        date: expenseData.date || new Date().toISOString().split('T')[0],
        simCardId: expenseData.simCardId || '',
        simNumber: expenseData.simNumber || '',
        amount: Number(expenseData.amount) || 0,
        description: expenseData.description || '',
        expenseType: expenseData.expenseType || 'Activating Cost',
        loggedBy: expenseData.loggedBy || session.userId,
        loggedByName: expenseData.loggedByName || session.name
      };
      setExpenses((prev) => [newExpense, ...prev]);
    }
    setEditingExpense(null);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('Delete this expense ticket?')) {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    }
  };

  // 4. Investor Handlers (Founder Only - Full Update & Delete)
  const handleSaveInvestor = (investorData: Omit<Investor, 'id'>) => {
    if (editingInvestor) {
      setInvestors((prev) =>
        prev.map((i) =>
          i.id === editingInvestor.id ? { ...i, ...investorData } : i
        )
      );
    } else {
      const newInvestor: Investor = {
        ...investorData,
        id: `inv_${Date.now()}`
      };
      setInvestors((prev) => [...prev, newInvestor]);
    }
    setEditingInvestor(null);
  };

  const handleDeleteInvestor = (investorId: string) => {
    if (investorId === 'inv_gvn') {
      alert('GVN Company Treasury is the default baseline entity and cannot be deleted.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this investor profile? Associated SIM cards will revert to GVN Treasury.')) {
      setInvestors((prev) => prev.filter((i) => i.id !== investorId));
      // Re-map SIMs to default GVN
      setSimCards((prev) =>
        prev.map((s) => (s.mappedInvestorId === investorId ? { ...s, mappedInvestorId: 'inv_gvn' } : s))
      );
    }
  };

  // 5. Withdrawal Handlers (Founder Only - Full Update & Delete)
  const handleConfirmWithdrawal = (
    investorId: string,
    withdrawalAmount: number,
    isClosingAccount: boolean,
    notes: string
  ) => {
    const inv = investors.find((i) => i.id === investorId);
    if (!inv) return;

    const newWithdrawal: WithdrawalRecord = {
      id: `wd_${Date.now()}`,
      investorId,
      investorName: inv.name,
      date: new Date().toISOString().split('T')[0],
      amount: withdrawalAmount,
      type: isClosingAccount ? 'full_closure' : 'part',
      balanceBefore: inv.amountInvested,
      balanceAfter: Math.max(0, inv.amountInvested - withdrawalAmount),
      notes,
      processedBy: `${session.name} (${session.userId})`
    };
    setWithdrawals((prev) => [newWithdrawal, ...prev]);

    // Update investor status if closing
    if (isClosingAccount) {
      setInvestors((prev) =>
        prev.map((i) =>
          i.id === investorId
            ? {
                ...i,
                status: 'closed',
                closedDate: new Date().toISOString().split('T')[0]
              }
            : i
        )
      );
    }
  };

  const handleDeleteWithdrawal = (withdrawalId: string) => {
    if (window.confirm('Delete this withdrawal record?')) {
      setWithdrawals((prev) => prev.filter((w) => w.id !== withdrawalId));
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data to initial factory state?')) {
      storageService.resetAllData();
      setInvestors(storageService.getInvestors());
      setSimCards(storageService.getSimCards());
      setExpenses(storageService.getExpenses());
      setSales(storageService.getSales());
      setWithdrawals(storageService.getWithdrawals());
    }
  };

  const availableSims = simCards.filter((s) => s.status === 'Available');

  return (
    <div className="min-h-screen bg-[#090b10] text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar */}
      <Header
        session={session}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenUserManagement={() => setIsUserManagementModalOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            session={session}
            investors={investors}
            simCards={simCards}
            expenses={expenses}
            sales={sales}
            withdrawals={withdrawals}
            onOpenSimModal={() => {
              setEditingSim(null);
              setIsSimModalOpen(true);
            }}
            onOpenSaleModal={(simId) => {
              setEditingSale(null);
              setPreSelectedSimIdForSale(simId);
              setIsSaleModalOpen(true);
            }}
            onOpenExpenseModal={(simId) => {
              setEditingExpense(null);
              setPreSelectedSimIdForExpense(simId);
              setIsExpenseModalOpen(true);
            }}
            onOpenInvestorModal={() => {
              setEditingInvestor(null);
              setIsInvestorModalOpen(true);
            }}
            onOpenWithdrawalModal={(invId) => {
              setSelectedInvestorIdForWithdrawal(invId);
              setIsWithdrawalModalOpen(true);
            }}
            onOpenUserManagement={() => setIsUserManagementModalOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'inventory' && (
          <SimInventoryView
            session={session}
            simCards={simCards}
            investors={investors}
            onOpenAddSim={() => {
              setEditingSim(null);
              setIsSimModalOpen(true);
            }}
            onEditSim={(sim) => {
              setEditingSim(sim);
              setIsSimModalOpen(true);
            }}
            onDeleteSim={handleDeleteSim}
            onApproveSim={handleApproveSim}
            onOpenSaleModal={(simId) => {
              setEditingSale(null);
              setPreSelectedSimIdForSale(simId);
              setIsSaleModalOpen(true);
            }}
            onOpenExpenseModal={(simId) => {
              setEditingExpense(null);
              setPreSelectedSimIdForExpense(simId);
              setIsExpenseModalOpen(true);
            }}
          />
        )}

        {activeTab === 'investors' && session.role === 'founder' && (
          <InvestorsView
            session={session}
            investors={investors}
            simCards={simCards}
            expenses={expenses}
            sales={sales}
            withdrawals={withdrawals}
            onOpenAddInvestor={() => {
              setEditingInvestor(null);
              setIsInvestorModalOpen(true);
            }}
            onOpenWithdrawalModal={(invId) => {
              setSelectedInvestorIdForWithdrawal(invId);
              setIsWithdrawalModalOpen(true);
            }}
            onEditInvestor={(inv) => {
              setEditingInvestor(inv);
              setIsInvestorModalOpen(true);
            }}
            onDeleteInvestor={handleDeleteInvestor}
            onDeleteWithdrawal={handleDeleteWithdrawal}
          />
        )}

        {activeTab === 'sales' && (
          <SalesExpensesView
            session={session}
            sales={sales}
            expenses={expenses}
            simCards={simCards}
            onOpenSaleModal={() => {
              setEditingSale(null);
              setPreSelectedSimIdForSale(undefined);
              setIsSaleModalOpen(true);
            }}
            onOpenExpenseModal={() => {
              setEditingExpense(null);
              setPreSelectedSimIdForExpense(undefined);
              setIsExpenseModalOpen(true);
            }}
            onEditSale={(sale) => {
              setEditingSale(sale);
              setIsSaleModalOpen(true);
            }}
            onDeleteSale={handleDeleteSale}
            onEditExpense={(expense) => {
              setEditingExpense(expense);
              setIsExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerLeaderboardView
            sales={sales}
            onOpenSaleModal={() => {
              setEditingSale(null);
              setPreSelectedSimIdForSale(undefined);
              setIsSaleModalOpen(true);
            }}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            session={session}
            sales={sales}
            expenses={expenses}
            simCards={simCards}
            investors={investors}
            withdrawals={withdrawals}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-4 text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">GOLDEN VIP NUMBERS (GVN)</span>
            <span>·</span>
            <span>Executive Trading Desk (₹ INR)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Session: <strong className="text-neutral-300">{session.name}</strong></span>
            <span>·</span>
            <button
              onClick={handleResetData}
              className="text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SimInventoryModal
        isOpen={isSimModalOpen}
        onClose={() => {
          setIsSimModalOpen(false);
          setEditingSim(null);
        }}
        onSave={handleSaveSim}
        investors={investors}
        session={session}
        editingSim={editingSim}
      />

      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setEditingSale(null);
        }}
        onSave={handleSaveSale}
        availableSims={availableSims}
        allSims={simCards}
        investors={investors}
        session={session}
        preSelectedSimId={preSelectedSimIdForSale}
        editingSale={editingSale}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        simCards={simCards}
        session={session}
        preSelectedSimId={preSelectedSimIdForExpense}
        editingExpense={editingExpense}
      />

      {session.role === 'founder' && (
        <>
          <InvestorModal
            isOpen={isInvestorModalOpen}
            onClose={() => {
              setIsInvestorModalOpen(false);
              setEditingInvestor(null);
            }}
            onSave={handleSaveInvestor}
            editingInvestor={editingInvestor}
          />
          <InvestorWithdrawalModal
            isOpen={isWithdrawalModalOpen}
            onClose={() => setIsWithdrawalModalOpen(false)}
            investors={investors}
            simCards={simCards}
            expenses={expenses}
            sales={sales}
            withdrawals={withdrawals}
            initialInvestorId={selectedInvestorIdForWithdrawal}
            onConfirmWithdrawal={handleConfirmWithdrawal}
          />
          <UserManagementModal
            isOpen={isUserManagementModalOpen}
            onClose={() => setIsUserManagementModalOpen(false)}
            session={session}
          />
        </>
      )}
    </div>
  );
}
