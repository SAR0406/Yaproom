'use client';

/**
 * Drawing Game UI
 * Real-time collaborative drawing with Phaser 4 canvas rendering
 * Includes guessing interface and accuracy scoring
 */

import React, { useState, useEffect } from 'react';
import { DrawingGameScene } from '@/games/DrawingGameScene';
import { usePhaserDrawing } from '@/games/DrawingGamePhaser4';
import { TimerDisplay, ProgressBar } from '@/components/GameUIComponents';

interface DrawingGameUIProps {
  uiData: any;
  onAction: (action: string, payload: unknown) => void;
}

export default function DrawingGameUI({ uiData, onAction }: DrawingGameUIProps) {
  const [guess, setGuess] = useState('');
  const [gameScene] = useState(() => new DrawingGameScene((state) => console.log('Drawing state:', state)));
  const { mountRef, isReady } = usePhaserDrawing({
    gameScene,
    onStrokeComplete: (stroke) => {
      onAction('stroke', { stroke });
    },
    isCurrentUser: uiData?.isCurrentUserArtist || false,
    canDraw: uiData?.phase === 'draw',
    width: 960,
    height: 540
  });

  if (!uiData) return null;

  const handleSubmitGuess = () => {
    if (guess.trim()) {
      onAction('submitGuess', { guess: guess.trim() });
      setGuess('');
    }
  };

  // Draw Phase
  if (uiData.phase === 'draw') {
    return (
      <div className="space-y-4">
        {/* Canvas */}
        <div
          ref={mountRef}
          className="hud-card rounded-[28px_42px_24px_38px] overflow-hidden"
          style={{
            aspectRatio: '16 / 9',
            boxShadow: '10px 10px 0 #111111'
          }}
        />

        {/* Artist Info */}
        <div className="hud-card mission-brief">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-mono text-ink opacity-60">ARTIST</div>
              <div className="text-lg font-bold">{uiData.artistName}</div>
            </div>

            {uiData.timeRemaining && (
              <TimerDisplay
                timeRemaining={uiData.timeRemaining}
                totalDuration={60}
                phase="draw"
                className="w-20 h-20"
              />
            )}
          </div>

          <div className="text-sm opacity-75">
            {uiData.isCurrentUserArtist
              ? 'Draw the prompt and let others guess!'
              : 'Watch carefully and prepare to guess...'}
          </div>
        </div>

        {/* Prompt Display */}
        <div className="hud-card decision-panel bg-gradient-to-r from-cyan to-lime">
          <div className="text-xs font-mono text-ink opacity-80 mb-2">PROMPT</div>
          <div className="text-2xl font-display font-bold text-ink">
            {uiData.prompt || '...'}
          </div>
        </div>
      </div>
    );
  }

  // Guess Phase
  if (uiData.phase === 'guess') {
    return (
      <div className="space-y-4">
        {/* Drawing Display (read-only) */}
        <div
          ref={mountRef}
          className="hud-card rounded-[28px_42px_24px_38px] overflow-hidden opacity-60"
          style={{
            aspectRatio: '16 / 9',
            boxShadow: '10px 10px 0 #111111'
          }}
        />

        {/* Guessing Interface */}
        <div className="hud-card decision-panel">
          <div className="text-xs font-mono text-ink opacity-60 mb-3">WHAT IS IT?</div>

          <div className="flex gap-2">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitGuess()}
              placeholder="Type your guess..."
              className="flex-1 bg-panel border-2 border-ink rounded-lg px-3 py-2 font-mono text-sm"
              autoFocus
            />
            <button
              onClick={handleSubmitGuess}
              disabled={!guess.trim()}
              className="btn btn-primary px-4 py-2 font-bold"
            >
              GUESS
            </button>
          </div>
        </div>

        {/* Progress */}
        {uiData.progress && (
          <ProgressBar
            current={uiData.progress.current}
            total={uiData.progress.total}
            label="GUESSES SUBMITTED"
            className="hud-card"
          />
        )}

        {/* Other Guesses */}
        {uiData.guesses && uiData.guesses.length > 0 && (
          <div className="hud-card comms-panel">
            <h3 className="text-xs font-mono font-bold mb-3 text-ink opacity-60">
              GUESSES
            </h3>
            <div className="space-y-2">
              {uiData.guesses.slice(0, 5).map((g: any, idx: number) => (
                <div
                  key={idx}
                  className="text-xs p-2 bg-panel rounded flex justify-between items-center"
                >
                  <span>{g.guess}</span>
                  <span className={g.isCorrect ? 'text-lime font-bold' : 'opacity-50'}>
                    {g.isCorrect ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Reveal Phase
  if (uiData.phase === 'reveal') {
    return (
      <div className="space-y-4">
        {/* Final Drawing */}
        <div
          ref={mountRef}
          className="hud-card rounded-[28px_42px_24px_38px] overflow-hidden"
          style={{
            aspectRatio: '16 / 9',
            boxShadow: '10px 10px 0 #111111'
          }}
        />

        {/* Answer Reveal */}
        <div className="hud-card mission-brief animate-pulse bg-gradient-to-r from-lime to-cyan">
          <div className="text-center">
            <div className="text-xs font-mono text-ink opacity-80 mb-2">THE ANSWER WAS</div>
            <div className="text-3xl font-display font-bold text-ink">
              {uiData.correctAnswer || '...'}
            </div>
          </div>
        </div>

        {/* Scoring */}
        {uiData.guesses && (
          <div className="hud-card intel-panel">
            <h3 className="text-sm font-mono font-bold mb-3">ACCURACY</h3>
            <div className="space-y-2">
              {uiData.guesses.map((g: any, idx: number) => (
                <div
                  key={idx}
                  className={`text-xs p-2 rounded flex justify-between ${
                    g.isCorrect
                      ? 'bg-lime bg-opacity-20 text-lime'
                      : 'bg-panel'
                  }`}
                >
                  <span>{g.guess}</span>
                  <span className="font-bold">
                    {g.isCorrect ? '+10pts' : `${Math.round(g.similarity || 0)}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Recap Phase
  if (uiData.phase === 'recap') {
    return (
      <div className="space-y-4">
        <div className="hud-card mission-brief">
          <h2 className="text-xl font-display font-bold mb-4">ROUND SUMMARY</h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-panel p-3 rounded text-center">
              <div className="text-xs opacity-60 mb-1">ROUNDS</div>
              <div className="text-lg font-bold">
                {uiData.roundNumber} / {uiData.totalRounds}
              </div>
            </div>
            <div className="bg-panel p-3 rounded text-center">
              <div className="text-xs opacity-60 mb-1">ACCURACY</div>
              <div className="text-lg font-bold text-lime">
                {Math.round((uiData.correctGuesses || 0) / (uiData.totalGuesses || 1) * 100)}%
              </div>
            </div>
          </div>

          {uiData.players && (
            <div>
              <div className="text-xs font-mono font-bold mb-2 opacity-60">
                LEADERBOARD
              </div>
              {uiData.players
                .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
                .slice(0, 5)
                .map((player: any, idx: number) => (
                  <div
                    key={player.id}
                    className="flex justify-between text-sm mb-1"
                  >
                    <span>
                      #{idx + 1} {player.nickname}
                    </span>
                    <span className="font-bold">{player.score || 0}pts</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div className="hud-card">Loading...</div>;
}
