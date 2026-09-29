export class Particle {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public color: string;
  public size: number;
  public life: number;
  public maxLife: number;
  public alpha: number = 1;
  public decay: number;
  public shape: 'circle' | 'square' | 'line' = 'circle';
  public length: number = 0;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size: number,
    maxLife: number,
    shape: 'circle' | 'square' | 'line' = 'circle'
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.maxLife = maxLife;
    this.life = maxLife;
    this.decay = 1 / maxLife;
    this.shape = shape;
  }

  public update(dt: number): boolean {
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.life -= dt;
    this.alpha = Math.max(0, this.life / this.maxLife);
    return this.life > 0;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;

    if (this.shape === 'line') {
      ctx.lineWidth = this.size;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
      ctx.stroke();
    } else if (this.shape === 'square') {
      ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export class FloatingText {
  public x: number;
  public y: number;
  public text: string;
  public color: string;
  public size: number;
  public life: number;
  public maxLife: number;
  public vy: number;

  constructor(x: number, y: number, text: string, color: string = '#38bdf8', size: number = 14) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.size = size;
    this.life = 1.0;
    this.maxLife = 1.0;
    this.vy = -1.2;
  }

  public update(dt: number): boolean {
    this.y += this.vy * dt * 60;
    this.life -= dt;
    return this.life > 0;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${this.size}px 'Chakra Petch', sans-serif`;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

export class Shockwave {
  public x: number;
  public y: number;
  public radius: number = 5;
  public maxRadius: number;
  public color: string;
  public lineWidth: number;
  public life: number = 1.0;
  public speed: number;

  constructor(x: number, y: number, maxRadius: number, color: string = '#38bdf8', speed: number = 300) {
    this.x = x;
    this.y = y;
    this.maxRadius = maxRadius;
    this.color = color;
    this.speed = speed;
    this.lineWidth = 4;
  }

  public update(dt: number): boolean {
    this.radius += this.speed * dt;
    this.life = 1 - (this.radius / this.maxRadius);
    return this.radius < this.maxRadius;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth * this.life;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  twinkle: number;
}

export class Starfield {
  private stars: Star[] = [];
  private width: number = 800;
  private height: number = 600;
  public speedMultiplier: number = 1.0;

  constructor(width: number, height: number, count: number = 120) {
    this.resize(width, height);
    this.init(count);
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  private init(count: number) {
    this.stars = [];
    const colors = ['#ffffff', '#bae6fd', '#fbcfe8', '#fde047', '#a5f3fc'];
    for (let i = 0; i < count; i++) {
      const speedTier = Math.random();
      let speed = 0.5;
      let size = 1;

      if (speedTier > 0.85) {
        speed = 3.5;
        size = 2.2;
      } else if (speedTier > 0.5) {
        speed = 1.8;
        size = 1.6;
      } else {
        speed = 0.7;
        size = 1.0;
      }

      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size,
        speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  public update(dt: number) {
    const warp = this.speedMultiplier;
    for (const star of this.stars) {
      star.y += star.speed * warp * dt * 60;
      star.twinkle += 0.05;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const star of this.stars) {
      const alpha = 0.4 + 0.6 * Math.sin(star.twinkle);
      ctx.globalAlpha = Math.max(0.2, alpha);
      ctx.fillStyle = star.color;

      if (this.speedMultiplier > 1.8) {
        // Warp streak
        const streakLen = star.speed * (this.speedMultiplier * 2.5);
        ctx.strokeStyle = star.color;
        ctx.lineWidth = star.size * 0.8;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x, star.y - streakLen);
        ctx.stroke();
      } else {
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }
    }
    ctx.restore();
  }
}

export class ScreenShake {
  public intensity: number = 0;
  public duration: number = 0;
  public offsetX: number = 0;
  public offsetY: number = 0;
  public multiplier: number = 1; // global intensity setting (0-2)

  public trigger(intensity: number, duration: number) {
    this.intensity = Math.max(this.intensity, intensity * this.multiplier);
    this.duration = Math.max(this.duration, duration);
  }

  public update(dt: number) {
    if (this.duration > 0) {
      this.duration -= dt;
      const progress = Math.max(0, this.duration);
      const mag = this.intensity * (progress / (this.duration + dt));
      this.offsetX = (Math.random() * 2 - 1) * mag;
      this.offsetY = (Math.random() * 2 - 1) * mag;
      if (this.duration <= 0) {
        this.offsetX = 0;
        this.offsetY = 0;
        this.intensity = 0;
      }
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }
}
