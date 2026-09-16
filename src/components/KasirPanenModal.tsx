import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { formatIDR } from '../utils/exportUtils';
import { useToast } from './ToastContainer';
import { NotaStrukModal } from './NotaStrukModal';
import type { NotaData } from './NotaStrukModal';
import type { KomoditasTernak } from '../types';
import { KOMODITAS_LIST } from '../types';

interface ProductConfig {
  id: string;
  label: string;
  defaultSatuan: string;
  satuanOptions: { value: string; label: string; defaultHarga: number }[];
}

const COMMODITY_PRODUCTS: Record<KomoditasTernak, ProductConfig[]> = {
  BEBEK_PETELUR: [
    {
      id: 'TELUR_GRADE_A',
      label: 'Telur Bebek Grade A (Utuh)',
      defaultSatuan: 'RAK',
      satuanOptions: [
        { value: 'RAK', label: 'Rak (30 Butir)', defaultHarga: 72000 },
        { value: 'BUTIR', label: 'Butir Eceran', defaultHarga: 2400 },
        { value: 'KG', label: 'Kilogram (Kg)', defaultHarga: 38000 },
      ],
    },
    {
      id: 'TELUR_GRADE_B',
      label: 'Telur Bebek Grade B (Retak)',
      defaultSatuan: 'BUTIR',
      satuanOptions: [
        { value: 'BUTIR', label: 'Butir Eceran', defaultHarga: 1800 },
        { value: 'RAK', label: 'Rak (30 Butir)', defaultHarga: 54000 },
      ],
    },
    {
      id: 'BEBEK_AFKIR',
      label: 'Bebek Afkir',
      defaultSatuan: 'EKOR',
      satuanOptions: [
        { value: 'EKOR', label: 'Ekor Bebek', defaultHarga: 55000 },
      ],
    },
    {
      id: 'PUPUK_KANDANG',
      label: 'Pupuk Kandang Bebek',
      defaultSatuan: 'KARUNG',
      satuanOptions: [
        { value: 'KARUNG', label: 'Karung Pupuk', defaultHarga: 15000 },
      ],
    },
  ],
  AYAM_PETELUR: [
    {
      id: 'TELUR_AYAM_A',
      label: 'Telur Ayam Grade A',
      defaultSatuan: 'KG',
      satuanOptions: [
        { value: 'KG', label: 'Kilogram (Kg)', defaultHarga: 28000 },
        { value: 'RAK', label: 'Rak (30 Butir)', defaultHarga: 55000 },
        { value: 'BUTIR', label: 'Butir Eceran', defaultHarga: 1800 },
      ],
    },
    {
      id: 'TELUR_AYAM_B',
      label: 'Telur Layer Retak / BS',
      defaultSatuan: 'BUTIR',
      satuanOptions: [
        { value: 'BUTIR', label: 'Butir Eceran', defaultHarga: 1400 },
        { value: 'KG', label: 'Kilogram (Kg)', defaultHarga: 22000 },
      ],
    },
    {
      id: 'AYAM_AFKIR',
      label: 'Ayam Layer Afkir',
      defaultSatuan: 'EKOR',
      satuanOptions: [
        { value: 'EKOR', label: 'Ekor Ayam', defaultHarga: 42000 },
      ],
    },
    {
      id: 'PUPUK_KOHE_AYAM',
      label: 'Pupuk Kohe Kering',
      defaultSatuan: 'KARUNG',
      satuanOptions: [
        { value: 'KARUNG', label: 'Karung', defaultHarga: 12000 },
      ],
    },
  ],
  AYAM_PEDAGING: [
    {
      id: 'BROILER_HIDUP',
      label: 'Ayam Broiler Panen (Hidup)',
      defaultSatuan: 'KG',
      satuanOptions: [
        { value: 'KG', label: 'Kilogram (Kg)', defaultHarga: 22500 },
        { value: 'EKOR', label: 'Ekor Ayam', defaultHarga: 45000 },
      ],
    },
    {
      id: 'BROILER_BS',
      label: 'Ayam BS / Culling',
      defaultSatuan: 'KG',
      satuanOptions: [
        { value: 'KG', label: 'Kilogram (Kg)', defaultHarga: 16000 },
        { value: 'EKOR', label: 'Ekor Ayam', defaultHarga: 25000 },
      ],
    },
    {
      id: 'PUPUK_SEKAM_BROILER',
      label: 'Pupuk Sekam & Kohe Broiler',
      defaultSatuan: 'KARUNG',
      satuanOptions: [
        { value: 'KARUNG', label: 'Karung', defaultHarga: 10000 },
      ],
    },
  ],
  SAPI: [
    {
      id: 'SUSU_MURNI',
      label: 'Susu Murni Segar',
      defaultSatuan: 'LITER',
      satuanOptions: [
        { value: 'LITER', label: 'Liter Susu Murni', defaultHarga: 12000 },
      ],
    },
    {
      id: 'SAPI_POTONG',
      label: 'Sapi Penggemukan / Siap Potong',
      defaultSatuan: 'EKOR',
      satuanOptions: [
        { value: 'EKOR', label: 'Ekor Sapi', defaultHarga: 19000000 },
        { value: 'KG', label: 'Kilogram Bobot Hidup', defaultHarga: 52000 },
      ],
    },
    {
      id: 'BAKALAN_PEDET',
      label: 'Bakalan / Pedet Sapi',
      defaultSatuan: 'EKOR',
      satuanOptions: [
        { value: 'EKOR', label: 'Ekor Sapi', defaultHarga: 9500000 },
      ],
    },
    {
      id: 'PUPUK_KOMPOS_SAPI',
      label: 'Pupuk Kompos Fermentasi',
      defaultSatuan: 'KARUNG',
      satuanOptions: [
        { value: 'KARUNG', label: 'Karung', defaultHarga: 20000 },
      ],
    },
  ],
  LELE: [
    {
      id: 'LELE_KONSUMSI',
      label: 'Ikan Lele Konsumsi (Panen)',
      defaultSatuan: 'KG',
      satuanOptions: [
        { value: 'KG', label: 'Kilogram (Kg)', defaultHarga: 23000 },
      ],
    },
    {
      id: 'BENIH_LELE',
      label: 'Bibit / Benih Lele Unggul',
      defaultSatuan: 'EKOR',
      satuanOptions: [
        { value: 'EKOR', label: 'Ekor Bibit', defaultHarga: 250 },
      ],
    },
    {
      id: 'LELE_BS_SORTIR',
      label: 'Lele Sortiran / BS',
      defaultSatuan: 'KG',
      satuanOptions: [
        { value: 'KG', label: 'Kilogram (Kg)', defaultHarga: 16000 },
      ],
    },
  ],
};

