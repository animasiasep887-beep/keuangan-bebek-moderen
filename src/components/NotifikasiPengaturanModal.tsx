import React, { useState } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Music,
  RotateCcw,
  SmartphoneNfc,
} from 'lucide-react';
import {
  NotificationService,
  SOUND_OPTIONS,
  type NotificationConfig,
  type ReminderItem,
  type SoundType,
} from '../services/notificationService';
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
  const [activeTab, setActiveTab] = useState<'jadwal' | 'suara'>('jadwal');

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const perm = await NotificationService.requestPermission();
    setPermission(perm);
    if (perm === 'granted') {
      showToast('✅ Izin notifikasi aktif! HP Anda siap menerima pengingat berdering.', 'success');
      NotificationService.testNotificationNow();
    } else if (perm === 'denied') {
      showToast('⚠️ Izin notifikasi diblokir browser. Silakan klik icon gembok di browser untuk mengizinkan.', 'error');
    }
  };

  const handleToggleMaster = () => {
    const updated = { ...config, enabled: !config.enabled };
    setConfig(updated);
    NotificationService.saveConfig(updated);
    showToast(`Master notifikasi ${updated.enabled ? 'diaktifkan' : 'dinonaktifkan'}`, 'info');
  };

  const handleToggleSound = () => {
    const updated = { ...config, sound: !config.sound };
    setConfig(updated);
    NotificationService.saveConfig(updated);
    if (updated.sound) {
      NotificationService.playRingtone(config.soundType, config.volume);
    }
  };

  const handleSoundTypeChange = (st: SoundType) => {
    const updated = { ...config, soundType: st };
    setConfig(updated);
    NotificationService.saveConfig(updated);
    NotificationService.playRingtone(st, config.volume);
  };

  const handleVolumeChange = (vol: number) => {
    const updated = { ...config, volume: vol };
    setConfig(updated);
    NotificationService.saveConfig(updated);
  };

  const handleToggleVibrate = () => {
    const updated = { ...config, vibrate: !config.vibrate };
    setConfig(updated);
    NotificationService.saveConfig(updated);
  };

  const handleUpdateReminder = (id: string, patch: Partial<ReminderItem>) => {
    const updatedReminders = config.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r));
    const updated = { ...config, reminders: updatedReminders };
    setConfig(updated);
    NotificationService.saveConfig(updated);
  };

  const handleAddReminder = () => {
    const newRem: ReminderItem = {
      id: `rem-${Date.now()}`,
      enabled: true,
      time: '12:00',
      title: '🔔 Pengingat Kandang Baru',
      message: 'Waktunya cek kondisi ternak dan input data harian di Pratama Grup.',
      soundType: config.soundType,
    };
    const updated = { ...config, reminders: [...config.reminders, newRem] };
    setConfig(updated);
    NotificationService.saveConfig(updated);
    showToast('Jadwal pengingat baru berhasil ditambahkan!', 'success');
  };

  const handleDeleteReminder = (id: string) => {
    if (config.reminders.length <= 1) {
      showToast('Minimal harus ada 1 jadwal pengingat!', 'warning');
      return;
    }
    const updated = { ...config, reminders: config.reminders.filter((r) => r.id !== id) };
    setConfig(updated);
    NotificationService.saveConfig(updated);
    showToast('Jadwal pengingat telah dihapus', 'info');
  };

  const handleResetDefault = () => {
    if (confirm('Kembalikan seluruh pengaturan alarm & pesan ke standar Pratama Grup?')) {
      const reset = NotificationService.resetToDefault();
      setConfig(reset);
      showToast('Pengaturan pengingat dikembalikan ke default!', 'success');
    }
  };

  const handleTestNotification = async (reminder?: ReminderItem) => {
    if (permission !== 'granted') {
      const perm = await NotificationService.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        showToast('Mohon izinkan notifikasi di browser agar pengingat dapat berdering di HP', 'warning');
        return;
      }
    }

    const ok = await NotificationService.testNotificationNow(reminder);
    if (ok) {
      showToast('🔔 Suara lonceng & notifikasi berhasil dikirim!', 'success');
    } else {
      showToast('Notifikasi terkirim via in-app banner & suara Web Audio.', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="glass-panel-glow w-full max-w-2xl rounded-3xl border border-amber-500/40 bg-slate-950/95 shadow-2xl p-5 sm:p-7 relative text-white my-auto max-h-[92vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl shadow-lg shadow-amber-500/10 shrink-0">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">Alarm & Notifikasi Kandang</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-500/30">
                  Pratama Grup
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Atur jadwal jam alarm berdering, sesuaikan judul & pesan notifikasi harian Anda.
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

        {/* Status Izin Notifikasi Box */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
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
              <p className="text-xs font-bold text-white flex items-center gap-2">
                {permission === 'granted' ? 'Izin Notifikasi Aktif' : 'Izin Notifikasi Belum Diaktifkan'}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {permission === 'granted'
                  ? 'HP Anda siap menerima alarm berdering & pemberitahuan otomatis.'
                  : 'Klik tombol Izinkan agar browser & HP dapat berdering serta menampilkan notifikasi.'}
              </p>
            </div>
          </div>

          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow-lg shadow-amber-500/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
            >
              Izinkan Sekarang
            </button>
          )}
        </div>

        {/* Navigation Tabs (Jadwal Notifikasi vs Suara & Dering) */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('jadwal')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'jadwal'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Jadwal & Pesan ({config.reminders.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('suara')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'suara'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Suara Dering & Getar</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetDefault}
            className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset ke pengaturan awal"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>
        </div>

        {/* TAB 1: JADWAL & PESAN */}
        {activeTab === 'jadwal' && (
          <div className="space-y-4">
            {/* Master Switch & Add Button */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div>
                <p className="text-xs font-bold text-white">Sistem Pengingat Harian</p>
                <p className="text-[11px] text-slate-400">Aktifkan alarm otomatis berdasarkan jadwal di bawah</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleMaster}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
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
            </div>

            {/* List of Reminders */}
            <div className="space-y-3">
              {config.reminders.map((rem, idx) => (
                <div
                  key={rem.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    rem.enabled
                      ? 'bg-slate-900/80 border-slate-700/80 shadow-md'
                      : 'bg-slate-950/50 border-slate-800/60 opacity-60'
                  }`}
                >
                  {/* Top Row: Time, Enable Toggle, Delete */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>

                      {/* Time Input */}
                      <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <input
                          type="time"
                          value={rem.time}
                          onChange={(e) => handleUpdateReminder(rem.id, { time: e.target.value })}
                          className="bg-transparent text-xs text-amber-300 font-black outline-none cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Test this specific reminder */}
                      <button
                        type="button"
                        onClick={() => handleTestNotification(rem)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-amber-300 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                        title="Uji Alarm Ini Sekarang"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Tes Alarm</span>
                      </button>

                      {/* Toggle this reminder */}
                      <button
                        type="button"
                        onClick={() => handleUpdateReminder(rem.id, { enabled: !rem.enabled })}
                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                          rem.enabled ? 'bg-amber-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                            rem.enabled ? 'left-5.5' : 'left-0.5'
                          }`}
                        />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteReminder(rem.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title Input */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Judul Pengingat (Tampil di Notifikasi HP):
                    </label>
                    <input
                      type="text"
                      value={rem.title}
                      onChange={(e) => handleUpdateReminder(rem.id, { title: e.target.value })}
                      placeholder="Contoh: 🌅 Waktunya Catat Panen Telur Pagi"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Isi Pesan Alarm / Notifikasi:
                    </label>
                    <textarea
                      rows={2}
                      value={rem.message}
                      onChange={(e) => handleUpdateReminder(rem.id, { message: e.target.value })}
                      placeholder="Tulis instruksi atau pengingat untuk petugas kandang..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  {/* Sound Selector for this reminder */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs">
                    <span className="text-[11px] text-slate-400">Suara Dering Khusus:</span>
                    <select
                      value={rem.soundType || config.soundType}
                      onChange={(e) => handleUpdateReminder(rem.id, { soundType: e.target.value as SoundType })}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-semibold outline-none cursor-pointer"
                    >
                      {SOUND_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.icon} {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Reminder Button */}
            <button
              type="button"
              onClick={handleAddReminder}
              className="w-full py-3 rounded-2xl border border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Jadwal Pengingat Baru</span>
            </button>
          </div>
        )}

        {/* TAB 2: SUARA DERING & GETAR */}
        {activeTab === 'suara' && (
          <div className="space-y-4">
            {/* Master Sound Switch */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  {config.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Bunyikan Nada Dering (Web Audio Engine)</p>
                  <p className="text-[11px] text-slate-400">
                    Menghasilkan alunan lonceng & alarm jernih tanpa memerlukan file eksternal
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  config.sound ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    config.sound ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Sound Profile Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-300 block">Pilih Karakter Nada Dering:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SOUND_OPTIONS.map((opt) => {
                  const isSelected = config.soundType === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSoundTypeChange(opt.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{opt.icon}</span>
                        <div>
                          <p className="text-xs font-black text-white">{opt.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{opt.desc}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          NotificationService.playRingtone(opt.id, config.volume);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 shrink-0 ml-2"
                        title="Dengarkan Contoh"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Volume Control */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Volume Nada Dering:</span>
                <span className="font-black text-amber-400">{Math.round(config.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={config.volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Vibration Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <SmartphoneNfc className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Getar Perangkat (Vibration)</p>
                  <p className="text-[11px] text-slate-400">Pola getaran khusus untuk HP Android saat pengingat aktif</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleVibrate}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  config.vibrate ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    config.vibrate ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => handleTestNotification()}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>🔔 Uji Suara Dering & Notifikasi Sekarang</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-7 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            Selesai & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
