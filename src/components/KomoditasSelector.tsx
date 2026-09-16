import React, { useState } from 'react';
import { ChevronDown, Check, Sparkles, Layers } from 'lucide-react';
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
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 sm:left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
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
