"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

/* ---------- helpers ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function cn(...c: any[]) {
  return c.filter(Boolean).join(" ");
}

/* ---------- component ---------- */
export default function Home() {
  const router = useRouter();

  const [tab, setTab] = useState<"join" | "create">("join");
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const [live, setLive] = useState(2800);

  /* live counter */
  useEffect(() => {
    const id = setInterval(() => {
      setLive((v) => v + Math.floor(Math.random() * 6 - 2));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const handleJoin = () => {
    if (roomCode.length === 6 && name) {
      router.push(`/room/${roomCode}?name=${encodeURIComponent(name)}`);
    }
  };

  const handleCreate = () => {
    if (name) {
      router.push(`/create?name=${encodeURIComponent(name)}`);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F1A] text-white overflow-hidden">

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 flex justify-between px-6 py-4 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          YAPZI
        </h1>

        <div className="flex gap-4 items-center text-sm">
          <span className="text-gray-400">{live.toLocaleString()} online</span>
          <Link href="/create" className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600">
            Play Now
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-[clamp(3rem,10vw,8rem)] font-bold leading-[0.9]"
        >
          ONE ROOM.<br />
          <span className="text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text">
            TOTAL CHAOS
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.2 }}
          className="text-gray-400 mt-6 max-w-xl"
        >
          Party games built for group calls. Join in seconds, destroy friendships,
          laugh for hours.
        </motion.p>

        {/* JOIN CARD */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.4 }}
          className="mt-10 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6"
        >

          {/* tabs */}
          <div className="flex mb-4 bg-black/30 rounded-lg p-1">
            <button onClick={() => setTab("join")}
              className={cn("flex-1 py-2 rounded",
                tab === "join" ? "bg-purple-500" : "text-gray-400")}>
              Join
            </button>

            <button onClick={() => setTab("create")}
              className={cn("flex-1 py-2 rounded",
                tab === "create" ? "bg-purple-500" : "text-gray-400")}>
              Create
            </button>
          </div>

          {/* JOIN */}
          {tab === "join" && (
            <div className="space-y-3">
              <input
                value={roomCode}
                onChange={(e) =>
                  setRoomCode(e.target.value.toUpperCase().slice(0, 6))
                }
                placeholder="ROOM CODE"
                className="w-full p-3 bg-black/40 rounded-lg text-center tracking-widest"
              />

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nickname"
                className="w-full p-3 bg-black/40 rounded-lg"
              />

              <button
                onClick={handleJoin}
                className="w-full py-3 bg-cyan-400 text-black rounded-lg font-semibold hover:scale-[1.02] transition"
              >
                Join Room ⚡
              </button>
            </div>
          )}

          {/* CREATE */}
          {tab === "create" && (
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full p-3 bg-black/40 rounded-lg"
              />

              <button
                onClick={handleCreate}
                className="w-full py-3 bg-purple-500 rounded-lg font-semibold hover:scale-[1.02]"
              >
                Create Room →
              </button>
            </div>
          )}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="text-center py-20">
        <h2 className="text-4xl font-bold">
          Ready to start chaos?
        </h2>
        <Link href="/create"
          className="inline-block mt-6 px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-xl font-semibold">
          Create Room
        </Link>
      </section>

    </main>
  );
}