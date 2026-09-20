import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Calendar,
  Trash2,
  Search,
  ShoppingBag,
  Pencil,
  X,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Receipt,
  FileSpreadsheet,
  Share2,
  Activity,
  Layers,
  Sparkles,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import * as XLSX from 'xlsx';
import type { TransaksiKeuangan, KodeAkun } from '../types';
import { StorageService } from '../services/storage';
import { formatIDR } from '../utils/exportUtils';
import { useToast } from './ToastContainer';
import { NotaStrukModal, type NotaData } from './NotaStrukModal';

interface KeuanganViewProps {
  transactions: TransaksiKeuangan[];
  kodeAkunList: KodeAkun[];
  onRefreshData: () => void;
  onOpenKasir?: () => void;
}

type TimeRangeFilter = 'semua' | 'hari_ini' | '7d' | 'bulan_ini' | 'tahun_ini';

export const KeuanganView: React.FC<KeuanganViewProps> = ({
  transactions,
  kodeAkunList,
  onRefreshData,
  onOpenKasir,
}) => {
  const { showToast } = useToast();

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<'semua' | 'pendapatan' | 'pengeluaran' | 'tambah'>('semua');
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showCharts, setShowCharts] = useState<boolean>(true);
  const [chartMode, setChartMode] = useState<'trend' | 'distribution'>('trend');

  // Struk / Nota Modal State
  const [selectedNota, setSelectedNota] = useState<NotaData | null>(null);
  const [isNotaOpen, setIsNotaOpen] = useState<boolean>(false);

  // Form State
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deskripsi, setDeskripsi] = useState<string>('');
  const [totalNominal, setTotalNominal] = useState<number>(0);
  const [tipeTransaksi, setTipeTransaksi] = useState<'PENDAPATAN' | 'PENGELUARAN'>('PENDAPATAN');
  const [kategoriPendapatan, setKategoriPendapatan] = useState<string>('TELUR_GRADE_A');
  const [kategoriPengeluaran, setKategoriPengeluaran] = useState<string>('PAKAN');
  const [akunKasId, setAkunKasId] = useState<string>('101'); // Kas Utama
  const [akunLawanId, setAkunLawanId] = useState<string>('401'); // Pendapatan Telur Grade A

  // Delete Confirm State
  const [confirmDeleteTrxId, setConfirmDeleteTrxId] = useState<string | null>(null);

  // Edit Transaksi State
  const [editingTrx, setEditingTrx] = useState<TransaksiKeuangan | null>(null);
  const [editTrxTanggal, setEditTrxTanggal] = useState<string>('');
  const [editTrxTipe, setEditTrxTipe] = useState<'PENDAPATAN' | 'PENGELUARAN'>('PENGELUARAN');
  const [editTrxKategoriPendapatan, setEditTrxKategoriPendapatan] = useState<string>('TELUR_GRADE_A');
  const [editTrxKategoriPengeluaran, setEditTrxKategoriPengeluaran] = useState<string>('PAKAN');
  const [editTrxDeskripsi, setEditTrxDeskripsi] = useState<string>('');
  const [editTrxNominal, setEditTrxNominal] = useState<number>(0);

  // Helper: Category Labels and Icons
  const getCategoryMeta = (trx: TransaksiKeuangan) => {
    const isInc = trx.tipeTransaksi === 'PENDAPATAN';
    const kat = isInc ? trx.kategoriPendapatan : trx.kategoriPengeluaran;

    if (isInc) {
      switch (kat) {
        case 'TELUR_GRADE_A':
          return { label: 'Telur Grade A', icon: '🥚', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
        case 'TELUR_GRADE_B':
          return { label: 'Telur Grade B', icon: '🍳', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
        case 'BEBEK_AFKIR':
          return { label: 'Bebek Afkir', icon: '🦆', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
        case 'PUPUK_KANDANG':
          return { label: 'Pupuk Kandang', icon: '🌱', color: 'bg-lime-500/10 text-lime-400 border-lime-500/30' };
        default:
          return { label: kat || 'Pendapatan Lain', icon: '💰', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      }
    } else {
      switch (kat) {
        case 'PAKAN':
          return { label: 'Belanja Pakan', icon: '🌾', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
        case 'OBAT_VAKSIN':
          return { label: 'Vaksin & Vitamin', icon: '💉', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' };
        case 'GAJI':
          return { label: 'Upah / Gaji', icon: '👷', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
        case 'OPERASIONAL_KANDANG':
          return { label: 'Operasional Kandang', icon: '🛠️', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30' };
        case 'LISTRIK_AIR':
          return { label: 'Listrik & Air', icon: '💡', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' };
        default:
          return { label: kat || 'Beban Lainnya', icon: '📦', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      }
    }
  };

  // Quick Preset Handlers
  const handleApplyPreset = (preset: {
    tipe: 'PENDAPATAN' | 'PENGELUARAN';
    kategori: string;
    akunLawan: string;
    deskripsiDefault: string;
  }) => {
    setTipeTransaksi(preset.tipe);
    if (preset.tipe === 'PENDAPATAN') {
      setKategoriPendapatan(preset.kategori);
    } else {
      setKategoriPengeluaran(preset.kategori);
    }
    setAkunLawanId(preset.akunLawan);
    setDeskripsi(preset.deskripsiDefault);
    setActiveTab('tambah');
    showToast(`Mode preset: ${preset.deskripsiDefault} aktif!`, 'info');
  };

  const handleTipeChange = (tipe: 'PENDAPATAN' | 'PENGELUARAN') => {
    setTipeTransaksi(tipe);
    if (tipe === 'PENDAPATAN') {
      setAkunLawanId('401');
    } else {
      setAkunLawanId('501');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalNominal <= 0 || !deskripsi.trim()) {
      showToast('Mohon isi nominal dan deskripsi transaksi!', 'warning');
      return;
    }

    // Build Double-Entry Journal Items
    const items = [];
    if (tipeTransaksi === 'PENDAPATAN') {
      items.push({ akunId: akunKasId, debit: totalNominal, kredit: 0 });
      items.push({ akunId: akunLawanId, debit: 0, kredit: totalNominal });
    } else {
      items.push({ akunId: akunLawanId, debit: totalNominal, kredit: 0 });
      items.push({ akunId: akunKasId, debit: 0, kredit: totalNominal });
    }

    StorageService.addTransaksiKeuangan({
      tanggal,
      deskripsi,
      totalNominal,
      tipeTransaksi,
      kategoriPendapatan: tipeTransaksi === 'PENDAPATAN' ? kategoriPendapatan : undefined,
      kategoriPengeluaran: tipeTransaksi === 'PENGELUARAN' ? kategoriPengeluaran : undefined,
      items,
      createdBy: 'Owner',
    });

    showToast('Transaksi Keuangan Berhasil Dicatat!', 'success');
    onRefreshData();

    setActiveTab('semua');
    setDeskripsi('');
    setTotalNominal(0);
  };

  // Filter Transactions by Time Range, Tab, Category, and Search
  const filteredTrxs = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    const currentYearMonth = todayStr.slice(0, 7);
    const currentYear = todayStr.slice(0, 4);

    return transactions.filter((t) => {
      // 1. Time Range Filter
      if (timeRange === 'hari_ini' && t.tanggal !== todayStr) return false;
      if (timeRange === '7d' && t.tanggal < sevenDaysAgoStr) return false;
      if (timeRange === 'bulan_ini' && !t.tanggal.startsWith(currentYearMonth)) return false;
      if (timeRange === 'tahun_ini' && !t.tanggal.startsWith(currentYear)) return false;

      // 2. Tab Filter (Semua / Pendapatan / Pengeluaran)
      if (activeTab === 'pendapatan' && t.tipeTransaksi !== 'PENDAPATAN') return false;
      if (activeTab === 'pengeluaran' && t.tipeTransaksi !== 'PENGELUARAN') return false;

      // 3. Category Filter
      if (selectedCategory !== 'ALL') {
        const cat = t.tipeTransaksi === 'PENDAPATAN' ? t.kategoriPendapatan : t.kategoriPengeluaran;
        if (cat !== selectedCategory) return false;
      }

      // 4. Search Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchDesc = t.deskripsi.toLowerCase().includes(query);
        const matchRef = t.noRef.toLowerCase().includes(query);
        const matchTgl = t.tanggal.includes(query);
        const matchNominal = t.totalNominal.toString().includes(query);
        if (!matchDesc && !matchRef && !matchTgl && !matchNominal) return false;
      }

      return true;
    });
  }, [transactions, timeRange, activeTab, selectedCategory, searchTerm]);

  // Financial Metrics Calculations for Filtered Period
  const {
    totalPendapatan,
    totalPengeluaran,
    arusKasBersih,
    countPendapatan,
    countPengeluaran,
    avgPendapatan,
    marginLabaPersen,
    healthScore,
    expenseBreakdown,
    revenueBreakdown,
  } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    let cInc = 0;
    let cExp = 0;

    const expMap: Record<string, number> = {};
    const revMap: Record<string, number> = {};

    filteredTrxs.forEach((t) => {
      if (t.tipeTransaksi === 'PENDAPATAN') {
        inc += t.totalNominal;
        cInc += 1;
        const k = t.kategoriPendapatan || 'LAINNYA';
        revMap[k] = (revMap[k] || 0) + t.totalNominal;
      } else if (t.tipeTransaksi === 'PENGELUARAN') {
        exp += t.totalNominal;
        cExp += 1;
        const k = t.kategoriPengeluaran || 'LAINNYA';
        expMap[k] = (expMap[k] || 0) + t.totalNominal;
      }
    });

    const net = inc - exp;
    const margin = inc > 0 ? ((net / inc) * 100).toFixed(1) : '0';
    const avgInc = cInc > 0 ? Math.round(inc / cInc) : 0;

    // Financial Health Score Calculation (0 - 100)
    let score = 70;
    if (cInc === 0 && cExp === 0) {
      score = 80; // Netral saat data masih awal
    } else if (inc > 0 && exp > 0) {
      const ratio = exp / inc;
      if (ratio <= 0.6) score = 95; // Prima (Beban <= 60%)
      else if (ratio <= 0.8) score = 85; // Sehat
      else if (ratio <= 1.0) score = 70; // Pas-pasan
      else score = 45; // Defisit
    } else if (inc > 0 && exp === 0) {
      score = 100;
    } else if (exp > 0 && inc === 0) {
      score = 40;
    }

    // Sort breakdowns
    const sortedExp = Object.entries(expMap)
      .map(([k, val]) => ({
        kategori: k,
        total: val,
        persen: exp > 0 ? ((val / exp) * 100).toFixed(0) : '0',
      }))
      .sort((a, b) => b.total - a.total);

    const sortedRev = Object.entries(revMap)
      .map(([k, val]) => ({
        kategori: k,
        total: val,
        persen: inc > 0 ? ((val / inc) * 100).toFixed(0) : '0',
      }))
      .sort((a, b) => b.total - a.total);

    return {
      totalPendapatan: inc,
      totalPengeluaran: exp,
      arusKasBersih: net,
      countPendapatan: cInc,
      countPengeluaran: cExp,
      avgPendapatan: avgInc,
      marginLabaPersen: margin,
      healthScore: score,
      expenseBreakdown: sortedExp,
      revenueBreakdown: sortedRev,
    };
  }, [filteredTrxs]);

  // Chart Data: Group daily trend
  const chartData = useMemo(() => {
    const map: Record<string, { tanggal: string; pendapatan: number; pengeluaran: number }> = {};
    const sorted = [...filteredTrxs].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

    sorted.forEach((t) => {
      if (!map[t.tanggal]) {
        map[t.tanggal] = { tanggal: t.tanggal, pendapatan: 0, pengeluaran: 0 };
      }
      if (t.tipeTransaksi === 'PENDAPATAN') {
        map[t.tanggal].pendapatan += t.totalNominal;
      } else {
        map[t.tanggal].pengeluaran += t.totalNominal;
      }
    });

    return Object.values(map).map((item) => ({
      ...item,
      labelTanggal: item.tanggal.slice(5), // MM-DD
    }));
  }, [filteredTrxs]);

  // Export to Excel Handler
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const exportRows = filteredTrxs.map((t, idx) => ({
        'No': idx + 1,
        'Tanggal': t.tanggal,
        'No Referensi': t.noRef,
        'Deskripsi': t.deskripsi,
        'Tipe Transaksi': t.tipeTransaksi,
        'Kategori': t.kategoriPendapatan || t.kategoriPengeluaran || '-',
        'Nominal (IDR)': t.totalNominal,
        'Dibuat Oleh': t.createdBy || 'Peternak',
      }));

      const ws = XLSX.utils.json_to_sheet(
        exportRows.length > 0
          ? exportRows
          : [{ 'Keterangan': 'Tidak ada data transaksi pada periode ini' }]
      );
      ws['!cols'] = [
        { wch: 6 },
        { wch: 14 },
        { wch: 22 },
        { wch: 40 },
        { wch: 16 },
        { wch: 22 },
        { wch: 18 },
        { wch: 14 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Jurnal Kas');
      XLSX.writeFile(wb, `Laporan_Kas_BebekJaya_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showToast('Laporan kas berhasil diunduh dalam format Excel!', 'success');
    } catch {
      showToast('Gagal mengunduh file Excel!', 'warning');
    }
  };

  // Copy WhatsApp Summary Handler
  const handleCopyWhatsAppSummary = () => {
    const rangeLabel =
      timeRange === 'hari_ini' ? 'HARI INI' :
      timeRange === '7d' ? '7 HARI TERAKHIR' :
      timeRange === 'bulan_ini' ? 'BULAN INI' :
      timeRange === 'tahun_ini' ? 'TAHUN INI' : 'SELURUH PERIODE';

    const text = `📊 *LAPORAN ARUS KAS & KEUANGAN PETERNAKAN*
🏢 *BebekJaya PRO - Peternakan Modern*
🗓️ *Periode:* ${rangeLabel} (${new Date().toLocaleDateString('id-ID')})
---------------------------------------------
📈 *Total Pendapatan:* ${formatIDR(totalPendapatan)} (${countPendapatan} trx)
📉 *Total Pengeluaran:* ${formatIDR(totalPengeluaran)} (${countPengeluaran} trx)
💰 *Arus Kas Bersih :* ${arusKasBersih >= 0 ? '+' : ''}${formatIDR(arusKasBersih)}
📊 *Margin Laba     :* ${marginLabaPersen}%
🎯 *Status Finansial:* ${arusKasBersih >= 0 ? 'SURPLUS OPERASIONAL ✅' : 'DEFISIT BERJALAN ⚠️'}
---------------------------------------------
_Dicatat & diverifikasi otomatis via SIM Peternakan ternak.fun_`;

    navigator.clipboard.writeText(text);
    showToast('Ringkasan keuangan berhasil disalin! Siap ditempel ke WhatsApp.', 'success');
  };

  // Open Struk / Nota Modal from Transaction
  const handleOpenStruk = (trx: TransaksiKeuangan) => {
    const isInc = trx.tipeTransaksi === 'PENDAPATAN';
    const notaData: NotaData = {
      noRef: trx.noRef,
      tanggal: trx.tanggal,
      namaPembeli: isInc ? 'Pelanggan / Mitra Peternakan' : 'Supplier / Toko Pakan',
      kategoriLabel: trx.kategoriPendapatan || trx.kategoriPengeluaran || trx.deskripsi,
      jumlahQty: 1,
      satuan: 'Paket Transaksi',
      hargaPerSatuan: trx.totalNominal,
      totalNominal: trx.totalNominal,
      metodeBayar: 'TUNAI',
      catatan: trx.deskripsi,
    };
    setSelectedNota(notaData);
    setIsNotaOpen(true);
  };

  // Delete & Edit Handlers
  const handleConfirmDeleteTrx = (id: string) => {
    StorageService.deleteTransaksiKeuangan(id);
    showToast('Transaksi berhasil dihapus permanen', 'info');
    setConfirmDeleteTrxId(null);
    onRefreshData();
  };

  const handleStartEditTrx = (trx: TransaksiKeuangan) => {
    setEditingTrx(trx);
    setEditTrxTanggal(trx.tanggal);
    setEditTrxTipe(trx.tipeTransaksi === 'PENDAPATAN' ? 'PENDAPATAN' : 'PENGELUARAN');
    setEditTrxKategoriPendapatan(trx.kategoriPendapatan || 'TELUR_GRADE_A');
    setEditTrxKategoriPengeluaran(trx.kategoriPengeluaran || 'PAKAN');
    setEditTrxDeskripsi(trx.deskripsi);
    setEditTrxNominal(trx.totalNominal);
  };

  const handleSaveEditTrx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrx) return;
    if (editTrxNominal <= 0) {
      showToast('Nominal harus lebih dari 0!', 'warning');
      return;
    }
    if (!editTrxDeskripsi.trim()) {
      showToast('Deskripsi tidak boleh kosong!', 'warning');
      return;
    }

    StorageService.updateTransaksi({
      ...editingTrx,
      tanggal: editTrxTanggal,
      tipeTransaksi: editTrxTipe,
      kategoriPendapatan: editTrxTipe === 'PENDAPATAN' ? editTrxKategoriPendapatan : undefined,
      kategoriPengeluaran: editTrxTipe === 'PENGELUARAN' ? editTrxKategoriPengeluaran : undefined,
      deskripsi: editTrxDeskripsi,
      totalNominal: editTrxNominal,
    });

    showToast('Transaksi keuangan berhasil diperbarui!', 'success');
    setEditingTrx(null);
    onRefreshData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. HEADER UTAMA SPEK DEWA DENGAN GRADASI GLOW */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-950/30 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        {/* Glow ambient background circles */}
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                PEMBUKUAN REALTIME
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Spek Dewa FinTech
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              Modul Keuangan & Cash Flow
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Pencatatan kas masuk-keluar, analisis profitabilitas peternakan, serta manajemen buku kas berstandar ganda.
            </p>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenKasir && (
              <button
                type="button"
                onClick={onOpenKasir}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Kasir Jual Telur</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('tambah')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Catat Cepat</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/70 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
              title="Unduh Laporan Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              type="button"
              onClick={handleCopyWhatsAppSummary}
              className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/70 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
              title="Salin Ringkasan Kas ke WhatsApp"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Kirim WA</span>
            </button>
          </div>
        </div>

        {/* 2. FILTER PERIODE WAKTU (INTERACTIVE CHIPS) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs text-slate-400 font-bold mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Periode:
            </span>
            {(
              [
                { id: 'semua', label: 'Semua Waktu' },
                { id: 'hari_ini', label: 'Hari Ini' },
                { id: '7d', label: '7 Hari' },
                { id: 'bulan_ini', label: 'Bulan Ini' },
                { id: 'tahun_ini', label: 'Tahun Ini' },
              ] as const
            ).map((rng) => (
              <button
                key={rng.id}
                type="button"
                onClick={() => setTimeRange(rng.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  timeRange === rng.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {rng.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCharts(!showCharts)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                showCharts
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{showCharts ? 'Tutup Grafik' : 'Buka Grafik Analitik'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. FINANCIAL KPI STAT CARDS (SUPER SPEK DEWA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pendapatan */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-slate-900/90 to-emerald-950/20 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pendapatan</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-black text-emerald-400 tracking-tight">
              {formatIDR(totalPendapatan)}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>{countPendapatan} Transaksi Masuk</span>
              <span className="font-semibold text-emerald-400/90">
                {avgPendapatan > 0 ? `Rata: ${formatIDR(avgPendapatan)}` : 'Belum ada'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Pengeluaran */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-b from-slate-900/90 to-rose-950/20 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pengeluaran</span>
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-black text-rose-400 tracking-tight">
              {formatIDR(totalPengeluaran)}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>{countPengeluaran} Biaya Tercatat</span>
              <span className="font-semibold text-rose-400/90">
                {expenseBreakdown.length > 0 ? `Utama: ${expenseBreakdown[0].kategori}` : 'Beban Nihil'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Arus Kas Bersih (Net Cashflow) */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-900/90 to-amber-950/20 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Arus Kas Bersih (Net)</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className={`text-2xl font-black tracking-tight ${arusKasBersih >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {arusKasBersih >= 0 ? '+' : ''}{formatIDR(arusKasBersih)}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span
                className={`font-black px-2 py-0.5 rounded text-[10px] ${
                  arusKasBersih >= 0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {arusKasBersih >= 0 ? 'SURPLUS' : 'DEFISIT'}
              </span>
              <span className="text-slate-400 font-semibold">Margin: {marginLabaPersen}%</span>
            </div>
          </div>
        </div>

        {/* Card 4: Skor Kesehatan Finansial */}
        <div className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-b from-slate-900/90 to-sky-950/20 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Indeks Kesehatan Kas</span>
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-sky-400 tracking-tight">{healthScore}%</p>
              <span className="text-[11px] font-bold text-sky-300">
                {healthScore >= 85 ? 'Sangat Sehat' : healthScore >= 65 ? 'Stabil / Baik' : 'Evaluasi Biaya'}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="mt-2 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  healthScore >= 85
                    ? 'bg-emerald-400'
                    : healthScore >= 65
                    ? 'bg-sky-400'
                    : 'bg-rose-400'
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. SHORTCUT PRESET 1-KLIK CATAT CEPAT (ACCELERATOR) */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
        <p className="text-xs font-bold text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Jalan Pintas Catat Cepat (1-Klik):
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                tipe: 'PENDAPATAN',
                kategori: 'TELUR_GRADE_A',
                akunLawan: '401',
                deskripsiDefault: 'Penjualan Telur Grade A ke Pengepul',
              })
            }
            className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <span>🥚</span> + Jual Telur
          </button>

          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                tipe: 'PENGELUARAN',
                kategori: 'PAKAN',
                akunLawan: '501',
                deskripsiDefault: 'Pembelian Pakan Konsentrat & Jagung',
              })
            }
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <span>🌾</span> - Beli Pakan
          </button>

          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                tipe: 'PENGELUARAN',
                kategori: 'OBAT_VAKSIN',
                akunLawan: '502',
                deskripsiDefault: 'Pembelian Vaksin & Vitamin Ternak',
              })
            }
            className="px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <span>💉</span> - Vaksin & Vitamin
          </button>

          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                tipe: 'PENGELUARAN',
                kategori: 'GAJI',
                akunLawan: '503',
                deskripsiDefault: 'Upah & Gaji Pekerja Kandang',
              })
            }
            className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <span>👷</span> - Upah / Gaji
          </button>

          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                tipe: 'PENGELUARAN',
                kategori: 'LISTRIK_AIR',
                akunLawan: '505',
                deskripsiDefault: 'Pembayaran Listrik & Air Kandang',
              })
            }
            className="px-3 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <span>💡</span> - Listrik & Air
          </button>

          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                tipe: 'PENDAPATAN',
                kategori: 'BEBEK_AFKIR',
                akunLawan: '403',
                deskripsiDefault: 'Penjualan Ternak Afkir / Daging',
              })
            }
            className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <span>🦆</span> + Jual Afkir
          </button>
        </div>
      </div>

      {/* 5. INTERACTIVE CHARTS & ANALYTICS SECTION */}
      {showCharts && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Visualisasi Arus Kas & Analisis Beban
              </h3>
              <p className="text-xs text-slate-400">
                Membandingkan aliran kas masuk (pendapatan) vs aliran kas keluar (operasional).
              </p>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setChartMode('trend')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartMode === 'trend'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Trend Harian
              </button>
              <button
                type="button"
                onClick={() => setChartMode('distribution')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartMode === 'distribution'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Komposisi Biaya
              </button>
            </div>
          </div>

          {chartMode === 'trend' ? (
            chartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="labelTanggal"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => (val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${val / 1000}k`)}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs space-y-1">
                              <p className="font-bold text-white border-b border-slate-800 pb-1">{data.tanggal}</p>
                              <p className="text-emerald-400 font-bold">
                                + Masuk: {formatIDR(data.pendapatan)}
                              </p>
                              <p className="text-rose-400 font-bold">
                                - Keluar: {formatIDR(data.pengeluaran)}
                              </p>
                              <p className="text-amber-400 font-black pt-1 border-t border-slate-800">
                                Net: {formatIDR(data.pendapatan - data.pengeluaran)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pendapatan"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPendapatan)"
                      name="Pendapatan"
                    />
                    <Area
                      type="monotone"
                      dataKey="pengeluaran"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPengeluaran)"
                      name="Pengeluaran"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                <BarChart3 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                Belum ada transaksi pada rentang waktu ini untuk memplot grafik tren.
              </div>
            )
          ) : (
            /* Distribution View */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Kolom Kiri: Beban Pengeluaran */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4" /> Distribusi Pengeluaran
                  </span>
                  <span className="text-xs font-black text-rose-400">{formatIDR(totalPengeluaran)}</span>
                </div>
                {expenseBreakdown.length > 0 ? (
                  <div className="space-y-2.5">
                    {expenseBreakdown.map((item) => (
                      <div key={item.kategori} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">{item.kategori}</span>
                          <span className="text-slate-400 font-bold">
                            {formatIDR(item.total)} ({item.persen}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                            style={{ width: `${item.persen}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">Belum ada pengeluaran tercatat.</p>
                )}
              </div>

              {/* Kolom Kanan: Sumber Pendapatan */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> Sumber Pendapatan
                  </span>
                  <span className="text-xs font-black text-emerald-400">{formatIDR(totalPendapatan)}</span>
                </div>
                {revenueBreakdown.length > 0 ? (
                  <div className="space-y-2.5">
                    {revenueBreakdown.map((item) => (
                      <div key={item.kategori} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">{item.kategori}</span>
                          <span className="text-slate-400 font-bold">
                            {formatIDR(item.total)} ({item.persen}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                            style={{ width: `${item.persen}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">Belum ada pendapatan tercatat.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. VIEW: FORM INPUT TRANSAKSI BARU */}
      {activeTab === 'tambah' && (
        <div className="space-y-4 animate-fade-in">
          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-400" />
                  Formulir Pembukuan Transaksi Keuangan
                </h3>
                <p className="text-xs text-slate-400">
                  Pencatatan standar ganda (Debit & Kredit) otomatis menghubungkan Kas dan Akun Beban/Pendapatan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTipeChange('PENDAPATAN')}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
                    tipeTransaksi === 'PENDAPATAN'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  + Pendapatan (Kas Masuk)
                </button>
                <button
                  type="button"
                  onClick={() => handleTipeChange('PENGELUARAN')}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
                    tipeTransaksi === 'PENGELUARAN'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  - Pengeluaran (Biaya)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Tanggal Transaksi
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nominal Transaksi (Rp)
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalNominal || ''}
                  onChange={(e) => setTotalNominal(parseFloat(e.target.value) || 0)}
                  placeholder="Contoh: 1500000"
                  className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-black focus:ring-2 ${
                    tipeTransaksi === 'PENDAPATAN' ? 'text-emerald-400 focus:ring-emerald-500' : 'text-rose-400 focus:ring-rose-500'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Akun Kas / Bank (Debit / Kredit)
                </label>
                <select
                  value={akunKasId}
                  onChange={(e) => setAkunKasId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
                >
                  {kodeAkunList
                    .filter((a) => a.tipe === 'ASSET' && (a.kode === '101' || a.kode === '102'))
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        [{a.kode}] {a.nama}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kategori Akun Lawan ({tipeTransaksi === 'PENDAPATAN' ? 'Pendapatan' : 'Beban/Biaya'})
                </label>
                <select
                  value={akunLawanId}
                  onChange={(e) => {
                    setAkunLawanId(e.target.value);
                    const selectedAkun = kodeAkunList.find((a) => a.id === e.target.value);
                    if (selectedAkun) {
                      if (tipeTransaksi === 'PENDAPATAN') setKategoriPendapatan(selectedAkun.nama);
                      else setKategoriPengeluaran(selectedAkun.nama);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
                >
                  {kodeAkunList
                    .filter((a) => (tipeTransaksi === 'PENDAPATAN' ? a.tipe === 'REVENUE' : a.tipe === 'EXPENSE'))
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        [{a.kode}] {a.nama}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Deskripsi / Keterangan Transaksi
              </label>
              <input
                type="text"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Contoh: Penjualan 20 Tray Telur Grade A ke Pengepul Malang"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('semua')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
              >
                Simpan Transaksi Keuangan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. DAFTAR TRANSAKSI: TOOLBAR, TAB FILTER, & SEARCH */}
      {activeTab !== 'tambah' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tab Filter: Semua / Pendapatan / Pengeluaran */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('semua')}
                className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'semua'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                }`}
              >
                Semua ({transactions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pendapatan')}
                className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'pendapatan'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                }`}
              >
                + Pendapatan ({transactions.filter((t) => t.tipeTransaksi === 'PENDAPATAN').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pengeluaran')}
                className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'pengeluaran'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                }`}
              >
                - Pengeluaran ({transactions.filter((t) => t.tipeTransaksi === 'PENGELUARAN').length})
              </button>
            </div>

            {/* Category Filter, Search and Layout Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
                <Filter className="w-3.5 h-3.5 text-emerald-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter berdasarkan kategori"
                  className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">Semua Kategori</option>
                  <optgroup label="Pendapatan" className="bg-slate-900">
                    <option value="TELUR_GRADE_A">Telur Grade A</option>
                    <option value="TELUR_GRADE_B">Telur Grade B</option>
                    <option value="BEBEK_AFKIR">Bebek Afkir</option>
                    <option value="PUPUK_KANDANG">Pupuk Kandang</option>
                    <option value="LAINNYA">Pendapatan Lain</option>
                  </optgroup>
                  <optgroup label="Pengeluaran" className="bg-slate-900">
                    <option value="PAKAN">Belanja Pakan</option>
                    <option value="OBAT_VAKSIN">Vaksin & Vitamin</option>
                    <option value="GAJI">Upah / Gaji</option>
                    <option value="OPERASIONAL_KANDANG">Operasional Kandang</option>
                    <option value="LISTRIK_AIR">Listrik & Air</option>
                  </optgroup>
                </select>
              </div>

              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari transaksi / no ref..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              {/* View Mode Switcher (Card vs Table) */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'cards'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tampilan Card (Feed Modern)"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'table'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tampilan Tabel Akuntansi"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 8. LIST DATA TRANSAKSI */}
          {filteredTrxs.length === 0 ? (
            /* EMPTY STATE SPEK DEWA */
            <div className="py-16 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center mx-auto shadow-inner">
                <Wallet className="w-8 h-8 text-slate-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Belum Ada Transaksi Tercatat</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Catatan transaksi pada periode ini masih kosong. Anda dapat mulai mencatat penjualan telur atau pembelian pakan pertama Anda.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleApplyPreset({
                      tipe: 'PENDAPATAN',
                      kategori: 'TELUR_GRADE_A',
                      akunLawan: '401',
                      deskripsiDefault: 'Penjualan Telur Grade A Pertama',
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  + Catat Pendapatan Pertama
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleApplyPreset({
                      tipe: 'PENGELUARAN',
                      kategori: 'PAKAN',
                      akunLawan: '501',
                      deskripsiDefault: 'Belanja Pakan Pertama',
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all active:scale-95"
                >
                  - Catat Belanja Pakan
                </button>
              </div>
            </div>
          ) : viewMode === 'cards' ? (
            /* MOBILE-FIRST CARD FEED VIEW (SPEK DEWA!) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTrxs.map((trx) => {
                const isInc = trx.tipeTransaksi === 'PENDAPATAN';
                const meta = getCategoryMeta(trx);
                return (
                  <div
                    key={trx.id}
                    className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-950/60 p-4 hover:border-slate-700 transition-all shadow-md group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: Icon & Description */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 border ${meta.color}`}
                        >
                          {meta.icon}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="font-bold text-white text-sm truncate leading-snug">
                            {trx.deskripsi}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${meta.color}`}>
                              {meta.label}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {trx.noRef}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              {trx.tanggal}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Nominal */}
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-base sm:text-lg font-black tracking-tight ${
                            isInc ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isInc ? '+' : '-'}{formatIDR(trx.totalNominal)}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {isInc ? 'Kas Masuk' : 'Beban'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <span>Oleh: {trx.createdBy || 'Peternak'}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenStruk(trx)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
                          title="Cetak Struk / Nota"
                        >
                          <Receipt className="w-3.5 h-3.5 text-amber-400" />
                          <span>Struk</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartEditTrx(trx)}
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
                          title="Edit Transaksi"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {confirmDeleteTrxId === trx.id ? (
                          <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-700/60 p-1 rounded-lg">
                            <span className="text-[10px] text-rose-300 font-semibold px-1">Hapus?</span>
                            <button
                              type="button"
                              onClick={() => handleConfirmDeleteTrx(trx.id)}
                              className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
                            >
                              Ya
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteTrxId(null)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] hover:bg-slate-700 transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteTrxId(trx.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* DESKTOP TABLE VIEW */
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Tanggal</th>
                    <th className="px-4 py-3.5">No Ref</th>
                    <th className="px-4 py-3.5">Deskripsi</th>
                    <th className="px-4 py-3.5">Kategori Akun</th>
                    <th className="px-4 py-3.5 text-right">Nominal</th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-medium">
                  {filteredTrxs.map((trx) => {
                    const isInc = trx.tipeTransaksi === 'PENDAPATAN';
                    const meta = getCategoryMeta(trx);
                    return (
                      <tr key={trx.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{trx.tanggal}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {trx.noRef}
                        </td>
                        <td className="px-4 py-3 text-slate-200">
                          <div className="font-semibold text-white">{trx.deskripsi}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.color}`}>
                            {meta.icon} {meta.label}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-black whitespace-nowrap ${
                            isInc ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isInc ? '+' : '-'}{formatIDR(trx.totalNominal)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenStruk(trx)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] border border-slate-700 transition-colors flex items-center gap-1"
                              title="Cetak Struk"
                            >
                              <Receipt className="w-3 h-3 text-amber-400" />
                              <span>Struk</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStartEditTrx(trx)}
                              className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
                              title="Edit Transaksi"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {confirmDeleteTrxId === trx.id ? (
                              <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-700/60 p-1 rounded-lg">
                                <span className="text-[10px] text-rose-300 font-semibold px-1">Hapus?</span>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmDeleteTrx(trx.id)}
                                  className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
                                >
                                  Ya
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteTrxId(null)}
                                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] hover:bg-slate-700 transition-colors"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteTrxId(trx.id)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                                title="Hapus Transaksi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 9. MODAL CETAK NOTA / STRUK RESMI */}
      <NotaStrukModal
        isOpen={isNotaOpen}
        onClose={() => setIsNotaOpen(false)}
        nota={selectedNota}
      />

      {/* 10. MODAL EDIT TRANSAKSI */}
      {editingTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Transaksi Keuangan</h3>
                  <p className="text-xs text-slate-400">Perbarui rincian transaksi kas atau operasional.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTrx(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTrx} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={editTrxTanggal}
                    onChange={(e) => setEditTrxTanggal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tipe Transaksi</label>
                  <select
                    value={editTrxTipe}
                    onChange={(e) => setEditTrxTipe(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="PENDAPATAN">Pendapatan (+)</option>
                    <option value="PENGELUARAN">Pengeluaran (-)</option>
                  </select>
                </div>
              </div>

              {editTrxTipe === 'PENDAPATAN' ? (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori Pendapatan</label>
                  <select
                    value={editTrxKategoriPendapatan}
                    onChange={(e) => setEditTrxKategoriPendapatan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="TELUR_GRADE_A">Penjualan Telur Grade A (Utuh)</option>
                    <option value="TELUR_GRADE_B">Penjualan Telur Grade B (Retak)</option>
                    <option value="BEBEK_AFKIR">Penjualan Bebek Afkir / Daging</option>
                    <option value="PUPUK_KANDANG">Penjualan Pupuk Kandang</option>
                    <option value="LAINNYA">Pendapatan Lain-lain</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori Pengeluaran</label>
                  <select
                    value={editTrxKategoriPengeluaran}
                    onChange={(e) => setEditTrxKategoriPengeluaran(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="PAKAN">Belanja Pakan Konsentrat / Jagung / Dedak</option>
                    <option value="OBAT_VAKSIN">Vaksin, Vitamin & Desinfektan</option>
                    <option value="GAJI">Gaji & Upah Anak Kandang</option>
                    <option value="OPERASIONAL_KANDANG">Sekam, Pemeliharaan & Alat</option>
                    <option value="LISTRIK_AIR">Listrik & Air Kandang</option>
                    <option value="LAINNYA">Beban Operasional Lainnya</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deskripsi / Keterangan</label>
                <input
                  type="text"
                  value={editTrxDeskripsi}
                  onChange={(e) => setEditTrxDeskripsi(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Total Nominal (Rp)</label>
                <input
                  type="number"
                  min="1"
                  value={editTrxNominal}
                  onChange={(e) => setEditTrxNominal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold text-amber-400"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTrx(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md transition-all active:scale-95"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
