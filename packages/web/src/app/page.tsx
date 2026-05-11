'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type GameCard = {
  icon: string;
  badge: 'Hot' | 'New' | 'Chaos';
  title: string;
  description: string;
  tags: string[];
  players: number;
  colSpan: string;
};

const tickerEvents = [
  '🔥 ROOM ZQ7K1P just hit 42 players',
  '🎭 IMPERSONATOR round lasted 19 seconds',
  '🕵️ CHAOS VOTE triggered in NIGHTSHIFT',
  '🎤 FRONTMAN joined room CR8Q2X',
  '💥 CONFESSION MODE unlocked ultra-chaos'
];

const gameCards: GameCard[] = [
  {
    icon: '🕵️',
    badge: 'Hot',
    title: 'Imposter Heat',
    description: 'Find the faker before they derail the entire room.',
    tags: ['deduction', 'voice', 'quickfire'],
    players: 1420,
    colSpan: 'md:col-span-5'
  },
  {
    icon: '🎨',
    badge: 'Chaos',
    title: 'Sketch Sabotage',
    description: 'Draw under pressure while chat spams fake hints.',
    tags: ['drawing', 'misdirection', 'laughs'],
    players: 1198,
    colSpan: 'md:col-span-7'
  },
  {
    icon: '🙈',
    badge: 'New',
    title: 'Expose Chain',
    description: 'Drop anonymous truths and vote on the wildest one.',
    tags: ['social', 'party', 'unfiltered'],
    players: 931,
    colSpan: 'md:col-span-4'
  },
  {
    icon: '🎙️',
    badge: 'Hot',
    title: 'Confession Blitz',
    description: 'Race to confess, bluff, and survive the callout.',
    tags: ['bluff', 'speed', 'voice'],
    players: 1044,
    colSpan: 'md:col-span-4'
  },
  {
    icon: '💰',
    badge: 'Chaos',
    title: 'Split or Steal',
    description: 'Trust nobody, make promises, then break all of them.',
    tags: ['strategy', 'betrayal', 'endgame'],
    players: 1577,
    colSpan: 'md:col-span-4'
  }
];

const steps = [
  {
    title: 'Create Room',
    description: 'Spin up a private room in seconds and get your code.'
  },
  {
    title: 'Pull the Squad',
    description: 'Drop the code in group chat and watch the lobby flood.'
  },
  {
    title: 'Queue Chaos',
    description: 'Pick game modes and reorder the setlist on the fly.'
  },
  {
    title: 'Farm Lore',
    description: 'Clip moments, argue over scores, run it back instantly.'
  }
];

const chaosFeatures = [
  ['🧠', 'Realtime deduction', 'Vote outcomes and role reveals update instantly.'],
  ['🔊', 'Voice-first vibe', 'Built for Discord calls and live reactions.'],
  ['🧲', 'Retention loops', 'Fast rounds keep everyone locked in.'],
  ['🛡️', 'Host moderation', 'Kick, mute, and ban controls mid-round.'],
  ['⚡', 'Low-latency sockets', 'Room sync runs on live event streams.'],
  ['🎲', 'Meta randomness', 'Chaos modifiers remix every session.']
];

const stats = [
  ['2.4M+', 'rounds played'],
  ['89K+', 'rooms created'],
  ['14 sec', 'average join time'],
  ['97%', 'return rate']
];

const quotes = [
  '“We joined for 10 mins and lost 2 hours. Worth it.”',
  '“It feels like if group chat became a game engine.”',
  '“Yapzi turns every friend into a content creator.”',
  '“Best post-dinner chaos ritual we have.”'
];

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
};

function generateRandomRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function Section({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.section>
  );
}

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.8 + 0.9,
      dx: (Math.random() - 0.5) * 0.18,
      dy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.45 + 0.2
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    let frameId = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
        ctx.fill();
      }
      frameId = window.requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 opacity-55"
      aria-hidden="true"
    />
  );
}

