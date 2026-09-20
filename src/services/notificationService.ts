// Notification & Audio Alarm Service - PRATAMA BISNIS GRUP
export type SoundType = 'golden_bell' | 'duck_melody' | 'digital_pulse' | 'triumph_chime' | 'urgent_alert';

export interface ReminderItem {
  id: string;
  enabled: boolean;
  time: string; // HH:mm format, e.g. "07:00"
  title: string;
  message: string;
  soundType?: SoundType;
}

export interface NotificationConfig {
  enabled: boolean;
  sound: boolean;
  soundType: SoundType;
  volume: number; // 0 to 1
  vibrate: boolean;
  reminders: ReminderItem[];
}

export const SOUND_OPTIONS: { id: SoundType; label: string; icon: string; desc: string }[] = [
  {
    id: 'golden_bell',
    label: 'Lonceng Emas Peternakan',
    icon: '🔔',
    desc: 'Nada lonceng harmonis beresonansi merdu, sangat cocok untuk pagi hari',
  },
  {
    id: 'triumph_chime',
    label: 'Nada Harmoni Panen Sukses',
    icon: '🎺',
    desc: 'Akord harpa / marimba ceria yang menyemangati produktivitas',
  },
  {
    id: 'duck_melody',
    label: 'Melodi Ceria Pratama',
    icon: '🦆',
    desc: 'Melodi ceria khas peternakan bebek & unggas modern',
  },
  {
    id: 'digital_pulse',
    label: 'Alarm Digital Modern',
    icon: '⏰',
    desc: 'Ketukan ganda modern yang tegas dan mudah terdengar di kandang',
  },
  {
    id: 'urgent_alert',
    label: 'Alarm Pengingat Tegas',
    icon: '⚡',
    desc: 'Nada perhatian ganda yang cepat agar tidak terlewatkan waktu panen',
  },
];

export const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-pagi',
    enabled: true,
    time: '07:00',
    title: '🌅 Waktunya Catat Panen Telur Pagi!',
    message: 'Selamat pagi peternak hebat! Jangan lupa hitung & masukkan telur Grade A, Retak, serta pakan hari ini 🥚',
    soundType: 'golden_bell',
  },
  {
    id: 'rem-lanjutan',
    enabled: true,
    time: '08:30',
    title: '⏰ Pengingat Lanjutan: Cek Pakan & Air',
    message: 'Pastikan sirkulasi air minum bersih dan ransum pakan kandang sudah tercukupi untuk menjaga HDP bebek maksimal!',
    soundType: 'triumph_chime',
  },
  {
    id: 'rem-sore',
    enabled: false,
    time: '16:30',
    title: '🌇 Kontrol Kandang & Panen Sore',
    message: 'Waktunya cek kondisi alas sekam kandang, ambil sisa telur kedua, dan periksa kesehatan ternak 🦆',
    soundType: 'duck_melody',
  },
  {
    id: 'rem-malam',
    enabled: false,
    time: '20:00',
    title: '📊 Rekap Keuangan & Jurnal Kas Harian',
    message: 'Yuk tutup pembukuan hari ini! Cek pendapatan kasir panen dan pengeluaran operasional di Pratama Grup.',
    soundType: 'digital_pulse',
  },
];

const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  sound: true,
  soundType: 'golden_bell',
  volume: 0.85,
  vibrate: true,
  reminders: DEFAULT_REMINDERS,
};

const STORAGE_KEY = 'pratama_notification_config_v2';

/**
 * High-Fidelity Pure Web Audio API Sound Synthesizer
 * Generates rich acoustic bells & musical chimes without requiring external files.
 * Works 100% offline, on desktop, and on mobile.
 */
export class SoundSynthesizer {
  private static audioCtx: AudioContext | null = null;

  public static unlockAudio(): void {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch {
      // ignore
    }
  }

