import React, { useState } from 'react';
import { Rocket, Zap, Shield, Heart, Crosshair, Gauge, ArrowLeft, Play } from 'lucide-react';
import { ShipType } from '../game/types';
import { SHIPS } from '../game/ships';

interface ShipSelectScreenProps {
  onConfirm: (ship: ShipType) => void;
  onBack: () => void;
}

const ORDER: ShipType[] = ['speedster', 'balanced', 'tank'];

// Normalize stat bars (relative to sensible maxes)
const statBar = (val: number, max: number) => Math.max(6, Math.min(100, (val / max) * 100));

export const ShipSelectScreen: React.FC<ShipSelectScreenProps> = ({ onConfirm, onBack }) => {
  const [selected, setSelected] = useState<ShipType>('balanced');
  const ship = SHIPS[selected];

  const stats = [
    { label: 'SPEED', icon: Gauge, value: statBar(ship.speed, 8), color: 'bg-purple-400' },
    { label: 'HULL', icon: Heart, value: statBar(ship.maxHealth, 180), color: 'bg-emerald-400' },
    { label: 'SHIELD', icon: Shield, value: statBar(ship.maxShield, 160), color: 'bg-cyan-400' },
    { label: 'FIRE RATE', icon: Crosshair, value: statBar(0.22 - ship.fireRate, 0.14), color: 'bg-amber-400' },
    { label: 'BOMB PWR', icon: Zap, value: statBar(ship.bombDamage, 400), color: 'bg-pink-400' }
  ];

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="max-w-3xl w-full bg-slate-900/95 border-2 border-cyan-500/50 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-cyan-900/40 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white font-mono text-xs cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4" /> BACK
          </button>
          <h2 className="font-arcade text-base sm:text-lg text-cyan-300 tracking-wider text-glow-cyan flex items-center gap-2">
            <Rocket className="w-5 h-5" /> SELECT YOUR SHIP
          </h2>
          <div className="w-12" />
        </div>

        {/* Ship Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
          {ORDER.map((id) => {
            const s = SHIPS[id];
            const isActive = selected === id;
            return (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className={`relative rounded-xl border-2 p-3 sm:p-4 text-center transition-all cursor-pointer ${
                  isActive
                    ? 'scale-[1.03] bg-slate-950/80'
                    : 'border-slate-700/60 bg-slate-950/40 hover:border-slate-500 opacity-80 hover:opacity-100'
                }`}
                style={isActive ? { borderColor: s.accent, boxShadow: `0 0 20px ${s.accent}55` } : {}}
              >
                {/* Ship glyph */}
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2 rounded-full flex items-center justify-center"
                  style={{ background: `radial-gradient(circle, ${s.color}44, transparent 70%)` }}
                >
                  <ShipIcon type={id} color={s.color} accent={s.accent} />
                </div>
                <div className="font-arcade text-[10px] sm:text-xs" style={{ color: s.accent }}>
                  {s.name}
                </div>
                <div className="font-mono text-[9px] text-slate-400 uppercase tracking-wider mt-1">
                  {s.tagline}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected ship detail panel */}
        <div className="bg-slate-950/70 border rounded-xl p-4 mb-5" style={{ borderColor: `${ship.accent}55` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-arcade text-sm" style={{ color: ship.accent }}>{ship.name}</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border" style={{ color: ship.accent, borderColor: `${ship.accent}66` }}>
              {ship.tagline}
            </span>
          </div>
          <p className="font-mono text-[11px] text-slate-400 mb-4 leading-relaxed">{ship.description}</p>

          <div className="space-y-2">
            {stats.map((st) => (
              <div key={st.label} className="flex items-center gap-2">
                <st.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-[10px] text-slate-400 w-20 shrink-0">{st.label}</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${st.color} transition-all duration-300 rounded-full`} style={{ width: `${st.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm */}
        <button
          onClick={() => onConfirm(selected)}
          className="w-full py-3.5 font-arcade text-sm sm:text-base font-black rounded-xl shadow-xl cursor-pointer transition transform active:scale-95 flex items-center justify-center gap-2 text-slate-950"
          style={{ background: `linear-gradient(to right, ${ship.color}, ${ship.accent})`, boxShadow: `0 8px 24px ${ship.accent}44` }}
        >
          <Play className="w-5 h-5 fill-slate-950" /> DEPLOY {ship.name}
        </button>
      </div>
    </div>
  );
};

// Simple inline SVG ship silhouettes per type
const ShipIcon: React.FC<{ type: ShipType; color: string; accent: string }> = ({ type, color, accent }) => {
  if (type === 'speedster') {
    return (
      <svg width="34" height="34" viewBox="0 0 34 34">
        <polygon points="17,3 22,26 17,22 12,26" fill={color} stroke={accent} strokeWidth="1.5" />
        <polygon points="12,20 5,28 13,22" fill={accent} />
        <polygon points="22,20 29,28 21,22" fill={accent} />
      </svg>
    );
  }
  if (type === 'tank') {
    return (
      <svg width="34" height="34" viewBox="0 0 34 34">
        <polygon points="17,4 25,10 27,28 21,30 13,30 7,28 9,10" fill={color} stroke={accent} strokeWidth="1.5" />
        <rect x="3" y="12" width="5" height="14" rx="1" fill={accent} />
        <rect x="26" y="12" width="5" height="14" rx="1" fill={accent} />
      </svg>
    );
  }
  return (
    <svg width="34" height="34" viewBox="0 0 34 34">
      <polygon points="17,3 28,26 17,22 6,26" fill={color} stroke={accent} strokeWidth="1.5" />
      <ellipse cx="17" cy="15" rx="3" ry="5" fill={accent} />
    </svg>
  );
};
