import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Share2,
  PlusSquare,
  Sparkles,
  Smartphone,
  Bell,
  ShieldCheck,
  Zap,
  Printer,
  Layers,
} from 'lucide-react';
import { useToast } from './ToastContainer';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [activeDeviceTab, setActiveDeviceTab] = useState<'android' | 'ios' | 'features'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIosDevice, setIsIosDevice] = useState(false);

  useEffect(() => {
    // Detect OS & standalone
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    setIsIosDevice(isIos);

    if (isIos && !isAndroid) {
      setActiveDeviceTab('ios');
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (!deferredPrompt) {
      if (isIosDevice) {
        setActiveDeviceTab('ios');
        showToast('Untuk iPhone, ikuti langkah Safari di tab iPhone di bawah.', 'info');
      } else {
        showToast('Buka menu Chrome (titik tiga ⋮) lalu pilih "Instal aplikasi"', 'info');
      }
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('🎉 Aplikasi Pratama Farm berhasil dipasang di HP Anda!', 'success');
        onClose();
        setDeferredPrompt(null);
      }
    } catch {
      showToast('Gagal memicu instalasi otomatis, silakan ikuti panduan manual Chrome.', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/35 shadow-2xl overflow-hidden flex flex-col relative my-auto animate-in zoom-in-95 duration-200 max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600/30 via-slate-900 to-amber-500/20 border-b border-amber-500/20 p-4 sm:p-5 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/30 shrink-0">
              📲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Download Aplikasi ke HP
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PWA RESMI
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Install di Android atau iPhone untuk akses cepat & notifikasi harian.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1.5 mt-4 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveDeviceTab('android')}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeDeviceTab === 'android'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🤖</span>
              <span>Android</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDeviceTab('ios')}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeDeviceTab === 'ios'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🍎</span>
              <span>iPhone</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDeviceTab('features')}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeDeviceTab === 'features'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fitur App</span>
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: ANDROID */}
          {activeDeviceTab === 'android' && (
            <div className="space-y-4">
              {/* Native Install Button if supported */}
              {deferredPrompt && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-emerald-500/10 border border-amber-500/40 text-center space-y-2.5">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Browser Mendukung Instalasi 1-Klik Langsung!</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNativeInstall}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Pasang Aplikasi Sekarang (1-Klik)</span>
                  </button>
                </div>
              )}

              {/* Step-by-step Tutorial Android */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>Tutorial Pasang di HP Android (Google Chrome):</span>
                </h4>

                <div className="space-y-2 text-xs">
                  {/* Step 1 */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <h5 className="font-black text-white">Buka di Browser Google Chrome</h5>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Pastikan Anda mengakses halaman ini lewat browser <strong>Google Chrome</strong> di HP Android.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <h5 className="font-black text-white">Ketuk Ikon Menu Titik Tiga ( ⋮ )</h5>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Lihat di <strong>pojok kanan atas</strong> layar Chrome Anda, ada ikon titik tiga vertikal.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <h5 className="font-black text-amber-300">Pilih "Instal aplikasi" / "Tambahkan ke Layar Utama"</h5>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Ketuk menu <strong>"Instal aplikasi"</strong> atau <em>"Add to Home screen"</em> di daftar menu yang muncul.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center shrink-0 text-xs">
                      4
                    </div>
                    <div>
                      <h5 className="font-black text-emerald-400">Selesai! Aplikasi Siap di Layar Utama HP</h5>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Ketuk <strong>"Instal"</strong>. Ikon <strong>Pratama Farm</strong> akan otomatis muncul di menu aplikasi HP Anda seperti aplikasi Play Store!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IPHONE (IOS) */}
          {activeDeviceTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-xs text-sky-200 leading-relaxed flex items-center gap-2.5">
                <span className="text-xl">🍎</span>
                <span>
                  Di iPhone / iPad, Apple mewajibkan pemasangan aplikasi web melalui browser bawaan <strong>Safari</strong>.
                </span>
              </div>

              {/* Step-by-step Tutorial iOS */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>Tutorial Pasang di iPhone (Apple Safari):</span>
                </h4>

                <div className="space-y-2 text-xs">
                  {/* Step 1 */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black flex items-center justify-center shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <h5 className="font-black text-white">Buka Website di Browser Safari</h5>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Buka tautan website peternakan ini menggunakan browser <strong>Safari</strong> di iPhone Anda.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-sky-500/30 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-black flex items-center justify-center shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <h5 className="font-black text-sky-300 flex items-center gap-1.5">
                        <span>Ketuk Tombol Bagikan</span>
                        <Share2 className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[10px] text-slate-400">(Ikon Kotak Panah)</span>
                      </h5>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Lihat di <strong>bilah menu bawah layar Safari</strong>, tekan tombol <strong>Share</strong> (ikon kotak dengan panah mengarah ke atas).
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <h5 className="font-black text-amber-300 flex items-center gap-1.5">
                        <span>Pilih "Tambah ke Layar Utama"</span>
                        <PlusSquare className="w-3.5 h-3.5 text-amber-400" />
                      </h5>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Gulir menu ke bawah sedikit, lalu ketuk menu <strong>"Tambah ke Layar Utama"</strong> (atau <em>Add to Home Screen</em>).
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center shrink-0 text-xs">
                      4
                    </div>
                    <div>
                      <h5 className="font-black text-emerald-400">Ketuk "Tambah" (Add) di Kanan Atas</h5>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Beri nama jika diinginkan, lalu ketuk <strong>"Tambah"</strong> di pojok kanan atas. Ikon aplikasi langsung hadir di Home Screen iPhone!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FITUR LENGKAP PWA */}
          {activeDeviceTab === 'features' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-300 leading-relaxed">
                Keuntungan mengunduh & memasang aplikasi <strong>PRATAMA BISNIS GRUP</strong> di handphone Anda:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Feature 1 */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">Layar Penuh (Fullscreen)</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Buka aplikasi tanpa bilah URL browser yang mengganggu, serasa aplikasi Play Store.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">Ringan & Hemat Kuota</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Ukuran sangat kecil (&lt;2 MB), loading kilat 0.5 detik, dan hemat penyimpanan HP.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">Notifikasi Panen 07:00 & 08:00</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Pengingat otomatis pagi dan malam untuk catat telur, pakan, dan mortalitas.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">5 Sektor Peternakan</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Bebek Petelur, Ayam Telur, Ayam Broiler, Sapi Ternak & Budidaya Ikan Lele.
                    </p>
                  </div>
                </div>

                {/* Feature 5 */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 shrink-0">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">Kasir & Cetak Struk POS</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Cetak struk nota penjualan telur via printer thermal Bluetooth langsung dari HP.
                    </p>
                  </div>
                </div>

                {/* Feature 6 */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">Sinkronisasi Cloud VPS</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Data otomatis tersimpan aman di server permanen tanpa risiko hilang saat HP ganti.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PWA Ready (100% Gratis)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
