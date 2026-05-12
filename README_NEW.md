# Yaproom: Production Multiplayer Party Games Platform

**A real-time multiplayer web application featuring 5 ultra-fun party games for groups of 3-20 players.**

## 🎮 Games

### 🔍 Undercover
Hidden-role social deduction. One word divides civilians from spies. Can you spot the imposters?

### 🎨 Drawing Telephone
Write a prompt, draw a drawing, guess the picture. Watch chaos unfold with each step!

### 😂 Quiplash
Answer wacky prompts with funny responses. Battle for laughs in head-to-head comedy duels.

### 🕵️ Codenames
Spymaster gives one-word clues to find secret agents. Can your team decode the message?

### 🤫 Confession
Submit anonymous confessions, vote on the wildest, then guess who said what. Full of surprises!

## ✨ Features

- **Real-time Multiplayer**: Socket.io-based instant communication
- **Server-Authoritative**: All game logic server-side, anti-cheat by design
- **Mobile-First**: Optimized for touch and mobile play
- **Reconnect-Safe**: Resume games mid-round if you disconnect
- **Production-Ready**: Scalable to 1000+ concurrent players
- **TypeScript**: Full type safety across frontend and backend
- **Premium UI**: Dark theme, smooth animations, reaction emojis
- **Spectator Mode**: Overflow players can watch and react

## 🏗 Architecture

```
┌─────────────────────────────────────┐
│     Frontend (Next.js + React)      │
│    Zustand + Framer Motion          │
└────────────────┬────────────────────┘
                 │ WebSocket (Socket.io)
┌────────────────▼────────────────────┐
│   Backend (Fastify + Node.js)       │
│   Game Engine + Room Manager        │
│   Socket Event Handlers             │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│    PostgreSQL + Redis (optional)    │
│    Audit Logs + Game History        │
└─────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended)

### Setup

```bash
# Clone and install
git clone <repo>
cd Yaproom
pnpm install

# Setup environment
cp .env.example .env.local

# Setup database
pnpm db:migrate

# Start development servers
pnpm dev

# Frontend: http://localhost:3001
# Backend: http://localhost:3000
```

### Create a Room

1. Go to http://localhost:3001
2. Click "Create Room"
3. Select a game type
4. Share the room code with friends
5. Start when everyone's ready!

## 📋 File Structure

```
Yaproom/
├── packages/
│   ├── server/                    # Backend
│   │   ├── src/
│   │   │   ├── core/             # Game engine, rooms
│   │   │   ├── games/            # 5 game implementations
│   │   │   ├── socket/           # Socket.io handlers
│   │   │   ├── db/               # Database queries
│   │   │   └── index.ts          # Entry point
│   │   ├── sql/                  # Database schema
│   │   └── package.json
│   ├── web/                       # Frontend
│   │   ├── src/
│   │   │   ├── app/              # Next.js pages
│   │   │   ├── components/       # React components
│   │   │   ├── stores/           # Zustand stores
│   │   │   └── lib/              # Utilities
│   │   └── package.json
│   └── shared/                    # Shared types
│       ├── src/
│       │   ├── types.ts          # TypeScript definitions
│       │   └── constants.ts      # Game rules & prompts
│       └── package.json
├── ARCHITECTURE.md                # System design
├── IMPLEMENTATION.md              # Implementation guide
├── DEPLOYMENT.md                  # Deployment guide
└── package.json                   # Monorepo root
```

## 🎯 Game Rules Summary

| Game | Players | Duration | Win Condition |
|------|---------|----------|---------------|
| Undercover | 3-20 | 5 min | Eliminate infiltrators OR infiltrators survive |
| Drawing Telephone | 3-12 | 10 min | Participate & see the chain |
| Quiplash | 3-20 | 8 min | Most funny answers |
| Codenames | 4-20 | 10 min | First team to find all agents |
| Confession | 3-20 | 6 min | Funniest confession + correct guesses |

## 🔐 Security Features

- **Server Authority**: All game logic server-side
- **Encrypted State**: Secret roles/boards never sent to clients
- **Action Validation**: Every action validated before applying
- **Rate Limiting**: Prevent spam and brute force
- **Audit Logging**: Every action logged with timestamp
- **Session Tokens**: Per-player authentication
- **CORS Restricted**: Only allowed origins
- **Security Headers**: X-Frame-Options, CSP, etc.

## 📊 Database Schema

**Core Tables**:
- `users` - User accounts
- `rooms` - Active game rooms
- `room_members` - Players in rooms
- `game_sessions` - Historical games
- `rounds` - Round data
- `actions` - Audit trail
- `votes` - Voting records
- `scores` - Score tracking
- `confessions` - Confession data
- `audit_logs` - Security audit

**Views**:
- `leaderboard` - Top players
- `active_rooms` - Browseable rooms

## 🚀 Deployment

### Docker

```bash
# Build and run
docker-compose up

