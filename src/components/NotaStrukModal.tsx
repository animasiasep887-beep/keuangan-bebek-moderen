import React, { useRef } from 'react';
import {
  X,
  Printer,
  Share2,
  Egg,
} from 'lucide-react';

import { formatIDR } from '../utils/exportUtils';
import { AuthService } from '../services/authService';

export interface NotaData {
  noRef: string;
  tanggal: string;
  namaPembeli: string;
  noHp?: string;
  kategoriLabel: string;
  jumlahQty: number;
  satuan: string;
  hargaPerSatuan: number;
  totalNominal: number;
  metodeBayar: 'TUNAI' | 'TRANSFER' | 'TEMPO';
  tglJatuhTempo?: string;
  catatan?: string;
}

interface NotaStrukModalProps {
  isOpen: boolean;
  onClose: () => void;
  nota: NotaData | null;
}

export const NotaStrukModal: React.FC<NotaStrukModalProps> = ({ isOpen, onClose, nota }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const currentUser = AuthService.getCurrentUser();

  if (!isOpen || !nota) return null;

  const farmName = currentUser?.farmName || 'PETERNAKAN BEBEK JAYA UTAMA';
  const ownerName = currentUser?.name || 'H. Pratama';

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const phoneClean = nota.noHp ? nota.noHp.replace(/\D/g, '') : '';
    const formattedPhone = phoneClean.startsWith('0') ? '62' + phoneClean.slice(1) : phoneClean;

    const message = `*NOTA RESMI PENJUALAN HASIL PANEN*
*${farmName.toUpperCase()}*
--------------------------------------------
No. Nota    : *${nota.noRef}*
Tanggal     : ${nota.tanggal}
Pelanggan   : *${nota.namaPembeli}*
Metode Bayar: *${nota.metodeBayar}*
${nota.metodeBayar === 'TEMPO' ? `Jatuh Tempo : *${nota.tglJatuhTempo}*\n` : ''}--------------------------------------------
*Rincian Pesanan:*
• ${nota.kategoriLabel}
  ${nota.jumlahQty} ${nota.satuan} x ${formatIDR(nota.hargaPerSatuan)}
  *Subtotal: ${formatIDR(nota.totalNominal)}*
--------------------------------------------
*TOTAL TAGIHAN: ${formatIDR(nota.totalNominal)}*
Status: *${nota.metodeBayar === 'TEMPO' ? 'MENUNGGU PELUNASAN (TEMPO)' : 'LUNAS TERBAYAR'}*
${nota.catatan ? `Catatan: ${nota.catatan}\n` : ''}
Rekening Pembayaran:
BCA : 887-201-9922 a.n ${ownerName}
BRI : 0122-01-002931-50 a.n ${ownerName}

Terima kasih atas kerja sama dan kepercayaan Anda!
_Diterbitkan otomatis via BebekJaya PRO ERP System_`;

    const waUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col relative max-h-[95vh]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-600/30 to-slate-900 border-b border-amber-500/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 rounded-xl text-slate-950 font-black shadow-md">
              <Egg className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Struk Transaksi Penjualan</h3>
              <p className="text-xs text-amber-400/90 font-medium">Transaksi Berhasil Dicatat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Struk Thermal View Preview */}
        <div className="p-5 overflow-y-auto bg-slate-950/50 flex flex-col items-center">
          <div
            ref={receiptRef}
            id="printable-receipt"
            className="w-full max-w-[340px] bg-white text-slate-950 p-6 rounded-2xl shadow-xl font-mono text-xs border border-slate-300 relative print:m-0 print:shadow-none print:w-full"
          >
            {/* Struk Jagged Top Decor */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
              <div className="flex justify-center mb-1">
                <span className="font-black text-sm tracking-wider uppercase text-slate-900">
                  {farmName}
                </span>
              </div>
              <p className="text-[10px] text-slate-600">Sistem Informasi Peternakan Bebek Terpadu</p>
              <p className="text-[10px] text-slate-600 font-bold mt-0.5">NOTA PENJUALAN TELUR & PANEN</p>
            </div>

            {/* Info Transaksi */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-3 mb-3 text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Ref:</span>
                <span className="font-bold">{nota.noRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal:</span>
                <span>{nota.tanggal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan:</span>
                <span className="font-bold">{nota.namaPembeli}</span>
              </div>
              {nota.noHp && (
                <div className="flex justify-between">
                  <span className="text-slate-500">No. HP/WA:</span>
                  <span>{nota.noHp}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Metode:</span>
                <span className="font-black px-1.5 py-0.2 rounded bg-slate-200 text-slate-900">
                  {nota.metodeBayar}
                </span>
              </div>
              {nota.metodeBayar === 'TEMPO' && (
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>Jatuh Tempo:</span>
                  <span>{nota.tglJatuhTempo}</span>
                </div>
              )}
            </div>

            {/* Rincian Item */}
            <div className="border-b border-dashed border-slate-400 pb-3 mb-3">
              <div className="font-bold text-slate-900 mb-1">{nota.kategoriLabel}</div>
              <div className="flex justify-between text-slate-700">
                <span>
                  {nota.jumlahQty} {nota.satuan} x {formatIDR(nota.hargaPerSatuan)}
                </span>
                <span className="font-bold text-slate-900">{formatIDR(nota.totalNominal)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="space-y-1.5 pt-1 mb-4 text-xs">
              <div className="flex justify-between font-black text-sm text-slate-950">
                <span>TOTAL:</span>
                <span>{formatIDR(nota.totalNominal)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold">
                <span>Status:</span>
                <span className={nota.metodeBayar === 'TEMPO' ? 'text-rose-600' : 'text-emerald-700'}>
                  {nota.metodeBayar === 'TEMPO' ? 'PIUTANG (BELUM LUNAS)' : 'LUNAS TERBAYAR'}
                </span>
              </div>
            </div>

            {/* Footer Struk */}
            <div className="text-center text-[10px] text-slate-500 border-t border-dashed border-slate-400 pt-3">
              <p>Terima kasih atas kerjasamanya!</p>
              <p className="font-bold text-slate-700 mt-1">BCA: 887-201-9922 a.n {ownerName}</p>
              <p className="text-[9px] text-slate-400 mt-1">Dicetak: {new Date().toLocaleTimeString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex flex-col gap-2.5">
          <button
            onClick={handleSendWhatsApp}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all"
          >
            <Share2 className="w-4 h-4" /> Kirim Nota Resmi via WhatsApp
          </button>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" /> Cetak Struk (Thermal / PDF)
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
