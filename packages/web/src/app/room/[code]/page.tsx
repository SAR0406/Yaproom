'use client';

import { useState } from 'react';
import { RoomLayout } from '@/components/RoomLayout';
import { Card } from '@/components/Card';
import { PlayerChip } from '@/components/PlayerChip';
import { Button } from '@/components/Button';
import { CopyInviteLink } from '@/components/CopyInviteLink';
import { ReactionBar } from '@/components/ReactionBar';
import { SoundButton } from '@/components/SoundButton';
import { Input } from '@/components/Input';
import { useRoomStore } from '@/stores/roomStore';
import {
  setReady,
  startGame,
  sendReaction,
  updateRoomStatus,
  sendChat
} from '@/lib/roomActions';
import { gameModeLabels } from '@/lib/gameEngine';

export default function LobbyPage() {
  const playerId = useRoomStore((state) => state.playerId);
  const [chatText, setChatText] = useState('');
  const [memeUrl, setMemeUrl] = useState('');

  return (
    <RoomLayout>
      {(room) => {
        const player = room.players.find((p) => p.id === playerId);
        const isHost = player?.isHost;
        const firstMode = room.queue[0];
        const readyCount = room.players.filter((entry) => entry.isReady).length;

        return (
          <div className="gameplay-grid lobby-grid">
            <div className="mission-column space-y-4">
              <Card className="space-y-4 hud-card lobby-roster">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black uppercase text-black">Lobby</h2>
                  {room.code ? <CopyInviteLink roomCode={room.code} /> : null}
                </div>
                <p className="text-sm font-semibold text-black/80">
                  Ready {readyCount}/{room.players.length} · Room is {room.status}
                </p>
                <div className="h-3 w-full rounded-full border-[2px] border-black bg-white">
                  <div
                    className="h-full rounded-full bg-cyan-300 transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (readyCount / Math.max(room.players.length, 1)) * 100
                      )}%`
                    }}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {room.players.map((entry) => (
                    <PlayerChip
                      key={entry.id}
                      name={entry.nickname}
                      color={entry.color}
                      isHost={entry.isHost}
                      isReady={entry.isReady}
                    />
                  ))}
                </div>
              </Card>

              <Card className="space-y-3 hud-card comms-panel">
                <h3 className="text-lg font-black uppercase text-black">Meme + chat zone</h3>
                <Input
                  label="Message"
                  value={chatText}
                  placeholder="drop your funniest line"
                  onChange={(event) => setChatText(event.target.value)}
                />
                <Input
                  label="Meme URL (optional)"
                  value={memeUrl}
                  placeholder="https://i.imgur.com/..."
                  onChange={(event) => setMemeUrl(event.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!playerId || !chatText.trim()) return;
                    sendChat({
                      playerId,
                      text: chatText,
                      memeUrl: memeUrl.trim() || undefined
                    });
                    setChatText('');
                    setMemeUrl('');
                  }}
                >
                  Send
                </Button>

                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {room.chatFeed.slice(-8).map((message) => (
                    <div key={message.id} className="rounded-2xl border-[2px] border-black bg-white px-3 py-2 shadow-[3px_3px_0_0_#000]">
                      <p className="text-xs font-semibold text-black/70">
                        {message.nickname} · {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-black">{message.text}</p>
                      {message.memeUrl ? (
                        <a
                          href={message.memeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-blue-700 underline"
                        >
                          Open meme
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="director-column space-y-4">
              <Card className="space-y-3 hud-card ready-panel">
                <h3 className="text-lg font-black uppercase text-black">Ready check</h3>
                <Button
                  variant={player?.isReady ? 'secondary' : 'primary'}
                  onClick={() =>
                    playerId &&
                    setReady({
                      playerId,
                      isReady: !player?.isReady
                    })
                  }
                >
                  {player?.isReady ? 'Unready' : "I&apos;m ready"}
                </Button>
                {isHost ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => updateRoomStatus(room.status === 'locked' ? 'open' : 'locked')}
                    >
                      {room.status === 'locked' ? 'Unlock room' : 'Lock room'}
                    </Button>
                    <Button disabled={!firstMode} onClick={() => firstMode && startGame(firstMode)}>
                      Start {firstMode ? gameModeLabels[firstMode] : 'game'}
                    </Button>
                  </>
                ) : null}
              </Card>

              <Card className="space-y-3 hud-card social-panel">
                <h3 className="text-lg font-black uppercase text-black">Soundboard</h3>
                <div className="flex flex-wrap gap-2">
                  <SoundButton label="Airhorn" profile="airhorn" />
                  <SoundButton label="Suspense" profile="suspense" />
                  <SoundButton label="Roast" profile="roast" />
                </div>
              </Card>

              <Card className="space-y-3 hud-card reaction-panel">
                <h3 className="text-lg font-black uppercase text-black">Live emoji reactions</h3>
                <ReactionBar onReact={(reaction) => playerId && sendReaction(playerId, reaction)} />
              </Card>
            </div>
          </div>
        );
      }}
    </RoomLayout>
  );
}