interface KasirPanenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
  activeCommodity?: KomoditasTernak;
}

export const KasirPanenModal: React.FC<KasirPanenModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
  activeCommodity = 'BEBEK_PETELUR',
}) => {
  const { showToast } = useToast();

  const productList = COMMODITY_PRODUCTS[activeCommodity] || COMMODITY_PRODUCTS.BEBEK_PETELUR;

  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [namaPembeli, setNamaPembeli] = useState<string>('Pengepul / Pelanggan');
  const [noHp, setNoHp] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>(productList[0].id);
  const [satuan, setSatuan] = useState<string>(productList[0].defaultSatuan);
  const [jumlahQty, setJumlahQty] = useState<number>(10);
  const [hargaPerSatuan, setHargaPerSatuan] = useState<number>(
    productList[0].satuanOptions[0]?.defaultHarga || 72000
  );
  const [metodeBayar, setMetodeBayar] = useState<'TUNAI' | 'TRANSFER' | 'TEMPO'>('TUNAI');
  const [tglJatuhTempo, setTglJatuhTempo] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [catatan, setCatatan] = useState<string>('');

  // Digital Receipt State
  const [notaData, setNotaData] = useState<NotaData | null>(null);
  const [isNotaOpen, setIsNotaOpen] = useState<boolean>(false);

  // When activeCommodity changes, reset product selection
  useEffect(() => {
    const list = COMMODITY_PRODUCTS[activeCommodity] || COMMODITY_PRODUCTS.BEBEK_PETELUR;
    if (list && list.length > 0) {
      setSelectedProductId(list[0].id);
      setSatuan(list[0].defaultSatuan);
      setHargaPerSatuan(list[0].satuanOptions[0]?.defaultHarga || 50000);
      if (list[0].defaultSatuan === 'EKOR' && activeCommodity === 'SAPI') {
        setJumlahQty(1);
      }
    }
  }, [activeCommodity]);

  const currentProduct = productList.find((p) => p.id === selectedProductId) || productList[0];

  // Auto total calculation
  const totalNominal = jumlahQty * hargaPerSatuan;

  // Handle product change
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = productList.find((p) => p.id === productId);
    if (prod) {
      setSatuan(prod.defaultSatuan);
      const opt = prod.satuanOptions.find((o) => o.value === prod.defaultSatuan) || prod.satuanOptions[0];
      if (opt) setHargaPerSatuan(opt.defaultHarga);
      if (prod.defaultSatuan === 'EKOR' && activeCommodity === 'SAPI') {
        setJumlahQty(1);
      }
    }
  };

  const handleSatuanChange = (newSatuan: string) => {
    setSatuan(newSatuan);
    const opt = currentProduct.satuanOptions.find((o) => o.value === newSatuan);
    if (opt) {
      setHargaPerSatuan(opt.defaultHarga);
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
      const kategoriLabel = currentProduct.label;
      const noRef = `TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        100 + Math.random() * 900
      )}`;

      StorageService.recordEggSalePOS({
        tanggal,
        namaPembeli,
        noHp: noHp || undefined,
        kategori: currentProduct.id,
        kategoriLabel,
        jumlahQty,
        satuan,
        hargaPerSatuan,
        totalNominal,
        metodeBayar,
        tglJatuhTempo: metodeBayar === 'TEMPO' ? tglJatuhTempo : undefined,
        catatan: catatan || undefined,
        komoditas: activeCommodity,
      });

      setNotaData({
        noRef,
        tanggal,
        namaPembeli,
        noHp,
        kategoriLabel,
        jumlahQty,
        satuan,
        hargaPerSatuan,
        totalNominal,
        metodeBayar,
        tglJatuhTempo: metodeBayar === 'TEMPO' ? tglJatuhTempo : undefined,
        catatan,
      });

      onRefreshData();
      showToast(
        `Penjualan ${formatIDR(totalNominal)} berhasil dicatat! Struk nota siap dicetak/dikirim.`,
        'success',
        'Penjualan Berhasil'
      );
      setIsNotaOpen(true);
    } catch (err: any) {
      showToast(`Gagal mencatat penjualan: ${err.message}`, 'error');
    }
  };

  if (!isOpen) return null;

  const info = KOMODITAS_LIST[activeCommodity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel-glow w-full max-w-2xl rounded-3xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto my-auto animate-toast border border-amber-500/30">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 text-xl">
              {info.icon}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Kasir Jual Cepat (POS Panen) <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Jual panen {info.nama} & otomatis catat ke Jurnal Kas / Piutang dengan 1 klik.
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
              Pilih Produk {info.nama} Dijual:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {productList.map((item) => {
                const isSelected = selectedProductId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleProductChange(item.id)}
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
                {currentProduct.satuanOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
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
            <div className="sm:col-span-3 flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] text-slate-400">Pilih Cepat:</span>
              {(activeCommodity === 'SAPI' && satuan === 'EKOR'
                ? [1, 2, 5, 10]
                : [5, 10, 20, 50, 100]
              ).map((q) => (
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
                  placeholder="Contoh: Toko Berkah / Pengepul"
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
                placeholder="Contoh: Kirim via armada pickup"
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

      {/* Instant Digital Receipt / Struk POS */}
      <NotaStrukModal
        isOpen={isNotaOpen}
        onClose={() => {
          setIsNotaOpen(false);
          onClose();
        }}
        nota={notaData}
      />
    </div>
  );
};
