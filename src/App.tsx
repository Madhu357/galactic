/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Tv, Trophy, Shield, Gamepad2, Info } from 'lucide-react';

// --- PIXEL SPRITE MATRICES ---
// 1 = solid pixel, 0 = transparent
const SPRITES = {
  // Top Row (Saucer / Squid Invader) - 8x8
  alienTop: {
    width: 8,
    height: 8,
    frame0: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0, 1, 0, 0],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [1, 0, 1, 0, 0, 1, 0, 1],
    ],
    frame1: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [0, 1, 0, 0, 0, 0, 1, 0],
    ],
  },
  // Middle Rows (Crab Invader) - 11x8
  alienMid: {
    width: 11,
    height: 8,
    frame0: [
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
      [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
    ],
    frame1: [
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
      [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    ],
  },
  // Bottom Rows (Jelly / Octopus Invader) - 12x8
  alienBot: {
    width: 12,
    height: 8,
    frame0: [
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    ],
    frame1: [
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0],
      [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
    ],
  },
  // Mystery UFO / Mothership - 16x7
  ufo: {
    width: 16,
    height: 7,
    matrix: [
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    ],
  },
  // Player Tank / Starfighter - 13x8
  player: {
    width: 13,
    height: 8,
    matrix: [
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0],
      [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    ],
  },
};

// Retro Color Palette
const COLORS = {
  player: '#00ffcc', // Cyan neon
  alienTop: '#ff3366', // Hot pink / Magenta (30 pts)
  alienMid: '#ffaa00', // Amber orange (20 pts)
  alienBot: '#33ff33', // Arcade lime green (10 pts)
  ufo: '#ff0033', // Crimson red
  playerLaser: '#00ffff', // Laser cyan
  enemyLaser: '#ff2255', // Hostile red
  bunker: '#22dd66', // Classic shield green
  bunkerDamaged: '#1a9947',
  explosion: ['#ffff55', '#ff9900', '#ff2200', '#ffffff', '#00ffff'],
};

// Sound Synthesizer using Web Audio API
class RetroAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private marchIndex: number = 0;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playLaser() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playAlienExplosion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.18);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.19);
  }

  public playPlayerExplosion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Deep crunchy noise + low pitch oscillator
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

    noise.connect(gain);
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.6);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  public playBunkerHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playMarch() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const marchNotes = [105, 98, 92.5, 87.3]; // G2, F#2, F2, E2 (Space Invaders iconic 4-step)
    const freq = marchNotes[this.marchIndex % marchNotes.length];
    this.marchIndex++;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.075);
  }

  public playUfoSiren() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(580, now + 0.08);
    osc.frequency.linearRampToValueAtTime(440, now + 0.16);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playWaveFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx!.currentTime + idx * 0.1;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    });
  }

  public playGameOverSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const notes = [440, 392, 349.23, 293.66, 220];
    notes.forEach((freq, idx) => {
      const now = this.ctx!.currentTime + idx * 0.16;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    });
  }
}

// Global audio instance
const audio = new RetroAudio();

// Types
interface Invader {
  x: number;
  y: number;
  width: number;
  height: number;
  row: number;
  col: number;
  alive: boolean;
  scoreValue: number;
  color: string;
  type: 'top' | 'mid' | 'bot';
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isPlayer: boolean;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface FloatingScore {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
}

interface Bunker {
  x: number;
  y: number;
  width: number;
  height: number;
  cols: number;
  rows: number;
  blockSize: number;
  grid: Uint8Array; // 1 = solid, 0 = destroyed
}

// Main Component
export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // React State for HUD & UI Controls
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('space_invaders_high_score') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [lives, setLives] = useState<number>(3);
  const [wave, setWave] = useState<number>(1);
  const [gameState, setGameState] = useState<'TITLE' | 'PLAYING' | 'PAUSED' | 'WAVE_CLEAR' | 'GAME_OVER'>('TITLE');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [crtFilter, setCrtFilter] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Virtual Canvas coordinate space
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 850;

  // Mutable Game Loop State References (no React re-render lag)
  const gameRef = useRef({
    state: 'TITLE' as 'TITLE' | 'PLAYING' | 'PAUSED' | 'WAVE_CLEAR' | 'GAME_OVER',
    score: 0,
    highScore: 0,
    lives: 3,
    wave: 1,

    // Player
    player: {
      x: 375,
      y: 770,
      width: 48,
      height: 30,
      speed: 6.2,
      cooldown: 0,
      invulnerableTimer: 0,
      respawning: false,
    },

    // Keyboard keys
    keys: {
      left: false,
      right: false,
      fire: false,
    },

    // Touch controls
    touch: {
      left: false,
      right: false,
      fire: false,
    },

    // Invader formation
    invaders: [] as Invader[],
    fleetDirection: 1, // 1 = right, -1 = left
    fleetStepTimer: 0,
    fleetStepInterval: 45, // frames between horizontal steps
    alienFrame: 0,
    fleetDropDistance: 18,
    fleetBaseline: 740, // game over threshold

    // UFO / Mothership
    ufo: null as { x: number; y: number; width: number; height: number; speed: number; score: number } | null,
    ufoSpawnTimer: 900, // ~15 seconds

    // Projectiles & Entities
    bullets: [] as Bullet[],
    particles: [] as Particle[],
    floatingScores: [] as FloatingScore[],
    bunkers: [] as Bunker[],
    stars: [] as Star[],

    // Screen Shake
    shakeTimer: 0,
    shakeIntensity: 0,

    // Timers
    waveClearTimer: 0,
    gameOverTimer: 0,
  });

  // Keep ref high score in sync
  useEffect(() => {
    gameRef.current.highScore = highScore;
  }, [highScore]);

