import React from 'react';
import { Music, Volume2, Activity } from 'lucide-react';
import { GameSettings } from '../game/types';

interface SettingsPanelProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  compact?: boolean;
}

const Slider: React.FC<{
  label: string;
  icon: React.ElementType;
  color: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (v: number) => void;
}> = ({ label, icon: Icon, color, value, min, max, step, displayValue, onChange }) => (
  <div>
    <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
      <span className="flex items-center gap-1.5" style={{ color }}>
        <Icon className="w-3.5 h-3.5" /> {label}
      </span>
      <span className="text-slate-300 font-bold">{displayValue}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-800 accent-current"
      style={{
        accentColor: color,
        background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, #1e293b ${((value - min) / (max - min)) * 100}%, #1e293b 100%)`
      }}
    />
  </div>
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange, compact }) => {
  const shakeLabel = settings.shakeIntensity === 0
    ? 'OFF'
    : settings.shakeIntensity < 0.75
    ? 'LOW'
    : settings.shakeIntensity < 1.25
    ? 'NORMAL'
    : settings.shakeIntensity < 1.75
    ? 'HIGH'
    : 'INTENSE';

  return (
    <div className={`bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3.5 ${compact ? '' : 'w-full'}`}>
      <div className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5" /> AUDIO & FX SETTINGS
      </div>

      <Slider
        label="MUSIC VOLUME"
        icon={Music}
        color="#ec4899"
        value={settings.musicVolume}
        min={0}
        max={1}
        step={0.05}
        displayValue={`${Math.round(settings.musicVolume * 100)}%`}
        onChange={(v) => onChange({ musicVolume: v })}
      />

      <Slider
        label="SFX VOLUME"
        icon={Volume2}
        color="#06b6d4"
        value={settings.sfxVolume}
        min={0}
        max={1}
        step={0.05}
        displayValue={`${Math.round(settings.sfxVolume * 100)}%`}
        onChange={(v) => onChange({ sfxVolume: v })}
      />

      <Slider
        label="SCREEN SHAKE"
        icon={Activity}
        color="#f59e0b"
        value={settings.shakeIntensity}
        min={0}
        max={2}
        step={0.25}
        displayValue={shakeLabel}
        onChange={(v) => onChange({ shakeIntensity: v })}
      />
    </div>
  );
};
