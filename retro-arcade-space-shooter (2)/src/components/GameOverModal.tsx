import React, { useState } from 'react';
import { RotateCcw, Trophy, Skull, Home, Flame, Crosshair } from 'lucide-react';
import { PlayerStats } from '../game/types';

interface GameOverModalProps {
  stats: PlayerStats;
  onRestart: () => void;
  onHome: () => void;
  onSaveScore: (name: string) => void;
  isNewRecord: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onHome,
  onSaveScore,
  isNewRecord
}) => {
  const [initials, setInitials] = useState('ACE');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saved && initials.trim()) {
      onSaveScore(initials.trim().toUpperCase());
      setSaved(true);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-md w-full bg-slate-900/95 border-2 border-red-500/60 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-red-950/60 text-center relative overflow-hidden">
        {/* Red warning border header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-pink-600 to-amber-500" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
          <Skull className="w-4 h-4" /> SHIP DESTROYED
        </div>

        <h2 className="font-arcade text-2xl sm:text-3xl text-red-500 mb-1 tracking-wider text-glow-red">
          GAME OVER
        </h2>
        <p className="font-mono text-xs text-slate-400 mb-5 uppercase tracking-widest">
          SIGNAL LOST IN SECTOR {stats.wave}
        </p>

        {/* Score Display Card */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 mb-5 text-center">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
            FINAL SCORE
          </span>
          <div className="font-arcade text-3xl sm:text-4xl text-yellow-300 text-glow-yellow mb-2">
            {stats.score.toString().padStart(6, '0')}
          </div>

          {isNewRecord && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/60 text-yellow-300 text-xs font-arcade animate-pulse mb-3">
              <Trophy className="w-3.5 h-3.5" /> NEW HIGH SCORE!
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block">SECTOR</span>
              <span className="text-white font-bold">{stats.wave}</span>
            </div>
            <div>
              <span className="text-slate-500 block">KILLS</span>
              <span className="text-cyan-300 font-bold flex items-center justify-center gap-0.5">
                <Crosshair className="w-3 h-3" /> {stats.kills}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">MAX COMBO</span>
              <span className="text-amber-400 font-bold flex items-center justify-center gap-0.5">
                <Flame className="w-3 h-3" /> {stats.comboMultiplier}X
              </span>
            </div>
          </div>
        </div>

        {/* Record Initials Form */}
        {!saved ? (
          <form onSubmit={handleSave} className="bg-slate-950/70 border border-cyan-900/50 rounded-xl p-3 mb-5">
            <label className="text-[11px] font-mono text-cyan-300 uppercase block font-bold mb-1.5">
              ENTER PILOT CALLSIGN:
            </label>
            <div className="flex gap-2 justify-center">
              <input
                type="text"
                maxLength={4}
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase())}
                className="w-28 text-center font-arcade text-lg bg-slate-900 border-2 border-cyan-500/70 rounded-lg py-1.5 text-white tracking-widest uppercase focus:outline-none focus:border-cyan-400"
                placeholder="ACE"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold rounded-lg cursor-pointer transition uppercase"
              >
                SAVE RECORD
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 font-mono text-xs rounded-xl py-2 mb-5">
            ✓ PILOT CALLSIGN [{initials}] RECORDED TO HALL OF FAME
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-slate-950 font-arcade text-sm font-bold rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 fill-slate-950" /> DEPLOY AGAIN (SPACE)
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs rounded-xl cursor-pointer transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> TITLE SCREEN
          </button>
        </div>
      </div>
    </div>
  );
};
