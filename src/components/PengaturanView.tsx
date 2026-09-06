import React, { useState, useEffect } from 'react';
import { RefreshCw, PlusCircle, CheckCircle2, BookOpen, Trash2, Layers, Download, Database, Bot, ExternalLink, HardDrive, Bell, Pencil, X } from 'lucide-react';
import type { Kandang, PopulasiBebek, KodeAkun, StatusPopulasi, TipeAkun, SaldoNormal } from '../types';
import { StorageService } from '../services/storage';

import { useToast } from './ToastContainer';

interface PengaturanViewProps {
  kandangList: Kandang[];
  populasiList: PopulasiBebek[];
  kodeAkunList: KodeAkun[];
  onRefreshData: () => void;
  onResetZero: () => void;
  onResetDemo: () => void;
  onOpenNotifikasi?: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  kandangList,
  populasiList,
  kodeAkunList,
  onRefreshData,
  onResetZero,
  onResetDemo,
  onOpenNotifikasi,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'kandang' | 'populasi' | 'coa' | 'database'>('database');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<any>(null);

  useEffect(() => {
    StorageService.getServerStatus().then(st => setServerStatus(st));
  }, []);

  // Form for New Kandang
  const [namaKandang, setNamaKandang] = useState('');
  const [kapasitas, setKapasitas] = useState(500);

  // Form for New Populasi
  const [showPopulasiForm, setShowPopulasiForm] = useState(false);
  const [popKandangId, setPopKandangId] = useState(kandangList[0]?.id || 'k-1');
  const [kodeBatch, setKodeBatch] = useState('');
  const [tglMasuk, setTglMasuk] = useState(new Date().toISOString().split('T')[0]);
  const [jumlahAwal, setJumlahAwal] = useState<number>(500);
  const [hargaBeliPerEkor, setHargaBeliPerEkor] = useState<number>(75000);
  const [umurMinggu, setUmurMinggu] = useState<number>(20);
  const [statusPopulasi, setStatusPopulasi] = useState<StatusPopulasi>('PRODUKTIF');

  // Form for New COA
  const [showCoaForm, setShowCoaForm] = useState(false);
  const [kodeAkunInput, setKodeAkunInput] = useState('');
  const [namaAkunInput, setNamaAkunInput] = useState('');
  const [tipeAkunInput, setTipeAkunInput] = useState<TipeAkun>('EXPENSE');
  const [saldoNormalInput, setSaldoNormalInput] = useState<SaldoNormal>('DEBIT');

