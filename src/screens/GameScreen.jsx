import React, { useEffect, useRef, useCallback, useState } from 'react';
import { LevelRenderer } from '../levels/LevelRenderer';

const TILE_SIZE = 40;

export default function GameScreen({ engine, inputManager, onStateChange }) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const rafRef = useRef(null);
  const [gameState, setGameState] = useState(engine.getState());
  const wrapperRef = useRef(null);
  const canvasAreaRef = useRef(null);

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    rendererRef.current = new LevelRenderer(canvas, TILE_SIZE);
    const gs = engine.getState();
    if (gs.grid) {
      rendererRef.current.resize(gs.grid[0].length, gs.grid.length);
    }
  }, [engine]);

  // Particle callback
  useEffect(() => {
    engine.setParticleCallback((x, y, color) => {
      rendererRef.current?.spawnParticles(x, y, color);
    });
  }, [engine]);

  // Shake callback
  useEffect(() => {
    engine.onShake = () => {
      const w = wrapperRef.current;
      if (w) {
        w.classList.remove('shake');
        void w.offsetWidth; // reflow
        w.classList.add('shake');
      }
    };
  }, [engine]);

  // State sync
  useEffect(() => {
    engine.onStateChange = (s) => {
      setGameState({ ...s });
      onStateChange?.(s);
    };
  }, [engine, onStateChange]);

  // Game loop
  useEffect(() => {
    if (gameState.state !== 'playing' && gameState.state !== 'paused') return;

    let lastTick = 0;
    const TICK_RATE = 1000 / 30; // 30 FPS logic

    const loop = (timestamp) => {
      rafRef.current = requestAnimationFrame(loop);

      if (gameState.state === 'paused') {
        // Still render, but don't tick
        const gs = engine.getState();
        rendererRef.current?.render(gs);
        return;
      }

      // Process input
      const moves = inputManager.consumeQueue();
      for (const m of moves) {
        if (m.action) {
          engine.actionPlayer(m.action);
        } else {
          engine.movePlayer(m.dx, m.dy);
        }
      }

      // Tick engine
      if (timestamp - lastTick >= TICK_RATE) {
        lastTick = timestamp;
        engine.tick();
      }

      // Render
      const gs = engine.getState();
      rendererRef.current?.render(gs);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState.state, engine, inputManager]);

  // Pause handler
  useEffect(() => {
    inputManager.onPause = () => engine.togglePause();
    return () => { inputManager.onPause = null; };
  }, [engine, inputManager]);

  // Resize canvas on level change
  useEffect(() => {
    if (gameState.grid && rendererRef.current) {
      rendererRef.current.resize(gameState.grid[0].length, gameState.grid.length);
    }
  }, [gameState.levelIndex]);

  // Auto-scale canvas to fit available area on mobile
  useEffect(() => {
    const area = canvasAreaRef.current;
    const wrapper = wrapperRef.current;
    if (!area || !wrapper) return;

    const applyScale = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const areaW = area.clientWidth;
      const areaH = area.clientHeight;
      const canvasW = canvas.width + 6; // +6 for border
      const canvasH = canvas.height + 6;
      const scaleX = areaW / canvasW;
      const scaleY = areaH / canvasH;
      const scale = Math.min(scaleX, scaleY, 1); // never scale up
      wrapper.style.transform = `scale(${scale})`;
    };

    const ro = new ResizeObserver(applyScale);
    ro.observe(area);
    // Also re-apply when canvas size changes (level change)
    applyScale();
    return () => ro.disconnect();
  }, [gameState.levelIndex]);

  const handleDpad = useCallback((dx, dy) => {
    inputManager.pushDirection(dx, dy);
  }, [inputManager]);

  const handleAction = useCallback(() => {
    inputManager.pushAction('attack');
  }, [inputManager]);

  const gs = gameState;
  const cols = gs.grid ? gs.grid[0].length : 15;
  const rows = gs.grid ? gs.grid.length : 11;

  return (
    <div className="game-screen" id="game-screen">
      {/* HUD */}
      <div className="hud" id="hud">
        <div className="hud-left">
          <div className="hud-hearts" id="hud-hearts">
            {Array.from({ length: gs.maxHp }, (_, i) => (
              <span key={i} className={`hud-heart ${i < gs.hp ? 'full' : 'empty'}`}>
                {i < gs.hp ? '♥' : '♡'}
              </span>
            ))}
          </div>
          <span className="hud-coins" id="hud-coins">
            ● {gs.coinsCollected}/{gs.totalCoins}
          </span>
          <span className="hud-keys" id="hud-keys" style={{ marginLeft: '10px', color: '#ffd700' }}>
            {gs.keys > 0 ? `🔑 ${gs.keys}` : ''}
          </span>
          <div className="hud-powerups" style={{ display: 'flex', gap: '5px', marginLeft: '10px' }}>
            {gs.powerupInvincibleTimer > 0 && <span title="Invincible">🛡️</span>}
            {gs.powerupSpeedTimer > 0 && <span title="Speed">⚡</span>}
          </div>
        </div>
        <div className="hud-right">
          <span className="hud-level" id="hud-level">
            LV.{gs.levelIndex + 1}
          </span>
          <span className="hud-score" id="hud-score">
            {gs.score.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="canvas-area" ref={canvasAreaRef}>
        <div className="canvas-wrapper" ref={wrapperRef}>
          <canvas
            ref={canvasRef}
            className="game-canvas"
            width={cols * TILE_SIZE}
            height={rows * TILE_SIZE}
            id="game-canvas"
          />
          <div className="torch-glow" />
        </div>
      </div>

      {/* Mobile D-pad */}
      <div className="mobile-controls" id="mobile-controls">
        <div className="dpad">
          <button className="dpad-btn dpad-up" onPointerDown={() => handleDpad(0, -1)}>▲</button>
          <button className="dpad-btn dpad-left" onPointerDown={() => handleDpad(-1, 0)}>◄</button>
          <button className="dpad-btn dpad-center" onPointerDown={handleAction}>⚔️</button>
          <button className="dpad-btn dpad-right" onPointerDown={() => handleDpad(1, 0)}>►</button>
          <button className="dpad-btn dpad-down" onPointerDown={() => handleDpad(0, 1)}>▼</button>
        </div>
      </div>

      {/* Pause overlay */}
      {gs.state === 'paused' && (
        <div className="pause-indicator" id="pause-indicator">
          ❚❚ PAUSED
        </div>
      )}
    </div>
  );
}
