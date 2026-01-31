
import React from 'react';
import { ClubStats, Shot } from '../types';
import { METRIC_LABELS, METRIC_UNITS } from '../constants';
import { ArrowLeft, Activity, TrendingUp, BarChart } from 'lucide-react';
import ClubCoach from './ClubCoach';

interface ClubDrilldownProps {
  stats: ClubStats;
  onBack: () => void;
}

const ClubDrilldown: React.FC<ClubDrilldownProps> = ({ stats, onBack }) => {
  const metricsToShow = Object.keys(METRIC_LABELS) as (keyof typeof METRIC_LABELS)[];

  const formatValue = (key: string, value: number) => {
    const isSpin = key.toLowerCase().includes('spin') && !key.toLowerCase().includes('axis');
    const absVal = Math.abs(value);
    const formatted = isSpin ? Math.round(absVal) : absVal.toFixed(1);
    
    // Directional metrics
    const lateralMetrics = ['sideSpin', 'spinAxis', 'launchDirection', 'offline', 'totalOffline'];
    if (lateralMetrics.includes(key) && value !== 0) {
      const dir = value > 0 ? 'R' : 'L';
      const color = value > 0 ? 'text-blue-400' : 'text-rose-400';
      return (
        <span className={`${color} font-black`}>
          {dir} {formatted}
        </span>
      );
    }

    return formatted;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
        >
          <div className="bg-zinc-900 p-2 rounded-xl group-hover:bg-zinc-800 transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: stats.color }} />
          <h2 className="text-3xl font-black uppercase tracking-tighter">{stats.club} Intel</h2>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Carry', value: stats.averages.carryDistance.toFixed(1), unit: 'yd', color: 'text-emerald-400' },
          { label: 'Avg Ball Speed', value: stats.averages.ballSpeed.toFixed(1), unit: 'mph', color: 'text-blue-400' },
          { label: 'Avg Spin', value: Math.round(stats.averages.spinRate), unit: 'rpm', color: 'text-zinc-100' },
          { label: 'Consistency', value: (100 - (stats.highs.carryDistance - stats.lows.carryDistance) / stats.averages.carryDistance * 100).toFixed(0), unit: '%', color: 'text-amber-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-sm">
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black mono ${stat.color}`}>{stat.value}</span>
              <span className="text-[10px] text-zinc-700 font-black uppercase">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Integrated Club Coach */}
      <ClubCoach stats={stats} />

      {/* Metric Ranges Summary Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <BarChart size={16} className="text-emerald-500" />
            <h3 className="text-xs font-black uppercase tracking-widest">Performance Boundaries</h3>
          </div>
          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Calculated across {stats.count} shots</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-[9px] text-zinc-500 font-black uppercase tracking-widest border-b border-zinc-800">
                <th className="px-6 py-4">Metric Attribute</th>
                <th className="px-6 py-4 text-right">Low (Min)</th>
                <th className="px-6 py-4 text-right text-zinc-300">Average</th>
                <th className="px-6 py-4 text-right">High (Max)</th>
                <th className="px-6 py-4 text-center">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {metricsToShow.map((m) => {
                return (
                  <tr key={m} className="hover:bg-zinc-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-black text-zinc-400 uppercase tracking-tight">{METRIC_LABELS[m]}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="mono text-xs font-bold text-zinc-500">
                        {formatValue(m, stats.lows[m])}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right bg-zinc-950/20">
                      <span className={`mono text-sm font-black ${m === 'carryDistance' || m === 'totalDistance' ? 'text-emerald-400' : 'text-zinc-100'}`}>
                        {formatValue(m, stats.averages[m])}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="mono text-xs font-bold text-zinc-500">
                        {formatValue(m, stats.highs[m])}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[9px] font-black text-zinc-700 uppercase">{METRIC_UNITS[m]}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Efficiency & Accuracy Quick Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={18} className="text-blue-400" />
            <h3 className="text-sm font-black uppercase tracking-widest">Launch Efficiency</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-black text-zinc-500 uppercase">Avg Launch Angle</span>
              <span className="text-lg font-black mono text-zinc-100">{stats.averages.launchAngle.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-black text-zinc-500 uppercase">Avg Spin Axis</span>
              <span className={`text-lg font-black mono ${stats.averages.spinAxis > 0 ? 'text-blue-400' : stats.averages.spinAxis < 0 ? 'text-rose-400' : 'text-zinc-100'}`}>
                {stats.averages.spinAxis === 0 ? '0.0' : `${stats.averages.spinAxis > 0 ? 'R' : 'L'} ${Math.abs(stats.averages.spinAxis).toFixed(1)}`}°
              </span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-emerald-400" />
            <h3 className="text-sm font-black uppercase tracking-widest">Dispersion Dynamics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-black text-zinc-500 uppercase">Carry Spread</span>
              <span className="text-lg font-black mono text-emerald-400">±{(stats.highs.carryDistance - stats.lows.carryDistance).toFixed(1)}y</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-black text-zinc-500 uppercase">Side Deviation</span>
              <span className={`text-lg font-black mono ${stats.averages.totalOffline > 0 ? 'text-blue-400' : stats.averages.totalOffline < 0 ? 'text-rose-400' : 'text-zinc-100'}`}>
                {stats.averages.totalOffline === 0 ? '0.0' : `${stats.averages.totalOffline > 0 ? 'R' : 'L'} ${Math.abs(stats.averages.totalOffline).toFixed(1)}`}y
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDrilldown;
