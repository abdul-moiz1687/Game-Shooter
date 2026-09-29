export type GameState = 'start' | 'shipselect' | 'playing' | 'paused' | 'shop' | 'gameover';

export type WeaponLevel = 1 | 2 | 3 | 4;

export type PowerUpType = 
  | 'triple_shot' 
  | 'shield' 
  | 'speed_boost' 
  | 'health_repair' 
  | 'emp_charge';

export interface PowerUpConfig {
  type: PowerUpType;
  name: string;
  color: string;
  iconText: string;
  duration?: number; // duration in ms, if temporary
}

export type EnemyType = 'drone' | 'interceptor' | 'bomber' | 'boss';

export type ShipType = 'speedster' | 'tank' | 'balanced';

export interface ShipConfig {
  id: ShipType;
  name: string;
  tagline: string;
  description: string;
  color: string;      // primary hull color
  accent: string;     // glow accent
  // Base stats
  speed: number;
  maxHealth: number;
  maxShield: number;
  startShield: number;
  fireRate: number;    // seconds between shots (lower = faster)
  bombDamage: number;  // EMP damage to boss
  radius: number;
}

export type UpgradeType = 'fireRate' | 'shield' | 'bomb';

export interface UpgradeState {
  fireRate: number; // level 0-5
  shield: number;   // level 0-5
  bomb: number;     // level 0-5
}

export interface GameSettings {
  musicVolume: number;   // 0-1
  sfxVolume: number;     // 0-1
  shakeIntensity: number; // 0-2 (1 = normal)
}

export interface HighScoreEntry {
  id: string;
  name: string;
  score: number;
  wave: number;
  date: string;
}

export interface PlayerStats {
  score: number;
  highScore: number;
  credits: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  empCooldown: number; // remaining cooldown in seconds
  empMaxCooldown: number;
  empReady: boolean;
  weaponLevel: WeaponLevel;
  weaponTimer: number; // time left on powerup weapon
  speedTimer: number; // time left on speed boost
  wave: number;
  waveEnemiesRemaining: number;
  bossActive: boolean;
  bossHealth: number;
  bossMaxHealth: number;
  comboMultiplier: number;
  comboTimer: number;
  kills: number;
}
