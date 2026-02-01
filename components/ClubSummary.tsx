
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
      className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-5 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all shadow-xl group cursor-pointer active:scale-[0.98] overflow-hidden"
    >
      {/* Header Row: Club Name + Smash + Shot Count */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.2)]" style={{ backgroundColor: stats.color }} />
            <h3 className="text-4xl font-black tracking-tighter uppercase text-white leading-none">{stats.club}</h3>
          </div>
          <div className="inline-flex px-2 py-0.5 bg-zinc-950 rounded-lg border border-zinc-800 self-start mt-1">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter mr-2">SMASH</span>
            <span className="text-sm font-black mono text-amber-400">{stats.averages.smashFactor.toFixed(2)}</span>
          </div>
        </div>
        <div className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em] bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
          {stats.count} SHOTS
        </div>
      </div>

      {/* Primary Row: Carry and Offline (Massive) */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800/50 flex flex-col items-center shadow-inner relative overflow-hidden">
          <div className="absolute top-3 left-4 text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em]">CARRY</div>
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-7xl font-black mono text-emerald-400 leading-none tracking-tighter">
              {stats.averages.carryDistance.toFixed(0)}
            </span>
            <span className="text-lg font-black text-zinc-700 uppercase">yd</span>
          </div>
        </div>
        
        <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800/50 flex flex-col items-center shadow-inner relative overflow-hidden">
          <div className="absolute top-3 left-4 text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em]">OFFLINE</div>
          <div className="flex items-baseline gap-2 pt-2">
            <span className={`text-7xl font-black mono leading-none tracking-tighter ${stats.averages.offline === 0 ? 'text-zinc-500' : stats.averages.offline > 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              {stats.averages.offline === 0 ? '0' : `${stats.averages.offline > 0 ? 'R' : 'L'}${Math.abs(stats.averages.offline).toFixed(0)}`}
            </span>
            <span className="text-lg font-black text-zinc-700 uppercase">yd</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid: Ball, Club, Launch, Spin */}
      <div className="grid grid-cols-2 gap-3">
        {secondaryMetrics.map(m => (
          <div key={m.key} className="bg-zinc-950/50 p-4 rounded-[1.5rem] border border-zinc-800/50 flex flex-col items-center">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1.5">{m.label}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black mono text-zinc-100 leading-none">
                {stats.averages[m.key as keyof typeof stats.averages].toFixed(0)}
              </span>
              <span className="text-[10px] font-black text-zinc-700 uppercase">
                {METRIC_UNITS[m.key]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="mt-6 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
        <span className="text-xs font-black text-zinc-700 uppercase tracking-[0.5em] group-hover:text-emerald-500 transition-colors">Performance Intel</span>
        <ChevronRight size={24} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
      </div>
    </div>
  );
};

export default ClubSummary;
