/**
 * Game Mode Selector Component
 * Beautiful tile-based UI for selecting which game mode to play
 * Displays metadata: difficulty, player count, duration, description
 */

import React, { useState } from 'react';
import { GAME_MODE_METADATA, GameMode } from '@/games/GameModeManager';

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
  playerCount: number;
  isHost?: boolean;
  className?: string;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  onSelectMode,
  playerCount,
  isHost = false,
  className = ''
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  const modes = (Object.entries(GAME_MODE_METADATA) as Array<[GameMode, typeof GAME_MODE_METADATA[GameMode]]>)
    .map(([mode, metadata]) => ({
      mode,
      ...metadata,
      isAvailable: playerCount >= metadata.minPlayers && playerCount <= metadata.maxPlayers
    }))
    .sort((a, b) => {
      // Show available modes first, then sort by name
      if (a.isAvailable !== b.isAvailable) {
        return a.isAvailable ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

  const handleSelectMode = (mode: GameMode) => {
    if (!isHost) return; // Only host can select
    setSelectedMode(mode);
    onSelectMode(mode);
  };

  return (
    <div className={`game-mode-selector ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold mb-2">Choose Your Game</h2>
        <p className="text-sm opacity-75">
          {playerCount} player{playerCount !== 1 ? 's' : ''} in room
        </p>
      </div>

      {/* Difficulty Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['easy', 'medium', 'hard'].map((difficulty) => (
          <button
            key={difficulty}
            className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-panel hover:bg-cyan hover:text-ink transition-colors"
          >
            {difficulty.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Game Mode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modes.map((gameMode) => {
          const isSelected = selectedMode === gameMode.mode;
          const isDisabled = !gameMode.isAvailable;

          // Difficulty color coding
          const difficultyColor = {
            easy: 'var(--lime)',
            medium: 'var(--gold)',
            hard: 'var(--pink)'
          }[gameMode.difficulty];

          return (
            <button
              key={gameMode.mode}
              onClick={() => handleSelectMode(gameMode.mode)}
              disabled={isDisabled || !isHost}
              className={`game-mode-tile hud-card group cursor-pointer text-left transition-all ${
                isSelected ? 'ring-2' : ''
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${!isHost ? 'cursor-default' : ''}`}
              style={{
                ringColor: isSelected ? difficultyColor : 'transparent',
                borderLeftColor: difficultyColor
              }}
            >
              {/* Mode Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg group-hover:text-pink transition-colors">
                  {gameMode.name}
                </h3>

                {/* Difficulty Badge */}
                <span
                  className="text-xs font-mono font-bold px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: difficultyColor }}
                >
                  {gameMode.difficulty[0].toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed mb-3 opacity-75">
                {gameMode.description}
              </p>

              {/* Metadata */}
              <div className="grid grid-cols-3 gap-2 text-xs mb-3 pb-3 border-t border-opacity-20 border-ink pt-3">
                {/* Player Count */}
                <div>
                  <div className="opacity-60 text-xs">Players</div>
                  <div className="font-mono font-bold">
                    {gameMode.minPlayers}-{gameMode.maxPlayers}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <div className="opacity-60 text-xs">Duration</div>
                  <div className="font-mono font-bold">
                    {Math.round(gameMode.duration / 60)}m
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <div className="opacity-60 text-xs">Status</div>
                  <div className={`font-mono font-bold ${isDisabled ? 'text-pink' : 'text-lime'}`}>
                    {isDisabled
                      ? playerCount < gameMode.minPlayers
                        ? 'Need +' + (gameMode.minPlayers - playerCount)
                        : 'Too many'
                      : 'Ready'}
                  </div>
                </div>
              </div>

              {/* Best For Tags */}
              <div className="flex flex-wrap gap-1">
                {gameMode.bestFor.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-panel rounded-full opacity-60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-lime flex items-center justify-center text-white font-bold">
                  ✓
                </div>
              )}

              {/* Disabled Overlay */}
              {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink bg-opacity-30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold text-center px-2">
                    {playerCount < gameMode.minPlayers
                      ? `Need ${gameMode.minPlayers - playerCount} more`
                      : 'Too many players'}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Start Button */}
      {isHost && selectedMode && (
        <div className="mt-6 flex gap-3">
          <button className="flex-1 btn btn-primary py-3 font-bold text-lg">
            Start {GAME_MODE_METADATA[selectedMode].name}
          </button>
          <button
            onClick={() => setSelectedMode(null)}
            className="flex-1 btn btn-secondary py-3 font-bold text-lg"
          >
            Change
          </button>
        </div>
      )}

      {/* Non-Host Message */}
      {!isHost && (
        <div className="mt-6 p-4 bg-panel rounded-xl text-sm text-center opacity-60">
          Waiting for host to select game...
        </div>
      )}
    </div>
  );
};

/**
 * Game Mode Tile Styles (add to globals.css)
 *
 * .game-mode-tile {
 *   position: relative;
 *   border-left: 6px solid transparent;
 *   overflow: hidden;
 * }
 *
 * .game-mode-tile::before {
 *   content: '';
 *   position: absolute;
 *   top: 0;
 *   right: -100%;
 *   width: 100%;
 *   height: 100%;
 *   background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
 *   transition: right 0.5s;
 * }
 *
 * .game-mode-tile:hover::before {
 *   right: 100%;
 * }
 */
