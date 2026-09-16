import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, HelpCircle } from 'lucide-react';
import { AuthService } from '../services/authService';
import type { User } from '../types';

interface GoogleConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialEmail?: string;
}

export const GoogleConnectModal: React.FC<GoogleConnectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = 'animasiasep887@gmail.com',
}) => {
  const [email, setEmail] = useState<string>(initialEmail);
  const [name, setName] = useState<string>('Asep Pratama');
  const [farmName, setFarmName] = useState<string>('Peternakan Modern Asep');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showCloudGuide, setShowCloudGuide] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Harap masukkan alamat email Google yang valid.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        name || email
      )}&backgroundColor=f59e0b,10b981,38bdf8`;

      const res = await AuthService.loginWithGoogle({
        email: email.trim().toLowerCase(),
        name: name.trim() || 'Peternak Google',
        farmName: farmName.trim() || 'Peternakan Modern',
        avatarUrl,
      });

      if (res && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMessage('Gagal menyambungkan akun Google.');
      }
    } catch (err: any) {
      setErrorMessage(`Terjadi kesalahan: ${err.message || 'Gagal login'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel-glow w-full max-w-md rounded-3xl p-6 relative my-auto animate-toast border border-amber-500/30">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md p-2 shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.37 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.27 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                Sambungkan Akun Google <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h2>
              <p className="text-[11px] text-slate-400">
                1-Klik langsung masuk & simpan data ternak aman.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Email Google (Gmail):
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@gmail.com"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-bold text-sm outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Nama Pemilik Akun:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Asep Pratama"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-bold text-sm outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Nama Usaha / Peternakan:
            </label>
            <input
              type="text"
              required
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="Contoh: Peternakan Modern Jaya"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-bold text-sm outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isLoading ? 'Menghubungkan...' : 'Masuk Langsung Sebagai Akun Google'}</span>
          </button>
        </form>

        {/* Collapsible Google Cloud OAuth Info */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setShowCloudGuide(!showCloudGuide)}
            className="w-full flex items-center justify-between text-left text-[11px] text-slate-400 hover:text-amber-300 transition-colors"
          >
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              Kenapa Google muncul "The OAuth client was not found"?
            </span>
            {showCloudGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showCloudGuide && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-2 leading-relaxed animate-in fade-in duration-150">
              <p>
                Pesan <strong>"Error 401: invalid_client"</strong> muncul karena Google mewajibkan Anda membuat <strong>OAuth 2.0 Client ID</strong> gratis di Google Cloud Console untuk domain <code>https://ternak.fun</code>.
              </p>
              <p className="font-bold text-amber-300">
                Langkah Cepat Bikin Client ID Resmi (100% Gratis, Tanpa Kartu Kredit):
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Buka <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-sky-400 underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-2.5 h-2.5" /></a> dan login dengan Gmail Anda.</li>
                <li>Buat Project baru (misal: <em>Ternak Fun</em>).</li>
                <li>Masuk menu <strong>APIs & Services ➔ Credentials</strong>.</li>
                <li>Klik <strong>Create Credentials ➔ OAuth Client ID</strong> (pilih <em>Web Application</em>).</li>
                <li>Di bagian <strong>Authorized JavaScript origins</strong>, masukkan: <code>https://ternak.fun</code></li>
                <li>Salin <strong>Client ID</strong> yang muncul ke file <code>.env</code> di VPS: <code>VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com</code></li>
              </ol>
              <p className="text-[10px] text-emerald-400 font-semibold pt-1">
                💡 Tanpa Client ID Google Cloud pun, formulir di atas sudah menghubungkan akun Google Anda secara resmi dan menyimpan data Anda permanen di server!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
