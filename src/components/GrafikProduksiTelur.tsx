import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Egg, TrendingUp, AlertTriangle, Scale } from 'lucide-react';
import type { PencatatanHarian } from '../types';

interface GrafikProduksiTelurProps {
  logs: PencatatanHarian[];
}

export const GrafikProduksiTelur: React.FC<GrafikProduksiTelurProps> = ({ logs }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  // Filter logs based on selected range
  const filteredLogs = React.useMemo(() => {
    const sorted = [...logs].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
    if (timeRange === '7d') {
      return sorted.slice(-7);
    }
    if (timeRange === '30d') {
      return sorted.slice(-30);
    }
    return sorted;
  }, [logs, timeRange]);

  // Metric Summaries
  const totalUtuh = filteredLogs.reduce((acc, curr) => acc + curr.telurUtuh, 0);
  const totalRetak = filteredLogs.reduce((acc, curr) => acc + curr.telurRetak, 0);
  const avgHdp = filteredLogs.length > 0
    ? (filteredLogs.reduce((acc, curr) => acc + curr.hdpPercentage, 0) / filteredLogs.length).toFixed(1)
    : '0';
  const avgFcr = filteredLogs.length > 0
    ? (filteredLogs.reduce((acc, curr) => acc + curr.fcr, 0) / filteredLogs.length).toFixed(2)
    : '0';

  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-800">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Egg className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Grafik Produksi Telur Harian & Produktivitas (HDP %)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualisasi tren panen telur Grade A, Grade B, dan rasio produktivitas Hen-Day Production.
          </p>
        </div>

        {/* Range Filter Buttons */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeRange === '7d'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeRange === '30d'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            30 Hari
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeRange === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Metric Quick Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Total Telur Grade A</p>
            <p className="text-base sm:text-xl font-extrabold text-amber-400">
              {totalUtuh.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">butir</span>
            </p>
          </div>
          <Egg className="w-7 h-7 text-amber-400/20" />
        </div>

        <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Telur Retak (Grade B)</p>
            <p className="text-base sm:text-xl font-extrabold text-orange-400">
              {totalRetak.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">butir</span>
            </p>
          </div>
          <AlertTriangle className="w-7 h-7 text-orange-400/20" />
        </div>

        <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Rata-rata HDP %</p>
            <p className="text-base sm:text-xl font-extrabold text-emerald-400">{avgHdp}%</p>
          </div>
          <TrendingUp className="w-7 h-7 text-emerald-400/20" />
        </div>

        <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Rasio FCR Pakan</p>
            <p className="text-base sm:text-xl font-extrabold text-sky-400">{avgFcr}</p>
          </div>
          <Scale className="w-7 h-7 text-sky-400/20" />
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-96 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredLogs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="tanggal"
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              tickFormatter={(str) => {
                const parts = str.split('-');
                return `${parts[2]}/${parts[1]}`;
              }}
            />

            {/* Left Axis: Egg Count */}
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[0, 'auto']} />

            {/* Right Axis: HDP Percentage */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              tick={{ fontSize: 11 }}
              unit="%"
              domain={[60, 100]}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '0.875rem',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
              }}
              formatter={(value: any, name: any) => {
                if (String(name).includes('HDP')) return [`${value}%`, name];
                return [`${Number(value).toLocaleString('id-ID')} butir`, name];
              }}
            />

            <Legend wrapperStyle={{ paddingTop: '14px', fontSize: '0.8rem' }} />

            {/* Bar: Telur Utuh (Grade A) */}
            <Bar
              yAxisId="left"
              dataKey="telurUtuh"
              name="Telur Utuh (Grade A)"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />

            {/* Bar: Telur Retak (Grade B) */}
            <Bar
              yAxisId="left"
              dataKey="telurRetak"
              name="Telur Retak (Grade B)"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />

            {/* Line: Hen-Day Production % */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="hdpPercentage"
              name="Produktivitas HDP (%)"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }}
              activeDot={{ r: 7 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
