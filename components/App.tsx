
import React, { useState, useEffect, useMemo } from 'react';
import { Shot } from './types';
import { processCsvRows, calculateClubStats } from './utils/dataProcessors';
import Header from './components/Header';
import ShotMap from './components/ShotMap';
import ClubSummary from './components/ClubSummary';
import SessionManager from './components/SessionManager';
import ShotTable from './components/ShotTable';
import SessionCoach from './components/SessionCoach';
import ClubDrilldown from './components/ClubDrilldown';
import { Upload, BarChart3, Database, AlertCircle, LayoutDashboard, BrainCircuit, Table as TableIcon } from 'lucide-react';

const parseCSVLine = (line: string, delimiter: string = ','): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else current += char;
  }
  result.push(current.trim());
  return result;
};

const generateHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; 
  }
  return hash.toString();
};

const App: React.FC = () => {
  const [shots, setShots] = useState<Shot[]>([]);
  const [uploadedHashes, setUploadedHashes] = useState<Set<string>>(new Set());
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'intelligence'>('dashboard');
  const [viewMode, setViewMode] = useState<'clubs' | 'shots'>('clubs');
  const [drilldownClub, setDrilldownClub] = useState<string | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('garmin_r50_data');
    const savedHashes = localStorage.getItem('garmin_r50_hashes');
    if (savedData) {
      try { 
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed)) {
          setShots(parsed);
          const ids = new Set(parsed.map((s: Shot) => s.sessionId));
          setSelectedSessionIds(ids);
        }
      } catch (e) { console.error("Persistence error", e); }
    }
    if (savedHashes) {
      try {
        const parsed = JSON.parse(savedHashes);
        if (Array.isArray(parsed)) setUploadedHashes(new Set(parsed));
      } catch (e) { console.error("Hash persistence error", e); }
    }
  }, []);

  useEffect(() => {
    if (shots.length > 0) {
      localStorage.setItem('garmin_r50_data', JSON.stringify(shots));
    }
    localStorage.setItem('garmin_r50_hashes', JSON.stringify(Array.from(uploadedHashes)));
  }, [shots, uploadedHashes]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) throw new Error("Empty file content");
        const fileHash = generateHash(text);
        if (uploadedHashes.has(fileHash)) {
          throw new Error("Duplicate CSV detected. This session has already been processed.");
        }
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');
        if (lines.length < 3) {
          throw new Error("Invalid Garmin R50 export. File structure missing headers or data.");
        }
        const headers = parseCSVLine(lines[0]);
        const dataLines = lines.slice(2);
        const rows = dataLines.map(line => {
          const values = parseCSVLine(line);
          const obj: any = {};
          headers.forEach((header, i) => { if (header) obj[header] = values[i] || ''; });
          return obj;
        });
        const sessionId = `session-${Date.now()}`;
        const newShots = processCsvRows(rows, sessionId);
        if (newShots.length === 0) {
          throw new Error("No valid shot data found in this CSV.");
        }
        setUploadedHashes(prev => new Set([...prev, fileHash]));
        setShots(prev => [...prev, ...newShots]);
        setSelectedSessionIds(prev => {
          const next = new Set(prev);
          next.add(sessionId);
          return next;
        });
      } catch (err: any) {
        setError(err.message || "Upload failed");
      } finally {
        setIsProcessing(false);
        if (event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const activeShots = useMemo(() => 
    shots.filter(s => selectedSessionIds.has(s.sessionId)),
    [shots, selectedSessionIds]
  );

  const clubStats = useMemo(() => 
    calculateClubStats(activeShots), 
    [activeShots]
  );

  const selectedDrilldownStats = useMemo(() => 
    clubStats.find(s => s.club === drilldownClub),
    [clubStats, drilldownClub]
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <Header />
          <div className="flex flex-col md:flex-row items-center gap-4">
            {shots.length > 0 && (
              <div className="bg-zinc-900 p-1 rounded-2xl border border-zinc-800 flex shadow-inner">
                <button 
                  onClick={() => { setActiveTab('dashboard'); setDrilldownClub(null); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <LayoutDashboard size={14} /> Performance
                </button>
                <button 
                  onClick={() => setActiveTab('intelligence')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'intelligence' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <BrainCircuit size={14} /> AI Insights
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              {shots.length > 0 && (
                <button 
                  onClick={() => {
                    if (window.confirm("Purge all data?")) {
                      setShots([]); setUploadedHashes(new Set()); setSelectedSessionIds(new Set());
                      localStorage.removeItem('garmin_r50_data'); localStorage.removeItem('garmin_r50_hashes');
                      setActiveTab('dashboard');
                    }
                  }} 
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700 hover:text-rose-500 transition-colors mr-2"
                >
                  Purge Data
                </button>
              )}
              <label className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-xl active:scale-95">
                <Upload size={16} />
                <span>{isProcessing ? 'Reading...' : 'Ingest CSV'}</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={isProcessing} />
              </label>
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-6 animate-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-[10px] font-black opacity-50 uppercase">Close</button>
          </div>
        )}

        {shots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border border-zinc-900 rounded-[2.5rem] bg-zinc-900/10 shadow-inner">
            <div className="bg-zinc-900 p-8 rounded-3xl mb-6 shadow-2xl border border-zinc-800">
              <Database size={56} className="text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black mb-3 tracking-tighter uppercase">R50 Engine Ready</h2>
            <p className="text-zinc-500 text-sm mb-8 max-w-md text-center font-medium leading-relaxed">
              Upload your Garmin R50 session CSV to unlock club-specific drilldowns, spatial dispersion maps, and AI tactical insights.
            </p>
            <label className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95">
              <Upload size={20} />
              <span>Upload CSV Session</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'dashboard' ? (
              <div className="space-y-6">
                {!drilldownClub && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
                    {[
                      { label: 'Database', value: shots.length, sub: 'Shots' },
                      { label: 'In View', value: activeShots.length, sub: 'Selected' },
                      { label: 'Sessions', value: selectedSessionIds.size, sub: 'Active' },
                      { label: 'Bag Size', value: clubStats.length, sub: 'Clubs' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-sm">
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-1">{stat.label}</p>
                        <p className="text-3xl font-black mono">{stat.value}</p>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{stat.sub}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {!drilldownClub && (
                    <div className="lg:col-span-4 space-y-6 order-2 lg:order-1 animate-in slide-in-from-left-4 duration-700">
                      <SessionManager 
                        shots={shots} 
                        selectedSessionIds={selectedSessionIds} 
                        onToggleSession={(id) => setSelectedSessionIds(prev => {
                          const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
                        })}
                        onToggleAll={() => {
                          const all = new Set(shots.map(s => s.sessionId));
                          setSelectedSessionIds(selectedSessionIds.size === all.size ? new Set() : all);
                        }}
                      />
                      <ShotMap shots={activeShots} />
                    </div>
                  )}
                  
                  <div className={`${drilldownClub ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6 order-1 lg:order-2`}>
                    {drilldownClub && selectedDrilldownStats ? (
                      <ClubDrilldown 
                        stats={selectedDrilldownStats} 
                        onBack={() => setDrilldownClub(null)} 
                      />
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-zinc-900/20 p-1.5 rounded-2xl border border-zinc-800 inline-flex">
                          <button onClick={() => setViewMode('clubs')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'clubs' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}>
                            <BarChart3 size={14} /> Bag Summary
                          </button>
                          <button onClick={() => setViewMode('shots')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'shots' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}>
                            <TableIcon size={14} /> Shot Detail
                          </button>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                          {viewMode === 'clubs' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {clubStats.map(stats => (
                                <ClubSummary key={stats.club} stats={stats} onDrilldown={setDrilldownClub} />
                              ))}
                            </div>
                          ) : (
                            <ShotTable shots={activeShots} />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <SessionCoach activeShots={activeShots} clubStats={clubStats} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
