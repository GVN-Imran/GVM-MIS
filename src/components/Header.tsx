import React from 'react';
import { UserSession } from '../types';
import { LogOut, Crown, UserPlus } from 'lucide-react';

interface HeaderProps {
  session: UserSession;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onOpenUserManagement?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenUserManagement
}) => {
  // Navigation tabs allowed per role
  const isFounder = session.role === 'founder';
  const isAdmin = session.role === 'admin';
  const isSales = session.role === 'sales1' || session.role === 'sales2';

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', visible: true },
    { id: 'inventory', label: 'VIP Inventory', visible: true },
    { id: 'investors', label: 'Investors Portfolio', visible: isFounder },
    { id: 'sales', label: 'Sales & Expenses', visible: true },
    { id: 'customers', label: 'Customer Directory', visible: isFounder || isSales },
    { id: 'reports', label: 'Reports & Export', visible: isFounder || isAdmin }
  ].filter((item) => item.visible);

  const getRoleBadge = () => {
    switch (session.role) {
      case 'founder':
        return {
          label: 'Founder · Super Admin',
          classes: 'text-amber-300 bg-amber-950/40 border-amber-500/30'
        };
      case 'admin':
        return {
          label: 'Operations Admin',
          classes: 'text-blue-300 bg-blue-950/40 border-blue-500/30'
        };
      case 'sales1':
      case 'sales2':
        return {
          label: `${session.role === 'sales1' ? 'Sales 1' : 'Sales 2'} · Executive`,
          classes: 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30'
        };
      default:
        return { label: session.role, classes: 'text-neutral-400 bg-neutral-900 border-neutral-700' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 text-neutral-950 shadow-sm shadow-amber-500/20">
            <Crown className="h-5 w-5" />
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-left group cursor-pointer"
          >
            <span className="block text-base font-bold tracking-tight text-neutral-100 group-hover:text-amber-400 transition-colors">
              GOLDEN VIP NUMBERS
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-neutral-800 text-amber-400 font-semibold shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (User management, profile & Logout) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isFounder && onOpenUserManagement && (
            <button
              onClick={onOpenUserManagement}
              title="Manage staff users (Admin & Sales)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:text-white bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/60 rounded-md transition-colors cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Users & Accounts</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded border font-mono ${roleBadge.classes}`}>
              {session.userId} · {roleBadge.label}
            </span>
          </div>

          <button
            onClick={onLogout}
            title="Sign out of Golden VIP Numbers"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-red-400 hover:bg-red-950/20 rounded-md border border-neutral-800 hover:border-red-900/40 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-neutral-800/60 px-4 py-2 gap-1.5">
        {navLinks.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 py-1 text-xs whitespace-nowrap rounded cursor-pointer ${
              activeTab === tab.id
                ? 'bg-neutral-800 text-amber-400 font-semibold'
                : 'text-neutral-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
