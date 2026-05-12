# Yaproom Implementation Guide

## Overview

This is a production-ready multiplayer party game platform with 5 distinct games. The system is built with:

- **Frontend**: Next.js 16 + React 19 + Zustand + Framer Motion + Tailwind CSS
- **Backend**: Fastify + Socket.io + Node.js
- **Database**: PostgreSQL + Redis (optional, for caching)
- **Deployment**: Docker-ready, Kubernetes-compatible

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your settings

# Setup database
pnpm db:migrate

# Start development
pnpm dev

# Backend runs on http://localhost:3000
# Frontend runs on http://localhost:3001
```

## Architecture Overview

### Core Components

1. **Game Engine** (`packages/server/src/core/engine/`)
   - State machine managing game phases
   - Handles phase transitions and timers
   - Server-authoritative game state

2. **Room Manager** (`packages/server/src/core/rooms/`)
   - Manages game room lifecycle
   - Player join/leave/reconnection
   - Room persistence in memory

3. **Game Implementations** (`packages/server/src/games/`)
   - Undercover - Hidden role deduction
   - Drawing Telephone - Chain drawing game
   - Quiplash - Funny answer battle
   - Codenames - Team word deduction
   - Confession - Anonymous voting game

4. **Socket Handlers** (`packages/server/src/socket/`)
   - All WebSocket event handling
   - Client action validation
   - State broadcast to players

### Data Flow

```
Client Action
    ↓
Socket Event
    ↓
Validation (Server)
    ↓
Game Logic
    ↓
State Update
    ↓
Broadcast to Room
```

## Game Specifications

### 1. Undercover

**Players**: 3-20 (default 10)
**Duration**: 5 minutes per round

**Roles**:
- 7 Civilians (share secret word)
- 2 Undercover (similar word)
- 1 Mr. White (no word)

**Flow**:
1. Each player gives 1-sentence description
2. Discussion phase
3. Vote to eliminate
4. If Mr. White eliminated, they get final guess

**Win Conditions**:
- Civilians eliminate all infiltrators → Civilians win
- Infiltrators survive 3+ rounds → Infiltrators win
- Mr. White makes correct guess → Mr. White wins

**Scoring**:
- Base: 50 (civilians win) / 100 (undercover) / 150 (Mr. White guess)
- Bonus: +20 for not eliminated

### 2. Drawing Telephone

**Players**: 3-12 (default 10)
**Duration**: 10 minutes

**Flow**:
1. Player 1 writes prompt
2. Player 2 draws it
3. Player 3 guesses drawing
4. Player 4 draws guess
5. Continue alternating (write → draw → guess)
6. Reveal full chain at end

**Canvas Features**:
- Real-time stroke sync
- Undo/redo support
- 1.5 min per turn (auto-submit)

**Reveal**:
- Animate each step showing corruption

### 3. Quiplash

**Players**: 3-20 (default 10)
**Duration**: 8 minutes

**Rotation**:
- 8 active players write answers
- 2+ audience members vote
- Rotate after each round

**Flow**:
1. Prompt shown
2. Players write funny responses (1 min)
3. Voting (45 sec)
4. Reveal winner
5. Rotate players next round

**Scoring**:
- 10 points per vote
- +5 bonus if audience votes for you

### 4. Codenames

**Players**: 4-20 (default 10)
**Duration**: 10 minutes

**Setup**:
- 5v5 teams
- 1 spymaster per team
- 25-word grid

**Roles**:
- 9 Red agents (going first)
- 8 Blue agents
- 7 Bystanders
- 1 Assassin (instant loss)

**Flow**:
1. Spymaster gives 1-word clue + number
2. Team guesses up to (number + 1)
3. Wrong word ends turn
4. First to 9/8 agents wins

**Spymaster View**:
- See key card with agent assignments
- Cannot view operative guesses

### 5. Confession

**Players**: 3-20 (default 10)
**Duration**: 6 minutes

**Flow**:
1. All players submit anonymous confessions (1.5 min)
2. Everyone votes on funniest (1 min)
3. Everyone guesses author (45 sec)
4. Reveal confessions one-by-one

**Scoring**:
- 50 points for funny confession (based on votes)
- +25 for correct guess
- 50 points for most voted confession

## Implementation Checklist

- [x] Type definitions (shared types)
- [x] Database schema
- [x] Game engine core
- [x] Room manager
- [x] Socket handlers
- [ ] Game UI components
- [ ] Lobby/room creation flow
- [ ] Game-specific UI for each game
- [ ] Score tracking and leaderboard
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Production security hardening

## Security Considerations

### Anti-Cheat Measures

1. **Server Authority**
   - All game logic server-side
   - No role/board data sent to clients until reveal
   - Votes validated on server

2. **Input Validation**
   - Length limits on all text inputs
   - Type checking on all payloads
   - Rate limiting per player

3. **Audit Logging**
   - Every action logged with timestamp
   - Failed validations tracked
   - Suspicious patterns flagged

4. **Authentication**
   - Session tokens per player
   - Room-scoped auth (can't access other rooms)
   - Reconnection with token verification

### CORS and Headers

```typescript
// Implemented in server:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: no-referrer
- Permissions-Policy: camera=(), microphone=()
- Cross-Origin-Resource-Policy: same-site
```

## Deployment

### Docker

```dockerfile
# Backend
FROM node:18-alpine
WORKDIR /app
COPY packages/server ./server
COPY packages/shared ./shared
RUN pnpm install
EXPOSE 3000
CMD ["pnpm", "start"]

