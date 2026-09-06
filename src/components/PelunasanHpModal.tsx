import React, { useState } from 'react';
import {
  CreditCard,
  X,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import type { HutangPiutang } from '../types';
import { StorageService } from '../services/storage';
import { AuthService } from '../services/authService';
import { formatIDR } from '../utils/exportUtils';
import { useToast } from './ToastContainer';

interface PelunasanHpModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: HutangPiutang | null;
  onRefreshData: () => void;
}

export const PelunasanHpModal: React.FC<PelunasanHpModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  onRefreshData,
}) => {
  const { showToast } = useToast();

  if (!isOpen || !targetItem) return null;

  const isPiutang = targetItem.jenis === 'PIUTANG';
  const [nominalBayar, setNominalBayar] = useState<number>(targetItem.sisaNominal);
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [akunKasId, setAkunKasId] = useState<string>('101'); // 101: Kas Tunai, 102: Bank
  const [catatan, setCatatan] = useState<string>('');

  const handleSendReminderWA = () => {
    if (!targetItem) return;
    const phoneClean = targetItem.noHp ? targetItem.noHp.replace(/\D/g, '') : '';
    const formattedPhone = phoneClean.startsWith('0') ? '62' + phoneClean.slice(1) : phoneClean;
    const farmName = AuthService.getCurrentUser()?.farmName || 'PETERNAKAN BEBEK JAYA';
    const ownerName = AuthService.getCurrentUser()?.name || 'H. Pratama';

    const msg = `Halo Bapak/Ibu *${targetItem.namaKontak}*,
Semoga usaha dan aktivitas Bapak/Ibu senantiasa lancar.

Kami dari *${farmName}* ingin mengonfirmasikan catatan tagihan penjualan hasil panen telur bebek:
• Keterangan : *${targetItem.deskripsi}*
• Total Tagihan : *${formatIDR(targetItem.nominalTotal)}*
• Sisa Belum Lunas : *${formatIDR(targetItem.sisaNominal)}*
• Jatuh Tempo : *${targetItem.tglJatuhTempo}*

Pembayaran dapat ditransfer melalui:
BCA : 887-201-9922 a.n ${ownerName}
BRI : 0122-01-002931-50 a.n ${ownerName}

Mohon konfirmasi jika transfer telah dilakukan. Terima kasih banyak atas kerja sama baiknya! 🙏`;

    const waUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
  };

  const handleQuickPercent = (pct: number) => {
    setNominalBayar(Math.round((targetItem.sisaNominal * pct) / 100));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (nominalBayar <= 0) {
      showToast('Nominal pembayaran harus lebih dari 0!', 'warning');
      return;
    }

    if (nominalBayar > targetItem.sisaNominal) {
      showToast('Nominal pembayaran melebihi sisa tagihan/hutang!', 'warning');
      return;
    }

    try {
      StorageService.payHutangPiutang({
        hpId: targetItem.id,
        nominalBayar,
        tanggal,
        akunKasId,
        catatan: catatan || undefined,
      });

      onRefreshData();
      showToast(
        `Pembayaran ${formatIDR(nominalBayar)} untuk ${targetItem.namaKontak} berhasil dicatat!`,
        'success',
        isPiutang ? 'Penerimaan Piutang Berhasil' : 'Pembayaran Hutang Berhasil'
      );
      onClose();
    } catch (err: any) {
      showToast(`Gagal memproses pembayaran: ${err.message}`, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel-glow w-full max-w-lg rounded-3xl p-6 relative animate-toast border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isPiutang
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {isPiutang ? 'Terima Pelunasan / Cicilan Piutang' : 'Bayar Cicilan / Pelunasan Hutang'}
              </h3>
              <p className="text-xs text-slate-400">
                {targetItem.namaKontak} • {targetItem.deskripsi}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Card Info Tagihan */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Tagihan Awal:</span>
              <span className="font-bold text-white">{formatIDR(targetItem.nominalTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Sisa yang Belum Lunas:</span>
              <span className={`font-black text-sm ${isPiutang ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatIDR(targetItem.sisaNominal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800">
              <span>Jatuh Tempo:</span>
              <span className="font-bold text-amber-300">{targetItem.tglJatuhTempo}</span>
            </div>

            {isPiutang && targetItem.sisaNominal > 0 && (
              <button
                type="button"
                onClick={handleSendReminderWA}
                className="w-full mt-2 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" /> Kirim Pengingat Tagihan via WhatsApp
              </button>
            )}
          </div>


          {/* Nominal Pembayaran & Quick Buttons */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">
              Nominal yang {isPiutang ? 'Diterima' : 'Dibayarkan'} (Rp):
            </label>
            <input
              type="number"
              min={1}
              max={targetItem.sisaNominal}
              value={nominalBayar}
              onChange={(e) => setNominalBayar(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-black text-lg outline-none focus:border-amber-400"
            />

            {/* Quick buttons */}
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleQuickPercent(100)}
                className="flex-1 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-colors"
              >
                Lunasi Semua (100%)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPercent(50)}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
              >
                Bayar 50%
              </button>
              <button
                type="button"
                onClick={() => handleQuickPercent(25)}
                className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
              >
                Bayar 25%
              </button>
            </div>
          </div>

          {/* Tanggal & Akun Kas / Bank */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Tanggal Transaksi:</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Akun Pembayaran:</label>
              <select
                value={akunKasId}
                onChange={(e) => setAkunKasId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none"
              >
                <option value="101">101 - Kas Tunai</option>
                <option value="102">102 - Bank Transfer</option>
              </select>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Catatan Tambahan (Opsional):</label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Cicilan tahap 1 transfer BCA"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl font-black text-xs text-slate-950 shadow-lg transition-all active:scale-95 flex items-center gap-1.5 ${
                isPiutang
                  ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20'
                  : 'bg-amber-400 hover:bg-amber-300 shadow-amber-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Proses Pembayaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
