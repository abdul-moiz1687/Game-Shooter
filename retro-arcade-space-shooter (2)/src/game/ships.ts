import { ShipConfig, ShipType, UpgradeType, UpgradeState } from './types';

export const SHIPS: Record<ShipType, ShipConfig> = {
  speedster: {
    id: 'speedster',
    name: 'AURORA-X',
    tagline: 'SPEEDSTER',
    description: 'Blistering agility and rapid-fire cannons. Fragile hull demands flawless dodging.',
    color: '#a855f7',
    accent: '#e879f9',
    speed: 7.6,
    maxHealth: 70,
    maxShield: 60,
    startShield: 40,
    fireRate: 0.10,
    bombDamage: 200,
    radius: 15
  },
  tank: {
    id: 'tank',
    name: 'AEGIS-9',
    tagline: 'HEAVY TANK',
    description: 'A walking fortress. Massive hull & shields, devastating bombs, but sluggish and slow-firing.',
    color: '#f59e0b',
    accent: '#fbbf24',
    speed: 4.0,
    maxHealth: 170,
    maxShield: 150,
    startShield: 90,
    fireRate: 0.20,
    bombDamage: 380,
    radius: 22
  },
  balanced: {
    id: 'balanced',
    name: 'VANGUARD',
    tagline: 'BALANCED FIGHTER',
    description: 'The all-rounder. Solid speed, durability, and firepower for any combat situation.',
    color: '#0ea5e9',
    accent: '#38bdf8',
    speed: 5.6,
    maxHealth: 110,
    maxShield: 100,
    startShield: 55,
    fireRate: 0.14,
    bombDamage: 250,
    radius: 18
  }
};

export const MAX_UPGRADE_LEVEL = 5;

export interface UpgradeDef {
  type: UpgradeType;
  name: string;
  description: string;
  color: string;
  icon: string;
  baseCost: number;
}

export const UPGRADE_DEFS: Record<UpgradeType, UpgradeDef> = {
  fireRate: {
    type: 'fireRate',
    name: 'OVERCLOCK CANNONS',
    description: 'Boost weapon fire rate by 9% per level.',
    color: '#f59e0b',
    icon: 'crosshair',
    baseCost: 120
  },
  shield: {
    type: 'shield',
    name: 'SHIELD MATRIX',
    description: '+30 max shield capacity per level (auto-refills).',
    color: '#06b6d4',
    icon: 'shield',
    baseCost: 100
  },
  bomb: {
    type: 'bomb',
    name: 'EMP AMPLIFIER',
    description: '+70 EMP bomb damage per level.',
    color: '#ec4899',
    icon: 'zap',
    baseCost: 140
  }
};

export function getUpgradeCost(type: UpgradeType, currentLevel: number): number {
  const base = UPGRADE_DEFS[type].baseCost;
  return Math.round(base * (currentLevel + 1) * 1.35);
}

export function getInitialUpgrades(): UpgradeState {
  return { fireRate: 0, shield: 0, bomb: 0 };
}

// Apply upgrade multipliers to base ship config values
export function applyFireRate(baseFireRate: number, level: number): number {
  return baseFireRate * Math.pow(0.91, level);
}

export function applyShieldBonus(level: number): number {
  return level * 30;
}

export function applyBombBonus(level: number): number {
  return level * 70;
}