  private static getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    this.unlockAudio();
    return this.audioCtx;
  }

  public static play(type: SoundType = 'golden_bell', volume = 0.85): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const safeVol = Math.max(0.01, Math.min(1, volume));
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(safeVol, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'golden_bell') {
        // Golden Bell Chime (Rich bell harmonic chord: C5, E5, G5, C6)
        const notes = [
          { f: 523.25, d: 1.8, g: 0.4 },
          { f: 659.25, d: 1.6, g: 0.3 },
          { f: 783.99, d: 1.5, g: 0.25 },
          { f: 1046.5, d: 2.0, g: 0.2 },
        ];
        notes.forEach((n, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + idx * 0.07;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(n.f, startTime);
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(n.g, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + n.d);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(startTime);
          osc.stop(startTime + n.d + 0.1);
        });
      } else if (type === 'triumph_chime') {
        // Uplifting ascending pentatonic arpeggio (A4, C#5, E5, A5, C#6)
        const freqs = [440, 554.37, 659.25, 880, 1108.73];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + idx * 0.09;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(startTime);
          osc.stop(startTime + 1.3);
        });
      } else if (type === 'duck_melody') {
        // Playful cheerful duck farm melody (D5, F#5, A5, D6)
        const notes = [
          { f: 587.33, t: 0, d: 0.15 },
          { f: 739.99, t: 0.15, d: 0.15 },
          { f: 880.0, t: 0.3, d: 0.2 },
          { f: 1174.66, t: 0.52, d: 0.5 },
        ];
        notes.forEach((n) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + n.t;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.f, startTime);
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + n.d);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(startTime);
          osc.stop(startTime + n.d + 0.05);
        });
      } else if (type === 'digital_pulse') {
        // Crisp dual-tone digital alarm pulse
        [0, 0.18, 0.36].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + offset;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(987.77, startTime); // B5
          gain.gain.setValueAtTime(0.35, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(startTime);
          osc.stop(startTime + 0.13);
        });
      } else if (type === 'urgent_alert') {
        // Urgent attention sweep
        [0, 0.22].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + offset;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(700, startTime);
          osc.frequency.linearRampToValueAtTime(1050, startTime + 0.15);
          gain.gain.setValueAtTime(0.25, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(startTime);
          osc.stop(startTime + 0.19);
        });
      }
    } catch (err) {
      console.warn('Audio playback not allowed or failed:', err);
    }
  }
}

export class NotificationService {
  private static timerId: number | null = null;

