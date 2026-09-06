import { useState, useEffect } from 'react';


import { StorageService } from './services/storage';
import type { AppMode } from './services/storage';
import { AuthService } from './services/authService';
import type { User } from './types';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { OperasionalView } from './components/OperasionalView';
import { KeuanganView } from './components/KeuanganView';
import { AsetKewajibanView } from './components/AsetKewajibanView';
import { LaporanView } from './components/LaporanView';
import { PengaturanView } from './components/PengaturanView';
import { AIAssistantView } from './components/AIAssistantView';
import { ToastProvider } from './components/ToastContainer';
import { KalkulatorPeternakModal } from './components/KalkulatorPeternakModal';
import { KasirPanenModal } from './components/KasirPanenModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { NotifikasiPengaturanModal } from './components/NotifikasiPengaturanModal';
import { AuthModal } from './components/AuthModal';
import { ProyeksiBisnisModal } from './components/ProyeksiBisnisModal';
import { NotificationService } from './services/notificationService';
import { AuthScreen } from './components/AuthScreen';
import { BottomNav } from './components/BottomNav';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [appMode, setAppMode] = useState<AppMode>(StorageService.getMode());

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => AuthService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Modal tools state
  const [isKalkulatorOpen, setIsKalkulatorOpen] = useState<boolean>(false);
  const [isKasirOpen, setIsKasirOpen] = useState<boolean>(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [isProyeksiOpen, setIsProyeksiOpen] = useState<boolean>(false);

  // Application Data States
  const [metrics, setMetrics] = useState(StorageService.calculateMetrics());
  const [logs, setLogs] = useState(StorageService.getPencatatanHarian());
  const [transactions, setTransactions] = useState(StorageService.getTransaksi());
  const [kandangList, setKandangList] = useState(StorageService.getKandang());
  const [populasiList, setPopulasiList] = useState(StorageService.getPopulasi());
  const [pakanList, setPakanList] = useState(StorageService.getPakan());
  const [kodeAkunList, setKodeAkunList] = useState(StorageService.getKodeAkun());
  const [asetList, setAsetList] = useState(StorageService.getAset());
  const [hpList, setHpList] = useState(StorageService.getHutangPiutang());

  const refreshAllData = () => {
    setMetrics(StorageService.calculateMetrics());
    setLogs(StorageService.getPencatatanHarian());
    setTransactions(StorageService.getTransaksi());
    setKandangList(StorageService.getKandang());
    setPopulasiList(StorageService.getPopulasi());
    setPakanList(StorageService.getPakan());
    setKodeAkunList(StorageService.getKodeAkun());
    setAsetList(StorageService.getAset());
    setHpList(StorageService.getHutangPiutang());
  };

  const handleUserChanged = (newUser: User) => {
    setCurrentUser(newUser);
    StorageService.initStorage();
    StorageService.fetchFromBackend().then(() => {
      refreshAllData();
    });
  };

  const handleResetZero = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan seluruh data menjadi 0? Data saat ini di Akun Real akan di-reset.')) {
      StorageService.clearRealData();
      refreshAllData();
    }
  };

  const handleResetDemo = () => {
    if (confirm('Apakah Anda yakin ingin memuat ulang Data Demo simulasi 30 hari?')) {
      StorageService.resetDemoData();
      refreshAllData();
    }
  };

  // Initialize storage once on load & periodically fetch latest updates from Telegram/Backend
  useEffect(() => {
    StorageService.initStorage();
    StorageService.fetchFromBackend().then(() => {
      refreshAllData();
    });

    // Initialize automated 07:00 & 08:00 morning notification reminders
    NotificationService.initScheduler();

    // Background sync every 4 seconds to receive updates made via Telegram Bot
    const interval = setInterval(async () => {
      const updated = await StorageService.fetchFromBackend();
      if (updated) {
        refreshAllData();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleMode = (newMode: AppMode) => {
    if (newMode === appMode) return;
    StorageService.setMode(newMode);
    setAppMode(newMode);
    refreshAllData();
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari akun peternakan ini?')) {
      AuthService.logout();
      setCurrentUser(null);
    }
  };

  // Scroll to top when changing tab
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // If user is unauthenticated, show public Google/Registration Auth Screen
  if (!currentUser) {
    return (
      <AuthScreen
        onSuccess={(user) => {
          setCurrentUser(user);
          StorageService.setMode('REAL');
          StorageService.initStorage('REAL');
          StorageService.fetchFromBackend().then(() => {
            refreshAllData();
          });
          setActiveTab('dashboard');
        }}
        onDemoClick={() => {
          const guest = AuthService.switchToGuest();
          setCurrentUser(guest);
          StorageService.setMode('DEMO');
          StorageService.initStorage('DEMO');
          refreshAllData();
          setActiveTab('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 pb-safe">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        appMode={appMode}
        onToggleMode={handleToggleMode}
        onOpenKalkulator={() => setIsKalkulatorOpen(true)}
        onOpenKasir={() => setIsKasirOpen(true)}
        onOpenNotifikasi={() => setIsNotifModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Mode & Active User Banner Indicator */}
      <div
        className={`w-full py-1.5 px-4 text-center text-xs font-bold transition-all flex items-center justify-center gap-2 flex-wrap ${
          appMode === 'REAL'
            ? 'bg-emerald-950/70 border-b border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/70 border-b border-amber-500/30 text-amber-300'
        }`}
      >
        {appMode === 'REAL' ? (
          <span>🟢 <strong>AKUN REAL ({currentUser?.farmName || 'Peternakan Saya'})</strong> — Data tersimpan terisolasi per akun di disk.</span>
        ) : (
          <span>🧪 <strong>MODE DEMO (SIMULASI 30 HARI)</strong> — Menggunakan data contoh untuk simulasi & uji coba fitur.</span>
        )}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="underline hover:text-white font-extrabold text-[11px] bg-slate-900/60 px-2 py-0.5 rounded-lg border border-slate-700 ml-1"
        >
          👤 {currentUser?.name} ({currentUser?.plan}) - Ganti / Login Akun
        </button>
      </div>


      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            logs={logs}
            transactions={transactions}
            pakanList={pakanList}
            setActiveTab={setActiveTab}
            onOpenKalkulator={() => setIsKalkulatorOpen(true)}
            onOpenKasir={() => setIsKasirOpen(true)}
            onOpenProyeksi={() => setIsProyeksiOpen(true)}
          />

        )}

        {activeTab === 'operasional' && (
          <OperasionalView
            logs={logs}
            kandangList={kandangList}
            populasiList={populasiList}
            pakanList={pakanList}
            onRefreshData={refreshAllData}
            setActiveTab={setActiveTab}
            onOpenKasir={() => setIsKasirOpen(true)}
            onOpenKalkulator={() => setIsKalkulatorOpen(true)}
          />
        )}

        {activeTab === 'keuangan' && (
          <KeuanganView
            transactions={transactions}
            kodeAkunList={kodeAkunList}
            onRefreshData={refreshAllData}
            onOpenKasir={() => setIsKasirOpen(true)}
          />
        )}

        {activeTab === 'aset' && (
          <AsetKewajibanView
            asetList={asetList}
            hpList={hpList}
            onRefreshData={refreshAllData}
          />
        )}

        {activeTab === 'laporan' && (
          <LaporanView
            transactions={transactions}
            asetList={asetList}
            hpList={hpList}
            logs={logs}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'ai' && (
          <AIAssistantView
            metrics={metrics}
          />
        )}

        {activeTab === 'pengaturan' && (
          <PengaturanView
            kandangList={kandangList}
            populasiList={populasiList}
            kodeAkunList={kodeAkunList}
            onRefreshData={refreshAllData}
            onResetZero={handleResetZero}
            onResetDemo={handleResetDemo}
            onOpenNotifikasi={() => setIsNotifModalOpen(true)}
          />
        )}
      </main>

      {/* Modals & Tools */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onUserChanged={handleUserChanged}
      />

      <KalkulatorPeternakModal
        isOpen={isKalkulatorOpen}
        onClose={() => setIsKalkulatorOpen(false)}
        populasiDefault={metrics.totalPopulasiHidup || 1000}
      />

      <ProyeksiBisnisModal
        isOpen={isProyeksiOpen}
        onClose={() => setIsProyeksiOpen(false)}
        populasiDefault={metrics.totalPopulasiHidup || 1000}
      />

      <KasirPanenModal
        isOpen={isKasirOpen}
        onClose={() => setIsKasirOpen(false)}
        onRefreshData={refreshAllData}
      />

      <NotifikasiPengaturanModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
      />

      {/* PWA Mobile App Install Prompt Banner */}
      <PWAInstallPrompt />

      {/* Footer Desktop */}
      <footer className="hidden lg:block border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 PRATAMA BISNIS GRUP — Sistem Informasi Manajemen Peternakan Bebek Petelur Terpadu.</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Ergonomic for Android & Handphone) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenKasir={() => setIsKasirOpen(true)}
        onOpenKalkulator={() => setIsKalkulatorOpen(true)}
        onOpenProyeksi={() => setIsProyeksiOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
      />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