# Frontend: http://localhost:3001
# Backend: http://localhost:3000
```

### Production

```bash
# See DEPLOYMENT.md for complete guide

# Setup environment
export DATABASE_URL=postgresql://...
export REDIS_URL=redis://...
export NODE_ENV=production

# Start backend
pnpm build
pnpm start

# Start frontend
cd packages/web
pnpm build
pnpm start
```

## 📈 Performance

- **Single Server**: ~100 concurrent players
- **Horizontally Scalable**: Add servers for more players
- **Optimized Socket.io**: Namespaced rooms, selective broadcast
- **Database Indexing**: Optimized queries
- **Frontend Optimization**: Code splitting, image optimization

## 🛠 Development

### Add a New Game

1. Create `packages/server/src/games/<game-name>/Game.ts`
2. Implement game logic (setup, actions, scoring)
3. Add types to `packages/shared/src/types.ts`
4. Register in game factory
5. Create UI component in `packages/web/src/components/games/`

### Add a Feature

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes (keep types strict)
3. Add tests if applicable
4. Submit PR for review

### Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 🐛 Troubleshooting

### Socket Connection Failed
- Check CORS configuration
- Verify backend is running
- Check firewall/proxy settings
- Review browser console for errors

### Database Connection Error
- Verify PostgreSQL is running
- Check connection string in .env
- Run `pnpm db:migrate`

### Game Not Starting
- Ensure minimum players joined
- Check all players clicked ready
- Look at server logs for errors

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design & scaling
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Implementation guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment instructions
- **[SQL Schema](./packages/server/sql/)** - Database schema

## 📦 Tech Stack

### Frontend
- **Framework**: Next.js 16 + React 19
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Networking**: Socket.io client
- **Types**: TypeScript

### Backend
- **Runtime**: Node.js
- **Framework**: Fastify
- **WebSocket**: Socket.io
- **Database**: PostgreSQL
- **Caching**: Redis (optional)
- **Types**: TypeScript

### DevOps
- **Container**: Docker
- **Orchestration**: Kubernetes (optional)
- **Monitoring**: Prometheus (recommended)
- **Logging**: ELK or CloudWatch

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes (keep types strict, no `any`)
4. Test thoroughly
5. Submit pull request

## 📝 Code Style

- **TypeScript**: Strict mode, no implicit `any`
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Comments**: Document complex logic
- **Error Handling**: Always handle errors gracefully
- **Security**: Validate all inputs, escape outputs

## 🎓 Learning Resources

- [Socket.io Documentation](https://socket.io/docs/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Zustand State Management](https://zustand.surge.sh/)
- [Fastify Framework](https://www.fastify.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 📞 Support

- **Issues**: Create an issue on GitHub
- **Questions**: Check documentation first
- **Security**: Email security@yaproom.com

## 📄 License

ISC - See LICENSE file

## 🙏 Acknowledgments

Built with ❤️ for fun and chaos at parties.

---

**Ready to play?** [Create a room and invite your friends!](http://localhost:3001)

**Want to contribute?** Check out our [Contributing Guide](./CONTRIBUTING.md)

**Like this project?** Give us a ⭐ on GitHub!
