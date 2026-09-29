import React from 'react';
import { PlayerStats } from '../game/types';
import { Zap, Shield, Heart, Crosshair, Flame, Pause, Volume2, VolumeX, Music, Trophy, Coins } from 'lucide-react';

interface ArcadeHUDProps {
  stats: PlayerStats;
  onPause: () => void;
  onOpenLeaderboard: () => void;
  sfxActive: boolean;
  musicActive: boolean;
  onToggleSFX: () => void;
  onToggleMusic: () => void;
  onTriggerEMP: () => void;
}

export const ArcadeHUD: React.FC<ArcadeHUDProps> = ({
  stats,
  onPause,
  onOpenLeaderboard,
  sfxActive,
  musicActive,
  onToggleSFX,
  onToggleMusic,
  onTriggerEMP
}) => {
  const healthPercent = Math.max(0, (stats.health / stats.maxHealth) * 100);
  const shieldPercent = Math.max(0, (stats.shield / stats.maxShield) * 100);
  const empPercent = stats.empReady ? 100 : Math.min(100, ((stats.empMaxCooldown - stats.empCooldown) / stats.empMaxCooldown) * 100);
  const bossPercent = stats.bossActive ? Math.max(0, (stats.bossHealth / stats.bossMaxHealth) * 100) : 0;

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none p-3 sm:p-4 select-none z-20 flex flex-col justify-between h-full">
      {/* Top Header: Scores & Quick Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Score & Multiplier */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 rounded-lg px-3 py-1.5 shadow-lg shadow-cyan-950/40">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-cyan-400 block font-bold">
                SCORE
              </span>
              <span className="font-arcade text-base sm:text-xl text-yellow-300 tracking-wider text-glow-yellow">
                {stats.score.toString().padStart(6, '0')}
              </span>
            </div>

            {/* Credits */}
            <div className="bg-slate-900/85 backdrop-blur-md border border-amber-500/40 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-arcade text-xs sm:text-sm text-amber-300">{stats.credits}</span>
            </div>

            {/* Combo Multiplier */}
            {stats.comboMultiplier > 1 && (
              <div
                className={`border rounded-lg px-2.5 py-1 flex items-center gap-1.5 animate-bounce ${
                  stats.comboMultiplier >= 10
                    ? 'bg-pink-950/80 border-pink-400/80'
                    : stats.comboMultiplier >= 5
                    ? 'bg-orange-950/80 border-orange-500/70'
                    : 'bg-amber-950/70 border-amber-500/60'
                }`}
              >
                <Flame className={`w-4 h-4 ${stats.comboMultiplier >= 10 ? 'text-pink-400' : stats.comboMultiplier >= 5 ? 'text-orange-400' : 'text-amber-400'}`} />
                <span className={`font-arcade text-xs sm:text-sm ${stats.comboMultiplier >= 10 ? 'text-pink-300' : stats.comboMultiplier >= 5 ? 'text-orange-300' : 'text-amber-300'}`}>
                  {stats.comboMultiplier}X
                </span>
              </div>
            )}
          </div>

          {/* Center: High Score */}
          <div className="hidden sm:flex flex-col items-center bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-lg px-3 py-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              HIGH SCORE
            </span>
            <span className="font-arcade text-xs text-cyan-300">
              {stats.highScore.toString().padStart(6, '0')}
            </span>
          </div>

          {/* Right: Wave, Leaderboard & Menu controls */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <div className="bg-slate-900/85 backdrop-blur-md border border-fuchsia-500/40 rounded-lg px-2.5 py-1 text-center mr-1">
              <span className="text-[9px] font-mono uppercase text-fuchsia-400 block font-bold">
                SECTOR {stats.wave}
              </span>
              <span className="font-arcade text-[10px] text-white">
                {stats.bossActive ? 'BOSS' : `${stats.waveEnemiesRemaining} LEFT`}
              </span>
            </div>

            <button
              onClick={onOpenLeaderboard}
              aria-label="High Scores"
              className="p-1.5 sm:p-2 bg-slate-900/80 hover:bg-slate-800 text-yellow-400 border border-yellow-500/40 rounded-lg shadow cursor-pointer transition active:scale-95"
              title="High Scores"
            >
              <Trophy className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleSFX}
              aria-label="Toggle Sound Effects"
              className="p-1.5 sm:p-2 bg-slate-900/80 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 rounded-lg shadow cursor-pointer transition active:scale-95"
              title={sfxActive ? 'Mute SFX' : 'Enable SFX'}
            >
              {sfxActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={onToggleMusic}
              aria-label="Toggle Synthwave Music"
              className="p-1.5 sm:p-2 bg-slate-900/80 hover:bg-slate-800 text-pink-400 border border-pink-500/30 rounded-lg shadow cursor-pointer transition active:scale-95"
              title={musicActive ? 'Mute Music' : 'Play Music'}
            >
              <Music className={`w-4 h-4 ${musicActive ? 'text-pink-400' : 'text-slate-500'}`} />
            </button>

            <button
              onClick={onPause}
              aria-label="Pause Game"
              className="p-1.5 sm:p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-600 rounded-lg shadow cursor-pointer transition active:scale-95"
              title="Pause (P / Esc)"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Boss Health Bar Display */}
        {stats.bossActive && (
          <div className="w-full max-w-lg mx-auto bg-slate-950/90 border border-purple-500/80 rounded-lg p-2 shadow-xl shadow-purple-900/30 animate-pulse-glow">
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono font-bold text-purple-300 mb-1">
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                DREADNOUGHT TITAN [CLASS 5]
              </span>
              <span>{Math.round(bossPercent)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-purple-900">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 transition-all duration-150"
                style={{ width: `${bossPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Health, Shield, Weapon Tier, EMP Cooldown */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        {/* Left: Health & Shield Gauges */}
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/70 rounded-xl p-2.5 sm:p-3 w-48 sm:w-60 shadow-xl">
          {/* Health */}
          <div className="mb-2">
            <div className="flex justify-between items-center text-[10px] font-mono font-bold mb-1">
              <span className="flex items-center gap-1 text-emerald-400">
                <Heart className="w-3.5 h-3.5 fill-emerald-500/40" /> HULL
              </span>
              <span className="text-emerald-300">{Math.round(stats.health)} / {stats.maxHealth}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-emerald-950">
              <div
                className={`h-full transition-all duration-150 ${healthPercent < 30 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>

          {/* Shield */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono font-bold mb-1">
              <span className="flex items-center gap-1 text-cyan-400">
                <Shield className="w-3.5 h-3.5 fill-cyan-500/40" /> SHIELD
              </span>
              <span className="text-cyan-300">{Math.round(stats.shield)} / {stats.maxShield}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-cyan-950">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 transition-all duration-150"
                style={{ width: `${shieldPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Active Weapon & Boost Timers */}
        <div className="flex items-center gap-2">
          {stats.weaponLevel > 1 && (
            <div className="bg-slate-900/85 backdrop-blur-md border border-amber-500/50 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[9px] font-mono block text-amber-400 leading-tight">
                  {stats.weaponLevel === 2 ? 'DUAL LASER' : 'TRIPLE PLASMA'}
                </span>
                <span className="font-arcade text-[10px] text-white">
                  {stats.weaponTimer.toFixed(0)}s
                </span>
              </div>
            </div>
          )}

          {stats.speedTimer > 0 && (
            <div className="bg-slate-900/85 backdrop-blur-md border border-purple-500/50 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-[9px] font-mono block text-purple-400 leading-tight">
                  HYPER THRUST
                </span>
                <span className="font-arcade text-[10px] text-white">
                  {stats.speedTimer.toFixed(0)}s
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: EMP Bomb Gauge & Trigger */}
        <div className="pointer-events-auto">
          <button
            onClick={() => {
              if (stats.empReady) onTriggerEMP();
            }}
            disabled={!stats.empReady}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
              stats.empReady
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-400 text-white shadow-lg shadow-pink-500/50 animate-pulse hover:scale-105 active:scale-95'
                : 'bg-slate-900/85 border-slate-700/60 text-slate-400 opacity-80 cursor-not-allowed'
            }`}
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              {/* Circular Cooldown Arc */}
              <svg className="w-8 h-8 transform -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  className="stroke-slate-700"
                  strokeWidth="3"
                  fill="transparent"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  className={stats.empReady ? 'stroke-pink-300' : 'stroke-pink-500'}
                  strokeWidth="3"
                  strokeDasharray="81.68"
                  strokeDashoffset={81.68 - (81.68 * empPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <Zap className={`w-4 h-4 absolute ${stats.empReady ? 'text-white fill-white' : 'text-pink-400'}`} />
            </div>

            <div className="text-left font-mono">
              <span className="block text-[9px] uppercase tracking-wider text-pink-200 font-bold">
                EMP BOMB [B]
              </span>
              <span className="font-arcade text-xs text-white">
                {stats.empReady ? 'READY' : `${stats.empCooldown.toFixed(1)}s`}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
