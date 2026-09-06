import React, { useState } from 'react';
import {
  Sparkles,
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AuthService } from '../services/authService';
import type { User } from '../types';

interface AuthScreenProps {
  onSuccess: (user: User) => void;
  onDemoClick?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onDemoClick }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Google Modal Simulation State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleName, setGoogleName] = useState('Peternak Unggul');
  const [googleEmail, setGoogleEmail] = useState('peternak.modern@gmail.com');
  const [googleFarmName, setGoogleFarmName] = useState('Peternakan Bebek Berkah Jaya');

  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regFarmName, setRegFarmName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMsg('Harap masukkan Email/No. WhatsApp dan Kata Sandi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthService.login(loginIdentifier, loginPassword);
      if (res.success && res.user) {
        setSuccessMsg(`Selamat datang kembali, ${res.user.name}!`);
        setTimeout(() => {
          onSuccess(res.user!);
        }, 500);
      } else {
        setErrorMsg(res.message || 'Gagal masuk. Silakan cek kembali data Anda.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan saat mencoba masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !regFarmName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Harap lengkapi semua data pendaftaran wajib.');
      return;
    }

    if (regPassword.length < 5) {
      setErrorMsg('Kata sandi minimal 5 karakter untuk keamanan peternakan Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthService.register({
        name: regName,
        farmName: regFarmName,
        phone: regPhone,
        email: regEmail,
        password: regPassword,
        plan: 'PREMIUM',
      });

      if (res.success && res.user) {
        setSuccessMsg(`Akun peternakan berhasil dibuat! Membuka dashboard...`);
        setTimeout(() => {
          onSuccess(res.user!);
        }, 700);
      } else {
        setErrorMsg(res.message || 'Pendaftaran gagal. Silakan coba lagi.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan saat mendaftarkan akun.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 1-Click Google Sign In
  const handleGoogleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await AuthService.loginWithGoogle({
        name: googleName || 'Peternak Google',
        email: googleEmail || 'peternak@gmail.com',
        farmName: googleFarmName || 'Peternakan Google Utama',
      });
      setIsGoogleModalOpen(false);
      setSuccessMsg(`Berhasil terhubung dengan Akun Google: ${res.user.name}`);
      setTimeout(() => {
        onSuccess(res.user);
      }, 600);
    } catch {
      setErrorMsg('Gagal melakukan otentikasi dengan Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-x-hidden selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Dynamic Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black text-xl">
            🦆
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              PRATAMA BISNIS GRUP
            </h1>
            <p className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
              Peternakan Bebek Petelur SIM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sistem Aman</span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="max-w-md w-full mx-auto my-auto z-10 py-6">
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl relative">
          {/* Header Title */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-2.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> APLIKASI KHUSUS PETERNAK BEBEK
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeTab === 'login' ? 'Masuk ke Peternakan Anda' : 'Buka Akun Peternak Baru'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'login'
                ? 'Pantau panen harian, stok pakan, dan cetak struk kasir telur.'
                : 'Gratis selamanya, simpan data terisolasi & terlindungi aman.'}
            </p>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* OFFICIAL GOOGLE SIGN-IN BUTTON */}
          <div className="space-y-3 mb-5">
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-md border border-slate-200"
            >
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span>Masuk dengan Akun Google</span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                atau masuk manual
              </span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
          </div>

          {/* Tab Selection */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Email atau No. WhatsApp
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="admin@bebekjaya.com / 0812..."
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tombol Masuk */}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-95 mt-2"
              >
                <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard Utama'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Pemilik Peternak *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: H. Supardi / Pak Joko"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Usaha Peternakan *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regFarmName}
                    onChange={(e) => setRegFarmName(e.target.value)}
                    placeholder="Contoh: Bebek Makmur Sentosa Farm"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    No. WhatsApp Aktif
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="08123456..."
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email Akun *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="peternak@gmail.com"
                      className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Buat Kata Sandi *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 5 karakter"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95 mt-3"
              >
                <span>{isLoading ? 'Mendaftarkan...' : 'Daftar Akun Peternak (Gratis)'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Switch Tab Helper */}
          <div className="mt-5 text-center">
            {activeTab === 'login' ? (
              <p className="text-xs text-slate-400">
                Belum punya akun peternak?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-amber-400 hover:underline font-bold"
                >
                  Daftar akun baru di sini
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Sudah memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-amber-400 hover:underline font-bold"
                >
                  Masuk ke akun Anda
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer Mobile Info */}
      <footer className="max-w-md w-full mx-auto text-center z-10 pt-2 pb-1 text-slate-500 text-[11px] space-y-1.5">
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1">📱 Ringan di Android</span>
          <span>•</span>
          <span className="flex items-center gap-1">🧾 Cetak Struk Kasir</span>
          <span>•</span>
          <span className="flex items-center gap-1">💬 Nota WhatsApp</span>
        </div>
        <p>© 2026 PRATAMA BISNIS GRUP • Didesain Khusus untuk Peternak Bebek Indonesia</p>
        {onDemoClick && (
          <p className="pt-0.5">
            <button
              type="button"
              onClick={onDemoClick}
              className="text-slate-500 hover:text-slate-300 text-[11px] underline transition-colors"
            >
              Uji Coba Cepat (Mode Demo)
            </button>
          </p>
        )}
      </footer>

      {/* GOOGLE SIGN-IN INTERACTIVE MODAL */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span className="text-sm font-bold text-white">Google One-Tap Login</span>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Pilih atau konfirmasi profil Akun Google Anda untuk masuk langsung ke dashboard:
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400">Nama Google Anda</label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400">Email Akun Google</label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400">Nama Peternakan Anda</label>
                <input
                  type="text"
                  value={googleFarmName}
                  onChange={(e) => setGoogleFarmName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleGoogleSubmit}
                disabled={isLoading}
                className="flex-1 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-md"
              >
                {isLoading ? 'Menghubungkan...' : 'Lanjutkan Masuk'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
