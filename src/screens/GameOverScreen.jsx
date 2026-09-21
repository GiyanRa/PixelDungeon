import React from 'react';
import { Sound, resumeAudio } from '../engine/SoundManager';

export default function GameOverScreen({ score, levelIndex, onRestart, onMenu }) {
  return (
    <div className="overlay-screen" id="gameover-screen">
      <h2 className="gameover-title">GAME OVER</h2>

      <div className="stat-line">
        REACHED LEVEL <span className="stat-value">{levelIndex + 1}</span>
      </div>

      <div className="final-score" id="final-score">
        SCORE: {score.toLocaleString()}
      </div>

      <button
        className="pixel-btn"
        id="retry-button"
        onClick={() => {
          resumeAudio();
          Sound.menuSelect();
          onRestart();
        }}
      >
        ↻ RETRY
      </button>

      <button
        className="pixel-btn secondary"
        id="menu-button"
        onClick={() => {
          Sound.menuSelect();
          onMenu();
        }}
      >
        ← MENU
      </button>

      <div className="copyright-notice">
        © {new Date().getFullYear()} Giyan Radhietya
      </div>
    </div>
  );
}