  // Audio mute toggle
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      audio.enabled = !next;
      return next;
    });
  }, []);

  // Helper: Create destructible bunkers
  const createBunkers = useCallback((): Bunker[] => {
    const bunkers: Bunker[] = [];
    const count = 4;
    const bunkerWidth = 88;
    const bunkerHeight = 64;
    const cols = 22;
    const rows = 16;
    const blockSize = bunkerWidth / cols; // 4px per block
    const spacing = (CANVAS_WIDTH - count * bunkerWidth) / (count + 1);
    const startY = 660;

    for (let b = 0; b < count; b++) {
      const bx = spacing + b * (bunkerWidth + spacing);
      const grid = new Uint8Array(cols * rows);

      // Carve traditional arcade bunker shape
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let solid = 1;

          // Top rounded corners (cut 3 corners on top left and right)
          if (r === 0 && (c < 4 || c >= cols - 4)) solid = 0;
          if (r === 1 && (c < 2 || c >= cols - 2)) solid = 0;
          if (r === 2 && (c < 1 || c >= cols - 1)) solid = 0;

          // Bottom archway cutout
          if (r >= 9 && c >= 6 && c <= cols - 7) {
            // Rounded arch roof
            if (r === 9 && (c === 6 || c === cols - 7)) solid = 1;
            else solid = 0;
          }

          grid[r * cols + c] = solid;
        }
      }

      bunkers.push({
        x: bx,
        y: startY,
        width: bunkerWidth,
        height: bunkerHeight,
        cols,
        rows,
        blockSize,
        grid,
      });
    }
    return bunkers;
  }, [CANVAS_WIDTH]);

  // Helper: Build Invader Fleet
  const buildInvaders = useCallback((waveNum: number): Invader[] => {
    const invaders: Invader[] = [];
    const rows = 5;
    const cols = 10;
    const invWidth = 40;
    const invHeight = 28;
    const gapX = 24;
    const gapY = 20;

    // Formation starts slightly lower on higher waves for challenge
    const startY = Math.min(100 + (waveNum - 1) * 16, 240);
    const formationWidth = cols * invWidth + (cols - 1) * gapX;
    const startX = (CANVAS_WIDTH - formationWidth) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let type: 'top' | 'mid' | 'bot' = 'bot';
        let scoreValue = 10;
        let color = COLORS.alienBot;

        if (r === 0) {
          type = 'top';
          scoreValue = 30;
          color = COLORS.alienTop;
        } else if (r === 1 || r === 2) {
          type = 'mid';
          scoreValue = 20;
          color = COLORS.alienMid;
        }

        invaders.push({
          x: startX + c * (invWidth + gapX),
          y: startY + r * (invHeight + gapY),
          width: invWidth,
          height: invHeight,
          row: r,
          col: c,
          alive: true,
          scoreValue,
          color,
          type,
        });
      }
    }
    return invaders;
  }, [CANVAS_WIDTH]);

  // Helper: Build Starfield
  const buildStars = useCallback((): Star[] => {
    const stars: Star[] = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() < 0.6 ? 1 : Math.random() < 0.85 ? 1.8 : 2.6,
        speed: 0.3 + Math.random() * 0.9,
        alpha: 0.3 + Math.random() * 0.7,
      });
    }
    return stars;
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Start / Restart Game
  const startGame = useCallback((resetAll: boolean = true) => {
    const g = gameRef.current;
    if (resetAll) {
      g.score = 0;
      g.lives = 3;
      g.wave = 1;
      setScore(0);
      setLives(3);
      setWave(1);
    }

    g.invaders = buildInvaders(g.wave);
    g.fleetDirection = 1;
    g.fleetStepInterval = Math.max(12, 46 - (g.wave - 1) * 4);
    g.fleetStepTimer = 0;
    g.alienFrame = 0;

    g.player.x = (CANVAS_WIDTH - g.player.width) / 2;
    g.player.invulnerableTimer = 120; // 2 seconds safety
    g.player.cooldown = 0;
    g.player.respawning = false;

    g.bullets = [];
    g.particles = [];
    g.floatingScores = [];
    g.ufo = null;
    g.ufoSpawnTimer = 600 + Math.random() * 400;

    if (resetAll || g.bunkers.length === 0) {
      g.bunkers = createBunkers();
    }

    g.state = 'PLAYING';
    setGameState('PLAYING');
  }, [CANVAS_WIDTH, buildInvaders, createBunkers]);

  // Advance to next wave
  const nextWave = useCallback(() => {
    const g = gameRef.current;
    g.wave += 1;
    setWave(g.wave);
    // Award 500 bonus points for wave clear
    g.score += 500;
    setScore(g.score);

    audio.playWaveFanfare();

    g.invaders = buildInvaders(g.wave);
    g.fleetDirection = 1;
    g.fleetStepInterval = Math.max(10, 44 - (g.wave - 1) * 3);
    g.fleetStepTimer = 0;
    g.alienFrame = 0;

    g.bullets = [];
    g.ufo = null;
    g.ufoSpawnTimer = 500 + Math.random() * 300;

    g.player.x = (CANVAS_WIDTH - g.player.width) / 2;
    g.player.invulnerableTimer = 90;

    // Partially repair bunkers
    g.bunkers = createBunkers();

    g.state = 'PLAYING';
    setGameState('PLAYING');
  }, [CANVAS_WIDTH, buildInvaders, createBunkers]);

  // Spawn particle explosion
  const spawnExplosion = useCallback((x: number, y: number, color: string, count: number = 18, speedMax: number = 4) => {
    const g = gameRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * speedMax;
      g.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() < 0.3 ? '#ffffff' : color,
        size: 1.5 + Math.random() * 3,
        life: 0,
        maxLife: 20 + Math.random() * 25,
      });
    }
  }, []);

  // Damage bunker at impact point with circular crater
  const damageBunker = useCallback((bunker: Bunker, hitX: number, hitY: number, blastRadius: number = 6) => {
    const localX = hitX - bunker.x;
    const localY = hitY - bunker.y;
    const hitCol = Math.floor(localX / bunker.blockSize);
    const hitRow = Math.floor(localY / bunker.blockSize);
    let hitBlocks = 0;

    for (let r = hitRow - blastRadius; r <= hitRow + blastRadius; r++) {
      for (let c = hitCol - blastRadius; c <= hitCol + blastRadius; c++) {
        if (r >= 0 && r < bunker.rows && c >= 0 && c < bunker.cols) {
          const distSq = (r - hitRow) * (r - hitRow) + (c - hitCol) * (c - hitCol);
          // Circular crater with irregular jagged edges
          if (distSq <= blastRadius * blastRadius + (Math.random() * 2 - 1)) {
            const idx = r * bunker.cols + c;
            if (bunker.grid[idx] === 1) {
              bunker.grid[idx] = 0;
              hitBlocks++;
            }
          }
        }
      }
    }

    if (hitBlocks > 0) {
      audio.playBunkerHit();
      // Little debris particles
      spawnExplosion(hitX, hitY, COLORS.bunker, 6, 2.5);
    }
  }, [spawnExplosion]);

  // Check collision between a bullet and bunkers
  const checkBunkerCollision = useCallback((bullet: Bullet, bunkers: Bunker[]): boolean => {
    for (const b of bunkers) {
      if (
        bullet.x + bullet.width >= b.x &&
        bullet.x <= b.x + b.width &&
        bullet.y + bullet.height >= b.y &&
        bullet.y <= b.y + b.height
      ) {
        const localX = bullet.x + bullet.width / 2 - b.x;
        const localY = (bullet.isPlayer ? bullet.y : bullet.y + bullet.height) - b.y;
        const col = Math.floor(localX / b.blockSize);
        const row = Math.floor(localY / b.blockSize);

        if (col >= 0 && col < b.cols && row >= 0 && row < b.rows) {
          const idx = row * b.cols + col;
          if (b.grid[idx] === 1) {
            damageBunker(b, bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 4);
            return true; // Bullet consumed
          }
        }
      }
    }
    return false;
  }, [damageBunker]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const g = gameRef.current;

      // Handle Full Game State Controls
      if (e.code === 'Space') {
        e.preventDefault();
        if (g.state === 'TITLE') {
          startGame(true);
        } else if (g.state === 'GAME_OVER') {
          startGame(true);
        } else if (g.state === 'PLAYING') {
          g.keys.fire = true;
        }
      }

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        g.keys.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        g.keys.right = true;
      }

      // Pause toggle
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (g.state === 'PLAYING') {
          g.state = 'PAUSED';
          setGameState('PAUSED');
        } else if (g.state === 'PAUSED') {
          g.state = 'PLAYING';
          setGameState('PLAYING');
        }
      }

      // Mute toggle
      if (e.code === 'KeyM') {
        toggleMute();
      }

      // CRT Scanline toggle
      if (e.code === 'KeyC') {
        setCrtFilter((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        g.keys.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        g.keys.right = false;
      }
      if (e.code === 'Space') {
        g.keys.fire = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startGame, toggleMute]);

  // Main 60fps Game Loop & Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Pixelated rendering
    ctx.imageSmoothingEnabled = false;

    // Initialize stars & bunkers
    const g = gameRef.current;
    g.stars = buildStars();
    g.bunkers = createBunkers();

    let animationFrameId: number;

    const render = () => {
      // 1. UPDATE GAME STATE
      if (g.state === 'PLAYING') {
        // Player Movement
        const moveLeft = g.keys.left || g.touch.left;
        const moveRight = g.keys.right || g.touch.right;
        const fire = g.keys.fire || g.touch.fire;

        if (moveLeft && !moveRight) {
          g.player.x = Math.max(20, g.player.x - g.player.speed);
        } else if (moveRight && !moveLeft) {
          g.player.x = Math.min(CANVAS_WIDTH - g.player.width - 20, g.player.x + g.player.speed);
        }

        // Player Laser Firing (Strict Cooldown)
        if (g.player.cooldown > 0) {
          g.player.cooldown--;
        }

        // Count active player bullets (maximum 2 simultaneous shots for authentic arcade cadence)
        const activePlayerBullets = g.bullets.filter((b) => b.isPlayer).length;
        if (fire && g.player.cooldown <= 0 && activePlayerBullets < 2) {
          g.bullets.push({
            x: g.player.x + g.player.width / 2 - 2,
            y: g.player.y - 6,
            vx: 0,
            vy: -9.5,
            width: 4,
            height: 14,
            isPlayer: true,
            color: COLORS.playerLaser,
          });
          audio.playLaser();
          g.player.cooldown = 14; // ~230ms cooldown
        }

        // Player invulnerability counter
        if (g.player.invulnerableTimer > 0) {
          g.player.invulnerableTimer--;
        }

        // Invader Fleet Movement Logic
        const aliveInvaders = g.invaders.filter((inv) => inv.alive);

        // Check Wave Clear
        if (aliveInvaders.length === 0) {
          g.state = 'WAVE_CLEAR';
          g.waveClearTimer = 110;
          setGameState('WAVE_CLEAR');
          audio.playWaveFanfare();
        } else {
          // Dynamic Speed Scaling: fleet steps faster as remaining count shrinks
          const totalInvaders = 50;
          const remainingRatio = aliveInvaders.length / totalInvaders;
          // Step interval from 45 frames down to 2 frames for the last alien!
          const minInterval = 2;
          const baseInterval = Math.max(14, 46 - (g.wave - 1) * 4);
          g.fleetStepInterval = Math.max(minInterval, Math.floor(minInterval + (baseInterval - minInterval) * Math.pow(remainingRatio, 1.2)));

          g.fleetStepTimer++;
          if (g.fleetStepTimer >= g.fleetStepInterval) {
            g.fleetStepTimer = 0;
            g.alienFrame = (g.alienFrame + 1) % 2;
            audio.playMarch();

            // Check if formation reaches left or right screen boundary
            let stepDown = false;
            const stepDistance = 12;

            for (const inv of aliveInvaders) {
              const nextX = inv.x + g.fleetDirection * stepDistance;
              if (nextX + inv.width >= CANVAS_WIDTH - 24 || nextX <= 24) {
                stepDown = true;
                break;
              }
            }

            if (stepDown) {
              g.fleetDirection *= -1;
              for (const inv of aliveInvaders) {
                inv.y += g.fleetDropDistance;
                // Game Over if invaders breach bunker baseline!
                if (inv.y + inv.height >= g.fleetBaseline) {
                  g.state = 'GAME_OVER';
                  setGameState('GAME_OVER');
                  audio.playGameOverSound();
                  break;
                }
              }
            } else {
              for (const inv of aliveInvaders) {
                inv.x += g.fleetDirection * stepDistance;
              }
            }
          }

          // Invader Missile Drop Mechanics
          // Bottom-most alien in a random active column drops a bomb
          const enemyBulletCount = g.bullets.filter((b) => !b.isPlayer).length;
          const maxEnemyBullets = Math.min(6, 2 + Math.floor(g.wave * 0.8));

          if (enemyBulletCount < maxEnemyBullets && Math.random() < 0.045 + g.wave * 0.008) {
            // Find active columns
            const colsMap = new Map<number, Invader>();
            for (const inv of aliveInvaders) {
              const currentLowest = colsMap.get(inv.col);
              if (!currentLowest || inv.row > currentLowest.row) {
                colsMap.set(inv.col, inv);
              }
            }

            const bottomShooters = Array.from(colsMap.values());
            if (bottomShooters.length > 0) {
              const shooter = bottomShooters[Math.floor(Math.random() * bottomShooters.length)];
              g.bullets.push({
                x: shooter.x + shooter.width / 2 - 2,
                y: shooter.y + shooter.height + 4,
                vx: (Math.random() - 0.5) * 0.6,
                vy: 4.2 + Math.min(2.5, g.wave * 0.4),
                width: 4,
                height: 12,
                isPlayer: false,
                color: COLORS.enemyLaser,
              });
            }
          }
        }

        // Mystery UFO / Mothership Logic
        if (!g.ufo) {
          g.ufoSpawnTimer--;
          if (g.ufoSpawnTimer <= 0) {
            const startFromLeft = Math.random() < 0.5;
            g.ufo = {
              x: startFromLeft ? -50 : CANVAS_WIDTH + 10,
              y: 54,
              width: 48,
              height: 22,
              speed: (startFromLeft ? 1 : -1) * (2.8 + Math.random() * 0.8),
              score: [50, 100, 150, 300][Math.floor(Math.random() * 4)],
            };
            audio.playUfoSiren();
          }
        } else {
          g.ufo.x += g.ufo.speed;
          // Loop siren periodically
          if (Math.random() < 0.03) {
            audio.playUfoSiren();
          }
          // Remove if off screen
          if ((g.ufo.speed > 0 && g.ufo.x > CANVAS_WIDTH + 60) || (g.ufo.speed < 0 && g.ufo.x < -70)) {
            g.ufo = null;
            g.ufoSpawnTimer = 1100 + Math.random() * 600;
          }
        }

        // Update Projectiles & Check Collisions
        for (let i = g.bullets.length - 1; i >= 0; i--) {
          const bullet = g.bullets[i];
          bullet.x += bullet.vx;
          bullet.y += bullet.vy;

          // Screen boundary removal
          if (bullet.y < -20 || bullet.y > CANVAS_HEIGHT + 20) {
            g.bullets.splice(i, 1);
            continue;
          }

          // Check Bunker Collision
          if (checkBunkerCollision(bullet, g.bunkers)) {
            g.bullets.splice(i, 1);
            continue;
          }

          // Player Laser vs Invaders
          if (bullet.isPlayer) {
            let hit = false;

            // Hit UFO?
            if (
              g.ufo &&
              bullet.x + bullet.width >= g.ufo.x &&
              bullet.x <= g.ufo.x + g.ufo.width &&
              bullet.y + bullet.height >= g.ufo.y &&
              bullet.y <= g.ufo.y + g.ufo.height
            ) {
              const ufoScore = g.ufo.score;
              g.score += ufoScore;
              setScore(g.score);

              // Update High Score
              if (g.score > g.highScore) {
                g.highScore = g.score;
                setHighScore(g.highScore);
                try {
                  localStorage.setItem('space_invaders_high_score', g.highScore.toString());
                } catch {
                  // ignore
                }
              }

              spawnExplosion(g.ufo.x + g.ufo.width / 2, g.ufo.y + g.ufo.height / 2, COLORS.ufo, 35, 6);
              audio.playAlienExplosion();

              g.floatingScores.push({
                x: g.ufo.x + 10,
                y: g.ufo.y,
                text: `+${ufoScore}`,
                color: '#ff3344',
                life: 0,
                maxLife: 60,
              });

              g.ufo = null;
              g.ufoSpawnTimer = 1200 + Math.random() * 500;
              g.bullets.splice(i, 1);
              continue;
            }

            // Hit Fleet Aliens?
            for (const inv of aliveInvaders) {
              if (
                bullet.x + bullet.width >= inv.x &&
                bullet.x <= inv.x + inv.width &&
                bullet.y + bullet.height >= inv.y &&
                bullet.y <= inv.y + inv.height
              ) {
                inv.alive = false;
                g.score += inv.scoreValue;
                setScore(g.score);

                // Update High Score
                if (g.score > g.highScore) {
                  g.highScore = g.score;
                  setHighScore(g.highScore);
                  try {
                    localStorage.setItem('space_invaders_high_score', g.highScore.toString());
                  } catch {
                    // ignore
                  }
                }

                spawnExplosion(inv.x + inv.width / 2, inv.y + inv.height / 2, inv.color, 20, 4);
                audio.playAlienExplosion();

                g.floatingScores.push({
                  x: inv.x,
                  y: inv.y,
                  text: `+${inv.scoreValue}`,
                  color: inv.color,
                  life: 0,
                  maxLife: 40,
                });

                hit = true;
                break;
              }
            }

            if (hit) {
              g.bullets.splice(i, 1);
              continue;
            }

            // Bullets colliding with each other (laser intercept)
            for (let j = g.bullets.length - 1; j >= 0; j--) {
              const other = g.bullets[j];
              if (!other.isPlayer) {
                const dx = Math.abs(bullet.x - other.x);
                const dy = Math.abs(bullet.y - other.y);
                if (dx < 8 && dy < 10) {
                  spawnExplosion(bullet.x, bullet.y, '#ffffff', 8, 2);
                  g.bullets.splice(Math.max(i, j), 1);
                  g.bullets.splice(Math.min(i, j), 1);
                  hit = true;
                  break;
                }
              }
            }
            if (hit) continue;
          } else {
            // Enemy Bomb vs Player
            if (
              g.player.invulnerableTimer <= 0 &&
              bullet.x + bullet.width >= g.player.x + 4 &&
              bullet.x <= g.player.x + g.player.width - 4 &&
              bullet.y + bullet.height >= g.player.y + 4 &&
              bullet.y <= g.player.y + g.player.height
            ) {
              // Player Hit!
              g.lives--;
              setLives(g.lives);
              audio.playPlayerExplosion();
              spawnExplosion(g.player.x + g.player.width / 2, g.player.y + g.player.height / 2, COLORS.player, 40, 7);

              // Screen Shake trigger
              g.shakeIntensity = 14;
              g.shakeTimer = 24;

              g.bullets.splice(i, 1);

              if (g.lives <= 0) {
                g.state = 'GAME_OVER';
                setGameState('GAME_OVER');
                audio.playGameOverSound();
              } else {
                // Reset player position with safety grace period
                g.player.x = (CANVAS_WIDTH - g.player.width) / 2;
                g.player.invulnerableTimer = 120;
              }
              continue;
            }
          }
        }
      }

      // Handle Wave Clear State transition
      if (g.state === 'WAVE_CLEAR') {
        g.waveClearTimer--;
        if (g.waveClearTimer <= 0) {
          nextWave();
        }
      }

      // 2. UPDATE PARTICLES & FLOATING TEXTS
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life >= p.maxLife) {
          g.particles.splice(i, 1);
        }
      }

      for (let i = g.floatingScores.length - 1; i >= 0; i--) {
        const fs = g.floatingScores[i];
        fs.y -= 0.6;
        fs.life++;
        if (fs.life >= fs.maxLife) {
          g.floatingScores.splice(i, 1);
        }
      }

      // Update Starfield
      const starSpeedMultiplier = g.state === 'WAVE_CLEAR' ? 6 : 1;
      for (const s of g.stars) {
        s.y += s.speed * starSpeedMultiplier;
        if (s.y > CANVAS_HEIGHT) {
          s.y = 0;
          s.x = Math.random() * CANVAS_WIDTH;
        }
      }

      // Update Screen Shake
      let offsetX = 0;
      let offsetY = 0;
      if (g.shakeTimer > 0) {
        g.shakeTimer--;
        const damp = g.shakeTimer / 24;
        offsetX = (Math.random() * 2 - 1) * g.shakeIntensity * damp;
        offsetY = (Math.random() * 2 - 1) * g.shakeIntensity * damp;
      }

      // 3. CANVAS DRAWING
      ctx.save();
      ctx.translate(offsetX, offsetY);

      // Deep Space background
      ctx.fillStyle = '#06060c';
      ctx.fillRect(-20, -20, CANVAS_WIDTH + 40, CANVAS_HEIGHT + 40);

      // Draw Parallax Starfield
      for (const s of g.stars) {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        if (s.size > 2) {
          // Subtle twinkle/colored star
          ctx.fillStyle = `rgba(180, 220, 255, ${s.alpha * 0.9})`;
        }
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }

      // Draw Destructible Bunkers
      for (const b of g.bunkers) {
        ctx.fillStyle = COLORS.bunker;
        for (let r = 0; r < b.rows; r++) {
          for (let c = 0; c < b.cols; c++) {
            if (b.grid[r * b.cols + c] === 1) {
              ctx.fillRect(
                b.x + c * b.blockSize,
                b.y + r * b.blockSize,
                b.blockSize,
                b.blockSize
              );
            }
          }
        }
      }

      // Draw Invaders
      const frameIdx = g.alienFrame;
      for (const inv of g.invaders) {
        if (!inv.alive) continue;

        let spriteDef;
        let matrix: number[][];

        if (inv.type === 'top') {
          spriteDef = SPRITES.alienTop;
          matrix = frameIdx === 0 ? spriteDef.frame0 : spriteDef.frame1;
        } else if (inv.type === 'mid') {
          spriteDef = SPRITES.alienMid;
          matrix = frameIdx === 0 ? spriteDef.frame0 : spriteDef.frame1;
        } else {
          spriteDef = SPRITES.alienBot;
          matrix = frameIdx === 0 ? spriteDef.frame0 : spriteDef.frame1;
        }

        const pixelW = inv.width / spriteDef.width;
        const pixelH = inv.height / spriteDef.height;

        ctx.fillStyle = inv.color;
        for (let r = 0; r < spriteDef.height; r++) {
          for (let c = 0; c < spriteDef.width; c++) {
            if (matrix[r][c] === 1) {
              ctx.fillRect(
                Math.round(inv.x + c * pixelW),
                Math.round(inv.y + r * pixelH),
                Math.ceil(pixelW),
                Math.ceil(pixelH)
              );
            }
          }
        }
      }

      // Draw Mystery UFO / Mothership
      if (g.ufo) {
        const ufoMat = SPRITES.ufo.matrix;
        const pw = g.ufo.width / SPRITES.ufo.width;
        const ph = g.ufo.height / SPRITES.ufo.height;

        ctx.fillStyle = COLORS.ufo;
        for (let r = 0; r < SPRITES.ufo.height; r++) {
          for (let c = 0; c < SPRITES.ufo.width; c++) {
            if (ufoMat[r][c] === 1) {
              // Accentuate lights
              if (r === 3 && (c === 3 || c === 6 || c === 9 || c === 12)) {
                ctx.fillStyle = '#ffff66';
              } else {
                ctx.fillStyle = COLORS.ufo;
              }
              ctx.fillRect(
                Math.round(g.ufo.x + c * pw),
                Math.round(g.ufo.y + r * ph),
                Math.ceil(pw),
                Math.ceil(ph)
              );
            }
          }
        }
      }

      // Draw Player Ship (with blink effect during invulnerability)
      if (g.state === 'PLAYING' || g.state === 'WAVE_CLEAR') {
        const isBlinking = g.player.invulnerableTimer > 0 && Math.floor(g.player.invulnerableTimer / 4) % 2 === 0;
        if (!isBlinking) {
          const pMat = SPRITES.player.matrix;
          const pw = g.player.width / SPRITES.player.width;
          const ph = g.player.height / SPRITES.player.height;

          for (let r = 0; r < SPRITES.player.height; r++) {
            for (let c = 0; c < SPRITES.player.width; c++) {
              if (pMat[r][c] === 1) {
                // Cockpit glow accent
                if (r <= 2 && c >= 5 && c <= 7) {
                  ctx.fillStyle = '#ffffff';
                } else {
                  ctx.fillStyle = COLORS.player;
                }
                ctx.fillRect(
                  Math.round(g.player.x + c * pw),
                  Math.round(g.player.y + r * ph),
                  Math.ceil(pw),
                  Math.ceil(ph)
                );
              }
            }
          }

          // Pulsing Thruster Exhaust Plume
          const thrusterHeight = 4 + Math.random() * 6;
          ctx.fillStyle = Math.random() < 0.5 ? '#ff9900' : '#ff3300';
          ctx.fillRect(g.player.x + 8, g.player.y + g.player.height, 4, thrusterHeight);
          ctx.fillRect(g.player.x + g.player.width - 12, g.player.y + g.player.height, 4, thrusterHeight);
        }
      }

      // Draw Projectiles
      for (const bullet of g.bullets) {
        ctx.fillStyle = bullet.color;
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = bullet.isPlayer ? 8 : 4;

        if (bullet.isPlayer) {
          // Sharp neon laser bolt
          ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
          // Laser core
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bullet.x + 1, bullet.y + 2, bullet.width - 2, bullet.height - 4);
        } else {
          // Alien zig-zag projectile
          const offset = Math.sin(bullet.y * 0.4) * 2;
          ctx.fillRect(bullet.x + offset, bullet.y, bullet.width, bullet.height);
        }

        ctx.shadowBlur = 0;
      }

      // Draw Explosions & Sparks
      for (const p of g.particles) {
        const alpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1.0;

      // Draw Floating Scores
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      for (const fs of g.floatingScores) {
        const alpha = 1 - fs.life / fs.maxLife;
        ctx.fillStyle = fs.color;
        ctx.globalAlpha = alpha;
        ctx.fillText(fs.text, fs.x + 16, fs.y);
      }
      ctx.globalAlpha = 1.0;

      // Draw Floor Baseline (Green arcade line)
      ctx.strokeStyle = '#22dd66';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 816);
      ctx.lineTo(CANVAS_WIDTH, 816);
      ctx.stroke();

      // Bottom HUD Mini Player Ship Lives
      ctx.fillStyle = '#888888';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('SHIPS:', 20, 838);

      for (let l = 0; l < g.lives; l++) {
        const lifeX = 85 + l * 28;
        const lifeY = 826;
        const pw = 20 / SPRITES.player.width;
        const ph = 12 / SPRITES.player.height;
        ctx.fillStyle = COLORS.player;
        for (let r = 0; r < SPRITES.player.height; r++) {
          for (let c = 0; c < SPRITES.player.width; c++) {
            if (SPRITES.player.matrix[r][c] === 1) {
              ctx.fillRect(lifeX + c * pw, lifeY + r * ph, pw, ph);
            }
          }
        }
      }

      // Bottom HUD Wave count
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffaa00';
      ctx.fillText(`SECTOR ${g.wave}`, CANVAS_WIDTH - 20, 838);

      ctx.restore();

      // 4. OVERLAYS & STATE SCREENS

      // TITLE SCREEN OVERLAY
      if (g.state === 'TITLE') {
        ctx.fillStyle = 'rgba(6, 6, 12, 0.88)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Logo
        ctx.textAlign = 'center';
        ctx.font = '32px "Press Start 2P", monospace';
        ctx.fillStyle = '#00ffcc';
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 15;
        ctx.fillText('GALACTIC INVADERS', CANVAS_WIDTH / 2, 220);
        ctx.shadowBlur = 0;

        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText('ARCADE DEFENSE SYSTEM', CANVAS_WIDTH / 2, 260);

        // Score Table / Alien Roster
        const tableY = 320;
        ctx.font = '13px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('* SCORE ADVANCE TABLE *', CANVAS_WIDTH / 2, tableY);

        // UFO Row
        const ufoMat = SPRITES.ufo.matrix;
        const pwUfo = 32 / SPRITES.ufo.width;
        const phUfo = 14 / SPRITES.ufo.height;
        ctx.fillStyle = COLORS.ufo;
        for (let r = 0; r < SPRITES.ufo.height; r++) {
          for (let c = 0; c < SPRITES.ufo.width; c++) {
            if (ufoMat[r][c] === 1) {
              ctx.fillRect(CANVAS_WIDTH / 2 - 120 + c * pwUfo, tableY + 36 + r * phUfo, pwUfo, phUfo);
            }
          }
        }
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText('= ? MYSTERY', CANVAS_WIDTH / 2 - 60, tableY + 48);

        // Top Alien Row
        const topMat = SPRITES.alienTop.frame0;
        const pwTop = 24 / SPRITES.alienTop.width;
        const phTop = 20 / SPRITES.alienTop.height;
        ctx.fillStyle = COLORS.alienTop;
        for (let r = 0; r < SPRITES.alienTop.height; r++) {
          for (let c = 0; c < SPRITES.alienTop.width; c++) {
            if (topMat[r][c] === 1) {
              ctx.fillRect(CANVAS_WIDTH / 2 - 116 + c * pwTop, tableY + 80 + r * phTop, pwTop, phTop);
            }
          }
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillText('= 30 POINTS', CANVAS_WIDTH / 2 - 60, tableY + 95);

        // Mid Alien Row
        const midMat = SPRITES.alienMid.frame0;
        const pwMid = 26 / SPRITES.alienMid.width;
        const phMid = 18 / SPRITES.alienMid.height;
        ctx.fillStyle = COLORS.alienMid;
        for (let r = 0; r < SPRITES.alienMid.height; r++) {
          for (let c = 0; c < SPRITES.alienMid.width; c++) {
            if (midMat[r][c] === 1) {
              ctx.fillRect(CANVAS_WIDTH / 2 - 118 + c * pwMid, tableY + 125 + r * phMid, pwMid, phMid);
            }
          }
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillText('= 20 POINTS', CANVAS_WIDTH / 2 - 60, tableY + 140);

        // Bot Alien Row
        const botMat = SPRITES.alienBot.frame0;
        const pwBot = 26 / SPRITES.alienBot.width;
        const phBot = 18 / SPRITES.alienBot.height;
        ctx.fillStyle = COLORS.alienBot;
        for (let r = 0; r < SPRITES.alienBot.height; r++) {
          for (let c = 0; c < SPRITES.alienBot.width; c++) {
            if (botMat[r][c] === 1) {
              ctx.fillRect(CANVAS_WIDTH / 2 - 118 + c * pwBot, tableY + 170 + r * phBot, pwBot, phBot);
            }
          }
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillText('= 10 POINTS', CANVAS_WIDTH / 2 - 60, tableY + 185);

        // Pulsing Start Prompt
        const blink = Math.floor(Date.now() / 480) % 2 === 0;
        ctx.textAlign = 'center';
        if (blink) {
          ctx.fillStyle = '#00ffcc';
          ctx.font = '16px "Press Start 2P", monospace';
          ctx.fillText('PRESS SPACE OR TAP TO START', CANVAS_WIDTH / 2, 590);
        }

        // Controls summary
        ctx.fillStyle = '#888888';
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.fillText('CONTROLS: LEFT/RIGHT ARROWS OR A/D', CANVAS_WIDTH / 2, 650);
        ctx.fillText('FIRE: SPACEBAR · PAUSE: P', CANVAS_WIDTH / 2, 680);
      }

      // WAVE CLEAR OVERLAY
      if (g.state === 'WAVE_CLEAR') {
        ctx.fillStyle = 'rgba(6, 6, 12, 0.65)';
        ctx.fillRect(0, 280, CANVAS_WIDTH, 180);

        ctx.textAlign = 'center';
        ctx.font = '24px "Press Start 2P", monospace';
        ctx.fillStyle = '#00ffcc';
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 10;
        ctx.fillText(`SECTOR ${g.wave} SECURED!`, CANVAS_WIDTH / 2, 350);
        ctx.shadowBlur = 0;

        ctx.font = '13px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffff66';
        ctx.fillText('WARP BONUS +500 PTS', CANVAS_WIDTH / 2, 395);

        ctx.font = '11px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('PREPARE FOR NEXT WAVE...', CANVAS_WIDTH / 2, 430);
      }

      // PAUSED OVERLAY
      if (g.state === 'PAUSED') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.textAlign = 'center';
        ctx.font = '28px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffaa00';
        ctx.fillText('PAUSED', CANVAS_WIDTH / 2, 400);

        ctx.font = '13px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('PRESS P OR TAP RESUME TO CONTINUE', CANVAS_WIDTH / 2, 450);
      }

      // GAME OVER OVERLAY
      if (g.state === 'GAME_OVER') {
        ctx.fillStyle = 'rgba(6, 6, 12, 0.9)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.textAlign = 'center';
        ctx.font = '36px "Press Start 2P", monospace';
        ctx.fillStyle = '#ff2255';
        ctx.shadowColor = '#ff2255';
        ctx.shadowBlur = 18;
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 310);
        ctx.shadowBlur = 0;

        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`FINAL SCORE: ${g.score}`, CANVAS_WIDTH / 2, 380);

        if (g.score >= g.highScore && g.score > 0) {
          ctx.fillStyle = '#ffff33';
          ctx.fillText('★ NEW HIGH SCORE! ★', CANVAS_WIDTH / 2, 420);
        } else {
          ctx.fillStyle = '#aaaaaa';
          ctx.fillText(`HIGH SCORE: ${g.highScore}`, CANVAS_WIDTH / 2, 420);
        }

        ctx.fillStyle = '#ffaa00';
        ctx.fillText(`SECTORS CLEARED: ${g.wave - 1}`, CANVAS_WIDTH / 2, 460);

        const blink = Math.floor(Date.now() / 450) % 2 === 0;
        if (blink) {
          ctx.fillStyle = '#00ffcc';
          ctx.font = '16px "Press Start 2P", monospace';
          ctx.fillText('PRESS SPACE TO RESTART', CANVAS_WIDTH / 2, 540);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [CANVAS_WIDTH, CANVAS_HEIGHT, buildStars, createBunkers, nextWave, spawnExplosion, checkBunkerCollision]);

  // Touch control handlers
  const handleTouchStart = (action: 'left' | 'right' | 'fire') => {
    if (gameState === 'TITLE' || gameState === 'GAME_OVER') {
      startGame(true);
      return;
    }
    gameRef.current.touch[action] = true;
  };

  const handleTouchEnd = (action: 'left' | 'right' | 'fire') => {
    gameRef.current.touch[action] = false;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white font-mono p-2 sm:p-4 select-none relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-neutral-950/80 to-black pointer-events-none" />

      {/* Main Arcade Cabinet Wrapper */}
      <div className="relative z-10 w-full max-w-[840px] flex flex-col items-center">
        {/* Top Header / Arcade Marquee */}
        <header className="w-full flex items-center justify-between px-3 py-2 bg-neutral-900/90 border border-neutral-800 rounded-t-xl backdrop-blur-sm shadow-2xl">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-sm sm:text-base font-bold tracking-wider text-cyan-400 font-['Press_Start_2P',_monospace]">
              GALACTIC INVADERS
            </h1>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setCrtFilter(!crtFilter)}
              title="Toggle CRT Scanline Effect (C)"
              className={`p-1.5 rounded transition-colors ${
                crtFilter ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4" />
            </button>

            <button
              onClick={toggleMute}
              title="Toggle Audio (M)"
              className={`p-1.5 rounded transition-colors ${
                isMuted ? 'bg-red-950/80 text-red-400 border border-red-800/50' : 'bg-neutral-800 text-emerald-400 hover:text-emerald-300'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                const g = gameRef.current;
                if (gameState === 'PLAYING') {
                  g.state = 'PAUSED';
                  setGameState('PAUSED');
                } else if (gameState === 'PAUSED') {
                  g.state = 'PLAYING';
                  setGameState('PLAYING');
                }
              }}
              title="Pause Game (P)"
              className="p-1.5 rounded bg-neutral-800 text-amber-400 hover:text-amber-300 transition-colors"
            >
              {gameState === 'PAUSED' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowHelp(!showHelp)}
              title="How to Play"
              className="p-1.5 rounded bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              onClick={() => startGame(true)}
              title="Restart Game"
              className="p-1.5 rounded bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Arcade HUD Bar */}
        <div className="w-full grid grid-cols-3 bg-neutral-900 border-x border-neutral-800 px-4 py-2.5 text-xs sm:text-sm font-['Press_Start_2P',_monospace]">
          <div className="flex flex-col">
            <span className="text-neutral-500 text-[10px]">SCORE</span>
            <span className="text-cyan-400 tracking-wider">{score.toString().padStart(6, '0')}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-neutral-500 text-[10px] flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400 inline" /> HI-SCORE
            </span>
            <span className="text-amber-400 tracking-wider">{highScore.toString().padStart(6, '0')}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-neutral-500 text-[10px]">LIVES</span>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
                <Shield key={i} className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              ))}
              {lives <= 0 && <span className="text-red-500 text-[10px]">CRITICAL</span>}
            </div>
          </div>
        </div>

        {/* Canvas Display Viewport */}
        <div className="relative w-full aspect-[800/850] max-h-[75vh] bg-black border-x border-b border-neutral-800 shadow-[0_0_50px_rgba(0,255,200,0.06)] overflow-hidden">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full block cursor-crosshair touch-none"
            onClick={() => {
              if (gameState === 'TITLE' || gameState === 'GAME_OVER') {
                startGame(true);
              } else if (gameState === 'PAUSED') {
                gameRef.current.state = 'PLAYING';
                setGameState('PLAYING');
              }
            }}
          />

          {/* CRT Scanline Filter Overlay */}
          {crtFilter && (
            <div
              className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45) 1px, transparent 1px, transparent 2px)',
                boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.75)',
              }}
            />
          )}

          {/* Screen Vignette Curvature effect */}
          {crtFilter && (
            <div className="absolute inset-0 pointer-events-none border-[3px] border-neutral-900/60 rounded-sm" />
          )}

          {/* Help / Instructions Modal */}
          {showHelp && (
            <div className="absolute inset-0 z-20 bg-black/90 p-6 flex flex-col justify-center items-center text-center text-xs sm:text-sm font-['Press_Start_2P',_monospace] leading-relaxed">
              <h2 className="text-cyan-400 text-base mb-4">MISSION DIRECTIVE</h2>
              <p className="text-neutral-300 mb-2">Defend Earth from the incoming alien armada!</p>
              <p className="text-neutral-400 mb-4 text-[10px]">Destructible bunkers shield your vessel from bombardment.</p>
              <div className="bg-neutral-900 p-4 border border-neutral-800 rounded-lg text-left text-[11px] mb-6 space-y-2">
                <div><span className="text-amber-400">← / → or A / D :</span> Move Left & Right</div>
                <div><span className="text-cyan-400">SPACEBAR :</span> Fire Laser Cannon</div>
                <div><span className="text-emerald-400">P / ESC :</span> Pause / Resume</div>
                <div><span className="text-purple-400">M :</span> Mute Sound FX</div>
                <div><span className="text-pink-400">C :</span> Toggle CRT Scanlines</div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded cursor-pointer transition-colors"
              >
                RETURN TO ACTION
              </button>
            </div>
          )}
        </div>

        {/* Mobile On-Screen Virtual Controls */}
        <div className="w-full flex items-center justify-between p-3 bg-neutral-900 border-x border-b border-neutral-800 rounded-b-xl gap-4">
          {/* Movement Buttons */}
          <div className="flex items-center gap-2">
            <button
              onPointerDown={() => handleTouchStart('left')}
              onPointerUp={() => handleTouchEnd('left')}
              onPointerLeave={() => handleTouchEnd('left')}
              className="w-16 h-14 sm:w-20 sm:h-14 bg-neutral-800 active:bg-cyan-600 active:text-black border border-neutral-700 rounded-lg flex items-center justify-center font-bold text-lg select-none shadow-md transition-colors"
              aria-label="Move Left"
            >
              ◄
            </button>
            <button
              onPointerDown={() => handleTouchStart('right')}
              onPointerUp={() => handleTouchEnd('right')}
              onPointerLeave={() => handleTouchEnd('right')}
              className="w-16 h-14 sm:w-20 sm:h-14 bg-neutral-800 active:bg-cyan-600 active:text-black border border-neutral-700 rounded-lg flex items-center justify-center font-bold text-lg select-none shadow-md transition-colors"
              aria-label="Move Right"
            >
              ►
            </button>
          </div>

          {/* Status Indicator */}
          <div className="hidden sm:flex flex-col items-center text-[10px] text-neutral-400 font-['Press_Start_2P',_monospace]">
            <span>COOLDOWN ACTIVE</span>
            <span className="text-cyan-400 text-[9px] mt-1">RATE LIMITED CANNONS</span>
          </div>

          {/* Primary Fire Button */}
          <div className="flex items-center">
            <button
              onPointerDown={() => handleTouchStart('fire')}
              onPointerUp={() => handleTouchEnd('fire')}
              onPointerLeave={() => handleTouchEnd('fire')}
              className="px-6 sm:px-10 h-14 bg-red-600 hover:bg-red-500 active:bg-red-700 border-2 border-red-400/80 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base tracking-widest text-white shadow-[0_0_15px_rgba(255,0,0,0.4)] select-none font-['Press_Start_2P',_monospace] transition-colors"
              aria-label="Fire Lasers"
            >
              FIRE
            </button>
          </div>
        </div>

        {/* Subtle Footer */}
        <footer className="mt-2 text-center text-[11px] text-neutral-500 font-sans">
          Classic HTML5 Canvas Arcade Shooter · Space Invaders & Galaga Tribute
        </footer>
      </div>
    </div>
  );
}
