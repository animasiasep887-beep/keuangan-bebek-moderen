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
  Sparkles,
  ChevronDown,
  ChevronUp,
  Droplets,
  Thermometer,
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

  // Selected population live count
  const selectedPop = populasiList.find((p) => p.id === populasiId);
  const liveDuckCount = selectedPop ? selectedPop.jumlahSaatIni : 500;

  // 1. Bebek & Layer Egg States (Starts from 0 so user enters real data)
  const [telurUtuh, setTelurUtuh] = useState<number>(0);
  const [telurRetak, setTelurRetak] = useState<number>(0);
  const [telurRusak, setTelurRusak] = useState<number>(0);
  const [bebekMati, setBebekMati] = useState<number>(0);
  const [bebekAfkir, setBebekAfkir] = useState<number>(0);
  const [pakanKg, setPakanKg] = useState<number>(0);
  const [pakanId, setPakanId] = useState<string>(pakanList[0]?.id || 'pak-1');

  // 2. Broiler (Ayam Pedaging) States (Starts from 0)
  const [umurHari, setUmurHari] = useState<number>(0);
  const [mortalitasDoc, setMortalitasDoc] = useState<number>(0);
  const [bobotTimbangGram, setBobotTimbangGram] = useState<number>(0);
  const [pakanBroilerKg, setPakanBroilerKg] = useState<number>(0);
  const [totalBobotPanenKg, setTotalBobotPanenKg] = useState<number>(0);
  const [ekorPanenBroiler, setEkorPanenBroiler] = useState<number>(0);
  const [suhuKandang, setSuhuKandang] = useState<number>(0);
  const [kelembabanKandang, setKelembabanKandang] = useState<number>(0);
  const [jumlahSampelEkor, setJumlahSampelEkor] = useState<number>(0);

  // 3. Sapi (Perah & Potong) States (Starts from 0)
  const [subSektorSapi, setSubSektorSapi] = useState<'PERAH' | 'POTONG'>('PERAH');
  const [susuPagiLiter, setSusuPagiLiter] = useState<number>(0);
  const [susuSoreLiter, setSusuSoreLiter] = useState<number>(0);
  const [beratJenisSusu, setBeratJenisSusu] = useState<number>(0);
  const [bobotSapiKg, setBobotSapiKg] = useState<number>(0);
  const [adgSapiKg, setAdgSapiKg] = useState<number>(0);
  const [bcsScore, setBcsScore] = useState<number>(0);
  const [pakanHijauanKg, setPakanHijauanKg] = useState<number>(0);
  const [pakanKonsentratKg, setPakanKonsentratKg] = useState<number>(0);
  const [catatanKesehatan, setCatatanKesehatan] = useState<string>('');

  // 4. Lele (Akuakultur) States (Starts from 0)
  const [pakanPeletKg, setPakanPeletKg] = useState<number>(0);
  const [pakanWaktu, setPakanWaktu] = useState<string>('Pagi & Sore');
  const [tipePelet, setTipePelet] = useState<string>('Pelet Apung -2 (Remaja)');
  const [samplingIsiPerKg, setSamplingIsiPerKg] = useState<number>(0);
  const [kematianIkan, setKematianIkan] = useState<number>(0);
  const [panenSortirKg, setPanenSortirKg] = useState<number>(0);
  const [kondisiAir, setKondisiAir] = useState<string>('');
  const [phAir, setPhAir] = useState<number>(0);
  const [suhuAir, setSuhuAir] = useState<number>(0);
  const [treatmentAir, setTreatmentAir] = useState<string>('');

  // Pakan Management States
  const [showPakanForm, setShowPakanForm] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [namaPakanBaru, setNamaPakanBaru] = useState('');
  const [merkPakanBaru, setMerkPakanBaru] = useState('');
  const [stokKgBaru, setStokKgBaru] = useState<number>(500);
  const [hargaPerKgBaru, setHargaPerKgBaru] = useState<number>(8500);
  const [minStokKgBaru, setMinStokKgBaru] = useState<number>(100);

  // Calculations for Bebek & Layer
  const totalTelur = telurUtuh + telurRetak + telurRusak;
  const hdpPercentage = liveDuckCount > 0
    ? Number(((totalTelur / liveDuckCount) * 100).toFixed(1))
    : 0;
  const totalBeratTelurKg = Number(((totalTelur * (activeCommodity === 'AYAM_PETELUR' ? 60 : 65)) / 1000).toFixed(1));
  const fcr = totalBeratTelurKg > 0
    ? Number((pakanKg / totalBeratTelurKg).toFixed(2))
    : 0;
  const gramPakanPerEkor = liveDuckCount > 0 ? Math.round((pakanKg * 1000) / liveDuckCount) : 116;
  const totalRak = Math.floor(telurUtuh / 30);
  const sisaButir = telurUtuh % 30;

  // Calculations for Broiler
  const dayaHidupBroiler = liveDuckCount > 0
    ? Math.max(0, Number((((liveDuckCount - mortalitasDoc) / liveDuckCount) * 100).toFixed(1)))
    : 98.5;
  const bobotRataKg = Number((bobotTimbangGram / 1000).toFixed(3));
  const adgGram = umurHari > 0 ? Math.round(bobotTimbangGram / umurHari) : 66;
  const fcrBroiler = (pakanBroilerKg > 0 && bobotRataKg > 0)
    ? Number((pakanBroilerKg / Math.max(1, (liveDuckCount * bobotRataKg * (1 / Math.max(1, umurHari))))).toFixed(2))
    : 1.48;
  const ipBroiler = (umurHari > 0 && fcrBroiler > 0)
    ? Math.round((dayaHidupBroiler * bobotRataKg) / (fcrBroiler * umurHari) * 100)
    : 388;

  // Calculations for Sapi
  const totalSusuLiter = Number((susuPagiLiter + susuSoreLiter).toFixed(1));
  const rataLiterPerSapi = liveDuckCount > 0
    ? Number((totalSusuLiter / Math.max(1, liveDuckCount)).toFixed(1))
    : 14;
  const totalPakanSapi = pakanHijauanKg + pakanKonsentratKg;

  // Calculations for Lele
  const rataBobotLeleGram = samplingIsiPerKg > 0 ? Math.round(1000 / samplingIsiPerKg) : 125;
  const biomassaLeleKg = samplingIsiPerKg > 0 ? Math.round(liveDuckCount / samplingIsiPerKg) : 250;
  const feedingRatePercent = biomassaLeleKg > 0
    ? Number(((pakanPeletKg / biomassaLeleKg) * 100).toFixed(1))
    : 4.0;
  const srLele = liveDuckCount > 0
    ? Math.max(0, Number((((liveDuckCount - kematianIkan) / liveDuckCount) * 100).toFixed(1)))
    : 98;

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
      bebekMati:
        activeCommodity === 'AYAM_PEDAGING'
          ? mortalitasDoc
          : activeCommodity === 'LELE'
          ? kematianIkan
          : bebekMati,
      bebekAfkir,
      pakanKg:
        activeCommodity === 'LELE'
          ? pakanPeletKg
          : activeCommodity === 'SAPI'
          ? totalPakanSapi
          : activeCommodity === 'AYAM_PEDAGING'
          ? pakanBroilerKg
          : pakanKg,
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
      suhuKandang,
      kelembabanKandang,
      jumlahSampelEkor,

      // Sapi specific
      subSektorSapi,
      susuPagiLiter,
      susuSoreLiter,
      totalSusuLiter,
      beratJenisSusu,
      bobotSapiKg,
      adgSapiKg,
      pakanHijauanKg,
      pakanKonsentratKg,
      catatanKesehatan,

      // Lele specific
      ukuranSamplingGram: rataBobotLeleGram,
      samplingIsiPerKg,
      bobotPanenIkanKg: panenSortirKg,
      survivalRate: srLele,
      pakanPeletKg,
      pakanWaktu,
      kondisiAir,
      phAir,
      suhuAir,
      treatmentAir,

      catatan,
      createdBy: 'Petugas Kandang',
    });

    const notifMessage =
      activeCommodity === 'AYAM_PEDAGING'
        ? 'Data Sampling & Performa Broiler Berhasil Disimpan!'
        : activeCommodity === 'SAPI'
        ? 'Data Operasional Sapi & Susu Berhasil Disimpan!'
        : activeCommodity === 'LELE'
        ? 'Data Pakan & Monitoring Kolam Lele Berhasil Disimpan!'
        : 'Data Panen Telur Harian Berhasil Disimpan!';

    setSuccessMessage(notifMessage);
    showToast(notifMessage, 'success');
    onRefreshData();

    // Reset inputs back to 0 & empty so next entry starts fresh
    setTelurUtuh(0);
    setTelurRetak(0);
    setTelurRusak(0);
    setBebekMati(0);
    setBebekAfkir(0);
    setPakanKg(0);
    setCatatan('');
    setUmurHari(0);
    setMortalitasDoc(0);
    setBobotTimbangGram(0);
    setPakanBroilerKg(0);
    setTotalBobotPanenKg(0);
    setEkorPanenBroiler(0);
    setSuhuKandang(0);
    setKelembabanKandang(0);
    setJumlahSampelEkor(0);
    setSusuPagiLiter(0);
    setSusuSoreLiter(0);
    setBeratJenisSusu(0);
    setBobotSapiKg(0);
    setAdgSapiKg(0);
    setBcsScore(0);
    setPakanHijauanKg(0);
    setPakanKonsentratKg(0);
    setCatatanKesehatan('');
    setPakanPeletKg(0);
    setSamplingIsiPerKg(0);
    setKematianIkan(0);
    setPanenSortirKg(0);
    setKondisiAir('');
    setPhAir(0);
    setSuhuAir(0);
    setTreatmentAir('');

    setTimeout(() => {
      setSuccessMessage(null);
      setActiveTabLocal('table');
    }, 1200);
  };

  // Delete & Edit Log State
  const [confirmDeleteLogId, setConfirmDeleteLogId] = useState<string | null>(null);
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
    showToast('Catatan operasional berhasil dihapus', 'info');
    setConfirmDeleteLogId(null);
    onRefreshData();
  };

  const handleStartEditLog = (log: PencatatanHarian) => {
    setEditingLog(log);
    setEditTanggal(log.tanggal);
    setEditKandangId(log.kandangId);
    setEditPopulasiId(log.populasiId);
    setEditTelurUtuh(log.telurUtuh || 0);
    setEditTelurRetak(log.telurRetak || 0);
    setEditTelurRusak(log.telurRusak || 0);
    setEditBebekMati(log.bebekMati || log.mortalitasDoc || 0);
    setEditBebekAfkir(log.bebekAfkir || 0);
    setEditPakanKg(log.pakanKg || 0);
    setEditPakanId(log.pakanId || pakanList[0]?.id || '');
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

    showToast('Data operasional berhasil diperbarui!', 'success');
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
      merk: editMerkPakan || 'Lokal / Pabrik',
      stokKg: editStokKg,
      hargaPerKg: editHargaPerKg,
      minStokKg: editMinStokKg,
    });

    showToast(`Pakan ${editNamaPakan} berhasil diperbarui!`, 'success');
    setEditingPakan(null);
    onRefreshData();
  };

  const handleAddPakanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPakanBaru.trim()) {
      showToast('Mohon isi nama pakan!', 'warning');
      return;
    }
    StorageService.addPakan({
      namaPakan: namaPakanBaru,
      merk: merkPakanBaru || 'Standar Peternakan',
      stokKg: stokKgBaru,
      hargaPerKg: hargaPerKgBaru,
      minStokKg: minStokKgBaru,
    });
    showToast('Stok Pakan Baru Berhasil Ditambahkan!', 'success');
    onRefreshData();
    setShowPakanForm(false);
    setNamaPakanBaru('');
    setMerkPakanBaru('');
  };

  const handleRestockPakan = (id: string, nama: string) => {
    const qtyStr = prompt(`Masukkan jumlah restock pakan (kg) untuk ${nama}:`, '100');
    if (!qtyStr) return;
    const qty = parseFloat(qtyStr);
    if (!isNaN(qty) && qty > 0) {
      StorageService.restockPakan(id, qty);
      showToast(`Stok ${nama} berhasil ditambah ${qty} kg!`, 'success');
      onRefreshData();
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

  // Dynamic Sector Helpers
  const getSubHeaderTexts = () => {
    switch (activeCommodity) {
      case 'AYAM_PEDAGING':
        return {
          title: 'Pencatatan Operasional Broiler (Ayam Pedaging)',
          desc: 'Sampling pertumbuhan bobot, konversi pakan FCR, mortalitas DOC, dan Indeks Performa (IP).',
          formTab: 'Input Sampling & Panen',
          kasirBtn: 'Kasir Jual Ayam Broiler',
          calcBtn: 'Kalkulator FCR Broiler',
        };
      case 'SAPI':
        return {
          title: 'Pencatatan Operasional Sapi (Perah & Potong)',
          desc: 'Perahan susu pagi/sore, penimbangan bobot ternak, pakan ransum, dan catatan kesehatan.',
          formTab: 'Input Perahan & Bobot',
          kasirBtn: 'Kasir Susu & Sapi',
          calcBtn: 'Kalkulator Ransum Sapi',
        };
      case 'LELE':
        return {
          title: 'Pencatatan Budidaya Ikan Lele (Bioflok & Terpal)',
          desc: 'Pemberian pakan pelet harian, sampling isi/kg, monitoring kualitas air kolam, dan panen sortir.',
          formTab: 'Input Pakan & Kolam',
          kasirBtn: 'Kasir Jual Lele',
          calcBtn: 'Kalkulator Biomassa Lele',
        };
      case 'AYAM_PETELUR':
        return {
          title: 'Pencatatan Operasional Ayam Petelur (Layer)',
          desc: 'Input panen telur Grade A/B harian, mortalitas, pakan konsentrat, dan rasio HDP/FCR.',
          formTab: 'Input Panen Telur',
          kasirBtn: 'Kasir Jual Telur Layer',
          calcBtn: 'Kalkulator HDP & Pakan',
        };
      case 'BEBEK_PETELUR':
      default:
        return {
          title: 'Pencatatan Operasional Bebek Petelur',
          desc: 'Input panen telur Grade A/B harian, mortalitas, pakan konsentrat, dan rasio HDP/FCR.',
          formTab: 'Input Panen Telur',
          kasirBtn: 'Kasir Jual Telur Bebek',
          calcBtn: 'Kalkulator HDP Bebek',
        };
    }
  };

  const headerMeta = getSubHeaderTexts();

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Sub Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card-luxury p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
            {KOMODITAS_LIST[activeCommodity].icon}
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              {headerMeta.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {headerMeta.desc}
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
              {headerMeta.kasirBtn}
            </button>
          )}

          {onOpenKalkulator && (
            <button
              onClick={onOpenKalkulator}
              className="hidden sm:flex px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-white/[0.08] transition-all items-center gap-1.5"
            >
              <Calculator className="w-4 h-4" />
              {headerMeta.calcBtn}
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
              {headerMeta.formTab}
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

      {/* VIEW 1: Form Input Harian Spesifik Sektor */}
      {activeTab === 'form' && (
        <div className="space-y-4">
          {/* Collapsible Interactive Sector Guide */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-transparent border border-amber-500/20 p-3 sm:p-4 text-xs">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between font-bold text-amber-300 text-left"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Panduan Praktis & Standar Lapangan ({KOMODITAS_LIST[activeCommodity].nama})
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>{showGuide ? 'Sembunyikan' : 'Buka Panduan'}</span>
                {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>

            {showGuide && (
              <div className="mt-3 pt-3 border-t border-white/[0.08] text-slate-300 space-y-2 text-xs leading-relaxed animate-fade-in">
                {(activeCommodity === 'BEBEK_PETELUR' || activeCommodity === 'AYAM_PETELUR') && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                      <span className="font-bold text-amber-300">🥚 Grading & Rak:</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">1 Rak = 30 butir. 5 Rak = 150 butir (1 Ikat). Pisahkan Grade B (retak halus) dan Grade C (pecah) saat sortir pagi.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                      <span className="font-bold text-emerald-300">📊 Standar HDP:</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">HDP 75%–85% adalah performa stabil. Jika di bawah 65%, periksa kadar protein ransum dan ventilasi kandang.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                      <span className="font-bold text-sky-300">⚖️ FCR & Gram/Ekor:</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Bebek ideal mengonsumsi 110–120g/ekor/hari. Ayam layer 105–115g/ekor/hari. Target FCR telur 2.4 – 3.2.</p>
                    </div>
                  </div>
                )}

                {activeCommodity === 'AYAM_PEDAGING' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                      <span className="font-bold text-amber-300">🍗 Sampling Mingguan:</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Timbang minimal 50–100 ekor di 3 titik kandang berbeda (depan, tengah, belakang) sebelum waktu pakan pagi.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                      <span className="font-bold text-emerald-300">⭐ Indeks Performa (IP):</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">IP &gt; 400 adalah predikat Istimewa. IP 350–399 Sangat Baik. Nilai IP menggabungkan daya hidup, bobot, umur, dan FCR.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                      <span className="font-bold text-rose-300">🌡️ Suhu & Kelembaban:</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">DOC umur 1–7 hari butuh 31–33°C. Umur 21+ hari stabil di 24–26°C dengan kelembaban 60–70%.</p>
                    </div>
                  </div>
                )}

                {activeCommodity === 'SAPI' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                      <span className="font-bold text-teal-300">🥛 Sapi Perah:</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Waktu perahan teratur pukul 05:00 pagi dan 15:00 sore. Standar Berat Jenis susu segar &gt; 1.028.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                      <span className="font-bold text-amber-300">🥩 Sapi Potong (Fattening):</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Target ADG (Average Daily Gain) sapi simental/limousin adalah 1.0 – 1.4 kg/hari dengan pakan konsentrat fermentasi.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                      <span className="font-bold text-emerald-300">🌿 Ransum Seimbang:</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Pakan hijauan segar 10% dari bobot badan + konsentrat 1.5–2% dari bobot badan setiap hari.</p>
                    </div>
                  </div>
                )}

                {activeCommodity === 'LELE' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                      <span className="font-bold text-cyan-300">🐟 Sampling Ukuran (Isi/Kg):</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Isi 12/kg = sangkal (~83g). Isi 8/kg = 125g. Isi 6–8/kg adalah ukuran ideal pasar pecel lele konsumsi.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                      <span className="font-bold text-emerald-300">🧪 Manajemen Kualitas Air:</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">pH optimal 7.0–7.8. Jika air berbusa dan bau amonia menyengat, puasakan ikan 1 sesi dan lakukan sifon dasar 20%.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.06]">
                      <span className="font-bold text-sky-300">🥣 Feeding Rate (FR):</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Berikan pelet 3%–4% dari total estimasi biomassa kolam per hari, dibagi 2–3 sesi (pagi & sore/malam).</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Master Form Card */}
          <form onSubmit={handleSubmit} className="glass-card-luxury p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/[0.08] space-y-6 relative overflow-hidden">
            {/* Top Metadata: Tanggal, Kandang/Kolam, Batch Populasi */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> Tanggal Operasional
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
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {KOMODITAS_LIST[activeCommodity].labelKandang}
                </label>
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
                  <label className="block text-xs font-bold text-slate-300">
                    Batch {KOMODITAS_LIST[activeCommodity].labelPopulasi}
                  </label>
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
                      {p.kodeBatch} ({p.jumlahSaatIni} ekor aktif)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SECTOR 1: BEBEK & AYAM PETELUR (LAYER) */}
            {(activeCommodity === 'BEBEK_PETELUR' || activeCommodity === 'AYAM_PETELUR') && (
              <div className="space-y-4">
                {/* Live Banner Preview */}
                <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-500/25 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-sm">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hasil Total Butir</p>
                    <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
                      {totalTelur.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">butir</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Setara <strong className="text-amber-400">{totalRak} Rak</strong> {sisaButir > 0 && `+ ${sisaButir} btr`}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hen-Day (HDP)</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xl sm:text-2xl font-black text-emerald-400">
                        {hdpPercentage}%
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold border ${
                        hdpPercentage >= 80 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        hdpPercentage >= 70 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {hdpPercentage >= 80 ? 'Prima' : hdpPercentage >= 70 ? 'Normal' : 'Drop'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Dari {liveDuckCount} ekor populasi</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimasi Berat Telur</p>
                    <p className="text-xl sm:text-2xl font-black text-sky-400 mt-0.5">
                      {totalBeratTelurKg} <span className="text-xs font-normal text-slate-400">kg</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">~{activeCommodity === 'AYAM_PETELUR' ? 60 : 65} gram/butir</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rasio FCR Pakan</p>
                    <p className="text-xl sm:text-2xl font-black text-indigo-400 mt-0.5">
                      {fcr}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{gramPakanPerEkor} gram / ekor / hari</p>
                  </div>
                </div>

                {/* 3 Input Cards: Grade A, Grade B, Grade C */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  {/* Grade A / Utuh */}
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-300">
                        Telur Utuh / Grade A (Butir)
                      </label>
                      <span className="text-[10px] font-semibold text-slate-400">
                        = {totalRak} Rak
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={telurUtuh === 0 ? '' : telurUtuh}
                      onChange={(e) => setTelurUtuh(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-lg font-black text-amber-300 focus:outline-none focus:border-amber-400 shadow-inner"
                      required
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setTelurUtuh((prev) => prev + 10)}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/30 active:scale-95"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        onClick={() => setTelurUtuh((prev) => prev + 30)}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/30 active:scale-95"
                      >
                        +30 (1 Rak)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTelurUtuh((prev) => prev + 150)}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/30 active:scale-95"
                      >
                        +150 (5 Rak)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTelurUtuh(0)}
                        className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      >
                        0
                      </button>
                    </div>
                  </div>

                  {/* Grade B / Retak */}
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-orange-500/30 space-y-2">
                    <label className="block text-xs font-bold text-orange-300">
                      Telur Retak / Grade B (Butir)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={telurRetak === 0 ? '' : telurRetak}
                      onChange={(e) => setTelurRetak(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-orange-500/40 rounded-xl px-3 py-2 text-lg font-black text-orange-300 focus:outline-none focus:border-orange-400 shadow-inner"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setTelurRetak((prev) => prev + 5)}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-orange-500/15 text-orange-300 border border-orange-500/25 hover:bg-orange-500/30 active:scale-95"
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        onClick={() => setTelurRetak((prev) => prev + 10)}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-orange-500/15 text-orange-300 border border-orange-500/25 hover:bg-orange-500/30 active:scale-95"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        onClick={() => setTelurRetak(0)}
                        className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      >
                        0
                      </button>
                    </div>
                  </div>

                  {/* Grade C / Rusak */}
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-rose-500/30 space-y-2">
                    <label className="block text-xs font-bold text-rose-300">
                      Telur Rusak / Pecah (Butir)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={telurRusak === 0 ? '' : telurRusak}
                      onChange={(e) => setTelurRusak(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-lg font-black text-rose-300 focus:outline-none focus:border-rose-400 shadow-inner"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setTelurRusak((prev) => prev + 1)}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/25 hover:bg-rose-500/30 active:scale-95"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => setTelurRusak((prev) => prev + 5)}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/25 hover:bg-rose-500/30 active:scale-95"
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        onClick={() => setTelurRusak(0)}
                        className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      >
                        0
                      </button>
                    </div>
                  </div>
                </div>

                {/* Populasi & Pakan Row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 sm:gap-4">
                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-rose-400 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Kematian (Ekor)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={bebekMati === 0 ? '' : bebekMati}
                      onChange={(e) => setBebekMati(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-amber-300 mb-1">
                      Afkir / Culling (Ekor)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={bebekAfkir === 0 ? '' : bebekAfkir}
                      onChange={(e) => setBebekAfkir(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Jenis Pakan Konsentrat
                    </label>
                    <select
                      value={pakanId}
                      onChange={(e) => setPakanId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium"
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

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-emerald-400">
                        Total Pakan Hari Ini (Kg)
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        ~{gramPakanPerEkor}g/ekor
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={pakanKg === 0 ? '' : pakanKg}
                      onChange={(e) => setPakanKg(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTOR 2: AYAM PEDAGING (BROILER) */}
            {activeCommodity === 'AYAM_PEDAGING' && (
              <div className="space-y-4">
                {/* Live Broiler Performance Banner */}
                <div className="bg-gradient-to-r from-red-500/15 via-amber-500/10 to-transparent p-4 rounded-2xl border border-red-500/30 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-sm">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Indeks Performa (IP)</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xl sm:text-2xl font-black text-amber-300">{ipBroiler}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold border ${
                        ipBroiler >= 400 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        ipBroiler >= 350 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        ipBroiler >= 300 ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' :
                        'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {ipBroiler >= 400 ? 'Istimewa' : ipBroiler >= 350 ? 'Sangat Baik' : ipBroiler >= 300 ? 'Baik' : 'Evaluasi'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Standar target panen &gt; 350</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bobot Rata-rata Ekor</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
                      {bobotRataKg} <span className="text-xs font-normal text-slate-400">kg ({bobotTimbangGram}g)</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">ADG: {adgGram} g/hari</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daya Hidup (Livability)</p>
                    <p className="text-xl sm:text-2xl font-black text-sky-400 mt-0.5">
                      {dayaHidupBroiler}%
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Mortalitas: {mortalitasDoc} ekor hari ini</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FCR Broiler</p>
                    <p className="text-xl sm:text-2xl font-black text-indigo-400 mt-0.5">
                      {fcrBroiler}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Fase: {umurHari <= 14 ? 'Starter' : 'Finisher'}</p>
                  </div>
                </div>

                {/* Sampling Weight & Growth Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 sm:gap-4">
                  {/* Umur Hari */}
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-300">
                        Umur Ayam (Hari ke-1 s/d 35)
                      </label>
                      <span className="text-[10px] font-bold text-emerald-400">
                        {umurHari <= 14 ? 'Fase Starter' : 'Fase Finisher'}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={umurHari}
                      onChange={(e) => setUmurHari(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-lg font-black text-amber-300"
                      required
                    />
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {[7, 14, 21, 28, 35].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setUmurHari(d)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            umurHari === d ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          H-{d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sampling Bobot */}
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-300">
                        Sampling Bobot (Gram/Ekor)
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        = {bobotRataKg} kg
                      </span>
                    </div>
                    <input
                      type="number"
                      min="40"
                      step="10"
                      value={bobotTimbangGram}
                      onChange={(e) => setBobotTimbangGram(parseInt(e.target.value) || 40)}
                      className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-lg font-black text-emerald-300"
                      required
                    />
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setBobotTimbangGram((p) => p + 50)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300"
                      >
                        +50g
                      </button>
                      <button
                        type="button"
                        onClick={() => setBobotTimbangGram((p) => p + 100)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300"
                      >
                        +100g
                      </button>
                      <button
                        type="button"
                        onClick={() => setBobotTimbangGram((p) => p + 250)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300"
                      >
                        +250g
                      </button>
                    </div>
                  </div>

                  {/* Pakan Konsumsi */}
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-sky-500/30 space-y-2">
                    <label className="block text-xs font-bold text-sky-300">
                      Pakan Hari Ini (Kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={pakanBroilerKg}
                      onChange={(e) => setPakanBroilerKg(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-sky-500/40 rounded-xl px-3 py-2 text-lg font-black text-sky-300"
                      required
                    />
                    <p className="text-[10px] text-slate-400">
                      {liveDuckCount > 0 ? Math.round((pakanBroilerKg * 1000) / liveDuckCount) : 0} gram / ekor
                    </p>
                  </div>

                  {/* Mortalitas DOC */}
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-rose-500/30 space-y-2">
                    <label className="block text-xs font-bold text-rose-300">
                      Mortalitas / Culling (Ekor)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={mortalitasDoc}
                      onChange={(e) => setMortalitasDoc(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-lg font-black text-rose-300"
                    />
                    <p className="text-[10px] text-slate-400">
                      Daya hidup: {dayaHidupBroiler}%
                    </p>
                  </div>
                </div>

                {/* Lingkungan & Panen Opsional */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 sm:gap-4">
                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Suhu Kandang (°C)
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="40"
                      value={suhuKandang}
                      onChange={(e) => setSuhuKandang(parseFloat(e.target.value) || 26)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-400" /> Kelembaban (% RH)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="90"
                      value={kelembabanKandang}
                      onChange={(e) => setKelembabanKandang(parseFloat(e.target.value) || 65)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Sampel Timbang (Ekor)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={jumlahSampelEkor}
                      onChange={(e) => setJumlahSampelEkor(parseInt(e.target.value) || 50)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-emerald-400 mb-1">
                      Panen Broiler (Kg & Ekor)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="number"
                        min="0"
                        placeholder="Kg"
                        value={totalBobotPanenKg || ''}
                        onChange={(e) => setTotalBobotPanenKg(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-bold"
                        title="Total kilogram panen"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Ekor"
                        value={ekorPanenBroiler || ''}
                        onChange={(e) => setEkorPanenBroiler(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white font-bold"
                        title="Jumlah ekor panen"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTOR 3: SAPI (PERAH & POTONG / PENGGEMUKAN) */}
            {activeCommodity === 'SAPI' && (
              <div className="space-y-4">
                {/* Sub-Sector Toggle Switcher */}
                <div className="flex items-center justify-center p-1.5 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setSubSektorSapi('PERAH')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      subSektorSapi === 'PERAH'
                        ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🥛 Sapi Perah (Produksi Susu)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubSektorSapi('POTONG')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      subSektorSapi === 'POTONG'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🥩 Sapi Potong (Penggemukan/Fattening)</span>
                  </button>
                </div>

                {/* Sub-Sektor 1: Sapi Perah */}
                {subSektorSapi === 'PERAH' ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-transparent p-4 rounded-2xl border border-teal-500/30 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-sm">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Susu Harian</p>
                        <p className="text-xl sm:text-2xl font-black text-teal-300 mt-0.5">
                          {totalSusuLiter} <span className="text-xs font-normal text-slate-400">Liter</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Pagi: {susuPagiLiter}L • Sore: {susuSoreLiter}L</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rata-rata / Sapi</p>
                        <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
                          {rataLiterPerSapi} <span className="text-xs font-normal text-slate-400">L / ekor</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Standar laktasi 12-18 L</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Berat Jenis (BJ)</p>
                        <p className="text-xl sm:text-2xl font-black text-sky-400 mt-0.5">
                          {beratJenisSusu}
                        </p>
                        <p className="text-[10px] text-emerald-400 mt-1">Kualitas Susu Murni Baik</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ransum Pakan</p>
                        <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
                          {totalPakanSapi} <span className="text-xs font-normal text-slate-400">kg</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">{pakanHijauanKg}kg rumput + {pakanKonsentratKg}kg kons</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                      <div className="bg-slate-900/70 p-4 rounded-2xl border border-teal-500/30 space-y-2">
                        <label className="block text-xs font-bold text-teal-300">
                          🌅 Perahan Susu Pagi (Liter)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={susuPagiLiter}
                          onChange={(e) => setSusuPagiLiter(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-teal-500/40 rounded-xl px-3 py-2 text-lg font-black text-teal-300"
                        />
                      </div>

                      <div className="bg-slate-900/70 p-4 rounded-2xl border border-teal-500/30 space-y-2">
                        <label className="block text-xs font-bold text-teal-300">
                          🌇 Perahan Susu Sore (Liter)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={susuSoreLiter}
                          onChange={(e) => setSusuSoreLiter(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-teal-500/40 rounded-xl px-3 py-2 text-lg font-black text-teal-300"
                        />
                      </div>

                      <div className="bg-slate-900/70 p-4 rounded-2xl border border-sky-500/30 space-y-2">
                        <label className="block text-xs font-bold text-sky-300">
                          Uji Berat Jenis (BJ Standar 1.028)
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={beratJenisSusu}
                          onChange={(e) => setBeratJenisSusu(parseFloat(e.target.value) || 1.028)}
                          className="w-full bg-slate-950 border border-sky-500/40 rounded-xl px-3 py-2 text-lg font-black text-sky-300"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Sub-Sektor 2: Sapi Potong (Fattening) */
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent p-4 rounded-2xl border border-amber-500/30 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-sm">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bobot Timbang Sapi</p>
                        <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
                          {bobotSapiKg} <span className="text-xs font-normal text-slate-400">kg</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Kategori: Siap Penggemukan</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target ADG</p>
                        <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
                          {adgSapiKg} <span className="text-xs font-normal text-slate-400">kg / hari</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Standar target 1.0 - 1.4 kg/hr</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skor Kondisi Tubuh (BCS)</p>
                        <p className="text-xl sm:text-2xl font-black text-sky-400 mt-0.5">
                          BCS {bcsScore} <span className="text-xs font-normal text-slate-400">/ 5</span>
                        </p>
                        <p className="text-[10px] text-emerald-400 mt-1">Ideal Proporsional</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pakan Ransum</p>
                        <p className="text-xl sm:text-2xl font-black text-teal-300 mt-0.5">
                          {totalPakanSapi} <span className="text-xs font-normal text-slate-400">kg</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Konsentrat Tinggi Protein</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                      <div className="bg-slate-900/70 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                        <label className="block text-xs font-bold text-amber-300">
                          ⚖️ Penimbangan Bobot Sapi (Kg)
                        </label>
                        <input
                          type="number"
                          min="100"
                          step="5"
                          value={bobotSapiKg}
                          onChange={(e) => setBobotSapiKg(parseInt(e.target.value) || 100)}
                          className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-lg font-black text-amber-300"
                        />
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setBobotSapiKg((p) => p + 10)}
                            className="px-2 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300 font-bold"
                          >
                            +10 kg
                          </button>
                          <button
                            type="button"
                            onClick={() => setBobotSapiKg((p) => p + 25)}
                            className="px-2 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300 font-bold"
                          >
                            +25 kg
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-900/70 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                        <label className="block text-xs font-bold text-emerald-300">
                          Kenaikan Bobot Harian (ADG kg/hari)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={adgSapiKg}
                          onChange={(e) => setAdgSapiKg(parseFloat(e.target.value) || 1.0)}
                          className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-lg font-black text-emerald-300"
                        />
                      </div>

                      <div className="bg-slate-900/70 p-4 rounded-2xl border border-sky-500/30 space-y-2">
                        <label className="block text-xs font-bold text-sky-300">
                          Skor Tubuh (BCS 1-5)
                        </label>
                        <select
                          value={bcsScore}
                          onChange={(e) => setBcsScore(parseInt(e.target.value) || 3)}
                          className="w-full bg-slate-950 border border-sky-500/40 rounded-xl px-3 py-2.5 text-sm text-white font-bold"
                        >
                          <option value="1">1 - Kurus (Tulang Rusuk Menonjol)</option>
                          <option value="2">2 - Agak Kurus</option>
                          <option value="3">3 - Ideal / Standar Penggemukan</option>
                          <option value="4">4 - Gemuk Padat (Siap Jual Kurban/RPH)</option>
                          <option value="5">5 - Sangat Gemuk</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sapi Pakan & Catatan Medis */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-emerald-400 mb-1">
                      Pakan Hijauan / Rumput (Kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pakanHijauanKg}
                      onChange={(e) => setPakanHijauanKg(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-amber-300 mb-1">
                      Pakan Konsentrat / Ampas (Kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pakanKonsentratKg}
                      onChange={(e) => setPakanKonsentratKg(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-sky-400 mb-1">
                      Catatan Medis & Reproduksi
                    </label>
                    <input
                      type="text"
                      value={catatanKesehatan}
                      onChange={(e) => setCatatanKesehatan(e.target.value)}
                      placeholder="Vaksin PMK / Inseminasi / Sehat"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTOR 4: BUDIDAYA IKAN LELE (BIOFLOK & TERPAL) */}
            {activeCommodity === 'LELE' && (
              <div className="space-y-4">
                {/* Live Aquaculture Preview Banner */}
                <div className="bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent p-4 rounded-2xl border border-cyan-500/30 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-sm">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimasi Biomassa Kolam</p>
                    <p className="text-xl sm:text-2xl font-black text-cyan-300 mt-0.5">
                      {biomassaLeleKg.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">kg</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Populasi kolam: {liveDuckCount} ekor</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sampling Ukuran</p>
                    <p className="text-xl sm:text-2xl font-black text-sky-400 mt-0.5">
                      Isi {samplingIsiPerKg} <span className="text-xs font-normal text-slate-400">/ kg</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">~{rataBobotLeleGram} gram / ekor</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feeding Rate (FR %)</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
                      {feedingRatePercent}%
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Target harian 3% - 4% biomassa</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kualitas Air Kolam</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xl sm:text-2xl font-black text-amber-300">pH {phAir}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {phAir >= 7.0 && phAir <= 7.8 ? 'Ideal' : 'Perlu Cek'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Suhu: {suhuAir}°C</p>
                  </div>
                </div>

                {/* Pelet & Sampling Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 sm:gap-4">
                  {/* Pakan Pelet */}
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-cyan-300">
                        Pakan Pelet Hari Ini (Kg)
                      </label>
                      <span className="text-[10px] text-slate-400">FR: {feedingRatePercent}%</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={pakanPeletKg}
                      onChange={(e) => setPakanPeletKg(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-3 py-2 text-lg font-black text-cyan-300"
                      required
                    />
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setPakanPeletKg((p) => p + 5)}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300"
                      >
                        +5 kg
                      </button>
                      <button
                        type="button"
                        onClick={() => setPakanPeletKg((p) => p + 10)}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300"
                      >
                        +10 kg
                      </button>
                    </div>
                  </div>

                  {/* Sampling Size */}
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-sky-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-sky-300">
                        Sampling Size (Isi Ekor/Kg)
                      </label>
                      <span className="text-[10px] text-slate-400">~{rataBobotLeleGram}g</span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={samplingIsiPerKg}
                      onChange={(e) => setSamplingIsiPerKg(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-sky-500/40 rounded-xl px-3 py-2 text-lg font-black text-sky-300"
                      required
                    />
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {[12, 10, 8, 6].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSamplingIsiPerKg(sz)}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                            samplingIsiPerKg === sz ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          Isi {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kematian Ikan */}
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-rose-500/30 space-y-2">
                    <label className="block text-xs font-bold text-rose-300">
                      Kematian Ikan (Ekor)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={kematianIkan}
                      onChange={(e) => setKematianIkan(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-lg font-black text-rose-300"
                    />
                    <p className="text-[10px] text-slate-400">SR: {srLele}%</p>
                  </div>

                  {/* Panen Sortir */}
                  <div className="bg-slate-900/70 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                    <label className="block text-xs font-bold text-emerald-300">
                      Panen Sortir Kolam (Kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0 jika tidak panen"
                      value={panenSortirKg || ''}
                      onChange={(e) => setPanenSortirKg(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-lg font-black text-emerald-300"
                    />
                    <p className="text-[10px] text-slate-400">Sortir konsumsi lapak</p>
                  </div>
                </div>

                {/* Kualitas Air & Treatment Kolam */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 sm:gap-4">
                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      pH Air Kolam (Ideal 7.0–7.8)
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="11"
                      step="0.1"
                      value={phAir}
                      onChange={(e) => setPhAir(parseFloat(e.target.value) || 7.2)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Suhu Air Kolam (°C)
                    </label>
                    <input
                      type="number"
                      min="20"
                      max="38"
                      value={suhuAir}
                      onChange={(e) => setSuhuAir(parseFloat(e.target.value) || 28)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Kondisi Visual Air Kolam
                    </label>
                    <select
                      value={kondisiAir}
                      onChange={(e) => setKondisiAir(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium"
                    >
                      <option value="Coklat Matang (Bioflok Produktif)">🟤 Coklat Matang (Bioflok Produktif, Flok Aktif)</option>
                      <option value="Hijau Segar (Alami & Sehat)">🟢 Hijau Segar (Alami & Fitoplankton Sehat)</option>
                      <option value="Berbusa / Bau Amonia">🟡 Berbusa / Bau Amonia (Perlu Kurangi Pakan & Tambah Aerasi)</option>
                      <option value="Keruh Menggantung (Perlu Kuras)">🔴 Keruh Menggantung (Perlu Sifon Dasar & Kuras 20%)</option>
                    </select>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Treatment / Probiotik
                    </label>
                    <select
                      value={treatmentAir}
                      onChange={(e) => setTreatmentAir(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium"
                    >
                      <option value="Rutin Probiotik EM4">Rutin Probiotik EM4</option>
                      <option value="Garam Krosok (Antijamur)">Garam Krosok</option>
                      <option value="Molase / Tetes Tebu">Molase / Tetes Tebu</option>
                      <option value="Sifon Kuras Air">Sifon Kuras Air</option>
                    </select>
                  </div>
                </div>

                {/* Jadwal Makan & Tipe Pelet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Jadwal Pemberian Pakan
                    </label>
                    <select
                      value={pakanWaktu}
                      onChange={(e) => setPakanWaktu(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium"
                    >
                      <option value="Pagi & Sore">🌅 Pagi (08:00) & Sore (17:00) - Standar</option>
                      <option value="Pagi, Siang & Sore">☀️ Pagi, Siang & Sore (3 Sesi Percepatan)</option>
                      <option value="Sore & Malam">🌙 Sore & Malam (2 Sesi Nokturnal)</option>
                    </select>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Tipe & Ukuran Pelet
                    </label>
                    <select
                      value={tipePelet}
                      onChange={(e) => setTipePelet(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium"
                    >
                      <option value="Pelet Apung -1 (Bibit)">Pelet Apung -1 (Bibit 5-7 cm)</option>
                      <option value="Pelet Apung -2 (Remaja)">Pelet Apung -2 (Remaja / Sangkal)</option>
                      <option value="Pelet Apung -3 / 781 (Konsumsi)">Pelet Apung -3 / 781 (Konsumsi Siap Panen)</option>
                      <option value="Pelet Tenggelam Alternatif">Pelet Tenggelam Alternatif</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Catatan Tambahan */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Catatan Tambahan (Kondisi Cuaca, Nafsu Makan, Treatment Medis)
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tuliskan catatan harian (misal: cuaca hujan sore hari, nafsu makan pakan habis dalam 10 menit, dsb)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white font-medium focus:ring-2 focus:ring-amber-500 shadow-inner"
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>Simpan Pencatatan Harian ({KOMODITAS_LIST[activeCommodity].nama})</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 2: Tabel History Panen / Operasional */}
      {activeTab === 'table' && (
        <div className="glass-card-luxury p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/[0.08] space-y-4">
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
                          <td className="px-4 py-3">{log.pakanKg || 65} kg</td>
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
                          <td className="px-4 py-3 text-teal-400">{log.susuPagiLiter || 16} L</td>
                          <td className="px-4 py-3 text-teal-400">{log.susuSoreLiter || 12} L</td>
                          <td className="px-4 py-3 text-emerald-400 font-black">{log.totalSusuLiter || 28} Liter</td>
                          <td className="px-4 py-3 text-amber-300 font-bold">{log.bobotSapiKg || 465} kg</td>
                          <td className="px-4 py-3 text-slate-300">{log.pakanHijauanKg || 40} kg</td>
                          <td className="px-4 py-3 text-slate-300">{log.pakanKonsentratKg || 8} kg</td>
                          <td className="px-4 py-3 text-sky-400 truncate max-w-[120px]">{log.catatanKesehatan || 'Sehat'}</td>
                        </>
                      )}

                      {/* Lele Cells */}
                      {activeCommodity === 'LELE' && (
                        <>
                          <td className="px-4 py-3 text-cyan-400 font-bold">{log.pakanPeletKg || log.pakanKg || 25} kg</td>
                          <td className="px-4 py-3 text-sky-400">Isi {log.samplingIsiPerKg || 8}/kg</td>
                          <td className="px-4 py-3 text-slate-300 font-bold">~{log.ukuranSamplingGram || 125} g</td>
                          <td className="px-4 py-3 text-rose-400">{log.bebekMati || 0} ekor</td>
                          <td className="px-4 py-3 text-emerald-400 font-bold">{log.bobotPanenIkanKg ? `${log.bobotPanenIkanKg} kg` : '-'}</td>
                          <td className="px-4 py-3 text-amber-300">{log.kondisiAir || 'Bioflok Produktif'}</td>
                        </>
                      )}

                      <td className="px-4 py-3 text-right sticky right-0 bg-slate-950/95 backdrop-blur shadow-[-4px_0_12px_rgba(0,0,0,0.6)] z-10">
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenKasir && (
                            <button
                              onClick={onOpenKasir}
                              className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-[11px] border border-amber-500/30 transition-all"
                              title="Jual Hasil ke Kasir POS"
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
        <div className="glass-card-luxury p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/[0.08] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                Inventaris Pakan & Nutrisi ({KOMODITAS_LIST[activeCommodity].nama})
              </h3>
              <p className="text-xs text-slate-400">
                Kelola persediaan ransum, konsentrat, dan pakan harian peternakan Anda.
              </p>
            </div>
            <button
              onClick={() => setShowPakanForm(!showPakanForm)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              {showPakanForm ? 'Tutup Form' : '+ Tambah Jenis Pakan'}
            </button>
          </div>

          {/* Form Tambah Pakan Baru */}
          {showPakanForm && (
            <form onSubmit={handleAddPakanSubmit} className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-700 space-y-3.5 text-xs animate-fade-in">
              <h4 className="font-bold text-amber-400 text-sm">Form Tambah Jenis Pakan Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Pakan</label>
                  <input
                    type="text"
                    placeholder={
                      activeCommodity === 'AYAM_PEDAGING' ? 'Pakan Starter Broiler B-01' :
                      activeCommodity === 'LELE' ? 'Pelet Apung Lele -2' :
                      activeCommodity === 'SAPI' ? 'Konsentrat Penggemukan Sapi' :
                      'Konsentrat Bebek Petelur K-99'
                    }
                    value={namaPakanBaru}
                    onChange={(e) => setNamaPakanBaru(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Merk / Produsen</label>
                  <input
                    type="text"
                    placeholder="Contoh: Cargill / Japfa / Pokphand / Lokal"
                    value={merkPakanBaru}
                    onChange={(e) => setMerkPakanBaru(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stok Awal (Kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={stokKgBaru}
                    onChange={(e) => setStokKgBaru(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-bold"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-bold"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
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
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 active:scale-95 transition-all"
                >
                  Simpan Pakan Baru
                </button>
              </div>
            </form>
          )}

          {/* Grid Daftar Pakan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pakanList.length === 0 ? (
              <div className="col-span-full py-10 px-4 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-slate-400">
                <AlertTriangle className="w-8 h-8 text-amber-500/60 mx-auto mb-2" />
                <p className="font-semibold text-slate-200">Belum Ada Jenis Pakan yang Tersimpan</p>
                <p className="text-xs text-slate-500 mt-1">
                  Klik tombol &quot;+ Tambah Jenis Pakan&quot; di atas untuk mendaftarkan pakan harian.
                </p>
              </div>
            ) : (
              pakanList.map((pakan) => (
                <div key={pakan.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-amber-400 text-sm truncate max-w-[170px]">{pakan.namaPakan}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{pakan.merk}</span>
                  </div>
                  <p className="text-2xl font-black text-white">
                    {pakan.stokKg.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">kg tersisa</span>
                  </p>
                  <p className="text-xs text-slate-400">Harga per kg: Rp {pakan.hargaPerKg.toLocaleString('id-ID')}</p>
                  
                  {confirmDeleteId === pakan.id ? (
                    <div className="pt-2 border-t border-rose-900/40 bg-rose-950/30 p-2.5 rounded-lg space-y-2">
                      <p className="text-xs font-semibold text-rose-300">Yakin hapus pakan ini?</p>
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

      {/* MODAL EDIT CATATAN OPERASIONAL */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Catatan Operasional</h3>
                  <p className="text-xs text-slate-400">Perbarui data panen, pakan, dan mortalitas.</p>
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
                  <label className="block text-slate-300 font-semibold mb-1">Kandang</label>
                  <select
                    value={editKandangId}
                    onChange={(e) => setEditKandangId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {kandangList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.namaKandang}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Batch Populasi</label>
                  <select
                    value={editPopulasiId}
                    onChange={(e) => setEditPopulasiId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {populasiList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.kodeBatch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(activeCommodity === 'BEBEK_PETELUR' || activeCommodity === 'AYAM_PETELUR') && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-amber-400 font-semibold mb-1">Grade A (Utuh)</label>
                    <input
                      type="number"
                      value={editTelurUtuh}
                      onChange={(e) => setEditTelurUtuh(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-orange-400 font-semibold mb-1">Grade B (Retak)</label>
                    <input
                      type="number"
                      value={editTelurRetak}
                      onChange={(e) => setEditTelurRetak(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-rose-400 font-semibold mb-1">Grade C (Pecah)</label>
                    <input
                      type="number"
                      value={editTelurRusak}
                      onChange={(e) => setEditTelurRusak(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-rose-400 font-semibold mb-1">Mortalitas (Ekor)</label>
                  <input
                    type="number"
                    value={editBebekMati}
                    onChange={(e) => setEditBebekMati(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Pakan (Kg)</label>
                  <input
                    type="number"
                    value={editPakanKg}
                    onChange={(e) => setEditPakanKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jenis Pakan</label>
                  <select
                    value={editPakanId}
                    onChange={(e) => setEditPakanId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {pakanList.map((p) => (
                      <option key={p.id} value={p.id}>{p.namaPakan}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={editCatatan}
                  onChange={(e) => setEditCatatan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT DATA PAKAN */}
      {editingPakan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-amber-400" />
                Edit Master Data Pakan
              </h3>
              <button
                type="button"
                onClick={() => setEditingPakan(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPakan} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Pakan</label>
                <input
                  type="text"
                  value={editNamaPakan}
                  onChange={(e) => setEditNamaPakan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Merk / Pabrikan</label>
                  <input
                    type="text"
                    value={editMerkPakan}
                    onChange={(e) => setEditMerkPakan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stok Tersedia (Kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={editStokKg}
                    onChange={(e) => setEditStokKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Harga Per Kg (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={editHargaPerKg}
                    onChange={(e) => setEditHargaPerKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Batas Minimum Peringatan (Kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={editMinStokKg}
                    onChange={(e) => setEditMinStokKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPakan(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400"
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
