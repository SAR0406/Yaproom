import { describe, expect, it } from "vitest";
import { createPlayer, createRoom, defaultSettings } from "../roomUtils";

describe("room utils", () => {
  it("creates a room with a host player", () => {
    const host = createPlayer("Host", true);
    const room = createRoom(host, defaultSettings, ["imposter"]);

    expect(room.hostId).toBe(host.id);
    expect(room.players).toHaveLength(1);
    expect(room.players[0]?.nickname).toBe("Host");
    expect(room.settings.maxPlayers).toBe(defaultSettings.maxPlayers);
    expect(room.queue).toEqual(["imposter"]);
  });
});
