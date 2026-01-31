
import React from 'react';
import { BarChart3 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
        <BarChart3 size={24} className="text-emerald-500" />
      </div>
      <div>
        <h1 className="text-lg font-bold tracking-tight">Garmin R50 Pro</h1>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Analytics Dashboard</p>
      </div>
    </div>
  );
};

export default Header;
