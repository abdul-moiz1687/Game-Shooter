import { Particle } from './particles';
import { WeaponLevel, PowerUpType, ShipType, ShipConfig, UpgradeState } from './types';
import { applyFireRate, applyShieldBonus, applyBombBonus } from './ships';
import { soundEngine } from './audio';

// Base 2D Vector & Bounding Box
export interface Point {
  x: number;
  y: number;
}

export class Projectile {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public radius: number;
  public damage: number;
  public isPlayer: boolean;
  public color: string;
  public glowColor: string;
  public isPlasma: boolean;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    isPlayer: boolean = true,
    radius: number = 3.5,
    color: string = '#38bdf8',
    glowColor: string = '#0284c7',
    isPlasma: boolean = false
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.isPlayer = isPlayer;
    this.radius = radius;
    this.color = color;
    this.glowColor = glowColor;
    this.isPlasma = isPlasma;
  }

  public update(dt: number): boolean {
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    return true;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = this.color;

    if (this.isPlasma) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Streamlined laser beam capsule
      const len = 14;
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.roundRect(-len / 2, -this.radius, len, this.radius * 2, this.radius);
      ctx.fill();
    }
    ctx.restore();
  }
}

export class PowerUp {
  public x: number;
  public y: number;
  public vy: number;
  public type: PowerUpType;
  public radius: number = 14;
  public pulse: number = 0;
  public color: string;
  public label: string;

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x;
    this.y = y;
    this.vy = 1.2;
    this.type = type;

    switch (type) {
      case 'triple_shot':
        this.color = '#f59e0b';
        this.label = '3X';
        break;
      case 'shield':
        this.color = '#06b6d4';
        this.label = 'DEF';
        break;
      case 'speed_boost':
        this.color = '#a855f7';
        this.label = 'SPD';
        break;
      case 'health_repair':
        this.color = '#10b981';
        this.label = '+HP';
        break;
      case 'emp_charge':
        this.color = '#ec4899';
        this.label = 'EMP';
        break;
    }
  }

  public update(dt: number): boolean {
    this.y += this.vy * dt * 60;
    this.pulse += dt * 4;
    return true;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const glowScale = 1 + Math.sin(this.pulse) * 0.15;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12 * glowScale;

    // Glowing diamond/pill shape
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner icon text
    ctx.font = "bold 9px 'Press Start 2P', monospace";
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, this.x, this.y + 1);

    ctx.restore();
  }
}

export class Player {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public speed: number = 5.5;
  public radius: number = 18;
  public tilt: number = 0;

  public maxHealth: number = 100;
  public health: number = 100;
  public maxShield: number = 100;
  public shield: number = 50;

  public weaponLevel: WeaponLevel = 1;
  public weaponTimer: number = 0;
  public speedTimer: number = 0;

  // EMP Bomb mechanics
  public empCooldown: number = 0;
  public empMaxCooldown: number = 20; // 20 seconds cooldown
  public bombDamage: number = 250;    // EMP damage to boss

  public fireTimer: number = 0;
  public fireRate: number = 0.14; // seconds between shots

  public invulnerableTimer: number = 0;
  public isInvulnerable: boolean = false;

  // Ship identity
  public shipType: ShipType = 'balanced';
  public baseFireRate: number = 0.14;
  public baseBombDamage: number = 250;
  public baseMaxShield: number = 100;
  public startShield: number = 55;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // Configure ship stats + purchased upgrades
  public applyShip(config: ShipConfig, upgrades: UpgradeState) {
    this.shipType = config.id;
    this.speed = config.speed;
    this.maxHealth = config.maxHealth;
    this.radius = config.radius;

    this.baseFireRate = config.fireRate;
    this.baseBombDamage = config.bombDamage;
    this.baseMaxShield = config.maxShield;
    this.startShield = config.startShield;

    // Apply upgrades
    this.fireRate = applyFireRate(this.baseFireRate, upgrades.fireRate);
    this.maxShield = this.baseMaxShield + applyShieldBonus(upgrades.shield);
    this.bombDamage = this.baseBombDamage + applyBombBonus(upgrades.bomb);
  }

