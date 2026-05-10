import { describe, expect, it } from "vitest";
import type { ClientToServerEvents, ServerToClientEvents } from "../events";

describe("socket events", () => {
  it("defines core event maps", () => {
    const clientEvents: keyof ClientToServerEvents = "room:create";
    const serverEvents: keyof ServerToClientEvents = "room:update";

    expect(clientEvents).toBe("room:create");
    expect(serverEvents).toBe("room:update");
  });
});
