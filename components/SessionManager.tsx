
import React from 'react';
import { Shot } from '../types';
import { Calendar, CheckSquare, Square } from 'lucide-react';

interface Session {
  id: string;
  date: string;
  count: number;
}

interface SessionManagerProps {
  shots: Shot[];
  selectedSessionIds: Set<string>;
  onToggleSession: (sessionId: string) => void;
  onToggleAll: () => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ 
  shots, 
  selectedSessionIds, 
  onToggleSession,
  onToggleAll
}) => {
  const sessions = React.useMemo(() => {
    const grouped = shots.reduce((acc, shot) => {
      if (!acc[shot.sessionId]) {
        acc[shot.sessionId] = { 
          id: shot.sessionId, 
          date: new Date(shot.timestamp).toLocaleString(), 
          count: 0 
        };
      }
      acc[shot.sessionId].count++;
      return acc;
    }, {} as Record<string, Session>);
    
    // Explicitly cast Object.values result to Session[] to fix the 'unknown' type error in the sort callback
    return (Object.values(grouped) as Session[]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [shots]);

  if (sessions.length === 0) return null;

  const allSelected = selectedSessionIds.size === sessions.length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-zinc-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Data Sessions</h3>
        </div>
        <button 
          onClick={onToggleAll}
          className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
        >
          {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-zinc-900 text-zinc-500 font-bold uppercase tracking-tighter border-b border-zinc-800">
            <tr>
              <th className="px-4 py-2 w-10"></th>
              <th className="px-2 py-2">Session Date</th>
              <th className="px-4 py-2 text-right">Shots</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {sessions.map((session) => {
              const isSelected = selectedSessionIds.has(session.id);
              return (
                <tr 
                  key={session.id} 
                  className={`hover:bg-zinc-800/30 transition-colors cursor-pointer ${isSelected ? 'bg-emerald-500/5' : ''}`}
                  onClick={() => onToggleSession(session.id)}
                >
                  <td className="px-4 py-3">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-600 border-emerald-500' : 'border-zinc-700'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </td>
                  <td className={`px-2 py-3 font-medium ${isSelected ? 'text-zinc-100' : 'text-zinc-500'}`}>
                    {session.date}
                  </td>
                  <td className={`px-4 py-3 text-right mono ${isSelected ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {session.count}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionManager;
