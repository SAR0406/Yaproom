"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { resolveBackendOrigin } from "@/lib/backendUrl";
import "./admin.css";

type RoomSummary = {
  code: string;
  status: "open" | "locked" | "ended";
  players: number;
  hostId: string;
};

type RoomDetail = {
  code: string;
  status: "open" | "locked" | "ended";
  hostId: string;
  settings: {
    chaosLevel?: "low" | "medium" | "high";
    roundLengthSec?: number;
    allowLateJoin?: boolean;
    allowSpectators?: boolean;
    anonymousMode?: boolean;
    voiceEnabled?: boolean;
  };
  players: Array<{
    id: string;
    nickname: string;
    isHost: boolean;
    isMuted: boolean;
    score: number;
    isConnected: boolean;
  }>;
};

type Overview = {
  rooms: number;
  connectedSockets: number;
};

type LoginResponse = {
  ok: true;
  token: string;
  expiresAt: number;
  username: string;
};

const STORAGE_KEY = "yapzi_admin_token";

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [selectedRoomCode, setSelectedRoomCode] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<RoomDetail | null>(null);
  const [noticeMessage, setNoticeMessage] = useState("");
  const [targetPlayerId, setTargetPlayerId] = useState("");
  const [activity, setActivity] = useState<string[]>([]);

  const [visualMode, setVisualMode] = useState<"gold" | "cyan" | "pink">("gold");
  const [contrastMode, setContrastMode] = useState<"normal" | "high">("normal");

  const backendOrigin = useMemo(() => resolveBackendOrigin(), []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setToken(saved);
    }
  }, []);

  useEffect(() => {
    document.body.dataset.adminVisual = visualMode;
    document.body.dataset.adminContrast = contrastMode;
    return () => {
      delete document.body.dataset.adminVisual;
      delete document.body.dataset.adminContrast;
    };
  }, [visualMode, contrastMode]);

  useEffect(() => {
    if (!token) return;

    void (async () => {
      const session = await apiCall<{ ok: true }>("/admin/session", { method: "GET" }, token);
      if (!session.ok) {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setAuthError("Session expired. Please log in again.");
        return;
      }

      await refreshDashboard(token);
    })();
  }, [token]);

  async function refreshDashboard(authToken: string) {
    const [overviewResp, roomsResp] = await Promise.all([
      apiCall<{ ok: true; rooms: number; connectedSockets: number }>("/admin", { method: "GET" }, authToken),
      apiCall<{ rooms: RoomSummary[] }>("/admin/rooms", { method: "GET" }, authToken)
    ]);

    if (!overviewResp.ok || !roomsResp.ok) {
      addActivity("Failed to refresh dashboard data.");
      return;
    }

    setOverview({
      rooms: overviewResp.data.rooms,
      connectedSockets: overviewResp.data.connectedSockets
    });
    setRooms(roomsResp.data.rooms);

    const nextSelected = selectedRoomCode || roomsResp.data.rooms[0]?.code || "";
    if (nextSelected) {
      setSelectedRoomCode(nextSelected);
      await loadRoom(authToken, nextSelected);
    } else {
      setSelectedRoom(null);
      setTargetPlayerId("");
    }
  }

  async function loadRoom(authToken: string, code: string) {
    const roomResp = await apiCall<{ room: RoomDetail }>(`/admin/rooms/${code}`, { method: "GET" }, authToken);
    if (!roomResp.ok) {
      addActivity(`Unable to load room ${code}.`);
      return;
    }
    setSelectedRoom(roomResp.data.room);
    if (roomResp.data.room.players.length > 0) {
      setTargetPlayerId(roomResp.data.room.players[0]?.id ?? "");
    } else {
      setTargetPlayerId("");
    }
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setAuthError(null);

    const response = await apiCall<LoginResponse>("/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    setBusy(false);

    if (!response.ok) {
      setAuthError(response.error || "Invalid credentials.");
      return;
    }

    localStorage.setItem(STORAGE_KEY, response.data.token);
    setToken(response.data.token);
    setPassword("");
    addActivity(`Logged in as ${response.data.username}.`);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setOverview(null);
    setRooms([]);
    setSelectedRoom(null);
    setSelectedRoomCode("");
    addActivity("Logged out from admin session.");
  }

  async function changeRoomStatus(status: "open" | "locked" | "ended") {
    if (!token || !selectedRoomCode) return;
    const resp = await apiCall<{ ok: true }>(
      `/admin/rooms/${selectedRoomCode}/status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      },
      token
    );
    if (!resp.ok) {
      addActivity(`Status update failed for ${selectedRoomCode}.`);
      return;
    }
    addActivity(`Room ${selectedRoomCode} set to ${status}.`);
    await refreshDashboard(token);
  }

  async function pushAnnouncement() {
    if (!token || !selectedRoomCode || !noticeMessage.trim()) return;
    const resp = await apiCall<{ ok: true }>(
      `/admin/rooms/${selectedRoomCode}/announce`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: noticeMessage.trim() })
      },
      token
    );
    if (!resp.ok) {
      addActivity(`Notice failed: ${resp.error || "Unknown error"}.`);
      return;
    }
    addActivity(`Notice sent to ${selectedRoomCode}.`);
    setNoticeMessage("");
  }

  async function playerAction(kind: "mute" | "kick" | "ban") {
    if (!token || !selectedRoomCode || !targetPlayerId) return;
    const resp = await apiCall<{ ok: true }>(
      `/admin/rooms/${selectedRoomCode}/${kind}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: targetPlayerId })
      },
      token
    );
    if (!resp.ok) {
      addActivity(`${kind.toUpperCase()} failed for ${targetPlayerId}.`);
      return;
    }
    addActivity(`${kind.toUpperCase()} applied to ${targetPlayerId}.`);
    await loadRoom(token, selectedRoomCode);
    await refreshDashboard(token);
  }

  async function patchSettings(patch: Partial<RoomDetail["settings"]>) {
    if (!token || !selectedRoomCode) return;
    const resp = await apiCall<{ ok: true }>(
      `/admin/rooms/${selectedRoomCode}/settings`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      },
      token
    );
    if (!resp.ok) {
      addActivity("Settings update failed.");
      return;
    }
    addActivity("Room settings updated.");
    await loadRoom(token, selectedRoomCode);
  }

  function addActivity(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    setActivity((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
  }

  if (!token) {
    return (
      <div className="adminScene">
        <div className="bgGlow glowA" />
        <div className="bgGlow glowB" />
        <div className="bgGlow glowC" />

        <section className="loginPanel">
          <h1>Yaproom Control Access</h1>
          <p>Sign in with backend admin credentials to manage live rooms.</p>

          <form className="loginForm" onSubmit={handleLogin}>
            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Frontman" />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your admin password"
              />
            </label>

            <button type="submit" className="brutalBtn primary" disabled={busy}>
              {busy ? "Signing in..." : "Login to Admin"}
            </button>
          </form>

          {authError && <div className="errorBox">{authError}</div>}
          <div className="hintLine">Backend: {backendOrigin}</div>
        </section>
      </div>
    );
  }

  return (
    <div className="adminScene">
      <div className="bgGlow glowA" />
      <div className="bgGlow glowB" />
      <div className="bgGlow glowC" />

      <div className="consoleShell">
        <aside className="sideRail">
          <h2>Yaproom HQ</h2>
          <p>Power controls and design controls in one place.</p>

          <div className="metricStack">
            <div className="metricBox">
              <span>Active Rooms</span>
              <strong>{overview?.rooms ?? 0}</strong>
            </div>
            <div className="metricBox">
              <span>Connected Sockets</span>
              <strong>{overview?.connectedSockets ?? 0}</strong>
            </div>
          </div>

          <div className="roomPicker">
            <label>Room</label>
            <select
              value={selectedRoomCode}
              onChange={(e) => {
                const code = e.target.value;
                setSelectedRoomCode(code);
                if (token && code) {
                  void loadRoom(token, code);
                }
              }}
            >
              {rooms.map((room) => (
                <option key={room.code} value={room.code}>
                  {room.code} - {room.players} players - {room.status}
                </option>
              ))}
            </select>
          </div>

          <button className="brutalBtn dark" onClick={() => token && refreshDashboard(token)}>
            Refresh
          </button>
          <button className="brutalBtn danger" onClick={logout}>
            Logout
          </button>
        </aside>

        <main className="mainDeck">
          <section className="panelCard">
            <h3>Yaproom Power</h3>
            <p>Control room state instantly.</p>

            <div className="buttonGrid">
              <button className="brutalBtn success" onClick={() => void changeRoomStatus("open")}>Open Room</button>
              <button className="brutalBtn warn" onClick={() => void changeRoomStatus("locked")}>Lock Room</button>
              <button className="brutalBtn danger" onClick={() => void changeRoomStatus("ended")}>End Room</button>
            </div>
          </section>

          <section className="panelCard">
            <h3>Yaproom Design Controls</h3>
            <p>Update live room behavior and admin visual mode.</p>

            <div className="inlineControls">
              <label>
                Chaos
                <select
                  value={selectedRoom?.settings.chaosLevel ?? "medium"}
                  onChange={(e) => void patchSettings({ chaosLevel: e.target.value as "low" | "medium" | "high" })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>

              <label>
                Round Seconds
                <input
                  type="number"
                  min={15}
                  max={600}
                  defaultValue={selectedRoom?.settings.roundLengthSec ?? 60}
                  onBlur={(e) => {
                    const parsed = Number(e.target.value);
                    if (!Number.isNaN(parsed)) {
                      void patchSettings({ roundLengthSec: parsed });
                    }
                  }}
                />
              </label>
            </div>

            <div className="buttonGrid">
              <button className="brutalBtn accent" onClick={() => void patchSettings({ allowLateJoin: !(selectedRoom?.settings.allowLateJoin ?? true) })}>
                Toggle Late Join
              </button>
              <button className="brutalBtn accent" onClick={() => void patchSettings({ allowSpectators: !(selectedRoom?.settings.allowSpectators ?? false) })}>
                Toggle Spectators
              </button>
              <button className="brutalBtn accent" onClick={() => void patchSettings({ anonymousMode: !(selectedRoom?.settings.anonymousMode ?? false) })}>
                Toggle Anonymous
              </button>
            </div>

            <div className="buttonGrid">
              <button className="brutalBtn light" onClick={() => setVisualMode("gold")}>Gold Theme</button>
              <button className="brutalBtn light" onClick={() => setVisualMode("cyan")}>Cyan Theme</button>
              <button className="brutalBtn light" onClick={() => setVisualMode("pink")}>Pink Theme</button>
              <button className="brutalBtn light" onClick={() => setContrastMode(contrastMode === "high" ? "normal" : "high")}>Toggle Contrast</button>
            </div>
          </section>

          <section className="panelCard">
            <h3>Player Moderation</h3>
            <p>Mute, kick or ban players in the selected room.</p>

            <div className="inlineControls">
              <label>
                Player
                <select value={targetPlayerId} onChange={(e) => setTargetPlayerId(e.target.value)}>
                  {selectedRoom?.players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.nickname} ({player.id.slice(0, 6)})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="buttonGrid">
              <button className="brutalBtn warn" onClick={() => void playerAction("mute")}>Mute</button>
              <button className="brutalBtn danger" onClick={() => void playerAction("kick")}>Kick</button>
              <button className="brutalBtn danger" onClick={() => void playerAction("ban")}>Ban</button>
            </div>
          </section>

          <section className="panelCard">
            <h3>Admin Broadcast</h3>
            <p>Send a notice to everyone in the selected room.</p>

            <div className="inlineControls">
              <label className="wide">
                Message
                <input
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  maxLength={200}
                  placeholder="Server restart in 2 minutes."
                />
              </label>
            </div>

            <button className="brutalBtn primary" onClick={() => void pushAnnouncement()}>
              Send Notice
            </button>
          </section>

          <section className="panelCard">
            <h3>Live Activity</h3>
            <div className="logFeed">
              {activity.length === 0 ? <div className="mutedLine">No activity yet.</div> : null}
              {activity.map((line, idx) => (
                <div key={`${line}-${idx}`} className="logRow">
                  {line}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );

  async function apiCall<T>(path: string, init: RequestInit, authToken?: string): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
    try {
      const headers = new Headers(init.headers || {});
      if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
      }

      const response = await fetch(`${backendOrigin}${path}`, {
        ...init,
        headers
      });

      const json = (await response.json().catch(() => null)) as Record<string, unknown> | null;

      if (!response.ok) {
        const message = typeof json?.error === "string" ? json.error : `Request failed (${response.status})`;
        return { ok: false, error: message };
      }

      return { ok: true, data: json as T };
    } catch {
      return { ok: false, error: "Network request failed" };
    }
  }
}
