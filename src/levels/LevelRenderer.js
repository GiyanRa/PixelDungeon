/**
 * LevelRenderer — Draws the dungeon grid and entities onto a canvas.
 * All graphics are drawn programmatically (no sprite images).
 */

import { TILE } from './LevelData';

const COLORS = {
  wall:      '#2a1f3d',
  wallHi:    '#3d2e5a',
  wallEdge:  '#1a1230',
  floor1:    '#1c1c30',
  floor2:    '#20203a',
  spike:     '#c44040',
  spikeBase: '#8b2020',
  coin:      '#f5c842',
  coinShine: '#fff5b0',
  door:      '#4d8bf5',
  doorFrame: '#3060b0',
  doorLock:  '#9b6dff',
  doorOpen:  '#3ddc84',
  player:    '#3ddc84',
  playerDark:'#28a060',
  playerEye: '#ffffff',
  slime:     '#88cc44',
  slimeDark: '#558822',
  bat:       '#c06eff',
  batDark:   '#7744aa',
  ghost:     '#aabbdd',
  ghostDark: '#778899',
  heart:     '#ff4466',
  heartDark: '#cc2244',
  key:       '#ffd700',
  lockedDoor:'#aa7700',
  pushBlock: '#886644',
  pInvincible:'#ffaa00',
  pSpeed:    '#00ffff',
  skeleton:  '#eeeeee',
  boss:      '#aa2222',
};

