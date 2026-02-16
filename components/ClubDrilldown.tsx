
import React, { useState, useMemo } from 'react';
import { ClubStats, Shot } from '../types';
import { METRIC_LABELS, METRIC_UNITS } from '../constants';
import { ArrowLeft, Activity, BarChart, Info } from 'lucide-react';
import ClubCoach from './ClubCoach';
import TourComparison from './TourComparison';

interface ClubDrilldownProps {
  stats: ClubStats;
  onBack: () => void;
}

const ClubDrilldown: React.FC<ClubDrilldownProps> = ({ stats, onBack }) => {
  const metricsToShow = [
    'carryDistance', 
    'totalDistance',
    'ballSpeed', 
    'clubSpeed', 
    'smashFactor', 
    'clubPath',
    'clubFace',
    'launchDirection',
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
    
    const numValue = (value === undefined || isNaN(value)) ? 0 : value;
    const absVal = Math.abs(numValue);
    
    let formatted;
    if (isSpin) formatted = Math.round(absVal).toString();
    else if (isSmash) formatted = absVal.toFixed(2);
    else formatted = absVal.toFixed(1);
    
    const lateralMetrics = ['sideSpin', 'spinAxis', 'launchDirection', 'offline', 'clubPath', 'clubFace'];
    if (lateralMetrics.includes(key) && numValue !== 0) {
      const dir = numValue > 0 ? 'R' : 'L';
      const color = numValue > 0 ? 'text-blue-400' : 'text-rose-400';
      return (
        <span className={`${color} font-black`}>
          {dir}{formatted}
        </span>
      );
    }

    if (isAoA && numValue !== 0) {
      const color = numValue > 0 ? 'text-emerald-400' : 'text-rose-400';
      return (
        <span className={`${color} font-black`}>
          {numValue > 0 ? '↑' : '↓'}{formatted}
        </span>
      );
    }

    return formatted;
  };

  const consistencyValue = useMemo(() => {
    const spread = (stats.highs.carryDistance || 0) - (stats.lows.carryDistance || 0);
    const avg = stats.averages.carryDistance || 0;
    if (avg === 0) return 0;
    const val = 100 - (spread / avg * 100);
    return isNaN(val) ? 0 : Math.max(0, Math.min(100, val));
  }, [stats]);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500 pb-16">
      {/* Header Section */}
      <div className="flex items-center justify-between px-1">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
        >
          <div className="bg-zinc-900 p-2 rounded-lg group-hover:bg-zinc-800 transition-colors shadow-md">
            <ArrowLeft size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Dash</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]" style={{ backgroundColor: stats.color }} />
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">{stats.club} Intel</h2>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-1">
        {[
          { 
            label: 'Avg Carry', 
            value: (isNaN(stats.averages.carryDistance) ? 0 : stats.averages.carryDistance).toFixed(1), 
            unit: 'yd', 
            color: 'text-emerald-400' 
          },
          { 
            label: 'Avg Smash', 
            value: (isNaN(stats.averages.smashFactor) ? 0 : stats.averages.smashFactor).toFixed(2), 
            unit: 'x', 
            color: 'text-amber-400' 
          },
          { 
            label: 'Avg Attack', 
            value: (isNaN(stats.averages.angleAttack) ? 0 : stats.averages.angleAttack).toFixed(1), 
            unit: '°', 
            color: (stats.averages.angleAttack || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400' 
          },
          { 
            label: 'Consistency', 
            value: consistencyValue.toFixed(0), 
            unit: '%', 
            color: 'text-blue-400',
            hasInfo: true
          },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-sm relative overflow-visible flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-[9px] text-zinc-500 font-black uppercase tracking-tight">{stat.label}</p>
              {stat.hasInfo && (
                <div className="relative">
                  <button 
                    onMouseEnter={() => setShowConsistencyInfo(true)}
                    onMouseLeave={() => setShowConsistencyInfo(false)}
                    className="text-zinc-700 hover:text-emerald-500 transition-all"
                  >
                    <Info size={10} />
                  </button>
                  {showConsistencyInfo && (
                    <div className="absolute z-[100] left-1/2 -translate-x-1/2 top-6 w-48 p-3 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
                      <p className="text-[9px] text-zinc-400 font-medium leading-tight">
                        Consistency measures carry distance spread. High % = predictable control.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black mono tracking-tighter ${stat.color}`}>{stat.value}</span>
              <span className="text-[9px] text-zinc-700 font-black uppercase">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <TourComparison stats={stats} />

      <ClubCoach stats={stats} />

      {/* Performance Boundaries Table - Optimized for Mobile */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl mx-1">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30">
          <div className="flex items-center gap-2">
            <BarChart size={16} className="text-emerald-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.1em]">Performance Boundaries</h3>
          </div>
          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
            {stats.count} SHOTS
          </span>
        </div>
        <div className="w-full overflow-x-hidden">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-zinc-950 text-[8px] text-zinc-600 font-black uppercase tracking-widest border-b border-zinc-800">
                <th className="px-2 py-2.5 w-[30%]">Metric</th>
                <th className="px-1 py-2.5 text-right w-[18%]">MIN</th>
                <th className="px-1 py-2.5 text-right text-zinc-300 w-[22%]">AVERAGE</th>
                <th className="px-1 py-2.5 text-right w-[18%]">MAX</th>
                <th className="px-1 py-2.5 text-center w-[12%]">U</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {metricsToShow.map((m) => {
                const avg = stats.averages[m];
                return (
                  <tr key={m} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-2 py-3 overflow-hidden text-ellipsis whitespace-nowrap">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tight">{METRIC_LABELS[m]}</span>
                    </td>
                    <td className="px-1 py-3 text-right">
                      <span className="mono text-[10px] font-bold text-zinc-600">
                        {formatValue(m, stats.lows[m])}
                      </span>
                    </td>
                    <td className="px-1 py-3 text-right bg-zinc-950/10">
                      <span className={`mono text-sm font-black ${m === 'carryDistance' || m === 'totalDistance' ? 'text-emerald-400' : 'text-zinc-100'}`}>
                        {formatValue(m, avg)}
                      </span>
                    </td>
                    <td className="px-1 py-3 text-right">
                      <span className="mono text-[10px] font-bold text-zinc-600">
                        {formatValue(m, stats.highs[m])}
                      </span>
                    </td>
                    <td className="px-1 py-3 text-center">
                      <span className="text-[8px] font-black text-zinc-800 uppercase">{METRIC_UNITS[m]}</span>
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
