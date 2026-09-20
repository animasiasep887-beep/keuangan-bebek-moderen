import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Heart, ExternalLink, X } from 'lucide-react';
import { useToast } from './ToastContainer';

interface FollowSosmedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.903 2.873 2.89 2.89 0 0 1-2.887-2.888 2.89 2.89 0 0 1 2.887-2.888c.368 0 .72.067 1.045.188V9.458a6.31 6.31 0 0 0-1.045-.088C5.97 9.37 3.12 12.22 3.12 15.73c0 3.51 2.85 6.36 6.36 6.36 3.51 0 6.36-2.85 6.36-6.36V8.65a8.21 8.21 0 0 0 4.749 1.481V6.686z" />
  </svg>
);

export const FollowSosmedModal: React.FC<FollowSosmedModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [hasVisitedIg, setHasVisitedIg] = useState<boolean>(false);
  const [hasVisitedTiktok, setHasVisitedTiktok] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleOpenInstagram = () => {
    setHasVisitedIg(true);
    window.open('https://www.instagram.com/bintama_journey', '_blank', 'noopener,noreferrer');
  };

  const handleOpenTikTok = () => {
    setHasVisitedTiktok(true);
    window.open(
      'https://www.tiktok.com/@bintama_journey?is_from_webapp=1&sender_device=pc',
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleConfirmFollow = () => {
    localStorage.setItem('bebek_has_followed_sosmed', 'true');
    showToast(
      'Terima kasih banyak telah follow @bintama_journey! Selamat berkarya & beternak modern.',
      'success',
      'Dukungan Diterima'
    );
    onClose();
  };

  const handleDismissLater = () => {
    // Allows dismiss while keeping reminder in header/dashboard
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex flex-col justify-center items-center animate-fadeIn">
      <div className="glass-panel-glow w-full max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative my-auto max-h-[95vh] overflow-y-auto border border-amber-500/40 shadow-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
        {/* Close Button */}
        <button
          onClick={handleDismissLater}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Tutup Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-amber-500/20 border border-amber-500/40 text-3xl shadow-lg shadow-amber-500/10 mb-3 animate-bounce">
            🦆
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black tracking-wide mb-2">
            <Sparkles className="w-3.5 h-3.5" /> DUKUNG KOMUNITAS BEBEKJAYA
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Follow Media Sosial Kami
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
            Aplikasi ini dibuat gratis untuk seluruh peternak Indonesia. Dukung kami dengan follow{' '}
            <span className="font-extrabold text-amber-300">@bintama_journey</span> di Instagram & TikTok untuk tips harian, video SOP kandang, dan update fitur peternakan modern!
          </p>
        </div>

        {/* Social Media Follow Cards */}
        <div className="space-y-3 mt-2">
          {/* INSTAGRAM CARD */}
          <div className="relative group overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900/70 p-4 transition-all hover:border-pink-500/60 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
                  <InstagramIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white">Instagram</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                      Resmi
                    </span>
                    {hasVisitedIg && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Dibuka
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-extrabold text-pink-300 mt-0.5">@bintama_journey</p>
                  <p className="text-[11px] text-slate-400">Tips, foto kandang & inspirasi harian</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenInstagram}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-pink-600/30 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <span>Follow</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* TIKTOK CARD */}
          <div className="relative group overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-4 transition-all hover:border-cyan-500/60 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-black border border-cyan-500/40 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-rose-500/20" />
                  <TikTokIcon className="w-6 h-6 text-white relative z-10" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-white">TikTok</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      Resmi
                    </span>
                    {hasVisitedTiktok && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Dibuka
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-extrabold text-cyan-300 mt-0.5">@bintama_journey</p>
                  <p className="text-[11px] text-slate-400">Video SOP panen, pakan & edukasi</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenTikTok}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-cyan-400/50 hover:border-cyan-400 font-black text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/10 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <span>Follow</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Benefits Box */}
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200">
          <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Dengan follow akun kami, Anda membantu peternakan bebek modern semakin dikenal dan mendorong pengembangan fitur-fitur baru BebekJaya!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={handleConfirmFollow}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-98 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>Saya Sudah Follow (Buka Aplikasi)</span>
          </button>

          <button
            type="button"
            onClick={handleDismissLater}
            className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors text-center cursor-pointer"
          >
            Nanti Saja (Lanjutkan ke Aplikasi)
          </button>
        </div>
      </div>
    </div>
  );
};
