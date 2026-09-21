/**
 * InputManager — Handles keyboard and touch input for grid-based movement.
 * Returns queued direction commands that the game loop consumes.
 */

const DIRECTIONS = {
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  w: { dx: 0, dy: -1 },
  s: { dx: 0, dy: 1 },
  a: { dx: -1, dy: 0 },
  d: { dx: 1, dy: 0 },
  W: { dx: 0, dy: -1 },
  S: { dx: 0, dy: 1 },
  A: { dx: -1, dy: 0 },
  D: { dx: 1, dy: 0 },
  ' ': { action: 'attack' },
};

export class InputManager {
  constructor() {
    this.queue = [];
    this.keysDown = new Set();
    this.paused = false;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._repeatTimer = null;
    this._lastKey = null;
  }

  start() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  stop() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.queue = [];
    this.keysDown.clear();
    this._stopRepeat();
  }

  _onKeyDown(e) {
    if (this.paused) return;
    const dir = DIRECTIONS[e.key];
    if (dir && !this.keysDown.has(e.key)) {
      e.preventDefault();
      this.keysDown.add(e.key);
      this.queue.push(dir);
      if (!dir.action) {
        this._lastKey = e.key;
        this._startRepeat(e.key);
      }
    }
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      this.onPause?.();
    }
  }

  _onKeyUp(e) {
    this.keysDown.delete(e.key);
    if (e.key === this._lastKey) {
      this._stopRepeat();
    }
  }

  _startRepeat(key) {
    this._stopRepeat();
    this._repeatTimer = setTimeout(() => {
      this._repeatInterval = setInterval(() => {
        const dir = DIRECTIONS[key];
        if (dir && this.keysDown.has(key)) {
          this.queue.push(dir);
        }
      }, 120);
    }, 200);
  }

  _stopRepeat() {
    clearTimeout(this._repeatTimer);
    clearInterval(this._repeatInterval);
  }

  pushDirection(dx, dy) {
    if (!this.paused) {
      this.queue.push({ dx, dy });
    }
  }

  pushAction(action) {
    if (!this.paused) {
      this.queue.push({ action });
    }
  }

  consumeQueue() {
    const q = this.queue;
    this.queue = [];
    return q;
  }
}