export class LevelRenderer {
  constructor(canvas, tileSize = 40) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ts = tileSize;
    this.frameCount = 0;
    this.particles = [];
  }

  resize(cols, rows) {
    this.canvas.width = cols * this.ts;
    this.canvas.height = rows * this.ts;
  }

  /** Main render call */
  render(state) {
    const { grid, player, monsters, coins, hearts, doorOpen, frame, attacks, hp, maxHp, invincible } = state;
    this.frameCount = frame || 0;
    const ctx = this.ctx;
    const ts = this.ts;
    const W = this.canvas.width;
    const H = this.canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Draw tiles
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const tile = grid[y][x];
        this._drawTile(ctx, x, y, tile, grid, doorOpen);
      }
    }

    // Draw coins
    coins.forEach(c => {
      if (!c.collected) this._drawCoin(ctx, c.x, c.y);
    });

    // Draw hearts
    hearts.forEach(h => {
      if (!h.collected) this._drawHeart(ctx, h.x, h.y);
    });

    // Draw monsters (aggro glow first, then body on top)
    monsters.forEach(m => {
      if (m.isChasing || m.type === 'ghost' || m.type === 'boss') {
        this._drawAggroGlow(ctx, m.x, m.y, m.type);
      }
    });
    monsters.forEach(m => {
      if (m.type === 'slime') this._drawSlime(ctx, m.x, m.y, m.dir, m.isChasing);
      else if (m.type === 'bat') this._drawBat(ctx, m.x, m.y, m.isChasing);
      else if (m.type === 'ghost') this._drawGhost(ctx, m.x, m.y);
      else if (m.type === 'skeleton') this._drawSkeleton(ctx, m.x, m.y, m.isChasing);
      else if (m.type === 'boss') this._drawBoss(ctx, m.x, m.y);
    });
    // Draw exclamation marks on top of monsters that just started chasing
    monsters.forEach(m => {
      if (m.isChasing && !this._prevChasing?.has(m)) {
        this._drawExclamation(ctx, m.x, m.y);
      }
    });
    // Track prev chasing set for next frame
    this._prevChasing = new Set(monsters.filter(m => m.isChasing));

    // Draw player
    if (player && !state.dead) {
      this._drawPlayer(ctx, player.x, player.y, player.dir, invincible);
    }

    // Draw attacks (sword slashes)
    if (attacks) {
      attacks.forEach(a => this._drawAttack(ctx, a));
    }

    // Draw particles
    this._renderParticles(ctx);

    // Fog of war vignette
    this._drawVignette(ctx, W, H);

    // Low HP danger pulse overlay
    if (hp !== undefined && maxHp !== undefined && hp <= 1 && hp > 0) {
      this._drawDangerPulse(ctx, W, H);
    }
  }

  // ---------- Tile drawing ----------

  _drawTile(ctx, x, y, tile, grid, doorOpen) {
    const ts = this.ts;
    const px = x * ts;
    const py = y * ts;

    if (tile === TILE.WALL) {
      // Wall block with depth effect
      ctx.fillStyle = COLORS.wall;
      ctx.fillRect(px, py, ts, ts);
      // Top highlight
      ctx.fillStyle = COLORS.wallHi;
      ctx.fillRect(px, py, ts, ts * 0.3);
      // Brick pattern
      ctx.fillStyle = COLORS.wallEdge;
      const brickH = ts / 3;
      for (let row = 0; row < 3; row++) {
        const offsetX = row % 2 === 0 ? 0 : ts / 2;
        ctx.fillRect(px + offsetX, py + row * brickH, 1, brickH);
        ctx.fillRect(px + offsetX + ts / 2, py + row * brickH, 1, brickH);
        ctx.fillRect(px, py + row * brickH, ts, 1);
      }
    } else {
      // Floor — subtle checkerboard
      ctx.fillStyle = (x + y) % 2 === 0 ? COLORS.floor1 : COLORS.floor2;
      ctx.fillRect(px, py, ts, ts);

      if (tile === TILE.SPIKE) {
        this._drawSpike(ctx, px, py, ts);
      } else if (tile === TILE.DOOR) {
        this._drawDoor(ctx, px, py, ts, doorOpen);
      } else if (tile === TILE.KEY) {
        this._drawKeyTile(ctx, px, py, ts);
      } else if (tile === TILE.LOCKED_DOOR) {
        this._drawLockedDoor(ctx, px, py, ts);
      } else if (tile === TILE.PUSH_BLOCK) {
        this._drawPushBlock(ctx, px, py, ts);
      } else if (tile === TILE.POWERUP_INVINCIBLE) {
        this._drawPowerup(ctx, px, py, ts, COLORS.pInvincible, '🛡️');
      } else if (tile === TILE.POWERUP_SPEED) {
        this._drawPowerup(ctx, px, py, ts, COLORS.pSpeed, '⚡');
      }
    }
  }

  _drawKeyTile(ctx, px, py, ts) {
    const bob = Math.sin(this.frameCount * 0.1) * 2;
    ctx.fillStyle = COLORS.key;
    ctx.fillRect(px + ts * 0.3, py + ts * 0.4 + bob, ts * 0.4, ts * 0.2);
    ctx.beginPath();
    ctx.arc(px + ts * 0.3, py + ts * 0.5 + bob, ts * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawLockedDoor(ctx, px, py, ts) {
    ctx.fillStyle = COLORS.lockedDoor;
    ctx.fillRect(px, py, ts, ts);
    ctx.fillStyle = '#664400';
    ctx.fillRect(px + 4, py + 4, ts - 8, ts - 8);
    // Keyhole
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(px + ts/2, py + ts/2 - 2, 4, 0, Math.PI*2);
    ctx.fill();
    ctx.fillRect(px + ts/2 - 2, py + ts/2 + 2, 4, 6);
  }

  _drawPushBlock(ctx, px, py, ts) {
    ctx.fillStyle = COLORS.pushBlock;
    ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
    ctx.strokeStyle = '#553322';
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 4, py + 4, ts - 8, ts - 8);
    // Cross pattern
    ctx.beginPath();
    ctx.moveTo(px + 4, py + 4);
    ctx.lineTo(px + ts - 4, py + ts - 4);
    ctx.moveTo(px + ts - 4, py + 4);
    ctx.lineTo(px + 4, py + ts - 4);
    ctx.stroke();
  }

  _drawPowerup(ctx, px, py, ts, color, icon) {
    const bob = Math.sin(this.frameCount * 0.1) * 3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px + ts/2, py + ts/2 + bob, ts * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, px + ts/2, py + ts/2 + bob);
  }

  _drawSpike(ctx, px, py, ts) {
    const count = 3;
    const w = ts / count;
    ctx.fillStyle = COLORS.spikeBase;
    ctx.fillRect(px + 2, py + ts * 0.7, ts - 4, ts * 0.3);
    ctx.fillStyle = COLORS.spike;
    for (let i = 0; i < count; i++) {
      const cx = px + w * i + w / 2;
      ctx.beginPath();
      ctx.moveTo(cx - w / 2 + 2, py + ts - 2);
      ctx.lineTo(cx, py + ts * 0.3);
      ctx.lineTo(cx + w / 2 - 2, py + ts - 2);
      ctx.closePath();
      ctx.fill();
    }
  }

  _drawDoor(ctx, px, py, ts, open) {
    // Door frame
    ctx.fillStyle = COLORS.doorFrame;
    ctx.fillRect(px + 2, py, ts - 4, ts);
    // Door body
    ctx.fillStyle = open ? COLORS.doorOpen : COLORS.door;
    ctx.fillRect(px + 5, py + 3, ts - 10, ts - 3);
    // Keyhole or check
    if (!open) {
      ctx.fillStyle = COLORS.doorLock;
      const cx = px + ts / 2;
      const cy = py + ts / 2;
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 2, cy + 2, 4, 6);
    } else {
      // Glow effect
      ctx.fillStyle = 'rgba(61, 220, 132, 0.15)';
      ctx.beginPath();
      ctx.arc(px + ts / 2, py + ts / 2, ts * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------- Entity drawing ----------

  _drawCoin(ctx, x, y) {
    const ts = this.ts;
    const px = x * ts + ts / 2;
    const py = y * ts + ts / 2;
    const bob = Math.sin(this.frameCount * 0.08 + x * 2) * 2;
    const r = ts * 0.22;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px, py + ts * 0.3, r, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Coin body
    ctx.fillStyle = COLORS.coin;
    ctx.beginPath();
    ctx.arc(px, py + bob, r, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = COLORS.coinShine;
    ctx.beginPath();
    ctx.arc(px - r * 0.25, py + bob - r * 0.25, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawHeart(ctx, x, y) {
    const ts = this.ts;
    const px = x * ts + ts / 2;
    const py = y * ts + ts / 2;
    const bob = Math.sin(this.frameCount * 0.06 + x) * 2;
    const s = ts * 0.16;

    ctx.fillStyle = COLORS.heart;
    ctx.save();
    ctx.translate(px, py + bob);
    ctx.beginPath();
    ctx.moveTo(0, s * 0.4);
    ctx.bezierCurveTo(-s, -s * 0.6, -s * 1.8, s * 0.2, 0, s * 1.6);
    ctx.bezierCurveTo(s * 1.8, s * 0.2, s, -s * 0.6, 0, s * 0.4);
    ctx.fill();
    ctx.restore();
  }

  _drawPlayer(ctx, x, y, dir, invincible) {
    const ts = this.ts;
    const px = x * ts;
    const py = y * ts;

    if (invincible && Math.floor(this.frameCount / 4) % 2 === 0) return;

    // Body
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(px + 8, py + 6, ts - 16, ts - 10);
    // Darker legs
    ctx.fillStyle = COLORS.playerDark;
    ctx.fillRect(px + 10, py + ts - 10, 7, 6);
    ctx.fillRect(px + ts - 17, py + ts - 10, 7, 6);
    // Eyes
    ctx.fillStyle = COLORS.playerEye;
    const eyeOffX = dir === -1 ? -2 : dir === 1 ? 2 : 0;
    ctx.fillRect(px + 13 + eyeOffX, py + 12, 4, 4);
    ctx.fillRect(px + ts - 17 + eyeOffX, py + 12, 4, 4);
    // Pupils
    ctx.fillStyle = '#222';
    ctx.fillRect(px + 14 + eyeOffX, py + 13, 2, 2);
    ctx.fillRect(px + ts - 16 + eyeOffX, py + 13, 2, 2);
  }

  _drawSlime(ctx, x, y, dir, isChasing) {
    const ts = this.ts;
    const px = x * ts;
    const py = y * ts;
    const squish = Math.sin(this.frameCount * (isChasing ? 0.2 : 0.1)) * (isChasing ? 4 : 2);

    ctx.fillStyle = isChasing ? '#aaff44' : COLORS.slime;
    ctx.beginPath();
    ctx.ellipse(px + ts / 2, py + ts - 8 + squish / 2, ts / 2 - 4, ts / 2 - 6 - squish, 0, 0, Math.PI * 2);
    ctx.fill();

    // Darker bottom
    ctx.fillStyle = COLORS.slimeDark;
    ctx.beginPath();
    ctx.ellipse(px + ts / 2, py + ts - 5, ts / 2 - 6, 4, 0, 0, Math.PI);
    ctx.fill();

    // Eyes — red when chasing
    ctx.fillStyle = '#fff';
    ctx.fillRect(px + 12, py + ts / 2 - 2, 5, 5);
    ctx.fillRect(px + ts - 17, py + ts / 2 - 2, 5, 5);
    ctx.fillStyle = isChasing ? '#ff2222' : '#222';
    ctx.fillRect(px + 13, py + ts / 2 - 1, 3, 3);
    ctx.fillRect(px + ts - 16, py + ts / 2 - 1, 3, 3);
  }

  _drawBat(ctx, x, y, isChasing) {
    const ts = this.ts;
    const px = x * ts + ts / 2;
    const py = y * ts + ts / 2;
    const flapSpeed = isChasing ? 0.35 : 0.2;
    const wingFlap = Math.sin(this.frameCount * flapSpeed) * (isChasing ? 9 : 6);

    // Wings
    ctx.fillStyle = isChasing ? '#ff88ff' : COLORS.bat;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - 14, py - 4 + wingFlap);
    ctx.lineTo(px - 10, py + 4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + 14, py - 4 + wingFlap);
    ctx.lineTo(px + 10, py + 4);
    ctx.closePath();
    ctx.fill();

    // Body
    ctx.fillStyle = COLORS.batDark;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();

    // Eyes — brighter when chasing
    ctx.fillStyle = isChasing ? '#ff0000' : '#ff4466';
    ctx.fillRect(px - 4, py - 2, 2, 2);
    ctx.fillRect(px + 2, py - 2, 2, 2);
  }

  _drawGhost(ctx, x, y) {
    const ts = this.ts;
    const px = x * ts + ts / 2;
    const py = y * ts + ts / 2;
    const hover = Math.sin(this.frameCount * 0.06) * 3;

    // Body - semi-transparent
    ctx.globalAlpha = 0.6 + Math.sin(this.frameCount * 0.04) * 0.15;
    ctx.fillStyle = COLORS.ghost;
    ctx.beginPath();
    ctx.arc(px, py - 2 + hover, 10, Math.PI, 0);
    ctx.lineTo(px + 10, py + 10 + hover);
    // Wavy bottom
    for (let i = 4; i >= -4; i -= 2) {
      const wavY = py + 10 + hover + Math.sin((i + this.frameCount * 0.1)) * 3;
      ctx.lineTo(px + i * 2.5, wavY);
    }
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#222';
    ctx.fillRect(px - 5, py - 4 + hover, 3, 4);
    ctx.fillRect(px + 2, py - 4 + hover, 3, 4);
  }

  _drawSkeleton(ctx, x, y, isChasing) {
    const ts = this.ts;
    const px = x * ts + ts / 2;
    const py = y * ts + ts / 2;
    const bob = Math.floor(this.frameCount / (isChasing ? 3 : 5)) % 2 === 0 ? 2 : 0;
    
    ctx.fillStyle = isChasing ? '#ffeeee' : COLORS.skeleton;
    // Skull
    ctx.beginPath();
    ctx.arc(px, py - 4 + bob, 8, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.fillRect(px - 2, py + 4 + bob, 4, 10);
    // Ribs
    ctx.fillRect(px - 6, py + 6 + bob, 12, 2);
    ctx.fillRect(px - 5, py + 10 + bob, 10, 2);
    
    // Eyes — red dots when chasing
    ctx.fillStyle = isChasing ? '#ff3333' : '#000';
    ctx.fillRect(px - 4, py - 6 + bob, 3, 3);
    ctx.fillRect(px + 1, py - 6 + bob, 3, 3);
  }

  _drawBoss(ctx, x, y) {
    const ts = this.ts;
    const px = x * ts;
    const py = y * ts;
    const breath = Math.sin(this.frameCount * 0.1) * 2;
    
    ctx.fillStyle = COLORS.boss;
    // Large body
    ctx.fillRect(px + 2 - breath, py + 4 - breath, ts - 4 + breath*2, ts - 6 + breath*2);
    
    // Horns
    ctx.fillStyle = '#ddccaa';
    ctx.beginPath();
    ctx.moveTo(px + 4, py + 4);
    ctx.lineTo(px - 4, py - 6);
    ctx.lineTo(px + 10, py + 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(px + ts - 4, py + 4);
    ctx.lineTo(px + ts + 4, py - 6);
    ctx.lineTo(px + ts - 10, py + 2);
    ctx.fill();
    
    // Eyes (angry)
    ctx.fillStyle = '#fff';
    ctx.fillRect(px + 8, py + 12, 6, 4);
    ctx.fillRect(px + ts - 14, py + 12, 6, 4);
    
    ctx.fillStyle = '#f00';
    ctx.fillRect(px + 10, py + 13, 2, 2);
    ctx.fillRect(px + ts - 12, py + 13, 2, 2);
    
    // Snout
    ctx.fillStyle = '#661111';
    ctx.fillRect(px + ts/2 - 6, py + ts - 12, 12, 8);
  }

  _drawAttack(ctx, attack) {
    const ts = this.ts;
    const px = attack.x * ts + ts / 2;
    const py = attack.y * ts + ts / 2;
    
    ctx.save();
    ctx.translate(px, py);
    // Rotate based on direction
    const angle = Math.atan2(attack.dy, attack.dx);
    ctx.rotate(angle);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    const arc = (10 - attack.life) / 10; // 0 to 1
    ctx.arc(0, 0, ts * 0.6, -Math.PI/2 + arc * Math.PI, -Math.PI/2 + (arc+0.2) * Math.PI);
    ctx.stroke();
    
    ctx.restore();
  }

  // ---------- Aggro & Overlay FX ----------

  _drawAggroGlow(ctx, x, y, type) {
    const ts = this.ts;
    const px = x * ts + ts / 2;
    const py = y * ts + ts / 2;
    const pulse = 0.5 + 0.5 * Math.sin(this.frameCount * 0.25);
    const r = (ts * 0.55) + pulse * 8;
    const isBoss = type === 'boss';

    const gradient = ctx.createRadialGradient(px, py, 2, px, py, r);
    gradient.addColorStop(0, isBoss ? `rgba(255,60,0,${0.35 * pulse})` : `rgba(255,80,80,${0.3 * pulse})`);
    gradient.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawExclamation(ctx, x, y) {
    const ts = this.ts;
    const px = x * ts + ts / 2;
    const py = y * ts - 4;
    ctx.save();
    ctx.font = `bold ${Math.round(ts * 0.45)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#ff2222';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.fillText('!', px, py);
    ctx.restore();
  }

  _drawVignette(ctx, W, H) {
    const gradient = ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.3, W/2, H/2, Math.max(W,H)*0.75);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  }

  _drawDangerPulse(ctx, W, H) {
    const pulse = 0.4 + 0.4 * Math.sin(this.frameCount * 0.15);
    ctx.fillStyle = `rgba(180,0,0,${pulse * 0.22})`;
    ctx.fillRect(0, 0, W, H);
    // Red border
    const borderW = 8 + pulse * 6;
    ctx.strokeStyle = `rgba(255,0,0,${pulse * 0.6})`;
    ctx.lineWidth = borderW;
    ctx.strokeRect(borderW/2, borderW/2, W - borderW, H - borderW);
  }

  // ---------- Particles ----------

  spawnParticles(x, y, color, count = 6) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x * this.ts + this.ts / 2,
        y: y * this.ts + this.ts / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 1,
        life: 1,
        decay: 0.02 + Math.random() * 0.03,
        size: 2 + Math.random() * 3,
        color,
      });
    }
  }

  _renderParticles(ctx) {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life -= p.decay;
      if (p.life <= 0) return false;

      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.globalAlpha = 1;
      return true;
    });
  }
}
