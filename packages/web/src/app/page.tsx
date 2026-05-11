"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── helpers ── */
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface ParticleInitiator {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  a: number;
}

/* ── data ── */
const TICKER_ITEMS = [
  "⚡ Room #7F4K just had a BETRAYAL",
  "🎨 Drawing chaos in 43 active rooms",
  '🔥 "Alex voted wrong 3 times in a row"',
  "💀 Imposter survived 7 rounds straight",
  "😭 Room #9AB2 — confession sent wrong person vibes",
];

const GAMES = [
  {
    icon: "🕵️",
    badge: "Hot",
    badgeClass: "bg-red-400/15 text-red-300 border border-red-400/30",
    title: "Imposter / Undercover",
    desc: "Everyone gets a secret word — except one. The imposter blends in. The group hunts. Betrayal incoming.",
    tags: ["2–12 players", "Deduction", "Bluffing", "Voting"],
    players: 847,
    gc: "gc-1",
  },
  {
    icon: "🎨",
    badge: "Chaos",
    badgeClass: "bg-cyan-300/15 text-cyan-300 border border-cyan-300/30",
    title: "Cursed Drawing",
    desc: "Draw while the canvas fights back. Inverted colors, disappearing ink, mirror mode. Good luck explaining that scribble.",
    tags: ["2–8 players", "Drawing", "Guessing", "Speed"],
    players: 1204,
    gc: "gc-2",
  },
  {
    icon: "🗳️",
    badge: "Brutal",
    badgeClass: "bg-pink-400/15 text-pink-300 border border-pink-400/30",
    title: "Expose / Vote Mode",
    desc: '“Who is most likely to disappear during exam week?” The group decides. No mercy. No survivors.',
    tags: ["3–20 players", "Voting", "Roast"],
    players: 562,
    gc: "gc-3",
  },
  {
    icon: "📬",
    badge: "Spicy",
    badgeClass: "bg-amber-400/15 text-amber-200 border border-amber-400/30",
    title: "Confession / Guess Who",
    desc: "Submit your anonymous sins. The group guesses who's guilty. Points for guessing right — and for fooling everyone.",
    tags: ["3–12 players", "Anonymous", "Guessing"],
    players: 388,
    gc: "gc-4",
  },
  {
    icon: "🤝",
    badge: "Psych",
    badgeClass: "bg-emerald-400/15 text-emerald-300 border border-emerald-400/30",
    title: "Split or Steal",
    desc: "Two players. One private choice. Split the points — or steal everything. The whole room watches.",
    tags: ["2–16 players", "Trust", "Betrayal"],
    players: 291,
    gc: "gc-5",
  },
];

const STEPS = [
  {
    icon: "🏠",
    title: "Create a Room",
    desc: "Pick a nickname. Hit Create. Your private room code appears instantly. No account. No email. No waiting.",
    color: "#8B5CF6",
  },
  {
    icon: "🔗",
    title: "Share the Link",
    desc: "Drop the code in your group chat. Friends join on any device — phone, laptop, tablet. One tap to enter.",
    color: "#22D3EE",
  },
  {
    icon: "🎮",
    title: "Pick Your Chaos",
    desc: "As host, choose which game to run first — or shuffle all five. Set the timer. Tweak the rules. You're in charge.",
    color: "#F472B6",
  },
  {
    icon: "🏆",
    title: "Survive the Round",
    desc: "Play, vote, draw, confess, or betray. Watch the AI write your group's unhinged recap. Screenshot it. Send it everywhere.",
    color: "#10B981",
  },
];

const CHAOS = [
  { emoji: "🌀", title: "Reverse Vote", desc: "The vote flips. Whoever got the most votes is now safe. Panic ensues." },
  { emoji: "🤫", title: "Sudden Anonymous Mode", desc: "All nicknames hidden for 30 seconds. Trust no one." },
  { emoji: "💥", title: "Double Points Round", desc: "This round counts twice. The stakes just tripled." },
  { emoji: "🔇", title: "Player Silenced", desc: ". One random player can't type for 15 seconds. Usually the funniest moment." },
  { emoji: "🔄", title: "Role Swap", desc: "The imposter and a random player secretly switch roles mid-round." },
  { emoji: "🤖", title: "AI Drama Headline", desc: "AI writes a gossip headline about what just happened. Always unhinged." },
];

