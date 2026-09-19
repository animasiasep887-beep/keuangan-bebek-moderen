import React, { useState } from 'react';
import { ChevronDown, Check, Sparkles, Layers, X } from 'lucide-react';
import { KOMODITAS_LIST } from '../types';
import type { KomoditasTernak } from '../types';

interface KomoditasSelectorProps {
  activeCommodity: KomoditasTernak;
  onChangeCommodity: (commodity: KomoditasTernak) => void;
  compact?: boolean;
}

const getCommodityDisplay = (key: KomoditasTernak) => {
  switch (key) {
    case 'BEBEK_PETELUR':
      return { short: 'Bebek', full: 'Bebek Petelur', tag: 'Telur & HDP' };
    case 'AYAM_PETELUR':
      return { short: 'Ayam Telur', full: 'Ayam Petelur (Layer)', tag: 'Telur Ras' };
    case 'AYAM_PEDAGING':
      return { short: 'Broiler', full: 'Ayam Broiler Daging', tag: 'Panen Daging' };
    case 'SAPI':
      return { short: 'Sapi', full: 'Sapi Perah & Potong', tag: 'Susu & Daging' };
    case 'LELE':
      return { short: 'Ikan Lele', full: 'Budidaya Ikan Lele', tag: 'Bioflok Kolam' };
    default:
      return { short: 'Bebek', full: 'Bebek Petelur', tag: 'Peternakan' };
  }
};

export const KomoditasSelector: React.FC<KomoditasSelectorProps> = ({
  activeCommodity,
  onChangeCommodity,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentConfig = KOMODITAS_LIST[activeCommodity] || KOMODITAS_LIST.BEBEK_PETELUR;
  const currentDisplay = getCommodityDisplay(activeCommodity);

  const handleSelect = (key: KomoditasTernak) => {
    onChangeCommodity(key);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl border transition-all active:scale-95 shadow-md ${
          compact
            ? 'bg-slate-900/90 hover:bg-slate-800 border-amber-500/40 text-amber-300 text-xs'
            : 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 hover:border-amber-400/60 border-amber-500/30 text-white text-xs font-bold'
        }`}
        title="Ganti Sektor Peternakan / Budidaya"
      >
        <span className="text-base sm:text-lg leading-none shrink-0 drop-shadow-sm">
          {currentConfig.icon}
        </span>
        <span className="font-black truncate text-amber-300 text-xs sm:text-sm tracking-tight">
          <span className="inline sm:hidden">{currentDisplay.short}</span>
          <span className="hidden sm:inline">{currentDisplay.full}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-amber-400/80 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-amber-300' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop: click outside to dismiss */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
          />

          {/* 📱 MOBILE DROPDOWN (Downwards below header, max-w-sm centered) */}
          <div className="sm:hidden fixed top-14 left-3 right-3 max-w-sm mx-auto z-50 rounded-2xl bg-slate-900/95 border border-amber-500/40 shadow-2xl p-3.5 animate-in fade-in slide-in-from-top-3 duration-200 backdrop-blur-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>PILIH SEKTOR KOMODITAS</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-extrabold">
                      5 Sektor
                    </span>
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List Sektor */}
            <div className="space-y-1.5 max-h-[68vh] overflow-y-auto pr-0.5">
              {(Object.keys(KOMODITAS_LIST) as KomoditasTernak[]).map((key) => {
                const item = KOMODITAS_LIST[key];
                const display = getCommodityDisplay(key);
                const isSelected = key === activeCommodity;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelect(key)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 active:scale-[0.98] ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/50 text-white shadow-md shadow-amber-500/10'
                        : 'bg-slate-950/60 border border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <span className="text-2xl shrink-0 w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-inner">
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white truncate">
                          {display.full}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                            <Check className="w-3 h-3" /> Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-amber-300/90 font-medium truncate mt-0.5">
                        {display.tag} • Satuan: {item.satuanProduksiUtama}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 mt-1 border-t border-slate-800 text-[10px] text-slate-400 text-center">
              💡 Formula FCR, HDP, dan input panen otomatis disesuaikan.
            </div>
          </div>

          {/* 💻 DESKTOP DROPDOWN (Directly below button, left-aligned) */}
          <div className="hidden sm:block absolute left-0 top-full mt-2 w-84 rounded-2xl bg-slate-900/98 border border-amber-500/35 shadow-2xl z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl">
            <div className="px-2 py-1.5 border-b border-slate-800 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                <Layers className="w-3.5 h-3.5" />
                <span>PILIH SEKTOR KOMODITAS</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> 5 Sektor
              </span>
            </div>

            <div className="space-y-1.5">
              {(Object.keys(KOMODITAS_LIST) as KomoditasTernak[]).map((key) => {
                const item = KOMODITAS_LIST[key];
                const display = getCommodityDisplay(key);
                const isSelected = key === activeCommodity;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelect(key)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/40 text-white shadow-sm'
                        : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                    }`}
                  >
                    <span className="text-2xl shrink-0 p-1 bg-slate-950/80 rounded-xl border border-slate-800 w-10 h-10 flex items-center justify-center">
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">
                          {display.full}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-amber-400/90 font-medium">
                        {display.tag}
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        Satuan: {item.satuanProduksiUtama} • {item.labelKandang}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800 px-2 py-1 text-[10px] text-slate-400 text-center">
              💡 Formula FCR & satuan produksi otomatis disinkronkan.
            </div>
          </div>
        </>
      )}
    </div>
  );
};
