# Socket.io Event Reference

## Connection Events

### `connection` (Server)
Emitted when a client establishes a WebSocket connection.

```typescript
socket.on('connection', (socket) => {
  console.log('New player connected:', socket.id);
});
```

### `connection_established` (Client)
Sent by server to confirm connection and provide initial session info.

```typescript
socket.on('connection_established', (data) => {
  console.log('Session established');
  console.log('Player ID:', data.playerId);
  console.log('Session Token:', data.sessionToken);
});
```

### `disconnect` (Both)
Emitted when a player disconnects.

```typescript
socket.on('disconnect', () => {
  console.log('Player disconnected');
});
```

## Room Management Events

### `join_room` (Client → Server)
Join a game room by code.

```typescript
socket.emit('join_room', {
  roomCode: 'ABC123',
  playerName: 'Alice',
  avatarIndex: 3
}, (error?: string | null, playerId?: string) => {
  if (error) console.error('Failed to join:', error);
  else console.log('Joined! Player ID:', playerId);
});
```

**Response**: `playerId` string or error

**Triggers**: `player_joined`, `room_state_updated`

---

### `player_joined` (Server → Room)
A player has joined the room.

```typescript
socket.on('player_joined', (player) => {
  console.log(player.name, 'joined the room');
  console.log('Total players:', room.players.length);
});
```

---

### `leave_room` (Client → Server)
Leave the current room.

```typescript
socket.emit('leave_room', {
  reason: 'user_left'  // or 'timeout', 'kicked', etc.
}, () => {
  console.log('Left room');
});
```

**Triggers**: `player_left`

---

### `player_left` (Server → Room)
A player has left the room.

```typescript
socket.on('player_left', (data) => {
  console.log(data.playerId, 'left - reason:', data.reason);
});
```

---

### `reconnect_player` (Client → Server)
Reconnect after a disconnect.

```typescript
socket.emit('reconnect_player', {
  roomCode: 'ABC123',
  playerId: 'player-123',
  sessionToken: 'token-xxx'
}, (error?: string | null, state?: RoomState) => {
  if (error) console.error('Reconnection failed:', error);
  else console.log('Reconnected! Game state:', state);
});
```

**Response**: `RoomState` or error

---

### `player_reconnected` (Server → Room)
A player has reconnected.

```typescript
socket.on('player_reconnected', (player) => {
  console.log(player.name, 'has reconnected');
});
```

---

### `player_disconnected` (Server → Room)
A player has disconnected (may reconnect).

```typescript
socket.on('player_disconnected', (data) => {
  console.log(data.playerId, 'disconnected');
  console.log('Will auto-remove in', data.willReconnectIn, 'ms');
});
```

---

## Game Control Events

### `ready_up` (Client → Server)
Mark yourself as ready to start.

```typescript
socket.emit('ready_up', { ready: true });
```

---

### `start_game` (Client → Server)
Start the game (host only).

```typescript
socket.emit('start_game', {}, () => {
  console.log('Game starting...');
});
```

**Requirements**:
- Player must be host
- Minimum players must be ready

**Triggers**: `phase_changed`, `room_state_updated`

---

### `next_round` (Client → Server)
Proceed to next round (host only).

```typescript
socket.emit('next_round', {}, () => {
  console.log('Moving to next round');
});
```

---

## Game Action Events

### `submit_action` (Client → Server)
Submit a game action (generic).

```typescript
socket.emit('submit_action', {
  type: 'submit_description',  // or 'submit_answer', 'submit_clue', etc.
  payload: {
    text: 'This is my guess for the word',
    // ... game-specific data
  }
}, (error?: string) => {
  if (error) console.error('Action rejected:', error);
  else console.log('Action submitted');
});
```

**Game-Specific Types**:
- `undercover/submit_description`
- `drawing/submit_drawing`
- `quiplash/submit_answer`
- `codenames/submit_clue`
- `confession/submit_confession`

**Triggers**: `action_received`, `room_state_updated`

---

