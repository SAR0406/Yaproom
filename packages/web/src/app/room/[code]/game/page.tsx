'use client';

import { useEffect, useRef, useState } from 'react';
import type { VoteSubmitPayload, VoiceSignalPayload } from '@yapzi/shared';
import { RoomLayout } from '@/components/RoomLayout';
import { Card } from '@/components/Card';
import { PromptCard } from '@/components/PromptCard';
import { TimerRing } from '@/components/TimerRing';
import { VoteGrid } from '@/components/VoteGrid';
import { GameReveal } from '@/components/GameReveal';
import { ChaosOverlay } from '@/components/ChaosOverlay';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useRoomStore } from '@/stores/roomStore';
import {
  nextRound,
  sendChat,
  sendDrawPath,
  sendVoiceSignal,
  submitConfession,
  submitGuess,
  submitVote
} from '@/lib/roomActions';
import { describePhase, gameModeLabels } from '@/lib/gameEngine';
import { fetchAiPrompts } from '@/lib/ai';
import { getSocket } from '@/lib/socket';

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 200;

interface RoundPayload {
  imposterId?: string;
  imposterWord?: string;
  commonWord?: string;
  pair?: [string, string];
  votes?: VoteSubmitPayload[];
}

const STUN_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];

export default function GamePage() {
  const playerId = useRoomStore((state) => state.playerId);
  const room = useRoomStore((state) => state.room);
  const [guessText, setGuessText] = useState('');
  const [confessionText, setConfessionText] = useState('');
  const [chatText, setChatText] = useState('');
  const [aiPromptMode, setAiPromptMode] = useState<'truth' | 'dare'>('truth');
  const [aiPrompts, setAiPrompts] = useState<string[]>([]);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [voiceJoined, setVoiceJoined] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Voice offline');
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const remoteAudioRef = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    if (!playerId) return;
    const socket = getSocket();
    if (!socket) return;

    async function ensurePeer(remotePlayerId: string): Promise<RTCPeerConnection> {
      const existing = peersRef.current[remotePlayerId];
      if (existing) return existing;

      const peer = new RTCPeerConnection({ iceServers: STUN_SERVERS });
      peersRef.current[remotePlayerId] = peer;

      const localStream = localStreamRef.current;
      if (localStream) {
        for (const track of localStream.getTracks()) {
          peer.addTrack(track, localStream);
        }
      }

      peer.onicecandidate = (event) => {
        if (!event.candidate || !playerId) return;
        const rawCandidate = event.candidate.toJSON();
        if (!rawCandidate.candidate) return;
        const payload: VoiceSignalPayload = {
          fromPlayerId: playerId,
          toPlayerId: remotePlayerId,
          kind: 'ice',
          candidate: {
            candidate: rawCandidate.candidate,
            sdpMid: rawCandidate.sdpMid ?? null,
            sdpMLineIndex: rawCandidate.sdpMLineIndex ?? null,
            usernameFragment: rawCandidate.usernameFragment ?? null
          }
        };
        sendVoiceSignal(payload);
      };

      peer.ontrack = (event) => {
        const [stream] = event.streams;
        if (!stream) return;
        const existingAudio = remoteAudioRef.current[remotePlayerId];
        const audio = existingAudio ?? new Audio();
        audio.autoplay = true;
        audio.srcObject = stream;
        remoteAudioRef.current[remotePlayerId] = audio;
      };

      peer.onconnectionstatechange = () => {
        const state = peer.connectionState;
        if (state === 'failed' || state === 'closed' || state === 'disconnected') {
          peer.close();
          delete peersRef.current[remotePlayerId];
          delete remoteAudioRef.current[remotePlayerId];
        }
      };

      return peer;
    }

    async function handleVoiceSignal(payload: VoiceSignalPayload) {
      if (!voiceJoined) return;
      if (payload.fromPlayerId === playerId) return;
      if (payload.toPlayerId && payload.toPlayerId !== playerId) return;

      const remotePlayerId = payload.fromPlayerId;

      if (payload.kind === 'join') {
        const peer = await ensurePeer(remotePlayerId);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        sendVoiceSignal({
          fromPlayerId: playerId,
          toPlayerId: remotePlayerId,
          kind: 'offer',
          sdp: offer
        });
        return;
      }

      if (payload.kind === 'offer' && payload.sdp) {
        const peer = await ensurePeer(remotePlayerId);
        await peer.setRemoteDescription(payload.sdp);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        sendVoiceSignal({
          fromPlayerId: playerId,
          toPlayerId: remotePlayerId,
          kind: 'answer',
          sdp: answer
        });
        return;
      }

      if (payload.kind === 'answer' && payload.sdp) {
        const peer = await ensurePeer(remotePlayerId);
        await peer.setRemoteDescription(payload.sdp);
        return;
      }

      if (payload.kind === 'ice' && payload.candidate) {
        const peer = await ensurePeer(remotePlayerId);
        await peer.addIceCandidate(payload.candidate);
        return;
      }

      if (payload.kind === 'leave') {
        peersRef.current[remotePlayerId]?.close();
        delete peersRef.current[remotePlayerId];
        delete remoteAudioRef.current[remotePlayerId];
      }
    }

    const wrappedHandler = (payload: VoiceSignalPayload) => {
      void handleVoiceSignal(payload);
    };

    socket.on('voice:signal', wrappedHandler);
    return () => {
      socket.off('voice:signal', wrappedHandler);
    };
  }, [playerId, voiceJoined]);

  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      for (const peer of Object.values(peersRef.current)) {
        peer.close();
      }
      peersRef.current = {};
      remoteAudioRef.current = {};
    };
  }, []);

  async function joinVoiceCall() {
    if (!playerId) return;
    const currentRoom = room;
    if (!currentRoom?.settings.voiceEnabled) {
      setVoiceStatus('Voice is disabled by host');
      return;
    }

    try {
      setVoiceStatus('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !micMuted;
      });
      setVoiceJoined(true);
      setVoiceStatus('Connected to team voice');
      sendVoiceSignal({
        fromPlayerId: playerId,
        kind: 'join'
      });
    } catch {
      setVoiceStatus('Microphone access denied');
    }
  }

  function leaveVoiceCall() {
    if (!playerId) return;
    sendVoiceSignal({
      fromPlayerId: playerId,
      kind: 'leave'
    });
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    for (const peer of Object.values(peersRef.current)) {
      peer.close();
    }
    peersRef.current = {};
    remoteAudioRef.current = {};
    setVoiceJoined(false);
    setVoiceStatus('Voice offline');
  }

  function toggleMic() {
    const nextMuted = !micMuted;
    setMicMuted(nextMuted);
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
  }

  return (
    <RoomLayout>
      {(room) => {
        if (!room.game) {
          return (
            <Card>
              <h2 className="text-xl font-semibold text-foreground">Waiting for the host to start</h2>
              <p className="mt-2 text-sm text-muted">Grab a snack while the lobby locks in.</p>
            </Card>
          );
        }

        const phase = room.game.round.phase;
        const isHost = room.players.find((p) => p.id === playerId)?.isHost;
        const payload = (room.game.round.payload ?? {}) as RoundPayload;
        const imposterId = String(payload.imposterId ?? '');
        const myWord = imposterId && playerId === imposterId ? payload.imposterWord : payload.commonWord;
        const splitPair = (payload.pair as [string, string] | undefined) ?? ['', ''];
        const inSplitPair = splitPair.includes(playerId ?? '');
        const votes = payload.votes ?? [];
        const voteTally = new Map<string, number>();
        for (const vote of votes) {
          voteTally.set(vote.targetId, (voteTally.get(vote.targetId) ?? 0) + 1);
        }
        const voteLeaders = Array.from(voteTally.entries())
          .map(([targetId, count]) => ({
            targetId,
            count,
            nickname: room.players.find((player) => player.id === targetId)?.nickname ?? 'Unknown'
          }))
          .sort((a, b) => b.count - a.count);

        const parsedStartedAt = room.game?.round.startedAt
          ? Date.parse(room.game.round.startedAt)
          : Date.now();
        const started = Number.isNaN(parsedStartedAt) ? Date.now() : parsedStartedAt;
        const elapsed = Math.max(0, (Date.now() - started) / 1000);
        const duration = room.settings.roundLengthSec;
        const progress = Math.max(0, Math.min(100, 100 - (elapsed / duration) * 100));

        return (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <PromptCard>
                <h2 className="text-2xl font-bold text-foreground">
                  {gameModeLabels[room.game.mode]} — {describePhase(phase)}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Prompt: {room.game.round.prompt ?? 'Stay chaotic.'}
                </p>
              </PromptCard>

              {phase === 'role' && room.game.mode === 'imposter' ? (
                <Card>
                  <h3 className="text-lg font-semibold text-foreground">Your secret role</h3>
                  <p className="mt-2 text-sm text-muted">
                    {playerId && imposterId && playerId === imposterId
                      ? 'IMPOSTER - blend in and avoid suspicion.'
                      : 'CREW - find the imposter by discussion and voting.'}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-secondary">{String(myWord ?? '???')}</p>
                </Card>
              ) : null}

              {(phase === 'action' || phase === 'timer' || phase === 'vote') && room.game.mode === 'imposter' ? (
                <Card className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Discussion Channel</h3>
                  <p className="text-xs text-muted">
                    Talk, bluff, and investigate. Vote after discussion.
                  </p>
                  <div className="max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-surface p-3">
                    {room.chatFeed.slice(-14).map((message) => (
                      <div key={message.id} className="rounded-xl border border-white/10 bg-background/60 px-3 py-2">
                        <p className="text-xs font-semibold text-muted">
                          {message.nickname} · {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-foreground">{message.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      label="Chat"
                      value={chatText}
                      onChange={(event) => setChatText(event.target.value)}
                      placeholder="Share clues or throw suspicion"
                    />
                    <Button
                      className="sm:self-end"
                      onClick={() => {
                        if (!playerId || !chatText.trim()) return;
                        sendChat({ playerId, text: chatText.trim() });
                        setChatText('');
                      }}
                    >
                      Send Intel
                    </Button>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-background/70 p-3">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.1em] text-muted">Voice Call</h4>
                    <p className="mt-1 text-xs text-muted">{voiceStatus}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {!voiceJoined ? (
                        <Button onClick={() => void joinVoiceCall()} disabled={!room.settings.voiceEnabled}>
                          Join Voice
                        </Button>
                      ) : (
                        <>
                          <Button variant={micMuted ? 'danger' : 'primary'} onClick={toggleMic}>
                            {micMuted ? 'Unmute Mic' : 'Mute Mic'}
                          </Button>
                          <Button variant="ghost" onClick={leaveVoiceCall}>
                            Leave Voice
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ) : null}

              {phase === 'vote' ? (
                <VoteGrid
                  players={room.players}
                  onSelect={(targetId) => playerId && submitVote({ playerId, targetId })}
                />
              ) : null}

              {phase === 'guess' ? (
                <Card className="space-y-3">
                  <Input
                    label={room.game.mode === 'split' ? 'Choice: split or steal' : 'Your guess'}
                    value={guessText}
                    onChange={(event) => setGuessText(event.target.value)}
                    placeholder={room.game.mode === 'split' ? 'split' : 'type your guess'}
                  />
                  <Button
                    onClick={() => {
                      if (!playerId || !guessText.trim()) return;
                      submitGuess({ playerId, guess: guessText.trim() });
                      setGuessText('');
                    }}
                  >
                    Submit
                  </Button>
                </Card>
              ) : null}

              {phase === 'action' && room.game.mode === 'confession' ? (
                <Card className="space-y-3">
                  <Input
                    label="Anonymous confession"
                    value={confessionText}
                    onChange={(event) => setConfessionText(event.target.value)}
                    placeholder="I once..."
                  />
                  <Button
                    onClick={() => {
                      if (!playerId || !confessionText.trim()) return;
                      submitConfession({ playerId, confession: confessionText.trim() });
                      setConfessionText('');
                    }}
                  >
                    Submit confession
                  </Button>
                </Card>
              ) : null}

              {phase === 'action' && room.game.mode === 'drawing' ? (
                <Card className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Quick sketch action</h3>
                  <Button
                    onClick={() =>
                      playerId &&
                      sendDrawPath({
                        playerId,
                        path: [
                          { x: Math.random() * CANVAS_WIDTH, y: Math.random() * CANVAS_HEIGHT },
                          { x: Math.random() * CANVAS_WIDTH, y: Math.random() * CANVAS_HEIGHT }
                        ]
                      })
                    }
                  >
                    Draw a stroke
                  </Button>
                </Card>
              ) : null}

              {phase === 'action' && room.game.mode === 'split' && inSplitPair ? (
                <Card className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Split or steal?</h3>
                  <div className="flex gap-2">
                    <Button onClick={() => playerId && submitGuess({ playerId, guess: 'split' })}>Split</Button>
                    <Button variant="danger" onClick={() => playerId && submitGuess({ playerId, guess: 'steal' })}>
                      Steal
                    </Button>
                  </div>
                </Card>
              ) : null}

              {phase === 'reveal' ? (
                <GameReveal title="Chaos reveal!" subtitle="Someone played it way too smooth." />
              ) : null}

              {(phase === 'reveal' || phase === 'recap') && room.game.mode === 'imposter' ? (
                <Card className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Vote Poll</h3>
                  {voteLeaders.length ? (
                    <div className="space-y-2">
                      {voteLeaders.map((entry) => (
                        <div key={entry.targetId} className="rounded-xl border border-white/10 bg-surface px-3 py-2">
                          <p className="text-sm font-semibold text-foreground">{entry.nickname}</p>
                          <p className="text-xs text-muted">Votes: {entry.count}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">No votes submitted.</p>
                  )}
                  <p className="text-xs text-muted">
                    Scoring: catch imposter = crew +4 each, imposter -1. Miss imposter = crew -1 each,
                    imposter +4.
                  </p>
                </Card>
              ) : null}
            </div>

            <div className="space-y-4">
              <Card className="flex flex-col items-center gap-4">
                <TimerRing progress={progress} label="Round time" />
                {isHost ? <Button onClick={() => nextRound()}>Advance phase</Button> : null}
              </Card>
              <Card className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                  AI chaos cards
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant={aiPromptMode === 'truth' ? 'primary' : 'secondary'}
                    onClick={() => setAiPromptMode('truth')}
                  >
                    Truth
                  </Button>
                  <Button
                    variant={aiPromptMode === 'dare' ? 'primary' : 'secondary'}
                    onClick={() => setAiPromptMode('dare')}
                  >
                    Dare
                  </Button>
                  <Button
                    onClick={() => {
                      setIsPromptLoading(true);
                      setPromptError(null);
                      void fetchAiPrompts({
                        kind: aiPromptMode,
                        count: 3,
                        tone: 'chaotic',
                        topic: room.game?.mode
                      })
                        .then((result) => setAiPrompts(result.prompts))
                        .catch(() => setPromptError('Could not generate prompts right now.'))
                        .finally(() => setIsPromptLoading(false));
                    }}
                  >
                    {isPromptLoading ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
                {promptError ? <p className="text-xs text-danger">{promptError}</p> : null}
                <ul className="space-y-2 text-sm text-muted">
                  {aiPrompts.map((prompt) => (
                    <li key={`${aiPromptMode}-${prompt}`} className="rounded-xl border border-white/10 bg-surface px-3 py-2">
                      {prompt}
                    </li>
                  ))}
                </ul>
              </Card>
              {room.game.chaosEvents.at(-1) ? (
                <ChaosOverlay message={room.game.chaosEvents.at(-1)?.label ?? 'Chaos'} />
              ) : null}
            </div>
          </div>
        );
      }}
    </RoomLayout>
  );
}
