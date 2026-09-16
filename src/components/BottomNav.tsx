import React, { useState } from 'react';
import {
  LayoutDashboard,
  Egg,
  DollarSign,
  FileText,
  Menu,
  ShoppingCart,
  Calculator,
  TrendingUp,
  Bot,
  Package,
  LogOut,
  X,
  User as UserIcon,
} from 'lucide-react';
import type { User, KomoditasTernak } from '../types';
import { KOMODITAS_LIST } from '../types';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onOpenKasir: () => void;
  onOpenKalkulator: () => void;
  onOpenProyeksi: () => void;
  onLogout: () => void;
  currentUser: User | null;
  activeCommodity?: KomoditasTernak;
  onChangeCommodity?: (commodity: KomoditasTernak) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenKasir,
  onOpenKalkulator,
  onOpenProyeksi,
  onLogout,
  currentUser,
  activeCommodity,
  onChangeCommodity,
}) => {
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  return (
    <>
      {/* BOTTOM NAVIGATION BAR (Visible on Mobile / Android < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 pb-safe shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* 1. Dashboard */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'text-amber-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'dashboard' ? 'bg-amber-500/20' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">Beranda</span>
          </button>

          {/* 2. Panen Harian */}
          <button
            type="button"
            onClick={() => setActiveTab('operasional')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'operasional'
                ? 'text-amber-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'operasional' ? 'bg-amber-500/20' : ''}`}>
              <Egg className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">Panen</span>
          </button>

          {/* 3. Kasir Telur - Center Prominent Action Button */}
          <div className="relative -top-3.5">
            <button
              type="button"
              onClick={onOpenKasir}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-slate-950 flex flex-col items-center justify-center shadow-lg shadow-amber-500/40 border-2 border-slate-950 active:scale-90 transition-transform"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="block text-[9px] font-black text-amber-400 text-center mt-0.5">
              Kasir
            </span>
          </div>

          {/* 4. Keuangan */}
          <button
            type="button"
            onClick={() => setActiveTab('keuangan')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'keuangan'
                ? 'text-amber-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'keuangan' ? 'bg-amber-500/20' : ''}`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">Keuangan</span>
          </button>

          {/* 5. Menu Lainnya (Drawer) */}
          <button
            type="button"
            onClick={() => setIsMenuDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isMenuDrawerOpen || activeTab === 'laporan' || activeTab === 'ai' || activeTab === 'aset'
                ? 'text-amber-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="p-1 rounded-lg">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">Menu</span>
          </button>
        </div>
      </nav>

      {/* MOBILE BOTTOM SHEET / DRAWER */}
      {isMenuDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-lg mx-auto bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-5 shadow-2xl space-y-4 animate-slideUp max-h-[85vh] overflow-y-auto"
          >
            {/* Header Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white line-clamp-1">
                    {currentUser?.farmName || 'Peternakan Saya'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {currentUser?.name || 'Peternak'} • <span className="text-amber-400 font-bold">{currentUser?.plan || 'PREMIUM'}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMenuDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Commodity Selector inside Drawer */}
            {activeCommodity && onChangeCommodity && (
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <span>🌾</span> <span>Sektor Ternak:</span>
                  </span>
                  <span className="font-extrabold text-amber-400">
                    {KOMODITAS_LIST[activeCommodity].icon} {KOMODITAS_LIST[activeCommodity].nama}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {(Object.keys(KOMODITAS_LIST) as KomoditasTernak[]).map((key) => {
                    const item = KOMODITAS_LIST[key];
                    const isSelected = key === activeCommodity;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          onChangeCommodity(key);
                        }}
                        className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                        }`}
                        title={item.nama}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="text-[9px] mt-0.5 truncate w-full text-center">{item.nama.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Menu Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('laporan');
                  setIsMenuDrawerOpen(false);
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                  activeTab === 'laporan'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
                }`}
              >
                <FileText className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold">Laporan PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('ai');
                  setIsMenuDrawerOpen(false);
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                  activeTab === 'ai'
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
                }`}
              >
                <Bot className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold">Dokter AI</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('aset');
                  setIsMenuDrawerOpen(false);
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                  activeTab === 'aset'
                    ? 'bg-sky-500/20 border border-sky-500/40 text-sky-400'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
                }`}
              >
                <Package className="w-5 h-5 text-sky-400" />
                <span className="text-xs font-bold">Aset & Piutang</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuDrawerOpen(false);
                  onOpenKalkulator();
                }}
                className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 flex flex-col items-center justify-center text-center gap-1.5"
              >
                <Calculator className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-bold">Kalkulator</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuDrawerOpen(false);
                  onOpenProyeksi();
                }}
                className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 flex flex-col items-center justify-center text-center gap-1.5"
              >
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold">Proyeksi 12 Bln</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('pengaturan');
                  setIsMenuDrawerOpen(false);
                }}
                className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 flex flex-col items-center justify-center text-center gap-1.5"
              >
                <span className="text-lg">⚙️</span>
                <span className="text-xs font-bold">Pengaturan</span>
              </button>
            </div>

            {/* Logout Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsMenuDrawerOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-98"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun (Logout)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
