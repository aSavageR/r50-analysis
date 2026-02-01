
import React, { useState, useMemo } from 'react';
import { Shot } from '../types';
import { CLUB_COLORS, DEFAULT_COLOR } from '../constants';
import { ChevronUp, ChevronDown, ListFilter } from 'lucide-react';

interface ShotTableProps {
  shots: Shot[];
}

type SortKey = 'timestamp' | 'club' | 'carryDistance' | 'ballSpeed' | 'spinRate' | 'sideSpin' | 'offline';

const ShotTable: React.FC<ShotTableProps> = ({ shots }) => {
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedShots = useMemo(() => {
    return [...shots].sort((a, b) => {
      const aVal = a[sortKey as keyof Shot];
      const bVal = b[sortKey as keyof Shot];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      const aNum = Number(aVal) || 0;
      const bNum = Number(bVal) || 0;
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
    });
  }, [shots, sortKey, sortOrder]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <div className="w-4" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} className="text-emerald-500" /> : <ChevronDown size={14} className="text-emerald-500" />;
  };

  if (shots.length === 0) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <ListFilter size={16} className="text-emerald-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Shot Log</h3>
        </div>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{shots.length} Shots Total</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-950/50 text-zinc-500 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-800">
              <th className="px-4 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('club')}>
                <div className="flex items-center gap-1">Club <SortIcon column="club" /></div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-white transition-colors text-right" onClick={() => toggleSort('carryDistance')}>
                <div className="flex items-center justify-end gap-1">Carry <SortIcon column="carryDistance" /></div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-white transition-colors text-right" onClick={() => toggleSort('ballSpeed')}>
                <div className="flex items-center justify-end gap-1">Speed <SortIcon column="ballSpeed" /></div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-white transition-colors text-right" onClick={() => toggleSort('spinRate')}>
                <div className="flex items-center justify-end gap-1">Spin <SortIcon column="spinRate" /></div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-white transition-colors text-right" onClick={() => toggleSort('offline')}>
                <div className="flex items-center justify-end gap-1">Offline <SortIcon column="offline" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {sortedShots.map((shot) => (
              <tr key={shot.id} className="hover:bg-zinc-800/40 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-1.5 h-6 rounded-full" 
                      style={{ backgroundColor: CLUB_COLORS[shot.club] || DEFAULT_COLOR }} 
                    />
                    <span className="font-bold text-zinc-100">{shot.club}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="mono font-bold text-emerald-400 text-sm">{shot.carryDistance.toFixed(1)}</span>
                  <span className="text-[9px] text-zinc-600 ml-1 font-bold">Y</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="mono font-medium text-zinc-300 text-sm">{shot.ballSpeed.toFixed(1)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="mono font-medium text-zinc-400 text-sm">{Math.round(shot.spinRate)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`mono text-xs font-bold ${shot.offline > 0 ? 'text-blue-400' : shot.offline < 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                    {shot.offline === 0 ? '0.0' : `${shot.offline > 0 ? 'R' : 'L'} ${Math.abs(shot.offline).toFixed(1)}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShotTable;
