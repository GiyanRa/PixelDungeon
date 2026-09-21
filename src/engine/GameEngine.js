/**
 * GameEngine — Core game logic for Pixel Dungeon.
 * Manages state, collision, monster AI, and game flow.
 */

import { TILE, levels } from '../levels/LevelData';
import { Sound, resumeAudio } from './SoundManager';


const MONSTER_MOVE_INTERVAL = 18; // frames between monster moves
const INVINCIBLE_FRAMES = 50;
const COIN_SCORE = 100;
const LEVEL_BONUS = 500;
const TIME_BONUS_MAX = 300;
const TIME_PENALTY_INTERVAL = 60; // frames per time bonus decrement

export class GameEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.levelIndex = 0;
    this.score = 0;
    this.hp = 3;
    this.maxHp = 3;
    this.state = 'menu'; // menu | playing | paused | levelComplete | gameover | victory
    this.frame = 0;
    this.coinsCollected = 0;
    this.totalCoins = 0;
    this.timeBonus = TIME_BONUS_MAX;
    this.levelScore = 0;
    this._invincibleTimer = 0;
    this._monsterTimer = 0;
    this._shakeTimer = 0;
    this.keys = 0;
    this.powerupInvincibleTimer = 0;
    this.powerupSpeedTimer = 0;
    this.attacks = [];
    this.onStateChange = null;
    this.onShake = null;
  }

  get currentLevel() {
    return levels[this.levelIndex];
  }

  get isLastLevel() {
    return this.levelIndex >= levels.length - 1;
  }

  get shaking() {
    return this._shakeTimer > 0;
  }

  // ---------- Level Init ----------

  loadLevel(index) {
    if (index !== undefined) this.levelIndex = index;
    const level = this.currentLevel;
    if (!level) {
      this.state = 'victory';
      this._notify();
      return;
    }

    // Deep copy grid
    this.grid = level.grid.map(row => [...row]);
    this.player = null;
    this.monsters = [];
    this.coins = [];
    this.hearts = [];
    this.doorOpen = false;
    this.coinsCollected = 0;
    this.totalCoins = 0;
    this.timeBonus = TIME_BONUS_MAX;
    this.levelScore = 0;
    this._invincibleTimer = 0;
    this._monsterTimer = 0;
    this._shakeTimer = 0;
    this.keys = 0;
    this.powerupInvincibleTimer = 0;
    this.powerupSpeedTimer = 0;
    this.attacks = [];

    // Parse grid for entities
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        const t = this.grid[y][x];
        if (t === TILE.SPAWN) {
          this.player = { x, y, dir: 0 };
          this.grid[y][x] = TILE.FLOOR;
        } else if (t === TILE.COIN) {
          this.coins.push({ x, y, collected: false });
          this.totalCoins++;
          this.grid[y][x] = TILE.FLOOR;
        } else if (t === TILE.HEART) {
          this.hearts.push({ x, y, collected: false });
          this.grid[y][x] = TILE.FLOOR;
        } else if (t === TILE.SLIME) {
          this.monsters.push(this._createMonster('slime', x, y));
          this.grid[y][x] = TILE.FLOOR;
        } else if (t === TILE.BAT) {
          this.monsters.push(this._createMonster('bat', x, y));
          this.grid[y][x] = TILE.FLOOR;
        } else if (t === TILE.GHOST) {
          this.monsters.push(this._createMonster('ghost', x, y));
          this.grid[y][x] = TILE.FLOOR;
        } else if (t === TILE.SKELETON) {
          this.monsters.push(this._createMonster('skeleton', x, y));
          this.grid[y][x] = TILE.FLOOR;
        } else if (t === TILE.BOSS) {
          const boss = this._createMonster('boss', x, y);
          boss.hp = 5;
          this.monsters.push(boss);
          this.grid[y][x] = TILE.FLOOR;
        }
      }
    }

    this.state = 'playing';
    this.frame = 0;
    this._notify();
    Sound.levelStart();
  }

  _createMonster(type, x, y) {
    // Pick a random initial patrol direction
    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];
    const d = dirs[Math.floor(Math.random() * dirs.length)];
    // aggroRange: tiles distance at which monster starts chasing player
    const aggroRange = type === 'slime' ? 5 : type === 'bat' ? 6 : type === 'skeleton' ? 7 : 99;
    return { type, x, y, startX: x, startY: y, dx: d.dx, dy: d.dy, dir: d.dx, aggroRange };
  }

  _distToPlayer(m) {
    if (!this.player) return Infinity;
    return Math.abs(this.player.x - m.x) + Math.abs(this.player.y - m.y);
  }

  _chasePlayer(m) {
    // Move one step toward the player, respecting walls
    if (!this.player) return;
    const px = this.player.x;
    const py = this.player.y;
    const diffX = px - m.x;
    const diffY = py - m.y;

    // Try primary axis (larger distance) first, then secondary
    const tryX = () => {
      const nx = m.x + Math.sign(diffX);
      if (diffX !== 0 && this._canMonsterMove(m, nx, m.y)) {
        m.x = nx;
        m.dir = Math.sign(diffX);
        m.dx = Math.sign(diffX);
        m.dy = 0;
        return true;
      }
      return false;
    };
    const tryY = () => {
      const ny = m.y + Math.sign(diffY);
      if (diffY !== 0 && this._canMonsterMove(m, m.x, ny)) {
        m.y = ny;
        m.dy = Math.sign(diffY);
        m.dx = 0;
        return true;
      }
      return false;
    };

    if (Math.abs(diffX) >= Math.abs(diffY)) {
      if (!tryX()) tryY();
    } else {
      if (!tryY()) tryX();
    }
  }

  // ---------- Game Loop Tick ----------

  tick() {
    if (this.state !== 'playing') return;
    this.frame++;

    // Timers
    if (this._invincibleTimer > 0) this._invincibleTimer--;
    if (this._shakeTimer > 0) this._shakeTimer--;

    // Time bonus decay
    if (this.frame % TIME_PENALTY_INTERVAL === 0 && this.timeBonus > 0) {
      this.timeBonus--;
    }

    // Move monsters
    this._monsterTimer++;
    if (this._monsterTimer >= (this.powerupSpeedTimer > 0 ? MONSTER_MOVE_INTERVAL * 2 : MONSTER_MOVE_INTERVAL)) {
      this._monsterTimer = 0;
      this._moveMonsters();
    }

    if (this.powerupInvincibleTimer > 0) {
      this._invincibleTimer = 2; // maintain invincibility
      this.powerupInvincibleTimer--;
    }
    if (this.powerupSpeedTimer > 0) {
      this.powerupSpeedTimer--;
    }
    
    this.attacks = this.attacks.filter(a => a.life-- > 0);
    this._monsterTimer++;
    if (this._monsterTimer >= MONSTER_MOVE_INTERVAL) {
      this._monsterTimer = 0;
      this._moveMonsters();
    }

    // Check monster collisions
    this._checkMonsterCollision();
  }

  // ---------- Player Movement ----------

  movePlayer(dx, dy) {
    if (this.state !== 'playing' || !this.player) return;

    const nx = this.player.x + dx;
    const ny = this.player.y + dy;
    this.player.dir = dx !== 0 ? dx : this.player.dir;
    this.player.lastDx = dx;
    this.player.lastDy = dy;

    // Bounds check
    if (ny < 0 || ny >= this.grid.length || nx < 0 || nx >= this.grid[0].length) return;

    const tile = this.grid[ny][nx];

    // Wall check
    if (tile === TILE.WALL) return;

    if (tile === TILE.LOCKED_DOOR) {
      if (this.keys > 0) {
        this.keys--;
        this.grid[ny][nx] = TILE.FLOOR;
        Sound.doorOpen();
      }
      return;
    }

    if (tile === TILE.PUSH_BLOCK) {
      const nnx = nx + dx;
      const nny = ny + dy;
      if (nnx >= 0 && nny >= 0 && nnx < this.grid[0].length && nny < this.grid.length) {
        if (this.grid[nny][nnx] === TILE.FLOOR) {
          this.grid[nny][nnx] = TILE.PUSH_BLOCK;
          this.grid[ny][nx] = TILE.FLOOR;
          Sound.step();
        } else {
          return; // blocked
        }
      } else {
        return; // edge
      }
    }

    // Move
    this.player.x = nx;
    this.player.y = ny;
    Sound.step();

    // Spike damage
    if (this.grid[ny][nx] === TILE.SPIKE) {
      this._takeDamage();
    }

    if (this.grid[ny][nx] === TILE.KEY) {
      this.keys++;
      this.grid[ny][nx] = TILE.FLOOR;
      Sound.coinPickup();
    }

    if (this.grid[ny][nx] === TILE.POWERUP_INVINCIBLE) {
      this.powerupInvincibleTimer = 300;
      this.grid[ny][nx] = TILE.FLOOR;
      Sound.heartPickup();
    }

    if (this.grid[ny][nx] === TILE.POWERUP_SPEED) {
      this.powerupSpeedTimer = 300;
      this.grid[ny][nx] = TILE.FLOOR;
      Sound.heartPickup();
    }

    // Coin pickup
    this.coins.forEach(c => {
      if (!c.collected && c.x === nx && c.y === ny) {
        c.collected = true;
        this.coinsCollected++;
        this.score += COIN_SCORE;
        this.levelScore += COIN_SCORE;
        Sound.coinPickup();
        this._particleCallback?.(nx, ny, '#f5c842');
        // Check if all coins collected
        if (this.coinsCollected >= this.totalCoins) {
          this.doorOpen = true;
          Sound.doorOpen();
        }
      }
    });

    // Heart pickup
    this.hearts.forEach(h => {
      if (!h.collected && h.x === nx && h.y === ny) {
        h.collected = true;
        if (this.hp < this.maxHp) this.hp++;
        Sound.heartPickup();
        this._particleCallback?.(nx, ny, '#ff4466');
      }
    });

    // Door exit
    if (this.grid[ny][nx] === TILE.DOOR && this.doorOpen) {
      this._completeLevel();
    }

    // Monster collision after move
    this._checkMonsterCollision();
    this._notify();
  }

  actionPlayer(action) {
    if (this.state !== 'playing' || !this.player) return;
    if (action === 'attack') {
      const dx = this.player.lastDx || (this.player.dir !== 0 ? this.player.dir : 1);
      const dy = this.player.lastDy || 0;
      const tx = this.player.x + dx;
      const ty = this.player.y + dy;
      
      this.attacks.push({ x: tx, y: ty, life: 10, dx, dy });
      Sound.step(); // fallback sound for swing
      
      this.monsters = this.monsters.filter(m => {
        if (m.x === tx && m.y === ty) {
          if (m.type === 'boss') {
            m.hp = (m.hp || 5) - 1;
            this._particleCallback?.(tx, ty, '#ff0000');
            if (m.hp <= 0) {
              this.score += 500;
              return false;
            }
            return true;
          }
          this.score += 50;
          this._particleCallback?.(tx, ty, '#ff0000');
          return false;
        }
        return true;
      });
      this._notify();
    }
  }

  // ---------- Monster AI ----------

  _moveMonsters() {
    this.monsters.forEach(m => {
      if (m.type === 'ghost') {
        this._moveGhost(m);
      } else if (m.type === 'boss') {
        this._moveBoss(m);
      } else if (m.type === 'skeleton') {
        this._moveSkeleton(m);
      } else if (m.type === 'slime' || m.type === 'bat') {
        // Aggro: chase when close, patrol otherwise
        const wasChasing = m.isChasing;
        if (this._distToPlayer(m) <= m.aggroRange) {
          m.isChasing = true;
          if (!wasChasing) {
            // Just entered chase — play alert sound and burst particles
            Sound.monsterAlert();
            this._particleCallback?.(m.x, m.y, '#ff4444');
          }
          this._chasePlayer(m);
        } else {
          m.isChasing = false;
          this._movePatrol(m);
        }
      } else {
        this._movePatrol(m);
      }
    });
  }

  _movePatrol(m) {
    const nx = m.x + m.dx;
    const ny = m.y + m.dy;

    // Check if can move
    if (this._canMonsterMove(m, nx, ny)) {
      m.x = nx;
      m.y = ny;
      m.dir = m.dx;
    } else {
      // Reverse direction and try perpendicular
      m.dx = -m.dx;
      m.dy = -m.dy;
      const nx2 = m.x + m.dx;
      const ny2 = m.y + m.dy;
      if (this._canMonsterMove(m, nx2, ny2)) {
        m.x = nx2;
        m.y = ny2;
        m.dir = m.dx;
      } else {
        // Try perpendicular
        const temp = m.dx;
        m.dx = m.dy;
        m.dy = temp;
      }
    }
  }

  _moveGhost(m) {
    // Ghost moves toward player, can pass through walls
    if (!this.player) return;
    const dx = Math.sign(this.player.x - m.x);
    const dy = Math.sign(this.player.y - m.y);
    // Prefer axis with greater distance
    if (Math.abs(this.player.x - m.x) > Math.abs(this.player.y - m.y)) {
      m.x += dx;
      m.dir = dx;
    } else if (dy !== 0) {
      m.y += dy;
    } else {
      m.x += dx;
      m.dir = dx;
    }
  }

  _moveSkeleton(m) {
    m.pauseCounter = (m.pauseCounter || 0) + 1;
    if (m.pauseCounter % 3 === 0) return; // skeleton is slower
    // Skeleton also chases when in aggro range
    const wasChasing = m.isChasing;
    if (this._distToPlayer(m) <= m.aggroRange) {
      m.isChasing = true;
      if (!wasChasing) {
        Sound.monsterAlert();
        this._particleCallback?.(m.x, m.y, '#ff4444');
      }
      this._chasePlayer(m);
    } else {
      m.isChasing = false;
      this._moveSkeleton_patrol(m);
    }
  }

  _moveSkeleton_patrol(m) {
    this._movePatrol(m);
  }

  _moveBoss(m) {
    if (!this.player) return;
    m.pauseCounter = (m.pauseCounter || 0) + 1;
    if (m.pauseCounter % 2 === 0) return;
    
    let dx = Math.sign(this.player.x - m.x);
    let dy = Math.sign(this.player.y - m.y);
    
    // Boss can move diagonally or straight, but favors straight to crush blocks
    const tryMove = (mx, my) => {
      const nx = m.x + mx;
      const ny = m.y + my;
      if (ny >= 0 && ny < this.grid.length && nx >= 0 && nx < this.grid[0].length) {
        if (this._canMonsterMove(m, nx, ny) || this.grid[ny][nx] === TILE.PUSH_BLOCK) {
          if (this.grid[ny][nx] === TILE.PUSH_BLOCK) {
            this.grid[ny][nx] = TILE.FLOOR; // boss breaks it
            this._shakeTimer = 5;
          }
          m.x = nx;
          m.y = ny;
          m.dir = mx !== 0 ? mx : m.dir;
          return true;
        }
      }
      return false;
    };

    if (Math.abs(this.player.x - m.x) > Math.abs(this.player.y - m.y)) {
      if (!tryMove(dx, 0)) tryMove(0, dy);
    } else {
      if (!tryMove(0, dy)) tryMove(dx, 0);
    }
  }

  _canMonsterMove(m, nx, ny) {
    if (ny < 0 || ny >= this.grid.length || nx < 0 || nx >= this.grid[0].length) return false;
    const tile = this.grid[ny][nx];
    return tile !== TILE.WALL && tile !== TILE.DOOR;
  }

  // ---------- Damage & Collision ----------

  _checkMonsterCollision() {
    if (!this.player || this._invincibleTimer > 0) return;
    for (const m of this.monsters) {
      if (m.x === this.player.x && m.y === this.player.y) {
        this._takeDamage();
        break;
      }
    }
  }

  _takeDamage() {
    if (this._invincibleTimer > 0) return;
    this.hp--;
    this._invincibleTimer = INVINCIBLE_FRAMES;
    this._shakeTimer = 15;
    this.onShake?.();
    Sound.damage();

    if (this.hp <= 0) {
      this.state = 'gameover';
      Sound.gameOver();
      // Save high score
      this._saveHighScore();
      this._notify();
    }
  }

  // ---------- Level Complete ----------

  _completeLevel() {
    this.score += LEVEL_BONUS + this.timeBonus;
    this.levelScore += LEVEL_BONUS + this.timeBonus;
    this.state = 'levelComplete';
    this._notify();
  }

  nextLevel() {
    this.levelIndex++;
    if (this.levelIndex >= levels.length) {
      this.state = 'victory';
      this._saveHighScore();
      this._notify();
    } else {
      this.loadLevel();
    }
  }

  // ---------- Score ----------

  _saveHighScore() {
    try {
      const prev = parseInt(localStorage.getItem('pixeldungeon_highscore') || '0', 10);
      if (this.score > prev) {
        localStorage.setItem('pixeldungeon_highscore', this.score.toString());
      }
    } catch (e) { /* ignore */ }
  }

  getHighScore() {
    try {
      return parseInt(localStorage.getItem('pixeldungeon_highscore') || '0', 10);
    } catch (e) {
      return 0;
    }
  }

  // ---------- Helpers ----------

  startGame() {
    resumeAudio();
    Sound.menuSelect();
    this.reset();
    this.loadLevel(0);
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
    } else if (this.state === 'paused') {
      this.state = 'playing';
    }
    this._notify();
  }

  restart() {
    this.reset();
    this.loadLevel(0);
  }

  getState() {
    return {
      grid: this.grid,
      player: this.player,
      monsters: this.monsters,
      coins: this.coins,
      hearts: this.hearts,
      doorOpen: this.doorOpen,
      hp: this.hp,
      maxHp: this.maxHp,
      score: this.score,
      coinsCollected: this.coinsCollected,
      totalCoins: this.totalCoins,
      state: this.state,
      levelIndex: this.levelIndex,
      levelName: this.currentLevel?.name || '',
      levelScore: this.levelScore,
      timeBonus: this.timeBonus,
      frame: this.frame,
      invincible: this._invincibleTimer > 0,
      dead: this.state === 'gameover',
      keys: this.keys,
      powerupInvincibleTimer: this.powerupInvincibleTimer,
      powerupSpeedTimer: this.powerupSpeedTimer,
      attacks: this.attacks,
    };
  }

  setParticleCallback(fn) {
    this._particleCallback = fn;
  }

  _notify() {
    this.onStateChange?.(this.getState());
  }
}
