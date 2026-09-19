import React, { useState, useEffect } from 'react';
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
  KeyRound,
  MessageSquare,
} from 'lucide-react';
import { AuthService } from '../services/authService';
import { BrandLogo } from './BrandLogo';
import { GoogleConnectModal } from './GoogleConnectModal';
import type { User } from '../types';

interface AuthScreenProps {
  onSuccess: (user: User) => void;
  onDemoClick?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onDemoClick }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regFarmName, setRegFarmName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Forgot Password Form (Direct Reset)
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  // Auto load Google Identity Services script
  useEffect(() => {
    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMsg('Harap masukkan Username/No. WhatsApp/Email dan Kata Sandi.');
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
        setErrorMsg(res.message || 'Gagal masuk. Silakan periksa kembali Username, No. HP, atau Kata Sandi Anda.');
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

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Harap lengkapi semua data pendaftaran wajib (Nama, Email, dan Kata Sandi).');
      return;
    }

    if (regPassword.length < 5) {
      setErrorMsg('Kata sandi minimal 5 karakter untuk keamanan akun peternakan Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthService.register({
        name: regName,
        username: regUsername,
        farmName: regFarmName || `Peternakan ${regName.trim()}`,
        phone: regPhone,
        email: regEmail,
        password: regPassword,
        plan: 'PREMIUM',
      });

      if (res.success && res.user) {
        setSuccessMsg(`Akun peternakan ${res.user.name} berhasil dibuat! Membuka dashboard...`);
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

  // Handle Forgot Password (Direct reset with Username / Phone / Email)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!forgotIdentifier.trim() || !forgotNewPassword.trim()) {
      setErrorMsg('Harap masukkan Username/No. WhatsApp/Email dan kata sandi baru.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok. Silakan ketik ulang.');
      return;
    }

    if (forgotNewPassword.length < 5) {
      setErrorMsg('Kata sandi baru minimal 5 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthService.resetPassword({
        identifier: forgotIdentifier,
        newPassword: forgotNewPassword,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setLoginIdentifier(forgotIdentifier);
        setLoginPassword('');
        setTimeout(() => {
          setActiveTab('login');
          setSuccessMsg('Silakan masuk dengan kata sandi baru Anda.');
        }, 1500);
      } else {
        setErrorMsg(res.message || 'Akun tidak ditemukan. Periksa kembali Username/No. HP/Email Anda.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan sistem saat mereset kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Real Google Sign In (Direct Connect & GIS Compatible)
  const handleGoogleClick = async () => {
    setErrorMsg('');

    const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const hasRealGoogleClientId = Boolean(
      envClientId &&
      envClientId !== '517621415951-googleauth.apps.googleusercontent.com' &&
      envClientId.includes('.apps.googleusercontent.com')
    );

    // If a valid Google Cloud Client ID is configured, invoke Google GIS
    // @ts-expect-error - Google GIS dynamic API
    if (hasRealGoogleClientId && window.google?.accounts?.id) {
      setIsLoading(true);
      try {
        // @ts-expect-error - Google GIS dynamic API
        window.google.accounts.id.initialize({
          client_id: envClientId,
          callback: async (response: { credential?: string }) => {
            if (response.credential) {
              const res = await AuthService.loginWithGoogle({
                name: '',
                email: '',
                credential: response.credential,
              });
              setSuccessMsg(`Berhasil terhubung dengan Akun Google: ${res.user.name}`);
              setTimeout(() => onSuccess(res.user), 500);
            } else {
              setIsGoogleModalOpen(true);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // @ts-expect-error - Google GIS prompt
        window.google.accounts.id.prompt((notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsGoogleModalOpen(true);
          }
        });
      } catch {
        setIsGoogleModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Direct Connect modal: avoids Google 401 OAuth invalid_client popup error completely
      setIsGoogleModalOpen(true);
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
          <BrandLogo size="md" />
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
          {/* Header Title & Brand Emblem */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <BrandLogo size="lg" />
            </div>
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
              onClick={handleGoogleClick}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-md border border-slate-200 disabled:opacity-50"
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
              <span>{isLoading ? 'Menghubungkan Akun Google...' : 'Masuk Langsung dengan Akun Google'}</span>
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
                setSuccessMsg('');
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
                setSuccessMsg('');
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
                  Username, No. WhatsApp, atau Email
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Contoh: asep88 / 085600172785 / nama@email.com"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Lupa kata sandi?</span>
                  </button>
                </div>
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
                  Username Akun (Login Cepat) *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="Contoh: asep88 (tanpa spasi)"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Bisa dipakai untuk login cepat tanpa ketik email panjang.</p>
              </div>

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
                    placeholder="Contoh: Asep Pratama / H. Joko"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Usaha Peternakan
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regFarmName}
                    onChange={(e) => setRegFarmName(e.target.value)}
                    placeholder="Contoh: Peternakan Modern Asep"
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

          {/* TAB 3: FORGOT PASSWORD FORM */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="leading-relaxed text-[11px]">
                  <p className="font-bold text-amber-200 mb-0.5">Pemulihan Kata Sandi Cepat & Langsung</p>
                  <span>
                    Masukkan salah satu (Username, No. WhatsApp, atau Email), lalu langsung buat kata sandi baru Anda.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Username, No. WhatsApp, atau Email Terdaftar *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="Contoh: asep88 / 085600172785 / email@gmail.com"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kata Sandi Baru *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
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

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Konfirmasi Kata Sandi Baru *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-95 mt-3"
              >
                <span>{isLoading ? 'Memperbarui Kata Sandi...' : 'Simpan & Masuk dengan Sandi Baru'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              {/* Bantuan WhatsApp Admin */}
              <div className="pt-2 text-center">
                <a
                  href="https://wa.me/6285600172785?text=Halo%20Admin%20BebekJaya,%20saya%20butuh%20bantuan%20pemulihan%20kata%20sandi%20akun%20saya"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Butuh bantuan admin? Chat WhatsApp</span>
                </a>
              </div>
            </form>
          )}

          {/* Switch Tab Helper */}
          <div className="mt-5 text-center">
            {activeTab === 'login' ? (
              <p className="text-xs text-slate-400">
                Belum punya akun peternak?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
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
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
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

      {/* Google Direct Connect Modal (Zero Error 401!) */}
      <GoogleConnectModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={(user) => {
          setIsGoogleModalOpen(false);
          setSuccessMsg(`Berhasil terhubung dengan Google: ${user.name}`);
          setTimeout(() => onSuccess(user), 400);
        }}
        initialEmail="animasiasep887@gmail.com"
      />
    </div>
  );
};
