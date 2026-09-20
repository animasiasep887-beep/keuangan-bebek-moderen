import React, { useState } from 'react';
import {
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

export const PengaturanNotifikasiSection: React.FC = () => {
  const { showToast } = useToast();
  const [config, setConfig] = useState<NotificationConfig>(NotificationService.getConfig());
  const [permission, setPermission] = useState<NotificationPermission>(NotificationService.getPermission());
  const [subTab, setSubTab] = useState<'jadwal' | 'suara'>('jadwal');

  const handleRequestPermission = async () => {
    const perm = await NotificationService.requestPermission();
    setPermission(perm);
    if (perm === 'granted') {
      showToast('✅ Izin notifikasi berhasil aktif! HP Anda siap menerima alarm berdering.', 'success');
      NotificationService.testNotificationNow();
    } else if (perm === 'denied') {
      showToast('⚠️ Izin diblokir browser. Silakan klik ikon gembok pada browser untuk mengizinkan notifikasi.', 'error');
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
      title: '🔔 Jadwal Kontrol Kandang',
      message: 'Waktunya cek kondisi ternak, sirkulasi air, dan catat panen harian.',
      soundType: config.soundType,
    };
    const updated = { ...config, reminders: [...config.reminders, newRem] };
    setConfig(updated);
    NotificationService.saveConfig(updated);
    showToast('Jadwal pengingat baru berhasil ditambahkan!', 'success');
  };

  const handleDeleteReminder = (id: string) => {
    if (config.reminders.length <= 1) {
      showToast('Minimal harus ada 1 jadwal pengingat tersimpan!', 'warning');
      return;
    }
    const updated = { ...config, reminders: config.reminders.filter((r) => r.id !== id) };
    setConfig(updated);
    NotificationService.saveConfig(updated);
    showToast('Jadwal pengingat dihapus', 'info');
  };

  const handleResetDefault = () => {
    if (confirm('Kembalikan seluruh jadwal & pesan pengingat ke pengaturan standar Pratama Grup?')) {
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
      showToast('🔔 Suara lonceng dering & notifikasi terkirim!', 'success');
    } else {
      showToast('Notifikasi terkirim via Web Audio chime & in-app banner.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl shadow-lg shadow-amber-500/10 shrink-0">
            🔔
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                Pengaturan Alarm & Notifikasi Pengingat
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-500/30">
                Pratama Grup
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sesuaikan jam tayang alarm berdering, edit judul & isi pesan pengingat harian peternakan Anda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleTestNotification()}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Dengarkan dering & uji notifikasi"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Tes Alarm & Notif</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefault}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Reset ke Jadwal Standar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Permission Box */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          permission === 'granted'
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          {permission === 'granted' ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
          ) : (
            <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          )}
          <div>
            <p className="text-sm font-black text-white">
              {permission === 'granted'
                ? 'Izin Notifikasi Perangkat Aktif'
                : 'Izin Notifikasi Belum Diaktifkan di Browser / HP'}
            </p>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {permission === 'granted'
                ? 'Sistem siap membunyikan lonceng dan menampilkan pesan alarm tepat pada jam yang Anda tentukan.'
                : 'Agar notifikasi dan suara alarm dapat muncul saat aplikasi ditutup/di-background, silakan klik tombol Izinkan Notifikasi.'}
            </p>
          </div>
        </div>

        {permission !== 'granted' && (
          <button
            type="button"
            onClick={handleRequestPermission}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow-lg shadow-amber-500/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
          >
            Izinkan Notifikasi
          </button>
        )}
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setSubTab('jadwal')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'jadwal'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Kelola Jadwal & Pesan ({config.reminders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('suara')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'suara'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Suara Dering & Getar (Audio Engine)</span>
        </button>
      </div>

      {/* SUB-TAB 1: JADWAL & PESAN */}
      {subTab === 'jadwal' && (
        <div className="space-y-4">
          {/* Master Toggle */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">Sistem Pengingat Harian Aktif</p>
              <p className="text-xs text-slate-400">
                Kirim notifikasi otomatis & bunyikan alarm pada jam-jam yang terdaftar di bawah
              </p>
            </div>

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

          {/* List of Customizable Reminders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.reminders.map((rem, idx) => (
              <div
                key={rem.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
                  rem.enabled
                    ? 'bg-slate-900/80 border-slate-700/80 shadow-lg'
                    : 'bg-slate-950/50 border-slate-800/60 opacity-60'
                }`}
              >
                {/* Header Row: Number, Time, Actions */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs shrink-0">
                      {idx + 1}
                    </div>

                    {/* Time Input */}
                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 shadow-inner">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <input
                        type="time"
                        value={rem.time}
                        onChange={(e) => handleUpdateReminder(rem.id, { time: e.target.value })}
                        className="bg-transparent text-xs text-amber-300 font-black outline-none cursor-pointer"
                        title="Ubah jam alarm berdering"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Test Alarm */}
                    <button
                      type="button"
                      onClick={() => handleTestNotification(rem)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-amber-300 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      title="Tes Alarm & Notif Ini Sekarang"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Uji</span>
                    </button>

                    {/* Toggle this reminder */}
                    <button
                      type="button"
                      onClick={() => handleUpdateReminder(rem.id, { enabled: !rem.enabled })}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        rem.enabled ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                      title={rem.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                          rem.enabled ? 'left-5.5' : 'left-0.5'
                        }`}
                      />
                    </button>

                    {/* Delete button */}
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
                    Isi Pesan Notifikasi (Bisa diedit bebas):
                  </label>
                  <textarea
                    rows={2}
                    value={rem.message}
                    onChange={(e) => handleUpdateReminder(rem.id, { message: e.target.value })}
                    placeholder="Tulis instruksi atau catatan kandang yang ingin dimunculkan..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                {/* Sound Selector */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                  <span className="text-[11px] text-slate-400">Suara Dering:</span>
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
            className="w-full py-3.5 rounded-2xl border border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Jadwal & Pesan Pengingat Baru</span>
          </button>
        </div>
      )}

      {/* SUB-TAB 2: SUARA DERING & GETAR */}
      {subTab === 'suara' && (
        <div className="space-y-4">
          {/* Master Sound Switch */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                {config.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">Bunyikan Nada Dering (Web Audio Synthesizer)</p>
                <p className="text-xs text-slate-400">
                  Menghasilkan alunan lonceng & alarm jernih berkualitas tinggi tanpa memerlukan file mp3 eksternal
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

          {/* Sound Profiles */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 block">Pilihan Karakter Nada Dering:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SOUND_OPTIONS.map((opt) => {
                const isSelected = config.soundType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSoundTypeChange(opt.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <p className="text-xs sm:text-sm font-black text-white">{opt.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{opt.desc}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        NotificationService.playRingtone(opt.id, config.volume);
                      }}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 shrink-0 ml-2 shadow-sm cursor-pointer"
                      title="Dengarkan Suara Dering"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Volume Control */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Tingkat Volume Dering:</span>
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

          {/* Vibrate Toggle */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <SmartphoneNfc className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">Getaran Perangkat (Vibration)</p>
                <p className="text-xs text-slate-400">Menambahkan pola getaran alarm pada smartphone Android</p>
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
    </div>
  );
};
