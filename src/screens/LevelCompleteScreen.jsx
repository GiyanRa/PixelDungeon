import React from 'react';
import { Sound, resumeAudio } from '../engine/SoundManager';

export default function LevelCompleteScreen({ levelName, levelScore, timeBonus, coinsCollected, totalCoins, isLast, onNext, onMenu }) {
  // Star rating based on coins and time bonus
  const coinRatio = totalCoins > 0 ? coinsCollected / totalCoins : 1;
  const stars = timeBonus > 200 && coinRatio >= 1 ? 3 : timeBonus > 100 ? 2 : 1;

  return (
    <div className="overlay-screen" id="level-complete-screen">
      <h2>{isLast ? '🏆 VICTORY!' : 'LEVEL CLEAR!'}</h2>

      <div className="stat-line">
        {levelName}
      </div>

      <div className="level-complete-stars" id="stars">
        {[1, 2, 3].map(i => (
          <span key={i} className={`star ${i <= stars ? 'earned' : ''}`}>★</span>
        ))}
      </div>

      <div className="stat-line">
        COINS <span className="stat-value">{coinsCollected}/{totalCoins}</span>
      </div>
      <div className="stat-line">
        TIME BONUS <span className="stat-value">+{timeBonus}</span>
      </div>
      <div className="stat-line">
        LEVEL SCORE <span className="stat-value">{levelScore.toLocaleString()}</span>
      </div>

      {!isLast ? (
        <button
          className="pixel-btn"
          id="next-level-button"
          onClick={() => {
            resumeAudio();
            Sound.menuSelect();
            onNext();
          }}
        >
          NEXT LEVEL →
        </button>
      ) : (
        <button
          className="pixel-btn"
          id="victory-menu-button"
          onClick={() => {
            Sound.menuSelect();
            onMenu();
          }}
        >
          ★ MAIN MENU
        </button>
      )}

      {!isLast && (
        <button
          className="pixel-btn secondary"
          id="back-menu-button"
          onClick={() => {
            Sound.menuSelect();
            onMenu();
          }}
        >
          ← MENU
        </button>
      )}
    </div>
  );
}
