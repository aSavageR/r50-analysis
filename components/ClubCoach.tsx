
import React, { useState, useMemo } from 'react';
import { ClubStats } from '../types';
import { analyzeClubTactically } from '../utils/heuristicCoach';
import { Sparkles, BrainCircuit, Loader2, Target } from 'lucide-react';

interface ClubCoachProps {
  stats: ClubStats;
}

const FormattedAnalysis: React.FC<{ text: string }> = ({ text }) => {
  const cleanText = text.replace(/#+/g, '').replace(/\[.*?\]/g, '').trim();
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l !== '');

  return (
    <div className="space-y-3 text-zinc-300">
      {lines.map((line, i) => {
        if (line.startsWith('*') || line.startsWith('-') || line.match(/^\d+\./)) {
          const content = line.replace(/^[*-\d.]+\s*/, '');
          return (
            <div key={i} className="flex gap-2 items-start">
              <div className="mt-1.5 flex-shrink-0">
                <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.6)]" />
              </div>
              <p className="text-[11px] md:text-xs leading-relaxed font-medium">
                {renderLineWithBold(content)}
              </p>
            </div>
          );
        }
        return (
          <p key={i} className="text-[11px] md:text-xs leading-relaxed font-medium">
            {renderLineWithBold(line)}
          </p>
        );
      })}
    </div>
  );
};

const renderLineWithBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-black bg-white/5 px-1 rounded">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const ClubCoach: React.FC<ClubCoachProps> = ({ stats }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = () => {
    setLoading(true);
    setTimeout(() => {
      const result = analyzeClubTactically(stats);
      setAnalysis(result);
      setLoading(false);
    }, 800);
  };

  const sections = useMemo(() => {
    if (!analysis) return [];
    
    const getBlock = (tag: string, nextTag?: string) => {
      const regex = new RegExp(`\\[?${tag}\\]?([\\s\\S]*?)(?=\\[?${nextTag}\\]?|$)`, 'i');
      const match = analysis.match(regex);
      return match ? match[1].trim() : null;
    };

    const s1 = getBlock('GROUPING & DISPERSION', 'VARIANCE DIAGNOSTICS');
    const s2 = getBlock('VARIANCE DIAGNOSTICS');

    return [s1, s2].filter((s): s is string => !!s);
  }, [analysis]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl mx-1">
      {/* Optimized Header for Mobile */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30 gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="bg-blue-500/10 p-1.5 rounded-lg border border-blue-500/20 shrink-0">
            <BrainCircuit size={14} className="text-blue-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-100 truncate">Performance Logic</h3>
            <p className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5 truncate">PGA Benchmarks</p>
          </div>
        </div>
        <button 
          onClick={runAnalysis}
          disabled={loading}
          className="group relative flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 shrink-0"
        >
          {loading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
          <span>{loading ? '...' : 'Insights'}</span>
        </button>
      </div>

      <div className="p-4 md:p-6">
        {!analysis && !loading && (
          <div className="flex flex-col items-center justify-center py-4 text-zinc-600 gap-2 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/10">
            <Target size={16} className="opacity-20" />
            <p className="text-[8px] font-black uppercase tracking-widest text-center px-4">Analyze {stats.club} Patterns</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 size={18} className="animate-spin text-blue-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Syncing Benchmarks...</span>
          </div>
        )}

        {analysis && sections.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.15em] whitespace-nowrap">
                    {idx === 0 ? 'Spatial Patterns' : 'Variance Data'}
                  </h4>
                  <div className="h-px w-full bg-zinc-800/40" />
                </div>
                <div className="bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/40">
                  <FormattedAnalysis text={section} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubCoach;
