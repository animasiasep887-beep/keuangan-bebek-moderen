import React, { useState } from 'react';
import {
  ShoppingBag,
  X,
  Egg,
  User,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { formatIDR } from '../utils/exportUtils';
import { useToast } from './ToastContainer';

interface KasirPanenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const KasirPanenModal: React.FC<KasirPanenModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const { showToast } = useToast();

  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [namaPembeli, setNamaPembeli] = useState<string>('Pengepul / Toko');
  const [noHp, setNoHp] = useState<string>('');
  const [kategori, setKategori] = useState<'TELUR_GRADE_A' | 'TELUR_GRADE_B' | 'BEBEK_AFKIR' | 'PUPUK_KANDANG'>('TELUR_GRADE_A');
  const [satuan, setSatuan] = useState<'RAK' | 'BUTIR' | 'KG' | 'EKOR' | 'KARUNG'>('RAK');
  const [jumlahQty, setJumlahQty] = useState<number>(10);
  const [hargaPerSatuan, setHargaPerSatuan] = useState<number>(72000); // Rp 72.000 per rak (Rp 2.400 / butir)
  const [metodeBayar, setMetodeBayar] = useState<'TUNAI' | 'TRANSFER' | 'TEMPO'>('TUNAI');
  const [tglJatuhTempo, setTglJatuhTempo] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [catatan, setCatatan] = useState<string>('');

  // Auto total calculation
  const totalNominal = jumlahQty * hargaPerSatuan;

  // Handle category change default prices
  const handleKategoriChange = (newCat: any) => {
    setKategori(newCat);
    if (newCat === 'TELUR_GRADE_A') {
      setSatuan('RAK');
      setHargaPerSatuan(72000); // 30 butir x 2400
    } else if (newCat === 'TELUR_GRADE_B') {
      setSatuan('BUTIR');
      setHargaPerSatuan(1800);
    } else if (newCat === 'BEBEK_AFKIR') {
      setSatuan('EKOR');
      setHargaPerSatuan(55000);
    } else if (newCat === 'PUPUK_KANDANG') {
      setSatuan('KARUNG');
      setHargaPerSatuan(15000);
    }
  };

  const handleSatuanChange = (newSatuan: any) => {
    setSatuan(newSatuan);
    if (kategori === 'TELUR_GRADE_A') {
      if (newSatuan === 'RAK') setHargaPerSatuan(72000);
      else if (newSatuan === 'BUTIR') setHargaPerSatuan(2400);
      else if (newSatuan === 'KG') setHargaPerSatuan(38000);
    }
  };

  const handleQuickQty = (qty: number) => {
    setJumlahQty(qty);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaPembeli.trim() || jumlahQty <= 0 || hargaPerSatuan <= 0) {
      showToast('Mohon lengkapi nama pembeli, jumlah, dan harga!', 'warning', 'Validasi Gagal');
      return;
    }

    try {
      StorageService.recordEggSalePOS({
        tanggal,
        namaPembeli,
        noHp: noHp || undefined,
        kategori,
        jumlahQty,
        satuan,
        hargaPerSatuan,
        totalNominal,
        metodeBayar,
        tglJatuhTempo: metodeBayar === 'TEMPO' ? tglJatuhTempo : undefined,
        catatan: catatan || undefined,
      });

      onRefreshData();
      showToast(
        `Penjualan ${formatIDR(totalNominal)} berhasil dicatat ke ${metodeBayar === 'TEMPO' ? 'Piutang' : 'Kas'}!`,
        'success',
        'Penjualan Berhasil'
      );
      onClose();
    } catch (err: any) {
      showToast(`Gagal mencatat penjualan: ${err.message}`, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel-glow w-full max-w-2xl rounded-3xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto my-auto animate-toast border border-amber-500/30">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Kasir Jual Cepat (POS Panen) <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Jual hasil panen telur & otomatis catat ke Jurnal Kas / Piutang dengan 1 klik.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Komoditas / Kategori Produk */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Pilih Komoditas Dijual:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'TELUR_GRADE_A', label: 'Telur Grade A (Utuh)', icon: Egg, color: 'text-amber-400' },
                { id: 'TELUR_GRADE_B', label: 'Telur Grade B (Retak)', icon: Egg, color: 'text-amber-200' },
                { id: 'BEBEK_AFKIR', label: 'Bebek Afkir', icon: User, color: 'text-rose-400' },
                { id: 'PUPUK_KANDANG', label: 'Pupuk Kandang', icon: Sparkles, color: 'text-emerald-400' },
              ].map((item) => {
                const isSelected = kategori === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleKategoriChange(item.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md shadow-amber-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">{item.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-2 self-end" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Qty, Satuan & Harga Per Satuan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Satuan Jual:</label>
              <select
                value={satuan}
                onChange={(e) => handleSatuanChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
              >
                <option value="RAK">Rak (Isi 30 Butir)</option>
                <option value="BUTIR">Butir Eceran</option>
                <option value="KG">Kilogram (Kg)</option>
                <option value="EKOR">Ekor (Bebek)</option>
                <option value="KARUNG">Karung (Pupuk)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Jumlah / Qty:</label>
              <input
                type="number"
                min={1}
                value={jumlahQty}
                onChange={(e) => setJumlahQty(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Harga per {satuan} (Rp):</label>
              <input
                type="number"
                min={0}
                value={hargaPerSatuan}
                onChange={(e) => setHargaPerSatuan(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
              />
            </div>

            {/* Quick Presets for Qty */}
            <div className="sm:col-span-3 flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">Pilih Cepat:</span>
              {[5, 10, 20, 50, 100].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQuickQty(q)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  +{q} {satuan}
                </button>
              ))}
            </div>
          </div>

          {/* Pembeli & Kontak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nama Pembeli / Pengepul:</label>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={namaPembeli}
                  onChange={(e) => setNamaPembeli(e.target.value)}
                  placeholder="Contoh: Toko Berkah / Mas Agus"
                  className="w-full bg-transparent text-sm text-white font-semibold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Nomor WhatsApp / HP (Opsional):</label>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="0812xxxx"
                  className="w-full bg-transparent text-sm text-white font-semibold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tanggal & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Tanggal Penjualan:</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Catatan Tambahan (Opsional):</label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Titip ke pengepul sore hari"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Metode Pembayaran:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'TUNAI', label: '💵 Tunai (Kas)', desc: 'Langsung Kas Masuk' },
                { id: 'TRANSFER', label: '🏦 Transfer Bank', desc: 'Rekening Bank' },
                { id: 'TEMPO', label: '⏳ Tempo (Piutang)', desc: 'Tagihan Pengepul' },
              ].map((m) => {
                const isSelected = metodeBayar === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetodeBayar(m.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{m.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* If Tempo: Due Date */}
          {metodeBayar === 'TEMPO' && (
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-200">Tanggal Jatuh Tempo Pelunasan:</span>
              </div>
              <input
                type="date"
                value={tglJatuhTempo}
                onChange={(e) => setTglJatuhTempo(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold outline-none"
              />
            </div>
          )}

          {/* Total Ringkasan Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Nilai Transaksi:</p>
              <h3 className="text-3xl font-black text-amber-400 tracking-tight mt-1">
                {formatIDR(totalNominal)}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {jumlahQty} {satuan} × {formatIDR(hargaPerSatuan)} ({metodeBayar})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Simpan & Catat
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