export default function Home() {
  const [tab, setTab] = useState<'join' | 'create'>('join');
  const [roomCode, setRoomCode] = useState('');
  const [simulatedPlayerCount, setSimulatedPlayerCount] = useState(27841);
  const [generatedCode, setGeneratedCode] = useState(() => generateRandomRoomCode());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSimulatedPlayerCount((value) => value + Math.floor(Math.random() * 5) + 1);
    }, 2200);
    return () => window.clearInterval(interval);
  }, []);

  const avatars = useMemo(() => ['🧃', '😈', '🤖', '🦄', '🧠'], []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-20">
        <div
          className="absolute -left-14 top-18 h-64 w-64 rounded-full opacity-45 blur-3xl"
          style={{ background: '#8B5CF6', animation: 'drift 13s ease-in-out infinite' }}
        />
        <div
          className="absolute right-12 top-56 h-72 w-72 rounded-full opacity-35 blur-3xl"
          style={{ background: '#22D3EE', animation: 'drift 17s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: '#F472B6', animation: 'drift 19s ease-in-out infinite' }}
        />
      </div>
      <ParticleField />

      <div className="bg-gradient-to-r from-primary/30 via-secondary/20 to-pink/30 py-2 text-xs text-foreground/90">
        <div className="marquee-track flex items-center gap-12 px-4 font-medium">
          {[...tickerEvents, ...tickerEvents].map((item, index) => (
            <span key={index} className="whitespace-nowrap">
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-7xl items-center px-4 py-14 sm:px-6 lg:px-10">
        <motion.div
          className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="space-y-5">
            <p className="inline-flex rounded-full border border-white/12 bg-surface/60 px-3 py-1 text-xs uppercase tracking-[0.24em] text-secondary">
              Live party lobby
            </p>
            <h1 className="shimmer-text text-[clamp(3.3rem,12vw,8.6rem)] leading-[0.9] tracking-wide">
              ONE ROOM. FIVE KINDS OF CHAOS.
            </h1>
            <p className="max-w-xl text-base text-slate-300 sm:text-lg">
              The dark-mode social party game for voice calls, friend groups, and
              peak Gen Z nonsense. Start fast, roast harder, run it back.
            </p>
            <div className="flex items-center gap-4">
              <motion.div
                key={simulatedPlayerCount}
                initial={{ scale: 0.94, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold text-secondary"
              >
                {simulatedPlayerCount.toLocaleString()}
              </motion.div>
              <span className="text-sm uppercase tracking-[0.18em] text-slate-400">
                players live now
              </span>
            </div>
            <div className="flex items-center">
              {avatars.map((avatar, index) => (
                <span
                  key={avatar}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-surface text-lg"
                  style={{ marginLeft: index === 0 ? 0 : -10, zIndex: avatars.length - index }}
                >
                  {avatar}
                </span>
              ))}
              <span className="ml-3 text-sm text-slate-400">+1,200 rooms in rotation</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card neon-hover p-5 sm:p-6">
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-surface/80 p-1">
              <button
                type="button"
                onClick={() => setTab('join')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  tab === 'join'
                    ? 'bg-secondary/25 text-secondary'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Join
              </button>
              <button
                type="button"
                onClick={() => setTab('create')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  tab === 'create'
                    ? 'bg-primary/25 text-primary'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Create
              </button>
            </div>

            {tab === 'join' ? (
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Room code
                  </span>
                  <input
                    value={roomCode}
                    onChange={(event) =>
                      setRoomCode(
                        event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
                      )
                    }
                    placeholder="A8K2QX"
                    maxLength={6}
                    className={`w-full rounded-2xl border bg-background/70 px-4 py-3 font-mono text-xl tracking-[0.22em] outline-none transition ${
                      roomCode.length === 6
                        ? 'border-secondary text-secondary shadow-[0_0_26px_rgba(34,211,238,0.4)]'
                        : 'border-white/10 text-foreground focus:border-primary'
                    }`}
                  />
                </label>
                <Link
                  href={roomCode.length === 6 ? `/join?code=${roomCode}` : '/join'}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-secondary/90"
                >
                  Join now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  Start a private room and pull your squad in instantly.
                </p>
                <Link
                  href="/create"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  Create room
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      </section>

      <div className="mx-auto w-full max-w-7xl space-y-20 px-4 pb-20 sm:px-6 lg:px-10">
        <Section className="space-y-6">
          <motion.h2 variants={itemVariants} className="text-5xl tracking-wide text-white sm:text-6xl">
            Game Modes
          </motion.h2>
          <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-12">
            {gameCards.map((game) => (
              <motion.article
                key={game.title}
                variants={itemVariants}
                className={`glass-card neon-hover ${game.colSpan} p-5`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-2xl">{game.icon}</span>
                  <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-xs text-slate-300">
                    {game.badge}
                  </span>
                </div>
                <h3 className="text-2xl text-white">{game.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{game.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {game.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-background/50 px-2 py-1 text-xs text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-sm text-secondary">
                  <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-secondary" />
                  {game.players.toLocaleString()} playing now
                </div>
              </motion.article>
            ))}
          </motion.div>
        </Section>

        <Section className="space-y-6">
          <motion.h2 variants={itemVariants} className="text-5xl tracking-wide text-white sm:text-6xl">
            How it Works
          </motion.h2>
          <motion.div
            variants={containerVariants}
            className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]"
          >
            {steps.map((step, index) => (
              <motion.article
                key={step.title}
                variants={itemVariants}
                className="glass-card neon-hover relative overflow-hidden p-5"
              >
                <span className="pointer-events-none absolute -right-2 -top-6 text-[5rem] font-display leading-none text-white/6">
                  {index + 1}
                </span>
                <h3 className="text-2xl text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{step.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </Section>

        <Section className="grid gap-8 lg:grid-cols-2">
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-5xl tracking-wide text-white sm:text-6xl">Chaos Stack</h2>
            <p className="max-w-md text-slate-300">
              Every room mixes social deduction, bluffing, and meme-level randomness
              into a controlled meltdown.
            </p>
          </motion.div>
          <motion.div variants={containerVariants} className="grid gap-4 sm:grid-cols-2">
            {chaosFeatures.map(([emoji, title, description]) => (
              <motion.article key={title} variants={itemVariants} className="glass-card p-4">
                <p className="mb-2 text-2xl">{emoji}</p>
                <h3 className="text-xl text-white">{title}</h3>
                <p className="mt-1 text-sm text-slate-300">{description}</p>
              </motion.article>
            ))}
          </motion.div>
        </Section>

        <Section className="space-y-6">
          <motion.h2 variants={itemVariants} className="text-5xl tracking-wide text-white sm:text-6xl">
            Numbers Don&apos;t Lie
          </motion.h2>
          <motion.div variants={containerVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([value, label]) => (
              <motion.article key={label} variants={itemVariants} className="glass-card p-5">
                <p className="bg-gradient-to-r from-primary via-secondary to-pink bg-clip-text font-display text-5xl text-transparent">
                  {value}
                </p>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-400">{label}</p>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="scrollbar-hidden flex snap-x gap-4 overflow-x-auto pb-1"
          >
            {quotes.map((quote) => (
              <motion.blockquote
                key={quote}
                variants={itemVariants}
                className="glass-card min-w-[300px] snap-start p-5 text-sm text-slate-300"
              >
                {quote}
              </motion.blockquote>
            ))}
          </motion.div>
        </Section>

        <Section className="relative">
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/35 blur-3xl" />
          <motion.div variants={itemVariants} className="glass-card mx-auto max-w-3xl p-7 text-center">
            <h2 className="text-5xl tracking-wide text-white sm:text-6xl">Spin Up Chaos</h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-300">
              Generate a room code and get your squad in before the vibe dies.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <code className="rounded-2xl border border-secondary/35 bg-background/80 px-5 py-3 font-mono text-2xl tracking-[0.22em] text-secondary">
                {generatedCode}
              </code>
              <button
                type="button"
                onClick={() => setGeneratedCode(generateRandomRoomCode())}
                className="rounded-2xl border border-primary/40 bg-primary/20 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/30"
              >
                Generate new code
              </button>
              <Link
                href="/create"
                className="rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-secondary/90"
              >
                Create room
              </Link>
            </div>
          </motion.div>
        </Section>
      </div>

      <footer className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/8 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:px-6 lg:px-10">
        <p className="font-display text-3xl text-white">YAPZI</p>
        <nav className="flex items-center gap-4">
          <Link href="/game-modes" className="hover:text-white">
            Modes
          </Link>
          <Link href="/how-it-works" className="hover:text-white">
            How it works
          </Link>
          <Link href="/legal" className="hover:text-white">
            Legal
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} Yapzi</p>
      </footer>
    </main>
  );
}
