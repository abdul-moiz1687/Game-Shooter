import React from 'react';
import { Zap, Shield, Crosshair, Coins, ArrowRight, Check, Heart } from 'lucide-react';
import { UpgradeType, UpgradeState, PlayerStats } from '../game/types';
import { UPGRADE_DEFS, MAX_UPGRADE_LEVEL } from '../game/ships';

interface ShopScreenProps {
  stats: PlayerStats;
  upgrades: UpgradeState;
  getCost: (type: UpgradeType) => number;
  onBuy: (type: UpgradeType) => void;
  onContinue: () => void;
  nextWave: number;
}

const ICONS: Record<UpgradeType, React.ElementType> = {
  fireRate: Crosshair,
  shield: Shield,
  bomb: Zap
};

export const ShopScreen: React.FC<ShopScreenProps> = ({
  stats,
  upgrades,
  getCost,
  onBuy,
  onContinue,
  nextWave
}) => {
  const types: UpgradeType[] = ['fireRate', 'shield', 'bomb'];

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900/95 border-2 border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-amber-900/40 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500" />

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-arcade text-base sm:text-lg text-amber-300 tracking-wider text-glow-yellow flex items-center gap-2">
            <Coins className="w-5 h-5" /> UPGRADE BAY
          </h2>
          <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-500/50 rounded-lg px-3 py-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-arcade text-sm text-amber-300">{stats.credits}</span>
            <span className="font-mono text-[10px] text-slate-400 uppercase">CR</span>
          </div>
        </div>
        <p className="font-mono text-[11px] text-slate-400 mb-4 uppercase tracking-wider">
          Sector {nextWave - 1} cleared — spend credits before Sector {nextWave}
        </p>

        {/* Ship condition */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-400" />
            <div className="flex-1">
              <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                <span>HULL</span><span className="text-emerald-300">{Math.round(stats.health)}/{stats.maxHealth}</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(stats.health / stats.maxHealth) * 100}%` }} />
              </div>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <div className="flex-1">
              <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                <span>SHIELD</span><span className="text-cyan-300">{Math.round(stats.shield)}/{stats.maxShield}</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(stats.shield / stats.maxShield) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade cards */}
        <div className="space-y-2.5 mb-5">
          {types.map((type) => {
            const def = UPGRADE_DEFS[type];
            const level = upgrades[type];
            const maxed = level >= MAX_UPGRADE_LEVEL;
            const cost = getCost(type);
            const affordable = stats.credits >= cost && !maxed;
            const Icon = ICONS[type];

            return (
              <div
                key={type}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3"
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${def.color}22`, border: `1px solid ${def.color}66` }}
                >
                  <Icon className="w-5 h-5" style={{ color: def.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs font-bold" style={{ color: def.color }}>{def.name}</div>
                  <div className="font-mono text-[10px] text-slate-400 truncate">{def.description}</div>
                  {/* Level pips */}
                  <div className="flex gap-1 mt-1.5">
                    {Array.from({ length: MAX_UPGRADE_LEVEL }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 w-6 rounded-full"
                        style={{ background: i < level ? def.color : '#334155' }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onBuy(type)}
                  disabled={!affordable}
                  className={`shrink-0 px-3 py-2 rounded-lg font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    maxed
                      ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 cursor-default'
                      : affordable
                      ? 'text-slate-950 active:scale-95'
                      : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                  style={affordable && !maxed ? { background: def.color } : {}}
                >
                  {maxed ? (
                    <><Check className="w-3.5 h-3.5" /> MAX</>
                  ) : (
                    <><Coins className="w-3.5 h-3.5" /> {cost}</>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Continue */}
        <button
          onClick={onContinue}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-arcade text-sm font-black rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
        >
          LAUNCH SECTOR {nextWave} <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
