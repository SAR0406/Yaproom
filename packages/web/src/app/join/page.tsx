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
      <Card className="max-w-xl">
        <h1 className="text-3xl font-black uppercase text-black">Join a room</h1>
        <p className="mt-2 text-sm font-semibold text-black/80">
          Drop your nickname and room code. That&apos;s it.
        </p>
        <div className="mt-6 grid gap-4">
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
            <p className="rounded-xl border-[2px] border-black bg-red-300 px-3 py-2 text-sm font-semibold text-black">
              {error.message}
            </p>
          ) : null}
          <Button disabled={!canJoin} onClick={handleJoin}>Enter room</Button>
        </div>
      </Card>
    </PageLayout>
  );
}
