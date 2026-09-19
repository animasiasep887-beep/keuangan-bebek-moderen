import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Egg,
  Users,
  PlusCircle,
  AlertTriangle,
  Scale,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Activity,
  Award,
  CheckCircle2,
  ChevronRight,
  X,
  Calendar,
  Smartphone,
  Bot,
  FileText,
} from 'lucide-react';
import type { FarmMetricsSummary, PencatatanHarian, TransaksiKeuangan, PakanItem, KomoditasTernak } from '../types';
import { KOMODITAS_LIST } from '../types';
import { formatIDR } from '../utils/exportUtils';
import { AuthService } from '../services/authService';
import { GrafikProduksiTelur } from './GrafikProduksiTelur';

interface DashboardViewProps {
  metrics: FarmMetricsSummary;
  logs: PencatatanHarian[];
  transactions: TransaksiKeuangan[];
  pakanList: PakanItem[];
  setActiveTab: (tab: string) => void;
  onOpenKalkulator?: () => void;
  onOpenKasir?: () => void;
  onOpenProyeksi?: () => void;
  onOpenInstallApp?: () => void;
  activeCommodity?: KomoditasTernak;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  logs,
  transactions,
  pakanList,
  setActiveTab,
  onOpenKalkulator,
  onOpenKasir,
  onOpenProyeksi,
  onOpenInstallApp,
  activeCommodity = 'BEBEK_PETELUR',
}) => {
  const isProfit = metrics.labaRugiMtd >= 0;

  // Low feed warning check
  const lowFeedItems = pakanList.filter((p) => p.stokKg <= p.minStokKg);

  // FCR Health Rating
  const fcrVal = metrics.fcrAverage || 0;
  const fcrStatus =
    fcrVal <= 3.2 ? { label: 'Sangat Efisien', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' } :
    fcrVal <= 3.8 ? { label: 'Normal / Baik', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' } :
    { label: 'Boros / Evaluasi', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };

  // HDP Rating
  const hdpVal = metrics.hdpHariIni || 0;
  const hdpStatus =
    hdpVal >= 80 ? { label: 'Produksi Tinggi', color: 'text-emerald-400 bg-emerald-500/10' } :
    hdpVal >= 65 ? { label: 'Produksi Normal', color: 'text-amber-400 bg-amber-500/10' } :
    { label: 'Produksi Rendah', color: 'text-rose-400 bg-rose-500/10' };

  const isNewData = logs.length <= 1;

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('hide_onboarding_v1') !== 'true';
  });

  const activeUser = AuthService.getCurrentUser();

  // Business Health Scorecard (0 - 100)
  const hdpScore = Math.min(35, Math.round((hdpVal / 85) * 35));
  const fcrScore = fcrVal <= 3.2 ? 25 : fcrVal <= 3.8 ? 20 : 12;
  const cashflowScore = metrics.saldoKas > 0 ? 25 : metrics.saldoKas === 0 ? 15 : 5;
  const piutangScore = metrics.totalPiutang < Math.max(1, metrics.saldoKas * 1.5) ? 15 : 8;
  const totalHealthScore = Math.min(100, Math.max(15, hdpScore + fcrScore + cashflowScore + piutangScore));

  const healthStatus = isNewData
    ? {
        label: 'DATA AWAL DIMULAI',
        desc: 'Mulai catat panen & pakan harian Anda untuk mengaktifkan kalkulasi otomatis.',
        color: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
        ringColor: '#38bdf8',
      }
    : totalHealthScore >= 85
    ? {
        label: 'PERFORMA PRIMA',
        desc: 'Peternakan sangat produktif, FCR ideal & arus kas terpantau stabil.',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
        ringColor: '#10b981',
      }
    : totalHealthScore >= 70
    ? {
        label: 'PERFORMA BAIK',
        desc: 'Operasional berjalan stabil, terus pantau ransum pakan dan penyerapan pasar.',
        color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        ringColor: '#f59e0b',
      }
    : {
        label: 'PERLU EVALUASI',
        desc: 'HDP berada di bawah target atau biaya pakan tinggi. Cek nutrisi dan kesehatan.',
        color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
        ringColor: '#f43f5e',
      };

  // SVG Gauge calculations
  const ringRadius = 26;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = isNewData
    ? 0
    : ringCircumference - (totalHealthScore / 100) * ringCircumference;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Onboarding Quick-Start Guide for Beginner Peternak */}
      {isNewData && showOnboarding && (
        <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900/95 to-emerald-500/10 border border-amber-500/30 relative overflow-hidden shadow-xl animate-toast">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-white truncate">
                  Panduan Singkat Peternak Modern
                </h3>
                <p className="text-[10px] text-slate-400 truncate">
                  3 langkah awal mudah untuk mulai memaksimalkan keuntungan Anda.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowOnboarding(false);
                localStorage.setItem('hide_onboarding_v1', 'true');
              }}
              className="px-2 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-bold shrink-0 border border-white/[0.08] transition-colors"
              title="Tutup Panduan"
            >
              <span>Tutup</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex sm:grid sm:grid-cols-3 gap-2 mt-2.5 overflow-x-auto pb-1">
            <div className="min-w-[190px] sm:min-w-0 flex-1 p-2 sm:p-2.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-bold text-emerald-300 truncate">1. Database Aktif</h4>
                <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Tersimpan aman di Hard Disk / VPS.</p>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('pengaturan')}
              className="min-w-[190px] sm:min-w-0 flex-1 p-2 sm:p-2.5 rounded-xl bg-slate-950/70 border border-white/[0.08] hover:border-amber-500/40 cursor-pointer transition-all flex items-center gap-2 group"
            >
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                2
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-[11px] sm:text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>Atur Kandang</span> <ChevronRight className="w-3 h-3 text-amber-400" />
                </h4>
                <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">{metrics.totalPopulasiHidup} ekor terdaftar.</p>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('operasional')}
              className="min-w-[190px] sm:min-w-0 flex-1 p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 hover:border-amber-400 cursor-pointer transition-all flex items-center gap-2 group"
            >
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                3
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-[11px] sm:text-xs font-bold text-amber-300 group-hover:text-amber-200 transition-colors flex items-center justify-between">
                  <span>Catat Panen</span> <ChevronRight className="w-3 h-3 text-amber-400" />
                </h4>
                <p className="text-[9px] sm:text-[10px] text-slate-300 truncate">Input hasil panen harian.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Luxury Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-amber-950/25 border border-amber-500/25 p-4 sm:p-6 lg:p-7 shadow-2xl backdrop-blur-xl">
        {/* Ambient Glows */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            {/* Badges Ribbon */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                {KOMODITAS_LIST[activeCommodity].icon} {KOMODITAS_LIST[activeCommodity].nama.toUpperCase()}
              </span>

              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Cloud VPS Online
              </span>

              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-flex items-center gap-1 ml-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            {/* Personalized Greeting */}
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Selamat Datang, {activeUser?.name || 'Peternak Modern'}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed flex items-center gap-1.5 flex-wrap">
                <span>Pusat kendali peternakan terpadu:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 font-bold text-amber-300 text-xs">
                  👑 {activeUser?.farmName || 'PRATAMA BISNIS GRUP'}
                </span>
              </p>
            </div>
          </div>

          {/* Action Group with Tactile Luxury Button */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('operasional')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-slate-950 shrink-0" />
              <span>+ Catat Panen Hari Ini</span>
            </button>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              {onOpenKasir && (
                <button
                  type="button"
                  onClick={onOpenKasir}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-bold text-xs sm:text-sm border border-amber-500/30 shadow-md active:scale-95 transition-all"
                  title="Buka Kasir Penjualan Telur / Panen"
                >
                  <span>🛒 Kasir POS</span>
                </button>
              )}

              {onOpenKalkulator && (
                <button
                  type="button"
                  onClick={onOpenKalkulator}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-white/[0.08] shadow-md active:scale-95 transition-all"
                  title="Buka Kalkulator Ransum & FCR"
                >
                  <span>🧮 Kalkulator</span>
                </button>
              )}

              {onOpenProyeksi && (
                <button
                  type="button"
                  onClick={onOpenProyeksi}
                  className="hidden sm:flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-sky-300 font-bold text-xs sm:text-sm border border-sky-500/30 shadow-md active:scale-95 transition-all"
                  title="Lihat Proyeksi Bisnis & Finansial"
                >
                  <span>📈 Proyeksi</span>
                </button>
              )}

              {onOpenInstallApp && (
                <button
                  type="button"
                  onClick={onOpenInstallApp}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 font-bold text-xs sm:text-sm border border-emerald-500/30 shadow-md active:scale-95 transition-all"
                  title="Pasang Aplikasi ke Android / iPhone"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pasang App</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Operational Status & Radial Health Gauge Bar */}
        <div className="mt-5 pt-4 sm:pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* SVG Circular Dial Score */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  stroke={healthStatus.ringColor}
                  strokeWidth="5"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute font-black text-xs text-white">
                {isNewData ? '🌱' : totalHealthScore}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider">
                  Kesehatan Operasional:
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${healthStatus.color}`}>
                  {healthStatus.label}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-tight mt-0.5">
                {healthStatus.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs shrink-0">
            <span className="text-slate-400">Total Hari Dicatat:</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/[0.08] font-black text-amber-300">
              {logs.length} Hari
            </span>
          </div>
        </div>
      </div>

      {/* Low Feed Warning Banner if any */}
      {lowFeedItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between gap-4 animate-toast">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-200">Peringatan Stok Pakan Menipis!</p>
              <p className="text-xs text-amber-300/80">
                {lowFeedItems.map((p) => `${p.namaPakan} (Sisa: ${p.stokKg} kg)`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('operasional')}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shrink-0"
          >
            Restock Pakan
          </button>
        </div>
      )}

      {/* 4 Main High-Level Metric KPI Cards (2x2 on Mobile, 4-col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Saldo Kas */}
        <div className="glass-card-luxury glass-card-hover rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-white/[0.08] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between relative z-10">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Saldo Kas
            </p>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shadow-sm shrink-0">
              <Wallet className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3.5 relative z-10">
            <h3 className="text-base sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight truncate">
              {formatIDR(metrics.saldoKas)}
            </h3>
            <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">Kas operasional aktif</span>
            </div>
          </div>
        </div>

        {/* Card 2: Laba / Rugi MTD */}
        <div className="glass-card-luxury glass-card-hover rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-white/[0.08] relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 ${isProfit ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' : 'bg-rose-500/10 group-hover:bg-rose-500/20'} rounded-full blur-2xl pointer-events-none transition-all`} />
          <div className="flex items-center justify-between relative z-10">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Laba / Rugi (MTD)
            </p>
            <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl ${isProfit ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'} flex items-center justify-center shadow-sm shrink-0`}>
              {isProfit ? <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> : <TrendingDown className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
            </div>
          </div>
          <div className="mt-2 sm:mt-3.5 relative z-10">
            <h3 className={`text-base sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight truncate ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatIDR(metrics.labaRugiMtd)}
            </h3>
            <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-semibold text-slate-400 truncate">
              <span>{isProfit ? 'Laba bersih berjalan' : 'Rugi bersih berjalan'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Dynamic Commodity Production */}
        <div className="glass-card-luxury glass-card-hover rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-amber-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between relative z-10">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              {metrics.labelProduksiUtama || 'Produksi Harian'}
            </p>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-sm shrink-0">
              {activeCommodity === 'SAPI' ? (
                <Activity className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              ) : activeCommodity === 'LELE' ? (
                <Award className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              ) : activeCommodity === 'AYAM_PEDAGING' ? (
                <Scale className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              ) : (
                <Egg className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              )}
            </div>
          </div>
          <div className="mt-2 sm:mt-3.5 relative z-10">
            <h3 className="text-base sm:text-2xl lg:text-3xl font-black text-amber-400 tracking-tight leading-tight truncate">
              {metrics.nilaiProduksiHariIni || (metrics.hdpHariIni + '%')}
            </h3>
            <div className="flex items-center justify-between mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-semibold text-slate-400 truncate">
              {activeCommodity === 'BEBEK_PETELUR' || activeCommodity === 'AYAM_PETELUR' ? (
                <span className="truncate">{metrics.totalTelurHariIni.toLocaleString('id-ID')} butir ({hdpStatus.label})</span>
              ) : activeCommodity === 'AYAM_PEDAGING' ? (
                <span className="truncate">{metrics.rataBobotBroilerKg ? `${metrics.rataBobotBroilerKg} Kg/ekor` : 'Belum panen'}</span>
              ) : activeCommodity === 'SAPI' ? (
                <span className="truncate">{metrics.totalSusuHariIniLiter || 0} Liter susu</span>
              ) : (
                <span className="truncate">{metrics.biomassaIkanKg ? `${metrics.biomassaIkanKg.toLocaleString('id-ID')} Kg` : '0 Kg'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Dynamic Population & Health */}
        <div
          onClick={() => setActiveTab('pengaturan')}
          className="glass-card-luxury glass-card-hover rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-white/[0.08] relative overflow-hidden group hover:border-amber-500/40 cursor-pointer transition-all"
        >
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 bg-sky-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between relative z-10">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              {metrics.labelPopulasi || 'Populasi Ternak'}
            </p>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/25 group-hover:bg-amber-500/20 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-all flex items-center justify-center shadow-sm shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3.5 relative z-10">
            <h3 className="text-base sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight truncate">
              {metrics.totalPopulasiHidup.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-medium text-slate-400">
                {activeCommodity === 'SAPI' ? 'sapi' : activeCommodity === 'LELE' ? 'ikan' : 'ekor'}
              </span>
            </h3>
            <div className="flex items-center justify-between mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-semibold text-amber-400 group-hover:underline truncate">
              <span className="truncate">
                FCR: <strong className="text-sky-300">{metrics.nilaiEfisiensi || metrics.fcrAverage}</strong> ({fcrStatus.label})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Action Grid (Mobile-friendly shortcuts) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('operasional')}
          className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.08] hover:border-amber-500/30 flex items-center gap-2.5 transition-all text-left group active:scale-98 shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-black shrink-0 group-hover:scale-105 transition-transform">
            <Egg className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">
              Operasional
            </h4>
            <p className="text-[10px] text-slate-400 truncate">Input panen & pakan</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('keuangan')}
          className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.08] hover:border-emerald-500/30 flex items-center gap-2.5 transition-all text-left group active:scale-98 shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black shrink-0 group-hover:scale-105 transition-transform">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors truncate">
              Buku Kas
            </h4>
            <p className="text-[10px] text-slate-400 truncate">Pemasukan & beban</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.08] hover:border-sky-500/30 flex items-center gap-2.5 transition-all text-left group active:scale-98 shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-black shrink-0 group-hover:scale-105 transition-transform">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-white group-hover:text-sky-300 transition-colors truncate">
              Konsultan AI
            </h4>
            <p className="text-[10px] text-slate-400 truncate">Analisa & diagnosa</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('laporan')}
          className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.08] hover:border-amber-500/30 flex items-center gap-2.5 transition-all text-left group active:scale-98 shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-black shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-white group-hover:text-purple-300 transition-colors truncate">
              Laporan Laba
            </h4>
            <p className="text-[10px] text-slate-400 truncate">Export PDF & Excel</p>
          </div>
        </button>
      </div>

      {/* Main Production & HDP Interactive Chart */}
      <GrafikProduksiTelur logs={logs} activeCommodity={activeCommodity} />

      {/* Secondary Row: Recent Financial Transactions & Feed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Transaksi Keuangan Terbaru
            </h3>
            <button
              onClick={() => setActiveTab('keuangan')}
              className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Buka Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {transactions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Belum ada transaksi tercatat. Mulai catat di menu Keuangan atau Kasir POS.
              </div>
            ) : (
              transactions.slice(0, 5).map((trx) => {
                const isIncome = trx.tipeTransaksi === 'PENDAPATAN';
                return (
                  <div key={trx.id} className="py-3 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          {trx.deskripsi}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {trx.tanggal} • <span className="font-mono text-slate-500">{trx.noRef}</span>
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs sm:text-sm font-black shrink-0 ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isIncome ? '+' : '-'}{formatIDR(trx.totalNominal)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Feed & Operational Quick Overview */}
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              Stok Pakan & Nutrisi
            </h3>
            <button
              onClick={() => setActiveTab('operasional')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Kelola
            </button>
          </div>

          <div className="space-y-3">
            {pakanList.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                Belum ada master pakan terdaftar.
              </div>
            ) : (
              pakanList.map((pakan) => {
                const percentage = Math.min(100, Math.round((pakan.stokKg / 2000) * 100));
                const isLow = pakan.stokKg <= pakan.minStokKg;
                return (
                  <div key={pakan.id} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-white truncate max-w-[140px]">{pakan.namaPakan}</span>
                      <span className={`font-extrabold ${isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {pakan.stokKg.toLocaleString('id-ID')} kg
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLow ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
