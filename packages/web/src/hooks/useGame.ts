/**
 * Game Management Hooks
 * React hooks for managing game state, scene lifecycle, and UI updates
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { GameModeManager, GameMode, GameState } from '@/games/GameModeManager';

/**
 * useGameMode Hook
 * Initialize and manage game mode manager
 */
export const useGameMode = () => {
  const managerRef = useRef<GameModeManager | null>(null);
  const [currentMode, setCurrentMode] = useState<GameMode | null>(null);
  const [uiData, setUIData] = useState<unknown>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize manager on first mount
  useEffect(() => {
    managerRef.current = new GameModeManager(
      (mode, data) => {
        setCurrentMode(mode);
        setUIData(data);
      },
      (from, to) => {
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    );

    return () => {
      managerRef.current?.dispose();
    };
  }, []);

  const initializeGame = useCallback((mode: GameMode, state: GameState) => {
    managerRef.current?.initializeGame(mode, state);
  }, []);

  const switchMode = useCallback((mode: GameMode, state: GameState) => {
    managerRef.current?.switchMode(mode, state);
  }, []);

  const getScene = useCallback(() => {
    return managerRef.current?.getCurrentScene();
  }, []);

  const dispose = useCallback(() => {
    managerRef.current?.dispose();
  }, []);

  return {
    manager: managerRef.current,
    currentMode,
    uiData,
    isTransitioning,
    initializeGame,
    switchMode,
    getScene,
    dispose
  };
};

/**
 * useGameSocket Hook
 * Handle real-time game state updates from Socket.IO
 */
export const useGameSocket = (
  socket: any,
  mode: GameMode | null,
  onStateUpdate: (newState: GameState) => void
) => {
  useEffect(() => {
    if (!socket || !mode) return;

    // Listen for game state updates
    const handleGameStateUpdate = (payload: GameState) => {
      onStateUpdate(payload);
    };

    // Listen for phase transitions
    const handlePhaseTransition = (payload: { phase: string }) => {
      onStateUpdate((prev) => ({
        ...prev,
        phase: payload.phase
      }));
    };

    // Listen for timer updates
    const handleTimerUpdate = (payload: { elapsedTime: number }) => {
      onStateUpdate((prev) => ({
        ...prev,
        elapsedTime: payload.elapsedTime
      }));
    };

    socket.on(`game:state:${mode}`, handleGameStateUpdate);
    socket.on(`game:phase`, handlePhaseTransition);
    socket.on(`game:timer`, handleTimerUpdate);

    return () => {
      socket.off(`game:state:${mode}`, handleGameStateUpdate);
      socket.off(`game:phase`, handlePhaseTransition);
      socket.off(`game:timer`, handleTimerUpdate);
    };
  }, [socket, mode, onStateUpdate]);
};

/**
 * useGameAction Hook
 * Send game actions back to server via Socket.IO
 */
export const useGameAction = (socket: any, mode: GameMode | null) => {
  const sendAction = useCallback(
    (action: string, payload: unknown) => {
      if (!socket || !mode) return;

      socket.emit(`game:action:${mode}`, {
        action,
        payload
      });
    },
    [socket, mode]
  );

  return { sendAction };
};

/**
 * useGamePhase Hook
 * Track and manage game phases
 */
export const useGamePhase = (
  gameState: any,
  onPhaseChange?: (phase: string) => void
) => {
  const [phase, setPhase] = useState<string | null>(null);

  useEffect(() => {
    if (gameState?.phase && gameState.phase !== phase) {
      setPhase(gameState.phase);
      onPhaseChange?.(gameState.phase);
    }
  }, [gameState?.phase, phase, onPhaseChange]);

  return phase;
};

/**
 * useGameTimer Hook
 * Manage phase timers with countdowns
 */
export const useGameTimer = (
  totalDuration: number,
  onTimeUp?: () => void
) => {
  const [timeRemaining, setTimeRemaining] = useState(totalDuration);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeRemaining(totalDuration);
    setProgress(100);
  }, [totalDuration]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      onTimeUp?.();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
      setProgress((prev) => Math.max(0, prev - (1 / totalDuration) * 100));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timeRemaining, totalDuration, onTimeUp]);

  return { timeRemaining, progress };
};

/**
 * useGamePlayers Hook
 * Track player roster and presence
 */
