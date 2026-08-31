import React, { useState, useEffect } from 'react';
import { Download, X, Egg, Bell, CheckCircle2, Share2, PlusSquare } from 'lucide-react';
import { useToast } from './ToastContainer';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const { showToast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone / installed mode
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isRunningStandalone) {
      setIsStandalone(true);
      return;
    }

    // Check if user is on iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if prompt was dismissed recently (within 24 hours)
    const lastDismissed = localStorage.getItem('pratama_pwa_dismissed');
    const now = Date.now();
    if (lastDismissed && now - Number(lastDismissed) < 24 * 60 * 60 * 1000) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not standalone, show after a 3 second delay
    if (isIosDevice && !isRunningStandalone && !lastDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        showToast('Untuk iPhone: Tekan tombol Share (ikon kotak panah) lalu pilih "Add to Home Screen"', 'info');
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      showToast('🎉 Aplikasi Pratama Farm berhasil di-install ke HP Anda!', 'success');
      setIsVisible(false);
      setDeferredPrompt(null);
    } else {
      showToast('Pemasangan aplikasi dibatalkan', 'info');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pratama_pwa_dismissed', String(Date.now()));
  };

  if (isStandalone || !isVisible) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-6 left-4 right-4 max-w-md mx-auto z-50 animate-bounce-short">
      <div className="glass-panel-glow p-4 sm:p-5 rounded-3xl border border-amber-500/40 shadow-2xl bg-slate-950/95 backdrop-blur-2xl text-white relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
            <Egg className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-white">Pasang Aplikasi ke HP</h4>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PWA APP
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Install <strong>PRATAMA BISNIS GRUP</strong> langsung ke layar utama HP Anda untuk akses instan & notifikasi panen otomatis!
            </p>

            {/* Benefit bullets */}
            <div className="grid grid-cols-2 gap-1.5 mt-2.5 text-[10px] text-amber-300 font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Buka Cepat Tanpa Browser
              </span>
              <span className="flex items-center gap-1">
                <Bell className="w-3 h-3 text-amber-400" /> Notifikasi Panen 07:00 & 08:00
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
          {isIOS ? (
            <div className="w-full text-center py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-center gap-1.5">
              <span>Tekan</span>
              <Share2 className="w-3.5 h-3.5 text-sky-400 inline" />
              <span>lalu pilih</span>
              <strong className="text-amber-400 flex items-center gap-1">
                <PlusSquare className="w-3.5 h-3.5 inline" /> Tambah ke Layar Utama
              </strong>
            </div>
          ) : (
            <>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs transition-colors"
              >
                Nanti Saja
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                Install ke HP Sekarang
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
