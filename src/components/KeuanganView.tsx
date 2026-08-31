import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Calendar,
  Trash2,
  Search,
  ShoppingBag,
} from 'lucide-react';
import type { TransaksiKeuangan, KodeAkun } from '../types';
import { StorageService } from '../services/storage';
import { formatIDR } from '../utils/exportUtils';
import { useToast } from './ToastContainer';

interface KeuanganViewProps {
  transactions: TransaksiKeuangan[];
  kodeAkunList: KodeAkun[];
  onRefreshData: () => void;
  onOpenKasir?: () => void;
}

export const KeuanganView: React.FC<KeuanganViewProps> = ({
  transactions,
  kodeAkunList,
  onRefreshData,
  onOpenKasir,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'semua' | 'pendapatan' | 'pengeluaran' | 'tambah'>('semua');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form State
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deskripsi, setDeskripsi] = useState<string>('');
  const [totalNominal, setTotalNominal] = useState<number>(0);
  const [tipeTransaksi, setTipeTransaksi] = useState<'PENDAPATAN' | 'PENGELUARAN'>('PENDAPATAN');
  const [kategoriPendapatan, setKategoriPendapatan] = useState<any>('TELUR_GRADE_A');
  const [kategoriPengeluaran, setKategoriPengeluaran] = useState<any>('PAKAN');
  const [akunKasId, setAkunKasId] = useState<string>('101'); // Kas Utama
  const [akunLawanId, setAkunLawanId] = useState<string>('401'); // Pendapatan Telur Grade A

  const handleTipeChange = (tipe: 'PENDAPATAN' | 'PENGELUARAN') => {
    setTipeTransaksi(tipe);
    if (tipe === 'PENDAPATAN') {
      setAkunLawanId('401'); // Default Pendapatan Telur Grade A
    } else {
      setAkunLawanId('501'); // Default Beban Pakan
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
      // Debit: Kas (101), Kredit: Akun Pendapatan (401/402/etc)
      items.push({ akunId: akunKasId, debit: totalNominal, kredit: 0 });
      items.push({ akunId: akunLawanId, debit: 0, kredit: totalNominal });
    } else {
      // Debit: Akun Beban (501/502/etc), Kredit: Kas (101)
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

  const filteredTrxs = transactions.filter((t) => {
    const matchType =
      activeTab === 'pendapatan' ? t.tipeTransaksi === 'PENDAPATAN' :
      activeTab === 'pengeluaran' ? t.tipeTransaksi === 'PENGELUARAN' : true;
    const matchSearch =
      t.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.noRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tanggal.includes(searchTerm);
    return matchType && matchSearch;
  });

  const totalPendapatan = transactions
    .filter((t) => t.tipeTransaksi === 'PENDAPATAN')
    .reduce((acc, t) => acc + t.totalNominal, 0);

  const totalPengeluaran = transactions
    .filter((t) => t.tipeTransaksi === 'PENGELUARAN')
    .reduce((acc, t) => acc + t.totalNominal, 0);

  const arusKasBersih = totalPendapatan - totalPengeluaran;

  const handleDeleteTrx = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi keuangan ini?')) {
      StorageService.deleteTransaksiKeuangan(id);
      showToast('Transaksi berhasil dihapus', 'info');
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            Modul Keuangan & Pencatatan Arus Kas (Accounting)
          </h2>
          <p className="text-xs text-slate-400">
            Pencatatan Pendapatan, Pengeluaran Operasional, dan Monitoring Cash Flow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenKasir && (
            <button
              onClick={onOpenKasir}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Kasir Jual Telur
            </button>
          )}

          <button
            onClick={() => setActiveTab('tambah')}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            + Catat Transaksi
          </button>
        </div>
      </div>

      {/* Financial Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Pendapatan</p>
            <p className="text-xl font-black text-emerald-400">{formatIDR(totalPendapatan)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Pengeluaran</p>
            <p className="text-xl font-black text-rose-400">{formatIDR(totalPengeluaran)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold">Arus Kas Bersih (Net Cashflow)</p>
            <p className={`text-xl font-black ${arusKasBersih >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {formatIDR(arusKasBersih)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* VIEW: Form Input Transaksi Baru */}
      {activeTab === 'tambah' && (
        <div className="space-y-4">
          {/* Card Panduan & Contoh Pengisian Keuangan (Hanya Tulisan Referensi) */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-300 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
              <span className="text-base">💡</span> Panduan & Contoh Pencatatan Transaksi (Hanya Referensi Tulisan)
            </div>
            <p className="text-slate-300">
              Formulir di bawah ini <strong>murni kosong dari 0</strong>. Berikut adalah contoh cara mencatat transaksi pendapatan dan pengeluaran peternakan:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-[11px]">
              <div>
                <span className="text-emerald-400 font-bold block">Contoh Pendapatan Telur:</span>
                <p className="text-slate-300">Deskripsi: Penjualan 20 Tray Telur Grade A ke Pengepul Malang</p>
                <p className="font-bold text-white">Nominal: Rp 14.400.000 (Kategori: Pendapatan Telur Grade A)</p>
              </div>
              <div>
                <span className="text-rose-400 font-bold block">Contoh Pengeluaran Pakan:</span>
                <p className="text-slate-300">Deskripsi: Pembelian 1 Ton Konsentrat Pakan Bebek K-99</p>
                <p className="font-bold text-white">Nominal: Rp 8.200.000 (Kategori: Beban Pakan Bebek Harian)</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Formulir Transaksi Keuangan (Double-Entry Bookkeeping)</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTipeChange('PENDAPATAN')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    tipeTransaksi === 'PENDAPATAN'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-[#94a3b8] border border-slate-700'
                  }`}
                >
                  + Pendapatan (Masuk)
                </button>
                <button
                  type="button"
                  onClick={() => handleTipeChange('PENGELUARAN')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    tipeTransaksi === 'PENGELUARAN'
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-900 text-[#94a3b8] border border-slate-700'
                  }`}
                >
                  - Pengeluaran (Keluar)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Tanggal Transaksi
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nominal Transaksi (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={totalNominal || ''}
                  onChange={(e) => setTotalNominal(parseFloat(e.target.value) || 0)}
                  placeholder="Contoh: 1500000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base font-bold text-emerald-400 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Akun Kas / Bank (Debit/Kredit)</label>
                <select
                  value={akunKasId}
                  onChange={(e) => setAkunKasId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
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
                  Kategori Akun Lawan ({tipeTransaksi === 'PENDAPATAN' ? 'Pendapatan' : 'Pengeluaran/Beban'})
                </label>
                <select
                  value={akunLawanId}
                  onChange={(e) => {
                    setAkunLawanId(e.target.value);
                    const selectedAkun = kodeAkunList.find(a => a.id === e.target.value);
                    if (selectedAkun) {
                      if (tipeTransaksi === 'PENDAPATAN') setKategoriPendapatan(selectedAkun.nama);
                      else setKategoriPengeluaran(selectedAkun.nama);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
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
              <label className="block text-xs font-bold text-slate-300 mb-1">Deskripsi / Keterangan Transaksi</label>
              <input
                type="text"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Contoh: Penjualan 15 Tray Telur Grade A ke Pengepul Pak Rohman"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('semua')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
              >
                Simpan Transaksi Keuangan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW: Tabel Transaksi Keuangan */}
      {activeTab !== 'tambah' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('semua')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'semua'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                }`}
              >
                Semua ({transactions.length})
              </button>
              <button
                onClick={() => setActiveTab('pendapatan')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'pendapatan'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                }`}
              >
                Pendapatan
              </button>
              <button
                onClick={() => setActiveTab('pengeluaran')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'pengeluaran'
                    ? 'bg-rose-500 text-white'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                }`}
              >
                Pengeluaran
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari transaksi / no ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">No Ref</th>
                  <th className="px-4 py-3">Deskripsi</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-medium">
                {filteredTrxs.map((trx) => {
                  const isInc = trx.tipeTransaksi === 'PENDAPATAN';
                  return (
                    <tr key={trx.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-white">{trx.tanggal}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{trx.noRef}</td>
                      <td className="px-4 py-3 text-slate-200">{trx.deskripsi}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isInc
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {trx.tipeTransaksi}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-black ${
                          isInc ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isInc ? '+' : '-'}{formatIDR(trx.totalNominal)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteTrx(trx.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Hapus Transaksi Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
