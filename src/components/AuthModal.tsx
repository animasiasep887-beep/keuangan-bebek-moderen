import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  UserPlus,
  LogIn,
  Sparkles,
  Lock,
  Mail,
  Building2,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Phone,
  KeyRound,
  MessageCircle,
  ShieldCheck,
  Trash2,
  Zap,
} from 'lucide-react';
import { AuthService, type SavedAccount } from '../services/authService';
import { BrandLogo } from './BrandLogo';
import type { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChanged: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onUserChanged }) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');

  // Saved accounts (Google-like Quick 1-Click Login)
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => AuthService.getSavedAccounts());
  const [showManualForm, setShowManualForm] = useState<boolean>(() => {
    return AuthService.getSavedAccounts().length === 0;
  });
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFarmName, setRegFarmName] = useState('');
  const [regPlan] = useState<'PREMIUM' | 'ENTERPRISE' | 'STARTER'>('PREMIUM');

  // Forgot password states (Direct identifier)
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      const accounts = AuthService.getSavedAccounts();
      setSavedAccounts(accounts);
      if (accounts.length === 0) {
        setShowManualForm(true);
      }
    }
  }, [isOpen, tab]);

  if (!isOpen) return null;

  // Quick 1-Click Login for Saved Account (Google-style)
  const handleQuickLogin = async (acc: SavedAccount) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const pwd = acc.savedPassword || '';
      const idToLogin = acc.username || acc.email || acc.identifier;
      const res = await AuthService.login(idToLogin, pwd, true);
      if (res.success && res.user) {
        setSuccessMessage(`Selamat datang kembali, ${res.user.name}!`);
        setSavedAccounts(AuthService.getSavedAccounts());
        setTimeout(() => {
          onUserChanged(res.user!);
          onClose();
        }, 400);
      } else {
        setLoginIdentifier(idToLogin);
        setShowManualForm(true);
        setErrorMessage('Kata sandi perlu dimasukkan ulang untuk verifikasi.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat menghubungkan akun.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSavedAccount = (e: React.MouseEvent, idOrIdent: string) => {
    e.stopPropagation();
    AuthService.removeSavedAccount(idOrIdent);
    const updated = AuthService.getSavedAccounts();
    setSavedAccounts(updated);
    if (updated.length === 0) {
      setShowManualForm(true);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await AuthService.login(loginIdentifier, loginPassword, rememberMe);
      if (res.success && res.user) {
        setSuccessMessage(`Selamat datang kembali, ${res.user.name}!`);
        setSavedAccounts(AuthService.getSavedAccounts());
        setTimeout(() => {
          onUserChanged(res.user!);
          onClose();
        }, 500);
      } else {
        setErrorMessage(res.message || 'Login gagal. Periksa kembali Username/No. HP/Email dan kata sandi Anda.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan koneksi saat login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await AuthService.register({
        name: regName,
        username: regUsername,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        farmName: regFarmName || `Peternakan ${regName.trim()}`,
        plan: regPlan,
        rememberMe: rememberMe,
      });

      if (res.success && res.user) {
        setSuccessMessage(`Akun ${res.user.name} berhasil dibuat! Data peternakan disiapkan.`);
        setSavedAccounts(AuthService.getSavedAccounts());
        setTimeout(() => {
          onUserChanged(res.user!);
          onClose();
        }, 600);
      } else {
        setErrorMessage(res.message || 'Pendaftaran gagal. Silakan coba lagi.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan koneksi saat pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!forgotIdentifier.trim() || !forgotNewPassword.trim()) {
      setErrorMessage('Harap masukkan Username/No. WhatsApp/Email dan kata sandi baru.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (forgotNewPassword.length < 5) {
      setErrorMessage('Kata sandi baru minimal 5 karakter.');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.resetPassword({
        identifier: forgotIdentifier,
        newPassword: forgotNewPassword,
      });

      if (res.success) {
        setSuccessMessage(res.message);
        setLoginIdentifier(forgotIdentifier);
        setTimeout(() => {
          setTab('LOGIN');
          setSuccessMessage('Silakan masuk dengan kata sandi baru Anda.');
        }, 1500);
      } else {
        setErrorMessage(res.message || 'Akun tidak ditemukan. Periksa kembali Username/No. HP/Email Anda.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan sistem saat mereset kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    const guestUser = AuthService.switchToGuest();
    onUserChanged(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2.5 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/70 rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col relative max-h-[92vh] my-auto">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-slate-900 border-b border-amber-500/20 p-4 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                Akun Peternakan <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              </h2>
              <p className="text-xs text-slate-300">
                Kelola akun peternakan terpisah dengan data aman terisolasi di server Pratama Grup.
              </p>
            </div>
          </div>

          {/* Current Active Account Indicator */}
          {currentUser && (
            <div className="mt-4 bg-slate-950/60 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold text-sm">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {currentUser.name}
                    <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-black border border-amber-400/30">
                      {currentUser.plan}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{currentUser.farmName}</div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Aktif
              </span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1">
          <button
            onClick={() => setTab('LOGIN')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'LOGIN'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <LogIn className="w-4 h-4" /> Masuk Akun
          </button>
          <button
            onClick={() => setTab('REGISTER')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'REGISTER'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Buat Akun Baru
          </button>
          {tab === 'FORGOT' && (
            <button
              onClick={() => setTab('FORGOT')}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black"
            >
              <KeyRound className="w-4 h-4" /> Pulihkan Akun
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="px-6 pt-4">
          {errorMessage && (
            <div className="bg-red-950/60 border border-red-500/50 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2 mb-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2 mb-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 pt-2 flex-1 overflow-y-auto">
          {tab === 'LOGIN' && (
            <div className="space-y-4">
              {/* OPSI 1: AKUN TERSIMPAN DI PERANGKAT (FITUR CEPAT MIRIP GOOGLE) */}
              {savedAccounts.length > 0 && !showManualForm ? (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Pilih Akun Tersimpan (1-Klik)
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                      Tersimpan di Perangkat
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {savedAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => handleQuickLogin(acc)}
                        className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 hover:from-amber-950/30 hover:to-slate-800 border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer group shadow-md flex items-center justify-between gap-3 relative overflow-hidden active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                            {acc.avatarUrl ? (
                              <img
                                src={acc.avatarUrl}
                                alt={acc.name}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <span className="text-amber-400 font-black text-base">
                                {acc.name.charAt(0)}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition-colors truncate flex items-center gap-1.5">
                              <span>{acc.name}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                                Tersimpan
                              </span>
                            </p>
                            <p className="text-[11px] text-amber-400/90 truncate font-semibold">
                              {acc.farmName || 'Peternakan Pratama Grup'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              @{acc.username || acc.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleRemoveSavedAccount(e, acc.id)}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Hapus akun tersimpan dari perangkat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="px-3 py-1.5 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md transition-all">
                            <span>Masuk</span>
                            <LogIn className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowManualForm(true);
                        setLoginIdentifier('');
                        setLoginPassword('');
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-800 transition-all cursor-pointer shadow-sm"
                    >
                      <span>+ Masuk dengan Akun Lain / Ketik Manual</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* OPSI 2: FORM LOGIN MANUAL */
                <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                  {savedAccounts.length > 0 && (
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowManualForm(false)}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        ← Kembali ke Akun Tersimpan ({savedAccounts.length})
                      </button>
                      <span className="text-[10px] text-slate-400">Ketik Manual</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-amber-400" /> Username, No. WhatsApp, atau Email
                    </label>
                    <input
                      type="text"
                      name="username"
                      autoComplete="username"
                      required
                      placeholder="Contoh: asep88 / 085600172785 / nama@email.com"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                    />

                    {/* Quick Suggestion Chips */}
                    {savedAccounts.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                          <Zap className="w-3 h-3 text-amber-400" /> Saran Akun:
                        </span>
                        {savedAccounts.map((acc) => (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => {
                              setLoginIdentifier(acc.username || acc.email || acc.identifier);
                              if (acc.savedPassword) {
                                setLoginPassword(acc.savedPassword);
                              }
                            }}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 font-bold transition-all cursor-pointer"
                          >
                            👤 {acc.username || acc.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" /> Kata Sandi
                      </label>
                      <button
                        type="button"
                        onClick={() => setTab('FORGOT')}
                        className="text-amber-400 hover:text-amber-300 text-xs hover:underline font-semibold"
                      >
                        Lupa sandi?
                      </button>
                    </div>
                    <input
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>

                  {/* Checkbox Ingat Saya */}
                  <div className="pt-0.5">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 accent-amber-500 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-semibold">
                        Simpan akun & sandi di perangkat ini (Masuk Cepat 1-Klik)
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Memproses Login...' : 'Masuk ke Akun Peternakan'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {tab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-amber-400" /> Username Akun (Login Cepat) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: asep88 (tanpa spasi)"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" /> Nama Lengkap Pemilik / Pengelola *
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: Asep Pratama / H. Joko"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" /> Nama Usaha Peternakan
                </label>
                <input
                  type="text"
                  placeholder="contoh: Peternakan Pratama Asep"
                  value={regFarmName}
                  onChange={(e) => setRegFarmName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" /> No. WhatsApp Aktif
                  </label>
                  <input
                    type="tel"
                    placeholder="contoh: 081234567890"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" /> Email Akun *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contoh: asep@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Kata Sandi Akun *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 5 karakter"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              {/* Checkbox Ingat Saya di Pendaftaran */}
              <div className="pt-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 font-semibold">
                    Simpan akun & sandi di perangkat ini (Masuk Cepat 1-Klik)
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Mendaftarkan Akun...' : 'Daftar Akun & Mulai Sekarang'}
                </button>
              </div>
            </form>
          )}

          {tab === 'FORGOT' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200 leading-relaxed">
                🛡️ Masukkan <strong>Username, No. WhatsApp, atau Email terdaftar</strong> Anda, lalu langsung tentukan kata sandi baru.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-amber-400" /> Username, No. WhatsApp, atau Email *
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: asep88 / 081234567890 / email@gmail.com"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Kata Sandi Baru *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 5 karakter"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Ulangi Kata Sandi Baru *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ketik ulang kata sandi baru"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Memperbarui Sandi...' : 'Simpan Sandi Baru & Masuk'}
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setTab('LOGIN')}
                  className="text-amber-400 hover:underline font-bold"
                >
                  ← Kembali ke Halaman Masuk
                </button>

                <a
                  href="https://wa.me/6285600172785?text=Halo%20Admin%20Pratama%20Grup,%20saya%20butuh%20bantuan%20pemulihan%20akun%20peternakan"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Bantuan CS WhatsApp
                </a>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={handleGuestMode}
            className="text-slate-400 hover:text-white underline font-medium text-[11px]"
          >
            Atau Uji Coba Tanpa Login (Mode Demo)
          </button>

          <span className="text-[10px] text-slate-500">Pratama Grup SIM Peternakan v2.5</span>
        </div>
      </div>
    </div>
  );
};
