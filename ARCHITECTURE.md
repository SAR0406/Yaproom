# Yaproom: Production Multiplayer Party Games Platform

## System Architecture Overview

### High-Level Flow
```
Client (Next.js + React)
    ↓ (WebSocket - Socket.io)
Load Balancer / Auth Middleware
    ↓
Game Server (Fastify + Socket.io)
    ├─ Game Engine (State Machine)
    ├─ Room Manager (Real-time State)
    └─ Event Dispatcher
    ↓
Data Layer
    ├─ PostgreSQL (Persistence)
    ├─ Redis (Real-time State Cache)
    └─ Audit Log
```

### Core Design Principles
1. **Server is Source of Truth**: Clients can only request actions, never modify state directly
2. **Deterministic State Machine**: Every game follows a strict phase progression
3. **Anti-Cheat by Design**: Server validates every action before applying
4. **Reconnect-Safe**: Full state can be restored from server snapshot
5. **Mobile-First**: Optimized for touch, one-handed play
6. **Scalable**: Horizontal scaling via Redis + multiple server instances

## Folder Structure

```
/packages
  /server (Node.js + Fastify)
    /src
      /core              # Game engine & room management
        /engine          # State machine & phase logic
        /rooms           # Room store & lifecycle
        /events          # Event dispatcher
      /games             # Game implementations
        /undercover
        /drawing-telephone
        /quiplash
        /codenames
        /confession
      /socket            # Socket.io handlers & namespaces
      /db                # Database models & queries
      /types             # TypeScript definitions
      /utils             # Helpers & validators
      /middleware        # Auth, validation, etc.
      /config            # Environment & settings
      index.ts           # Entry point

  /shared (Common types & constants)
    /src
      /types
        /game.ts         # Game state types
        /events.ts       # Socket event types
        /actions.ts      # Action types
        /player.ts       # Player types
      /constants         # Game rules, phase names
      /validators        # Shared validation
      index.ts

  /web (Next.js frontend)
    /src
      /app               # Next.js App Router
      /components
        /layout          # Header, nav, modals
        /rooms           # Lobby, room display
        /games           # Game-specific UI
        /shared          # Reusable UI widgets
        /animations      # Framer Motion sequences
      /stores            # Zustand stores
        /game.ts         # Game state
        /room.ts         # Room/player state
        /socket.ts       # Socket connection
      /hooks             # Custom React hooks
      /lib
        /socket.ts       # Socket.io client setup
        /api.ts          # Backend API calls
        /validators.ts   # Client-side validation
      /styles            # Global styles & themes
```

## Database Schema (PostgreSQL)

### Core Tables
- `users` - User accounts
- `rooms` - Active game rooms
- `room_members` - Players in rooms
- `game_sessions` - Historical game records
- `rounds` - Round data per game session
- `actions` - All player actions (audit trail)
- `votes` - Voting records
- `scores` - Score calculations
- `prompts` - Game prompts (Quiplash, Codenames, etc.)
- `audit_logs` - Security audit trail

## State Machine Phases

All games flow through this phase progression:

```
lobby
  ↓
setup (role/board generation)
  ↓
round_start
  ↓
player_action (main game phase)
  ↓
voting (if applicable)
  ↓
reveal (show results)
  ↓
scoring (calculate points)
  ↓
next_round OR match_end
```

## Socket.io Event Categories

### Core Events (All games)
```
connection
disconnect
join_room
leave_room
ready_up
start_game
next_round
reconnect
sync_state
```

### Action Events (Game-specific)
```
submit_action      # Generic action submission
submit_vote        # Vote submission
submit_guess       # Guess submission
host_action        # Host controls (kick, start, etc.)
chat_reaction      # Emoji reactions
```

### State Sync Events
```
state_update       # Broadcast new room state
phase_change       # Phase transitioned
player_update      # Player joined/left
round_summary      # Round results
```

## Security & Anti-Cheat

### Validation Strategy
1. **Turn Validation**: Only current player can submit actions
2. **Role Validation**: Server compares submitted action with server-held role
3. **Timing Validation**: Reject actions outside phase window
4. **Duplicate Prevention**: Track submission IDs to prevent replay
5. **Audit Logging**: Every action logged with timestamp, player, room, outcome

### Authentication
- Room-scoped auth tokens (regenerated per reconnect)
- Prevent cross-room token reuse
- Session binding to connection ID
- Rate limiting per room per player

## Reconnection Flow

```
Client Disconnect (network failure)
  ↓
30-second reconnection window
  ↓
Client Reconnects with Player ID + Room ID + Auth Token
  ↓
Server Verifies Token & Player State
  ↓
Server Sends:
  - Current game state
  - Player's secret data (role, board, etc.)
  - Vote/action history
  - Timer state
  ↓
Client Resumes from exact phase
```

## Scalability Notes

### For 1000+ Concurrent Players
1. **Redis Clusters**: Cache room state, distribute across multiple Redis instances
2. **Multiple Server Instances**: Load balancer distributes rooms across servers
3. **Namespace Isolation**: Each game instance in isolated Socket.io namespace
4. **Database Connection Pooling**: PgBouncer or similar
5. **CDN**: Static assets served from CDN
6. **Message Queue**: Optional Bull/RabbitMQ for processing heavy operations

### Load Distribution
- ~10 concurrent games per server instance = ~100 players per instance
- 100 instances = 10,000 concurrent players
- Horizontal scaling: add instances as needed

## Deployment Strategy

### Backend
- Docker containerization
- Kubernetes for orchestration (optional)
- Environment variables via .env files
- Database migrations on startup
- Redis connection health checks

### Frontend
- Next.js build optimization
- Static export where possible
- Image optimization & compression
- Service Worker for offline support
- CDN distribution

### Monitoring
- Error logging (Sentry or similar)
- Performance monitoring (New Relic, DataDog)
- Socket.io metrics
- Database performance tracking
- Audit log analysis

## Environment Variables

```
# Backend
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://yaproom.com,https://www.yaproom.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.yaproom.com
NEXT_PUBLIC_WS_URL=wss://api.yaproom.com
```

## API Endpoints (REST)

```
POST   /api/rooms              - Create room
GET    /api/rooms/:roomId      - Get room state
POST   /api/rooms/:roomId/join - Join room
DELETE /api/rooms/:roomId/leave- Leave room
GET    /api/match-history      - Get past games
GET    /api/leaderboard        - Global scores
```

## Production Checklist

- [ ] Rate limiting configured
- [ ] CORS properly restricted
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection
- [ ] CSRF tokens for state-changing operations
- [ ] Audit logging for all critical actions
- [ ] Error handling without info leakage
- [ ] Database backups automated
- [ ] SSL/TLS enforced
- [ ] API key rotation scheduled
- [ ] DDoS protection configured
- [ ] Load testing completed
- [ ] Disaster recovery plan documented
