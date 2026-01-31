
import React, { useState, useMemo } from 'react';
import { Shot, ClubStats } from '../types';
import { analyzeSessionStrategically } from '../utils/heuristicCoach';
import { Sparkles, Activity, Loader2, Quote, AlertCircle, Target, TrendingUp, Info, BrainCircuit } from 'lucide-react';

interface SessionCoachProps {
  activeShots: Shot[];
  clubStats: ClubStats[];
}

const FormattedAnalysis: React.FC<{ text: string }> = ({ text }) => {
  const cleanText = text.replace(/#+/g, '').replace(/\[.*?\]/g, '').trim();
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l !== '');

  return (
    <div className="space-y-4 text-zinc-300">
      {lines.map((line, i) => {
        if (line.startsWith('*') || line.startsWith('-') || line.match(/^\d+\./)) {
          const content = line.replace(/^[*-\d.]+\s*/, '');
          return (
            <div key={i} className="flex gap-3 items-start group">
              <div className="mt-1.5 flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform" />
              </div>
              <p className="text-sm leading-relaxed font-medium">
                {renderLineWithBold(content)}
              </p>
            </div>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed font-medium">
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
      return <strong key={i} className="text-white font-black">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const SessionCoach: React.FC<SessionCoachProps> = ({ activeShots, clubStats }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = () => {
    setLoading(true);
    // Simulate a brief "calculation" delay for UX
    setTimeout(() => {
      const result = analyzeSessionStrategically(clubStats);
      setAnalysis(result);
      setLoading(false);
    }, 600);
  };

  const sections = useMemo(() => {
    if (!analysis) return null;
    const getBlock = (tag: string, nextTag?: string) => {
      const regex = new RegExp(`\\[?${tag}\\]?([\\s\\S]*?)(?=\\[?${nextTag}\\]?|$)`, 'i');
      const match = analysis.match(regex);
      return match ? match[1].trim() : null;
    };

    return {
      diagnostics: getBlock('BAG-WIDE DISPERSION', 'STRATEGIC RECOMMENDATIONS') || analysis,
      strategy: getBlock('STRATEGIC RECOMMENDATIONS')
    };
  }, [analysis]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <Target size={20} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-100">Analytics Engine</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Rule-Based Diagnostic</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Shots</span>
              <span className="text-lg font-black mono text-emerald-400">{activeShots.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Clubs Tested</span>
              <span className="text-lg font-black mono text-blue-400">{clubStats.length}</span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-800 flex items-start gap-3">
             <div className="bg-zinc-800 p-2 rounded-lg text-zinc-500">
               <Info size={14} />
             </div>
             <p className="text-[10px] font-medium leading-relaxed text-zinc-500 italic">
               This diagnostic identifies gapping overlaps and macros patterns using local physics-based rules. No external API required.
             </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative min-h-[600px] flex flex-col">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <Quote size={180} />
          </div>

          <div className="p-10 border-b border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-start gap-6">
              <div className="bg-emerald-500/10 p-5 rounded-[1.75rem] border border-emerald-500/20 shadow-inner">
                <BrainCircuit size={40} className="text-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">Session Strategy</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight uppercase">Strategy Lab</h2>
              </div>
            </div>
            
            <button 
              onClick={runAnalysis}
              disabled={loading}
              className="relative group flex items-center justify-center gap-4 bg-white hover:bg-emerald-50 text-zinc-950 px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all active:scale-95 disabled:opacity-50 shadow-2xl"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} className="text-emerald-600" />}
              <span>{loading ? 'Processing...' : 'Run Analysis'}</span>
            </button>
          </div>

          <div className="p-10 flex-1">
            {!analysis && !loading && (
              <div className="h-full flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mb-6">
                   <Activity size={32} className="text-zinc-800" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-zinc-600">Engine Ready</h3>
                <p className="text-sm text-zinc-500 mt-2 font-medium">Click "Run Analysis" to perform a local diagnostic of your session.</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-emerald-500" size={40} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Calculating Bag Dynamics...</span>
                </div>
              </div>
            )}

            {analysis && sections && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] whitespace-nowrap">
                      Dispersion Audit
                    </h3>
                    <div className="h-px w-full bg-gradient-to-r from-emerald-500/20 to-transparent" />
                  </div>
                  <div className="bg-zinc-950/40 p-8 rounded-[2.5rem] border border-zinc-800/50 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20" />
                    <FormattedAnalysis text={sections.diagnostics} />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] whitespace-nowrap">
                      Strategic Intel
                    </h3>
                    <div className="h-px w-full bg-gradient-to-r from-blue-500/20 to-transparent" />
                  </div>
                  <div className="bg-zinc-950/40 p-8 rounded-[2.5rem] border border-zinc-800/50 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20" />
                    {sections.strategy && <FormattedAnalysis text={sections.strategy} />}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionCoach;