### `action_received` (Server → Room)
Confirmation that an action was received and processed.

```typescript
socket.on('action_received', (data) => {
  console.log('Action processed:', data.actionId);
  console.log('By player:', data.playerId);
  console.log('Success:', data.success);
});
```

---

### `submit_vote` (Client → Server)
Submit a vote for another player.

```typescript
socket.emit('submit_vote', {
  votedPlayerId: 'player-456',
  reason: 'elimination'  // optional
}, () => {
  console.log('Vote submitted');
});
```

---

### `submit_guess` (Client → Server)
Submit a guess (for Codenames, Confession, etc.).

```typescript
socket.emit('submit_guess', {
  guessText: 'The word is banana'
}, (error?: string) => {
  if (error) console.error('Guess rejected:', error);
});
```

---

### `submit_drawing` (Client → Server)
Submit a drawing with stroke data.

```typescript
socket.emit('submit_drawing', {
  strokes: [
    {
      points: [{x: 0, y: 0}, {x: 10, y: 10}],
      color: '#FF0000',
      width: 2,
      timestamp: Date.now()
    }
  ],
  isComplete: true
}, (error?: string) => {
  if (error) console.error('Drawing rejected:', error);
});
```

---

## State Events

### `room_state_updated` (Server → Room)
Full room state update (sent frequently).

```typescript
socket.on('room_state_updated', (state: RoomState) => {
  console.log('Current phase:', state.phase);
  console.log('Players:', state.players.length);
  console.log('Scores:', state.scoreBoard);
  // Update UI
});
```

---

### `phase_changed` (Server → Room)
Game phase has transitioned.

```typescript
socket.on('phase_changed', (data) => {
  console.log('Phase:', data.oldPhase, '→', data.newPhase);
  console.log('Phase ends at:', data.phaseEndsAt);
});
```

---

### `player_updated` (Server → Room)
Individual player state changed.

```typescript
socket.on('player_updated', (player) => {
  console.log(player.name, 'is now', player.status);
  if (player.isReady) console.log(player.name, 'is ready!');
});
```

---

### `players_list` (Server → Client)
Full list of players in the room.

```typescript
socket.on('players_list', (players) => {
  console.log('Players:', players.map(p => p.name));
});
```

---

## Game-Specific Events

### Round Events

#### `round_started` (Server → Room)
A new round has started.

```typescript
socket.on('round_started', (data) => {
  console.log('Round', data.roundIndex, 'started');
  console.log('Phase ends at:', data.phaseEndsAt);
});
```

---

#### `turn_changed` (Server → Room)
It's now a different player's turn (Codenames, Drawing, etc.).

```typescript
socket.on('turn_changed', (data) => {
  console.log('Current turn:', data.currentTurnPlayerId);
  console.log('Phase ends at:', data.phaseEndsAt);
});
```

---

#### `round_summary` (Server → Room)
Round ended, here's the summary.

```typescript
socket.on('round_summary', (summary) => {
  console.log('Round', summary.roundIndex, 'ended');
  console.log('Winner:', summary.winner);
  console.log('Scores:', summary.scores);
  console.log('Highlights:', summary.highlights);
});
```

---

### Game Completion Events

#### `reveal_started` (Server → Room)
Reveal phase has started (show secret data).

```typescript
socket.on('reveal_started', (data) => {
  console.log('Reveal phase started');
  // Can now show roles, confessions, answers, etc.
});
```

---

#### `match_ended` (Server → Room)
Game has ended.

```typescript
socket.on('match_ended', (data) => {
  console.log('Game ended!');
  console.log('Winner:', data.winner);
  console.log('Final scores:', data.finalScores);
  console.log('Duration:', data.duration, 'ms');
});
```

---

## Reaction Events

### `send_reaction` (Client → Server)
Send an emoji reaction.

```typescript
socket.emit('send_reaction', {
  emoji: '😂'
}, () => {
  console.log('Reaction sent');
});
```

---

### `reaction_received` (Server → Room)
Someone sent a reaction.

