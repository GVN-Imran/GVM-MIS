import React, { useState } from 'react';
import { authService } from '../services/auth';
import { UserSession } from '../types';
import { Crown, ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = authService.authenticate(userId, password);
      if (result.success && result.session) {
        onLoginSuccess(result.session);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
      }
      setIsLoading(false);
    }, 250);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#07090e] px-4 py-12 overflow-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand Card */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo & Headline */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-neutral-950 shadow-lg shadow-amber-500/25">
              <Crown className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              GOLDEN VIP NUMBERS
            </h1>
            <p className="mt-1.5 text-xs text-neutral-400">
              Executive VIP Telecom Management System
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200 flex items-start gap-2">
              <span className="font-semibold text-red-400">Access Denied:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                User ID / Login Identity
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. Imran, admin, Sales1, sales2"
                  required
                  autoFocus
                  className="w-full rounded-lg border border-neutral-700/80 bg-neutral-950/60 px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden focus:ring-1 focus:ring-amber-400/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-neutral-300">
                  Password
                </label>
                <span className="text-[11px] text-neutral-500">Case-sensitive</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security key"
                  required
                  className="w-full rounded-lg border border-neutral-700/80 bg-neutral-950/60 px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-hidden focus:ring-1 focus:ring-amber-400/50 transition-colors pr-10"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-2.5 text-sm font-semibold text-neutral-950 hover:from-amber-300 hover:to-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400/60 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to Executive Console</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-neutral-800/80 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Encrypted Multi-Role Access Control (GVN Personnel Only)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
