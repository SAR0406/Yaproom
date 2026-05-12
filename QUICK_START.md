# 🚀 Developer Quick Start Guide

## 5-Minute Setup

```bash
# 1. Clone & install
git clone <repo>
cd Yaproom
pnpm install

# 2. Setup database
docker run --name yaproom-db \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:14

# 3. Run migrations
DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres" pnpm db:migrate

# 4. Create .env.local
cat > .env.local << EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/yaproom
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
EOF

# 5. Start dev servers
pnpm dev

# Frontend: http://localhost:3001
# Backend: http://localhost:3000
```

---

## 📁 What's Where

| Path | What | Purpose |
|------|------|---------|
| `packages/server/src/core/` | GameEngine, RoomManager | Game orchestration |
| `packages/server/src/games/` | 5 game implementations | Game logic |
| `packages/server/src/socket/` | Event handlers | Client↔Server communication |
| `packages/shared/src/types.ts` | TypeScript definitions | Type safety |
| `packages/web/src/lib/socket.ts` | Socket client | WebSocket connection |
| `packages/web/src/stores/` | Zustand stores | Frontend state |
| `ARCHITECTURE.md` | System design | How it all works |
| `IMPLEMENTATION.md` | Implementation guide | How to build features |
| `docs/SOCKET_EVENTS.md` | Socket event reference | All events documented |

---

## 🎮 Game Architecture

Each game follows this pattern:

```typescript
// Game Class
class UndercoverGame {
  async setup(players): void    // Initialize game
  submitAction(...)             // Process player action
  calculateScores()             // Score players
  getPublicState()              // What clients see
  getSecretState(playerId)      // Secret data (server-only)
}

// GameEngine orchestrates:
1. Phase transitions (lobby → setup → round_start → action → voting → reveal → scoring)
2. Timing and auto-advances
3. State broadcast to all players
4. Win condition detection
```

---

## 🔌 Socket Event Flow

```
Client                          Server
  │                               │
  ├──────► join_room ────────────►│
  │                               │ Add to room
  │◄─ room_state_updated ────────┤ Broadcast to all
  │                               │
  ├──────► submit_action ────────►│
  │                               │ Validate & apply
  │◄─ action_received ───────────┤ Confirm
  │◄─ room_state_updated ────────┤ Broadcast new state
  │                               │
  │◄─ phase_changed ──────────────┤ Phase progressed
  │                               │
  ├──────► send_reaction ────────►│
  │                               │ Broadcast to room
  │◄─ reaction_received ──────────┤
```

---

## 💾 Database Schema (Key Tables)

```sql
-- Room and Players
rooms(id, code, host_id, game_type, phase, state_json)
room_members(id, room_id, player_name, role, status, session_token)

-- Game Progress
game_sessions(id, room_id, game_type, final_scores_json)
rounds(id, session_id, round_index, scores_json, round_data_json)

-- Audit & Actions
actions(id, player_id, action_type, payload_json, validated)
audit_logs(id, event_type, player_id, metadata_json)

-- Game-Specific
votes(id, round_id, voter_id, voted_for_id)
scores(id, session_id, player_id, round_score)
confessions(id, round_id, author_id, text)
```

---

## 🎯 Common Development Tasks

### Add a New Game

1. **Create game class**
   ```typescript
   // packages/server/src/games/my-game/MyGame.ts
   export class MyGame {
     async setup(players) { ... }
     submitAction(playerId, type, payload) { ... }
     calculateScores() { ... }
   }
   ```

2. **Add types**
   ```typescript
   // packages/shared/src/types.ts
   export interface MyGameState {
     // your game state
   }
   ```

3. **Register in factory**
   ```typescript
   // packages/server/src/games/index.ts
   export const gameFactory = {
     'my-game': () => new MyGame(),
   };
   ```

4. **Create UI component**
   ```typescript
   // packages/web/src/components/games/MyGame.tsx
   export function MyGame() {
     const { roomState } = useGameStore();
     return <div>{/* game UI */}</div>;
   }
   ```

### Add a Socket Event

1. **Define in shared types**
   ```typescript
   // packages/shared/src/types.ts
   export interface ClientToServerEvents {
     'my_event': (data: MyData, callback?: (error?: string) => void) => void;
   }
   export interface ServerToClientEvents {
     'my_response': (data: MyResponse) => void;
   }
   ```

2. **Handle on backend**
   ```typescript
   // packages/server/src/socket/socketHandlers.ts
   socket.on('my_event', (data, callback) => {
     // Process event
     callback?.(null);  // or error
   });
   ```

3. **Listen on frontend**
   ```typescript
   // packages/web/src/components/MyComponent.tsx
   useEffect(() => {
     const socket = getSocket();
     socket?.on('my_response', (data) => {
       // Handle response
     });
   }, []);
   ```

