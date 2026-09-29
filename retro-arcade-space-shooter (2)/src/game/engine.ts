import { Player, Enemy, DroneEnemy, InterceptorEnemy, BossShip, Projectile, PowerUp } from './entities';
import { Particle, FloatingText, Shockwave, Starfield, ScreenShake } from './particles';
import { Hazard, Asteroid, BlackHole, LaserBarrier } from './hazards';
import { soundEngine } from './audio';
import { GameState, HighScoreEntry, PlayerStats, PowerUpType, ShipType, UpgradeType, UpgradeState, GameSettings } from './types';
import { SHIPS, getInitialUpgrades, getUpgradeCost, MAX_UPGRADE_LEVEL } from './ships';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public state: GameState = 'start';

  // Game Dimensions
  public width: number = 800;
  public height: number = 600;

  // Entities
  public player: Player;
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public powerUps: PowerUp[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public shockwaves: Shockwave[] = [];
  public hazards: Hazard[] = [];
  public starfield: Starfield;
  public screenShake: ScreenShake = new ScreenShake();

  // Progression
  public score: number = 0;
  public credits: number = 0;
  public wave: number = 1;
  public kills: number = 0;

  // Wave management
  public waveTotalEnemies: number = 0;
  public waveSpawned: number = 0;
  public isBossWave: boolean = false;
  public bossActive: boolean = false;
  public activeBoss: BossShip | null = null;
  public spawnTimer: number = 0;
  public spawnInterval: number = 1.1;
  public hazardTimer: number = 0;
  public waveIntroTimer: number = 0;

  // Combo system (up to 10x)
  public comboMultiplier: number = 1;
  public comboTimer: number = 0;
  private maxComboThisRun: number = 1;

  // Ship & Upgrades
  public selectedShip: ShipType = 'balanced';
  public upgrades: UpgradeState = getInitialUpgrades();

  // Settings
  public settings: GameSettings = {
    musicVolume: 0.4,
    sfxVolume: 0.7,
    shakeIntensity: 1.0
  };

  // Input states
  public keys: { [key: string]: boolean } = {};
  public isFiring: boolean = false;

  // High Scores
  public highScores: HighScoreEntry[] = [];
  public highScore: number = 0;

  // Callbacks to sync with React UI
  public onStatsUpdate?: (stats: PlayerStats) => void;
  public onStateChange?: (state: GameState) => void;

  // Animation Frame
  private animationId: number | null = null;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    this.player = new Player(this.width / 2, this.height - 80);
    this.starfield = new Starfield(this.width, this.height, 130);

    this.loadHighScores();
    this.loadSettings();
    this.setupListeners();
    this.resizeCanvas();
  }

  public resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const targetWidth = Math.min(900, Math.max(360, rect.width));
    const targetHeight = Math.min(850, Math.max(480, rect.height));

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = targetWidth;
    this.height = targetHeight;

    this.canvas.width = targetWidth * dpr;
    this.canvas.height = targetHeight * dpr;
    this.canvas.style.width = `${targetWidth}px`;
    this.canvas.style.height = `${targetHeight}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
    this.starfield.resize(targetWidth, targetHeight);
  }

  // ---------- Persistence ----------
  private loadHighScores() {
    try {
      const saved = localStorage.getItem('neovanguard_high_scores');
      if (saved) {
        this.highScores = JSON.parse(saved);
        if (this.highScores.length > 0) {
          this.highScore = Math.max(...this.highScores.map(s => s.score));
        }
      } else {
        this.highScores = [
          { id: '1', name: 'ACE', score: 3500, wave: 7, date: '2025-01-01' },
          { id: '2', name: 'VEX', score: 2400, wave: 5, date: '2025-01-02' },
          { id: '3', name: 'NOVA', score: 1800, wave: 4, date: '2025-01-03' },
          { id: '4', name: 'CYB', score: 1200, wave: 3, date: '2025-01-04' },
          { id: '5', name: 'PILOT', score: 600, wave: 2, date: '2025-01-05' }
        ];
        this.highScore = 3500;
      }
    } catch {
      this.highScore = 0;
    }
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('neovanguard_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    soundEngine.setMusicVolume(this.settings.musicVolume);
    soundEngine.setSFXVolume(this.settings.sfxVolume);
    this.screenShake.multiplier = this.settings.shakeIntensity;
  }

  public updateSettings(patch: Partial<GameSettings>) {
    this.settings = { ...this.settings, ...patch };
    soundEngine.setMusicVolume(this.settings.musicVolume);
    soundEngine.setSFXVolume(this.settings.sfxVolume);
    this.screenShake.multiplier = this.settings.shakeIntensity;
    try {
      localStorage.setItem('neovanguard_settings', JSON.stringify(this.settings));
    } catch {
      // ignore
    }
  }

  public saveHighScore(name: string): boolean {
    const newEntry: HighScoreEntry = {
      id: Math.random().toString(36).substring(2, 9),
      name: (name || 'AAA').toUpperCase().slice(0, 8),
      score: this.score,
      wave: this.wave,
      date: new Date().toISOString().split('T')[0]
    };

    this.highScores.push(newEntry);
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, 10);

    try {
      localStorage.setItem('neovanguard_high_scores', JSON.stringify(this.highScores));
    } catch {
      // ignore
    }

    if (this.score > this.highScore) this.highScore = this.score;
    return true;
  }

  // ---------- Input ----------
  private setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'Space') {
        this.isFiring = true;
        if (this.state === 'playing') e.preventDefault();
      }

      if (e.code === 'KeyB') {
        if (this.state === 'playing') {
          e.preventDefault();
          this.triggerEMP();
        }
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.state === 'playing') this.pauseGame();
        else if (this.state === 'paused') this.resumeGame();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space') this.isFiring = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.state !== 'playing') return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const targetX = (e.clientX - rect.left) * scaleX;
      if (e.buttons === 1) this.player.x += (targetX - this.player.x) * 0.2;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (this.state === 'playing' && e.button === 0) this.isFiring = true;
    });

    this.canvas.addEventListener('mouseup', () => {
      if (!this.keys['Space']) this.isFiring = false;
    });

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  // ---------- Ship Selection & Game Start ----------
  public selectShip(type: ShipType) {
    this.selectedShip = type;
  }

  public startGame(shipType?: ShipType) {
    soundEngine.enableAudio();
    if (shipType) this.selectedShip = shipType;

    this.state = 'playing';
    this.score = 0;
    this.credits = 0;
    this.wave = 1;
    this.kills = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;
    this.maxComboThisRun = 1;
    this.upgrades = getInitialUpgrades();

    this.player.applyShip(SHIPS[this.selectedShip], this.upgrades);
    this.player.reset(this.width / 2, this.height - 80);

    this.enemies = [];
    this.projectiles = [];
    this.powerUps = [];
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.hazards = [];

    this.startWave();

    this.lastTime = performance.now();
    if (this.onStateChange) this.onStateChange(this.state);
    this.loop();
  }

  // ---------- Wave System ----------
  private startWave() {
    this.isBossWave = this.wave % 3 === 0;
    this.waveSpawned = 0;
    this.spawnTimer = 0;
    this.hazardTimer = 0;
    this.waveIntroTimer = 2.2;
    this.bossActive = false;
    this.activeBoss = null;

    if (this.isBossWave) {
      // Boss + a few escorts
      this.activeBoss = new BossShip(this.width / 2, -60, Math.ceil(this.wave / 3));
      this.enemies.push(this.activeBoss);
      this.bossActive = true;
      this.waveTotalEnemies = 4 + Math.floor(this.wave / 3);
      this.floatingTexts.push(
        new FloatingText(this.width / 2, this.height * 0.3, '⚠ WARNING: ARMORED DREADNOUGHT ⚠', '#ef4444', 18)
      );
      this.screenShake.trigger(10, 1.2);
    } else {
      this.waveTotalEnemies = Math.min(30, 5 + this.wave * 2);
    }

    this.floatingTexts.push(
      new FloatingText(this.width / 2, this.height * 0.42, `SECTOR ${this.wave} // ${this.isBossWave ? 'BOSS ENCOUNTER' : 'INCOMING FLEET'}`, '#38bdf8', 20)
    );

    this.spawnHazardsForWave();
  }

  private spawnHazardsForWave() {
    const w = this.wave;

    // Asteroids from wave 2
    if (w >= 2) {
      const count = Math.min(5, Math.floor(w / 2) + 1);
      for (let i = 0; i < count; i++) {
        const radius = 16 + Math.random() * 22;
        const x = radius + Math.random() * (this.width - radius * 2);
        this.hazards.push(new Asteroid(x, -radius - Math.random() * 200, radius, 1 + w * 0.04));
      }
    }

    // Laser barriers on odd waves from wave 3
    if (w >= 3 && w % 2 === 1) {
      const barrierWidth = Math.min(this.width * 0.55, 220 + w * 8);
      const x = Math.random() * (this.width - barrierWidth);
      const y = this.height * (0.25 + Math.random() * 0.25);
      this.hazards.push(new LaserBarrier(x, y, barrierWidth, 0.15));
    }

    // Black hole from wave 4
    if (w >= 4 && Math.random() < 0.75) {
      const x = this.width * (0.25 + Math.random() * 0.5);
      const y = this.height * (0.2 + Math.random() * 0.2);
      this.hazards.push(new BlackHole(x, y, 0.9 + w * 0.04));
    }
  }

  private completeWave() {
    const bonus = 60 + this.wave * 30;
    this.credits += bonus;
    soundEngine.playPowerUp();
    this.floatingTexts.push(
      new FloatingText(this.width / 2, this.height * 0.4, `SECTOR ${this.wave} CLEARED!`, '#facc15', 24)
    );
    this.floatingTexts.push(
      new FloatingText(this.width / 2, this.height * 0.4 + 30, `+${bonus} CREDITS`, '#fbbf24', 18)
    );

    this.wave++;
    this.projectiles = [];
    this.hazards = [];

    this.state = 'shop';
    if (this.onStateChange) this.onStateChange(this.state);
    this.broadcastStats();
  }

  // Called by UI to leave shop and begin next wave
  public continueFromShop() {
    this.state = 'playing';
    this.player.invulnerableTimer = 1.5;
    this.player.isInvulnerable = true;
    this.startWave();
    this.lastTime = performance.now();
    if (this.onStateChange) this.onStateChange(this.state);
    this.loop();
  }

  // ---------- Shop ----------
  public getUpgradeCost(type: UpgradeType): number {
    return getUpgradeCost(type, this.upgrades[type]);
  }

  public buyUpgrade(type: UpgradeType): boolean {
    const level = this.upgrades[type];
    if (level >= MAX_UPGRADE_LEVEL) return false;
    const cost = getUpgradeCost(type, level);
    if (this.credits < cost) return false;

    this.credits -= cost;
    this.upgrades[type] = level + 1;

    // Re-apply upgraded stats to the player
    this.player.applyShip(SHIPS[this.selectedShip], this.upgrades);

    // Shield upgrade tops off the shield
    if (type === 'shield') this.player.shield = this.player.maxShield;

    soundEngine.playPowerUp();
    this.broadcastStats();
    return true;
  }

  // ---------- State control ----------
  public pauseGame() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    if (this.onStateChange) this.onStateChange(this.state);
  }

  public resumeGame() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.lastTime = performance.now();
    if (this.onStateChange) this.onStateChange(this.state);
    this.loop();
  }

  public restartGame() {
    this.startGame();
  }

  public gameOver() {
    this.state = 'gameover';
    soundEngine.playExplosionLarge();
    this.createExplosion(this.player.x, this.player.y, 70, '#38bdf8');
    this.screenShake.trigger(16, 0.8);
    if (this.score > this.highScore) this.highScore = this.score;
    if (this.onStateChange) this.onStateChange(this.state);
  }

  // ---------- EMP Bomb ----------
  public triggerEMP(): boolean {
    if (this.player.empCooldown > 0) {
      this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 30, 'EMP CHARGING', '#f43f5e', 14));
      return false;
    }

    this.player.empCooldown = this.player.empMaxCooldown;
    soundEngine.playEMP();
    this.screenShake.trigger(20, 0.9);

    this.shockwaves.push(new Shockwave(this.player.x, this.player.y, Math.max(this.width, this.height) * 1.2, '#06b6d4', 700));
    this.shockwaves.push(new Shockwave(this.player.x, this.player.y, Math.max(this.width, this.height) * 0.9, '#ec4899', 550));

    // Clear all enemy projectiles
    this.projectiles = this.projectiles.filter(p => {
      if (!p.isPlayer) {
        this.particles.push(new Particle(p.x, p.y, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, '#38bdf8', 2, 0.2));
        return false;
      }
      return true;
    });

    const bombDmg = this.player.bombDamage;
    // Damage all enemies
    this.enemies.forEach(enemy => {
      if (enemy.isBoss) {
        enemy.takeDamage(bombDmg);
        this.floatingTexts.push(new FloatingText(enemy.x, enemy.y - 20, `-${bombDmg} EMP`, '#ec4899', 18));
      } else {
        enemy.takeDamage(9999);
      }
    });

    // EMP also shatters asteroids & collapses black holes
    this.hazards.forEach(h => {
      if (h instanceof Asteroid) {
        h.alive = false;
        this.createExplosion(h.x, h.y, 14, '#a8a29e');
      } else if (h instanceof BlackHole) {
        h.alive = false;
        this.createExplosion(h.x, h.y, 24, '#a855f7');
      }
    });

    this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 45, '⚡ EMP DETONATED ⚡', '#38bdf8', 20));
    return true;
  }

  // ---------- Spawning during wave ----------
  private updateSpawning(dt: number) {
    if (this.waveIntroTimer > 0) {
      this.waveIntroTimer -= dt;
      return;
    }

    // Spawn wave enemies until quota reached
    if (this.waveSpawned < this.waveTotalEnemies) {
      this.spawnTimer += dt;
      const interval = Math.max(0.5, this.spawnInterval - this.wave * 0.04) * (this.isBossWave ? 1.8 : 1);
      if (this.spawnTimer >= interval) {
        this.spawnTimer = 0;
        const speedMultiplier = 1 + Math.min(2.2, this.wave * 0.12);
        const spawnX = 40 + Math.random() * (this.width - 80);
        const interceptorChance = Math.min(0.6, 0.15 + this.wave * 0.05);
        if (Math.random() < interceptorChance) {
          this.enemies.push(new InterceptorEnemy(spawnX, -30, speedMultiplier));
        } else {
          this.enemies.push(new DroneEnemy(spawnX, -30, speedMultiplier));
        }
        this.waveSpawned++;
      }
    }

    // Recurring asteroid trickle from wave 2
    if (this.wave >= 2) {
      this.hazardTimer += dt;
      if (this.hazardTimer >= 4.5) {
        this.hazardTimer = 0;
        const radius = 14 + Math.random() * 20;
        const x = radius + Math.random() * (this.width - radius * 2);
        this.hazards.push(new Asteroid(x, -radius - 20, radius, 1 + this.wave * 0.04));
      }
    }

    // Wave completion check
    if (this.waveSpawned >= this.waveTotalEnemies && this.enemies.length === 0) {
      this.completeWave();
    }
  }

  private rollPowerUp(x: number, y: number) {
    if (Math.random() < 0.3) {
      const types: PowerUpType[] = ['triple_shot', 'shield', 'speed_boost', 'health_repair', 'emp_charge'];
      const pick = types[Math.floor(Math.random() * types.length)];
      this.powerUps.push(new PowerUp(x, y, pick));
    }
  }

  public createExplosion(x: number, y: number, count: number = 24, color: string = '#f59e0b') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 6.5;
      const size = 2 + Math.random() * 4;
      const colors = [color, '#ef4444', '#f59e0b', '#fbbf24', '#ffffff'];
      const chosenColor = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, chosenColor, size, 0.45 + Math.random() * 0.4, 'circle'));
    }
  }

  private awardKill(enemy: Enemy) {
    this.kills++;
    const prevCombo = this.comboMultiplier;
    this.comboMultiplier = Math.min(10, this.comboMultiplier + 0.5);
    this.comboTimer = 3.0;
    this.maxComboThisRun = Math.max(this.maxComboThisRun, this.comboMultiplier);

    // Combo milestone feedback
    if (prevCombo < 5 && this.comboMultiplier >= 5) {
      this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, '★ 5x COMBO ★', '#f59e0b', 20));
      soundEngine.playPowerUp();
      this.screenShake.trigger(6, 0.3);
    } else if (prevCombo < 10 && this.comboMultiplier >= 10) {
      this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 40, '☆ 10x MAX COMBO! ☆', '#ec4899', 24));
      soundEngine.playPowerUp();
      this.screenShake.trigger(10, 0.4);
    }

    const points = Math.round(enemy.scoreValue * this.comboMultiplier);
    this.score += points;
    const creditGain = Math.max(1, Math.ceil(enemy.scoreValue / 8));
    this.credits += creditGain;

    this.createExplosion(enemy.x, enemy.y, enemy.isBoss ? 80 : 25, enemy.color);

    if (enemy.isBoss) {
      soundEngine.playExplosionLarge();
      this.screenShake.trigger(22, 1.0);
      this.shockwaves.push(new Shockwave(enemy.x, enemy.y, 450, '#a855f7', 400));
      this.bossActive = false;
      this.activeBoss = null;
      this.credits += 120;
      this.floatingTexts.push(new FloatingText(enemy.x, enemy.y, `BOSS DESTROYED! +${points}`, '#facc15', 22));
      this.floatingTexts.push(new FloatingText(enemy.x, enemy.y + 26, `+120 BONUS CREDITS`, '#fbbf24', 16));
      this.powerUps.push(new PowerUp(enemy.x - 25, enemy.y, 'emp_charge'));
      this.powerUps.push(new PowerUp(enemy.x + 25, enemy.y, 'triple_shot'));
    } else {
      soundEngine.playExplosionSmall();
      this.screenShake.trigger(5, 0.2);
      this.floatingTexts.push(new FloatingText(enemy.x, enemy.y, `+${points}`, '#38bdf8', 14));
      this.rollPowerUp(enemy.x, enemy.y);
    }
  }

  // ---------- Core Loop ----------
  private loop = () => {
    if (this.state !== 'playing') return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.08);
    this.lastTime = now;
    this.update(dt);
    this.render();
    this.animationId = requestAnimationFrame(this.loop);
  };

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private update(dt: number) {
    // Combo decay
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.comboMultiplier = 1;
    }

    this.starfield.speedMultiplier = this.player.speedTimer > 0 ? 3.0 : 1.0;
    this.starfield.update(dt);
    this.screenShake.update(dt);

    // Player
    this.player.update(dt, this.keys, { width: this.width, height: this.height }, this.particles);
    if (this.isFiring) this.player.shoot(this.projectiles);

    this.updateSpawning(dt);

    // Hazards
    this.updateHazards(dt);

    // Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const alive = enemy.update(
        dt,
        this.player,
        this.projectiles,
        this.particles,
        { width: this.width, height: this.height },
        (minion: Enemy) => this.enemies.push(minion)
      );

      const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
      if (dist < enemy.radius + this.player.radius) {
        if (!this.player.isInvulnerable) {
          const dead = this.player.takeDamage(35);
          this.createExplosion(this.player.x, this.player.y, 16, '#f87171');
          this.screenShake.trigger(12, 0.4);
          if (dead) { this.gameOver(); return; }
        }
        if (!enemy.isBoss) enemy.alive = false;
      }

      if (!alive || !enemy.alive) {
        if (!enemy.alive) this.awardKill(enemy);
        this.enemies.splice(i, 1);
      }
    }

    // Projectiles & collisions
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt);

      if (proj.y < -30 || proj.y > this.height + 30 || proj.x < -30 || proj.x > this.width + 30) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (proj.isPlayer) {
        let hit = false;

        // vs enemies
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          const d = Math.hypot(enemy.x - proj.x, enemy.y - proj.y);
          if (d < enemy.radius + proj.radius) {
            hit = true;
            enemy.takeDamage(proj.damage);
            for (let k = 0; k < 4; k++) {
              this.particles.push(new Particle(proj.x, proj.y, (Math.random() - 0.5) * 4, -Math.random() * 3, '#bae6fd', 2, 0.2));
            }
            break;
          }
        }

        // vs asteroids
        if (!hit) {
          for (let h = this.hazards.length - 1; h >= 0; h--) {
            const hz = this.hazards[h];
            if (hz instanceof Asteroid) {
              const d = Math.hypot(hz.x - proj.x, hz.y - proj.y);
              if (d < hz.radius + proj.radius) {
                hit = true;
                const destroyed = hz.takeDamage(proj.damage);
                for (let k = 0; k < 3; k++) {
                  this.particles.push(new Particle(proj.x, proj.y, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, '#d6d3d1', 2, 0.2));
                }
                if (destroyed) {
                  this.createExplosion(hz.x, hz.y, 16, '#a8a29e');
                  this.score += 15;
                  this.credits += 2;
                  this.screenShake.trigger(4, 0.15);
                }
                break;
              }
            }
          }
        }

        if (hit) { this.projectiles.splice(i, 1); continue; }
      } else {
        const d = Math.hypot(this.player.x - proj.x, this.player.y - proj.y);
        if (d < this.player.radius + proj.radius) {
          const dead = this.player.takeDamage(proj.damage);
          this.screenShake.trigger(8, 0.3);
          this.projectiles.splice(i, 1);
          if (dead) { this.gameOver(); return; }
          continue;
        }
      }
    }

    // Power-ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.update(dt);
      const d = Math.hypot(this.player.x - p.x, this.player.y - p.y);
      if (d < this.player.radius + p.radius) {
        this.player.applyPowerUp(p.type);
        this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 30, `+ ${p.label}!`, p.color, 16));
        this.shockwaves.push(new Shockwave(p.x, p.y, 60, p.color, 250));
        this.powerUps.splice(i, 1);
        continue;
      }
      if (p.y > this.height + 40) this.powerUps.splice(i, 1);
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (!this.particles[i].update(dt)) this.particles.splice(i, 1);
    }
    // Floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      if (!this.floatingTexts[i].update(dt)) this.floatingTexts.splice(i, 1);
    }
    // Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      if (!this.shockwaves[i].update(dt)) this.shockwaves.splice(i, 1);
    }

    this.broadcastStats();
  }

  private updateHazards(dt: number) {
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const hz = this.hazards[i];
      const alive = hz.update(dt, this.player, this.particles, { width: this.width, height: this.height });

      if (hz instanceof Asteroid) {
        const d = Math.hypot(hz.x - this.player.x, hz.y - this.player.y);
        if (d < hz.radius + this.player.radius) {
          if (!this.player.isInvulnerable) {
            const dead = this.player.takeDamage(24);
            this.screenShake.trigger(14, 0.45);
            this.createExplosion(hz.x, hz.y, 18, '#a8a29e');
            hz.alive = false;
            if (dead) { this.gameOver(); return; }
          }
        }
      } else if (hz instanceof BlackHole) {
        if (hz.isDeadly(this.player) && !this.player.isInvulnerable) {
          const dead = this.player.takeDamage(45);
          this.screenShake.trigger(16, 0.5);
          this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - 30, 'SINGULARITY!', '#d946ef', 16));
          if (dead) { this.gameOver(); return; }
        }
      } else if (hz instanceof LaserBarrier) {
        if (hz.hitsPlayer(this.player) && !this.player.isInvulnerable) {
          const dead = this.player.takeDamage(30);
          this.screenShake.trigger(12, 0.4);
          if (dead) { this.gameOver(); return; }
        }
      }

      if (!alive || !hz.alive) this.hazards.splice(i, 1);
    }
  }

  private broadcastStats() {
    if (!this.onStatsUpdate) return;
    const remaining = Math.max(0, this.enemies.length + (this.waveTotalEnemies - this.waveSpawned));
    this.onStatsUpdate({
      score: this.score,
      highScore: Math.max(this.score, this.highScore),
      credits: this.credits,
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      shield: this.player.shield,
      maxShield: this.player.maxShield,
      empCooldown: Math.max(0, this.player.empCooldown),
      empMaxCooldown: this.player.empMaxCooldown,
      empReady: this.player.empCooldown <= 0,
      weaponLevel: this.player.weaponLevel,
      weaponTimer: this.player.weaponTimer,
      speedTimer: this.player.speedTimer,
      wave: this.wave,
      waveEnemiesRemaining: remaining,
      bossActive: this.bossActive,
      bossHealth: this.activeBoss ? this.activeBoss.health : 0,
      bossMaxHealth: this.activeBoss ? this.activeBoss.maxHealth : 1,
      comboMultiplier: Number(this.comboMultiplier.toFixed(1)),
      comboTimer: this.comboTimer,
      kills: this.kills
    });
  }

  // ---------- Render ----------
  public render() {
    this.ctx.save();

    this.ctx.fillStyle = '#050713';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.translate(this.screenShake.offsetX, this.screenShake.offsetY);

    this.starfield.draw(this.ctx);

    // Black hole gravity wells render beneath everything else
    for (const hz of this.hazards) {
      if (hz instanceof BlackHole) hz.draw(this.ctx);
    }

    for (const sw of this.shockwaves) sw.draw(this.ctx);
    for (const p of this.powerUps) p.draw(this.ctx);

    // Non-blackhole hazards
    for (const hz of this.hazards) {
      if (!(hz instanceof BlackHole)) hz.draw(this.ctx);
    }

    for (const enemy of this.enemies) enemy.draw(this.ctx);
    for (const proj of this.projectiles) proj.draw(this.ctx);

    if (this.state !== 'gameover') this.player.draw(this.ctx);

    for (const part of this.particles) part.draw(this.ctx);
    for (const txt of this.floatingTexts) txt.draw(this.ctx);

    this.ctx.restore();
  }
}
