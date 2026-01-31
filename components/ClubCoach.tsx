
import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ClubStats } from '../types';
import { Sparkles, BrainCircuit, Loader2, Target } from 'lucide-react';

interface ClubCoachProps {
  stats: ClubStats;
}

const FormattedAnalysis: React.FC<{ text: string }> = ({ text }) => {
  // Strips all markdown hash symbols and trims empty lines
  const cleanText = text.replace(/#+/g, '').trim();
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l !== '');

  return (
    <div className="space-y-3.5 text-zinc-300">
      {lines.map((line, i) => {
        // Handle Bullet Points
        if (line.startsWith('*') || line.startsWith('-') || line.match(/^\d+\./)) {
          const content = line.replace(/^[*-\d.]+\s*/, '');
          return (
            <div key={i} className="flex gap-2.5 items-start">
              <div className="mt-1.5 flex-shrink-0">
                <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
              </div>
              <p className="text-[13px] leading-relaxed font-medium">
                {renderLineWithBold(content)}
              </p>
            </div>
          );
        }

        return (
          <p key={i} className="text-[13px] leading-relaxed font-medium">
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

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const clubData = {
        club: stats.club,
        avgCarry: stats.averages.carryDistance.toFixed(1),
        avgSpin: stats.averages.spinRate.toFixed(0),
        avgLaunch: stats.averages.launchAngle.toFixed(1),
        avgSideSpin: stats.averages.sideSpin.toFixed(0),
        avgOffline: stats.averages.offline.toFixed(1),
        consistency: (100 - (stats.highs.carryDistance - stats.lows.carryDistance) / stats.averages.carryDistance * 100).toFixed(0)
      };

      const prompt = `
        You are a World-Class Swing Coach. Analyze ${stats.club} performance.
        
        DATA:
        ${JSON.stringify(clubData, null, 2)}

        TASK:
        Provide analysis in TWO parts using EXACTLY these tags to start each section:
        Part 1: [LAUNCH OPTIMIZATION] - Spin/Launch window efficiency.
        Part 2: [MECHANICAL FIX] - Face/Path faults and a single "feel" or drill.
        
        CRITICAL FORMATTING RULES:
        - NEVER use hash symbols (#) or markdown headers.
        - Start sections with the bracketed tag ONLY.
        - Use bolding with **text** for technical terms.
        - Be highly concise.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAnalysis(response.text || "Tactical intel unavailable.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sections = useMemo(() => {
    if (!analysis) return [];
    // Enhanced split that is case-insensitive and handles potential text before the first tag
    const parts = analysis.split(/\[(?:LAUNCH OPTIMIZATION|MECHANICAL FIX)\]/i).filter(s => s.trim());
    return parts;
  }, [analysis]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
            <BrainCircuit size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-100">Tactical Consultant</h3>
            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Club-Specific AI Coach</p>
          </div>
        </div>
        <button 
          onClick={runAnalysis}
          disabled={loading}
          className="group relative flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-900/20"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          <span>{loading ? 'Consulting...' : 'Get Tactical Intel'}</span>
        </button>
      </div>

      <div className="p-8">
        {!analysis && !loading && (
          <div className="flex flex-col items-center justify-center py-6 text-zinc-600 gap-3 border border-dashed border-zinc-800 rounded-2xl">
            <Target size={24} className="opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest text-center px-6">
              Ready to break down your {stats.club} mechanics.
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-4 py-2">
            <div className="h-2.5 bg-zinc-800 rounded-full w-full animate-pulse" />
            <div className="h-2.5 bg-zinc-800 rounded-full w-11/12 animate-pulse" />
          </div>
        )}

        {analysis && sections.length > 0 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] whitespace-nowrap">
                    {idx === 0 ? 'Performance Analysis' : 'Correction Plan'}
                  </h4>
                  <div className="h-px w-full bg-zinc-800/50" />
                </div>
                <div className="bg-zinc-950/30 p-6 rounded-2xl border border-zinc-800/40">
                  <FormattedAnalysis text={section.trim()} />
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
