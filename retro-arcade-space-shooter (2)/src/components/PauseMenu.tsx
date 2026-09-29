import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';
import { SettingsPanel } from './SettingsPanel';
import { GameSettings } from '../game/types';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  settings: GameSettings;
  onSettingsChange: (patch: Partial<GameSettings>) => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onHome,
  settings,
  onSettingsChange
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="max-w-md w-full bg-slate-900/95 border-2 border-slate-700 rounded-2xl p-6 shadow-2xl text-center">
        <h2 className="font-arcade text-2xl text-cyan-400 mb-1 tracking-wider text-glow-cyan">
          GAME PAUSED
        </h2>
        <p className="font-mono text-xs text-slate-400 mb-6 uppercase tracking-widest">
          SYSTEMS IN STANDBY
        </p>

        {/* Action Buttons */}
        <div className="space-y-3 mb-5">
          <button
            onClick={onResume}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-arcade text-sm font-bold rounded-xl shadow-lg cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" /> RESUME MISSION (ESC / P)
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-arcade text-xs font-bold rounded-xl cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> RESTART MISSION
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-400 font-mono text-xs rounded-xl cursor-pointer transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> RETURN TO TITLE
          </button>
        </div>

        {/* Audio & FX Settings */}
        <div className="text-left">
          <SettingsPanel settings={settings} onChange={onSettingsChange} />
        </div>
      </div>
    </div>
  );
};
