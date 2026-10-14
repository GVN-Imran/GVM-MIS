import React, { useState } from 'react';
import { AuthCredential, authService } from '../services/auth';
import { UserRole, UserSession } from '../types';
import { X, UserPlus, Shield, Trash2, Eye, EyeOff, CheckCircle2, AlertCircle, Key, Users } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  onUsersUpdated?: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  session,
  onUsersUpdated
}) => {
  if (!isOpen) return null;

  const [users, setUsers] = useState<AuthCredential[]>(() => authService.getUsers());
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  // Form states
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('sales1');
  const [roleTitle, setRoleTitle] = useState('Senior Sales Executive');
  const [password, setPassword] = useState('');
  const [roleDescription, setRoleDescription] = useState('Register customer sales and punch operational expenses.');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setRoleTitle('Operations & Procurement Admin');
      setRoleDescription('Add newly purchased SIM numbers, manage inventory statuses, specifications, and operational expenses.');
    } else if (newRole === 'sales1') {
      setRoleTitle('Senior Sales Executive');
      setRoleDescription('Register customer sales against available VIP numbers and punch in logistical/activation expenses.');
    } else if (newRole === 'sales2') {
      setRoleTitle('VIP Accounts Sales Executive');
      setRoleDescription('Register customer sales against available VIP numbers and punch in logistical/activation expenses.');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!userId.trim() || !name.trim() || !password.trim()) {
      setErrorMessage('Please fill in User ID, Full Name, and Password.');
      return;
    }

    const newUser: AuthCredential = {
      userId: userId.trim(),
      name: name.trim(),
      role,
      roleTitle: roleTitle.trim() || (role === 'admin' ? 'Operations Admin' : 'Sales Executive'),
      roleDescription: roleDescription.trim() || 'GVN Authorized Staff Member',
      passwordHash: password.trim(),
      createdBy: `${session.name} (${session.userId})`
    };

    const res = authService.createUser(newUser);
    if (res.success) {
      setSuccessMessage(`Account for "${newUser.userId}" created successfully! They can now log in immediately.`);
      setUserId('');
      setName('');
      setPassword('');
      setUsers(authService.getUsers());
      if (onUsersUpdated) onUsersUpdated();
    } else {
      setErrorMessage(res.error || 'Failed to create user account.');
    }
  };

  const handleDeleteUser = (userIdToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete user account "${userIdToDelete}"? They will no longer be able to log in.`)) {
      const res = authService.deleteUser(userIdToDelete);
      if (res.success) {
        setUsers(authService.getUsers());
        if (onUsersUpdated) onUsersUpdated();
      } else {
        alert(res.error || 'Could not delete user.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60 font-semibold uppercase tracking-wider font-mono">
                Founder Exclusive
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-amber-400" />
              <span>User & Staff Account Management</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Create and manage authorized login credentials for Admin (Operations) and Sales Executives.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-neutral-800 mt-4 gap-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => { setActiveTab('create'); setSuccessMessage(''); setErrorMessage(''); }}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Create New User Account</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('list'); setSuccessMessage(''); setErrorMessage(''); }}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Active Staff Logins ({users.length})</span>
          </button>
        </div>

        {/* Feedback banners */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg border border-red-500/40 bg-red-950/40 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mt-4 p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab 1: Create Form */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateUser} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  User ID (Login Username) *
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. sales_khalid, admin_dubai"
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden font-mono"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">Used by employee to sign into the system</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Full Name / Display Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Khalid Al-Zaabi"
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  System Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-amber-300 focus:border-amber-400 focus:outline-hidden font-medium"
                >
                  <option value="sales1">Sales 1 (Senior Sales Executive)</option>
                  <option value="sales2">Sales 2 (VIP Accounts Sales Executive)</option>
                  <option value="admin">Admin (Operations & Procurement)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Security Password / Login Key *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set account password"
                    required
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Designation / Role Title
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Senior VIP Sales Specialist"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Access Scope Description
                </label>
                <input
                  type="text"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="e.g. Sales logging and courier expense punch-in"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 focus:border-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs text-neutral-400">
              <strong className="text-neutral-200">Role Permissions Summary:</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside text-[11px] text-neutral-400">
                {role === 'admin' ? (
                  <>
                    <li>Can input newly purchased VIP numbers into inventory.</li>
                    <li>Can view all stock, edit SIM specifications, and log operational expenses.</li>
                    <li>Restricted: Cannot delete records, manage investors, or process capital withdrawals.</li>
                  </>
                ) : (
                  <>
                    <li>Can view available VIP inventory catalog and prices.</li>
                    <li>Can register sales against available SIMs and collect customer details.</li>
                    <li>Can punch in logistical, travel, and activation expense receipts.</li>
                    <li>Restricted: Cannot access investor portfolios or system-wide financial withdrawal ledger.</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create & Authorize Account</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: User List */}
        {activeTab === 'list' && (
          <div className="mt-5 space-y-3">
            <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1">
              {users.map((u) => {
                const isImran = u.userId.toLowerCase() === 'imran';
                return (
                  <div
                    key={u.userId}
                    className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{u.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-mono">
                          ID: {u.userId}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded border font-mono font-semibold ${
                            u.role === 'founder'
                              ? 'text-amber-300 bg-amber-950/40 border-amber-500/30'
                              : u.role === 'admin'
                              ? 'text-blue-300 bg-blue-950/40 border-blue-500/30'
                              : 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {u.roleTitle} · {u.roleDescription}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        Password: •••••••• {u.createdBy ? `· Created by: ${u.createdBy}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {isImran ? (
                        <span className="text-[10px] text-amber-400/80 font-mono bg-amber-950/30 px-2 py-1 rounded border border-amber-900/40">
                          PRIMARY FOUNDER
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.userId)}
                          title="Delete user account"
                          className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
