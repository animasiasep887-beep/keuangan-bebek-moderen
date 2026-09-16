import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Scale,
  TrendingUp,
  Percent,
  Lightbulb,
  Award,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { formatIDR } from '../utils/exportUtils';
import type { KomoditasTernak } from '../types';
import { KOMODITAS_LIST } from '../types';

interface KalkulatorPeternakModalProps {
  isOpen: boolean;
  onClose: () => void;
  populasiDefault?: number;
  activeCommodity?: KomoditasTernak;
}

export const KalkulatorPeternakModal: React.FC<KalkulatorPeternakModalProps> = ({
  isOpen,
  onClose,
  populasiDefault = 1000,
  activeCommodity = 'BEBEK_PETELUR',
}) => {
  const [activeTab, setActiveTab] = useState<'tab1' | 'tab2' | 'tab3'>('tab1');

  // ==========================================
  // 1. BEBEK & AYAM PETELUR STATES
  // ==========================================
  const [persenKonsentrat, setPersenKonsentrat] = useState<number>(35);
  const [persenJagung, setPersenJagung] = useState<number>(35);
  const [persenDedak, setPersenDedak] = useState<number>(30);
  const [hargaKonsentrat, setHargaKonsentrat] = useState<number>(9500);
  const [hargaJagung, setHargaJagung] = useState<number>(6000);
  const [hargaDedak, setHargaDedak] = useState<number>(4000);
  const [hargaPakanPabrik] = useState<number>(8500);

  const pkKonsentrat = 36;
  const pkJagung = 8.5;
  const pkDedak = 12;
  const totalPersen = persenKonsentrat + persenJagung + persenDedak;
  const isPersenValid = totalPersen === 100;
  const totalPK = isPersenValid
    ? (persenKonsentrat * pkKonsentrat + persenJagung * pkJagung + persenDedak * pkDedak) / 100
    : 0;
  const hargaPakanCampuranPerKg = isPersenValid
    ? (persenKonsentrat * hargaKonsentrat + persenJagung * hargaJagung + persenDedak * hargaDedak) / 100
    : 0;
  const selisihHargaPerKg = hargaPakanPabrik - hargaPakanCampuranPerKg;
  const konsumsiPakanBulananTotalKg = populasiDefault * 0.15 * 30;
  const potensiHematBulanan = selisihHargaPerKg * konsumsiPakanBulananTotalKg;

  // HPP Telur
  const [bepGramPakanPerEkor, setBepGramPakanPerEkor] = useState<number>(150);
  const [bepHargaPakanKg, setBepHargaPakanKg] = useState<number>(hargaPakanCampuranPerKg || 6800);
  const [bepBiayaLainPerEkorBulan, setBepBiayaLainPerEkorBulan] = useState<number>(1500);
  const [bepHdp, setBepHdp] = useState<number>(80);
  const [bepHargaJualTelur, setBepHargaJualTelur] = useState<number>(2400);

  const biayaPakanPerEkorHari = (bepGramPakanPerEkor / 1000) * bepHargaPakanKg;
  const biayaLainPerEkorHari = bepBiayaLainPerEkorBulan / 30;
  const totalBiayaHarianPerEkor = biayaPakanPerEkorHari + biayaLainPerEkorHari;
  const butirPerEkorHari = bepHdp / 100;
  const hppPerButir = butirPerEkorHari > 0 ? Math.round(totalBiayaHarianPerEkor / butirPerEkorHari) : 0;
  const hppPerKg = Math.round(hppPerButir * 15.5);
  const bepMinimalHargaJual = hppPerButir;
  const marginPerButir = bepHargaJualTelur - hppPerButir;
  const marginPersen = bepHargaJualTelur > 0 ? Number(((marginPerButir / bepHargaJualTelur) * 100).toFixed(1)) : 0;

  // Proyeksi Telur
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

  // ==========================================
  // 2. AYAM BROILER STATES
  // ==========================================
  const [broilerUmurHari, setBroilerUmurHari] = useState<number>(35);
  const [broilerBobotKg, setBroilerBobotKg] = useState<number>(2.1);
  const [broilerDayaHidup, setBroilerDayaHidup] = useState<number>(96); // %
  const [broilerTotalPakanEkorKg, setBroilerTotalPakanEkorKg] = useState<number>(3.2); // FCR ~ 1.52

  // Formula IP: (Daya Hidup % * Bobot Rata-rata kg) / (FCR * Umur hari) * 100
  const fcrBroilerCalc = broilerBobotKg > 0 ? Number((broilerTotalPakanEkorKg / broilerBobotKg).toFixed(2)) : 1.55;
  const ipBroilerCalc =
    fcrBroilerCalc > 0 && broilerUmurHari > 0
      ? Math.round(((broilerDayaHidup * broilerBobotKg) / (fcrBroilerCalc * broilerUmurHari)) * 100)
      : 0;
  const adgBroilerCalc = broilerUmurHari > 0 ? Math.round((broilerBobotKg * 1000) / broilerUmurHari) : 0;

  // HPP & BEP Broiler
  const [hargaDocBroiler, setHargaDocBroiler] = useState<number>(7500);
  const [hargaPakanBroilerKg, setHargaPakanBroilerKg] = useState<number>(9200);
  const [biayaOvkBroilerEkor, setBiayaOvkBroilerEkor] = useState<number>(2500); // vaksin, listrik, sekam
  const [hargaJualBroilerKg, setHargaJualBroilerKg] = useState<number>(22500);

  const biayaPakanBroilerTotal = broilerTotalPakanEkorKg * hargaPakanBroilerKg;
  const totalModalPerEkorBroiler = hargaDocBroiler + biayaPakanBroilerTotal + biayaOvkBroilerEkor;
  const hppPerKgBroiler = broilerBobotKg > 0 ? Math.round(totalModalPerEkorBroiler / broilerBobotKg) : 0;
  const marginPerKgBroiler = hargaJualBroilerKg - hppPerKgBroiler;
  const totalLabaPerEkorBroiler = Math.round(marginPerKgBroiler * broilerBobotKg);

  // Proyeksi Broiler
  const [populasiDocTebar, setPopulasiDocTebar] = useState<number>(5000);
  const estimasiEkorPanen = Math.round(populasiDocTebar * (broilerDayaHidup / 100));
  const estimasiTonasePanenKg = Math.round(estimasiEkorPanen * broilerBobotKg);
  const estimasiOmsetBroiler = estimasiTonasePanenKg * hargaJualBroilerKg;
  const estimasiTotalModalSiklus = estimasiEkorPanen * totalModalPerEkorBroiler;
  const estimasiLabaSiklusBroiler = estimasiOmsetBroiler - estimasiTotalModalSiklus;

  // ==========================================
  // 3. SAPI PERAH & POTONG STATES
  // ==========================================
  const [bobotSapiAvgKg, setBobotSapiAvgKg] = useState<number>(450);
  const [persenHijauan, setPersenHijauan] = useState<number>(10); // 10% bobot badan
  const [persenKonsentratSapi, setPersenKonsentratSapi] = useState<number>(1.5); // 1.5% bobot badan
  const [hargaHijauanKg, setHargaHijauanKg] = useState<number>(500);
  const [hargaKonsentratSapiKg, setHargaKonsentratSapiKg] = useState<number>(4800);

  const kgHijauanPerEkorHari = (bobotSapiAvgKg * persenHijauan) / 100;
  const kgKonsentratPerEkorHari = (bobotSapiAvgKg * persenKonsentratSapi) / 100;
  const biayaRansumSapiHari =
    kgHijauanPerEkorHari * hargaHijauanKg + kgKonsentratPerEkorHari * hargaKonsentratSapiKg;

  // HPP Susu
  const [literSusuPerEkorHari, setLiterSusuPerEkorHari] = useState<number>(15);
  const [biayaOpsSapiEkorHari, setBiayaOpsSapiEkorHari] = useState<number>(8000); // TK, vitamin, listrik
  const [hargaJualSusuLiter, setHargaJualSusuLiter] = useState<number>(12000);

  const totalBiayaHarianSapi = biayaRansumSapiHari + biayaOpsSapiEkorHari;
  const hppPerLiterSusu =
    literSusuPerEkorHari > 0 ? Math.round(totalBiayaHarianSapi / literSusuPerEkorHari) : 0;
  const marginPerLiterSusu = hargaJualSusuLiter - hppPerLiterSusu;

  // Proyeksi Sapi
  const [jumlahSapiLaktasi, setJumlahSapiLaktasi] = useState<number>(10);
  const totalLiterSusuBulanan = jumlahSapiLaktasi * literSusuPerEkorHari * 30;
  const omsetSusuBulanan = totalLiterSusuBulanan * hargaJualSusuLiter;
  const totalBiayaSapiBulanan = jumlahSapiLaktasi * totalBiayaHarianSapi * 30;
  const labaSapiBulanan = omsetSusuBulanan - totalBiayaSapiBulanan;

  // ==========================================
  // 4. BUDIDAYA IKAN LELE STATES
  // ==========================================
  const [populasiBenihLele, setPopulasiBenihLele] = useState<number>(10000);
  const [leleSurvivalRate, setLeleSurvivalRate] = useState<number>(90); // 90%
  const [leleSamplingIsiPerKg, setLeleSamplingIsiPerKg] = useState<number>(8); // 8 ekor per kg
  const [totalPeletTerpakaiKg, setTotalPeletTerpakaiKg] = useState<number>(1050);

  const estimasiIkanHidup = Math.round(populasiBenihLele * (leleSurvivalRate / 100));
  const estimasiBiomassaLeleKg =
    leleSamplingIsiPerKg > 0 ? Math.round(estimasiIkanHidup / leleSamplingIsiPerKg) : 0;
  const fcrLeleCalc =
    estimasiBiomassaLeleKg > 0 ? Number((totalPeletTerpakaiKg / estimasiBiomassaLeleKg).toFixed(2)) : 1.0;

  // HPP Lele
  const [hargaBenihPerEkor, setHargaBenihPerEkor] = useState<number>(250);
  const [hargaPeletLeleKg, setHargaPeletLeleKg] = useState<number>(12500);
  const [biayaProbiotikListrikKg, setBiayaProbiotikListrikKg] = useState<number>(1500);
  const [hargaJualLeleKg, setHargaJualLeleKg] = useState<number>(23000);

  const totalBiayaBenih = populasiBenihLele * hargaBenihPerEkor;
  const totalBiayaPakanLele = totalPeletTerpakaiKg * hargaPeletLeleKg;
  const totalBiayaOpsLele = estimasiBiomassaLeleKg * biayaProbiotikListrikKg;
  const totalBiayaSiklusLele = totalBiayaBenih + totalBiayaPakanLele + totalBiayaOpsLele;
  const hppPerKgLele =
    estimasiBiomassaLeleKg > 0 ? Math.round(totalBiayaSiklusLele / estimasiBiomassaLeleKg) : 0;
  const marginPerKgLele = hargaJualLeleKg - hppPerKgLele;

  // Proyeksi Lele
  const [jumlahKolamLele, setJumlahKolamLele] = useState<number>(4);
  const totalTonasePanenSemuaKolam = estimasiBiomassaLeleKg * jumlahKolamLele;
  const totalOmsetLeleSiklus = totalTonasePanenSemuaKolam * hargaJualLeleKg;
  const totalModalSemuaKolam = totalBiayaSiklusLele * jumlahKolamLele;
  const totalLabaSiklusLele = totalOmsetLeleSiklus - totalModalSemuaKolam;

  if (!isOpen) return null;

  const info = KOMODITAS_LIST[activeCommodity];

  // Dynamic tab labels per commodity
  const tabLabels =
    activeCommodity === 'BEBEK_PETELUR' || activeCommodity === 'AYAM_PETELUR'
      ? {
          tab1: 'Formulasi Ransum Pakan',
          tab2: 'HPP & BEP Telur',
          tab3: 'Proyeksi Laba & Panen',
        }
      : activeCommodity === 'AYAM_PEDAGING'
      ? {
          tab1: 'Indeks Performa (IP) & FCR',
          tab2: 'HPP & BEP Daging Broiler',
          tab3: 'Proyeksi Siklus 35 Hari',
        }
      : activeCommodity === 'SAPI'
      ? {
          tab1: 'Ransum Hijauan & Konsentrat',
          tab2: 'HPP & BEP Susu Perah',
          tab3: 'Proyeksi Laba Susu & Penggemukan',
        }
      : {
          tab1: 'FCR & Biomassa Bioflok',
          tab2: 'HPP Panen Lele (Kg)',
          tab3: 'Proyeksi Kolam & Laba Siklus',
        };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-2.5 sm:p-6 flex flex-col justify-start sm:justify-center items-center">
      <div className="glass-panel-glow w-full max-w-4xl rounded-2xl sm:rounded-3xl p-4 sm:p-7 relative my-auto mb-24 sm:mb-auto max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-toast border border-amber-500/30 shadow-2xl">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 text-xl">
              {info.icon}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Kalkulator Cerdas Peternak ({info.nama}) <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Formula nutrisi pakan, perhitungan standar HPP & BEP, serta simulasi proyeksi laba peternak.
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
            onClick={() => setActiveTab('tab1')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'tab1'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{tabLabels.tab1}</span>
          </button>
          <button
            onClick={() => setActiveTab('tab2')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'tab2'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>{tabLabels.tab2}</span>
          </button>
          <button
            onClick={() => setActiveTab('tab3')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'tab3'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{tabLabels.tab3}</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* COMMODITY 1: BEBEK & AYAM PETELUR */}
        {/* ========================================================================= */}
        {(activeCommodity === 'BEBEK_PETELUR' || activeCommodity === 'AYAM_PETELUR') && (
          <>
            {activeTab === 'tab1' && (
              <div className="mt-6 space-y-6">
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200/90 leading-relaxed">
                    <strong>Tips Nutrisi Petelur:</strong> Standar kebutuhan protein kasar (PK) masa produksi optimal adalah <strong>18% – 19.5%</strong>. Mencampur konsentrat petelur, jagung giling, dan katul halus dapat memangkas biaya pakan harian hingga <strong>25–35%</strong> dibanding pakan komplit pabrikan!
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Konsentrat */}
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">1. Konsentrat Petelur</span>
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
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">3. Katul / Dedak Halus</span>
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

                {!isPersenValid && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                    <span>⚠️ Total persentase ransum harus 100% (Saat ini: {totalPersen}%)</span>
                  </div>
                )}

                {isPersenValid && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kadar Protein Kasar (PK)</p>
                      <h3 className={`text-2xl font-black mt-2 ${totalPK >= 18 && totalPK <= 20.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {totalPK.toFixed(2)}%
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {totalPK >= 18 && totalPK <= 20.5 ? '✅ Ideal untuk Produksi Bertelur' : '⚠️ Evaluasi proporsi konsentrat'}
                      </p>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Harga Pakan Campuran / Kg</p>
                      <h3 className="text-2xl font-black text-white mt-2">{formatIDR(hargaPakanCampuranPerKg)}</h3>
                      <p className="text-[11px] text-slate-400 mt-1">Vs Pabrikan: {formatIDR(hargaPakanPabrik)}</p>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                      <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Est. Penghematan Bulanan</p>
                      <h3 className="text-2xl font-black text-emerald-400 mt-2">{formatIDR(potensiHematBulanan)}</h3>
                      <p className="text-[11px] text-emerald-300/80 mt-1">
                        Hemat {formatIDR(selisihHargaPerKg)}/kg untuk {populasiDefault} ekor
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tab2' && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Parameter Biaya Pakan & Ops</h4>
                    <div>
                      <label className="text-xs text-slate-400">Konsumsi Pakan / Ekor / Hari (Gram):</label>
                      <input
                        type="number"
                        value={bepGramPakanPerEkor}
                        onChange={(e) => setBepGramPakanPerEkor(Number(e.target.value))}
                        className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                      />
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
                      <label className="text-xs text-slate-400">Biaya Lain (Gaji, Listrik, Vitamin) / Ekor / Bulan:</label>
                      <input
                        type="number"
                        value={bepBiayaLainPerEkorBulan}
                        onChange={(e) => setBepBiayaLainPerEkorBulan(Number(e.target.value))}
                        className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Parameter Produksi Telur</h4>
                    <div>
                      <label className="text-xs text-slate-400">Rata-rata Hen-Day Production (HDP %):</label>
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
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Harga Jual Telur per Butir (Rp):</label>
                      <input
                        type="number"
                        value={bepHargaJualTelur}
                        onChange={(e) => setBepHargaJualTelur(Number(e.target.value))}
                        className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">HPP (Modal) Per Butir</p>
                    <h3 className="text-2xl font-black text-amber-400 mt-2">{formatIDR(hppPerButir)}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">HPP per Kg: {formatIDR(hppPerKg)}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">BEP Minimal Harga Jual</p>
                    <h3 className="text-2xl font-black text-white mt-2">{formatIDR(bepMinimalHargaJual)}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Batas aman impas tidak rugi</p>
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

            {activeTab === 'tab3' && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-xs text-slate-400">Populasi Ternak Aktif (Ekor):</label>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Panen Telur Harian</p>
                    <h3 className="text-2xl font-black text-amber-400 mt-2">
                      {projButirPerHari.toLocaleString('id-ID')} <span className="text-sm font-normal text-slate-400">butir</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">± {projRakPerHari} Rak isi 30</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Omset Bulanan</p>
                    <h3 className="text-2xl font-black text-white mt-2">{formatIDR(projOmsetBulanan)}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">{formatIDR(projOmsetHarian)} / hari</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Beban Pakan & Ops</p>
                    <h3 className="text-2xl font-black text-rose-400 mt-2">{formatIDR(projBiayaPakanBulanan + projBiayaOpsBulanan)}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Pakan: {formatIDR(projBiayaPakanBulanan)}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Est. Laba Bersih Bulanan</p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-2">{formatIDR(projLabaBersihBulanan)}</h3>
                    <p className="text-[11px] text-emerald-300/80 mt-1">Setara: {formatIDR(projLabaBersihBulanan * 12)}/tahun</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* COMMODITY 2: AYAM BROILER */}
        {/* ========================================================================= */}
        {activeCommodity === 'AYAM_PEDAGING' && (
          <>
            {activeTab === 'tab1' && (
              <div className="mt-6 space-y-6">
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                  <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200/90 leading-relaxed">
                    <strong>Indeks Performa (IP Broiler):</strong> Standar evaluasi efisiensi broiler industri.
                    Rumus: <code>(Daya Hidup % × Bobot Rata-rata Kg) / (FCR × Umur Hari) × 100</code>.
                    Kategori: <strong>≥400 (Istimewa)</strong>, <strong>350–399 (Sangat Baik)</strong>, <strong>300–349 (Baik)</strong>, <strong>&lt;300 (Kurang/Evaluasi)</strong>.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-xs text-slate-400">Umur Panen (Hari):</label>
                    <input
                      type="number"
                      value={broilerUmurHari}
                      onChange={(e) => setBroilerUmurHari(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Bobot Rata-rata (Kg):</label>
                    <input
                      type="number"
                      step={0.05}
                      value={broilerBobotKg}
                      onChange={(e) => setBroilerBobotKg(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Daya Hidup (SR %):</label>
                    <input
                      type="number"
                      value={broilerDayaHidup}
                      onChange={(e) => setBroilerDayaHidup(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Total Pakan / Ekor (Kg):</label>
                    <input
                      type="number"
                      step={0.1}
                      value={broilerTotalPakanEkorKg}
                      onChange={(e) => setBroilerTotalPakanEkorKg(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20">
                    <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Indeks Performa (IP)</p>
                    <h3 className="text-3xl font-black text-amber-400 mt-2">{ipBroilerCalc}</h3>
                    <p className="text-xs font-semibold text-amber-200 mt-1">
                      {ipBroilerCalc >= 400 ? '⭐ ISTIMEWA (Sangat Menguntungkan)' : ipBroilerCalc >= 350 ? '✅ SANGAT BAIK' : ipBroilerCalc >= 300 ? '⚠️ CUKUP BAIK' : '❌ PERLU EVALUASI'}
                    </p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rasio FCR Pakan</p>
                    <h3 className="text-3xl font-black text-sky-400 mt-2">{fcrBroilerCalc}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Konsumsi {broilerTotalPakanEkorKg} kg pakan per ekor</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rata-rata ADG Harian</p>
                    <h3 className="text-3xl font-black text-emerald-400 mt-2">{adgBroilerCalc} <span className="text-sm font-normal">g/hari</span></h3>
                    <p className="text-[11px] text-slate-400 mt-1">Pertambahan bobot rata-rata harian</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tab2' && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-xs text-slate-400">Harga DOC per Ekor (Rp):</label>
                    <input
                      type="number"
                      value={hargaDocBroiler}
                      onChange={(e) => setHargaDocBroiler(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Harga Pakan Broiler / Kg:</label>
                    <input
                      type="number"
                      value={hargaPakanBroilerKg}
                      onChange={(e) => setHargaPakanBroilerKg(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Biaya OVK, Listrik, Sekam / Ekor:</label>
                    <input
                      type="number"
                      value={biayaOvkBroilerEkor}
                      onChange={(e) => setBiayaOvkBroilerEkor(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Harga Jual Broiler Hidup / Kg:</label>
                    <input
                      type="number"
                      value={hargaJualBroilerKg}
                      onChange={(e) => setHargaJualBroilerKg(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">HPP Modal per Kg Daging</p>
                    <h3 className="text-2xl font-black text-amber-400 mt-2">{formatIDR(hppPerKgBroiler)} / Kg</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Total modal/ekor: {formatIDR(totalModalPerEkorBroiler)}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">BEP Harga Minimal</p>
                    <h3 className="text-2xl font-black text-white mt-2">{formatIDR(hppPerKgBroiler)}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Batas aman tidak rugi di kandang</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Margin Keuntungan</p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-2">
                      +{formatIDR(marginPerKgBroiler)} / Kg
                    </h3>
                    <p className="text-[11px] text-emerald-300/80 mt-1">Estimasi laba bersih: +{formatIDR(totalLabaPerEkorBroiler)}/ekor</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tab3' && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-xs text-slate-400">Populasi DOC Ditebar (Ekor):</label>
                    <input
                      type="number"
                      value={populasiDocTebar}
                      onChange={(e) => setPopulasiDocTebar(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Target Daya Hidup (%):</label>
                    <input
                      type="number"
                      value={broilerDayaHidup}
                      onChange={(e) => setBroilerDayaHidup(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Target Bobot Panen (Kg/ekor):</label>
                    <input
                      type="number"
                      step={0.05}
                      value={broilerBobotKg}
                      onChange={(e) => setBroilerBobotKg(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Tonase Panen</p>
                    <h3 className="text-2xl font-black text-amber-400 mt-2">
                      {estimasiTonasePanenKg.toLocaleString('id-ID')} <span className="text-sm font-normal">Kg</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">± {estimasiEkorPanen.toLocaleString('id-ID')} ekor ayam hidup</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Omset Panen Siklus</p>
                    <h3 className="text-2xl font-black text-white mt-2">{formatIDR(estimasiOmsetBroiler)}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Harga @{formatIDR(hargaJualBroilerKg)}/kg</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Biaya Operasional</p>
                    <h3 className="text-2xl font-black text-rose-400 mt-2">{formatIDR(estimasiTotalModalSiklus)}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">DOC + Pakan + OVK</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Est. Laba Bersih Siklus</p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-2">{formatIDR(estimasiLabaSiklusBroiler)}</h3>
                    <p className="text-[11px] text-emerald-300/80 mt-1">Siklus panen ± {broilerUmurHari} hari</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* COMMODITY 3: SAPI PERAH & POTONG */}
        {/* ========================================================================= */}
        {activeCommodity === 'SAPI' && (
          <>
            {activeTab === 'tab1' && (
              <div className="mt-6 space-y-6">
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                  <Activity className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200/90 leading-relaxed">
                    <strong>Manajemen Ransum Sapi:</strong> Sapi membutuhkan pakan hijauan segar sebanyak <strong>10% dari Bobot Badan (BB)</strong> dan konsentrat sebanyak <strong>1% – 2% dari BB</strong> untuk menjamin produksi susu prima & ADG harian tinggi.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-xs text-slate-400">Rata Bobot (Kg):</label>
                    <input
                      type="number"
                      value={bobotSapiAvgKg}
                      onChange={(e) => setBobotSapiAvgKg(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Hijauan (% BB):</label>
                    <input
                      type="number"
                      value={persenHijauan}
                      onChange={(e) => setPersenHijauan(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Harga Hijauan/Kg:</label>
                    <input
                      type="number"
                      value={hargaHijauanKg}
                      onChange={(e) => setHargaHijauanKg(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Konsentrat (% BB):</label>
                    <input
                      type="number"
                      step={0.1}
                      value={persenKonsentratSapi}
                      onChange={(e) => setPersenKonsentratSapi(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Harga Konsentrat/Kg:</label>
                    <input
                      type="number"
                      value={hargaKonsentratSapiKg}
                      onChange={(e) => setHargaKonsentratSapiKg(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kebutuhan Hijauan Harian</p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-2">{kgHijauanPerEkorHari} Kg <span className="text-sm font-normal text-slate-400">/ekor/hari</span></h3>
                    <p className="text-[11px] text-slate-400 mt-1">Rumput gajah / odot segar</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kebutuhan Konsentrat Harian</p>
                    <h3 className="text-2xl font-black text-amber-400 mt-2">{kgKonsentratPerEkorHari} Kg <span className="text-sm font-normal text-slate-400">/ekor/hari</span></h3>
                    <p className="text-[11px] text-slate-400 mt-1">Konsentrat sapi laktasi / penggemukan</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Biaya Pakan / Ekor / Hari</p>
                    <h3 className="text-2xl font-black text-white mt-2">{formatIDR(biayaRansumSapiHari)}</h3>
                    <p className="text-[11px] text-emerald-300/80 mt-1">Setara {formatIDR(biayaRansumSapiHari * 30)} / ekor / bulan</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tab2' && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-xs text-slate-400">Produksi Susu / Ekor / Hari (Liter):</label>
                    <input
                      type="number"
                      value={literSusuPerEkorHari}
                      onChange={(e) => setLiterSusuPerEkorHari(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Biaya TK & Listrik / Ekor / Hari:</label>
                    <input
                      type="number"
                      value={biayaOpsSapiEkorHari}
                      onChange={(e) => setBiayaOpsSapiEkorHari(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Harga Jual Susu Segar / Liter (Rp):</label>
                    <input
                      type="number"
                      value={hargaJualSusuLiter}
                      onChange={(e) => setHargaJualSusuLiter(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">HPP (Modal) Susu / Liter</p>
                    <h3 className="text-2xl font-black text-amber-400 mt-2">{formatIDR(hppPerLiterSusu)} / Liter</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Total biaya harian/ekor: {formatIDR(totalBiayaHarianSapi)}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">BEP Minimal Koperasi</p>
                    <h3 className="text-2xl font-black text-white mt-2">{formatIDR(hppPerLiterSusu)}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Batas aman impas per liter</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Margin Laba / Liter</p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-2">+{formatIDR(marginPerLiterSusu)} / L</h3>
                    <p className="text-[11px] text-emerald-300/80 mt-1">Laba bersih harian per sapi: +{formatIDR(marginPerLiterSusu * literSusuPerEkorHari)}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tab3' && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-xs text-slate-400">Jumlah Sapi Laktasi Aktif:</label>
                    <input
                      type="number"
                      value={jumlahSapiLaktasi}
                      onChange={(e) => setJumlahSapiLaktasi(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Rata-rata Produksi Susu / Ekor:</label>
                    <input
                      type="number"
                      value={literSusuPerEkorHari}
                      onChange={(e) => setLiterSusuPerEkorHari(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Harga Jual Susu (Rp/Liter):</label>
                    <input
                      type="number"
                      value={hargaJualSusuLiter}
                      onChange={(e) => setHargaJualSusuLiter(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Susu Bulanan</p>
                    <h3 className="text-2xl font-black text-sky-400 mt-2">{totalLiterSusuBulanan.toLocaleString('id-ID')} <span className="text-sm font-normal">Liter</span></h3>
                    <p className="text-[11px] text-slate-400 mt-1">± {jumlahSapiLaktasi * literSusuPerEkorHari} Liter/hari</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Omset Penjualan Susu</p>
                    <h3 className="text-2xl font-black text-white mt-2">{formatIDR(omsetSusuBulanan)}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Setara {formatIDR(omsetSusuBulanan / 30)} / hari</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Biaya Pakan & Ops</p>
                    <h3 className="text-2xl font-black text-rose-400 mt-2">{formatIDR(totalBiayaSapiBulanan)}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Untuk {jumlahSapiLaktasi} ekor sapi</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Est. Laba Bersih Bulanan</p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-2">{formatIDR(labaSapiBulanan)}</h3>
                    <p className="text-[11px] text-emerald-300/80 mt-1">Belum termasuk nilai anak pedet & pupuk</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* COMMODITY 4: BUDIDAYA IKAN LELE */}
        {/* ========================================================================= */}
        {activeCommodity === 'LELE' && (
          <>
            {activeTab === 'tab1' && (
              <div className="mt-6 space-y-6">
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                  <Activity className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200/90 leading-relaxed">
                    <strong>FCR & Bioflok Ikan Lele:</strong> Standar FCR lele bioflok unggul berada pada rasio <strong>0.85 – 1.05</strong> (setiap 1 kg pelet menghasilkan ~1 kg daging). Kunci bioflok adalah menjaga flok probiotik aktif dan pergantian air minimal.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-xs text-slate-400">Populasi Tebar Benih (Ekor):</label>
                    <input
                      type="number"
                      value={populasiBenihLele}
                      onChange={(e) => setPopulasiBenihLele(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Survival Rate (SR %):</label>
                    <input
                      type="number"
                      value={leleSurvivalRate}
                      onChange={(e) => setLeleSurvivalRate(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Sampling Ukuran (Ekor/Kg):</label>
                    <input
                      type="number"
                      value={leleSamplingIsiPerKg}
                      onChange={(e) => setLeleSamplingIsiPerKg(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Total Pelet Terpakai (Kg):</label>
                    <input
                      type="number"
                      value={totalPeletTerpakaiKg}
                      onChange={(e) => setTotalPeletTerpakaiKg(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Est. Biomassa Kolam</p>
                    <h3 className="text-2xl font-black text-sky-400 mt-2">{estimasiBiomassaLeleKg.toLocaleString('id-ID')} Kg</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Ikan hidup: ± {estimasiIkanHidup.toLocaleString('id-ID')} ekor</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20">
                    <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Rasio FCR Kolam</p>
                    <h3 className="text-2xl font-black text-amber-400 mt-2">{fcrLeleCalc}</h3>
                    <p className="text-xs font-semibold text-amber-200 mt-1">
                      {fcrLeleCalc <= 1.0 ? '⭐ SANGAT EFISIEN (Bioflok Prima)' : fcrLeleCalc <= 1.2 ? '✅ BAIK & NORMAL' : '⚠️ BOROS PAKAN'}
                    </p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tingkat Kelangsungan Hidup</p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-2">{leleSurvivalRate}%</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Mortalitas: {100 - leleSurvivalRate}%</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tab2' && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-xs text-slate-400">Harga Bibit Benih / Ekor:</label>
                    <input
                      type="number"
                      value={hargaBenihPerEkor}
                      onChange={(e) => setHargaBenihPerEkor(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Harga Pakan Pelet / Kg:</label>
                    <input
                      type="number"
                      value={hargaPeletLeleKg}
                      onChange={(e) => setHargaPeletLeleKg(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Biaya Listrik, Garam, Probiotik / Kg:</label>
                    <input
                      type="number"
                      value={biayaProbiotikListrikKg}
                      onChange={(e) => setBiayaProbiotikListrikKg(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Harga Jual Lele Panen / Kg:</label>
                    <input
                      type="number"
                      value={hargaJualLeleKg}
                      onChange={(e) => setHargaJualLeleKg(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">HPP (Modal) Panen / Kg</p>
                    <h3 className="text-2xl font-black text-amber-400 mt-2">{formatIDR(hppPerKgLele)} / Kg</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Total modal kolam: {formatIDR(totalBiayaSiklusLele)}</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">BEP Minimal Penjualan</p>
                    <h3 className="text-2xl font-black text-white mt-2">{formatIDR(hppPerKgLele)}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Batas aman tengkulak/pasar</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Margin Laba / Kg</p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-2">+{formatIDR(marginPerKgLele)} / Kg</h3>
                    <p className="text-[11px] text-emerald-300/80 mt-1">
                      Estimasi laba per kolam: +{formatIDR(marginPerKgLele * estimasiBiomassaLeleKg)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tab3' && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-xs text-slate-400">Jumlah Kolam Aktif:</label>
                    <input
                      type="number"
                      value={jumlahKolamLele}
                      onChange={(e) => setJumlahKolamLele(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Tebar per Kolam (Ekor):</label>
                    <input
                      type="number"
                      value={populasiBenihLele}
                      onChange={(e) => setPopulasiBenihLele(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Harga Jual Lele Panen (Rp/Kg):</label>
                    <input
                      type="number"
                      value={hargaJualLeleKg}
                      onChange={(e) => setHargaJualLeleKg(Number(e.target.value))}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Tonase Panen</p>
                    <h3 className="text-2xl font-black text-sky-400 mt-2">
                      {totalTonasePanenSemuaKolam.toLocaleString('id-ID')} <span className="text-sm font-normal">Kg</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Dari {jumlahKolamLele} unit kolam</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Omset Panen Siklus</p>
                    <h3 className="text-2xl font-black text-white mt-2">{formatIDR(totalOmsetLeleSiklus)}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Siklus 60–75 hari</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Modal Benih & Pakan</p>
                    <h3 className="text-2xl font-black text-rose-400 mt-2">{formatIDR(totalModalSemuaKolam)}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Semua kolam operasional</p>
                  </div>
                  <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Est. Laba Bersih Panen</p>
                    <h3 className="text-2xl font-black text-emerald-400 mt-2">{formatIDR(totalLabaSiklusLele)}</h3>
                    <p className="text-[11px] text-emerald-300/80 mt-1">Keuntungan bersih per siklus panen</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer Modal */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Tutup Kalkulator
          </button>
        </div>
      </div>
    </div>
  );
};
