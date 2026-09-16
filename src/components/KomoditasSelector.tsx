import React, { useState } from 'react';
import { ChevronDown, Check, Sparkles, Layers, X } from 'lucide-react';
import { KOMODITAS_LIST } from '../types';
import type { KomoditasTernak } from '../types';

interface KomoditasSelectorProps {
  activeCommodity: KomoditasTernak;
  onChangeCommodity: (commodity: KomoditasTernak) => void;
  compact?: boolean;
}

export const KomoditasSelector: React.FC<KomoditasSelectorProps> = ({
  activeCommodity,
  onChangeCommodity,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentConfig = KOMODITAS_LIST[activeCommodity] || KOMODITAS_LIST.BEBEK_PETELUR;

  const handleSelect = (key: KomoditasTernak) => {
    onChangeCommodity(key);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all active:scale-95 shadow-sm ${
          compact
            ? 'bg-slate-900 hover:bg-slate-800 border-amber-500/30 text-amber-300 text-xs'
            : 'bg-gradient-to-r from-slate-900 to-slate-850 hover:border-amber-500/50 border-slate-700 text-white text-xs font-bold'
        }`}
        title="Ganti Sektor Peternakan / Budidaya"
      >
        <span className="text-base leading-none">{currentConfig.icon}</span>
        <span className="font-extrabold truncate text-amber-300 text-xs">
          <span className="sm:hidden">{currentConfig.nama.split(' ')[0]}</span>
          <span className="hidden sm:inline">{currentConfig.nama.split(' ')[0]} {currentConfig.nama.split(' ')[1] || ''}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop for both Mobile & Desktop */}
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm animate-fadeIn"
            onClick={() => setIsOpen(false)}
          />

          {/* 📱 MOBILE BOTTOM SHEET (Screen < sm): 100% Zero Clipping, Full Width Drawer */}
          <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 bg-slate-900 border-t border-amber-500/30 rounded-t-3xl p-4 shadow-2xl space-y-3 animate-slideUp max-h-[85vh] overflow-y-auto pb-safe">
            {/* Drag Bar Indicator */}
            <div className="w-12 h-1 rounded-full bg-slate-700 mx-auto mb-1" />

            {/* Header Drawer */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>Pilih Sektor Ternak</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">5 Sektor</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Pilih sektor yang ingin Anda catat saat ini</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Commodities Options */}
            <div className="space-y-2 pt-1">
              {(Object.keys(KOMODITAS_LIST) as KomoditasTernak[]).map((key) => {
                const item = KOMODITAS_LIST[key];
                const isSelected = key === activeCommodity;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelect(key)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 active:scale-[0.98] ${
                      isSelected
                        ? 'bg-amber-500/15 border-2 border-amber-500/50 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950/70 border border-slate-800 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <span className="text-2xl shrink-0 w-11 h-11 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-inner">
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">
                          {item.nama}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                            <Check className="w-3 h-3" /> Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-amber-300/90 font-medium truncate mt-0.5">
                        {item.subjudul}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        Satuan: {item.satuanProduksiUtama} • {item.labelKandang}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 text-[10px] text-slate-400 text-center">
              💡 Formula FCR, HDP & input panen otomatis disesuaikan dengan sektor terpilih.
            </div>
          </div>

          {/* 💻 DESKTOP DROPDOWN (Screen >= sm): Sleek Popover aligned to left */}
          <div className="hidden sm:block absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 p-2.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-800 mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                <Layers className="w-3.5 h-3.5" />
                <span>PILIH KOMODITAS TERNAK</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Multi-Sektor
              </span>
            </div>

            <div className="space-y-1">
              {(Object.keys(KOMODITAS_LIST) as KomoditasTernak[]).map((key) => {
                const item = KOMODITAS_LIST[key];
                const isSelected = key === activeCommodity;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelect(key)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-amber-500/15 border border-amber-500/40 text-white'
                        : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                    }`}
                  >
                    <span className="text-2xl shrink-0 p-1 bg-slate-950/60 rounded-lg border border-slate-800">
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          {item.nama}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-amber-400/90 font-medium">
                        {item.subjudul}
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        Satuan: {item.satuanProduksiUtama} • {item.labelKandang}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 px-2 py-1 text-[10px] text-slate-400 text-center">
              💡 Sistem menyesuaikan formula FCR & satuan produksi secara otomatis.
            </div>
          </div>
        </>
      )}
    </div>
  );
};
