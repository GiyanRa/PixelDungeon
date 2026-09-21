import React from 'react';
import { Sound, resumeAudio } from '../engine/SoundManager';

export default function TitleScreen({ onStart, highScore }) {
  const handleStart = () => {
    resumeAudio();
    Sound.menuSelect();
    onStart();
  };

  return (
    <div className="title-screen" id="title-screen">
      <div className="title-logo">
        <p className="subtitle">⚔ a retro adventure ⚔</p>
        <h1>PIXEL<br/>DUNGEON</h1>
      </div>

      <HeroPreview />

      <div
        className="press-start"
        id="start-button"
        onClick={handleStart}
        onKeyDown={e => e.key === 'Enter' && handleStart()}
        role="button"
        tabIndex={0}
      >
        ▶ START GAME
      </div>

      {highScore > 0 && (
        <div className="high-score-display" id="high-score">
          ★ BEST: {highScore.toLocaleString()}
        </div>
      )}

      <div className="controls-hint">
        WASD / ARROW KEYS TO MOVE<br/>
        SPACE / Z TO ATTACK &nbsp;|&nbsp; ESC TO PAUSE
      </div>

      <div className="copyright-notice" id="copyright">
        © {new Date().getFullYear()} Giyan Radhietya — All Rights Reserved
      </div>
    </div>
  );
}

/** Animated pixel hero on title screen */
function HeroPreview() {
  return (
    <svg className="title-hero" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <rect x="4" y="3" width="8" height="9" fill="#3ddc84" />
      {/* Darker bottom (legs) */}
      <rect x="5" y="10" width="3" height="3" fill="#28a060" />
      <rect x="8" y="10" width="3" height="3" fill="#28a060" />
      {/* Eyes */}
      <rect x="5" y="5" width="2" height="2" fill="#fff" />
      <rect x="9" y="5" width="2" height="2" fill="#fff" />
      {/* Pupils */}
      <rect x="6" y="6" width="1" height="1" fill="#222" />
      <rect x="10" y="6" width="1" height="1" fill="#222" />
      {/* Sword */}
      <rect x="12" y="2" width="1" height="7" fill="#a0a0b0" />
      <rect x="11" y="4" width="3" height="1" fill="#d4a42a" />
    </svg>
  );
}
