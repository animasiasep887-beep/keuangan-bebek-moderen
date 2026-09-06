import React from 'react';
import { Egg, Wallet, TrendingUp, Layers, ShieldCheck, Feather, CheckCircle2, TestTube2, Settings, Sparkles, User as UserIcon, LogOut } from 'lucide-react';

import type { FarmMetricsSummary, User } from '../types';
import type { AppMode } from '../services/storage';
import { AuthService } from '../services/authService';
import { formatIDR } from '../utils/exportUtils';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  metrics: FarmMetricsSummary;
  appMode: AppMode;
  onToggleMode: (mode: AppMode) => void;
  onOpenKalkulator?: () => void;
  onOpenKasir?: () => void;
  onOpenNotifikasi?: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  currentUser?: User | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  appMode,
  onToggleMode,
  onOpenKalkulator,
  onOpenKasir,
  onOpenNotifikasi,
  onOpenAuth,
  onLogout,
  currentUser,
}) => {
  const isReal = appMode === 'REAL';
  const activeUser = currentUser || AuthService.getCurrentUser();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Egg className="w-6 h-6 sm:w-7 sm:h-7 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  PRATAMA <span className="gradient-text-gold">BISNIS GRUP</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Feather className="w-3 h-3" /> PETELUR SIM
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Sistem Informasi Manajemen & Akuntansi Peternakan Bebek
              </p>
            </div>
          </div>

          {/* Quick Tools & Mode Switcher & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Account Button / Avatar */}
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-xs text-slate-200 transition-all active:scale-95 shadow-md"
                title="Kelola Akun & Login Multi-User"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center text-xs">
                  {activeUser ? activeUser.name.charAt(0) : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden md:flex flex-col items-start leading-none text-left">
                  <span className="text-[11px] font-extrabold text-amber-300 truncate max-w-[100px]">
                    {activeUser ? activeUser.name : 'Masuk Akun'}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate max-w-[100px]">
                    {activeUser ? activeUser.farmName : 'Multi-User'}
                  </span>
                </div>
              </button>
            )}

            {/* Quick Logout Button */}
            {onLogout && activeUser && (
              <button
                onClick={onLogout}
                className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-700/80 hover:border-rose-500/40 text-[11px] font-bold text-slate-300 hover:text-rose-300 transition-all active:scale-95 shadow-sm"
                title="Keluar dari Akun"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            )}

            {/* Quick Kasir POS Button */}
            {onOpenKasir && (
              <button
                onClick={onOpenKasir}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                title="Kasir Jual Cepat Hasil Panen"
              >
                <span>🛒 Kasir Telur</span>
              </button>
            )}

            {/* Quick Calculator Button */}
            {onOpenKalkulator && (
              <button
                onClick={onOpenKalkulator}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold transition-all active:scale-95"
                title="Kalkulator Pakan & BEP Telur"
              >
                <span>🧮 Kalkulator</span>
              </button>
            )}

            {/* Quick Notification Settings Button */}
            {onOpenNotifikasi && (
              <button
                onClick={onOpenNotifikasi}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-bold transition-all active:scale-95 relative"
                title="Pengingat Panen Jam 07:00 & 08:00 Pagi"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5" />
                <span>🔔 Pengingat</span>
              </button>
            )}

            {/* Quick Metrics Badges */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Saldo Kas</p>
                  <p className="text-xs font-black text-emerald-400">{formatIDR(metrics.saldoKas)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">HDP Hari Ini</p>
                  <p className="text-xs font-black text-amber-400">{metrics.hdpHariIni}%</p>
                </div>
              </div>
            </div>

            {/* Mode Switcher Pill (Akun Real vs Mode Demo) */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => onToggleMode('REAL')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  isReal
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Akun Real</span>
                <span className="sm:hidden">Real</span>
              </button>

              <button
                onClick={() => onToggleMode('DEMO')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  !isReal
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TestTube2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mode Demo</span>
                <span className="sm:hidden">Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Tabs */}
      <div className="hidden lg:block border-t border-slate-800/60 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1 py-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard Utama', icon: Layers },
              { id: 'operasional', label: 'Pencatatan Operasional', icon: Egg },
              { id: 'keuangan', label: 'Keuangan & Kas', icon: Wallet },
              { id: 'aset', label: 'Aset & Kewajiban', icon: ShieldCheck },
              { id: 'laporan', label: 'Laporan Keuangan', icon: TrendingUp },
              { id: 'ai', label: '🤖 Asisten AI & Bot Telegram', icon: Sparkles },
              { id: 'pengaturan', label: 'Pengaturan & Database', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};



