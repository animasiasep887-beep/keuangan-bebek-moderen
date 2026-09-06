import React, { useState } from 'react';
import {
  Egg,
  PlusCircle,
  Trash2,
  AlertTriangle,
  Scale,
  Calendar,
  Layers,
  CheckCircle2,
  Search,
  ShoppingBag,
  Calculator,
  Filter,
  Pencil,
  X,
} from 'lucide-react';
import type { PencatatanHarian, Kandang, PopulasiBebek, PakanItem } from '../types';
import { StorageService } from '../services/storage';
import { useToast } from './ToastContainer';

interface OperasionalViewProps {
  logs: PencatatanHarian[];
  kandangList: Kandang[];
  populasiList: PopulasiBebek[];
  pakanList: PakanItem[];
  onRefreshData: () => void;
  setActiveTab?: (tab: string) => void;
  onOpenKasir?: () => void;
  onOpenKalkulator?: () => void;
}

export const OperasionalView: React.FC<OperasionalViewProps> = ({
  logs,
  kandangList,
  populasiList,
  pakanList,
  onRefreshData,
  setActiveTab,
  onOpenKasir,
  onOpenKalkulator,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTabLocal] = useState<'form' | 'table' | 'pakan'>('form');

  // Form State
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [kandangId, setKandangId] = useState<string>(kandangList[0]?.id || 'k-1');
  const [populasiId, setPopulasiId] = useState<string>(populasiList[0]?.id || 'pop-1');
  const [telurUtuh, setTelurUtuh] = useState<number>(850);
  const [telurRetak, setTelurRetak] = useState<number>(20);
  const [telurRusak, setTelurRusak] = useState<number>(5);
  const [bebekMati, setBebekMati] = useState<number>(0);
  const [bebekAfkir, setBebekAfkir] = useState<number>(0);
  const [pakanKg, setPakanKg] = useState<number>(365);
  const [pakanId, setPakanId] = useState<string>(pakanList[0]?.id || 'pak-1');
  const [catatan, setCatatan] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterKandangId, setFilterKandangId] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Form State - Tambah Pakan Baru / Restock
  const [showPakanForm, setShowPakanForm] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [namaPakanBaru, setNamaPakanBaru] = useState('');
  const [merkPakanBaru, setMerkPakanBaru] = useState('');
  const [stokKgBaru, setStokKgBaru] = useState<number>(500);
  const [hargaPerKgBaru, setHargaPerKgBaru] = useState<number>(8000);
  const [minStokKgBaru, setMinStokKgBaru] = useState<number>(100);

  // Selected population live count
  const selectedPop = populasiList.find((p) => p.id === populasiId);
  const liveDuckCount = selectedPop ? selectedPop.jumlahSaatIni : 2435;

  // Auto-calculated fields
  const totalTelur = telurUtuh + telurRetak + telurRusak;
  const hdpPercentage = liveDuckCount > 0
    ? Number(((totalTelur / liveDuckCount) * 100).toFixed(1))
    : 0;

  // Total weight estimate (~65g per egg)
  const totalBeratTelurKg = Number(((totalTelur * 65) / 1000).toFixed(1));

  // FCR estimate = Pakan (kg) / Berat Telur (kg)
  const fcr = totalBeratTelurKg > 0
    ? Number((pakanKg / totalBeratTelurKg).toFixed(2))
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    StorageService.addPencatatanHarian({
      tanggal,
      kandangId,
      populasiId,
      telurUtuh,
      telurRetak,
      telurRusak,
      totalBeratTelurKg,
      bebekMati,
      bebekAfkir,
      pakanKg,
      pakanId,
      hdpPercentage,
      fcr,
      catatan,
      createdBy: 'Petugas Kandang',
    });

    setSuccessMessage('Data Panen Harian Berhasil Disimpan!');
    onRefreshData();

    setTimeout(() => {
      setSuccessMessage(null);
      setActiveTabLocal('table');
    }, 1500);
  };

  // Delete confirm state for logs
  const [confirmDeleteLogId, setConfirmDeleteLogId] = useState<string | null>(null);

  // Edit Log State
  const [editingLog, setEditingLog] = useState<PencatatanHarian | null>(null);
  const [editTanggal, setEditTanggal] = useState<string>('');
  const [editKandangId, setEditKandangId] = useState<string>('');
  const [editPopulasiId, setEditPopulasiId] = useState<string>('');
  const [editTelurUtuh, setEditTelurUtuh] = useState<number>(0);
  const [editTelurRetak, setEditTelurRetak] = useState<number>(0);
  const [editTelurRusak, setEditTelurRusak] = useState<number>(0);
  const [editBebekMati, setEditBebekMati] = useState<number>(0);
  const [editBebekAfkir, setEditBebekAfkir] = useState<number>(0);
  const [editPakanKg, setEditPakanKg] = useState<number>(0);
  const [editPakanId, setEditPakanId] = useState<string>('');
  const [editCatatan, setEditCatatan] = useState<string>('');

  // Edit Pakan State
  const [editingPakan, setEditingPakan] = useState<PakanItem | null>(null);
  const [editNamaPakan, setEditNamaPakan] = useState<string>('');
  const [editMerkPakan, setEditMerkPakan] = useState<string>('');
  const [editStokKg, setEditStokKg] = useState<number>(0);
  const [editHargaPerKg, setEditHargaPerKg] = useState<number>(0);
  const [editMinStokKg, setEditMinStokKg] = useState<number>(0);

  const handleConfirmDeleteLog = (id: string) => {
    StorageService.deletePencatatanHarian(id);
    showToast('Data panen telur berhasil dihapus permanen', 'info');
    setConfirmDeleteLogId(null);
    onRefreshData();
  };

  const handleStartEditLog = (log: PencatatanHarian) => {
    setEditingLog(log);
    setEditTanggal(log.tanggal);
    setEditKandangId(log.kandangId);
    setEditPopulasiId(log.populasiId);
    setEditTelurUtuh(log.telurUtuh);
    setEditTelurRetak(log.telurRetak);
    setEditTelurRusak(log.telurRusak);
    setEditBebekMati(log.bebekMati);
    setEditBebekAfkir(log.bebekAfkir);
    setEditPakanKg(log.pakanKg);
    setEditPakanId(log.pakanId);
    setEditCatatan(log.catatan || '');
  };

  const handleSaveEditLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;

    const totalT = editTelurUtuh + editTelurRetak + editTelurRusak;
    const pop = populasiList.find((p) => p.id === editPopulasiId);
    const duckCount = pop ? pop.jumlahSaatIni : 500;
    const hdp = duckCount > 0 ? Number(((totalT / duckCount) * 100).toFixed(1)) : 0;
    const beratKg = Number(((totalT * 65) / 1000).toFixed(1));
    const fcrVal = beratKg > 0 ? Number((editPakanKg / beratKg).toFixed(2)) : 0;

    StorageService.updatePencatatanHarian({
      ...editingLog,
      tanggal: editTanggal,
      kandangId: editKandangId,
      populasiId: editPopulasiId,
      telurUtuh: editTelurUtuh,
      telurRetak: editTelurRetak,
      telurRusak: editTelurRusak,
      totalBeratTelurKg: beratKg,
      pakanKg: editPakanKg,
      pakanId: editPakanId,
      bebekMati: editBebekMati,
      bebekAfkir: editBebekAfkir,
      hdpPercentage: hdp,
      fcr: fcrVal,
      catatan: editCatatan,
    });

    showToast('Data panen harian berhasil diperbarui!', 'success');
    setEditingLog(null);
    onRefreshData();
  };

  const handleStartEditPakan = (pakan: PakanItem) => {
    setEditingPakan(pakan);
    setEditNamaPakan(pakan.namaPakan);
    setEditMerkPakan(pakan.merk);
    setEditStokKg(pakan.stokKg);
    setEditHargaPerKg(pakan.hargaPerKg);
    setEditMinStokKg(pakan.minStokKg);
  };

  const handleSaveEditPakan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPakan) return;
    if (!editNamaPakan.trim()) {
      showToast('Mohon isi nama pakan!', 'warning');
      return;
    }

    StorageService.updatePakan({
      ...editingPakan,
      namaPakan: editNamaPakan,
      merk: editMerkPakan || 'Lokal / Standard',
      stokKg: editStokKg,
      hargaPerKg: editHargaPerKg,
      minStokKg: editMinStokKg,
    });

    showToast(`Data pakan ${editNamaPakan} berhasil diperbarui!`, 'success');
    setEditingPakan(null);
    onRefreshData();
  };

  const handleAddPakanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPakanBaru.trim()) {
      alert('Mohon isi nama pakan!');
      return;
    }
    StorageService.addPakan({
      namaPakan: namaPakanBaru,
      merk: merkPakanBaru || 'Lokal / Standard',
      stokKg: stokKgBaru,
      hargaPerKg: hargaPerKgBaru,
      minStokKg: minStokKgBaru,
    });
    setSuccessMessage('Stok Pakan Baru Berhasil Ditambahkan!');
    onRefreshData();
    setShowPakanForm(false);
    setNamaPakanBaru('');
    setMerkPakanBaru('');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleRestockPakan = (id: string, nama: string) => {
    const qtyStr = prompt(`Masukkan jumlah restock pakan (kg) untuk ${nama}:`, '100');
    if (!qtyStr) return;
    const qty = parseFloat(qtyStr);
    if (!isNaN(qty) && qty > 0) {
      StorageService.restockPakan(id, qty);
      setSuccessMessage(`Stok ${nama} berhasil ditambah ${qty} kg!`);
      onRefreshData();
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  const handleDeletePakan = (id: string) => {
    StorageService.deletePakan(id);
    showToast('Jenis pakan berhasil dihapus permanen', 'info');
    setConfirmDeleteId(null);
    onRefreshData();
  };

  const filteredLogs = logs.filter((l) => {
    const matchSearch =
      l.tanggal.includes(searchTerm) ||
      (l.catatan && l.catatan.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchKandang = filterKandangId === 'all' || l.kandangId === filterKandangId;
    return matchSearch && matchKandang;
  });

  return (
    <div className="space-y-6">
      {/* Sub Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Egg className="w-6 h-6 text-amber-400" />
            Modul Pencatatan Operasional Kandang
          </h2>
          <p className="text-xs text-slate-400">
            Formulir panen harian, mortalitas bebek, dan pemantauan rasio pakan (FCR).
          </p>
        </div>

        {/* Tab Buttons & Quick Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenKasir && (
            <button
              onClick={onOpenKasir}
              className="hidden sm:flex px-3 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              Kasir Jual Telur
            </button>
          )}

          {onOpenKalkulator && (
            <button
              onClick={onOpenKalkulator}
              className="hidden sm:flex px-3 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 transition-all items-center gap-1.5"
            >
              <Calculator className="w-4 h-4" />
              Kalkulator Ransum
            </button>
          )}

          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setActiveTabLocal('form')}
              className={`flex-1 sm:flex-initial px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'form'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Input Panen
            </button>
            <button
              onClick={() => setActiveTabLocal('table')}
              className={`flex-1 sm:flex-initial px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'table'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Riwayat
            </button>
            <button
              onClick={() => setActiveTabLocal('pakan')}
              className={`flex-1 sm:flex-initial px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'pakan'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scale className="w-4 h-4" />
              Stok Pakan
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold text-sm flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          {successMessage}
        </div>
      )}

      {/* VIEW 1: Form Input Panen Harian */}
      {activeTab === 'form' && (
        <div className="space-y-4">
          {/* Card Panduan & Contoh Pengisian (Collapsible untuk Layar HP) */}
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-300 text-xs overflow-hidden">
            <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="flex items-center gap-2 font-bold text-amber-400 hover:text-amber-300 text-left transition-colors"
              >
                <span>💡</span>
                <span className="text-xs sm:text-sm">Panduan & Contoh Pengisian Form Panen</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  {showGuide ? 'Tutup ▴' : 'Lihat Contoh ▾'}
                </span>
              </button>
              {setActiveTab && (
                <button
                  type="button"
                  onClick={() => setActiveTab('pengaturan')}
                  className="text-[11px] text-amber-400 hover:underline font-bold shrink-0 hidden sm:inline"
                >
                  ⚙️ Kelola Batch Populasi →
                </button>
              )}
            </div>

            {showGuide && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 border-t border-amber-500/15 pt-3 animate-fadeIn">
                <p className="text-slate-300">
                  Formulir di bawah ini <strong>murni dari 0 (kosong)</strong> agar Anda dapat memasukkan data asli peternakan Anda. Berikut adalah contoh standar pengisian data harian:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Contoh Telur Utuh:</span>
                    <span className="font-bold text-amber-400">850 butir</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Contoh Telur Retak:</span>
                    <span className="font-bold text-orange-400">20 butir</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Contoh Pakan Harian:</span>
                    <span className="font-bold text-sky-400">360 kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Hasil HDP %:</span>
                    <span className="font-bold text-emerald-400">Auto Hitung 87.0%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Tanggal Panen
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Kandang</label>
              <select
                value={kandangId}
                onChange={(e) => setKandangId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {kandangList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.namaKandang} (Kapasitas: {k.kapasitas})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">Batch Populasi Bebek</label>
                {setActiveTab && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('pengaturan')}
                    className="text-[11px] text-amber-400 hover:underline font-bold"
                  >
                    + Tambah Populasi
                  </button>
                )}
              </div>
              <select
                value={populasiId}
                onChange={(e) => setPopulasiId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {populasiList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.kodeBatch} ({p.jumlahSaatIni} ekor hidup)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Productivity Preview Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-xl border border-amber-500/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Hasil Total Butir</p>
              <p className="text-xl font-black text-amber-400">{totalTelur.toLocaleString('id-ID')} <span className="text-xs font-normal">butir</span></p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Hen-Day Production (%)</p>
              <p className="text-xl font-black text-emerald-400">{hdpPercentage}%</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Estimasi Berat Total</p>
              <p className="text-xl font-black text-sky-400">{totalBeratTelurKg} <span className="text-xs font-normal">kg</span></p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Rasio FCR Pakan</p>
              <p className="text-xl font-black text-indigo-400">{fcr}</p>
            </div>
          </div>

          {/* Harvest Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-bold text-amber-400 mb-1">
                Telur Utuh / Grade A (Butir)
              </label>
              <input
                type="number"
                min="0"
                value={telurUtuh}
                onChange={(e) => setTelurUtuh(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-amber-500/30 rounded-lg px-3 py-2 text-lg font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-bold text-orange-400 mb-1">
                Telur Retak / Grade B (Butir)
              </label>
              <input
                type="number"
                min="0"
                value={telurRetak}
                onChange={(e) => setTelurRetak(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-orange-500/30 rounded-lg px-3 py-2 text-lg font-bold text-orange-300 focus:outline-none focus:border-orange-400"
              />
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-bold text-rose-400 mb-1">
                Telur Rusak / Pecah (Butir)
              </label>
              <input
                type="number"
                min="0"
                value={telurRusak}
                onChange={(e) => setTelurRusak(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-rose-500/30 rounded-lg px-3 py-2 text-lg font-bold text-rose-300 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          {/* Mortality & Feed Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-rose-400 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Bebek Mati (Ekor)
              </label>
              <input
                type="number"
                min="0"
                value={bebekMati}
                onChange={(e) => setBebekMati(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">Bebek Afkir (Ekor)</label>
              <input
                type="number"
                min="0"
                value={bebekAfkir}
                onChange={(e) => setBebekAfkir(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Jenis Pakan</label>
              <select
                value={pakanId}
                onChange={(e) => setPakanId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
              >
                {pakanList.length === 0 ? (
                  <option value="">(Belum ada jenis pakan)</option>
                ) : (
                  pakanList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.namaPakan} (Sisa: {p.stokKg} kg)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Total Pakan Hari Ini (Kg)</label>
              <input
                type="number"
                min="0"
                value={pakanKg}
                onChange={(e) => setPakanKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Catatan Tambahan (Kondisi Cuaca / Kesehatan)</label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Cuaca agak dingin, pakan habis total pukul 16:00, nafsu makan baik..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Simpan Pencatatan Harian</span>
            </button>
          </div>
        </form>
      </div>
      )}

      {/* VIEW 2: Tabel History Panen */}
      {activeTab === 'table' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Riwayat Panen Telur Harian</h3>
              <p className="text-xs text-slate-400">Total {filteredLogs.length} catatan panen ditemukan.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {/* Filter Kandang */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterKandangId}
                  onChange={(e) => setFilterKandangId(e.target.value)}
                  className="bg-transparent text-xs text-white font-semibold outline-none"
                >
                  <option value="all">Semua Kandang</option>
                  {kandangList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.namaKandang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari tanggal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Grade A (Utuh)</th>
                  <th className="px-4 py-3">Grade B (Retak)</th>
                  <th className="px-4 py-3">Pecah</th>
                  <th className="px-4 py-3">Total Butir</th>
                  <th className="px-4 py-3">HDP %</th>
                  <th className="px-4 py-3">Pakan (Kg)</th>
                  <th className="px-4 py-3">FCR</th>
                  <th className="px-4 py-3">Mati</th>
                  <th className="px-4 py-3 text-right sticky right-0 bg-slate-900 shadow-[-4px_0_12px_rgba(0,0,0,0.6)] z-10">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">{log.tanggal}</td>
                    <td className="px-4 py-3 text-amber-400 font-bold">{log.telurUtuh}</td>
                    <td className="px-4 py-3 text-orange-400">{log.telurRetak}</td>
                    <td className="px-4 py-3 text-rose-400">{log.telurRusak}</td>
                    <td className="px-4 py-3 font-bold text-white">{log.telurUtuh + log.telurRetak + log.telurRusak}</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">{log.hdpPercentage}%</td>
                    <td className="px-4 py-3">{log.pakanKg} kg</td>
                    <td className="px-4 py-3 text-sky-400 font-bold">{log.fcr}</td>
                    <td className="px-4 py-3 text-rose-400">{log.bebekMati > 0 ? `${log.bebekMati} ekor` : '-'}</td>
                    <td className="px-4 py-3 text-right sticky right-0 bg-slate-950/95 backdrop-blur shadow-[-4px_0_12px_rgba(0,0,0,0.6)] z-10">
                      <div className="flex items-center justify-end gap-1.5">
                        {onOpenKasir && (
                          <button
                            onClick={onOpenKasir}
                            className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-[11px] border border-amber-500/30 transition-all"
                            title="Jual Telur Hari Ini ke Kasir POS"
                          >
                            🛒 Jual
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEditLog(log)}
                          className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-[11px] border border-blue-500/20 transition-colors flex items-center gap-1"
                          title="Edit Catatan Panen"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {confirmDeleteLogId === log.id ? (
                          <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-700/60 p-1 rounded-lg">
                            <span className="text-[10px] text-rose-300 font-semibold px-1">Hapus?</span>
                            <button
                              type="button"
                              onClick={() => handleConfirmDeleteLog(log.id)}
                              className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
                            >
                              Ya
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteLogId(null)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] hover:bg-slate-700 transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteLogId(log.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Stok Pakan & Nutrisi */}
      {activeTab === 'pakan' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Inventaris Pakan & Nutrisi Kandang</h3>
              <p className="text-xs text-slate-400">Kelola stok konsentrat, dedak, dan nutrisi harian peternakan.</p>
            </div>
            <button
              onClick={() => setShowPakanForm(!showPakanForm)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              {showPakanForm ? 'Tutup Form' : '+ Tambah Jenis Pakan'}
            </button>
          </div>

          {/* Form Tambah Pakan Baru */}
          {showPakanForm && (
            <form onSubmit={handleAddPakanSubmit} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-3 text-xs">
              <h4 className="font-bold text-amber-400 text-sm">Form Tambah Jenis Pakan Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Pakan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Konsentrat Layer K-99"
                    value={namaPakanBaru}
                    onChange={(e) => setNamaPakanBaru(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Merk / Produsen</label>
                  <input
                    type="text"
                    placeholder="Contoh: Cargill / Petani Lokal"
                    value={merkPakanBaru}
                    onChange={(e) => setMerkPakanBaru(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stok Awal (Kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={stokKgBaru}
                    onChange={(e) => setStokKgBaru(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Harga Per Kg (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={hargaPerKgBaru}
                    onChange={(e) => setHargaPerKgBaru(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Batas Minimum Peringatan (Kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={minStokKgBaru}
                    onChange={(e) => setMinStokKgBaru(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPakanForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Simpan Pakan Baru
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pakanList.length === 0 ? (
              <div className="col-span-full py-10 px-4 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-slate-400">
                <AlertTriangle className="w-8 h-8 text-amber-500/60 mx-auto mb-2" />
                <p className="font-semibold text-slate-200">Belum Ada Jenis Pakan yang Tersimpan</p>
                <p className="text-xs text-slate-500 mt-1">
                  Data pakan telah dihapus atau masih kosong. Klik tombol &quot;+ Tambah Jenis Pakan&quot; di atas untuk mendaftarkan pakan baru.
                </p>
              </div>
            ) : (
              pakanList.map((pakan) => (
                <div key={pakan.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-amber-400 text-sm">{pakan.namaPakan}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">{pakan.merk}</span>
                  </div>
                  <p className="text-2xl font-black text-white">{pakan.stokKg} <span className="text-xs font-normal text-slate-400">kg tersisa</span></p>
                  <p className="text-xs text-slate-400">Harga per kg: Rp {pakan.hargaPerKg.toLocaleString('id-ID')}</p>
                  
                  {confirmDeleteId === pakan.id ? (
                    <div className="pt-2 border-t border-rose-900/40 bg-rose-950/30 p-2.5 rounded-lg space-y-2">
                      <p className="text-xs font-semibold text-rose-300">Yakin hapus jenis pakan ini?</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeletePakan(pakan.id)}
                          className="flex-1 py-1 px-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors text-center"
                        >
                          Ya, Hapus
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-1.5">
                      <button
                        onClick={() => handleRestockPakan(pakan.id, pakan.namaPakan)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs hover:bg-emerald-500/30 transition-colors"
                      >
                        + Restock
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditPakan(pakan)}
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                          title="Edit Jenis Pakan"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(pakan.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Hapus Pakan Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL EDIT CATATAN PANEN TELUR HARIAN */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Catatan Panen Telur</h3>
                  <p className="text-xs text-slate-400">Perbarui data panen harian, pakan, dan mortalitas.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingLog(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLog} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={editTanggal}
                    onChange={(e) => setEditTanggal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pilih Kandang</label>
                  <select
                    value={editKandangId}
                    onChange={(e) => setEditKandangId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {kandangList.map((k) => (
                      <option key={k.id} value={k.id}>{k.namaKandang}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pilih Batch Populasi</label>
                  <select
                    value={editPopulasiId}
                    onChange={(e) => setEditPopulasiId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {populasiList.map((p) => (
                      <option key={p.id} value={p.id}>{p.kodeBatch} ({p.jumlahSaatIni} ekor)</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Produksi Telur */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 text-xs">Produksi Telur</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Grade A (Utuh)</label>
                    <input
                      type="number"
                      min="0"
                      value={editTelurUtuh}
                      onChange={(e) => setEditTelurUtuh(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Grade B (Retak)</label>
                    <input
                      type="number"
                      min="0"
                      value={editTelurRetak}
                      onChange={(e) => setEditTelurRetak(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Pecah / Rusak</label>
                    <input
                      type="number"
                      min="0"
                      value={editTelurRusak}
                      onChange={(e) => setEditTelurRusak(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Pakan & Mortalitas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-sky-400 text-xs">Konsumsi Pakan</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Pakan (Kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={editPakanKg}
                        onChange={(e) => setEditPakanKg(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Jenis Pakan</label>
                      <select
                        value={editPakanId}
                        onChange={(e) => setEditPakanId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      >
                        {pakanList.map((pak) => (
                          <option key={pak.id} value={pak.id}>{pak.namaPakan}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-rose-400 text-xs">Mortalitas & Afkir</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Mati (Ekor)</label>
                      <input
                        type="number"
                        min="0"
                        value={editBebekMati}
                        onChange={(e) => setEditBebekMati(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Afkir (Ekor)</label>
                      <input
                        type="number"
                        min="0"
                        value={editBebekAfkir}
                        onChange={(e) => setEditBebekAfkir(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Kondisi cuaca, sekam, dll..."
                  value={editCatatan}
                  onChange={(e) => setEditCatatan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              {/* Live Preview Perhitungan */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-sky-500/10 border border-amber-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Telur</span>
                  <span className="text-sm font-bold text-amber-400">{editTelurUtuh + editTelurRetak + editTelurRusak} butir</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Estimasi Berat</span>
                  <span className="text-sm font-bold text-white">{(((editTelurUtuh + editTelurRetak + editTelurRusak) * 65) / 1000).toFixed(1)} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">HDP %</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {(() => {
                      const pop = populasiList.find(p => p.id === editPopulasiId);
                      const d = pop ? pop.jumlahSaatIni : 500;
                      const tot = editTelurUtuh + editTelurRetak + editTelurRusak;
                      return d > 0 ? ((tot / d) * 100).toFixed(1) : '0';
                    })()}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">FCR</span>
                  <span className="text-sm font-bold text-sky-400">
                    {(() => {
                      const tot = editTelurUtuh + editTelurRetak + editTelurRusak;
                      const b = (tot * 65) / 1000;
                      return b > 0 ? (editPakanKg / b).toFixed(2) : '0';
                    })()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-all active:scale-95"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PAKAN */}
      {editingPakan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Stok Pakan</h3>
                  <p className="text-xs text-slate-400">Perbarui informasi dan jumlah stok pakan.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPakan(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPakan} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Pakan</label>
                <input
                  type="text"
                  value={editNamaPakan}
                  onChange={(e) => setEditNamaPakan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Merk / Produsen</label>
                <input
                  type="text"
                  value={editMerkPakan}
                  onChange={(e) => setEditMerkPakan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stok Tersisa (Kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={editStokKg}
                    onChange={(e) => setEditStokKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Harga Per Kg (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={editHargaPerKg}
                    onChange={(e) => setEditHargaPerKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Batas Minimum Peringatan (Kg)</label>
                <input
                  type="number"
                  min="0"
                  value={editMinStokKg}
                  onChange={(e) => setEditMinStokKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPakan(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-all active:scale-95"
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
