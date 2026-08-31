import React, { useState } from 'react';
import {
  Bell,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
} from 'lucide-react';
import { NotificationService, type NotificationConfig } from '../services/notificationService';
import { useToast } from './ToastContainer';

interface NotifikasiPengaturanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotifikasiPengaturanModal: React.FC<NotifikasiPengaturanModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [config, setConfig] = useState<NotificationConfig>(NotificationService.getConfig());
  const [permission, setPermission] = useState<NotificationPermission>(NotificationService.getPermission());

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const perm = await NotificationService.requestPermission();
    setPermission(perm);
    if (perm === 'granted') {
      showToast('✅ Izin notifikasi berhasil diaktifkan!', 'success');
      NotificationService.testNotificationNow();
    } else if (perm === 'denied') {
      showToast('⚠️ Izin notifikasi ditolak oleh browser. Silakan izinkan di icon gembok browser.', 'error');
    }
  };

  const handleToggleEnabled = () => {
    const updated = { ...config, enabled: !config.enabled };
    setConfig(updated);
    NotificationService.saveConfig(updated);
    showToast(`Pengingat otomatis ${updated.enabled ? 'diaktifkan' : 'dinonaktifkan'}`, 'info');
  };

  const handleSaveTime = (field: 'timeFirst' | 'timeSecond', val: string) => {
    const updated = { ...config, [field]: val };
    setConfig(updated);
    NotificationService.saveConfig(updated);
  };

  const handleTestNotification = async () => {
    if (permission !== 'granted') {
      const perm = await NotificationService.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        showToast('Mohon izinkan notifikasi terlebih dahulu agar pesan dapat muncul di HP', 'warning');
        return;
      }
    }

    const ok = await NotificationService.testNotificationNow();
    if (ok) {
      showToast('🔔 Notifikasi percobaan berhasil dikirim ke HP Anda!', 'success');
    } else {
      showToast('Gagal mengirim notifikasi. Pastikan izin notifikasi aktif di browser.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel-glow w-full max-w-lg rounded-3xl border border-amber-500/30 bg-slate-950/95 shadow-2xl p-6 sm:p-7 relative text-white space-y-5 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Pengingat Panen Otomatis</h3>
              <p className="text-xs text-slate-400">Jadwal Notifikasi Jam 07:00 & 08:00 Pagi di HP</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Izin Notifikasi Box */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            permission === 'granted'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {permission === 'granted' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold text-white">
                {permission === 'granted'
                  ? 'Izin Notifikasi Aktif'
                  : 'Izin Notifikasi Belum Diaktifkan'}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {permission === 'granted'
                  ? 'HP Anda siap menerima pengingat panen otomatis setiap pagi.'
                  : 'Aktifkan izin agar HP Anda dapat berdering & memunculkan pengingat.'}
              </p>
            </div>
          </div>

          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              Izinkan
            </button>
          )}
        </div>

        {/* Setting Switch & Times */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">Aktifkan Pengingat Harian</p>
              <p className="text-[11px] text-slate-400">Kirim notifikasi setiap pagi secara otomatis</p>
            </div>

            <button
              onClick={handleToggleEnabled}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                config.enabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  config.enabled ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Time 1: 07:00 Pagi */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">🌅 Pengingat 1: Panen Telur Pagi</p>
                <p className="text-[11px] text-slate-400">Waktu utama mencatat hasil telur</p>
              </div>
            </div>

            <input
              type="time"
              value={config.timeFirst}
              onChange={(e) => handleSaveTime('timeFirst', e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-black outline-none"
            />
          </div>

          {/* Time 2: 08:00 Pagi (Follow-up Reminder) */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">⏰ Pengingat 2: Reminder Lanjutan</p>
                <p className="text-[11px] text-slate-400">Mencegah lupa input data jika belum sempat</p>
              </div>
            </div>

            <input
              type="time"
              value={config.timeSecond}
              onChange={(e) => handleSaveTime('timeSecond', e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-rose-400 font-black outline-none"
            />
          </div>
        </div>

        {/* Test Notification Button */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleTestNotification}
            className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            🔔 Uji Notifikasi Sekarang ke HP
          </button>
          <button
            onClick={onClose}
            className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
