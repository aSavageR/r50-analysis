
import React from 'react';
import { ClubStats } from '../types';
import { METRIC_LABELS, METRIC_UNITS } from '../constants';
import { ChevronRight } from 'lucide-react';

interface ClubSummaryProps {
  stats: ClubStats;
  onDrilldown?: (club: string) => void;
}

const ClubSummary: React.FC<ClubSummaryProps> = ({ stats, onDrilldown }) => {
  const primaryMetrics = ['carryDistance', 'totalDistance'];
  const secondaryMetrics = ['ballSpeed', 'clubSpeed', 'launchAngle', 'spinRate'];

  return (
    <div 
      onClick={() => onDrilldown?.(stats.club)}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all shadow-xl group cursor-pointer active:scale-[0.98]"
    >
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: stats.color }} />
          <h3 className="text-xl font-black tracking-tighter uppercase">{stats.club}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
            {stats.count} SHOTS
          </div>
          <div className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={18} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {primaryMetrics.map(m => (
          <div key={m} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/50 flex flex-col items-center">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{METRIC_LABELS[m]}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black mono text-emerald-400">{stats.averages[m as keyof typeof stats.averages].toFixed(1)}</span>
              <span className="text-[10px] font-black text-zinc-700 uppercase">{METRIC_UNITS[m]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2.5">
        {secondaryMetrics.map(m => (
          <div key={m} className="flex justify-between items-center px-1">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight truncate">{METRIC_LABELS[m]}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-[12px] mono font-black text-zinc-200">
                {stats.averages[m as keyof typeof stats.averages].toFixed(m === 'spinRate' ? 0 : 1)}
              </span>
              <span className="text-[8px] font-black text-zinc-700 uppercase">{METRIC_UNITS[m]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-zinc-800/50 text-center">
        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] group-hover:text-emerald-500 transition-colors">Tap for deep analysis</span>
      </div>
    </div>
  );
};

export default ClubSummary;
