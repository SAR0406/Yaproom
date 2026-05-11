import { describe, expect, it } from "vitest";
import { createPlayer, createRoom, defaultSettings } from "../roomUtils";
import { createGameSession, advancePhase } from "../gameEngine";

describe("game engine", () => {
  it("advances through phases and rotates rounds", () => {
    const host = createPlayer("Host", true);
    const room = createRoom(host, defaultSettings, ["imposter"]);
    room.game = createGameSession("imposter", ["imposter"], room);

    const currentPhase = room.game.round.phase;
    const updatedRoom = advancePhase(room);

    expect(updatedRoom.game?.round.phase).not.toBe(currentPhase);
  });

  it("awards crew when imposter gets top vote", () => {
    const host = createPlayer("Host", true);
    const room = createRoom(host, defaultSettings, ["imposter"]);
    const p2 = createPlayer("P2", false);
    const p3 = createPlayer("P3", false);
    room.players.push(p2, p3);
    room.game = createGameSession("imposter", ["imposter"], room);

    if (!room.game) throw new Error("Expected game session");
    room.game.round.phase = "vote";
    room.game.round.payload = {
      imposterId: p3.id,
      votes: [
        { playerId: host.id, targetId: p3.id },
        { playerId: p2.id, targetId: p3.id },
        { playerId: p3.id, targetId: host.id }
      ]
    };

    const updated = advancePhase(room);
    const hostScore = updated.players.find((player) => player.id === host.id)?.score;
    const p2Score = updated.players.find((player) => player.id === p2.id)?.score;
    const p3Score = updated.players.find((player) => player.id === p3.id)?.score;

    expect(hostScore).toBe(2);
    expect(p2Score).toBe(2);
    expect(p3Score).toBe(0);
  });

  it("does not eliminate anyone on vote tie and rewards imposter", () => {
    const host = createPlayer("Host", true);
    const room = createRoom(host, defaultSettings, ["imposter"]);
    const p2 = createPlayer("P2", false);
    const p3 = createPlayer("P3", false);
    room.players.push(p2, p3);
    room.game = createGameSession("imposter", ["imposter"], room);

    if (!room.game) throw new Error("Expected game session");
    room.game.round.phase = "vote";
    room.game.round.payload = {
      imposterId: p3.id,
      votes: [
        { playerId: host.id, targetId: p3.id },
        { playerId: p2.id, targetId: host.id },
        { playerId: p3.id, targetId: host.id }
      ]
    };

    const updated = advancePhase(room);
    const p3Score = updated.players.find((player) => player.id === p3.id)?.score;
    expect(p3Score).toBe(3);
  });
});
