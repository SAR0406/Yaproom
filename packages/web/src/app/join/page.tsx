"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { joinRoom } from "@/lib/roomActions";
import { useRoomStore } from "@/stores/roomStore";

export default function JoinPage() {
  const router = useRouter();
  const error = useRoomStore((state) => state.error);
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");

  const handleJoin = () => {
    if (!nickname || !code) return;
    joinRoom({ code: code.toUpperCase(), nickname });
    router.push(`/room/${code.toUpperCase()}`);
  };

  return (
    <PageLayout>
      <Card className="max-w-xl">
        <h1 className="text-3xl font-bold text-foreground">Join a room</h1>
        <p className="mt-2 text-sm text-muted">
          Drop your nickname and room code. That&apos;s it.
        </p>
        <div className="mt-6 grid gap-4">
          <Input
            label="Nickname"
            placeholder="your best yap name"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
          <Input
            label="Room code"
            placeholder="ABCD"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
          />
          {error ? (
            <p className="text-sm text-danger">{error.message}</p>
          ) : null}
          <Button onClick={handleJoin}>Enter room</Button>
        </div>
      </Card>
    </PageLayout>
  );
}
