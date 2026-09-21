import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from './engine/GameEngine';
import { InputManager } from './engine/InputManager';
import TitleScreen from './screens/TitleScreen';
import GameScreen from './screens/GameScreen';
import GameOverScreen from './screens/GameOverScreen';
import LevelCompleteScreen from './screens/LevelCompleteScreen';

export default function App() {
  const engineRef = useRef(null);
  const inputRef = useRef(null);

  if (!engineRef.current) {
    engineRef.current = new GameEngine();
  }
  if (!inputRef.current) {
    inputRef.current = new InputManager();
  }

  const [screen, setScreen] = useState('menu');
  const [gameState, setGameState] = useState(null);

  const engine = engineRef.current;
  const input = inputRef.current;

  // Cleanup on unmount
  useEffect(() => {
    return () => inputRef.current?.stop();
  }, []);

  const handleStart = useCallback(() => {
    engine.startGame();
    input.start();
    input.paused = false;
    setScreen('playing');
    setGameState(engine.getState());
  }, [engine, input]);

  const handleMenu = useCallback(() => {
    input.stop();
    setScreen('menu');
  }, [input]);

  const handleRestart = useCallback(() => {
    engine.restart();
    input.start();
    input.paused = false;
    setScreen('playing');
    setGameState(engine.getState());
  }, [engine, input]);

  const handleNextLevel = useCallback(() => {
    engine.nextLevel();
    input.paused = false;
    setScreen('playing');
    setGameState(engine.getState());
  }, [engine, input]);

  const handleStateChange = useCallback((s) => {
    setGameState({ ...s });
    if (s.state === 'gameover') {
      input.paused = true;
      setScreen('gameover');
    } else if (s.state === 'levelComplete' || s.state === 'victory') {
      input.paused = true;
      setScreen('levelComplete');
    }
  }, [input]);

  // Focus trap for keyboard events
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (screen === 'menu' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [screen, handleStart]);

  return (
    <div className="game-container" id="game-container">
      <div className="crt-overlay" />

      {screen === 'menu' && (
        <TitleScreen
          onStart={handleStart}
          highScore={engine?.getHighScore() || 0}
        />
      )}

      {(screen === 'playing' || screen === 'gameover' || screen === 'levelComplete') && engine && input && (
        <GameScreen
          engine={engine}
          inputManager={input}
          onStateChange={handleStateChange}
        />
      )}

      {screen === 'gameover' && gameState && (
        <GameOverScreen
          score={gameState.score}
          levelIndex={gameState.levelIndex}
          onRestart={handleRestart}
          onMenu={handleMenu}
        />
      )}

      {screen === 'levelComplete' && gameState && (
        <LevelCompleteScreen
          levelName={gameState.levelName}
          levelScore={gameState.levelScore}
          timeBonus={gameState.timeBonus}
          coinsCollected={gameState.coinsCollected}
          totalCoins={gameState.totalCoins}
          isLast={gameState.state === 'victory'}
          onNext={handleNextLevel}
          onMenu={handleMenu}
        />
      )}
    </div>
  );
}