  public static getConfig(): NotificationConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure reminders array is valid
        if (Array.isArray(parsed.reminders) && parsed.reminders.length > 0) {
          return { ...DEFAULT_CONFIG, ...parsed };
        }
      }

      // Legacy fallback migration from v1
      const legacyRaw = localStorage.getItem('pratama_notification_config');
      if (legacyRaw) {
        try {
          const legacy = JSON.parse(legacyRaw);
          const migratedReminders: ReminderItem[] = [
            {
              id: 'rem-1',
              enabled: true,
              time: legacy.timeFirst || '07:00',
              title: '🌅 Waktunya Catat Panen Telur Pagi!',
              message: 'Selamat pagi! Hitung & masukkan telur Grade A, Retak, serta pakan hari ini 🥚',
              soundType: 'golden_bell',
            },
            {
              id: 'rem-2',
              enabled: true,
              time: legacy.timeSecond || '08:00',
              title: '⏰ Pengingat Lanjutan: Cek Panen & Pakan',
              message: 'Pastikan data telur & pakan kandang sudah tercatat di sistem Pratama Grup.',
              soundType: 'triumph_chime',
            },
          ];
          const migrated: NotificationConfig = {
            enabled: legacy.enabled ?? true,
            sound: legacy.sound ?? true,
            soundType: 'golden_bell',
            volume: 0.85,
            vibrate: legacy.vibrate ?? true,
            reminders: migratedReminders,
          };
          this.saveConfig(migrated);
          return migrated;
        } catch {
          // ignore
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  }

  public static saveConfig(cfg: NotificationConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    this.restartScheduler();
  }

  public static resetToDefault(): NotificationConfig {
    this.saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }

  public static addReminder(reminder: Omit<ReminderItem, 'id'>): NotificationConfig {
    const cfg = this.getConfig();
    const newItem: ReminderItem = {
      ...reminder,
      id: `rem-${Date.now()}`,
    };
    const updated: NotificationConfig = {
      ...cfg,
      reminders: [...cfg.reminders, newItem],
    };
    this.saveConfig(updated);
    return updated;
  }

  public static updateReminder(item: ReminderItem): NotificationConfig {
    const cfg = this.getConfig();
    const updatedReminders = cfg.reminders.map((r) => (r.id === item.id ? item : r));
    const updated: NotificationConfig = {
      ...cfg,
      reminders: updatedReminders,
    };
    this.saveConfig(updated);
    return updated;
  }

  public static deleteReminder(id: string): NotificationConfig {
    const cfg = this.getConfig();
    const updated: NotificationConfig = {
      ...cfg,
      reminders: cfg.reminders.filter((r) => r.id !== id),
    };
    this.saveConfig(updated);
    return updated;
  }

  public static playRingtone(type?: SoundType, volume?: number): void {
    const cfg = this.getConfig();
    const targetType = type || cfg.soundType;
    const targetVol = volume !== undefined ? volume : cfg.volume;
    SoundSynthesizer.play(targetType, targetVol);
  }

  public static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch {
      return 'denied';
    }
  }

  public static isSupported(): boolean {
    return 'Notification' in window;
  }

  public static getPermission(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  public static async sendNotification(
    title: string,
    body: string,
    soundType?: SoundType,
    iconUrl = './favicon.svg'
  ): Promise<boolean> {
    const cfg = this.getConfig();

    // 1. Play synthesized ringtone chime if sound enabled
    if (cfg.sound) {
      this.playRingtone(soundType || cfg.soundType, cfg.volume);
    }

    // 2. Vibrate mobile device if enabled
    if (cfg.vibrate && 'vibrate' in navigator) {
      try {
        navigator.vibrate([250, 100, 250, 100, 350]);
      } catch {
        // ignore
      }
    }

    // 3. Dispatch in-app alert banner event for users currently viewing the page
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('pratama-notification-alert', {
          detail: { title, body, soundType: soundType || cfg.soundType },
        })
      );
    }

    // 4. Send native browser / OS push notification
    if (!('Notification' in window)) return false;

    if (Notification.permission !== 'granted') {
      const perm = await this.requestPermission();
      if (perm !== 'granted') return false;
    }

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.showNotification(title, {
            body,
            icon: iconUrl,
            badge: iconUrl,
            vibrate: [250, 100, 250, 100, 350],
            data: { url: './' },
          } as any);
          return true;
        }
      }

      new Notification(title, {
        body,
        icon: iconUrl,
      });
      return true;
    } catch (err) {
      console.error('Failed to show native notification:', err);
      return false;
    }
  }

  public static async testNotificationNow(reminder?: ReminderItem): Promise<boolean> {
    const cfg = this.getConfig();
    const title = reminder ? reminder.title : '🔔 Uji Notifikasi & Dering: PRATAMA GRUP';
    const message = reminder
      ? reminder.message
      : '🌅 Suara lonceng & notifikasi HP Anda berfungsi sempurna! Waktunya mencatat hasil panen telur bebek & pakan harian 🥚✨';
    const soundType = reminder ? reminder.soundType : cfg.soundType;

    return this.sendNotification(title, message, soundType);
  }

  public static unlockAudio(): void {
    SoundSynthesizer.unlockAudio();
  }

  public static initScheduler(): void {
    if (this.timerId) clearInterval(this.timerId);

    // Check time every 20 seconds
    this.timerId = window.setInterval(() => {
      this.checkAndTriggerDailyReminders();
    }, 20000);

    // Initial check
    this.checkAndTriggerDailyReminders();
  }

  public static restartScheduler(): void {
    this.initScheduler();
  }

  private static checkAndTriggerDailyReminders(): void {
    const cfg = this.getConfig();
    if (!cfg.enabled) return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;
    const todayDateStr = now.toISOString().split('T')[0];

    cfg.reminders.forEach((rem) => {
      if (!rem.enabled) return;

      const triggerKey = `pratama_notif_${rem.id}_${todayDateStr}_${rem.time}`;
      const hasTriggered = localStorage.getItem(triggerKey);

      if (currentTime === rem.time && !hasTriggered) {
        this.sendNotification(rem.title, rem.message, rem.soundType || cfg.soundType);
        localStorage.setItem(triggerKey, 'true');
      }
    });
  }
}