  public reset(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.health = this.maxHealth;
    this.shield = this.startShield;
    this.weaponLevel = 1;
    this.weaponTimer = 0;
    this.speedTimer = 0;
    this.empCooldown = 0;
    this.fireTimer = 0;
    this.invulnerableTimer = 2.0; // 2s spawn protection
    this.isInvulnerable = true;
  }

  public update(
    dt: number,
    keys: { [key: string]: boolean },
    bounds: { width: number; height: number },
    particles: Particle[]
  ) {
    // Speed boost check
    let currentSpeed = this.speed;
    if (this.speedTimer > 0) {
      this.speedTimer -= dt;
      currentSpeed = this.speed * 1.5;
    }

    // Input motion
    let dx = 0;
    let dy = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) dx -= 1;
    if (keys['ArrowRight'] || keys['KeyD']) dx += 1;
    if (keys['ArrowUp'] || keys['KeyW']) dy -= 1;
    if (keys['ArrowDown'] || keys['KeyS']) dy += 1;

    // Normalize diagonal velocity
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    // Inertia & smoothing
    this.vx += (dx * currentSpeed - this.vx) * 0.22;
    this.vy += (dy * currentSpeed - this.vy) * 0.22;

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;

    // Banking tilt
    const targetTilt = (this.vx / currentSpeed) * 0.45;
    this.tilt += (targetTilt - this.tilt) * 0.2;

    // Clamp inside viewport
    const margin = this.radius + 6;
    if (this.x < margin) {
      this.x = margin;
      this.vx = 0;
    }
    if (this.x > bounds.width - margin) {
      this.x = bounds.width - margin;
      this.vx = 0;
    }
    if (this.y < margin) {
      this.y = margin;
      this.vy = 0;
    }
    if (this.y > bounds.height - margin) {
      this.y = bounds.height - margin;
      this.vy = 0;
    }

    // Fire & EMP timers
    if (this.fireTimer > 0) this.fireTimer -= dt;
    if (this.empCooldown > 0) this.empCooldown -= dt;
    if (this.weaponTimer > 0) {
      this.weaponTimer -= dt;
      if (this.weaponTimer <= 0) {
        this.weaponLevel = 1;
      }
    }

