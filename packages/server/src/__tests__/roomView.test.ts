import { describe, expect, it } from "vitest";
import { createPlayer, createRoom, defaultSettings } from "../roomUtils";
import { createGameSession } from "../gameEngine";
import { createRoomViewForPlayer } from "../roomView";

describe("room view", () => {
  it("hides imposter identity and secret word from non-imposters during hidden phases", () => {
    const host = createPlayer("Host", true);
    const room = createRoom(host, defaultSettings, ["imposter"]);
    const p2 = createPlayer("P2", false);
    const p3 = createPlayer("P3", false);
    room.players.push(p2, p3);
    room.game = createGameSession("imposter", ["imposter"], room);
    if (!room.game) throw new Error("Expected game session");

    room.game.round.phase = "vote";
    room.game.round.payload = {
      commonWord: "pizza",
      imposterWord: "burger",
      imposterId: p3.id,
      votes: [{ playerId: host.id, targetId: p3.id }]
    };

    const hostView = createRoomViewForPlayer(room, host.id);
    const imposterView = createRoomViewForPlayer(room, p3.id);

    expect(hostView.game?.round.payload?.commonWord).toBe("pizza");
    expect(hostView.game?.round.payload?.imposterId).toBeUndefined();
    expect(hostView.game?.round.payload?.imposterWord).toBeUndefined();
    expect(hostView.game?.round.payload?.votes).toBeUndefined();

    expect(imposterView.game?.round.payload?.imposterId).toBe(p3.id);
    expect(imposterView.game?.round.payload?.imposterWord).toBe("burger");
    expect(imposterView.game?.round.payload?.votes).toBeUndefined();
  });

  it("reveals imposter details after reveal phase starts", () => {
    const host = createPlayer("Host", true);
    const room = createRoom(host, defaultSettings, ["imposter"]);
    const p2 = createPlayer("P2", false);
    room.players.push(p2);
    room.game = createGameSession("imposter", ["imposter"], room);
    if (!room.game) throw new Error("Expected game session");

    room.game.round.phase = "reveal";
    room.game.round.payload = {
      commonWord: "cat",
      imposterWord: "dog",
      imposterId: p2.id
    };

    const hostView = createRoomViewForPlayer(room, host.id);
    expect(hostView.game?.round.payload?.imposterId).toBe(p2.id);
    expect(hostView.game?.round.payload?.imposterWord).toBe("dog");
  });
});
