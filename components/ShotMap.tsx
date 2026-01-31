
import React, { useMemo, useState, useEffect } from 'react';
import { Shot } from '../types';
import { CLUB_COLORS, DEFAULT_COLOR } from '../constants';
import { Maximize2, X, Target } from 'lucide-react';

interface ShotMapProps {
  shots: Shot[];
}

const ShotMap: React.FC<ShotMapProps> = ({ shots }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeShot, setActiveShot] = useState<Shot | null>(null);
  const [hoverShot, setHoverShot] = useState<Shot | null>(null);
  
  const padding = 35;
  const width = 400;
  const height = 400;

  const { maxCarry, maxOffline } = useMemo(() => {
    if (shots.length === 0) return { maxCarry: 300, maxOffline: 50 };
    const actualMaxCarry = Math.max(...shots.map(s => s.carryDistance), 150);
    const actualMaxOffline = Math.max(...shots.map(s => Math.abs(s.offline)), 30);
    return {
      maxCarry: actualMaxCarry * 1.15,
      maxOffline: actualMaxOffline * 1.3
    };
  }, [shots]);

  const scaleY = (carry: number) => (height - padding) - (carry / maxCarry) * (height - 2 * padding);
  const scaleX = (offline: number) => width / 2 + (offline / maxOffline) * (width / 2 - padding);

  const distances = [50, 100, 150, 200, 250, 300, 350, 400].filter(d => d < maxCarry);
  
  const lateralMarkers = useMemo(() => {
    const markers = [];
    const step = maxOffline > 60 ? 20 : 10;
    for (let i = step; i < maxOffline; i += step) {
      markers.push(i);
      markers.push(-i);
    }
    return markers;
  }, [maxOffline]);

  const handleShotInteraction = (e: React.MouseEvent | React.TouchEvent, shot: Shot) => {
    e.stopPropagation();
    setActiveShot(prev => prev?.id === shot.id ? null : shot);
  };

  useEffect(() => {
    const handleGlobalClick = () => setActiveShot(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const displayedShot = hoverShot || activeShot;

  const renderTooltip = (shot: Shot) => {
    const top = (scaleY(shot.carryDistance) / height) * 100;
    const left = (scaleX(shot.offline) / width) * 100;

    return (
      <div 
        className="absolute z-50 pointer-events-none transition-all duration-200 ease-out"
        style={{ 
          top: `${top}%`, 
          left: `${left}%`,
          transform: 'translate(-50%, -125%)'
        }}
      >
        <div className="bg-zinc-950/95 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-2xl flex flex-col gap-1 min-w-[120px] animate-in zoom-in-95 fade-in duration-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CLUB_COLORS[shot.club] || DEFAULT_COLOR }} />
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">{shot.club}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Carry</p>
              <p className="text-xs font-black mono text-emerald-400">{shot.carryDistance.toFixed(1)}y</p>
            </div>
            <div>
              <p className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Offline</p>
              <p className="text-xs font-black mono text-white">
                {shot.offline === 0 ? '0' : `${shot.offline > 0 ? 'R' : 'L'} ${Math.abs(shot.offline).toFixed(0)}`}y
              </p>
            </div>
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-950/95 border-r border-b border-white/10 rotate-45"></div>
        </div>
      </div>
    );
  };

  const renderMapContent = (isLarge: boolean = false) => (
    <div className={`relative w-full h-full flex items-center justify-center ${isLarge ? 'p-0' : ''}`}>
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className={`w-full h-full transition-all duration-300 ${isLarge ? 'max-w-none max-h-none' : 'max-h-full max-w-full'}`}
        preserveAspectRatio="xMidYMin meet"
        onClick={() => setActiveShot(null)}
      >
        <defs>
          <radialGradient id="turfGradient" cx="50%" cy="100%" r="100%" fx="50%" fy="100%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#022c22" />
          </radialGradient>
          <linearGradient id="fairwayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <rect width={width} height={height} fill="url(#turfGradient)" rx={isLarge ? 0 : 12} />
        
        <path 
          d={`M ${width * 0.2} ${height} Q ${width * 0.3} ${height * 0.5} ${width * 0.4} ${padding} L ${width * 0.6} ${padding} Q ${width * 0.7} ${height * 0.5} ${width * 0.8} ${height} Z`} 
          fill="url(#fairwayGradient)" 
        />

        {lateralMarkers.map(val => (
          <g key={val}>
            <line x1={scaleX(val)} y1={height - padding} x2={scaleX(val)} y2={padding} stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.15" />
            <text x={scaleX(val)} y={height - padding + 10} fill="#10b981" fontSize="6" fontWeight="bold" textAnchor="middle" opacity="0.3" className="mono">{Math.abs(val)}{val > 0 ? 'R' : 'L'}</text>
          </g>
        ))}

        <line x1={width / 2} y1={height - padding} x2={width / 2} y2={padding} stroke="#10b981" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
        
        {distances.map(d => (
          <g key={d}>
            <path d={`M ${padding} ${scaleY(d)} Q ${width / 2} ${scaleY(d) - 6} ${width - padding} ${scaleY(d)}`} fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.3" />
            <text x={width / 2} y={scaleY(d) - 4} fill="#10b981" fontSize="6" fontWeight="bold" textAnchor="middle" className="mono" opacity="0.5">{d}Y</text>
          </g>
        ))}

        {shots.map((shot) => {
          const cx = scaleX(shot.offline);
          const cy = scaleY(shot.carryDistance);
          const color = CLUB_COLORS[shot.club] || DEFAULT_COLOR;
          const isActive = activeShot?.id === shot.id;
          const isHovered = hoverShot?.id === shot.id;
          
          return (
            <g 
              key={shot.id} 
              onMouseEnter={() => setHoverShot(shot)}
              onMouseLeave={() => setHoverShot(null)}
              onClick={(e) => handleShotInteraction(e, shot)} 
              className="cursor-pointer group"
            >
              <circle cx={cx} cy={cy} r={8} fill="transparent" />
              <circle cx={cx} cy={cy + 0.5} r={isActive || isHovered ? 6 : 3} fill="black" opacity="0.3" />
              <circle
                cx={cx}
                cy={cy}
                r={isActive || isHovered ? 5 : 2.5}
                fill={color}
                stroke="white"
                strokeWidth={isActive || isHovered ? 1.5 : 0.4}
                className="transition-all duration-200"
              />
            </g>
          );
        })}
      </svg>
      {displayedShot && renderTooltip(displayedShot)}
    </div>
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 relative flex flex-col group shadow-2xl overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-emerald-500" />
          <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">Shot Cluster</h3>
        </div>
        <button onClick={() => setIsExpanded(true)} className="p-2 bg-zinc-950 rounded-xl hover:bg-zinc-800 text-zinc-500 transition-colors">
          <Maximize2 size={14} />
        </button>
      </div>
      
      <div className="relative bg-emerald-950 rounded-2xl overflow-hidden border border-zinc-950 shadow-inner h-[300px]">
        {renderMapContent()}
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/98 backdrop-blur-2xl flex items-center justify-center p-0 animate-in fade-in duration-300 overflow-hidden">
          <div className="relative w-full h-full flex flex-col">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-6 z-[110] flex justify-between items-start pointer-events-none">
              <div className="pointer-events-auto bg-zinc-950/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5">
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Range Intelligence</h2>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Full Visual Cluster Audit</p>
              </div>
              <button 
                onClick={() => setIsExpanded(false)} 
                className="pointer-events-auto p-4 bg-zinc-900 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-2xl active:scale-95"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main Visual Container */}
            <div className="flex-1 w-full h-full bg-emerald-950 relative overflow-hidden">
              {renderMapContent(true)}
              
              {/* Legend Overlay */}
              <div className="absolute bottom-6 inset-x-6 flex flex-wrap gap-2 justify-center z-[110] pointer-events-none">
                {(Array.from(new Set(shots.map(s => s.club))) as string[]).map(club => (
                  <div key={club} className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/80 backdrop-blur-md rounded-full border border-white/5 shadow-xl">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CLUB_COLORS[club] || DEFAULT_COLOR }} />
                    <span className="text-[10px] text-white font-black uppercase tracking-tighter">{club}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShotMap;
