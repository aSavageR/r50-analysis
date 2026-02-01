
import React from 'react';
import { ClubStats } from '../types';
import { METRIC_LABELS, METRIC_UNITS } from '../constants';
import { ChevronRight } from 'lucide-react';

interface ClubSummaryProps {
  stats: ClubStats;
  onDrilldown?: (club: string) => void;
}

const ClubSummary: React.FC<ClubSummaryProps> = ({ stats, onDrilldown }) => {
  const secondaryMetrics = ['ballSpeed', 'clubSpeed', 'launchAngle', 'spinRate'];

  return (
    <div 
      onClick={() => onDrilldown?.(stats.club)}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all shadow-lg group cursor-pointer active:scale-[0.98]"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stats.color }} />
          <h3 className="text-base font-black tracking-tight uppercase">{stats.club}</h3>
          <div className="px-1.5 py-0.5 bg-zinc-950 rounded border border-zinc-800 flex items-center gap-1">
            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-tighter">SMASH</span>
            <span className="text-[10px] font-black mono text-amber-400">{stats.averages.smashFactor.toFixed(2)}</span>
          </div>
        </div>
        <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-950 px-2 py-0.5 rounded">
          {stats.count} SHOTS
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mb-3">
        <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800/50 flex flex-col items-center">
          <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">CARRY</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-black mono text-emerald-400">{stats.averages.carryDistance.toFixed(1)}</span>
            <span className="text-[7px] font-black text-zinc-700 uppercase">yd</span>
          </div>
        </div>
        <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-800/50 flex flex-col items-center">
          <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">OFFLINE</span>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-base font-black mono ${stats.averages.offline === 0 ? 'text-zinc-500' : stats.averages.offline > 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              {stats.averages.offline === 0 ? '0' : `${stats.averages.offline > 0 ? 'R' : 'L'}${Math.abs(stats.averages.offline).toFixed(1)}`}
            </span>
            <span className="text-[7px] font-black text-zinc-700 uppercase">yd</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-1">
        {secondaryMetrics.map(m => (
          <div key={m} className="flex justify-between items-center">
            <div className="text-[7px] font-bold text-zinc-600 uppercase tracking-tight truncate">{METRIC_LABELS[m]}</div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[9px] mono font-black text-zinc-300">
                {stats.averages[m as keyof typeof stats.averages].toFixed(m === 'spinRate' ? 0 : 1)}
              </span>
              <span className="text-[6px] font-black text-zinc-700 uppercase">{METRIC_UNITS[m]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-zinc-800/50 flex justify-between items-center">
        <span className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.2em] group-hover:text-emerald-500 transition-colors">Performance Intel</span>
        <ChevronRight size={12} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
      </div>
    </div>
  );
};

export default ClubSummary;
