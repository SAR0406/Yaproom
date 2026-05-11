"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { joinRoom } from "@/lib/roomActions";
import { normalizeRoomCode } from "@/lib/roomCode";
import { NICKNAME_MAX_LENGTH, ROOM_CODE_LENGTH } from "@/lib/constraints";

export function LandingJoinCard() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const normalizedCode = normalizeRoomCode(code);

  const handleJoin = () => {
    if (!nickname.trim() || normalizedCode.length !== ROOM_CODE_LENGTH) return;
    joinRoom({ code: normalizedCode, nickname: nickname.trim() });
    router.push(`/room/${normalizedCode}?name=${encodeURIComponent(nickname.trim())}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-foreground">
          Jump into a room
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Nickname"
            placeholder="yap legend"
            value={nickname}
            maxLength={NICKNAME_MAX_LENGTH}
            onChange={(event) => setNickname(event.target.value)}
          />
          <Input
            label="Room code"
            placeholder="ABCD"
            value={normalizedCode}
            onChange={(event) => setCode(normalizeRoomCode(event.target.value))}
          />
        </div>
        <Button onClick={handleJoin}>Join the chaos</Button>
      </Card>
    </motion.div>
  );
}
