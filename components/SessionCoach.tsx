
import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Shot, ClubStats } from '../types';
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
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (activeShots.length < 5) {
      setError("Strategic analysis requires at least 5 shots for a credible pattern detection.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the environment variable directly as required.
      // In many web environments, this literal string is replaced during the build/deploy step.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const dataSnapshot = clubStats.map(s => ({
        club: s.club,
        shots: s.count,
        avgCarry: s.averages.carryDistance.toFixed(1),
        avgSpin: s.averages.spinRate.toFixed(0),
        avgLaunch: s.averages.launchAngle.toFixed(1),
        avgOffline: s.averages.offline.toFixed(1)
      }));

      const prompt = `
        You are a PGA Data Analyst and Bag Strategy Consultant.
        Analyze this session-wide data snapshot from a Garmin R50. 
        
        DATA:
        ${JSON.stringify(dataSnapshot, null, 2)}

        Provide a strategic "Strategy Lab" report in TWO parts:
        Part 1: [BAG-WIDE DISPERSION] - Macro patterns and gapping issues.
        Part 2: [STRATEGIC RECOMMENDATIONS] - Safest vs Riskiest clubs and one tactical focus.
        
        RULES: No # headers, use bracketed tags, bold key technical terms with **text**.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAnalysis(response.text || "Strategic intel unavailable.");
    } catch (err: any) {
      console.error("Strategy Analysis Failure:", err);
      setError(err.message || "An unexpected error occurred during intelligence deployment.");
    } finally {
      setLoading(false);
    }
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
      {/* Sidebar - Data Context */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <Target size={20} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-100">Session Context</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Input for Strategy Engine</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Selected Shots</span>
              <span className="text-lg font-black mono text-emerald-400">{activeShots.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Clubs</span>
              <span className="text-lg font-black mono text-blue-400">{clubStats.length}</span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-800 flex items-start gap-3">
             <div className="bg-zinc-800 p-2 rounded-lg">
               <Info size={14} className="text-zinc-500" />
             </div>
             <p className="text-[10px] font-medium leading-relaxed text-zinc-500 italic">
               The Strategy Lab analyzes cross-club correlations and dispersion patterns to provide macro-level technical guidance.
             </p>
          </div>
        </div>
      </div>

      {/* Main Panel - Analysis Results */}
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
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">Strategic Deployment</span>
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
              <span>{loading ? 'Processing...' : 'Deploy Intelligence'}</span>
            </button>
          </div>

          <div className="p-10 flex-1">
            {error && (
              <div className="bg-rose-500/5 border border-rose-500/20 text-rose-400 p-8 rounded-3xl text-sm font-bold flex items-center gap-4 mb-8">
                <AlertCircle size={24} />
                <p className="leading-relaxed opacity-80">{error}</p>
              </div>
            )}
            
            {!analysis && !loading && !error && (
              <div className="h-full flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mb-6">
                   <Activity size={32} className="text-zinc-800" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-zinc-600">Analysis Engine Standby</h3>
                <p className="text-sm text-zinc-500 mt-2 font-medium">Click "Deploy Intelligence" to begin the macro bag audit.</p>
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-8">
                <div className="space-y-6">
                  <div className="h-4 w-48 bg-zinc-800 rounded-full animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-zinc-800/50 rounded-full animate-pulse" />
                    <div className="h-3 w-11/12 bg-zinc-800/50 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-4 w-48 bg-zinc-800 rounded-full animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-zinc-800/50 rounded-full animate-pulse" />
                  </div>
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
                      Strategy Intel
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
