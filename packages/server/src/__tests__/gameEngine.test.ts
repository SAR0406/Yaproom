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
});
