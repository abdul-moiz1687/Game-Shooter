// Web Audio API Retro Arcade Synthesizer
// Zero external audio files required - instant zero-latency 8-bit/synthwave audio

class SoundEngine {
  private ctx: AudioContext | null = null;
  public sfxEnabled: boolean = true;
  public musicEnabled: boolean = true;
  public sfxVolume: number = 0.7;
  public musicVolume: number = 0.4;

  private musicInterval: number | null = null;
  private musicStep: number = 0;
  private musicTempo: number = 130; // BPM

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public enableAudio() {
    this.initContext();
    if (this.musicEnabled && !this.musicInterval) {
      this.startMusic();
    }
  }

  // Laser shot (single)
  public playLaser() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Triple / Upgraded Laser
  public playTripleLaser() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [1050, 780, 520];

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const offset = idx * 0.015;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + offset);
      osc.frequency.exponentialRampToValueAtTime(120, now + offset + 0.14);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.15);
    });
  }

  // Enemy hit chirp
  public playHit() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Small Explosion (Enemy Drone Destroyed)
  public playExplosionSmall() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 0.24);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // Large Explosion (Boss / Player)
  public playExplosionLarge() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.7;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + 0.65);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.68);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    // Sub-bass thump
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
    oscGain.gain.setValueAtTime(0.6 * this.sfxVolume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    noise.start(now);
    osc.start(now);
    osc.stop(now + 0.55);
  }

  // EMP Blast: Sub-bass resonance and wide electronic shockwave
  public playEMP() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // High-to-low sweeping oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.8);

    // Distortion filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(4, now);

    gain.gain.setValueAtTime(0.7 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.95);

    // White noise ripple
    const bufSize = this.ctx.sampleRate * 0.8;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.5 * this.sfxVolume, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    noise.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Power-up pickup chime
  public playPowerUp() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  // Player damaged sound
  public playPlayerHit() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.25);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // Boss Siren Warning
  public playBossWarning() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.25);
    osc.frequency.linearRampToValueAtTime(440, now + 0.5);
    osc.frequency.linearRampToValueAtTime(880, now + 0.75);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.85);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.9);
  }

  // Procedural 80s Synthwave Bassline & Arpeggiator
  public startMusic() {
    if (this.musicInterval) return;
    this.initContext();
    
    // 16-step synthwave progression
    // Chord progression: Am -> F -> C -> G
    const bassNotes = [
      110, 110, 220, 110,  // A2
      87.31, 87.31, 174.61, 87.31, // F2
      130.81, 130.81, 261.63, 130.81, // C3
      98, 98, 196, 98 // G2
    ];

    const leadNotes = [
      440, 523.25, 659.25, 880,
      349.23, 440, 523.25, 698.46,
      523.25, 659.25, 783.99, 1046.5,
      392, 493.88, 587.33, 783.99
    ];

    const stepDurationMs = (60 / this.musicTempo / 4) * 1000;

    this.musicInterval = window.setInterval(() => {
      if (!this.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;
      
      const now = this.ctx.currentTime;
      const step = this.musicStep % 16;
      this.musicStep++;

      // Bass synth
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      const bassFilter = this.ctx.createBiquadFilter();

      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassNotes[step], now);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(450, now);
      bassFilter.Q.setValueAtTime(3, now);

      bassGain.gain.setValueAtTime(0.18 * this.musicVolume, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + (stepDurationMs / 1000) * 0.9);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.ctx.destination);

      bassOsc.start(now);
      bassOsc.stop(now + (stepDurationMs / 1000));

      // Occasional lead arpeggio or percussion hi-hat
      if (step % 2 === 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'triangle';
        leadOsc.frequency.setValueAtTime(leadNotes[step], now);

        leadGain.gain.setValueAtTime(0.07 * this.musicVolume, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + (stepDurationMs / 1000) * 0.8);

        leadOsc.connect(leadGain);
        leadGain.connect(this.ctx.destination);

        leadOsc.start(now);
        leadOsc.stop(now + (stepDurationMs / 1000));
      }
    }, stepDurationMs);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startMusic();
    }
    return this.musicEnabled;
  }

  public toggleSFX(): boolean {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
  }

  public setSFXVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
  }
}

export const soundEngine = new SoundEngine();