    // Invulnerability flashing
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      this.isInvulnerable = true;
    } else {
      this.isInvulnerable = false;
    }

    // Thruster engine particles
    const thrusterColor = this.speedTimer > 0 ? '#c084fc' : '#38bdf8';
    const flameCount = this.speedTimer > 0 ? 3 : 2;
    for (let i = 0; i < flameCount; i++) {
      particles.push(
        new Particle(
          this.x + (Math.random() * 8 - 4),
          this.y + 16,
          (Math.random() * 1.5 - 0.75),
          3 + Math.random() * 3.5,
          thrusterColor,
          Math.random() * 3 + 2,
          0.3,
          'circle'
        )
      );
    }
  }

  public shoot(projectiles: Projectile[]): boolean {
    if (this.fireTimer > 0) return false;
    this.fireTimer = this.fireRate;

    if (this.weaponLevel === 1) {
      // Dual synchronized laser
      projectiles.push(new Projectile(this.x - 7, this.y - 12, 0, -11, 25, true, 3, '#38bdf8', '#0284c7'));
      projectiles.push(new Projectile(this.x + 7, this.y - 12, 0, -11, 25, true, 3, '#38bdf8', '#0284c7'));
      soundEngine.playLaser();
    } else if (this.weaponLevel === 2) {
      // Triple Laser
      projectiles.push(new Projectile(this.x, this.y - 16, 0, -12, 28, true, 3.5, '#f59e0b', '#d97706'));
      projectiles.push(new Projectile(this.x - 10, this.y - 10, -2, -11, 24, true, 3, '#38bdf8', '#0284c7'));
      projectiles.push(new Projectile(this.x + 10, this.y - 10, 2, -11, 24, true, 3, '#38bdf8', '#0284c7'));
      soundEngine.playTripleLaser();
    } else if (this.weaponLevel >= 3) {
      // 5-Way Plasma & Spread Beam
      projectiles.push(new Projectile(this.x, this.y - 18, 0, -13, 40, true, 5, '#ec4899', '#be185d', true));
      projectiles.push(new Projectile(this.x - 9, this.y - 12, -1.8, -12, 28, true, 3.5, '#f59e0b', '#d97706'));
      projectiles.push(new Projectile(this.x + 9, this.y - 12, 1.8, -12, 28, true, 3.5, '#f59e0b', '#d97706'));
      projectiles.push(new Projectile(this.x - 16, this.y - 6, -3.8, -10.5, 25, true, 3, '#38bdf8', '#0284c7'));
      projectiles.push(new Projectile(this.x + 16, this.y - 6, 3.8, -10.5, 25, true, 3, '#38bdf8', '#0284c7'));
      soundEngine.playTripleLaser();
    }
    return true;
  }

  public takeDamage(amount: number): boolean {
    if (this.isInvulnerable) return false;

    // Shield absorbs first
    if (this.shield > 0) {
      if (this.shield >= amount) {
        this.shield -= amount;
        amount = 0;
      } else {
        amount -= this.shield;
        this.shield = 0;
      }
    }

    if (amount > 0) {
      this.health = Math.max(0, this.health - amount);
      soundEngine.playPlayerHit();
    }

    this.invulnerableTimer = 1.0; // 1s grace period
    return this.health <= 0;
  }

  public applyPowerUp(type: PowerUpType) {
    soundEngine.playPowerUp();
    switch (type) {
      case 'triple_shot':
        this.weaponLevel = 3;
        this.weaponTimer = 15; // 15 seconds
        break;
      case 'shield':
        this.shield = Math.min(this.maxShield, this.shield + 50);
        break;
      case 'speed_boost':
        this.speedTimer = 12; // 12 seconds
        break;
      case 'health_repair':
        this.health = Math.min(this.maxHealth, this.health + 35);
        break;
      case 'emp_charge':
        this.empCooldown = 0;
        break;
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    // Flashing if invulnerable
    if (this.isInvulnerable && Math.floor(Date.now() / 80) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.tilt);

    // Shield Aura
    if (this.shield > 0) {
      const shieldRatio = this.shield / this.maxShield;
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(6, 182, 212, ${0.4 + shieldRatio * 0.4})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.stroke();

      ctx.fillStyle = `rgba(6, 182, 212, ${0.08 + shieldRatio * 0.12})`;
      ctx.fill();
      ctx.restore();
    }

    // Render ship hull specific to type
    if (this.shipType === 'speedster') {
      this.drawSpeedster(ctx);
    } else if (this.shipType === 'tank') {
      this.drawTank(ctx);
    } else {
      this.drawBalanced(ctx);
    }

    // Speed boost glow accents (all ships)
    if (this.speedTimer > 0) {
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(-14, 12);
      ctx.lineTo(0, -20);
      ctx.lineTo(14, 12);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawBalanced(ctx: CanvasRenderingContext2D) {
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;

    // Wing cannons
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-16, -2, 4, 16);
    ctx.fillRect(12, -2, 4, 16);

    const gradient = ctx.createLinearGradient(0, -22, 0, 18);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(0.5, '#0ea5e9');
    gradient.addColorStop(1, '#0369a1');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(16, 14);
    ctx.lineTo(8, 12);
    ctx.lineTo(6, 18);
    ctx.lineTo(-6, 18);
    ctx.lineTo(-8, 12);
    ctx.lineTo(-16, 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(0, -4, 4.5, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -6, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawSpeedster(ctx: CanvasRenderingContext2D) {
    // Slim, arrow-like interceptor - violet/magenta
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 14;

    // Swept-back thin wings
    ctx.fillStyle = '#6b21a8';
    ctx.beginPath();
    ctx.moveTo(-3, 4);
    ctx.lineTo(-20, 18);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(3, 4);
    ctx.lineTo(20, 18);
    ctx.lineTo(6, 8);
    ctx.closePath();
    ctx.fill();

    const gradient = ctx.createLinearGradient(0, -24, 0, 16);
    gradient.addColorStop(0, '#f5d0fe');
    gradient.addColorStop(0.5, '#c026d3');
    gradient.addColorStop(1, '#7e22ce');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, -24);   // sharp nose
    ctx.lineTo(7, 10);
    ctx.lineTo(4, 16);
    ctx.lineTo(-4, 16);
    ctx.lineTo(-7, 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cockpit
    ctx.fillStyle = '#f0abfc';
    ctx.beginPath();
    ctx.ellipse(0, -6, 3, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawTank(ctx: CanvasRenderingContext2D) {
    // Bulky armored fortress - amber/orange
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 14;

    // Heavy dual side cannons
    ctx.fillStyle = '#78716c';
    ctx.fillRect(-24, -6, 7, 22);
    ctx.fillRect(17, -6, 7, 22);
    ctx.fillStyle = '#57534e';
    ctx.fillRect(-23, -10, 5, 8);
    ctx.fillRect(18, -10, 5, 8);

    const gradient = ctx.createLinearGradient(0, -22, 0, 20);
    gradient.addColorStop(0, '#fde68a');
    gradient.addColorStop(0.5, '#f59e0b');
    gradient.addColorStop(1, '#b45309');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(14, -8);
    ctx.lineTo(18, 16);
    ctx.lineTo(10, 20);
    ctx.lineTo(-10, 20);
    ctx.lineTo(-18, 16);
    ctx.lineTo(-14, -8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Armor plating lines
    ctx.strokeStyle = 'rgba(120,53,15,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-12, 2);
    ctx.lineTo(12, 2);
    ctx.moveTo(-13, 10);
    ctx.lineTo(13, 10);
    ctx.stroke();

    // Cockpit
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(0, -6, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -8, 2.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Base Enemy
export abstract class Enemy {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public radius: number = 16;
  public health: number = 20;
  public maxHealth: number = 20;
  public scoreValue: number = 50;
  public isBoss: boolean = false;
  public fireTimer: number = 0;
  public fireInterval: number = 2.5;
  public color: string = '#ef4444';
  public alive: boolean = true;
  protected age: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public abstract update(
    dt: number,
    player: Player,
    projectiles: Projectile[],
    particles: Particle[],
    bounds: { width: number; height: number },
    onSpawnMinion?: (minion: Enemy) => void
  ): boolean;

  public abstract draw(ctx: CanvasRenderingContext2D): void;

  public takeDamage(dmg: number): boolean {
    this.health -= dmg;
    soundEngine.playHit();
    if (this.health <= 0) {
      this.alive = false;
      return true; // destroyed
    }
    return false;
  }
}

// 1. Basic Drone: Sweeping sinusoidal trajectory, fires light bursts
export class DroneEnemy extends Enemy {
  private initialX: number;
  private frequency: number;
  private amplitude: number;

  constructor(x: number, y: number, speedMultiplier: number = 1.0) {
    super(x, y);
    this.initialX = x;
    this.health = 25;
    this.maxHealth = 25;
    this.radius = 16;
    this.scoreValue = 60;
    this.color = '#f87171';
    this.vy = (1.8 + Math.random() * 0.8) * speedMultiplier;
    this.frequency = 3.2 + Math.random() * 0.8;
    this.amplitude = 40 + Math.random() * 30;
    this.fireInterval = 1.8 / speedMultiplier;
    this.fireTimer = Math.random() * this.fireInterval;
  }

  public update(
    dt: number,
    _player: Player,
    projectiles: Projectile[],
    _particles: Particle[],
    bounds: { width: number; height: number }
  ): boolean {
    this.age += dt;
    this.y += this.vy * dt * 60;
    this.x = this.initialX + Math.sin(this.age * this.frequency) * this.amplitude;

    // Keep within bounds horizontally
    if (this.x < this.radius) this.x = this.radius;
    if (this.x > bounds.width - this.radius) this.x = bounds.width - this.radius;

    // Firing logic
    this.fireTimer += dt;
    if (this.fireTimer >= this.fireInterval) {
      this.fireTimer = 0;
      projectiles.push(
        new Projectile(this.x, this.y + 12, 0, 5, 12, false, 3.5, '#f43f5e', '#be123c')
      );
    }

    // Remove if left bottom
    return this.y < bounds.height + 40;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 10;

    // Drone Hexagonal / V-wing shape
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(14, -10);
    ctx.lineTo(0, -4);
    ctx.lineTo(-14, -10);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Core light
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// 2. Fast Interceptor: Fast zig-zag dart, tracks player, burst shots
export class InterceptorEnemy extends Enemy {
  constructor(x: number, y: number, speedMultiplier: number = 1.0) {
    super(x, y);
    this.health = 45;
    this.maxHealth = 45;
    this.radius = 18;
    this.scoreValue = 120;
    this.color = '#e11d48';
    this.vy = (2.6 + Math.random() * 0.9) * speedMultiplier;
    this.fireInterval = 2.2 / speedMultiplier;
    this.fireTimer = Math.random() * 1.0;
  }

  public update(
    dt: number,
    player: Player,
    projectiles: Projectile[],
    particles: Particle[],
    bounds: { width: number; height: number }
  ): boolean {
    this.age += dt;
    this.y += this.vy * dt * 60;

    // Interceptor steers toward player's horizontal position
    const steer = (player.x - this.x) * 0.04;
    this.x += steer * dt * 60;

    // Fire targeted burst
    this.fireTimer += dt;
    if (this.fireTimer >= this.fireInterval) {
      this.fireTimer = 0;
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const speed = 6.2;
      projectiles.push(
        new Projectile(
          this.x,
          this.y + 10,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          16,
          false,
          4,
          '#fb7185',
          '#e11d48'
        )
      );
    }

    // Engine trail
    if (Math.random() < 0.4) {
      particles.push(
        new Particle(this.x, this.y - 10, 0, -2, '#fb7185', 2.5, 0.25)
      );
    }

    return this.y < bounds.height + 40;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.shadowColor = '#e11d48';
    ctx.shadowBlur = 12;

    // Sleek spearhead fighter
    ctx.fillStyle = '#4c0519';
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(16, -14);
    ctx.lineTo(0, -8);
    ctx.lineTo(-16, -14);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dual red glow nacelles
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(-10, -10, 4, 8);
    ctx.fillRect(6, -10, 4, 8);

    ctx.restore();
  }
}

// 3. Armored Boss Ship (Spawns every 500 points)
export class BossShip extends Enemy {
  public maxHealth: number = 800;
  public phase: number = 1; // 1 = standard, 2 = enrage (<50% HP)
  private enterY: number = 100;
  private entered: boolean = false;
  private attackTimer: number = 0;
  private sweepAngle: number = 0;
  private minionTimer: number = 0;
  private pulseCore: number = 0;

  constructor(x: number, y: number, wave: number = 1) {
    super(x, y);
    this.isBoss = true;
    this.radius = 48;
    this.maxHealth = 700 + wave * 300;
    this.health = this.maxHealth;
    this.scoreValue = 1000;
    this.color = '#9333ea';
    soundEngine.playBossWarning();
  }

  public update(
    dt: number,
    player: Player,
    projectiles: Projectile[],
    particles: Particle[],
    bounds: { width: number; height: number },
    onSpawnMinion?: (minion: Enemy) => void
  ): boolean {
    this.age += dt;
    this.pulseCore += dt * 5;

    // Entrance sequence
    if (!this.entered) {
      this.y += 1.8 * dt * 60;
      if (this.y >= this.enterY) {
        this.entered = true;
      }
      return true;
    }

    // Boss Phase Check
    if (this.health <= this.maxHealth * 0.5) {
      this.phase = 2;
    }

    // Hover movement (figure-8 horizontal sway)
    this.x = bounds.width / 2 + Math.sin(this.age * 1.2) * (bounds.width * 0.35);
    this.y = this.enterY + Math.cos(this.age * 1.8) * 20;

    // Attack routines
    this.attackTimer += dt;
    const interval = this.phase === 2 ? 0.9 : 1.4;

    if (this.attackTimer >= interval) {
      this.attackTimer = 0;

      if (this.phase === 1) {
        // 5-way spread cannons
        const angles = [-0.6, -0.3, 0, 0.3, 0.6];
        angles.forEach(ang => {
          projectiles.push(
            new Projectile(
              this.x,
              this.y + 35,
              Math.sin(ang) * 5,
              Math.cos(ang) * 5,
              18,
              false,
              5,
              '#a855f7',
              '#7e22ce'
            )
          );
        });
      } else {
        // Phase 2 Enrage: Spiral Barrage + Dual Heavy Plasma
        this.sweepAngle += 0.35;
        const count = 7;
        for (let i = 0; i < count; i++) {
          const ang = this.sweepAngle + (i * (Math.PI * 2) / count);
          projectiles.push(
            new Projectile(
              this.x,
              this.y + 25,
              Math.cos(ang) * 4.8,
              Math.sin(ang) * 4.8,
              20,
              false,
              5,
              '#f43f5e',
              '#be123c'
            )
          );
        }

        // Direct laser aimed at player
        const aimAngle = Math.atan2(player.y - this.y, player.x - this.x);
        projectiles.push(
          new Projectile(
            this.x - 30,
            this.y + 20,
            Math.cos(aimAngle) * 7,
            Math.sin(aimAngle) * 7,
            24,
            false,
            6,
            '#e11d48',
            '#9f1239',
            true
          )
        );
        projectiles.push(
          new Projectile(
            this.x + 30,
            this.y + 20,
            Math.cos(aimAngle) * 7,
            Math.sin(aimAngle) * 7,
            24,
            false,
            6,
            '#e11d48',
            '#9f1239',
            true
          )
        );
      }
    }

    // Minion Spawn
    this.minionTimer += dt;
    if (this.minionTimer >= (this.phase === 2 ? 6 : 9)) {
      this.minionTimer = 0;
      if (onSpawnMinion) {
        onSpawnMinion(new DroneEnemy(this.x - 40, this.y + 20));
        onSpawnMinion(new DroneEnemy(this.x + 40, this.y + 20));
      }
    }

    // Boss reactor engine particles
    particles.push(
      new Particle(
        this.x + (Math.random() * 40 - 20),
        this.y - 30,
        (Math.random() * 2 - 1),
        -3,
        this.phase === 2 ? '#ef4444' : '#a855f7',
        Math.random() * 4 + 2,
        0.3
      )
    );

    return true;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const glowColor = this.phase === 2 ? '#ef4444' : '#a855f7';
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 20;

    // Heavy Dreadnought wings
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, 48);          // Bottom front beak
    ctx.lineTo(44, 15);
    ctx.lineTo(60, -25);        // Outer right fin
    ctx.lineTo(30, -38);
    ctx.lineTo(15, -28);
    ctx.lineTo(-15, -28);
    ctx.lineTo(-30, -38);
    ctx.lineTo(-60, -25);       // Outer left fin
    ctx.lineTo(-44, 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Armor plating
    ctx.fillStyle = '#312e81';
    ctx.beginPath();
    ctx.moveTo(0, 36);
    ctx.lineTo(28, 6);
    ctx.lineTo(20, -18);
    ctx.lineTo(-20, -18);
    ctx.lineTo(-28, 6);
    ctx.closePath();
    ctx.fill();

    // Pulsing central plasma core
    const coreScale = 1 + Math.sin(this.pulseCore) * 0.2;
    ctx.fillStyle = this.phase === 2 ? '#f87171' : '#c084fc';
    ctx.beginPath();
    ctx.arc(0, 0, 14 * coreScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Turrets left & right
    ctx.fillStyle = '#475569';
    ctx.fillRect(-45, 10, 8, 16);
    ctx.fillRect(37, 10, 8, 16);

    ctx.restore();
  }
}
