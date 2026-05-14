"use client";

import type { RoomState } from "@yapzi/shared";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { PlayerAvatar, ProgressBar, ScoreBoard, TimerDisplay } from "@/components/GameUIComponents";
import { describePhase, gameModeLabels } from "@/lib/gameEngine";

function getTimeRemaining(room: RoomState) {
  if (!room.game?.round.startedAt || !room.game.round.endsAt) {
    return 0;
  }

  const endsAt = Date.parse(room.game.round.endsAt);
  const startedAt = Date.parse(room.game.round.startedAt);
  if (Number.isNaN(endsAt) || Number.isNaN(startedAt)) {
    return 0;
  }

  return Math.max(0, (endsAt - Date.now()) / 1000);
}

function getTotalDuration(room: RoomState) {
  if (!room.game?.round.startedAt || !room.game.round.endsAt) {
    return room.settings.roundLengthSec ?? 60;
  }

  const endsAt = Date.parse(room.game.round.endsAt);
  const startedAt = Date.parse(room.game.round.startedAt);
  if (Number.isNaN(endsAt) || Number.isNaN(startedAt)) {
    return room.settings.roundLengthSec ?? 60;
  }

  return Math.max(1, (endsAt - startedAt) / 1000);
}

export function GameModeHUD({ room }: { room: RoomState }) {
  const game = room.game;
  if (!game) return null;

  const round = game.round;
  const modeLabel = gameModeLabels[game.mode] ?? game.mode;
  const phaseLabel = describePhase(round.phase);
  const timeRemaining = getTimeRemaining(room);
  const totalDuration = getTotalDuration(room);
  const currentPrompt = round.prompt ?? "Stay chaotic.";
  const scores = room.players
    .map((player) => ({
      nickname: player.nickname,
      score: room.game?.scoreboard[player.id] ?? player.score
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="hud-card mission-brief space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="cyan">{modeLabel}</Badge>
            <Badge variant="lime">{phaseLabel}</Badge>
            <Badge variant="pink">Round {round.number}</Badge>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{currentPrompt}</h2>
          <p className="text-sm text-text-secondary">
            {room.players.length} players in the arena · {room.queue.length} queued modes
          </p>
        </div>

        <div className="w-full max-w-[180px]">
          <TimerDisplay timeRemaining={timeRemaining} totalDuration={totalDuration} phase={round.phase} />
        </div>
      </div>

      <ProgressBar current={Math.max(0, totalDuration - timeRemaining)} total={totalDuration} label="Round clock" />

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-3 bg-panel/80">
          <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">Crew Board</h3>
          <div className="flex flex-wrap gap-3">
            {room.players.map((player) => (
              <PlayerAvatar
                key={player.id}
                nickname={player.nickname}
                color={player.color}
                status={player.isReady ? "alive" : "waiting"}
                size="sm"
              />
            ))}
          </div>
        </Card>

        <ScoreBoard scores={scores} />
      </div>
    </div>
  );
}
