import React, { useState } from 'react';
import {
  TrendingUp,
  X,
  Sparkles,
  Scale,
  AlertTriangle,
  Share2,
} from 'lucide-react';
import { formatIDR } from '../utils/exportUtils';
import { AuthService } from '../services/authService';

interface ProyeksiBisnisModalProps {
  isOpen: boolean;
  onClose: () => void;
  populasiDefault?: number;
}

export const ProyeksiBisnisModal: React.FC<ProyeksiBisnisModalProps> = ({
  isOpen,
  onClose,
  populasiDefault = 1000,
}) => {
  const [populasi, setPopulasi] = useState<number>(populasiDefault || 1000);
  const [hdpPercentage, setHdpPercentage] = useState<number>(80); // 80% Hen-Day Production
  const [hargaTelurPerButir, setHargaTelurPerButir] = useState<number>(2400); // Rp 2.400 / butir
  const [hargaPakanPerKg, setHargaPakanPerKg] = useState<number>(8000); // Rp 8.000 / kg
  const [konsumsiGramPerEkor, setKonsumsiGramPerEkor] = useState<number>(150); // 150 gram/ekor/hari
  const [biayaOpsPerEkorBulan, setBiayaOpsPerEkorBulan] = useState<number>(3000); // Listrik, obat, sekam, upah

  if (!isOpen) return null;

  // Realtime Business Math
  const totalTelurHari = Math.round((populasi * hdpPercentage) / 100);
  const totalTelurBulan = totalTelurHari * 30;
  const totalTelurTahun = totalTelurHari * 365;

  const omzetBulan = totalTelurBulan * hargaTelurPerButir;
  const omzetTahun = totalTelurTahun * hargaTelurPerButir;


  const konsumsiKgHari = (populasi * konsumsiGramPerEkor) / 1000;
  const biayaPakanHari = konsumsiKgHari * hargaPakanPerKg;
  const biayaPakanBulan = biayaPakanHari * 30;
  const biayaPakanTahun = biayaPakanHari * 365;

  const biayaOpsBulan = populasi * biayaOpsPerEkorBulan;
  const biayaOpsTahun = biayaOpsBulan * 12;

  const totalPengeluaranBulan = biayaPakanBulan + biayaOpsBulan;
  const totalPengeluaranTahun = biayaPakanTahun + biayaOpsTahun;

  const labaBersihBulan = omzetBulan - totalPengeluaranBulan;
  const labaBersihTahun = omzetTahun - totalPengeluaranTahun;

  const feedCostPerEgg = totalTelurHari > 0 ? Math.round(biayaPakanHari / totalTelurHari) : 0;
  const hppPerButir = totalTelurBulan > 0 ? Math.round(totalPengeluaranBulan / totalTelurBulan) : 0;
  const marginPerButir = hargaTelurPerButir - hppPerButir;
  const profitMarginPercent = omzetBulan > 0 ? Number(((labaBersihBulan / omzetBulan) * 100).toFixed(1)) : 0;

  // Sensitivity Scenarios
  const labaJikaPakanNaik10 = omzetBulan - (biayaPakanBulan * 1.1 + biayaOpsBulan);
  const labaJikaHargaTelurTurun5 = (omzetBulan * 0.95) - totalPengeluaranBulan;

  const handleShareWhatsApp = () => {
    const farmName = AuthService.getCurrentUser()?.farmName || 'PETERNAKAN BEBEK JAYA';
    const msg = `*SIMULASI & PROYEKSI FINANSIAL PETERNAKAN BEBEK*
*${farmName.toUpperCase()}*
--------------------------------------------
• Populasi Bebek   : *${populasi.toLocaleString('id-ID')} ekor*
• Rata-rata HDP    : *${hdpPercentage}%* (${totalTelurHari.toLocaleString('id-ID')} butir/hari)
• Harga Jual Telur : *${formatIDR(hargaTelurPerButir)} / butir*
• Biaya Pakan      : *${formatIDR(hargaPakanPerKg)} / kg* (${konsumsiGramPerEkor} gr/ekor)
--------------------------------------------
*HASIL ANALISIS BIAYA & MARGIN:*
• Biaya Pakan per Butir (FCPE) : *${formatIDR(feedCostPerEgg)}*
• HPP Total per Butir          : *${formatIDR(hppPerButir)}*
• Margin Keuntungan per Butir  : *${formatIDR(marginPerButir)}*
• Margin Laba Bersih           : *${profitMarginPercent}%*
--------------------------------------------
*ESTIMASI KEUNTUNGAN FINANSIAL:*
• Omzet Kotor / Bulan   : *${formatIDR(omzetBulan)}*
• Total Biaya / Bulan   : *${formatIDR(totalPengeluaranBulan)}*
👉 *LABA BERSIH / BULAN : ${formatIDR(labaBersihBulan)}*
👉 *LABA BERSIH / TAHUN : ${formatIDR(labaBersihTahun)}*
--------------------------------------------
_Kalkulasi Proyeksi Cerdas BebekJaya PRO Enterprise_`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-panel-glow w-full max-w-4xl rounded-3xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto my-auto border border-amber-500/30">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                Simulasi Finansial & Proyeksi 12 Bulan <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                Hitung estimasi omzet, Feed Cost per Egg (FCPE), margin laba bersih, dan titik impas BEP.
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

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Parameter Inputs */}
          <div className="lg:col-span-5 space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4" /> Variabel & Parameter Peternakan
            </h3>

            {/* Populasi */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-bold">Populasi Bebek Produktif:</span>
                <span className="text-amber-400 font-black">{populasi.toLocaleString('id-ID')} ekor</span>
              </div>
              <input
                type="range"
                min={100}
                max={10000}
                step={50}
                value={populasi}
                onChange={(e) => setPopulasi(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* HDP % */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-bold">Produktivitas Telur (HDP %):</span>
                <span className="text-amber-400 font-black">{hdpPercentage}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={95}
                step={1}
                value={hdpPercentage}
                onChange={(e) => setHdpPercentage(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Estimasi panen: <strong>{totalTelurHari.toLocaleString('id-ID')} butir/hari</strong> ({(totalTelurHari / 30).toFixed(0)} rak)
              </p>
            </div>

            {/* Harga Jual Telur */}
            <div>
              <label className="block text-xs text-slate-300 font-bold mb-1">
                Harga Jual Telur per Butir (Rp):
              </label>
              <input
                type="number"
                value={hargaTelurPerButir}
                onChange={(e) => setHargaTelurPerButir(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-amber-300 outline-none"
              />
              <span className="text-[10px] text-slate-400">
                Setara: {formatIDR(hargaTelurPerButir * 30)} / rak (isi 30 butir)
              </span>
            </div>

            {/* Harga Pakan per Kg */}
            <div>
              <label className="block text-xs text-slate-300 font-bold mb-1">
                Harga Pakan Rata-rata per Kg (Rp):
              </label>
              <input
                type="number"
                value={hargaPakanPerKg}
                onChange={(e) => setHargaPakanPerKg(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-emerald-300 outline-none"
              />
            </div>

            {/* Konsumsi Pakan gram/ekor/hari */}
            <div>
              <label className="block text-xs text-slate-300 font-bold mb-1">
                Konsumsi Pakan per Ekor / Hari (Gram):
              </label>
              <input
                type="number"
                value={konsumsiGramPerEkor}
                onChange={(e) => setKonsumsiGramPerEkor(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold outline-none"
              />
              <span className="text-[10px] text-slate-400">
                Kebutuhan pakan harian kandang: <strong>{konsumsiKgHari} kg/hari</strong>
              </span>
            </div>

            {/* Beban Ops Lain */}
            <div>
              <label className="block text-xs text-slate-300 font-bold mb-1">
                Biaya Ops Lain per Ekor / Bulan (Rp):
              </label>
              <input
                type="number"
                value={biayaOpsPerEkorBulan}
                onChange={(e) => setBiayaOpsPerEkorBulan(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold outline-none"
              />
              <span className="text-[10px] text-slate-400">
                Mencakup vaksin/vitamin, sekam, listrik kandang & upah kerja.
              </span>
            </div>
          </div>

          {/* Right Column: Calculations & Projections */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Profit Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-amber-950/40 border border-emerald-500/40 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Estimasi Laba Bersih Peternakan (Net Profit)
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                    {formatIDR(labaBersihBulan)}
                    <span className="text-xs font-normal text-slate-400 ml-1">/ bulan</span>
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400">Proyeksi 1 Tahun:</span>
                  <p className="text-xl sm:text-2xl font-black text-amber-400">{formatIDR(labaBersihTahun)}</p>
                </div>
              </div>

              {/* Breakdown Bar */}
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Omzet Kotor:</span>
                  <p className="font-bold text-white mt-0.5">{formatIDR(omzetBulan)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Biaya Pakan:</span>
                  <p className="font-bold text-rose-400 mt-0.5">{formatIDR(biayaPakanBulan)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Biaya Ops Lain:</span>
                  <p className="font-bold text-amber-400 mt-0.5">{formatIDR(biayaOpsBulan)}</p>
                </div>
              </div>
            </div>

            {/* Key Efficiency Unit Economics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-panel p-3.5 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Feed Cost / Egg</p>
                <p className="text-lg font-black text-amber-400 mt-1">{formatIDR(feedCostPerEgg)}</p>
                <p className="text-[9px] text-slate-500">Biaya pakan/butir</p>
              </div>

              <div className="glass-panel p-3.5 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase">HPP per Butir</p>
                <p className="text-lg font-black text-sky-400 mt-1">{formatIDR(hppPerButir)}</p>
                <p className="text-[9px] text-slate-500">BEP minimal modal</p>
              </div>

              <div className="glass-panel p-3.5 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Margin per Butir</p>
                <p className="text-lg font-black text-emerald-400 mt-1">+{formatIDR(marginPerButir)}</p>
                <p className="text-[9px] text-slate-500">Keuntungan bersih</p>
              </div>

              <div className="glass-panel p-3.5 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Margin Profit</p>
                <p className="text-lg font-black text-purple-400 mt-1">{profitMarginPercent}%</p>
                <p className="text-[9px] text-slate-500">Rasio net margin</p>
              </div>
            </div>

            {/* Stress Test & Sensitivity Matrix */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Uji Ketahanan Bisnis (Sensitivitas Pasar)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Jika Pakan Naik +10%:</span>
                  <p className={`font-extrabold mt-0.5 ${labaJikaPakanNaik10 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Laba Bersih: {formatIDR(labaJikaPakanNaik10)}/bln
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Jika Telur Turun -5%:</span>
                  <p className={`font-extrabold mt-0.5 ${labaJikaHargaTelurTurun5 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Laba Bersih: {formatIDR(labaJikaHargaTelurTurun5)}/bln
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleShareWhatsApp}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Share2 className="w-4 h-4" /> Bagikan Proyeksi Bisnis ke WhatsApp
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs sm:text-sm transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
