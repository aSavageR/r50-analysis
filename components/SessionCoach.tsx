
import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Shot, ClubStats } from '../types';
import { Sparkles, Activity, Loader2, Quote, AlertCircle } from 'lucide-react';

interface SessionCoachProps {
  activeShots: Shot[];
  clubStats: ClubStats[];
}

const FormattedAnalysis: React.FC<{ text: string }> = ({ text }) => {
  // Clean up any remaining markdown artifacts like headers or triple hashes
  const cleanText = text.replace(/#+/g, '').replace(/\[.*?\]/g, '').trim();
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l !== '');

  return (
    <div className="space-y-3 text-zinc-300">
      {lines.map((line, i) => {
        if (line.startsWith('*') || line.startsWith('-') || line.match(/^\d+\./)) {
          const content = line.replace(/^[*-\d.]+\s*/, '');
          return (
            <div key={i} className="flex gap-2.5 items-start">
              <div className="mt-1.5 flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
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
      setError("Session analysis requires at least 5 shots for a credible bag-wide pattern detection.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Safe access to process.env to prevent ReferenceError on mobile
      const env = (window as any).process?.env || (import.meta as any).env || {};
      const apiKey = process.env.API_KEY; 
      
      if (!apiKey) {
        throw new Error("API configuration is missing.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const dataSnapshot = clubStats.map(s => ({
        club: s.club,
        shots: s.count,
        avgCarry: s.averages.carryDistance.toFixed(1),
        avgSpin: s.averages.spinRate.toFixed(0),
        avgLaunch: s.averages.launchAngle.toFixed(1),
        avgOffline: s.averages.offline.toFixed(1)
      }));

      const prompt = `
        You are a PGA Data Analyst. Analyze this session data from a Garmin R50. 
        
        DATA:
        ${JSON.stringify(dataSnapshot, null, 2)}

        Provide report in TWO parts:
        Part 1: [BAG-WIDE DISPERSION] - Cross-club patterns.
        Part 2: [SESSION STRATEGY] - Reliable vs Risky clubs.
        
        RULES:
        - NO markdown headers (no #).
        - Start sections with bracketed tags.
        - Bold key terms with **text**.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAnalysis(response.text || "Analysis unavailable.");
    } catch (err: any) {
      console.error("Session Analysis Failure:", err);
      setError(`Analysis Interrupted: ${err.message || "Unknown Error"}`);
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
      diagnostics: getBlock('BAG-WIDE DISPERSION', 'SESSION STRATEGY') || analysis,
      strategy: getBlock('SESSION STRATEGY')
    };
  }, [analysis]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <Quote size={140} />
      </div>

      <div className="p-8 border-b border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="bg-emerald-500/10 p-4 rounded-[1.5rem] border border-emerald-500/20 shadow-inner">
            <Activity size={32} className="text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Macro AI Agent</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight uppercase">Bag Intelligence</h2>
          </div>
        </div>
        
        <button 
          onClick={runAnalysis}
          disabled={loading}
          className="relative group flex items-center justify-center gap-3 bg-white hover:bg-emerald-50 text-zinc-950 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-2xl"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="text-emerald-600" />}
          <span>{loading ? 'Processing...' : 'Run Session Audit'}</span>
        </button>
      </div>

      <div className="p-10">
        {error && (
          <div className="bg-rose-500/5 border border-rose-500/20 text-rose-400 p-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        {analysis && sections && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="h-px flex-1 bg-zinc-800" /> Dispersion Audit <span className="h-px flex-1 bg-zinc-800" />
              </h3>
              <div className="bg-zinc-950/40 p-8 rounded-[2rem] border border-zinc-800/50 shadow-inner">
                <FormattedAnalysis text={sections.diagnostics} />
              </div>
            </div>
            {sections.strategy && (
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <span className="h-px flex-1 bg-zinc-800" /> Strategy Intel <span className="h-px flex-1 bg-zinc-800" />
                </h3>
                <div className="bg-zinc-950/40 p-8 rounded-[2rem] border border-zinc-800/50 shadow-inner">
                  <FormattedAnalysis text={sections.strategy} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionCoach;
