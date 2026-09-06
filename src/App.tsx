import { useState, useEffect } from 'react';
import {
  Layers,
  Egg,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Settings,
  Bot,
  ShoppingBag,
  Bell,
} from 'lucide-react';

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
import { NotificationService } from './services/notificationService';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [appMode, setAppMode] = useState<AppMode>(StorageService.getMode());

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User>(AuthService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Modal tools state
  const [isKalkulatorOpen, setIsKalkulatorOpen] = useState<boolean>(false);
  const [isKasirOpen, setIsKasirOpen] = useState<boolean>(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);

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

  // Scroll to top when changing tab
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

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

      {/* Footer */}
      <footer className="hidden lg:block border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 PRATAMA BISNIS GRUP — Sistem Informasi Manajemen Peternakan Bebek Petelur Terpadu.</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Thumb-friendly & Ergonomic) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800/90 px-1.5 py-1.5 backdrop-blur-2xl bg-slate-950/95 shadow-2xl">
        <div className="flex items-center justify-around">
          {[
            { id: 'dashboard', label: 'Home', icon: Layers },
            { id: 'operasional', label: 'Panen', icon: Egg },
            { id: 'kasir_modal', label: 'Kasir', icon: ShoppingBag, isAction: true },
            { id: 'keuangan', label: 'Kas', icon: Wallet },
            { id: 'notif_modal', label: 'Notif', icon: Bell, isNotifAction: true },
            { id: 'laporan', label: 'Laporan', icon: TrendingUp },
            { id: 'aset', label: 'Aset', icon: ShieldCheck },
            { id: 'ai', label: 'AI Bot', icon: Bot },
            { id: 'pengaturan', label: 'Data', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isAction) {
                    setIsKasirOpen(true);
                  } else if (item.isNotifAction) {
                    setIsNotifModalOpen(true);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`flex flex-col items-center gap-0.5 px-1 py-1 rounded-xl transition-all ${
                  item.isAction
                    ? 'text-amber-400 font-black scale-110'
                    : item.isNotifAction
                    ? 'text-amber-300 font-bold'
                    : isActive
                    ? 'text-amber-400 font-extrabold scale-105'
                    : 'text-slate-400 font-medium hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive || item.isAction ? 'text-amber-400 stroke-[2.5]' : 'text-slate-400'}`} />
                <span className="text-[9px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
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
