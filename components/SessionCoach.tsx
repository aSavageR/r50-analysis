
import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Shot, ClubStats } from '../types';
import { Sparkles, Activity, Loader2, Quote } from 'lucide-react';

interface SessionCoachProps {
  activeShots: Shot[];
  clubStats: ClubStats[];
}

const FormattedAnalysis: React.FC<{ text: string }> = ({ text }) => {
  // Sanitize text: Remove markdown headers (###), leading/trailing whitespace, and multiple newlines
  const cleanText = text.replace(/#+/g, '').trim();
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l !== '');

  return (
    <div className="space-y-3 text-zinc-300">
      {lines.map((line, i) => {
        // Handle Bullet Points
        if (line.startsWith('*') || line.startsWith('-') || line.match(/^\d+\./)) {
          const content = line.replace(/^[*-\d.]+\s*/, '');
          return (
            <div key={i} className="flex gap-2.5 items-start group">
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
        You are a PGA Data Analyst and Bag Management Expert.
        Analyze this session-wide data snapshot from a Garmin R50. 
        
        DATA SNAPSHOT:
        ${JSON.stringify(dataSnapshot, null, 2)}

        TASK:
        Provide a high-level Bag Intelligence report with TWO sections.
        Section 1: [BAG-WIDE DISPERSION] - General dispersion patterns across the set.
        Section 2: [SESSION STRATEGY] - Reliable vs Risky clubs.
        
        CRITICAL FORMATTING RULES:
        1. DO NOT use markdown headers like # or ##.
        2. Use the bracketed tags exactly to separate sections.
        3. Use bolding with **text** for key findings.
        4. Use standard bullet points.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAnalysis(response.text || "Analysis unavailable.");
    } catch (err) {
      console.error(err);
      setError("The Bag Analyst connection was interrupted.");
    } finally {
      setLoading(false);
    }
  };

  const sections = useMemo(() => {
    if (!analysis) return null;
    const diagnosticsMatch = analysis.match(/\[?BAG-WIDE DISPERSION\]?([\s\S]*?)(?=\[?SESSION STRATEGY\]?|$)/i);
    const hypothesisMatch = analysis.match(/\[?SESSION STRATEGY\]?([\s\S]*)/i);
    return {
      diagnostics: diagnosticsMatch ? diagnosticsMatch[1].trim() : analysis,
      strategy: hypothesisMatch ? hypothesisMatch[1].trim() : null
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
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Cross-Club Performance Audit</p>
          </div>
        </div>
        
        <button 
          onClick={runAnalysis}
          disabled={loading}
          className="relative group flex items-center justify-center gap-3 bg-white hover:bg-emerald-50 text-zinc-950 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-2xl overflow-hidden"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="text-emerald-600" />}
          <span className="relative">{loading ? 'Processing Data...' : 'Generate Session Audit'}</span>
        </button>
      </div>

      <div className="p-10">
        {error && (
          <div className="bg-rose-500/5 border border-rose-500/20 text-rose-400 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
            {error}
          </div>
        )}
        
        {!analysis && !loading && (
          <div className="py-12 flex flex-col items-center justify-center opacity-40">
            <div className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center mb-4">
               <Activity size={20} className="text-zinc-600" />
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Ready for Strategic Deployment</p>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-4 w-32 bg-zinc-800 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-2 w-full bg-zinc-800 rounded-full animate-pulse" />
                <div className="h-2 w-5/6 bg-zinc-800 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 w-32 bg-zinc-800 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-2 w-full bg-zinc-800 rounded-full animate-pulse" />
                <div className="h-2 w-5/6 bg-zinc-800 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {analysis && sections && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-800" />
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                  Bag Dispersion
                </h3>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
              <div className="bg-zinc-950/40 p-8 rounded-[2rem] border border-zinc-800/50 shadow-inner">
                <FormattedAnalysis text={sections.diagnostics} />
              </div>
            </div>
            {sections.strategy && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-zinc-800" />
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                    Strategy Intel
                  </h3>
                  <div className="h-px flex-1 bg-zinc-800" />
                </div>
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
