import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  UserPlus,
  LogIn,
  Shield,
  Sparkles,
  Lock,
  Mail,
  Building2,
  User as UserIcon,
  Crown,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AuthService } from '../services/authService';
import type { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChanged: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onUserChanged }) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFarmName, setRegFarmName] = useState('');
  const [regPlan, setRegPlan] = useState<'PREMIUM' | 'ENTERPRISE' | 'STARTER'>('PREMIUM');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, tab]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await AuthService.login(loginEmail, loginPassword);
      if (res.success && res.user) {
        setSuccessMessage(`Selamat datang kembali, ${res.user.name}!`);
        setTimeout(() => {
          onUserChanged(res.user!);
          onClose();
        }, 600);
      } else {
        setErrorMessage(res.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
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
        email: regEmail,
        password: regPassword,
        farmName: regFarmName,
        plan: regPlan,
      });

      if (res.success && res.user) {
        setSuccessMessage(`Akun ${res.user.name} berhasil dibuat! Data peternakan disiapkan.`);
        setTimeout(() => {
          onUserChanged(res.user!);
          onClose();
        }, 700);
      } else {
        setErrorMessage(res.message || 'Pendaftaran gagal. Silakan coba lagi.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan koneksi saat pendaftaran.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/60 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col relative">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-slate-900 border-b border-amber-500/20 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-2xl text-slate-950 shadow-lg shadow-amber-500/30">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                Akun & Multi-User <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              </h2>
              <p className="text-xs text-slate-300">
                Kelola akun peternakan terpisah dengan data aman terisolasi.
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
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <LogIn className="w-4 h-4" /> Masuk Akun
          </button>
          <button
            onClick={() => setTab('REGISTER')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              tab === 'REGISTER'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Buat Akun Baru
          </button>
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
        <div className="p-6 pt-2 max-h-[60vh] overflow-y-auto">
          {tab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" /> Email atau No. WhatsApp
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan email atau no. WhatsApp"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Kata Sandi
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Memproses Login...' : 'Masuk ke Akun Peternakan'}
                </button>
              </div>
            </form>
          )}

          {tab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-amber-400" /> Nama Lengkap Pemilik / Pengelola
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: H. Pratama Putra"
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
                  required
                  placeholder="contoh: Peternakan Bebek Jaya Makmur"
                  value={regFarmName}
                  onChange={(e) => setRegFarmName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" /> Email Akun
                </label>
                <input
                  type="email"
                  required
                  placeholder="contoh: pratama@bebekjaya.id"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Kata Sandi Akun
                </label>
                <input
                  type="password"
                  required
                  placeholder="Buat kata sandi aman"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" /> Pilihan Paket Akun
                </label>
                <select
                  value={regPlan}
                  onChange={(e) => setRegPlan(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-amber-300 outline-none font-bold"
                >
                  <option value="PREMIUM">👑 PREMIUM (Fitur Lengkap POS + AI Bot + Telegram)</option>
                  <option value="ENTERPRISE">🏢 ENTERPRISE (Multi Kandang & Laporan Akuntansi)</option>
                  <option value="STARTER">🌱 STARTER (Gratis Uji Coba)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Mendaftarkan Akun...' : 'Daftar Akun & Mulai BebekJaya PRO'}
                </button>
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

          <span className="text-[10px] text-slate-500">BebekJaya PRO SaaS v2.5</span>
        </div>
      </div>
    </div>
  );
};
