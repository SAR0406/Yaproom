# Yapzi (Yaproom)

Yapzi is a room-based multiplayer party game platform built for fast, chaotic sessions.

## Workspace layout

- `packages/web` — Next.js 15 client (Tailwind, Framer Motion, Zustand, Socket.IO client)
- `packages/server` — Fastify + Socket.IO realtime server with Redis/Postgres hooks
- `packages/shared` — Shared TypeScript types and socket event contracts

## Getting started

```bash
npm install
```

### Run locally

```bash
npm run dev
```

- Web: http://localhost:3000
- Server: http://localhost:4000

### Build

```bash
npm run build
```

### Test

```bash
npm run test
```

## Environment variables

Create a `.env` file in `packages/server` for backend services:

```
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgres://user:pass@localhost:5432/yapzi
```

For the web app, set `NEXT_PUBLIC_SOCKET_URL` in `packages/web/.env.local` if needed.

## Deployment

- **Frontend**: Deploy `packages/web` to Vercel.
- **Backend**: Deploy `packages/server` to Railway/Fly.io/Render.
- **Database**: Use Supabase/Neon for Postgres, Upstash for Redis.

Apply `packages/server/sql/schema.sql` to initialize database tables.

## Product gap checklist

Track implementation progress against the full Yapzi product spec in `docs/gap-checklist.md`.
