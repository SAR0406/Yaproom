/**
 * Reusable Game UI Components
 * Shared components for voting, timers, decisions, animations across all game modes
 */

import React from 'react';

/**
 * VotingBoard Component
 * Displays players and vote counts for voting-based games
 */
export const VotingBoard: React.FC<{
  players: Array<{ id: string; nickname: string; color: string; voteCount: number }>;
  onVote: (playerId: string) => void;
  selectedId?: string;
  isLocked?: boolean;
  className?: string;
}> = ({ players, onVote, selectedId, isLocked, className = '' }) => {
  return (
    <div className={`voting-board hud-card ${className}`}>
      <h3 className="text-lg font-mono font-bold mb-4 text-ink">VOTING BOARD</h3>
      <div className="grid grid-cols-2 gap-3">
        {players.map((player) => (
          <button
            key={player.id}
            onClick={() => onVote(player.id)}
            disabled={isLocked}
            className={`voting-button ${selectedId === player.id ? 'active' : ''} ${
              isLocked ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ borderLeft: `4px solid ${player.color}` }}
          >
            <div className="font-bold text-sm">{player.nickname}</div>
            <div className="text-xs opacity-75">Votes: {player.voteCount}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * TimerDisplay Component
 * Circular progress timer for phase durations
 */
export const TimerDisplay: React.FC<{
  timeRemaining: number;
  totalDuration: number;
  phase?: string;
  className?: string;
}> = ({ timeRemaining, totalDuration, phase, className = '' }) => {
  const progress = Math.max(0, Math.min(100, (timeRemaining / totalDuration) * 100));
  const circumference = 2 * Math.PI * 45; // radius 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`timer-display flex flex-col items-center ${className}`}>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="opacity-20"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-100"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-mono font-bold">
            {Math.ceil(timeRemaining)}s
          </div>
          {phase && <div className="text-xs opacity-75 uppercase">{phase}</div>}
        </div>
      </div>
    </div>
  );
};

/**
 * DecisionButton Component
 * Binary choice button (Split/Steal, Yes/No, A/B, etc.)
 */
export const DecisionButton: React.FC<{
  label: string;
  color: string;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({ label, color, onClick, selected, disabled, className = '' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`decision-button hud-card ${selected ? 'active' : ''} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      style={{
        borderLeft: `6px solid ${color}`,
        background: selected ? `${color}22` : undefined
      }}
    >
      <div className="font-bold text-xl">{label}</div>
    </button>
  );
};

/**
 * PlayerAvatar Component
 * Displays player with color coding
 */
export const PlayerAvatar: React.FC<{
  nickname: string;
  color: string;
  status?: 'alive' | 'eliminated' | 'voting' | 'waiting';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ nickname, color, status, size = 'md', className = '' }) => {
  const sizeClass = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  }[size];

  return (
    <div className={`player-avatar flex flex-col items-center gap-1 ${className}`}>
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shadow-md ${
          status === 'eliminated' ? 'opacity-40' : ''
        }`}
        style={{ backgroundColor: color }}
      >
        {nickname.substring(0, 2).toUpperCase()}
      </div>
      <div className={`text-xs font-mono text-center ${status === 'eliminated' ? 'line-through' : ''}`}>
        {nickname}
      </div>
      {status && (
        <div className="text-xs opacity-60 uppercase">{status}</div>
      )}
    </div>
  );
};

/**
 * ScoreBoard Component
 * Ranked player scores
 */
export const ScoreBoard: React.FC<{
  scores: Array<{ nickname: string; score: number; rank?: number }>;
  className?: string;
}> = ({ scores, className = '' }) => {
  return (
    <div className={`scoreboard hud-card ${className}`}>
      <h3 className="text-lg font-mono font-bold mb-4 text-ink">SCORES</h3>
      <div className="space-y-2">
        {scores.map((entry, idx) => (
          <div key={entry.nickname} className="flex items-center justify-between p-2 bg-panel rounded">
            <div className="flex items-center gap-2">
              <div className="font-bold text-lg w-6">#{idx + 1}</div>
              <div className="text-sm">{entry.nickname}</div>
            </div>
            <div className="font-mono font-bold text-lg">{entry.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * MessageBoard Component
 * Chat/discussion messages
 */
export const MessageBoard: React.FC<{
  messages: Array<{ playerId: string; nickname: string; text: string; timestamp?: number }>;
  className?: string;
}> = ({ messages, className = '' }) => {
  return (
    <div className={`message-board hud-card comms-panel overflow-auto max-h-64 ${className}`}>
      <h3 className="text-lg font-mono font-bold mb-4 sticky top-0 bg-panel pb-2">COMMS</h3>
      <div className="space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="text-sm border-l-2 border-pink pl-2">
            <div className="font-bold text-pink">{msg.nickname}</div>
            <div className="text-xs opacity-75">{msg.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ProgressBar Component
 * Visual progress for rounds/phases
 */
export const ProgressBar: React.FC<{
  current: number;
  total: number;
  label?: string;
  className?: string;
}> = ({ current, total, label, className = '' }) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={`progress-bar ${className}`}>
      {label && <div className="text-xs font-mono font-bold mb-1">{label}</div>}
      <div className="w-full bg-panel rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan to-pink transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-right font-mono mt-1">
        {current}/{total}
      </div>
    </div>
  );
};

/**
 * ConfessionCard Component
 * Animated card reveal for confession-like games
 */
export const ConfessionCard: React.FC<{
  id: string;
  text: string;
  revealed?: boolean;
  authorName?: string;
  votes?: number;
  onReveal?: () => void;
  className?: string;
}> = ({ id, text, revealed, authorName, votes, onReveal, className = '' }) => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  const handleClick = () => {
    if (!revealed) {
      setIsFlipped(!isFlipped);
      onReveal?.();
    }
  };

  return (
    <div
      className={`confession-card hud-card cursor-pointer perspective ${className}`}
      onClick={handleClick}
      style={{
        minHeight: '200px',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 0.6s'
      }}
    >
      {!isFlipped || !revealed ? (
        <div className="flex items-center justify-center h-full text-center">
          <div className="font-bold text-lg opacity-50">?</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="text-sm leading-relaxed">{text}</div>
          {authorName && (
            <div className="text-xs opacity-60 italic">— {authorName}</div>
          )}
          {votes !== undefined && (
            <div className="text-xs font-bold text-pink">Votes: {votes}</div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * PollVisualization Component
 * Horizontal bar chart for poll results
 */
export const PollVisualization: React.FC<{
  options: Array<{ label: string; votes: number; percentage?: number }>;
  winner?: string;
  className?: string;
}> = ({ options, winner, className = '' }) => {
  const maxVotes = Math.max(...options.map((o) => o.votes), 1);

  return (
    <div className={`poll-visualization space-y-3 ${className}`}>
      {options.map((option) => {
        const percentage = (option.votes / maxVotes) * 100;
        const isWinner = winner === option.label;

        return (
          <div key={option.label} className="flex items-center gap-3">
            <div className="text-sm font-mono w-24 text-right font-bold">{option.label}</div>
            <div className="flex-1">
              <div className="w-full bg-panel rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isWinner
                      ? 'bg-gradient-to-r from-lime to-cyan'
                      : 'bg-gradient-to-r from-pink to-orange'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <div className="text-sm font-mono w-12 text-right">{option.votes}</div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * ParticleEffect Component
 * Celebratory particle animation
 */
export const ParticleEffect: React.FC<{
  type: 'celebrate' | 'eliminate' | 'vote';
  duration?: number;
  className?: string;
}> = ({ type, duration = 2, className = '' }) => {
  const particles = Array.from({ length: 12 }, (_, i) => i);

  const colors = {
    celebrate: ['var(--lime)', 'var(--cyan)', 'var(--gold)'],
    eliminate: ['var(--pink)', 'var(--orange)', 'var(--ink)'],
    vote: ['var(--cyan)', 'var(--pink)', 'var(--lime)']
  };

  return (
    <div className={`particle-effect pointer-events-none ${className}`}>
      {particles.map((i) => (
        <div
          key={i}
          className="particle absolute w-2 h-2 rounded-full"
          style={{
            left: '50%',
            top: '50%',
            backgroundColor: colors[type][i % colors[type].length],
            animation: `particle-burst ${duration}s ease-out forwards`,
            animationDelay: `${(i / particles.length) * duration * 0.5}s`,
            transform: `translate(-50%, -50%)`
          }}
        />
      ))}
    </div>
  );
};

/**
 * CSS Animations (add to globals.css)
 * @keyframes particle-burst {
 *   0% {
 *     opacity: 1;
 *     transform: translate(-50%, -50%) scale(1);
 *   }
 *   100% {
 *     opacity: 0;
 *     transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0);
 *   }
 * }
 */
