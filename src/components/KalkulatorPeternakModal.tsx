import React, { useState } from 'react';
import {
  Calculator,
  X,
  Sparkles,
  Scale,
  TrendingUp,
  Percent,
  Lightbulb,
} from 'lucide-react';
import { formatIDR } from '../utils/exportUtils';

interface KalkulatorPeternakModalProps {
  isOpen: boolean;
  onClose: () => void;
  populasiDefault?: number;
}

export const KalkulatorPeternakModal: React.FC<KalkulatorPeternakModalProps> = ({
  isOpen,
  onClose,
  populasiDefault = 1000,
}) => {
  const [activeTab, setActiveTab] = useState<'ransum' | 'bep' | 'proyeksi'>('ransum');

  // --- State Tab 1: Formulasi Ransum Pakan ---
  const [persenKonsentrat, setPersenKonsentrat] = useState<number>(35);
  const [persenJagung, setPersenJagung] = useState<number>(35);
  const [persenDedak, setPersenDedak] = useState<number>(30);

  const [hargaKonsentrat, setHargaKonsentrat] = useState<number>(9500);
  const [hargaJagung, setHargaJagung] = useState<number>(6000);
  const [hargaDedak, setHargaDedak] = useState<number>(4000);
  const [hargaPakanPabrik] = useState<number>(8500);

  // Protein Kasar (PK) & EM per bahan baku standar peternakan bebek
  const pkKonsentrat = 36; // 36%
  const pkJagung = 8.5;    // 8.5%
  const pkDedak = 12;      // 12%

  const totalPersen = persenKonsentrat + persenJagung + persenDedak;
  const isPersenValid = totalPersen === 100;

  // Hitung Nilai Nutrisi Ransum Campuran
  const totalPK = isPersenValid
    ? ((persenKonsentrat * pkKonsentrat) + (persenJagung * pkJagung) + (persenDedak * pkDedak)) / 100
    : 0;

  const hargaPakanCampuranPerKg = isPersenValid
    ? ((persenKonsentrat * hargaKonsentrat) + (persenJagung * hargaJagung) + (persenDedak * hargaDedak)) / 100
    : 0;

  const selisihHargaPerKg = hargaPakanPabrik - hargaPakanCampuranPerKg;
  // Asumsi pakan 150g/ekor/hari untuk bebek petelur aktif
  const konsumsiPakanBulananTotalKg = (populasiDefault * 0.15) * 30;
  const potensiHematBulanan = selisihHargaPerKg * konsumsiPakanBulananTotalKg;

  // --- State Tab 2: HPP & BEP Telur ---
  const [bepGramPakanPerEkor, setBepGramPakanPerEkor] = useState<number>(150);
  const [bepHargaPakanKg, setBepHargaPakanKg] = useState<number>(hargaPakanCampuranPerKg || 6800);
  const [bepBiayaLainPerEkorBulan, setBepBiayaLainPerEkorBulan] = useState<number>(1500); // Gaji, vitamin, listrik
  const [bepHdp, setBepHdp] = useState<number>(80); // 80% produksi
  const [bepHargaJualTelur, setBepHargaJualTelur] = useState<number>(2400); // Harga per butir

  // Biaya pakan per ekor per hari
  const biayaPakanPerEkorHari = (bepGramPakanPerEkor / 1000) * bepHargaPakanKg;
  const biayaLainPerEkorHari = bepBiayaLainPerEkorBulan / 30;
  const totalBiayaHarianPerEkor = biayaPakanPerEkorHari + biayaLainPerEkorHari;

  // Peluang bertelur per hari = bepHdp / 100
  const butirPerEkorHari = bepHdp / 100;
  const hppPerButir = butirPerEkorHari > 0 ? Math.round(totalBiayaHarianPerEkor / butirPerEkorHari) : 0;
  const hppPerKg = Math.round(hppPerButir * 15.5); // ~15-16 butir per kg
  const bepMinimalHargaJual = hppPerButir;
  const marginPerButir = bepHargaJualTelur - hppPerButir;
  const marginPersen = bepHargaJualTelur > 0 ? Number(((marginPerButir / bepHargaJualTelur) * 100).toFixed(1)) : 0;

  // --- State Tab 3: Proyeksi Panen & Keuntungan ---
  const [projPopulasi, setProjPopulasi] = useState<number>(populasiDefault);
  const [projHdp, setProjHdp] = useState<number>(82);
  const [projHargaTelur, setProjHargaTelur] = useState<number>(2400);

  const projButirPerHari = Math.round(projPopulasi * (projHdp / 100));
  const projRakPerHari = Number((projButirPerHari / 30).toFixed(1));
  const projOmsetHarian = projButirPerHari * projHargaTelur;
  const projOmsetBulanan = projOmsetHarian * 30;

  const projBiayaPakanHarian = projPopulasi * (bepGramPakanPerEkor / 1000) * (bepHargaPakanKg || 6800);
  const projBiayaPakanBulanan = projBiayaPakanHarian * 30;
  const projBiayaOpsBulanan = projPopulasi * bepBiayaLainPerEkorBulan;
  const projLabaBersihBulanan = projOmsetBulanan - (projBiayaPakanBulanan + projBiayaOpsBulanan);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel-glow w-full max-w-4xl rounded-3xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto my-auto animate-toast border border-amber-500/30">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Kalkulator Cerdas Peternak Bebek <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Formula pakan ransum murah berprotein tinggi, kalkulasi HPP/BEP telur, & proyeksi laba.
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => setActiveTab('ransum')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'ransum'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Formulasi Pakan Campur</span>
          </button>
          <button
            onClick={() => setActiveTab('bep')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'bep'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>HPP & BEP Telur</span>
          </button>
          <button
            onClick={() => setActiveTab('proyeksi')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'proyeksi'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Proyeksi Laba & Panen</span>
          </button>
        </div>

        {/* --- CONTENT TAB 1: FORMULASI RANSUM PAKAN MANDIRI --- */}
        {activeTab === 'ransum' && (
          <div className="mt-6 space-y-6">
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <strong>Tips Nutrisi Bebek Petelur:</strong> Standar kebutuhan protein kasar (PK) bebek petelur masa produksi optimal adalah <strong>18% – 19.5%</strong>. Mencampur konsentrat 144, jagung giling, dan katul/dedak halus dapat memangkas biaya pakan harian hingga <strong>25–35%</strong> dibandingkan pakan komplit pabrikan!
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Konsentrat 144 */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">1. Konsentrat Bebek (144)</span>
                  <span className="text-xs font-semibold text-slate-400">PK: 36%</span>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Proporsi (% Campuran):</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={persenKonsentrat}
                      onChange={(e) => setPersenKonsentrat(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-400 outline-none"
                    />
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Harga Beli / Kg (Rp):</label>
                  <input
                    type="number"
                    value={hargaKonsentrat}
                    onChange={(e) => setHargaKonsentrat(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* Jagung Giling */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">2. Jagung Giling</span>
                  <span className="text-xs font-semibold text-slate-400">PK: 8.5%</span>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Proporsi (% Campuran):</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={persenJagung}
                      onChange={(e) => setPersenJagung(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-400 outline-none"
                    />
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Harga Beli / Kg (Rp):</label>
                  <input
                    type="number"
                    value={hargaJagung}
                    onChange={(e) => setHargaJagung(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* Dedak Halus */}
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">3. Dedak / Katul Halus</span>
                  <span className="text-xs font-semibold text-slate-400">PK: 12%</span>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Proporsi (% Campuran):</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={persenDedak}
                      onChange={(e) => setPersenDedak(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-400 outline-none"
                    />
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Harga Beli / Kg (Rp):</label>
                  <input
                    type="number"
                    value={hargaDedak}
                    onChange={(e) => setHargaDedak(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-amber-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Total Persentase Check */}
            {!isPersenValid && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                <span>⚠️ Total persentase ransum harus 100% (Saat ini: {totalPersen}%)</span>
              </div>
            )}

            {/* Hasil Analisis Ransum */}
            {isPersenValid && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kadar Protein Kasar (PK)</p>
                  <h3 className={`text-2xl font-black mt-2 ${totalPK >= 18 && totalPK <= 20.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {totalPK.toFixed(2)}%
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {totalPK >= 18 && totalPK <= 20.5 ? '✅ Ideal untuk Bebek Produksi' : '⚠️ Evaluasi proporsi konsentrat'}
                  </p>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Harga Pakan Campuran / Kg</p>
                  <h3 className="text-2xl font-black text-white mt-2">
                    {formatIDR(hargaPakanCampuranPerKg)}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Vs Pabrikan: {formatIDR(hargaPakanPabrik)}
                  </p>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Est. Penghematan Bulanan</p>
                  <h3 className="text-2xl font-black text-emerald-400 mt-2">
                    {formatIDR(potensiHematBulanan)}
                  </h3>
                  <p className="text-[11px] text-emerald-300/80 mt-1">
                    Hemat {formatIDR(selisihHargaPerKg)}/kg untuk {populasiDefault} ekor
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- CONTENT TAB 2: HPP & BREAK EVEN POINT (BEP) --- */}
        {activeTab === 'bep' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Parameter Biaya Produksi</h4>

                <div>
                  <label className="text-xs text-slate-400">Konsumsi Pakan / Ekor / Hari (Gram):</label>
                  <input
                    type="number"
                    value={bepGramPakanPerEkor}
                    onChange={(e) => setBepGramPakanPerEkor(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                  />
                  <span className="text-[11px] text-slate-500">Standar bebek bertelur: 140 - 160 gram</span>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Harga Pakan per Kg (Rp):</label>
                  <input
                    type="number"
                    value={bepHargaPakanKg}
                    onChange={(e) => setBepHargaPakanKg(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Biaya Lain (Gaji, Obat, Listrik) / Ekor / Bulan (Rp):</label>
                  <input
                    type="number"
                    value={bepBiayaLainPerEkorBulan}
                    onChange={(e) => setBepBiayaLainPerEkorBulan(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Parameter Produksi & Pasar</h4>

                <div>
                  <label className="text-xs text-slate-400">Rata-rata HDP (Hen-Day Production %):</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={bepHdp}
                      onChange={(e) => setBepHdp(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Persentase bebek yang bertelur tiap hari</span>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Harga Jual Telur per Butir Saat Ini (Rp):</label>
                  <input
                    type="number"
                    value={bepHargaJualTelur}
                    onChange={(e) => setBepHargaJualTelur(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Hasil Perhitungan HPP & BEP */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">HPP (Modal) Per Butir</p>
                <h3 className="text-2xl font-black text-amber-400 mt-2">{formatIDR(hppPerButir)}</h3>
                <p className="text-[11px] text-slate-400 mt-1">HPP per Kg: {formatIDR(hppPerKg)}</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">BEP Minimal Harga Jual</p>
                <h3 className="text-2xl font-black text-white mt-2">{formatIDR(bepMinimalHargaJual)}</h3>
                <p className="text-[11px] text-slate-400 mt-1">Batas aman tidak rugi</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Margin Laba Bersih</p>
                <h3 className="text-2xl font-black text-emerald-400 mt-2">
                  +{formatIDR(marginPerButir)} <span className="text-sm font-bold">({marginPersen}%)</span>
                </h3>
                <p className="text-[11px] text-emerald-300/80 mt-1">Keuntungan bersih per butir telur</p>
              </div>
            </div>
          </div>
        )}

        {/* --- CONTENT TAB 3: PROYEKSI LABA & PANEN --- */}
        {activeTab === 'proyeksi' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="text-xs text-slate-400">Populasi Bebek Aktif (Ekor):</label>
                <input
                  type="number"
                  value={projPopulasi}
                  onChange={(e) => setProjPopulasi(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Target HDP (% Produksi):</label>
                <input
                  type="number"
                  value={projHdp}
                  onChange={(e) => setProjHdp(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Harga Telur Rata-rata (Rp/butir):</label>
                <input
                  type="number"
                  value={projHargaTelur}
                  onChange={(e) => setProjHargaTelur(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Proyeksi Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Panen Telur Harian</p>
                <h3 className="text-2xl font-black text-amber-400 mt-2">{projButirPerHari.toLocaleString('id-ID')} <span className="text-sm font-normal text-slate-400">butir</span></h3>
                <p className="text-[11px] text-slate-400 mt-1">± {projRakPerHari} Rak isi 30</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Omset Kotor Bulanan</p>
                <h3 className="text-2xl font-black text-white mt-2">{formatIDR(projOmsetBulanan)}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{formatIDR(projOmsetHarian)} / hari</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Beban Pakan & Ops</p>
                <h3 className="text-2xl font-black text-rose-400 mt-2">{formatIDR(projBiayaPakanBulanan + projBiayaOpsBulanan)}</h3>
                <p className="text-[11px] text-slate-400 mt-1">Pakan: {formatIDR(projBiayaPakanBulanan)}</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Est. Laba Bersih Bulanan</p>
                <h3 className="text-2xl font-black text-emerald-400 mt-2">{formatIDR(projLabaBersihBulanan)}</h3>
                <p className="text-[11px] text-emerald-300/80 mt-1">Proyeksi Tahunan: {formatIDR(projLabaBersihBulanan * 12)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Modal */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all"
          >
            Tutup Kalkulator
          </button>
        </div>
      </div>
    </div>
  );
};
