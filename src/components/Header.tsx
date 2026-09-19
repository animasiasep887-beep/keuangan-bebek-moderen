import React from 'react';
import {
  Layers,
  Egg,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Settings,
  Bell,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  TestTube2,
  Smartphone,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import type { FarmMetricsSummary, User, KomoditasTernak } from '../types';
import type { AppMode } from '../services/storage';
import { AuthService } from '../services/authService';
import { KomoditasSelector } from './KomoditasSelector';

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
  onOpenInstallApp?: () => void;
  onLogout?: () => void;
  currentUser?: User | null;
  activeCommodity?: KomoditasTernak;
  onChangeCommodity?: (commodity: KomoditasTernak) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  appMode,
  onToggleMode,
  onOpenNotifikasi,
  onOpenAuth,
  onOpenInstallApp,
  onLogout,
  currentUser,
  activeCommodity = 'BEBEK_PETELUR',
  onChangeCommodity,
}) => {
  const isReal = appMode === 'REAL';
  const activeUser = currentUser || AuthService.getCurrentUser();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'operasional', label: 'Operasional & Panen', icon: Egg },
    { id: 'keuangan', label: 'Keuangan & Kas', icon: Wallet },
    { id: 'aset', label: 'Aset & Kandang', icon: ShieldCheck },
    { id: 'laporan', label: 'Laporan Laba/Rugi', icon: TrendingUp },
    { id: 'ai', label: 'Asisten AI & Bot', icon: Sparkles },
    { id: 'pengaturan', label: 'Pengaturan & Backup', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/[0.08] shadow-2xl backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-1 sm:gap-4">
          {/* Left: Brand & Commodity Selector */}
          <div className="flex items-center gap-1 sm:gap-3 min-w-0">
            <div
              className="flex items-center gap-1 sm:gap-2.5 cursor-pointer select-none group shrink-0"
              onClick={() => setActiveTab('dashboard')}
            >
              <BrandLogo size="sm" />
              <div className="min-w-0">
                <h1 className="text-xs sm:text-base font-black tracking-tight text-white flex items-center gap-1 truncate">
                  <span>PRATAMA</span> <span className="gradient-text-gold hidden sm:inline">BISNIS GRUP</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium hidden md:block">
                  Sistem Manajemen Peternakan Modern
                </p>
              </div>
            </div>

            {/* Sektor Komoditas Dropdown */}
            {onChangeCommodity && (
              <div className="pl-1 sm:pl-2 border-l border-white/[0.08] shrink-0">
                <KomoditasSelector
                  activeCommodity={activeCommodity}
                  onChangeCommodity={onChangeCommodity}
                />
              </div>
            )}
          </div>

          {/* Right: Mode Switcher, Notifications & User Profile */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Mode Switcher Pill (Desktop/Tablet) */}
            <div className="hidden sm:flex items-center gap-0.5 bg-slate-900/90 p-1 rounded-2xl border border-white/[0.08] shadow-inner">
              <button
                type="button"
                onClick={() => onToggleMode('REAL')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  isReal
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Menggunakan database riil tersimpan di VPS"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Real</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleMode('DEMO')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  !isReal
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Menggunakan data simulasi 30 hari"
              >
                <TestTube2 className="w-3.5 h-3.5" />
                <span>Demo</span>
              </button>
            </div>

            {/* Mobile Cloud Status Indicator Pill */}
            <div className="sm:hidden flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-900/90 border border-white/[0.08] text-[9px] font-bold shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${isReal ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300">{isReal ? 'VPS' : 'Demo'}</span>
            </div>

            {/* Mobile / PWA App Install Button */}
            {onOpenInstallApp && (
              <button
                type="button"
                onClick={onOpenInstallApp}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all active:scale-95 shadow-sm"
                title="Pasang Aplikasi ke Handphone (Android & iPhone)"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Pasang App</span>
              </button>
            )}

            {/* Notification Bell */}
            {onOpenNotifikasi && (
              <button
                type="button"
                onClick={onOpenNotifikasi}
                className="w-8 h-8 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-amber-400 flex items-center justify-center transition-all active:scale-95 relative shrink-0"
                title="Pengingat Jam Panen Peternakan"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping absolute top-1.5 right-1.5" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1.5 right-1.5" />
                <Bell className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}

            {/* User Account / Profile Pill */}
            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 p-0.5 sm:py-1 sm:px-2.5 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-amber-500/25 text-xs text-slate-200 transition-all active:scale-95 shadow-md group shrink-0"
                title="Profil Peternak & Sinkronisasi Database"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm overflow-hidden shrink-0">
                  {activeUser?.avatarUrl ? (
                    <img
                      src={activeUser.avatarUrl}
                      alt={activeUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : activeUser ? (
                    activeUser.name.charAt(0).toUpperCase()
                  ) : (
                    <UserIcon className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="hidden md:flex flex-col items-start leading-tight text-left">
                  <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate max-w-[120px]">
                    {activeUser ? activeUser.name : 'Masuk Akun'}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span className={`w-1.5 h-1.5 rounded-full ${isReal ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span className="truncate max-w-[110px] text-slate-400">
                      {isReal ? 'Cloud VPS' : 'Simulasi'}
                    </span>
                  </div>
                </div>
              </button>
            )}

            {/* Logout Button (Desktop only, mobile has it in BottomNav Menu) */}
            {onLogout && activeUser && (
              <button
                type="button"
                onClick={onLogout}
                className="hidden md:flex w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900/80 hover:bg-rose-950/50 border border-white/[0.08] hover:border-rose-500/40 text-slate-400 hover:text-rose-300 items-center justify-center transition-all active:scale-95 shrink-0"
                title="Keluar dari Akun"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Navigation Tabs (Ultra-sleek bar) */}
      <div className="hidden lg:block border-t border-white/[0.06] bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1.5 py-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