### Query the Database

```typescript
// packages/server/src/db/rooms.ts
export async function getRoom(roomId: string) {
  const result = await db.query(
    'SELECT * FROM rooms WHERE id = $1',
    [roomId]
  );
  return result.rows[0];
}
```

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# Test specific file
pnpm test -- gameEngine.test.ts
```

---

## 🐛 Debugging

### Backend
```bash
# Add to code
console.log('Debug:', variable);

# Or use debugger
debugger;

# Run with inspector
NODE_DEBUG=* pnpm dev
```

### Frontend
```typescript
// React DevTools
import { useGameStore } from '@/stores/gameStore';
const { roomState } = useGameStore();
console.log('Room state:', roomState);
```

### Socket.io
```typescript
// Enable debug logging
socket.onAny((event, ...args) => {
  console.log('[Socket]', event, args);
});
```

---

## 📊 Performance Tips

1. **Memoize expensive calculations**
   ```typescript
   const sorted = useMemo(() => 
     players.sort(...), 
     [players]
   );
   ```

2. **Batch socket events**
   ```typescript
   // Send multiple updates at once instead of individually
   socket.emit('bulk_update', { actions: [...] });
   ```

3. **Lazy load components**
   ```typescript
   const MyGame = dynamic(() => import('./MyGame'), {
     loading: () => <Loading />
   });
   ```

4. **Debounce drawing strokes**
   ```typescript
   const debouncedStroke = debounce(sendStroke, 50);
   canvas.onmousemove = (e) => debouncedStroke(e);
   ```

---

## 🚀 Deployment Workflow

```bash
# 1. Build
pnpm build

# 2. Test
pnpm test

# 3. Type check
pnpm type-check

# 4. Lint
pnpm lint

# 5. Docker (optional)
docker-compose build
docker-compose up -d

# 6. Migrations
pnpm db:migrate

# 7. Start
pnpm start
```

---

## 🔐 Security Checklist

- [ ] Never send secrets to clients
- [ ] Validate all inputs on server
- [ ] Check player permissions (turn, role, etc.)
- [ ] Use HTTPS in production
- [ ] Rate limit socket events
- [ ] Log all critical actions
- [ ] Sanitize user input (names, confessions, etc.)
- [ ] Handle disconnections gracefully

---

## 📝 Code Style

```typescript
// ✅ Good
const handlePlayerJoin = async (player: Player): Promise<void> => {
  if (!room) throw new Error('Room not found');
  room.addPlayer(player);
};

// ❌ Bad
const handlePlayerJoin = async (player: any) => {
  if (room == null) {
    // error handling
  }
  room.addPlayer(player);
};
```

---

## 🎨 Component Structure

```typescript
// packages/web/src/components/Game.tsx
import { useGameStore } from '@/stores/gameStore';
import { FC, useEffect, useState } from 'react';

export const GameComponent: FC = () => {
  const { roomState, submitAction } = useGameStore();
  const [localState, setLocalState] = useState({});

  useEffect(() => {
    // Socket listeners and setup
  }, []);

  const handleAction = () => {
    submitAction('my_action', {});
  };

  return (
    <div className="game">
      {/* Game UI */}
    </div>
  );
};
```

---

## 🔗 Important Links

- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000
- **Socket.io Debug**: http://localhost:3000/socket.io/?transport=websocket
- **DB**: postgres://localhost:5432/yaproom
- **Redis**: redis://localhost:6379

---

## ✅ Pre-Commit Checklist

Before pushing code:

- [ ] Code compiles (`pnpm build`)
- [ ] Tests pass (`pnpm test`)
- [ ] Types check (`pnpm type-check`)
- [ ] No lint errors (`pnpm lint`)
- [ ] No console.logs (except errors)
- [ ] No `any` types
- [ ] Secrets not hardcoded
- [ ] Comments for complex logic

---

## 🆘 Help & Resources

- **Stuck?** Check `IMPLEMENTATION.md`
- **Need types?** See `packages/shared/src/types.ts`
- **Socket events?** See `docs/SOCKET_EVENTS.md`
- **Game logic?** Check `packages/server/src/games/*/`
- **Architecture?** Read `ARCHITECTURE.md`

---

## 🎯 Next Immediate Steps

1. ✅ Read `ARCHITECTURE.md` (understand design)
2. ✅ Read `IMPLEMENTATION.md` (understand structure)
3. ✅ Run `pnpm dev` (get it running)
4. 📝 Start building frontend components (see `COMPLETION_SUMMARY.md`)
5. 🧪 Write tests as you go
6. 🚀 Deploy to staging when ready

---

**Happy coding! 🎮 Questions? Check the docs or ask in an issue.**
