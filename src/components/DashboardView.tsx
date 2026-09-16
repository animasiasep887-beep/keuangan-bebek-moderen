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
    { label: 'Boros / Perlu Evaluasi', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };

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
        desc: 'Mulai catat panen & pakan harian Anda untuk mengaktifkan analisa otomatis AI.',
        color: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
      }
    : totalHealthScore >= 85
    ? {
        label: 'PERFORMA PRIMA',
        desc: 'Peternakan sangat produktif & arus kas sehat.',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      }
    : totalHealthScore >= 70
    ? {
        label: 'PERFORMA BAIK',
        desc: 'Operasional stabil, terus jaga efisiensi pakan.',
        color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      }
    : {
        label: 'PERLU EVALUASI',
        desc: 'Tingkatkan HDP dan evaluasi ransum pakan.',
        color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      };

  return (
    <div className="space-y-6">
      {/* Onboarding Quick-Start Guide for Beginner Peternak */}
      {isNewData && showOnboarding && (
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-emerald-500/10 border border-amber-500/30 relative overflow-hidden shadow-xl animate-toast">
          <div className="flex items-center justify-between gap-3 pb-2.5 sm:pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-white truncate">
                  Panduan Cepat Peternak Baru
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                  3 langkah mudah untuk memulai pencatatan Anda.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowOnboarding(false);
                localStorage.setItem('hide_onboarding_v1', 'true');
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center shrink-0 border border-white/[0.06] transition-colors"
              title="Tutup Panduan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-2.5 sm:mt-3.5">
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-950/60 border border-emerald-500/30 flex items-center sm:items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-emerald-300">1. Akun Tersinkron</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Database aman di Cloud VPS.</p>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('pengaturan')}
              className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-950/60 border border-white/[0.08] hover:border-amber-500/40 cursor-pointer transition-all flex items-center sm:items-start gap-2.5 group"
            >
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>Atur Populasi</span> <ChevronRight className="w-3 h-3 text-amber-400" />
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{metrics.totalPopulasiHidup} ekor kandang.</p>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('operasional')}
              className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 hover:border-amber-400 cursor-pointer transition-all flex items-center sm:items-start gap-2.5 group"
            >
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] sm:text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-amber-300 group-hover:text-amber-200 transition-colors flex items-center justify-between">
                  <span>Catat Panen</span> <ChevronRight className="w-3 h-3 text-amber-400" />
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">Mulai input panen perdana.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Welcome Hero Card */}
      <div className="glass-panel-glow rounded-3xl p-5 sm:p-7 relative overflow-hidden border border-amber-500/20 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" /> {KOMODITAS_LIST[activeCommodity].icon} {KOMODITAS_LIST[activeCommodity].nama.toUpperCase()} • MONITORING
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-2.5 sm:mt-3">
              Selamat Datang, {activeUser?.name || 'Peternak Modern'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Ringkasan operasional harian & keuangan untuk <strong className="text-amber-300">{activeUser?.farmName || 'Peternakan Anda'}</strong>.
            </p>
          </div>

          {/* Action Group with clear, prominent Primary CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('operasional')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>+ Catat Panen Hari Ini</span>
            </button>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              {onOpenKasir && (
                <button
                  type="button"
                  onClick={onOpenKasir}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-bold text-xs sm:text-sm border border-amber-500/30 shadow-md active:scale-95 transition-all"
                >
                  <span>🛒 Kasir POS</span>
                </button>
              )}

              {onOpenKalkulator && (
                <button
                  type="button"
                  onClick={onOpenKalkulator}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-white/[0.08] shadow-md active:scale-95 transition-all"
                >
                  <span>🧮 Kalkulator</span>
                </button>
              )}

              {onOpenProyeksi && (
                <button
                  type="button"
                  onClick={onOpenProyeksi}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-emerald-300 font-bold text-xs sm:text-sm border border-emerald-500/30 shadow-md active:scale-95 transition-all"
                >
                  <span>📈 Proyeksi</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Operational Status Bar */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-300 font-black flex items-center justify-center text-lg shadow-inner shrink-0">
              {isNewData ? '🌱' : totalHealthScore}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider">Status Peternakan:</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${healthStatus.color}`}>
                  {healthStatus.label}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-tight mt-0.5">
                {healthStatus.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className="text-slate-400">Total Hari Dicatat:</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/[0.08] font-black text-amber-300">
              {logs.length} Hari
            </span>
          </div>
        </div>
      </div>


      {/* Low Feed Warning Banner if any */}
      {lowFeedItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between gap-4">
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

      {/* 4 Main High-Level Metric KPI Cards (Fintech Luxury Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Kas */}
        <div className="glass-card-luxury glass-card-hover rounded-3xl p-5 border border-white/[0.08] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between relative z-10">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Saldo Kas Saat Ini</p>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3.5 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatIDR(metrics.saldoKas)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Arus kas operasional aktif</span>
            </div>
          </div>
        </div>

        {/* Card 2: Laba / Rugi MTD */}
        <div className="glass-card-luxury glass-card-hover rounded-3xl p-5 border border-white/[0.08] relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-28 h-28 ${isProfit ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' : 'bg-rose-500/10 group-hover:bg-rose-500/20'} rounded-full blur-2xl pointer-events-none transition-all`} />
          <div className="flex items-center justify-between relative z-10">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Laba / Rugi Bulan Ini</p>
            <div className={`w-10 h-10 rounded-2xl ${isProfit ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'} flex items-center justify-center shadow-sm`}>
              {isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3.5 relative z-10">
            <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatIDR(metrics.labaRugiMtd)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-400">
              <span>{isProfit ? 'Est. Keuntungan Bersih (MTD)' : 'Est. Kerugian Bersih (MTD)'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Dynamic Commodity Production / Primary Metric */}
        <div className="glass-card-luxury glass-card-hover rounded-3xl p-5 border border-amber-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between relative z-10">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {metrics.labelProduksiUtama || 'Produksi Harian'}
            </p>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-sm">
              {activeCommodity === 'SAPI' ? (
                <Activity className="w-5 h-5" />
              ) : activeCommodity === 'LELE' ? (
                <Award className="w-5 h-5" />
              ) : activeCommodity === 'AYAM_PEDAGING' ? (
                <Scale className="w-5 h-5" />
              ) : (
                <Egg className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="mt-3.5 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
              {metrics.nilaiProduksiHariIni || (metrics.hdpHariIni + '%')}
            </h3>
            <div className="flex items-center justify-between mt-2 text-xs font-semibold text-slate-400">
              {activeCommodity === 'BEBEK_PETELUR' || activeCommodity === 'AYAM_PETELUR' ? (
                <span>Hasil: {metrics.totalTelurHariIni.toLocaleString('id-ID')} butir ({hdpStatus.label})</span>
              ) : activeCommodity === 'AYAM_PEDAGING' ? (
                <span>Panen: {metrics.rataBobotBroilerKg ? `${metrics.rataBobotBroilerKg} Kg/ekor` : 'Belum panen'}</span>
              ) : activeCommodity === 'SAPI' ? (
                <span>Perahan: {metrics.totalSusuHariIniLiter || 0} Liter susu</span>
              ) : (
                <span>Biomassa: {metrics.biomassaIkanKg ? `${metrics.biomassaIkanKg.toLocaleString('id-ID')} Kg` : '0 Kg'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Dynamic Population & Health */}
        <div
          onClick={() => setActiveTab('pengaturan')}
          className="glass-card-luxury glass-card-hover rounded-3xl p-5 border border-white/[0.08] relative overflow-hidden group hover:border-amber-500/40 cursor-pointer transition-all"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between relative z-10">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {metrics.labelPopulasi || 'Populasi Ternak'}
            </p>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/25 group-hover:bg-amber-500/20 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-all flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3.5 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {metrics.totalPopulasiHidup.toLocaleString('id-ID')}{' '}
              <span className="text-sm font-medium text-slate-400">
                {activeCommodity === 'SAPI' ? 'ekor sapi' : activeCommodity === 'LELE' ? 'ekor ikan' : 'ekor'}
              </span>
            </h3>
            <div className="flex items-center justify-between mt-2 text-xs font-semibold text-amber-400 group-hover:underline">
              <span>
                {metrics.labelEfisiensi || 'Efisiensi'}:{' '}
                <strong className="text-sky-300">{metrics.nilaiEfisiensi || metrics.fcrAverage}</strong>{' '}
                <span className="text-[10px] text-slate-400 font-normal">({fcrStatus.label})</span>
              </span>
              <span>Kelola →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Egg Production & HDP Interactive Chart */}
      <GrafikProduksiTelur logs={logs} activeCommodity={activeCommodity} />

      {/* Secondary Row: Recent Financial Transactions & Feed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Transaksi Keuangan Terbaru
            </h3>
            <button
              onClick={() => setActiveTab('keuangan')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Lihat Semua
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {transactions.slice(0, 5).map((trx) => {
              const isIncome = trx.tipeTransaksi === 'PENDAPATAN';
              return (
                <div key={trx.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">{trx.deskripsi}</p>
                      <p className="text-[11px] text-slate-400">{trx.tanggal} • {trx.noRef}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-black shrink-0 ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isIncome ? '+' : '-'}{formatIDR(trx.totalNominal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feed & Operational Quick Overview */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            Stok Pakan & Nutrisi
          </h3>

          <div className="space-y-3">
            {pakanList.map((pakan) => {
              const percentage = Math.min(100, Math.round((pakan.stokKg / 2000) * 100));
              const isLow = pakan.stokKg <= pakan.minStokKg;
              return (
                <div key={pakan.id} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-white">{pakan.namaPakan}</span>
                    <span className={`font-extrabold ${isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {pakan.stokKg} kg
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
