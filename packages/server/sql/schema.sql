CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guest_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  nickname TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  host_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  host_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS room_members (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
  nickname TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY,
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  mode TEXT NOT NULL,
  phase TEXT NOT NULL,
  prompt TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS votes (
  id BIGSERIAL PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  voter_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
  target_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guesses (
  id BIGSERIAL PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  player_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
  guess_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS confessions (
  id BIGSERIAL PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  player_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
  confession_text TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_removed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reactions (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  round_id UUID REFERENCES rounds(id) ON DELETE SET NULL,
  player_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scores (
  id BIGSERIAL PRIMARY KEY,
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
  score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_session_id, player_session_id)
);

CREATE TABLE IF NOT EXISTS moderation_actions (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  admin_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
  target_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  reason TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clip_exports (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  game_session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
  clip_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_events (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_room_id ON game_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_rounds_game_session_id ON rounds(game_session_id);
CREATE INDEX IF NOT EXISTS idx_votes_round_id ON votes(round_id);
CREATE INDEX IF NOT EXISTS idx_guesses_round_id ON guesses(round_id);
CREATE INDEX IF NOT EXISTS idx_confessions_round_id ON confessions(round_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_reactions_room_id ON reactions(room_id);
CREATE INDEX IF NOT EXISTS idx_scores_game_session_id ON scores(game_session_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_room_id ON moderation_actions(room_id);
CREATE INDEX IF NOT EXISTS idx_clip_exports_room_id ON clip_exports(room_id);
