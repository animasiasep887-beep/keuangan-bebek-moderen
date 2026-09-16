import React, { useState } from 'react';
import {
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
import type { PencatatanHarian, Kandang, PopulasiBebek, PakanItem, KomoditasTernak } from '../types';
import { KOMODITAS_LIST } from '../types';
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
  activeCommodity?: KomoditasTernak;
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
  activeCommodity = 'BEBEK_PETELUR',
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTabLocal] = useState<'form' | 'table' | 'pakan'>('form');

  // Common Form States
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [kandangId, setKandangId] = useState<string>(kandangList[0]?.id || 'k-1');
  const [populasiId, setPopulasiId] = useState<string>(populasiList[0]?.id || 'pop-1');
  const [catatan, setCatatan] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterKandangId, setFilterKandangId] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Bebek & Layer Egg States
  const [telurUtuh, setTelurUtuh] = useState<number>(850);
  const [telurRetak, setTelurRetak] = useState<number>(20);
  const [telurRusak, setTelurRusak] = useState<number>(5);
  const [bebekMati, setBebekMati] = useState<number>(0);
  const [bebekAfkir, setBebekAfkir] = useState<number>(0);
  const [pakanKg, setPakanKg] = useState<number>(365);
  const [pakanId, setPakanId] = useState<string>(pakanList[0]?.id || 'pak-1');

  // Broiler (Ayam Pedaging) States
  const [umurHari, setUmurHari] = useState<number>(28);
  const [mortalitasDoc, setMortalitasDoc] = useState<number>(2);
  const [bobotTimbangGram, setBobotTimbangGram] = useState<number>(1850);
  const [totalBobotPanenKg, setTotalBobotPanenKg] = useState<number>(0);

  // Sapi (Perah & Potong) States
  const [susuPagiLiter, setSusuPagiLiter] = useState<number>(28);
  const [susuSoreLiter, setSusuSoreLiter] = useState<number>(20);
  const [bobotSapiKg, setBobotSapiKg] = useState<number>(450);
  const [pakanHijauanKg, setPakanHijauanKg] = useState<number>(350);
  const [pakanKonsentratKg, setPakanKonsentratKg] = useState<number>(80);
  const [catatanKesehatan, setCatatanKesehatan] = useState<string>('Laktasi Sehat & Vaksin Teratur');

  // Lele (Akuakultur) States
  const [pakanPeletKg, setPakanPeletKg] = useState<number>(45);
  const [samplingIsiPerKg, setSamplingIsiPerKg] = useState<number>(8);
  const [kematianIkan, setKematianIkan] = useState<number>(3);
  const [panenSortirKg, setPanenSortirKg] = useState<number>(0);
  const [kondisiAir, setKondisiAir] = useState<string>('Normal / Hijau Segar');

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

  // 1. Calculations for Bebek & Layer
  const totalTelur = telurUtuh + telurRetak + telurRusak;
  const hdpPercentage = liveDuckCount > 0
    ? Number(((totalTelur / liveDuckCount) * 100).toFixed(1))
    : 0;
  const totalBeratTelurKg = Number(((totalTelur * (activeCommodity === 'AYAM_PETELUR' ? 60 : 65)) / 1000).toFixed(1));
  const fcr = totalBeratTelurKg > 0
    ? Number((pakanKg / totalBeratTelurKg).toFixed(2))
    : 0;

  // 2. Calculations for Broiler
  const dayaHidupBroiler = liveDuckCount > 0
    ? Math.max(0, Number((((liveDuckCount - mortalitasDoc) / liveDuckCount) * 100).toFixed(1)))
    : 98.5;
  const bobotRataKg = Number((bobotTimbangGram / 1000).toFixed(3));
  const adgGram = umurHari > 0 ? Math.round(bobotTimbangGram / umurHari) : 66;
  const fcrBroiler = (pakanKg > 0 && bobotRataKg > 0)
    ? Number((pakanKg / Math.max(1, (liveDuckCount * bobotRataKg * (1 / Math.max(1, umurHari))))).toFixed(2))
    : 1.52;
  const ipBroiler = (umurHari > 0 && fcrBroiler > 0)
    ? Math.round((dayaHidupBroiler * bobotRataKg) / (fcrBroiler * umurHari) * 100)
    : 388;

  // 3. Calculations for Sapi
  const totalSusuLiter = Number((susuPagiLiter + susuSoreLiter).toFixed(1));
  const rataLiterPerSapi = liveDuckCount > 0
    ? Number((totalSusuLiter / Math.max(1, liveDuckCount)).toFixed(1))
    : 16;
  const totalPakanSapi = pakanHijauanKg + pakanKonsentratKg;

  // 4. Calculations for Lele
  const rataBobotLeleGram = samplingIsiPerKg > 0 ? Math.round(1000 / samplingIsiPerKg) : 125;
  const biomassaLeleKg = samplingIsiPerKg > 0 ? Math.round(liveDuckCount / samplingIsiPerKg) : 250;
  const srLele = liveDuckCount > 0
    ? Math.max(0, Number((((liveDuckCount - kematianIkan) / liveDuckCount) * 100).toFixed(1)))
    : 94;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    StorageService.addPencatatanHarian({
      tanggal,
      kandangId,
      populasiId,
      komoditas: activeCommodity,
      telurUtuh,
      telurRetak,
      telurRusak,
      totalBeratTelurKg,
      bebekMati: activeCommodity === 'AYAM_PEDAGING' ? mortalitasDoc : (activeCommodity === 'LELE' ? kematianIkan : bebekMati),
      bebekAfkir,
      pakanKg: activeCommodity === 'LELE' ? pakanPeletKg : (activeCommodity === 'SAPI' ? totalPakanSapi : pakanKg),
      pakanId,
      hdpPercentage,
      fcr: activeCommodity === 'AYAM_PEDAGING' ? fcrBroiler : fcr,

      // Broiler specific
      umurHari,
      mortalitasDoc,
      bobotRataEkorGram: bobotTimbangGram,
      totalBobotPanenKg,
      indeksPerforma: ipBroiler,
      adgGram,

      // Sapi specific
      susuPagiLiter,
      susuSoreLiter,
      totalSusuLiter,
      bobotSapiKg,
      pakanHijauanKg,
      pakanKonsentratKg,
      catatanKesehatan,

      // Lele specific
      ukuranSamplingGram: rataBobotLeleGram,
      samplingIsiPerKg,
      bobotPanenIkanKg: panenSortirKg,
      survivalRate: srLele,
      pakanPeletKg,
      kondisiAir,

      catatan,
      createdBy: 'Petugas Kandang',
    });

    setSuccessMessage('Data Panen / Operasional Berhasil Disimpan!');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card-luxury p-5 sm:p-6 rounded-3xl border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
            {KOMODITAS_LIST[activeCommodity].icon}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              Pencatatan Operasional {KOMODITAS_LIST[activeCommodity].nama}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeCommodity === 'BEBEK_PETELUR' || activeCommodity === 'AYAM_PETELUR'
                ? 'Input panen telur Grade A/B harian, mortalitas, pakan konsentrat, dan rasio HDP/FCR.'
                : activeCommodity === 'AYAM_PEDAGING'
                ? 'Sampling bobot panen broiler harian, mortalitas DOC, dan rasio Indeks Performa.'
                : activeCommodity === 'SAPI'
                ? 'Pencatatan perahan susu pagi/sore, penimbangan bobot ternak, dan pakan ransum.'
                : 'Pencatatan pakan pelet lele, sampling isi/kg, dan pemantauan survival rate kolam.'}
            </p>
          </div>
        </div>

        {/* Tab Buttons & Quick Tools */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          {onOpenKasir && (
            <button
              onClick={onOpenKasir}
              className="hidden sm:flex px-3.5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              Kasir Jual Telur
            </button>
          )}

          {onOpenKalkulator && (
            <button
              onClick={onOpenKalkulator}
              className="hidden sm:flex px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-white/[0.08] transition-all items-center gap-1.5"
            >
              <Calculator className="w-4 h-4" />
              Kalkulator Ransum
            </button>
          )}

          <div className="flex items-center bg-slate-950/80 p-1 rounded-2xl border border-white/[0.08] w-full sm:w-auto justify-between sm:justify-start shadow-inner">
            <button
              onClick={() => setActiveTabLocal('form')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'form'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Input Panen
            </button>
            <button
              onClick={() => setActiveTabLocal('table')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'table'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Riwayat
            </button>
            <button
              onClick={() => setActiveTabLocal('pakan')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'pakan'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white'
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

          <form onSubmit={handleSubmit} className="glass-card-luxury p-6 sm:p-7 rounded-3xl border border-white/[0.08] space-y-6 relative overflow-hidden">
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
              <label className="block text-xs font-bold text-slate-300 mb-1">{KOMODITAS_LIST[activeCommodity].labelKandang}</label>
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
                <label className="block text-xs font-bold text-slate-300">Batch {KOMODITAS_LIST[activeCommodity].labelPopulasi}</label>
                {setActiveTab && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('pengaturan')}
                    className="text-[11px] text-amber-400 hover:underline font-bold"
                  >
                    + Kelola Populasi
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

          {/* Live Productivity Preview Banner - Dynamic per Commodity */}
          {(activeCommodity === 'BEBEK_PETELUR' || activeCommodity === 'AYAM_PETELUR') && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-xl border border-amber-500/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Hasil Total Butir</p>
                <p className="text-xl font-black text-amber-400">{totalTelur.toLocaleString('id-ID')} <span className="text-xs font-normal">butir</span></p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Hen-Day Production (HDP)</p>
                <p className="text-xl font-black text-emerald-400">{hdpPercentage}%</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Estimasi Berat Telur</p>
                <p className="text-xl font-black text-sky-400">{totalBeratTelurKg} <span className="text-xs font-normal">kg</span></p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Rasio FCR Pakan</p>
                <p className="text-xl font-black text-indigo-400">{fcr}</p>
              </div>
            </div>
          )}

          {activeCommodity === 'AYAM_PEDAGING' && (
            <div className="bg-gradient-to-r from-red-500/15 via-amber-500/10 to-transparent p-4 rounded-xl border border-red-500/30 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Indeks Performa (IP)</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black text-amber-400">{ipBroiler}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
                    ipBroiler >= 400 ? 'bg-emerald-500/20 text-emerald-300' :
                    ipBroiler >= 350 ? 'bg-amber-500/20 text-amber-300' :
                    ipBroiler >= 300 ? 'bg-blue-500/20 text-blue-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {ipBroiler >= 400 ? '⭐ Istimewa' : ipBroiler >= 350 ? '✅ Sangat Baik' : ipBroiler >= 300 ? '⚠️ Baik' : '❌ Evaluasi'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Bobot Rata-rata Ekor</p>
                <p className="text-xl font-black text-emerald-400">{bobotRataKg} <span className="text-xs font-normal">kg ({bobotTimbangGram}g)</span></p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Pertambahan Bobot (ADG)</p>
                <p className="text-xl font-black text-sky-400">{adgGram} <span className="text-xs font-normal">g / hari</span></p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Daya Hidup (Livability)</p>
                <p className="text-xl font-black text-indigo-400">{dayaHidupBroiler}%</p>
              </div>
            </div>
          )}

          {activeCommodity === 'SAPI' && (
            <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent p-4 rounded-xl border border-emerald-500/30 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Total Susu Harian</p>
                <p className="text-xl font-black text-emerald-400">{totalSusuLiter} <span className="text-xs font-normal">Liter</span></p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Rata-rata Susu / Sapi</p>
                <p className="text-xl font-black text-teal-400">{rataLiterPerSapi} <span className="text-xs font-normal">L / ekor</span></p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Bobot Sapi Timbang</p>
                <p className="text-xl font-black text-amber-400">{bobotSapiKg} <span className="text-xs font-normal">kg</span></p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Total Pakan Ransum</p>
                <p className="text-xl font-black text-sky-400">{totalPakanSapi} <span className="text-xs font-normal">kg (Hijauan+Kons)</span></p>
              </div>
            </div>
          )}

          {activeCommodity === 'LELE' && (
            <div className="bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent p-4 rounded-xl border border-cyan-500/30 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Estimasi Biomassa Kolam</p>
                <p className="text-xl font-black text-cyan-400">{biomassaLeleKg.toLocaleString('id-ID')} <span className="text-xs font-normal">kg</span></p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Sampling Ukuran</p>
                <p className="text-xl font-black text-sky-400">Isi {samplingIsiPerKg} <span className="text-xs font-normal">/ kg (~{rataBobotLeleGram}g)</span></p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Survival Rate (SR)</p>
                <p className="text-xl font-black text-emerald-400">{srLele}%</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Kondisi Kualitas Air</p>
                <p className="text-sm font-black text-amber-400 truncate">{kondisiAir}</p>
              </div>
            </div>
          )}

          {/* DYNAMIC FORM INPUTS ACCORDING TO COMMODITY */}

          {/* Form 1: Bebek & Ayam Petelur */}
          {(activeCommodity === 'BEBEK_PETELUR' || activeCommodity === 'AYAM_PETELUR') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-amber-500/30">
                  <label className="block text-xs font-bold text-amber-400 mb-1">
                    Telur Utuh / Grade A (Butir)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={telurUtuh}
                    onChange={(e) => setTelurUtuh(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-lg font-bold text-amber-300 focus:outline-none focus:border-amber-400 shadow-inner"
                    required
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[10px] text-slate-400 font-bold">Cepat:</span>
                    <button
                      type="button"
                      onClick={() => setTelurUtuh((prev) => prev + 10)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/30 active:scale-95 transition-all"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => setTelurUtuh((prev) => prev + 30)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/30 active:scale-95 transition-all"
                    >
                      +30 (1 Rak)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTelurUtuh((prev) => prev + 150)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/30 active:scale-95 transition-all"
                    >
                      +150 (5 Rak)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTelurUtuh(0)}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-2xl border border-orange-500/30">
                  <label className="block text-xs font-bold text-orange-400 mb-1">
                    Telur Retak / Grade B (Butir)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={telurRetak}
                    onChange={(e) => setTelurRetak(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-orange-500/40 rounded-xl px-3 py-2 text-lg font-bold text-orange-300 focus:outline-none focus:border-orange-400 shadow-inner"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[10px] text-slate-400 font-bold">Cepat:</span>
                    <button
                      type="button"
                      onClick={() => setTelurRetak((prev) => prev + 5)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-orange-500/15 text-orange-300 border border-orange-500/25 hover:bg-orange-500/30 active:scale-95 transition-all"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => setTelurRetak((prev) => prev + 10)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-orange-500/15 text-orange-300 border border-orange-500/25 hover:bg-orange-500/30 active:scale-95 transition-all"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => setTelurRetak(0)}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-2xl border border-rose-500/30">
                  <label className="block text-xs font-bold text-rose-400 mb-1">
                    Telur Rusak / Pecah (Butir)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={telurRusak}
                    onChange={(e) => setTelurRusak(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-lg font-bold text-rose-300 focus:outline-none focus:border-rose-400 shadow-inner"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[10px] text-slate-400 font-bold">Cepat:</span>
                    <button
                      type="button"
                      onClick={() => setTelurRusak((prev) => prev + 1)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/25 hover:bg-rose-500/30 active:scale-95 transition-all"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setTelurRusak(0)}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-rose-400 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Populasi Mati (Ekor)
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
                  <label className="block text-xs font-bold text-amber-300 mb-1">Ternak Afkir (Ekor)</label>
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
            </div>
          )}

          {/* Form 2: Broiler (Ayam Pedaging) */}
          {activeCommodity === 'AYAM_PEDAGING' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-bold text-amber-400 mb-1">
                    Umur Ayam (Hari ke-1 s/d 35)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={umurHari}
                    onChange={(e) => setUmurHari(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-amber-500/30 rounded-lg px-3 py-2 text-lg font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-bold text-rose-400 mb-1">
                    Mortalitas DOC Hari Ini (Ekor)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={mortalitasDoc}
                    onChange={(e) => setMortalitasDoc(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-rose-500/30 rounded-lg px-3 py-2 text-lg font-bold text-rose-300 focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-bold text-emerald-400 mb-1">
                    Bobot Sampel Timbang (Gram/Ekor)
                  </label>
                  <input
                    type="number"
                    min="40"
                    step="10"
                    value={bobotTimbangGram}
                    onChange={(e) => setBobotTimbangGram(parseInt(e.target.value) || 40)}
                    className="w-full bg-slate-950 border border-emerald-500/30 rounded-lg px-3 py-2 text-lg font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                    required
                  />
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-bold text-sky-400 mb-1">
                    Pakan Konsumsi Hari Ini (Kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pakanKg}
                    onChange={(e) => setPakanKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-sky-500/30 rounded-lg px-3 py-2 text-lg font-bold text-sky-300 focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Jenis Pakan Broiler</label>
                  <select
                    value={pakanId}
                    onChange={(e) => setPakanId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
                  >
                    <option value="pak-starter">Pakan Pre-Starter / Starter (Crumble)</option>
                    <option value="pak-finisher">Pakan Finisher (Pellet Broiler)</option>
                    {pakanList.map((p) => (
                      <option key={p.id} value={p.id}>{p.namaPakan} (Stok: {p.stokKg} kg)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Total Panen Daging (Kg - Jika Hari Panen)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Diisi jika panen sebagian/total (kg)"
                    value={totalBobotPanenKg || ''}
                    onChange={(e) => setTotalBobotPanenKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form 3: Sapi (Perah & Potong) */}
          {activeCommodity === 'SAPI' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-bold text-teal-400 mb-1">
                    🌅 Perah Susu Pagi (Liter)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={susuPagiLiter}
                    onChange={(e) => setSusuPagiLiter(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-teal-500/30 rounded-lg px-3 py-2 text-lg font-bold text-teal-300 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-bold text-teal-400 mb-1">
                    🌇 Perah Susu Sore (Liter)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={susuSoreLiter}
                    onChange={(e) => setSusuSoreLiter(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-teal-500/30 rounded-lg px-3 py-2 text-lg font-bold text-teal-300 focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-bold text-amber-400 mb-1">
                    ⚖️ Penimbangan Bobot Sapi (Kg)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="5"
                    value={bobotSapiKg}
                    onChange={(e) => setBobotSapiKg(parseInt(e.target.value) || 100)}
                    className="w-full bg-slate-950 border border-amber-500/30 rounded-lg px-3 py-2 text-lg font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-400 mb-1">Pakan Hijauan / Rumput (Kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={pakanHijauanKg}
                    onChange={(e) => setPakanHijauanKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
                    placeholder="Rumput gajah / odot (kg)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1">Pakan Konsentrat / Ampas (Kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={pakanKonsentratKg}
                    onChange={(e) => setPakanKonsentratKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
                    placeholder="Konsentrat pabrik / bekatul (kg)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-sky-400 mb-1">Status Laktasi & Medis</label>
                  <input
                    type="text"
                    value={catatanKesehatan}
                    onChange={(e) => setCatatanKesehatan(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
                    placeholder="Contoh: Laktasi bulan ke-3, sehat"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form 4: Lele (Akuakultur) */}
          {activeCommodity === 'LELE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-bold text-cyan-400 mb-1">
                    Pemberian Pakan Pelet (Kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={pakanPeletKg}
                    onChange={(e) => setPakanPeletKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-cyan-500/30 rounded-lg px-3 py-2 text-lg font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-bold text-sky-400 mb-1">
                    Sampling Size (Isi Ekor/Kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={samplingIsiPerKg}
                    onChange={(e) => setSamplingIsiPerKg(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-sky-500/30 rounded-lg px-3 py-2 text-lg font-bold text-sky-300 focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-bold text-rose-400 mb-1">
                    Kematian Ikan (Ekor)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={kematianIkan}
                    onChange={(e) => setKematianIkan(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-rose-500/30 rounded-lg px-3 py-2 text-lg font-bold text-rose-300 focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <label className="block text-xs font-bold text-emerald-400 mb-1">
                    Panen Sortir Kolam (Kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={panenSortirKg || ''}
                    placeholder="0 jika tidak panen"
                    onChange={(e) => setPanenSortirKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-emerald-500/30 rounded-lg px-3 py-2 text-lg font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Kondisi Kualitas Air Kolam Bioflok/Terpal</label>
                <select
                  value={kondisiAir}
                  onChange={(e) => setKondisiAir(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium"
                >
                  <option value="Normal / Hijau Segar">🟢 Normal / Hijau Segar (Optimal, Flok Aktif)</option>
                  <option value="Coklat Matang">🟤 Coklat Matang (Bioflok Produktif)</option>
                  <option value="Berbusa / Bau Amonia">🟡 Berbusa / Bau Amonia (Perlu Kurangi Pakan & Tambah Aerasi)</option>
                  <option value="Keruh / Perlu Ganti Air">🔴 Keruh / Perlu Sifon dan Kuras 20%</option>
                </select>
              </div>
            </div>
          )}

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
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Pencatatan Harian</span>
            </button>
          </div>
        </form>
      </div>
      )}

      {/* VIEW 2: Tabel History Panen / Operasional */}
      {activeTab === 'table' && (
        <div className="glass-card-luxury p-6 rounded-3xl border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{KOMODITAS_LIST[activeCommodity].icon}</span>
                <span>
                  {activeCommodity === 'BEBEK_PETELUR' ? 'Riwayat Panen Telur Bebek' :
                   activeCommodity === 'AYAM_PETELUR' ? 'Riwayat Panen Telur Layer' :
                   activeCommodity === 'AYAM_PEDAGING' ? 'Riwayat Performa & Sampling Broiler' :
                   activeCommodity === 'SAPI' ? 'Riwayat Produksi Susu & Sapi' :
                   'Riwayat Pakan, Sampling & Panen Lele'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Total {filteredLogs.length} catatan operasional ditemukan.</p>
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
                  <option value="all">Semua Unit</option>
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

                  {/* Duck & Layer Headers */}
                  {(activeCommodity === 'BEBEK_PETELUR' || activeCommodity === 'AYAM_PETELUR') && (
                    <>
                      <th className="px-4 py-3">Grade A (Utuh)</th>
                      <th className="px-4 py-3">Grade B (Retak)</th>
                      <th className="px-4 py-3">Pecah</th>
                      <th className="px-4 py-3">Total Butir</th>
                      <th className="px-4 py-3">HDP %</th>
                      <th className="px-4 py-3">Pakan (Kg)</th>
                      <th className="px-4 py-3">FCR</th>
                      <th className="px-4 py-3">Mati</th>
                    </>
                  )}

                  {/* Broiler Headers */}
                  {activeCommodity === 'AYAM_PEDAGING' && (
                    <>
                      <th className="px-4 py-3">Umur</th>
                      <th className="px-4 py-3">Bobot Rata-rata</th>
                      <th className="px-4 py-3">ADG (g/hr)</th>
                      <th className="px-4 py-3">DOC Mati</th>
                      <th className="px-4 py-3">Pakan (Kg)</th>
                      <th className="px-4 py-3">Indeks Performa (IP)</th>
                      <th className="px-4 py-3">Panen Daging</th>
                    </>
                  )}

                  {/* Sapi Headers */}
                  {activeCommodity === 'SAPI' && (
                    <>
                      <th className="px-4 py-3">Susu Pagi</th>
                      <th className="px-4 py-3">Susu Sore</th>
                      <th className="px-4 py-3">Total Susu</th>
                      <th className="px-4 py-3">Bobot Sapi</th>
                      <th className="px-4 py-3">Pakan Hijauan</th>
                      <th className="px-4 py-3">Pakan Konsentrat</th>
                      <th className="px-4 py-3">Status Medis</th>
                    </>
                  )}

                  {/* Lele Headers */}
                  {activeCommodity === 'LELE' && (
                    <>
                      <th className="px-4 py-3">Pakan Pelet</th>
                      <th className="px-4 py-3">Sampling Size</th>
                      <th className="px-4 py-3">Rata-rata Bobot</th>
                      <th className="px-4 py-3">Kematian</th>
                      <th className="px-4 py-3">Panen Sortir</th>
                      <th className="px-4 py-3">Kualitas Air</th>
                    </>
                  )}

                  <th className="px-4 py-3 text-right sticky right-0 bg-slate-900 shadow-[-4px_0_12px_rgba(0,0,0,0.6)] z-10">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-medium">
                {filteredLogs.map((log) => {
                  const logTotalTelur = (log.telurUtuh || 0) + (log.telurRetak || 0) + (log.telurRusak || 0);

                  return (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{log.tanggal}</td>

                      {/* Duck & Layer Cells */}
                      {(activeCommodity === 'BEBEK_PETELUR' || activeCommodity === 'AYAM_PETELUR') && (
                        <>
                          <td className="px-4 py-3 text-amber-400 font-bold">{log.telurUtuh || 0}</td>
                          <td className="px-4 py-3 text-orange-400">{log.telurRetak || 0}</td>
                          <td className="px-4 py-3 text-rose-400">{log.telurRusak || 0}</td>
                          <td className="px-4 py-3 font-bold text-white">{logTotalTelur}</td>
                          <td className="px-4 py-3 text-emerald-400 font-bold">{log.hdpPercentage || 0}%</td>
                          <td className="px-4 py-3">{log.pakanKg || 0} kg</td>
                          <td className="px-4 py-3 text-sky-400 font-bold">{log.fcr || '-'}</td>
                          <td className="px-4 py-3 text-rose-400">{log.bebekMati > 0 ? `${log.bebekMati} ekor` : '-'}</td>
                        </>
                      )}

                      {/* Broiler Cells */}
                      {activeCommodity === 'AYAM_PEDAGING' && (
                        <>
                          <td className="px-4 py-3 text-amber-400 font-bold">Hari ke-{log.umurHari || 28}</td>
                          <td className="px-4 py-3 text-emerald-400 font-bold">
                            {log.bobotRataEkorGram ? `${log.bobotRataEkorGram} g` : '1.85 kg'}
                          </td>
                          <td className="px-4 py-3 text-sky-400">{log.adgGram || 66} g/hr</td>
                          <td className="px-4 py-3 text-rose-400">{log.mortalitasDoc || log.bebekMati || 0} ekor</td>
                          <td className="px-4 py-3">{log.pakanKg || 320} kg</td>
                          <td className="px-4 py-3 font-black text-amber-300">
                            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                              IP {log.indeksPerforma || 388}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-400">{log.totalBobotPanenKg ? `${log.totalBobotPanenKg} kg` : '-'}</td>
                        </>
                      )}

                      {/* Sapi Cells */}
                      {activeCommodity === 'SAPI' && (
                        <>
                          <td className="px-4 py-3 text-teal-400">{log.susuPagiLiter || 25} L</td>
                          <td className="px-4 py-3 text-teal-400">{log.susuSoreLiter || 18} L</td>
                          <td className="px-4 py-3 text-emerald-400 font-black">{log.totalSusuLiter || 43} Liter</td>
                          <td className="px-4 py-3 text-amber-300 font-bold">{log.bobotSapiKg || 450} kg</td>
                          <td className="px-4 py-3 text-slate-300">{log.pakanHijauanKg || 350} kg</td>
                          <td className="px-4 py-3 text-slate-300">{log.pakanKonsentratKg || 80} kg</td>
                          <td className="px-4 py-3 text-sky-400 truncate max-w-[120px]">{log.catatanKesehatan || 'Sehat'}</td>
                        </>
                      )}

                      {/* Lele Cells */}
                      {activeCommodity === 'LELE' && (
                        <>
                          <td className="px-4 py-3 text-cyan-400 font-bold">{log.pakanPeletKg || log.pakanKg || 45} kg</td>
                          <td className="px-4 py-3 text-sky-400">Isi {log.samplingIsiPerKg || 8}/kg</td>
                          <td className="px-4 py-3 text-slate-300 font-bold">~{log.ukuranSamplingGram || 125} g</td>
                          <td className="px-4 py-3 text-rose-400">{log.bebekMati || 0} ekor</td>
                          <td className="px-4 py-3 text-emerald-400 font-bold">{log.bobotPanenIkanKg ? `${log.bobotPanenIkanKg} kg` : '-'}</td>
                          <td className="px-4 py-3 text-amber-300">{log.kondisiAir || 'Normal / Hijau Segar'}</td>
                        </>
                      )}

                      <td className="px-4 py-3 text-right sticky right-0 bg-slate-950/95 backdrop-blur shadow-[-4px_0_12px_rgba(0,0,0,0.6)] z-10">
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenKasir && (
                            <button
                              onClick={onOpenKasir}
                              className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-[11px] border border-amber-500/30 transition-all"
                              title="Jual Hasil Panen ke Kasir POS"
                            >
                              🛒 Jual
                            </button>
                          )}
                          <button
                            onClick={() => handleStartEditLog(log)}
                            className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-[11px] border border-blue-500/20 transition-colors flex items-center gap-1"
                            title="Edit Catatan"
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Stok Pakan & Nutrisi */}
      {activeTab === 'pakan' && (
        <div className="glass-card-luxury p-6 rounded-3xl border border-white/[0.08] space-y-6">
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
