"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { joinRoom } from "@/lib/roomActions";
import { normalizeRoomCode } from "@/lib/roomCode";
import { NICKNAME_MAX_LENGTH, ROOM_CODE_LENGTH } from "@/lib/constraints";
import { useRoomStore } from "@/stores/roomStore";

export default function JoinPage() {
  const router = useRouter();
  const error = useRoomStore((state) => state.error);
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const normalizedCode = normalizeRoomCode(code);
  const canJoin = Boolean(nickname.trim()) && normalizedCode.length === ROOM_CODE_LENGTH;

  const handleJoin = () => {
    if (!canJoin) return;
    joinRoom({ code: normalizedCode, nickname: nickname.trim() });
    router.push(
      `/room/${normalizedCode}?name=${encodeURIComponent(nickname.trim())}`
    );
  };

  return (
    <PageLayout>
      <Card className="max-w-2xl space-y-5">
        <div className="space-y-2">
          <p className="eyebrow">Join flow</p>
          <h1 className="text-4xl text-shimmer">Drop into a room</h1>
          <p className="text-sm text-text-secondary">
            Enter your nickname and room code to connect to the live game room.
          </p>
        </div>
        <div className="grid gap-4">
          <Input
            label="Nickname"
            placeholder="your best yap name"
            value={nickname}
            maxLength={NICKNAME_MAX_LENGTH}
            onChange={(event) => setNickname(event.target.value)}
          />
          <Input
            label="Room code"
            placeholder="ABCD"
            value={normalizedCode}
            maxLength={ROOM_CODE_LENGTH}
            onChange={(event) =>
              setCode(normalizeRoomCode(event.target.value))
            }
          />
          {error ? (
            <p className="rounded-2xl border border-neon-red/30 bg-neon-red/10 px-3 py-2 text-sm font-semibold text-neon-red">
              {error.message}
            </p>
          ) : null}
          <Button disabled={!canJoin} onClick={handleJoin}>Enter room</Button>
        </div>
      </Card>
    </PageLayout>
  );
}