const QUOTES = [
  {
    text: "We meant to play for 20 minutes. It's been 3 hours. Someone actually started crying.",
    av: "SK",
    name: "Shreya K.",
    handle: "@shreyakap",
    grad: "#8B5CF6,#6D28D9",
  },
  {
    text: "The confession round revealed things I cannot unsee. 10/10 would ruin friendships again.",
    av: "MJ",
    name: "Marcus J.",
    handle: "@marcusjnl",
    grad: "#22D3EE,#0E7490",
  },
  {
    text: "Split or Steal literally tested my relationships. My roommate stole. We don't talk anymore.",
    av: "AL",
    name: "Aisha L.",
    handle: "@aishal_",
    grad: "#F472B6,#DB2777",
  },
  {
    text: "The AI recap called me 'a walking red flag with good WiFi.' It wasn't wrong.",
    av: "RT",
    name: "Rohan T.",
    handle: "@rohantripathy",
    grad: "#F59E0B,#D97706",
  },
  {
    text: "Played on a Discord call with 14 people. The chaos event hit mid-vote. Nobody slept.",
    av: "ZW",
    name: "Zara W.",
    handle: "@zaraw_writes",
    grad: "#10B981,#059669",
  },
];

/* ── component ── */
export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"join" | "create">("join");
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [hostName, setHostName] = useState("");
  const [liveCount, setLiveCount] = useState(2847);
  const [promoCode, setPromoCode] = useState("CHAOS");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ParticleInitiator[]>([]);

  /* ── particle system ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const colors = [
      "rgba(139,92,246,",
      "rgba(34,211,238,",
      "rgba(244,114,182,",
      "rgba(16,185,129,",
    ];

    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      a: Math.random() * 0.4 + 0.1,
    }));

    let animId = 0;
    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.a})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* ── live count ── */
  useEffect(() => {
    let base = 2847;
    const id = setInterval(() => {
      base += Math.floor(Math.random() * 10) - 4;
      if (base < 2000) base = 2000;
      setLiveCount(base);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  /* ── scroll reveal ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const genCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setPromoCode(code);
  };

  const handleJoin = () => {
    if (roomCode.trim().length === 6 && nickname.trim()) {
      router.push(`/room/${roomCode.trim().toUpperCase()}?name=${encodeURIComponent(nickname.trim())}`);
    }
  };

  const handleCreate = () => {
    if (hostName.trim()) {
      router.push(`/create?name=${encodeURIComponent(hostName.trim())}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B0F1A] text-[#F8FAFC] overflow-x-hidden font-dm">
      {/* ── BACKGROUND ORBS ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[200px] -left-[100px] w-[600px] h-[600px] rounded-full blur-[80px] orb-drift"
          style={{ background: "radial-gradient(circle,rgba(139,92,246,0.4) 0%,transparent 70%)", animationDuration: "25s" }}
        />
        <div className="absolute -bottom-[150px] -right-[100px] w-[500px] h-[500px] rounded-full blur-[80px] orb-drift"
          style={{ background: "radial-gradient(circle,rgba(34,211,238,0.3) 0%,transparent 70%)", animationDuration: "30s", animationDelay: "-10s" }}
        />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full blur-[80px] orb-drift"
          style={{ background: "radial-gradient(circle,rgba(244,114,182,0.25) 0%,transparent 70%)", animationDuration: "20s", animationDelay: "-5s" }}
        />
      </div>

      {/* ── PARTICLES CANVAS ── */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0B0F1A]/70 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="font-bebas text-3xl tracking-wider bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">
          Yap<span className="text-[#F472B6] !bg-none !text-[#F472B6]">zi</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-[#94A3B8] font-mono-custom">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981]" style={{ animation: "pulse-dot 2s infinite" }} />
          <span>{liveCount.toLocaleString()}</span> players online
        </div>
        <div className="flex items-center gap-4">
          <Link href="/how-it-works" className="hidden sm:inline text-sm text-[#94A3B8] hover:text-white transition-colors">How it works</Link>
          <Link href="/game-modes" className="hidden sm:inline text-sm text-[#94A3B8] hover:text-white transition-colors">Games</Link>
          <Link href="/create" className="px-4 py-2 rounded-lg bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7C3AED] hover:-translate-y-0.5 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            Play Now →
          </Link>
        </div>
      </nav>

      {/* ── ANNOUNCEMENT TICKER ── */}
      <div className="mt-[72px] overflow-hidden py-1.5"
        style={{
          background: "linear-gradient(90deg,#8B5CF6,#6D28D9,#22D3EE,#0E7490,#F472B6,#DB2777)",
          backgroundSize: "300% 100%",
          animation: "shimmer-bg 6s linear infinite",
        }}
      >
        <div className="flex whitespace-nowrap animate-[ticker-scroll_25s_linear_infinite] w-max gap-16">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-xs font-semibold tracking-[0.12em] uppercase text-white flex items-center gap-3">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative z-[2] min-h-[100dvh] flex flex-col items-center justify-center text-center px-6 py-16">
        {/* Eyebrow */}
        <div className="reveal inline-flex items-center gap-2 bg-[#8B5CF6]/12 border border-[#8B5CF6]/30 rounded-full px-4 py-2 text-sm font-medium text-[#8B5CF6] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
          No signup. No download. Just chaos.
        </div>

        {/* Title */}
        <h1 className="reveal d1 font-bebas leading-[0.9] tracking-wide mb-6"
          style={{ fontSize: "clamp(3.5rem, 14vw, 14rem)" }}
        >
          <span className="block bg-gradient-to-r from-white via-[#8B5CF6] via-[#22D3EE] to-white bg-clip-text text-transparent bg-[length:200%_100%]"
            style={{ animation: "title-shimmer 4s ease infinite 1.5s" }}
          >
            ONE ROOM.
          </span>
          <span className="block text-white" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}>
            FIVE KINDS OF
          </span>
          <span className="relative inline-block bg-gradient-to-r from-[#F472B6] to-[#F59E0B] bg-clip-text text-transparent">
            CHAOS.
            <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-[#F472B6] to-[#F59E0B] rounded-full" style={{ animation: "underline-grow 0.6s ease 1.2s both" }} />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="reveal d2 text-lg md:text-xl text-[#94A3B8] max-w-xl leading-relaxed mb-10">
          The party game platform your group chat has been begging for.
          <strong className="text-[#22D3EE] font-medium"> Join in 10 seconds</strong>, wreak havoc in 5 mini-games,
          share the screenshots forever.
        </p>

        {/* Join Card */}
        <div className="reveal d3 relative w-full max-w-[480px] rounded-[20px] p-8 backdrop-blur-2xl overflow-hidden"
          style={{
            background: "rgba(18,26,42,0.6)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="absolute inset-0 -z-10 rounded-[20px] p-px"
            style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.3),transparent,rgba(34,211,238,0.2))" }}
          />

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-black/30 rounded-xl p-1">
            <button onClick={() => setActiveTab("join")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === "join" ? "bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]" : "text-[#94A3B8] hover:text-white"
              )}
            >
              Join Room
            </button>
            <button onClick={() => setActiveTab("create")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === "create" ? "bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]" : "text-[#94A3B8] hover:text-white"
              )}
            >
              Create Room
            </button>
          </div>

          {/* Join Panel */}
          {activeTab === "join" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-medium tracking-[0.08em] uppercase text-[#94A3B8] mb-1">Room Code</label>
                <input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  maxLength={6}
                  placeholder="Enter 6-letter code"
                  className="w-full py-3 px-4 bg-black/30 border border-white/[0.08] rounded-xl text-white font-mono-custom text-lg tracking-[0.15em] uppercase placeholder:text-[#94A3B8]/40 placeholder:font-dm placeholder:tracking-normal placeholder:text-sm outline-none transition-all focus:border-[#8B5CF6] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15),0_0_20px_rgba(139,92,246,0.1)]"
                  style={roomCode.length === 6 ? {
                    borderColor: "#22D3EE",
                    boxShadow: "0 0 0 3px rgba(34,211,238,0.15), 0 0 30px rgba(34,211,238,0.2)",
                  } : {}}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium tracking-[0.08em] uppercase text-[#94A3B8] mb-1">Your Nickname</label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                  placeholder="What's your alias?"
                  className="w-full py-3 px-4 bg-black/30 border border-white/[0.08] rounded-xl text-white font-dm text-base outline-none transition-all focus:border-[#8B5CF6] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15),0_0_20px_rgba(139,92,246,0.1)]"
                />
              </div>
              <button onClick={handleJoin}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white font-semibold transition-all hover:-translate-y-0.5 shadow-[0_4px_24px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.5)] active:translate-y-0"
              >
                Enter the Room ⚡
              </button>
            </div>
          )}

          {/* Create Panel */}
          {activeTab === "create" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-medium tracking-[0.08em] uppercase text-[#94A3B8] mb-1">Your Nickname</label>
                <input
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  maxLength={20}
                  placeholder="Host name"
                  className="w-full py-3 px-4 bg-black/30 border border-white/[0.08] rounded-xl text-white font-dm text-base outline-none transition-all focus:border-[#8B5CF6] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15),0_0_20px_rgba(139,92,246,0.1)]"
                />
              </div>
              <button onClick={handleCreate}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white font-semibold transition-all hover:-translate-y-0.5 shadow-[0_4px_24px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.5)] active:translate-y-0"
              >
                Create My Room →
              </button>
              <div className="flex items-center gap-4 text-[#94A3B8] text-sm my-2">
                <div className="flex-1 h-px bg-white/[0.08]" />or<div className="flex-1 h-px bg-white/[0.08]" />
              </div>
              <p className="text-center text-xs text-[#94A3B8]">Your room code will be generated instantly</p>
            </div>
          )}
        </div>

        {/* Avatar Cluster */}
        <div className="reveal d4 flex items-center gap-3 mt-6">
          <div className="flex -space-x-2.5">
            {[
              { l: "AK", g: "#8B5CF6,#6D28D9" },
              { l: "MR", g: "#22D3EE,#0E7490" },
              { l: "JS", g: "#F472B6,#DB2777" },
              { l: "TL", g: "#F59E0B,#D97706" },
              { l: "PK", g: "#10B981,#059669" },
            ].map((a, i) => (
              <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-[#0B0F1A]"
                style={{ background: `linear-gradient(135deg,${a.g})` }}
              >
                {a.l}
              </div>
            ))}
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-semibold text-[#94A3B8] bg-[#172033] border-2 border-[#0B0F1A]">+24</div>
          </div>
          <p className="text-sm text-[#94A3B8]"><strong className="text-white font-semibold">{liveCount.toLocaleString()} players</strong> in rooms right now</p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 flex flex-col items-center gap-2 text-[#94A3B8] text-xs" style={{ animation: "fadeInUp 0.8s ease 1.5s both, bob 2s ease infinite 2.5s" }}>
          <span>Scroll</span>
          <div className="w-5 h-5 border-r-2 border-b-2 border-[#94A3B8] rotate-45" />
        </div>
      </section>

      {/* ── GAMES SECTION ── */}
      <section className="relative z-[2] px-6 py-24">
        <div className="max-w-[1100px] mx-auto">
          <div className="reveal">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-[#22D3EE] mb-4">
              ⚡ Five Games
            </div>
            <h2 className="font-bebas leading-none"
              style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}
            >
              PICK YOUR<br />CHAOS MODE
            </h2>
            <p className="text-base text-[#94A3B8] max-w-[500px] leading-relaxed mt-3">
              Each game a different kind of disaster. Rotate all five in one room or lock in your fave.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-12 auto-rows-auto gap-4">
            {GAMES.map((g, i) => {
              const span = i === 1 ? "md:col-span-7" : i < 2 ? "md:col-span-5" : i === 4 ? "md:col-span-4" : "md:col-span-4";
              return (
                <div key={i} className={cn("reveal", `d${(i % 3) + 1}`, i < 2 ? "md:row-span-1" : "", g.gc === "gc-5" ? "md:col-span-4" : "")}>
                  <div
                    className="relative h-full p-7 rounded-[20px] backdrop-blur-2xl transition-all duration-[350ms] hover:-translate-y-1.5 hover:scale-[1.01] group cursor-default"
                    style={{
                      background: "rgba(18,26,42,0.6)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--glow)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]"
                      style={{ "--glow": g.gc === "gc-1" ? "rgba(139,92,246,0.2)" : g.gc === "gc-2" ? "rgba(34,211,238,0.2)" : g.gc === "gc-3" ? "rgba(244,114,182,0.2)" : g.gc === "gc-4" ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)" } as React.CSSProperties}
                    />
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 bg-white/5 border border-white/[0.08]">
                      {g.icon}
                    </div>
                    <span className={cn("absolute top-5 right-5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase", g.badgeClass)}>
                      {g.badge}
                    </span>
                    <h3 className="text-lg font-semibold mb-1">{g.title}</h3>
                    <p className="text-sm text-[#94A3B8] leading-relaxed mb-5">{g.desc}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {g.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/[0.08] text-[#94A3B8]">{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#94A3B8] font-mono-custom mt-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" style={{ animation: "pulse-dot 2s infinite" }} />
                      {g.players.toLocaleString()} playing
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-[2] px-6 py-24" style={{ background: "linear-gradient(180deg,transparent,rgba(18,26,42,0.5),transparent)" }}>
        <div className="max-w-[1100px] mx-auto text-center">
          <div className="reveal">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-[#22D3EE] mb-4">
              �\uDE80 Setup
            </div>
            <h2 className="font-bebas leading-none" style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}>
              ZERO FRICTION.<br />PURE FUN.
            </h2>
            <p className="text-base text-[#94A3B8] max-w-[520px] mx-auto leading-relaxed mt-3">
              From "hey wanna play?" to first round in under 60 seconds.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s, i) => (
              <div key={i} className={cn("reveal", `d${i + 1}`)}>
                <div className="relative p-8 rounded-[20px] backdrop-blur-2xl transition-transform duration-300 hover:-translate-y-1 text-left"
                  style={{
                    background: "rgba(18,26,42,0.6)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="absolute -top-2 right-4 font-bebas text-[5rem] leading-none text-white/[0.06] pointer-events-none select-none">
                    0{i + 1}
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5"
                    style={{ background: `${s.color}20`, border: `1px solid ${s.color}33` }}
                  >
                    {s.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHAOS FEATURES ── */}
      <section className="relative z-[2] px-6 py-24">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="reveal">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-[#22D3EE] mb-4">
              �\uDF00 Chaos System
            </div>
            <h2 className="font-bebas leading-none" style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}>
              LIVE EVENTS THAT<br />RUIN EVERYTHING
            </h2>
            <p className="text-base text-[#94A3B8] max-w-[520px] mx-auto leading-relaxed mt-3">
              Random mid-game events that make it dramatically worse. In the best possible way.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {CHAOS.map((c, i) => (
              <div key={i} className={cn("reveal", `d${(i % 2) + 1}`)}>
                <div className="flex items-start gap-4 p-6 rounded-2xl backdrop-blur-2xl transition-all duration-200 hover:border-[rgba(139,92,246,0.3)] hover:bg-[#0C121F]"
                  style={{
                    background: "rgba(18,26,42,0.6)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span className="text-2xl flex-shrink-0 leading-tight">{c.emoji}</span>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">{c.title}</h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative z-[2] px-6 py-24 text-center">
        <div className="reveal">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-[#22D3EE] mb-4">
            �\uDCCA Numbers
          </div>
          <h2 className="font-bebas leading-none" style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}>
            ALREADY COOKED
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[800px] mx-auto">
          {[
            { n: "89K", l: "Rounds Played" },
            { n: "12K", l: "Rooms Created" },
            { n: "340K", l: "Betrayals Committed" },
            { n: "5", l: "Kinds of Chaos" },
          ].map((s, i) => (
            <div key={i} className={cn("reveal", `d${i + 1}`)}>
              <div className="p-7 rounded-2xl backdrop-blur-2xl transition-all duration-300 hover:border-[rgba(139,92,246,0.4)] hover:-translate-y-1.5"
                style={{
                  background: "rgba(18,26,42,0.6)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="font-bebas text-5xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">{s.n}</div>
                <div className="text-xs text-[#94A3B8] mt-1 tracking-wide">{s.l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quotes row */}
        <div className="mt-10 flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {QUOTES.map((q, i) => (
            <div key={i} className="reveal d2 flex-shrink-0 w-[280px] p-6 rounded-2xl backdrop-blur-2xl text-left"
              style={{
                background: "rgba(18,26,42,0.6)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="text-sm text-[#F8FAFC] leading-relaxed mb-4 italic">"{q.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
                  style={{ background: `linear-gradient(135deg,${q.grad})` }}
                >{q.av}</div>
                <div>
                  <div className="text-xs font-semibold">{q.name}</div>
                  <div className="text-[10px] text-[#94A3B8]">{q.handle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-[2] px-6 py-24 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse,rgba(139,92,246,0.25) 0%,transparent 70%)" }}
        />
        <div className="reveal relative max-w-[700px] mx-auto p-12 md:p-16 rounded-[28px] backdrop-blur-2xl overflow-hidden"
          style={{
            background: "rgba(18,26,42,0.6)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="absolute inset-0 -z-10 p-px rounded-[28px]"
            style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.3),transparent 40%,rgba(34,211,238,0.2))" }}
          />

          <div className="inline-block px-4 py-2 rounded-lg font-mono-custom text-lg font-semibold tracking-[0.25em] text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/20"
            style={{ animation: "glow-pulse 3s ease infinite" }}
          >
            {promoCode}
          </div>
          <h2 className="font-bebas leading-none mt-6" style={{ fontSize: "clamp(3rem, 7vw, 5rem)" }}>
            YOUR ROOM IS WAITING.
          </h2>
          <p className="text-base text-[#94A3B8] max-w-[440px] mx-auto leading-relaxed mt-4 mb-10">
            10 seconds to join. 5 games. Infinite drama. The group chat just became a battlefield.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/create" className="inline-block px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white font-semibold transition-all hover:-translate-y-[3px] shadow-[0_4px_30px_rgba(139,92,246,0.4)] hover:shadow-[0_8px_40px_rgba(139,92,246,0.5)]">
              Create a Room ⚡
            </Link>
            <Link href="/game-modes" className="inline-block px-8 py-3.5 rounded-2xl border border-white/[0.08] bg-transparent text-white font-medium transition-all hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/[0.08]">
              Browse Game Modes →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-[2] border-t border-white/[0.08] px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="font-bebas text-2xl tracking-wider bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent">
          Yapzi
        </div>
        <div className="flex flex-wrap gap-6 justify-center">
          <Link href="/how-it-works" className="text-xs text-[#94A3B8] hover:text-white transition-colors">How it works</Link>
          <Link href="/game-modes" className="text-xs text-[#94A3B8] hover:text-white transition-colors">Games</Link>
          <Link href="/legal" className="text-xs text-[#94A3B8] hover:text-white transition-colors">Privacy</Link>
          <Link href="/legal" className="text-xs text-[#94A3B8] hover:text-white transition-colors">Terms</Link>
          <a href="#" className="text-xs text-[#94A3B8] hover:text-white transition-colors">Discord</a>
        </div>
        <div className="text-xs text-[#94A3B8]">Made for chaos. © 2025 Yapzi.</div>
      </footer>
    </div>
  );
}
