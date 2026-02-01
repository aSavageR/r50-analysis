
import React, { useState } from 'react';
import { ClubStats, Shot } from '../types';
import { METRIC_LABELS, METRIC_UNITS } from '../constants';
import { ArrowLeft, Activity, TrendingUp, BarChart, Info } from 'lucide-react';
import ClubCoach from './ClubCoach';

interface ClubDrilldownProps {
  stats: ClubStats;
  onBack: () => void;
}

const ClubDrilldown: React.FC<ClubDrilldownProps> = ({ stats, onBack }) => {
  // Metrics to show in the boundaries table
  const metricsToShow = [
    'carryDistance', 
    'ballSpeed', 
    'clubSpeed', 
    'smashFactor', 
    'angleAttack', 
    'launchAngle', 
    'spinRate', 
    'apex', 
    'offline'
  ] as (keyof typeof METRIC_LABELS)[];

  const [showConsistencyInfo, setShowConsistencyInfo] = useState(false);

  const formatValue = (key: string, value: number) => {
    const isSpin = key.toLowerCase().includes('spin') && !key.toLowerCase().includes('axis');
    const isSmash = key === 'smashFactor';
    const isAoA = key === 'angleAttack';
    const absVal = Math.abs(value);
    
    let formatted;
    if (isSpin) formatted = Math.round(absVal);
    else if (isSmash) formatted = absVal.toFixed(2);
    else formatted = absVal.toFixed(1);
    
    // Directional metrics
    const lateralMetrics = ['sideSpin', 'spinAxis', 'launchDirection', 'offline'];
    if (lateralMetrics.includes(key) && value !== 0) {
      const dir = value > 0 ? 'R' : 'L';
      const color = value > 0 ? 'text-blue-400' : 'text-rose-400';
      return (
        <span className={`${color} font-black`}>
          {dir} {formatted}
        </span>
      );
    }

    if (isAoA && value !== 0) {
      const color = value > 0 ? 'text-emerald-400' : 'text-rose-400';
      return (
        <span className={`${color} font-black`}>
          {value > 0 ? '↑' : '↓'} {formatted}
        </span>
      );
    }

    return formatted;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
        >
          <div className="bg-zinc-900 p-2.5 rounded-2xl group-hover:bg-zinc-800 transition-colors">
            <ArrowLeft size={24} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">Back</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" style={{ backgroundColor: stats.color }} />
          <h2 className="text-5xl font-black uppercase tracking-tighter text-white">{stats.club}</h2>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Carry', value: stats.averages.carryDistance.toFixed(1), unit: 'yd', color: 'text-emerald-400' },
          { label: 'Avg Smash', value: stats.averages.smashFactor.toFixed(2), unit: 'x', color: 'text-amber-400' },
          { label: 'Avg Attack', value: stats.averages.angleAttack.toFixed(1), unit: '°', color: stats.averages.angleAttack >= 0 ? 'text-emerald-400' : 'text-rose-400' },
          { 
            label: 'Consistency', 
            value: (100 - (stats.highs.carryDistance - stats.lows.carryDistance) / stats.averages.carryDistance * 100).toFixed(0), 
            unit: '%', 
            color: 'text-blue-400',
            hasInfo: true
          },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-sm relative overflow-visible">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs text-zinc-500 font-black uppercase tracking-[0.2em]">{stat.label}</p>
              {stat.hasInfo && (
                <div className="relative">
                  <button 
                    onMouseEnter={() => setShowConsistencyInfo(true)}
                    onMouseLeave={() => setShowConsistencyInfo(false)}
                    className="text-zinc-700 hover:text-emerald-500 transition-all"
                  >
                    <Info size={16} />
                  </button>
                  {showConsistencyInfo && (
                    <div className="absolute z-[100] left-0 top-10 w-72 p-6 bg-zinc-950 border border-zinc-800 rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-xs text-emerald-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Activity size={14} /> Analytics Logic
                      </p>
                      <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                        Consistency is the inverse of your carry distance spread. A higher percentage indicates professional-grade distance control and tighter landing patterns.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-black mono tracking-tighter ${stat.color}`}>{stat.value}</span>
              <span className="text-sm text-zinc-700 font-black uppercase">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <ClubCoach stats={stats} />

      {/* Metric Ranges Summary Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30">
          <div className="flex items-center gap-4">
            <BarChart size={22} className="text-emerald-500" />
            <h3 className="text-base font-black uppercase tracking-[0.3em]">Performance Boundaries</h3>
          </div>
          <span className="text-xs font-black text-zinc-500 uppercase tracking-widest bg-zinc-950 px-4 py-2 rounded-2xl border border-zinc-800">
            {stats.count} DATA POINTS
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 text-xs text-zinc-500 font-black uppercase tracking-widest border-b border-zinc-800">
                <th className="px-8 py-6">Attribute</th>
                <th className="px-8 py-6 text-right">Min (Low)</th>
                <th className="px-8 py-6 text-right text-zinc-300">Target (Avg)</th>
                <th className="px-8 py-6 text-right">Max (High)</th>
                <th className="px-8 py-6 text-center">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {metricsToShow.map((m) => {
                return (
                  <tr key={m} className="hover:bg-zinc-800/40 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-zinc-400 uppercase tracking-tight">{METRIC_LABELS[m]}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="mono text-sm font-bold text-zinc-500">
                        {formatValue(m, stats.lows[m])}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right bg-zinc-950/20">
                      <span className={`mono text-xl font-black ${m === 'carryDistance' || m === 'totalDistance' ? 'text-emerald-400' : 'text-zinc-100'}`}>
                        {formatValue(m, stats.averages[m])}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="mono text-sm font-bold text-zinc-500">
                        {formatValue(m, stats.highs[m])}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-xs font-black text-zinc-700 uppercase">{METRIC_UNITS[m]}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClubDrilldown;
