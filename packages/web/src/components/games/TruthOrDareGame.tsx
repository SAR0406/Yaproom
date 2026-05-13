"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TruthOrDareGameState, TruthOrDareSpiceLevel, TruthOrDareChoice } from "@yapzi/shared";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { PromptCard } from "@/components/PromptCard";
import {
  truthOrDareSpin,
  truthOrDareChoose,
  truthOrDareComplete,
  truthOrDareSkip,
  truthOrDareCustomPrompt,
  truthOrDareSetSpice,
} from "@/lib/roomActions";

interface TruthOrDareGameProps {
  playerId: string;
  gameState: TruthOrDareGameState;
  players: Array<{ id: string; nickname: string }>;
}

const SPICE_LABELS: Record<TruthOrDareSpiceLevel, { label: string; emoji: string; color: string }> = {
  family: { label: "Family Friendly", emoji: "🛡️", color: "text-lime" },
  spicy: { label: "Spicy", emoji: "🌶️", color: "text-amber" },
  savage: { label: "Savage", emoji: "💀", color: "text-magenta" },
};

const SPICE_ORDER: TruthOrDareSpiceLevel[] = ["family", "spicy", "savage"];

export function TruthOrDareGame({ playerId, gameState, players }: TruthOrDareGameProps) {
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customType, setCustomType] = useState<TruthOrDareChoice>("truth");
  const [spinning, setSpinning] = useState(false);

  const currentPlayer = players.find((p) => p.id === gameState.currentPlayerId);
  const isMyTurn = gameState.currentPlayerId === playerId;
  const isSpinner = !gameState.currentPlayerId; // No one selected yet — time to spin

  const handleSpin = useCallback(() => {
    setSpinning(true);
    truthOrDareSpin({ playerId });
    // Reset spinning after animation
    setTimeout(() => setSpinning(false), 1500);
  }, [playerId]);

  const handleChoose = useCallback(
    (choice: TruthOrDareChoice) => {
      if (!isMyTurn) return;
      truthOrDareChoose({ playerId, choice });
    },
    [playerId, isMyTurn]
  );

  const handleComplete = useCallback(() => {
    if (!isMyTurn) return;
    truthOrDareComplete({ playerId });
  }, [playerId, isMyTurn]);

  const handleSkip = useCallback(() => {
    if (!isMyTurn) return;
    truthOrDareSkip({ playerId });
  }, [playerId, isMyTurn]);

  const handleSetSpice = useCallback(
    (level: TruthOrDareSpiceLevel) => {
      truthOrDareSetSpice({ spiceLevel: level });
    },
    []
  );

  const handleCustomPrompt = useCallback(() => {
    if (!customText.trim()) return;
    truthOrDareCustomPrompt({ playerId, text: customText.trim(), type: customType });
    setCustomText("");
    setShowCustomPrompt(false);
  }, [playerId, customText, customType]);

  const spice = SPICE_LABELS[gameState.spiceLevel];

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {/* Main game area */}
      <div className="space-y-4">
        {/* Spice level selector */}
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                Spice Level
              </span>
              <span className={`text-lg font-bold ${spice.color}`}>
                {spice.emoji} {spice.label}
              </span>
            </div>
            <div className="flex gap-1">
              {SPICE_ORDER.map((level) => (
                <button
                  key={level}
                  onClick={() => handleSetSpice(level)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    gameState.spiceLevel === level
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : "bg-surface text-muted hover:text-foreground border border-white/10"
                  }`}
                >
                  {SPICE_LABELS[level].emoji}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Spin wheel / prompt area */}
        {isSpinner && !gameState.currentPrompt && (
          <Card variant="magenta" padding="lg" className="text-center">
            <motion.div
              animate={spinning ? { rotate: [0, 720, 1440] } : {}}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full border-4 border-magenta/40 bg-surface text-5xl"
            >
              🎡
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground">Spin the Wheel!</h2>
            <p className="mt-2 text-sm text-muted">
              The wheel picks who faces truth or dare next
            </p>
            <Button
              size="xl"
              variant="primary"
              className="mt-6"
              onClick={handleSpin}
              loading={spinning}
            >
              {spinning ? "Spinning..." : "🎯 Spin the Wheel"}
            </Button>
          </Card>
        )}

        {/* Choice phase: truth or dare */}
        {isMyTurn && !gameState.currentChoice && gameState.currentPlayerId && (
          <Card variant="cyan" padding="lg" className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4 text-4xl"
            >
              🎯
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground">It&apos;s your turn!</h2>
            <p className="mt-2 text-sm text-muted">
              Choose your fate wisely...
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button
                size="xl"
                variant="primary"
                onClick={() => handleChoose("truth")}
              >
                🛡️ Truth
              </Button>
              <Button
                size="xl"
                variant="danger"
                onClick={() => handleChoose("dare")}
              >
                🔥 Dare
              </Button>
            </div>
          </Card>
        )}

        {/* Prompt reveal */}
        {gameState.currentPrompt && (
          <AnimatePresence mode="wait">
            <motion.div
              key={gameState.currentPrompt.id}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <PromptCard className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                    {gameState.currentChoice === "truth" ? "🛡️ Truth" : "🔥 Dare"}
                  </span>
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted uppercase tracking-wider">
                    {spice.emoji} {spice.label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground leading-relaxed">
                  {gameState.currentPrompt.text}
                </p>
                {gameState.currentPrompt.isCustom && (
                  <p className="text-xs text-muted">
                    Custom prompt by {players.find((p) => p.id === gameState.currentPrompt?.submittedBy)?.nickname ?? "someone"}
                  </p>
                )}
              </PromptCard>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Action buttons when prompt is active */}
        {gameState.currentPrompt && isMyTurn && (
          <div className="flex justify-center gap-3">
            <Button variant="success" size="lg" onClick={handleComplete}>
              ✅ Done
            </Button>
            <Button variant="danger" size="lg" onClick={handleSkip}>
              ⏭️ Skip
            </Button>
          </div>
        )}

        {/* Waiting state when it's someone else's turn */}
        {!isMyTurn && gameState.currentPlayerId && gameState.currentPrompt && (
          <Card padding="lg" className="text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-4xl mb-3"
            >
              👀
            </motion.div>
            <p className="text-lg font-semibold text-foreground">
              {currentPlayer?.nickname ?? "Someone"} is up!
            </p>
            <p className="mt-1 text-sm text-muted">
              {gameState.currentChoice === "truth"
                ? "They chose to spill the truth..."
                : "They chose a daring challenge..."}
            </p>
          </Card>
        )}

        {/* Custom prompt section */}
        <Card padding="sm">
          <button
            onClick={() => setShowCustomPrompt(!showCustomPrompt)}
            className="flex w-full items-center justify-between text-sm font-semibold text-muted hover:text-foreground transition"
          >
            <span>✏️ Add a custom prompt</span>
            <span className={`transform transition ${showCustomPrompt ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>
          {showCustomPrompt && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-3 space-y-3 overflow-hidden"
            >
              <div className="flex gap-2">
                <button
                  onClick={() => setCustomType("truth")}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    customType === "truth"
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : "bg-surface text-muted border border-white/10"
                  }`}
                >
                  🛡️ Truth
                </button>
                <button
                  onClick={() => setCustomType("dare")}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    customType === "dare"
                      ? "bg-danger/20 text-danger border border-danger/40"
                      : "bg-surface text-muted border border-white/10"
                  }`}
                >
                  🔥 Dare
                </button>
              </div>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={`Write a ${customType} prompt...`}
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none resize-none"
                rows={2}
              />
              <Button
                size="sm"
                variant="primary"
                onClick={handleCustomPrompt}
                disabled={!customText.trim()}
              >
                Submit Custom Prompt
              </Button>
            </motion.div>
          )}
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Player order */}
        <Card title="Player Order" padding="sm">
          <div className="space-y-2">
            {gameState.playerOrder.map((pid, idx) => {
              const player = players.find((p) => p.id === pid);
              const isCurrent = pid === gameState.currentPlayerId;
              const completed = gameState.completedActions?.[pid] ?? 0;
              return (
                <div
                  key={pid}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 transition ${
                    isCurrent
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-surface border border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted w-5">{idx + 1}.</span>
                    <span className={`text-sm font-semibold ${isCurrent ? "text-primary" : "text-foreground"}`}>
                      {player?.nickname ?? "Unknown"}
                    </span>
                    {isCurrent && (
                      <span className="text-xs animate-pulse">⚡</span>
                    )}
                  </div>
                  <span className="text-xs text-muted">{completed} done</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Stats */}
        <Card title="Stats" padding="sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface p-3 text-center">
              <p className="text-2xl font-bold text-primary">
                {gameState.playerOrder.length}
              </p>
              <p className="text-xs text-muted">Players</p>
            </div>
            <div className="rounded-xl bg-surface p-3 text-center">
              <p className="text-2xl font-bold text-amber">
                {Object.values(gameState.completedActions ?? {}).reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-xs text-muted">Actions Done</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}