
import React from 'react';
import { ClubStats } from '../types';
import { METRIC_LABELS, METRIC_UNITS } from '../constants';
import { ChevronRight } from 'lucide-react';

interface ClubSummaryProps {
  stats: ClubStats;
  onDrilldown?: (club: string) => void;
}

const ClubSummary: React.FC<ClubSummaryProps> = ({ stats, onDrilldown }) => {
  const secondaryMetrics = [
    { key: 'ballSpeed', label: 'BALL' },
    { key: 'clubSpeed', label: 'CLUB' },
    { key: 'launchAngle', label: 'LAUNCH' },
    { key: 'spinRate', label: 'SPIN' }
  ];

  return (
    <div 
      onClick={() => onDrilldown?.(stats.club)}
      className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-5 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all shadow-xl group cursor-pointer active:scale-[0.98] overflow-hidden"
    >
      {/* Header Row: Club Name + Smash (Inline) + Shot Count */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: stats.color }} />
          <h3 className="text-2xl font-black tracking-tighter uppercase text-white leading-none">{stats.club}</h3>
          
          {/* Inline Smash Factor */}
          <div className="inline-flex px-1.5 py-0.5 bg-zinc-950 rounded-lg border border-zinc-800 items-center gap-1.5 ml-0.5">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">SMASH</span>
            <span className="text-[11px] font-black mono text-amber-400 leading-none">
              {stats.averages.smashFactor.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
          {stats.count} SHOTS
        </div>
      </div>

      {/* Primary Row: Carry and Offline */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/50 flex flex-col items-center shadow-inner relative overflow-hidden">
          <div className="absolute top-2 left-3 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">CARRY</div>
          <div className="flex items-baseline gap-1 pt-2">
            <span className="text-4xl font-black mono text-emerald-400 leading-none tracking-tighter">
              {stats.averages.carryDistance.toFixed(0)}
            </span>
            <span className="text-xs font-black text-zinc-700 uppercase">yd</span>
          </div>
        </div>
        
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/50 flex flex-col items-center shadow-inner relative overflow-hidden">
          <div className="absolute top-2 left-3 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">OFFLINE</div>
          <div className="flex items-baseline gap-1 pt-2">
            <span className={`text-4xl font-black mono leading-none tracking-tighter ${stats.averages.offline === 0 ? 'text-zinc-500' : stats.averages.offline > 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              {stats.averages.offline === 0 ? '0' : `${stats.averages.offline > 0 ? 'R' : 'L'}${Math.abs(stats.averages.offline).toFixed(0)}`}
            </span>
            <span className="text-xs font-black text-zinc-700 uppercase">yd</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid: Ball, Club, Launch, Spin */}
      <div className="grid grid-cols-2 gap-2.5">
        {secondaryMetrics.map(m => (
          <div key={m.key} className="bg-zinc-950/50 p-3.5 rounded-2xl border border-zinc-800/50 flex flex-col items-center">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.15em] mb-1">{m.label}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black mono text-zinc-100 leading-none">
                {/* Fix: cast value to number as ShotStats indexing returns number | string | undefined */}
                {(stats.averages[m.key as keyof typeof stats.averages] as number).toFixed(0)}
              </span>
              <span className="text-[8px] font-black text-zinc-700 uppercase">
                {METRIC_UNITS[m.key]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="mt-4 pt-3 border-t border-zinc-800/50 flex justify-between items-center">
        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] group-hover:text-emerald-500 transition-colors">Performance Intel</span>
        <ChevronRight size={18} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
      </div>
    </div>
  );
};

export default ClubSummary;
