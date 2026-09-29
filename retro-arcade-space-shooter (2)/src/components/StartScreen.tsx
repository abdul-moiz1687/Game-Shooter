import React, { useState } from 'react';
import { Play, Trophy, Volume2, VolumeX, Music, Shield, Zap, Crosshair, Heart, Skull, Rocket, HelpCircle } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
  onOpenLeaderboard: () => void;
  highScore: number;
  sfxActive: boolean;
  musicActive: boolean;
  onToggleSFX: () => void;
  onToggleMusic: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onOpenLeaderboard,
  highScore,
  sfxActive,
  musicActive,
  onToggleSFX,
  onToggleMusic
}) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'intel'>('controls');

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="max-w-xl w-full bg-slate-900/90 border-2 border-cyan-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-900/50 relative overflow-hidden">
        {/* Neon accent stripes */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-400" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Title Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
            <Rocket className="w-3.5 h-3.5" /> RETRO ARCADE COMBAT SIMULATOR
          </div>
          <h1 className="font-arcade text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300 tracking-wider text-glow-cyan">
            NEO-VANGUARD
          </h1>
          <p className="text-slate-400 text-sm font-mono mt-1">
            ARMORED FLEET INTERCEPTION // DEFEND SECTOR 9
          </p>
        </div>

        {/* High Score Banner */}
        <div className="flex items-center justify-between bg-slate-950/70 border border-slate-700/60 rounded-xl px-4 py-2.5 mb-6">
          <div className="flex items-center gap-2 text-yellow-400 font-mono text-xs font-bold">
            <Trophy className="w-4 h-4" /> ALL-TIME RECORD:
          </div>
          <div className="font-arcade text-yellow-300 text-sm tracking-wider">
            {highScore.toString().padStart(6, '0')} PTS
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mb-4 font-mono text-xs font-bold">
          <button
            onClick={() => setActiveTab('controls')}
            className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'controls'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> FLIGHT CONTROLS
          </button>
          <button
            onClick={() => setActiveTab('intel')}
            className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'intel'
                ? 'border-pink-400 text-pink-300 bg-pink-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Skull className="w-4 h-4" /> TACTICAL INTEL
          </button>
        </div>

        {/* Tab Content: Flight Controls */}
        {activeTab === 'controls' ? (
          <div className="space-y-3 font-mono text-xs mb-6 text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                <span className="text-slate-400">Movement:</span>
                <span className="font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-cyan-800">
                  WASD / Arrow Keys
                </span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                <span className="text-slate-400">Fire Lasers:</span>
                <span className="font-bold text-yellow-300 bg-slate-900 px-2 py-0.5 rounded border border-yellow-800">
                  Spacebar / Auto
                </span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                <span className="text-slate-400">EMP Shockwave:</span>
                <span className="font-bold text-pink-300 bg-slate-900 px-2 py-0.5 rounded border border-pink-800">
                  [B] Key / Screen Button
                </span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                <span className="text-slate-400">Pause / Menu:</span>
                <span className="font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  [P] or [Esc]
                </span>
              </div>
            </div>

            <div className="bg-cyan-950/30 border border-cyan-900/50 rounded-lg p-3 text-cyan-200/90 text-[11px] leading-relaxed">
              <span className="font-bold text-cyan-400">⚡ MOBILE & TOUCH READY:</span> Full on-screen analog joystick for steering, plus dedicated Fire and EMP trigger buttons on mobile touchscreens!
            </div>
          </div>
        ) : (
          /* Tab Content: Tactical Intel */
          <div className="space-y-3 font-mono text-xs mb-6 text-slate-300">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2">
                <div className="font-bold text-cyan-400 flex items-center gap-1 mb-1">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" /> ENERGY SHIELD
                </div>
                <p className="text-slate-400 text-[10px]">Absorbs incoming projectile kinetic energy before hull damage.</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2">
                <div className="font-bold text-pink-400 flex items-center gap-1 mb-1">
                  <Zap className="w-3.5 h-3.5 text-pink-400" /> EMP BOMB
                </div>
                <p className="text-slate-400 text-[10px]">Clears all enemy bullets on screen and vaporizes standard drones.</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2">
                <div className="font-bold text-yellow-400 flex items-center gap-1 mb-1">
                  <Crosshair className="w-3.5 h-3.5 text-yellow-400" /> TRIPLE SHOT
                </div>
                <p className="text-slate-400 text-[10px]">Upgrades blasters to 3-way spread plasma cannon for 15s.</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1 mb-1">
                  <Heart className="w-3.5 h-3.5 text-emerald-400" /> NANO REPAIR
                </div>
                <p className="text-slate-400 text-[10px]">Instantly restores +35 Hull integrity points upon pickup.</p>
              </div>
            </div>

            <div className="bg-red-950/30 border border-red-900/60 rounded-lg p-2.5 text-[11px] text-red-200">
              <span className="font-bold text-red-400">⚠ BOSS ALERT:</span> Armored Dreadnoughts guard every 3rd sector, entering a furious phase-2 enrage below 50% HP!
            </div>

            <div className="bg-purple-950/30 border border-purple-900/60 rounded-lg p-2.5 text-[11px] text-purple-200">
              <span className="font-bold text-purple-400">☄ HAZARDS:</span> Dodge drifting asteroid fields, gravity-pulling black holes, and pulsing laser barriers. Clear each sector to reach the <span className="text-amber-300 font-bold">UPGRADE BAY</span> and spend credits!
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onStart}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-slate-950 font-arcade text-base sm:text-lg font-black rounded-xl shadow-xl shadow-cyan-500/30 cursor-pointer transition transform active:scale-95 flex items-center justify-center gap-3 glitch-hover"
          >
            <Play className="w-5 h-5 fill-slate-950" /> SELECT SHIP & LAUNCH
          </button>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={onOpenLeaderboard}
              className="flex-1 py-2.5 bg-slate-950/80 hover:bg-slate-800 border border-yellow-500/40 text-yellow-400 font-mono text-xs font-bold rounded-lg cursor-pointer transition flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" /> HALL OF FAME
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onToggleSFX}
                className="p-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-cyan-400 rounded-lg cursor-pointer transition"
                title={sfxActive ? 'SFX On' : 'SFX Off'}
              >
                {sfxActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

              <button
                onClick={onToggleMusic}
                className="p-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-pink-400 rounded-lg cursor-pointer transition"
                title={musicActive ? 'Music On' : 'Music Off'}
              >
                <Music className={`w-4 h-4 ${musicActive ? 'text-pink-400' : 'text-slate-500'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
