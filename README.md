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
ADMIN_USERNAME=Frontman
ADMIN_PASSWORD_HASH=scrypt:<salt-hex>:<hash-hex>
APP_ENCRYPTION_KEY=<32-byte-base64-key>
BLOCKED_TERMS=slur,hateword,kys,nazi
```

`CLIENT_ORIGIN` accepts one or more comma-separated frontend origins (e.g. `https://app.vercel.app,https://app-git-preview.vercel.app`) and normalizes trailing slashes.

For the web app, set `NEXT_PUBLIC_SOCKET_URL` in `packages/web/.env.local` (or Vercel env vars):

```
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
```

## Deployment

- **Frontend**: Deploy `packages/web` to Vercel.
- **Backend**: Deploy `packages/server` to Railway/Fly.io/Render.
- **Database**: Use Supabase/Neon for Postgres, Upstash for Redis.

Apply `packages/server/sql/schema.sql` to initialize database tables.

## Product gap checklist

Track implementation progress against the full Yapzi product spec in `docs/gap-checklist.md`.


## Security backend design

See `docs/security-backend-design.md` for the backend security architecture and admin control-plane design.


### Generate admin password hash

```bash
node -e "const c=require('node:crypto');const p=process.argv[1];const s=c.randomBytes(16);const h=c.scryptSync(p,s,64);console.log('scrypt:'+s.toString('hex')+':'+h.toString('hex'));" 'your-strong-password'
```