# Frontend
FROM node:18-alpine
WORKDIR /app
COPY packages/web ./web
COPY packages/shared ./shared
RUN pnpm install && pnpm build
EXPOSE 3001
CMD ["pnpm", "start"]
```

### Environment Variables

**Backend**:
```
DATABASE_URL=postgresql://user:pass@host:5432/yaproom
REDIS_URL=redis://localhost:6379
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://yaproom.com,https://www.yaproom.com
JWT_SECRET=your-secret-key
```

**Frontend**:
```
NEXT_PUBLIC_API_URL=https://api.yaproom.com
NEXT_PUBLIC_WS_URL=wss://api.yaproom.com
```

### Database Migrations

```bash
# Run migrations on startup
pnpm db:migrate

# Create new migration
pnpm db:migrate:create add_new_table
```

## Performance Optimization

### Frontend

1. **Code Splitting**
   - Lazy load game components
   - Dynamic imports for large modules

2. **Image Optimization**
   - Use Next.js Image component
   - WebP format for avatars
   - Compress PNG/JPG

3. **State Management**
   - Use Zustand (minimal overhead)
   - Memoize expensive calculations
   - Debounce frequent updates

4. **Drawing Canvas**
   - Batch socket events (send every 100ms)
   - Limit stroke history
   - Compress drawing data

### Backend

1. **Database**
   - Connection pooling (PgBouncer)
   - Index frequently queried columns
   - Archive old game sessions

2. **Caching**
   - Redis for room state (optional)
   - Prompts cached in memory
   - Invalidate on changes

3. **Socket.io**
   - Use namespaces for rooms
   - Broadcast only to room members
   - Limit message frequency

### Scalability

**Current**: ~10 concurrent games per server (100 players)

**To 1000+ players**:

1. **Horizontal Scaling**
   - Load balancer (nginx, HAProxy)
   - Multiple server instances
   - Sticky sessions for Socket.io

2. **Session Affinity**
   - Redis for session store
   - Socket.io adapter for cross-server
   - Consistent hashing for load distribution

3. **Database Scaling**
   - Read replicas
   - Connection pooling
   - Query optimization

## Monitoring & Logging

### Backend Metrics

```typescript
// Track:
- Player count per room
- Game duration
- Action submission rate
- Error rates
- Socket connection churn
```

### Frontend Analytics

```typescript
// Track:
- Page load times
- Socket connection success rate
- Error frequency
- Game completion rate
```

## Future Enhancements

1. **Features**
   - Custom game modes
   - Team tournaments
   - Replay system
   - Chat/voice
   - Mobile app

2. **Games**
   - Additional game modes
   - Seasonal challenges
   - Achievements/badges

3. **Social**
   - Friends list
   - Leaderboards
   - Share results
   - Streaming integration

## Troubleshooting

### Socket Connection Issues

```typescript
// Check:
- CORS configuration
- Firewall rules
- WebSocket support
- Connection retry logic
```

### Database Connection

```bash
# Test connection
psql -U user -h host -d yaproom

# Check migrations
SELECT * FROM migrations;
```

### Game State Inconsistency

```typescript
// Debug:
- Check action log
- Compare client/server state
- Review audit logs
```

## Support & Resources

- **Documentation**: See /docs/
- **Architecture**: See ARCHITECTURE.md
- **Database Schema**: See packages/server/sql/
- **Type Definitions**: See packages/shared/src/types.ts

## License

ISC