  const handleExportJSON = () => {
    try {
      StorageService.exportAllDataJSON();
      showToast('File backup database .json berhasil di-download!', 'success');
    } catch (err: any) {
      showToast(`Gagal export JSON: ${err.message}`, 'error');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        StorageService.importAllDataJSON(json);
        onRefreshData();
        showToast('Database berhasil dipulihkan dari file backup JSON!', 'success', 'Restore Selesai');
      } catch (err: any) {
        showToast(`Gagal restore file JSON: ${err.message}`, 'error', 'Format Tidak Valid');
      }
    };
    reader.readAsText(file);
  };

  const handleForceSync = async () => {
    await StorageService.syncToBackend();
    showToast('Semua data berhasil disinkronkan ke Hard Disk!', 'success');
  };


  const handleAddKandang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKandang.trim()) return;

    const newKandang: Kandang = {
      id: `k-${Date.now()}`,
      namaKandang,
      kapasitas,
      status: 'AKTIF',
    };

    StorageService.saveKandang([...kandangList, newKandang]);
    setSuccessMsg('Kandang Baru Berhasil Ditambahkan!');
    setNamaKandang('');
    onRefreshData();

    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const handleAddPopulasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kodeBatch.trim() || jumlahAwal <= 0) {
      alert('Mohon isi kode batch dan jumlah ekor bebek!');
      return;
    }

    StorageService.addPopulasi({
      kandangId: popKandangId,
      kodeBatch,
      tglMasuk,
      jumlahAwal,
      jumlahSaatIni: jumlahAwal,
      hargaBeliPerEkor,
      umurMinggu,
      status: statusPopulasi,
    });

    setSuccessMsg(`Batch Populasi ${kodeBatch} Berhasil Ditambahkan!`);
    onRefreshData();
    setShowPopulasiForm(false);
    setKodeBatch('');
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const handleAddCoa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kodeAkunInput.trim() || !namaAkunInput.trim()) {
      alert('Mohon isi kode akun dan nama akun!');
      return;
    }

    StorageService.addKodeAkun({
      kode: kodeAkunInput,
      nama: namaAkunInput,
      tipe: tipeAkunInput,
      saldoNormal: saldoNormalInput,
    });

    setSuccessMsg(`Kode Akun [${kodeAkunInput}] ${namaAkunInput} Berhasil Ditambahkan!`);
    onRefreshData();
    setShowCoaForm(false);
    setKodeAkunInput('');
    setNamaAkunInput('');
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  // Edit Kandang State
  const [editingKandang, setEditingKandang] = useState<Kandang | null>(null);
  const [editNamaKandang, setEditNamaKandang] = useState('');
  const [editKapasitasKandang, setEditKapasitasKandang] = useState(500);
  const [editStatusKandang, setEditStatusKandang] = useState<'AKTIF' | 'ISTIRAHAT' | 'PERAWATAN'>('AKTIF');
  const [editCatatanKandang, setEditCatatanKandang] = useState('');

  // Edit Populasi State
  const [editingPopulasi, setEditingPopulasi] = useState<PopulasiBebek | null>(null);
  const [editPopKandangId, setEditPopKandangId] = useState('');
  const [editPopKodeBatch, setEditPopKodeBatch] = useState('');
  const [editPopJumlahSaatIni, setEditPopJumlahSaatIni] = useState(500);
  const [editPopJumlahAwal, setEditPopJumlahAwal] = useState(500);
  const [editPopUmurMinggu, setEditPopUmurMinggu] = useState(20);
  const [editPopStatus, setEditPopStatus] = useState<StatusPopulasi>('PRODUKTIF');
  const [editPopHargaBeli, setEditPopHargaBeli] = useState(75000);

  // Delete confirmation states
  const [confirmDeleteKandangId, setConfirmDeleteKandangId] = useState<string | null>(null);
  const [confirmDeletePopulasiId, setConfirmDeletePopulasiId] = useState<string | null>(null);

  const handleConfirmDeleteKandang = (id: string) => {
    StorageService.deleteKandang(id);
    showToast('Kandang berhasil dihapus permanen', 'info');
    setConfirmDeleteKandangId(null);
    onRefreshData();
  };

  const handleStartEditKandang = (k: Kandang) => {
    setEditingKandang(k);
    setEditNamaKandang(k.namaKandang);
    setEditKapasitasKandang(k.kapasitas);
    setEditStatusKandang(k.status);
    setEditCatatanKandang(k.catatan || '');
  };

  const handleSaveEditKandang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKandang) return;
    if (!editNamaKandang.trim()) {
      showToast('Nama kandang tidak boleh kosong!', 'warning');
      return;
    }
    StorageService.updateKandang({
      ...editingKandang,
      namaKandang: editNamaKandang,
      kapasitas: editKapasitasKandang,
      status: editStatusKandang,
      catatan: editCatatanKandang,
    });
    showToast(`Kandang ${editNamaKandang} berhasil diperbarui!`, 'success');
    setEditingKandang(null);
    onRefreshData();
  };

  const handleConfirmDeletePopulasi = (id: string) => {
    StorageService.deletePopulasi(id);
    showToast('Batch populasi berhasil dihapus permanen', 'info');
    setConfirmDeletePopulasiId(null);
    onRefreshData();
  };

  const handleStartEditPopulasi = (pop: PopulasiBebek) => {
    setEditingPopulasi(pop);
    setEditPopKandangId(pop.kandangId);
    setEditPopKodeBatch(pop.kodeBatch);
    setEditPopJumlahSaatIni(pop.jumlahSaatIni);
    setEditPopJumlahAwal(pop.jumlahAwal);
    setEditPopUmurMinggu(pop.umurMinggu);
    setEditPopStatus(pop.status);
    setEditPopHargaBeli(pop.hargaBeliPerEkor);
  };

  const handleSaveEditPopulasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPopulasi) return;
    if (!editPopKodeBatch.trim()) {
      showToast('Kode batch tidak boleh kosong!', 'warning');
      return;
    }
    StorageService.updatePopulasi({
      ...editingPopulasi,
      kandangId: editPopKandangId,
      kodeBatch: editPopKodeBatch,
      jumlahSaatIni: editPopJumlahSaatIni,
      jumlahAwal: editPopJumlahAwal,
      umurMinggu: editPopUmurMinggu,
      status: editPopStatus,
      hargaBeliPerEkor: editPopHargaBeli,
    });
    showToast(`Batch populasi ${editPopKodeBatch} berhasil diperbarui!`, 'success');
    setEditingPopulasi(null);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-amber-400" />
            Pengaturan Master Data & Kandang
          </h2>
          <p className="text-xs text-slate-400">
            Kelola unit kandang, batch populasi bebek, dan bagan akun akuntansi (Chart of Accounts).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('kandang')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'kandang' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
              }`}
            >
              Kandang ({kandangList.length})
            </button>
            <button
              onClick={() => setActiveTab('populasi')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'populasi' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
              }`}
            >
              Populasi ({populasiList.length})
            </button>
            <button
              onClick={() => setActiveTab('coa')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'coa' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
              }`}
            >
              Chart of Accounts ({kodeAkunList.length})
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'database' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Database & Bot
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetZero}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/20 flex items-center gap-1"
              title="Kosongkan seluruh data ke 0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Mulai dari 0
            </button>
            <button
              onClick={onResetDemo}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700"
              title="Muat Data Contoh Demo (30 Hari)"
            >
              Muat Data Demo
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {successMsg}
        </div>
      )}

      {/* TAB 4: Database & Bot Integrasi */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database Persistence Status */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Status Penyimpanan Data Permanen</h3>
                  <p className="text-xs text-slate-400">Penyimpanan Terpusat Hard Disk (Bukan Hanya Browser)</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status Server Database:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {serverStatus?.online ? 'Online & Aktif' : 'Tersinkronisasi'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Lokasi File Database:</span>
                  <span className="font-mono text-amber-400 text-[11px]">server/data/farm_database.json</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Auto-Backup:</span>
                  <span className="font-bold text-slate-200">Aktif Harian (server/data/backups/)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleForceSync}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  Simpan & Sync Disk
                </button>
                <button
                  onClick={handleExportJSON}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Backup (.JSON)
                </button>
              </div>

              {/* Restore JSON File Uploader */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  📥 Restore Database dari File Backup (.json):
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Telegram Bot Integration Card */}
            <div className="glass-panel p-5 rounded-2xl border border-sky-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Integrasi Bot Telegram</h3>
                  <p className="text-xs text-slate-400">Pencatatan Panen & Keuangan dari HP</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Username Bot:</span>
                  <span className="font-mono font-bold text-sky-400">@bebekpetelur_bot</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status Bot:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Aktif (Long-Polling Terhubung)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">AI Engine:</span>
                  <span className="font-bold text-amber-400">Google Gemini Flash</span>
                </div>
              </div>

              <a
                href="https://t.me/bebekpetelur_bot"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka & Uji Chat Bot Telegram
              </a>
            </div>

            {/* Mobile App & Daily Notification Card */}
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-4 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pengingat Panen Otomatis di HP</h3>
                  <p className="text-xs text-slate-400">Jadwal Notifikasi Pukul 07:00 & 08:00 Pagi</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Jadwal Pengingat 1:</span>
                  <span className="font-bold text-amber-400">🌅 Pukul 07:00 Pagi (Waktu Panen)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Jadwal Pengingat 2:</span>
                  <span className="font-bold text-rose-400">⏰ Pukul 08:00 Pagi (Follow-up)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Format Aplikasi:</span>
                  <span className="font-bold text-emerald-400">Progressive Web App (PWA Mobile)</span>
                </div>
              </div>

              {onOpenNotifikasi && (
                <button
                  onClick={onOpenNotifikasi}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Bell className="w-3.5 h-3.5" />
                  Atur & Uji Coba Notifikasi Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Kandang */}
      {activeTab === 'kandang' && (

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-400" />
              Tambah Kandang Baru
            </h3>
            <form onSubmit={handleAddKandang} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Kandang</label>
                <input
                  type="text"
                  placeholder="Contoh: Kandang Delta (Selatan)"
                  value={namaKandang}
                  onChange={(e) => setNamaKandang(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kapasitas (Ekor)</label>
                <input
                  type="number"
                  value={kapasitas}
                  onChange={(e) => setKapasitas(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                + Simpan Kandang
              </button>
            </form>
          </div>

          <div className="md:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Daftar Kandang Terdaftar</h3>
            <div className="space-y-2">
              {kandangList.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">Belum ada unit kandang terdaftar.</p>
              ) : (
                kandangList.map((k) => (
                  <div key={k.id} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">{k.namaKandang}</p>
                      <p className="text-xs text-slate-400">Kapasitas Maksimal: {k.kapasitas} ekor</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {k.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartEditKandang(k)}
                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                        title="Edit Kandang"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {confirmDeleteKandangId === k.id ? (
                        <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-700/60 p-1 rounded-lg">
                          <span className="text-[10px] text-rose-300 font-semibold px-1">Hapus?</span>
                          <button
                            type="button"
                            onClick={() => handleConfirmDeleteKandang(k.id)}
                            className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
                          >
                            Ya
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteKandangId(null)}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] hover:bg-slate-700 transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteKandangId(k.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Hapus Kandang Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Populasi */}
      {activeTab === 'populasi' && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Batch Populasi Bebek Petelur
            </h3>
            <button
              onClick={() => setShowPopulasiForm(!showPopulasiForm)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {showPopulasiForm ? 'Tutup Form' : '+ Tambah Batch Populasi'}
            </button>
          </div>

          {/* Form Input Batch Populasi */}
          {showPopulasiForm && (
            <form onSubmit={handleAddPopulasi} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-3 text-xs">
              <h4 className="font-bold text-amber-400 text-sm">Input Batch Populasi Bebek Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kandang</label>
                  <select
                    value={popKandangId}
                    onChange={(e) => setPopKandangId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    {kandangList.map((k) => (
                      <option key={k.id} value={k.id}>{k.namaKandang}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kode Batch</label>
                  <input
                    type="text"
                    placeholder="Contoh: BATCH-2026-A1"
                    value={kodeBatch}
                    onChange={(e) => setKodeBatch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tanggal Masuk</label>
                  <input
                    type="date"
                    value={tglMasuk}
                    onChange={(e) => setTglMasuk(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jumlah Ekor Bebek</label>
                  <input
                    type="number"
                    min="1"
                    value={jumlahAwal}
                    onChange={(e) => setJumlahAwal(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Harga Beli / Ekor (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={hargaBeliPerEkor}
                    onChange={(e) => setHargaBeliPerEkor(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Umur Bebek (Minggu)</label>
                  <input
                    type="number"
                    min="1"
                    value={umurMinggu}
                    onChange={(e) => setUmurMinggu(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status Populasi</label>
                  <select
                    value={statusPopulasi}
                    onChange={(e) => setStatusPopulasi(e.target.value as StatusPopulasi)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="PRODUKTIF">PRODUKTIF</option>
                    <option value="PEMBESARAN">PEMBESARAN</option>
                    <option value="AFKIR">AFKIR</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPopulasiForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Simpan Batch Populasi
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-800 text-xs">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="px-4 py-3">Kode Batch</th>
                  <th className="px-4 py-3">Tgl Masuk</th>
                  <th className="px-4 py-3">Jumlah Awal</th>
                  <th className="px-4 py-3 font-bold text-white">Jumlah Saat Ini</th>
                  <th className="px-4 py-3">Umur</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {populasiList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                      Belum ada batch populasi terdaftar.
                    </td>
                  </tr>
                ) : (
                  populasiList.map((pop) => (
                    <tr key={pop.id}>
                      <td className="px-4 py-3 font-bold text-amber-400">{pop.kodeBatch}</td>
                      <td className="px-4 py-3">{pop.tglMasuk}</td>
                      <td className="px-4 py-3">{pop.jumlahAwal} ekor</td>
                      <td className="px-4 py-3 font-extrabold text-emerald-400">{pop.jumlahSaatIni} ekor</td>
                      <td className="px-4 py-3">{pop.umurMinggu} minggu</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                          {pop.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditPopulasi(pop)}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                            title="Edit Batch Populasi"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {confirmDeletePopulasiId === pop.id ? (
                            <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-700/60 p-1 rounded-lg">
                              <span className="text-[10px] text-rose-300 font-semibold px-1">Hapus?</span>
                              <button
                                type="button"
                                onClick={() => handleConfirmDeletePopulasi(pop.id)}
                                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
                              >
                                Ya
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePopulasiId(null)}
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] hover:bg-slate-700 transition-colors"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeletePopulasiId(pop.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="Hapus Populasi Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Chart of Accounts */}
      {activeTab === 'coa' && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Chart of Accounts (Daftar Akun Akuntansi Standar)
            </h3>
            <button
              onClick={() => setShowCoaForm(!showCoaForm)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {showCoaForm ? 'Tutup Form' : '+ Tambah Kode Akun'}
            </button>
          </div>

          {/* Form Input Kode Akun */}
          {showCoaForm && (
            <form onSubmit={handleAddCoa} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-3 text-xs">
              <h4 className="font-bold text-amber-400 text-sm">Input Kode Akun Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kode Akun</label>
                  <input
                    type="text"
                    placeholder="Contoh: 507"
                    value={kodeAkunInput}
                    onChange={(e) => setKodeAkunInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nama Akun</label>
                  <input
                    type="text"
                    placeholder="Contoh: Beban Transportasi & Distribusi"
                    value={namaAkunInput}
                    onChange={(e) => setNamaAkunInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tipe Akun</label>
                  <select
                    value={tipeAkunInput}
                    onChange={(e) => setTipeAkunInput(e.target.value as TipeAkun)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="ASSET">ASSET</option>
                    <option value="LIABILITY">LIABILITY</option>
                    <option value="EQUITY">EQUITY</option>
                    <option value="REVENUE">REVENUE</option>
                    <option value="EXPENSE">EXPENSE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Saldo Normal</label>
                  <select
                    value={saldoNormalInput}
                    onChange={(e) => setSaldoNormalInput(e.target.value as SaldoNormal)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="DEBIT">DEBIT</option>
                    <option value="KREDIT">KREDIT</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCoaForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Simpan Kode Akun
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-800 text-xs">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="px-4 py-3">Kode Akun</th>
                  <th className="px-4 py-3">Nama Akun</th>
                  <th className="px-4 py-3">Tipe Akun</th>
                  <th className="px-4 py-3">Saldo Normal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-medium">
                {kodeAkunList.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">{a.kode}</td>
                    <td className="px-4 py-3 font-bold text-white">{a.nama}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.tipe === 'REVENUE'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : a.tipe === 'EXPENSE'
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-sky-500/10 text-sky-400'
                        }`}
                      >
                        {a.tipe}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{a.saldoNormal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL EDIT KANDANG */}
      {editingKandang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Unit Kandang</h3>
                  <p className="text-xs text-slate-400">Perbarui nama, kapasitas, dan status kandang.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingKandang(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditKandang} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Kandang</label>
                <input
                  type="text"
                  value={editNamaKandang}
                  onChange={(e) => setEditNamaKandang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kapasitas (Ekor)</label>
                <input
                  type="number"
                  min="1"
                  value={editKapasitasKandang}
                  onChange={(e) => setEditKapasitasKandang(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status Kandang</label>
                <select
                  value={editStatusKandang}
                  onChange={(e) => setEditStatusKandang(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="ISTIRAHAT">ISTIRAHAT</option>
                  <option value="PERAWATAN">PERAWATAN</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Catatan kondisi unit kandang..."
                  value={editCatatanKandang}
                  onChange={(e) => setEditCatatanKandang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingKandang(null)}
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

      {/* MODAL EDIT POPULASI */}
      {editingPopulasi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Batch Populasi Bebek</h3>
                  <p className="text-xs text-slate-400">Perbarui informasi populasi bebek petelur.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPopulasi(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPopulasi} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kode Batch</label>
                  <input
                    type="text"
                    value={editPopKodeBatch}
                    onChange={(e) => setEditPopKodeBatch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kandang</label>
                  <select
                    value={editPopKandangId}
                    onChange={(e) => setEditPopKandangId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {kandangList.map((k) => (
                      <option key={k.id} value={k.id}>{k.namaKandang}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jumlah Saat Ini (Ekor)</label>
                  <input
                    type="number"
                    min="0"
                    value={editPopJumlahSaatIni}
                    onChange={(e) => setEditPopJumlahSaatIni(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold text-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jumlah Awal (Ekor)</label>
                  <input
                    type="number"
                    min="0"
                    value={editPopJumlahAwal}
                    onChange={(e) => setEditPopJumlahAwal(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Umur (Minggu)</label>
                  <input
                    type="number"
                    min="1"
                    value={editPopUmurMinggu}
                    onChange={(e) => setEditPopUmurMinggu(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={editPopStatus}
                    onChange={(e) => setEditPopStatus(e.target.value as StatusPopulasi)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value="PRODUKTIF">PRODUKTIF</option>
                    <option value="PEMBESARAN">PEMBESARAN</option>
                    <option value="AFKIR">AFKIR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Harga Beli/Ekor</label>
                  <input
                    type="number"
                    min="0"
                    value={editPopHargaBeli}
                    onChange={(e) => setEditPopHargaBeli(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPopulasi(null)}
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