export const useGamePlayers = (players: any[] = []) => {
  const [playerMap, setPlayerMap] = useState(new Map());

  useEffect(() => {
    const map = new Map();
    players.forEach((player) => {
      map.set(player.id, player);
    });
    setPlayerMap(map);
  }, [players]);

  const getPlayer = useCallback(
    (playerId: string) => {
      return playerMap.get(playerId);
    },
    [playerMap]
  );

  const getPlayerColor = useCallback(
    (playerId: string) => {
      return playerMap.get(playerId)?.color || '#888888';
    },
    [playerMap]
  );

  const getPlayerNickname = useCallback(
    (playerId: string) => {
      return playerMap.get(playerId)?.nickname || 'Unknown';
    },
    [playerMap]
  );

  const isPlayerAlive = useCallback(
    (playerId: string) => {
      const player = playerMap.get(playerId);
      return player ? !player.isEliminated : false;
    },
    [playerMap]
  );

  return {
    playerMap,
    playerCount: players.length,
    players,
    getPlayer,
    getPlayerColor,
    getPlayerNickname,
    isPlayerAlive
  };
};

/**
 * useGameScore Hook
 * Manage scoring and leaderboard
 */
export const useGameScore = (players: any[] = []) => {
  const [scores, setScores] = useState<Array<{ nickname: string; score: number; rank: number }>>([]);

  useEffect(() => {
    const sorted = [...players]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map((player, idx) => ({
        nickname: player.nickname,
        score: player.score || 0,
        rank: idx + 1
      }));

    setScores(sorted);
  }, [players]);

  const getPlayerRank = useCallback(
    (playerId: string) => {
      const idx = players.findIndex((p) => p.id === playerId);
      return idx >= 0 ? idx + 1 : null;
    },
    [players]
  );

  const getLeader = useCallback(() => {
    return scores.length > 0 ? scores[0] : null;
  }, [scores]);

  return {
    scores,
    getPlayerRank,
    getLeader
  };
};

/**
 * useGameVote Hook
 * Manage voting logic across game modes
 */
export const useGameVote = (
  maxVotesPerPlayer: number = 1
) => {
  const [votes, setVotes] = useState(new Map<string, string[]>()); // playerId -> [targetIds]

  const addVote = useCallback(
    (voterId: string, targetId: string) => {
      setVotes((prev) => {
        const newVotes = new Map(prev);
        const voterVotes = newVotes.get(voterId) || [];

        if (voterVotes.length < maxVotesPerPlayer) {
          voterVotes.push(targetId);
          newVotes.set(voterId, [...voterVotes]);
        }

        return newVotes;
      });
    },
    [maxVotesPerPlayer]
  );

  const removeVote = useCallback(
    (voterId: string, targetId: string) => {
      setVotes((prev) => {
        const newVotes = new Map(prev);
        const voterVotes = newVotes.get(voterId) || [];

        newVotes.set(
          voterId,
          voterVotes.filter((v) => v !== targetId)
        );

        return newVotes;
      });
    },
    []
  );

  const getVoteCount = useCallback(
    (targetId: string) => {
      let count = 0;
      votes.forEach((targetIds) => {
        count += targetIds.filter((id) => id === targetId).length;
      });
      return count;
    },
    [votes]
  );

  const getVotesForTarget = useCallback(
    (targetId: string) => {
      const voters: string[] = [];
      votes.forEach((targetIds, voterId) => {
        if (targetIds.includes(targetId)) {
          voters.push(voterId);
        }
      });
      return voters;
    },
    [votes]
  );

  const clearVotes = useCallback(() => {
    setVotes(new Map());
  }, []);

  return {
    votes,
    addVote,
    removeVote,
    getVoteCount,
    getVotesForTarget,
    clearVotes
  };
};

/**
 * useGameAnimation Hook
 * Manage phase transition animations
 */
export const useGameAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<string | null>(null);

  const triggerAnimation = useCallback(
    (type: 'reveal' | 'eliminate' | 'celebrate' | 'transition', duration: number = 800) => {
      setAnimationType(type);
      setIsAnimating(true);

      setTimeout(() => {
        setIsAnimating(false);
        setAnimationType(null);
      }, duration);
    },
    []
  );

  return {
    isAnimating,
    animationType,
    triggerAnimation
  };
};