```typescript
socket.on('reaction_received', (data) => {
  console.log(data.playerId, 'reacted with', data.emoji);
});
```

---

## Sync Events

### `request_state_sync` (Client → Server)
Request full room state (useful after reconnect).

```typescript
socket.emit('request_state_sync', (state?: RoomState) => {
  if (state) {
    console.log('State synced');
    // Update client state
  }
});
```

---

## Error Events

### `error` (Server → Client)
Error occurred on the server.

```typescript
socket.on('error', (data) => {
  console.error('Server error:', data.code);
  console.error('Message:', data.message);
  
  // Handle specific error codes
  switch (data.code) {
    case 'INVALID_ROOM_CODE':
      console.error('Room not found');
      break;
    case 'ROOM_FULL':
      console.error('Room is full');
      break;
    case 'NOT_YOUR_TURN':
      console.error('Wait for your turn');
      break;
    default:
      console.error('Unknown error');
  }
});
```

---

## Host-Only Events

### `host_kick_player` (Client → Server)
Kick a player from the room (host only).

```typescript
socket.emit('host_kick_player', {
  playerId: 'player-123'
}, () => {
  console.log('Player kicked');
});
```

---

### `host_promote_player` (Client → Server)
Promote a player to host (host only).

```typescript
socket.emit('host_promote_player', {
  playerId: 'player-456'
}, () => {
  console.log('Player promoted to host');
});
```

---

### `host_skip_phase` (Client → Server)
Skip current phase (host only).

```typescript
socket.emit('host_skip_phase', {}, () => {
  console.log('Phase skipped');
});
```

---

### `host_restart_game` (Client → Server)
Restart the current game (host only).

```typescript
socket.emit('host_restart_game', {}, () => {
  console.log('Game restarting');
});
```

---

## Best Practices

### Listening to Events

```typescript
// ✅ Good: Cleanup listeners
socket.on('room_state_updated', handleStateUpdate);
socket.once('match_ended', handleGameEnd);

// ❌ Bad: Memory leaks from duplicate listeners
for (let i = 0; i < 100; i++) {
  socket.on('room_state_updated', handleStateUpdate);  // Creates 100 listeners!
}
```

### Error Handling

```typescript
// ✅ Good: Handle all callbacks
socket.emit('submit_action', data, (error?: string) => {
  if (error) {
    // Handle error
    showNotification('Action failed: ' + error);
  } else {
    // Success
  }
});

// ❌ Bad: Ignoring errors
socket.emit('submit_action', data);
```

### Reconnection

```typescript
// ✅ Good: Attempt reconnection with stored session
const stored = localStorage.getItem('gameSession');
if (stored) {
  const { roomCode, playerId, sessionToken } = JSON.parse(stored);
  socket.emit('reconnect_player', {
    roomCode,
    playerId,
    sessionToken
  });
}
```

### Rate Limiting

```typescript
// ✅ Good: Debounce frequent updates
import { debounce } from 'lodash';

const debouncedUpdate = debounce((data) => {
  socket.emit('submit_action', data);
}, 100);

debouncedUpdate(data);
```

---

## Debugging

### Enable Socket.io Debug Logging

```typescript
import { io } from 'socket.io-client';

const socket = io(url, {
  // Enable debug logging
  transports: ['websocket'],
  // Log all emitted/received events
});

socket.onAny((event, ...args) => {
  console.log('[Socket Event]', event, args);
});
```

### Check Socket Connection Status

```typescript
console.log('Connected:', socket.connected);
console.log('Connection ID:', socket.id);
console.log('Disconnected Reason:', socket.disconnected);
```

---

## Performance Tips

1. **Batch Updates**: Send related data in one event instead of multiple
2. **Debounce Drawing**: Don't send every stroke immediately
3. **Unsubscribe**: Remove listeners when component unmounts
4. **Avoid Large Payloads**: Keep event data small
5. **Use Namespaces**: Separate rooms to reduce broadcast scope

---

For more information, see [Socket.io Documentation](https://socket.io/docs/)
