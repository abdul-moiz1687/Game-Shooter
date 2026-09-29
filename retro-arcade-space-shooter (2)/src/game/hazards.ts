import { Particle } from './particles';
import { Player } from './entities';

export interface HazardBounds {
  width: number;
  height: number;
}

export abstract class Hazard {
  public x: number;
  public y: number;
  public alive: boolean = true;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public abstract update(dt: number, player: Player, particles: Particle[], bounds: HazardBounds): boolean;
  public abstract draw(ctx: CanvasRenderingContext2D): void;
  // Damage dealt to player on contact per second / event (handled per hazard)
}

// 1. Moving Asteroid - drifts diagonally, rotates, damages on collision, can be shot
export class Asteroid extends Hazard {
  public vx: number;
  public vy: number;
  public radius: number;
  public health: number;
  public maxHealth: number;
  public rotation: number = 0;
  public rotationSpeed: number;
  public verts: { angle: number; r: number }[] = [];
  public color: string = '#78716c';

  constructor(x: number, y: number, radius: number, speedMultiplier: number = 1) {
    super(x, y);
    this.radius = radius;
    this.health = radius * 2.2;
    this.maxHealth = this.health;
    this.vx = (Math.random() * 2 - 1) * 1.2 * speedMultiplier;
    this.vy = (1.0 + Math.random() * 1.4) * speedMultiplier;
    this.rotationSpeed = (Math.random() * 2 - 1) * 0.04;

    // Generate craggy silhouette
    const count = 9 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      this.verts.push({
        angle: (i / count) * Math.PI * 2,
        r: this.radius * (0.72 + Math.random() * 0.4)
      });
    }
  }

  public takeDamage(dmg: number): boolean {
    this.health -= dmg;
    if (this.health <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  public update(dt: number, _player: Player, _particles: Particle[], bounds: HazardBounds): boolean {
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.rotation += this.rotationSpeed * dt * 60;

    // Bounce horizontally off edges
    if (this.x < this.radius && this.vx < 0) this.vx *= -1;
    if (this.x > bounds.width - this.radius && this.vx > 0) this.vx *= -1;

    return this.y < bounds.height + this.radius + 40;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.shadowColor = '#292524';
    ctx.shadowBlur = 8;

    const grad = ctx.createRadialGradient(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.2, 0, 0, this.radius);
    grad.addColorStop(0, '#a8a29e');
    grad.addColorStop(0.6, '#78716c');
    grad.addColorStop(1, '#44403c');
    ctx.fillStyle = grad;

    ctx.beginPath();
    this.verts.forEach((v, i) => {
      const px = Math.cos(v.angle) * v.r;
      const py = Math.sin(v.angle) * v.r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#57534e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Craters
    ctx.fillStyle = 'rgba(41,37,36,0.6)';
    ctx.beginPath();
    ctx.arc(this.radius * 0.2, -this.radius * 0.25, this.radius * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-this.radius * 0.3, this.radius * 0.2, this.radius * 0.16, 0, Math.PI * 2);
    ctx.fill();

    // Damage crack overlay
    if (this.health < this.maxHealth * 0.5) {
      ctx.strokeStyle = 'rgba(251,146,60,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-this.radius * 0.5, -this.radius * 0.3);
      ctx.lineTo(0, 0);
      ctx.lineTo(this.radius * 0.4, this.radius * 0.5);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// 2. Black Hole - stationary(ish), pulls the player + projectiles with gravity, damages if too close
export class BlackHole extends Hazard {
  public radius: number = 22;      // event horizon (deadly zone)
  public pullRadius: number = 220; // gravity influence radius
  public strength: number;
  public life: number;             // seconds until it collapses
  public maxLife: number;
  public rotation: number = 0;
  public vy: number;

  constructor(x: number, y: number, strength: number = 1) {
    super(x, y);
    this.strength = strength;
    this.maxLife = 12 + Math.random() * 6;
    this.life = this.maxLife;
    this.vy = 0.35;
  }

  public update(dt: number, player: Player, particles: Particle[], bounds: HazardBounds): boolean {
    this.life -= dt;
    this.rotation += dt * 2.2;
    this.y += this.vy * dt * 60;

    // Apply gravitational pull to player
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.pullRadius && dist > 0.1) {
      const falloff = 1 - dist / this.pullRadius;
      const force = falloff * falloff * this.strength * 3.2;
      const nx = dx / dist;
      const ny = dy / dist;
      player.x += nx * force * dt * 60;
      player.y += ny * force * dt * 60;
    }

    // Accretion disk particles being sucked in
    if (Math.random() < 0.7) {
      const a = Math.random() * Math.PI * 2;
      const r = this.pullRadius * (0.4 + Math.random() * 0.5);
      const px = this.x + Math.cos(a) * r;
      const py = this.y + Math.sin(a) * r;
      const toCenter = Math.atan2(this.y - py, this.x - px);
      const colors = ['#a855f7', '#7c3aed', '#c084fc', '#f0abfc'];
      particles.push(
        new Particle(
          px, py,
          Math.cos(toCenter) * 3.5,
          Math.sin(toCenter) * 3.5,
          colors[Math.floor(Math.random() * colors.length)],
          2 + Math.random() * 2,
          0.4
        )
      );
    }

    if (this.y > bounds.height + 100) return false;
    return this.life > 0;
  }

  // Returns true if player is inside deadly event horizon
  public isDeadly(player: Player): boolean {
    const dist = Math.hypot(this.x - player.x, this.y - player.y);
    return dist < this.radius + player.radius * 0.5;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const fade = Math.min(1, this.life / 2); // fade out as it collapses

    // Outer gravity glow ring
    const outerGrad = ctx.createRadialGradient(0, 0, this.radius, 0, 0, this.pullRadius);
    outerGrad.addColorStop(0, `rgba(168,85,247,${0.25 * fade})`);
    outerGrad.addColorStop(0.5, `rgba(124,58,237,${0.08 * fade})`);
    outerGrad.addColorStop(1, 'rgba(124,58,237,0)');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, this.pullRadius, 0, Math.PI * 2);
    ctx.fill();

    // Spinning accretion disk
    ctx.rotate(this.rotation);
    ctx.strokeStyle = `rgba(217,70,239,${0.7 * fade})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = '#d946ef';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius + 16, this.radius + 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(147,51,234,${0.5 * fade})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius + 28, this.radius + 10, 0.6, 0, Math.PI * 2);
    ctx.stroke();

    // Event horizon (pure black core)
    ctx.rotate(-this.rotation);
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#a855f7';
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(240,171,252,${0.9 * fade})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}

// 3. Laser Barrier - horizontal energy wall that pulses on/off periodically
export class LaserBarrier extends Hazard {
  public width: number;
  public thickness: number = 8;
  public cycleTime: number;   // total on+off cycle
  public onDuration: number;
  public phase: number;       // current time in cycle
  public isOn: boolean = false;
  public vy: number;
  public color: string = '#ef4444';
  public warnTime: number = 0.8; // warning flash before activating

  constructor(x: number, y: number, width: number, driftSpeed: number = 0.25) {
    super(x, y);
    this.width = width;
    this.cycleTime = 2.6 + Math.random() * 1.2;
    this.onDuration = 1.1;
    this.phase = Math.random() * this.cycleTime;
    this.vy = driftSpeed;
  }

  public update(dt: number, _player: Player, _particles: Particle[], bounds: HazardBounds): boolean {
    this.phase = (this.phase + dt) % this.cycleTime;
    this.isOn = this.phase < this.onDuration;
    this.y += this.vy * dt * 60;
    return this.y < bounds.height + 60;
  }

  // Warning state (about to turn on)
  public get isWarning(): boolean {
    const timeToOn = this.phase > this.onDuration
      ? this.cycleTime - this.phase
      : -1;
    return !this.isOn && timeToOn >= 0 && timeToOn < this.warnTime;
  }

  // Check collision with player
  public hitsPlayer(player: Player): boolean {
    if (!this.isOn) return false;
    const withinX = player.x > this.x - 4 && player.x < this.x + this.width + 4;
    const withinY = Math.abs(player.y - this.y) < this.thickness / 2 + player.radius * 0.6;
    return withinX && withinY;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Emitter nodes at both ends
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = this.isOn ? '#f87171' : '#64748b';
    ctx.lineWidth = 2;
    [this.x, this.x + this.width].forEach((ex) => {
      ctx.beginPath();
      ctx.roundRect(ex - 7, this.y - 11, 14, 22, 3);
      ctx.fill();
      ctx.stroke();
    });

    if (this.isOn) {
      // Active laser beam
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 16;
      const grad = ctx.createLinearGradient(0, this.y - this.thickness, 0, this.y + this.thickness);
      grad.addColorStop(0, 'rgba(239,68,68,0.1)');
      grad.addColorStop(0.5, '#fca5a5');
      grad.addColorStop(1, 'rgba(239,68,68,0.1)');
      ctx.fillStyle = grad;
      ctx.fillRect(this.x, this.y - this.thickness / 2, this.width, this.thickness);

      // Bright core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x, this.y - 1.5, this.width, 3);
    } else if (this.isWarning) {
      // Dashed warning telegraph
      ctx.strokeStyle = `rgba(248,113,113,${0.4 + Math.sin(Date.now() / 60) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.width, this.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }
}
