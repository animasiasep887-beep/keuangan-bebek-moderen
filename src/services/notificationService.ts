// Notification Service - PRATAMA BISNIS GRUP
export interface NotificationConfig {
  enabled: boolean;
  timeFirst: string; // Default: '07:00'
  timeSecond: string; // Default: '08:00'
  sound: boolean;
  vibrate: boolean;
}

const STORAGE_KEY = 'pratama_notification_config';

const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  timeFirst: '07:00',
  timeSecond: '08:00',
  sound: true,
  vibrate: true,
};

export class NotificationService {
  private static timerId: number | null = null;

  public static getConfig(): NotificationConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  }

  public static saveConfig(cfg: NotificationConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    this.restartScheduler();
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
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  public static getPermission(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  public static async sendNotification(title: string, body: string, iconUrl = './favicon.svg'): Promise<boolean> {
    if (!('Notification' in window)) return false;

    if (Notification.permission !== 'granted') {
      const perm = await this.requestPermission();
      if (perm !== 'granted') return false;
    }

    try {
      // Prefer ServiceWorker registration for mobile display
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.showNotification(title, {
            body,
            icon: iconUrl,
            badge: iconUrl,
            vibrate: [200, 100, 200],
            data: { url: './' },
          } as any);
          return true;
        }
      }

      // Fallback to standard Notification API
      new Notification(title, {
        body,
        icon: iconUrl,
      });
      return true;
    } catch (err) {
      console.error('Failed to show notification:', err);
      return false;
    }
  }

  public static async testNotificationNow(): Promise<boolean> {
    return this.sendNotification(
      '🔔 Pengingat Panen: PRATAMA BISNIS GRUP',
      '🌅 Selamat Pagi! Waktunya mencatat hasil panen telur bebek hari ini. Buka aplikasi untuk update jumlah butir & pakan kandang 🥚✨'
    );
  }

  public static initScheduler(): void {
    if (this.timerId) clearInterval(this.timerId);

    // Check time every 30 seconds
    this.timerId = window.setInterval(() => {
      this.checkAndTriggerDailyReminders();
    }, 30000);

    // Initial check
    this.checkAndTriggerDailyReminders();
  }

  public static restartScheduler(): void {
    this.initScheduler();
  }

  private static checkAndTriggerDailyReminders(): void {
    const cfg = this.getConfig();
    if (!cfg.enabled) return;
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;
    const todayDateStr = now.toISOString().split('T')[0];

    const lastTriggerFirst = localStorage.getItem(`pratama_notif_1_${todayDateStr}`);
    const lastTriggerSecond = localStorage.getItem(`pratama_notif_2_${todayDateStr}`);

    // Trigger 1: Jam 07:00 Pagi
    if (currentTime === cfg.timeFirst && !lastTriggerFirst) {
      this.sendNotification(
        '🌅 Waktunya Catat Panen Telur Pagi! (07:00)',
        'Selamat pagi peternak hebat! Jangan lupa hitung dan masukkan hasil panen telur Grade A, Grade B, dan pakan bebek hari ini 🥚'
      );
      localStorage.setItem(`pratama_notif_1_${todayDateStr}`, 'true');
    }

    // Trigger 2: Jam 08:00 Pagi (Follow-up Reminder)
    if (currentTime === cfg.timeSecond && !lastTriggerSecond) {
      this.sendNotification(
        '⏰ Reminder Panen: Cek & Update Telur Bebek (08:00)',
        'Pengingat panen kedua: Pastikan data butir telur & pakan kandang sudah tercatat agar grafik HDP & FCR harian Anda tetap akurat!'
      );
      localStorage.setItem(`pratama_notif_2_${todayDateStr}`, 'true');
    }
  }
}
