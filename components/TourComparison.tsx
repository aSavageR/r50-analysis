
import React from 'react';
import { ClubStats } from '../types';
import { getBenchmarkForClub, ProRange } from '../utils/heuristicCoach';
import { METRIC_LABELS, METRIC_UNITS } from '../constants';
import { Award } from 'lucide-react';

interface TourComparisonProps {
  stats: ClubStats;
}

const BenchmarkGauge: React.FC<{ 
  label: string; 
  unit: string; 
  userVal: number; 
  range: ProRange;
  isLargeValue?: boolean;
}> = ({ label, unit, userVal, range, isLargeValue }) => {
  // We want to show a scale where the pro range is nicely centered.
  // Calculate a reasonable min/max for the entire bar.
  const padding = (range.max - range.min) * 1.5 || 2.0; // Fallback padding for tight ranges
  const barMin = Math.min(range.min - padding, userVal - padding);
  const barMax = Math.max(range.max + padding, userVal + padding);
  const rangeWidth = barMax - barMin;

  const getPercent = (val: number) => ((val - barMin) / (rangeWidth || 1)) * 100;
  
  const userPos = Math.max(0, Math.min(100, getPercent(userVal)));
  const proStart = getPercent(range.min);
  const proEnd = getPercent(range.max);
  const proWidth = proEnd - proStart;

  const inZone = userVal >= range.min && userVal <= range.max;
  const above = userVal > range.max;

  const formatDisplay = (val: number) => {
    if (isLargeValue) return Math.round(val).toString();
    // Use 2 decimal points for high-precision metrics
    return val.toFixed(2);
  };

  return (
    <div className="bg-zinc-950/40 border border-zinc-800/60 p-4 rounded-2xl flex flex-col gap-3 group/gauge">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-black mono transition-colors duration-500 ${inZone ? 'text-amber-400' : 'text-zinc-100'}`}>
              {formatDisplay(userVal)}
            </span>
            <span className="text-[8px] font-black text-zinc-600 uppercase">{unit}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[7px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">Tour Zone</p>
          <p className="text-[10px] font-black text-zinc-400 mono">
            {formatDisplay(range.min)}-{formatDisplay(range.max)}
          </p>
        </div>
      </div>

      <div className="relative h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
        {/* Pro Zone Highlight */}
        <div 
          className="absolute h-full bg-amber-500/20 border-x border-amber-500/30"
          style={{ left: `${proStart}%`, width: `${proWidth}%` }}
        />
        
        {/* User Marker */}
        <div 
          className={`absolute top-0 w-1 h-full shadow-[0_0_10px_rgba(255,255,255,0.5)] z-10 transition-all duration-1000 ease-out ${inZone ? 'bg-amber-400' : 'bg-white'}`}
          style={{ left: `${userPos}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      
      <div className="flex justify-between items-center mt-1">
        <span className={`text-[7px] font-black uppercase tracking-widest ${!inZone && !above ? 'text-rose-500' : 'text-zinc-800'}`}>Below</span>
        <span className={`text-[8px] font-black uppercase tracking-widest ${inZone ? 'text-amber-400' : 'text-zinc-800'}`}>Target</span>
        <span className={`text-[7px] font-black uppercase tracking-widest ${above ? 'text-emerald-500' : 'text-zinc-800'}`}>Above</span>
      </div>
    </div>
  );
};

const TourComparison: React.FC<TourComparisonProps> = ({ stats }) => {
  const benchmark = getBenchmarkForClub(stats.club);

  if (!benchmark) return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center mx-1">
      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Benchmarks not available for this profile</p>
    </div>
  );

  const items = [
    { label: 'Carry', unit: 'yd', user: stats.averages.carryDistance, range: benchmark.carry, large: true },
    { label: 'Ball Speed', unit: 'mph', user: stats.averages.ballSpeed, range: benchmark.ballSpeed, large: true },
    { label: 'Club Speed', unit: 'mph', user: stats.averages.clubSpeed, range: benchmark.clubSpeed, large: true },
    { label: 'Smash', unit: 'x', user: stats.averages.smashFactor, range: benchmark.smash, large: false },
    { label: 'Launch', unit: '°', user: stats.averages.launchAngle, range: benchmark.launch, large: false },
    { label: 'Spin', unit: 'rpm', user: stats.averages.spinRate, range: benchmark.spin, large: true },
    { label: 'Apex', unit: 'ft', user: stats.averages.apex, range: benchmark.apex, large: true },
    { label: 'AoA', unit: '°', user: stats.averages.angleAttack, range: benchmark.aoa, large: false },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl mx-1">
      <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-950/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 shadow-inner">
            <Award size={18} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Tour Pro Comparison</h3>
            <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">PGA Mean Performance Bands</p>
          </div>
        </div>
      </div>
      
      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map(item => (
          <BenchmarkGauge 
            key={item.label}
            label={item.label}
            unit={item.unit}
            userVal={item.user}
            range={item.range}
            isLargeValue={item.large}
          />
        ))}
      </div>
    </div>
  );
};

export default TourComparison;
