-- Yaproom Production Database Schema
-- File: packages/server/sql/002_production_schema.sql
-- Created: 2026-05-12
-- This migration sets up all tables for the production multiplayer party games platform

-- ============================================================================
-- DROP OLD TABLES (for migration purposes)
-- ============================================================================

-- DROP TABLE IF EXISTS room_events CASCADE;
-- DROP TABLE IF EXISTS clip_exports CASCADE;
-- DROP TABLE IF EXISTS moderation_actions CASCADE;
-- DROP TABLE IF EXISTS scores CASCADE;
-- DROP TABLE IF EXISTS reactions CASCADE;
-- DROP TABLE IF EXISTS chat_messages CASCADE;
-- DROP TABLE IF EXISTS confessions CASCADE;
-- DROP TABLE IF EXISTS guesses CASCADE;
-- DROP TABLE IF EXISTS votes CASCADE;
-- DROP TABLE IF EXISTS rounds CASCADE;
-- DROP TABLE IF EXISTS game_sessions CASCADE;
-- DROP TABLE IF EXISTS room_members CASCADE;
-- DROP TABLE IF EXISTS rooms CASCADE;
-- DROP TABLE IF EXISTS guest_sessions CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- ============================================================================
-- ROOMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  host_id UUID REFERENCES users(id),
  game_type VARCHAR(50) NOT NULL,
  max_players INTEGER NOT NULL DEFAULT 10,
  is_public BOOLEAN DEFAULT true,
  status VARCHAR(50) NOT NULL DEFAULT 'lobby',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  state_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_host_id ON rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_expires_at ON rooms(expires_at);
CREATE INDEX IF NOT EXISTS idx_rooms_game_type ON rooms(game_type);

-- ============================================================================
-- ROOM MEMBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  player_name VARCHAR(255) NOT NULL,
  avatar_index INTEGER DEFAULT 0,
  role VARCHAR(50) NOT NULL DEFAULT 'player',
  status VARCHAR(50) NOT NULL DEFAULT 'connected',
  score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  is_ready BOOLEAN DEFAULT false,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_room_members_session_token ON room_members(session_token);
CREATE INDEX IF NOT EXISTS idx_room_members_status ON room_members(status);

-- ============================================================================
-- GAME SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id),
  game_type VARCHAR(50) NOT NULL,
  host_id UUID REFERENCES users(id),
  round_index INTEGER DEFAULT 0,
  total_rounds INTEGER DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  final_scores_json JSONB
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_room_id ON game_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_host_id ON game_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type ON game_sessions(game_type);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);

-- ============================================================================
-- ROUNDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  round_index INTEGER NOT NULL,
  phase VARCHAR(50) NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  winner_id UUID,
  scores_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  round_data_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_rounds_session_id ON rounds(session_id);
CREATE INDEX IF NOT EXISTS idx_rounds_round_index ON rounds(round_index);

-- ============================================================================
-- ACTIONS TABLE (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES room_members(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  phase VARCHAR(50) NOT NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  validated BOOLEAN DEFAULT false,
  validation_error VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_actions_session_id ON actions(session_id);
CREATE INDEX IF NOT EXISTS idx_actions_player_id ON actions(player_id);
CREATE INDEX IF NOT EXISTS idx_actions_room_id ON actions(room_id);
CREATE INDEX IF NOT EXISTS idx_actions_created_at ON actions(created_at);
CREATE INDEX IF NOT EXISTS idx_actions_action_type ON actions(action_type);

-- ============================================================================
-- VOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES room_members(id) ON DELETE CASCADE,
  voted_for_id UUID REFERENCES room_members(id) ON DELETE SET NULL,
  vote_type VARCHAR(100),
  payload_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_votes_round_id ON votes(round_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_votes_voted_for_id ON votes(voted_for_id);

-- ============================================================================
-- SCORES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES room_members(id) ON DELETE CASCADE,
  round_index INTEGER NOT NULL,
  round_score INTEGER DEFAULT 0,
  cumulative_score INTEGER DEFAULT 0,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scores_session_id ON scores(session_id);
CREATE INDEX IF NOT EXISTS idx_scores_player_id ON scores(player_id);
CREATE INDEX IF NOT EXISTS idx_scores_round_index ON scores(round_index);

-- ============================================================================
-- PROMPTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type VARCHAR(50) NOT NULL,
  text TEXT NOT NULL,
  difficulty VARCHAR(50) DEFAULT 'medium',
  category VARCHAR(100),
  source VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prompts_game_type ON prompts(game_type);
CREATE INDEX IF NOT EXISTS idx_prompts_is_active ON prompts(is_active);

-- ============================================================================
-- DRAWINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES room_members(id) ON DELETE CASCADE,
  drawing_data_json JSONB NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_drawings_session_id ON drawings(session_id);
CREATE INDEX IF NOT EXISTS idx_drawings_player_id ON drawings(player_id);

-- ============================================================================
-- CONFESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS confessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES room_members(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  votes_received INTEGER DEFAULT 0,
  is_revealed BOOLEAN DEFAULT false,
  revealed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_confessions_round_id ON confessions(round_id);
CREATE INDEX IF NOT EXISTS idx_confessions_author_id ON confessions(author_id);

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  player_id UUID REFERENCES room_members(id) ON DELETE SET NULL,
  metadata_json JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_room_id ON audit_logs(room_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Leaderboard view
DROP VIEW IF EXISTS leaderboard CASCADE;
CREATE VIEW leaderboard AS
SELECT
  rm.player_name,
  rm.avatar_index,
  COUNT(DISTINCT gs.id) as games_played,
  SUM(CASE WHEN gs.status = 'completed' THEN 1 ELSE 0 END) as games_completed,
  COALESCE(SUM((gs.final_scores_json ->> rm.id::text)::INTEGER), 0) as total_score,
  ROUND(COALESCE(AVG((gs.final_scores_json ->> rm.id::text)::INTEGER), 0), 2) as avg_score,
  MAX(gs.ended_at) as last_game
FROM room_members rm
LEFT JOIN game_sessions gs ON rm.room_id = gs.room_id
GROUP BY rm.id, rm.player_name, rm.avatar_index
ORDER BY total_score DESC;

-- Active rooms view
DROP VIEW IF EXISTS active_rooms CASCADE;
CREATE VIEW active_rooms AS
SELECT
  r.id,
  r.code,
  r.game_type,
  r.status,
  (SELECT COUNT(*) FROM room_members WHERE room_id = r.id AND status = 'connected') as player_count,
  r.max_players,
  r.created_at,
  u.username as host_name
FROM rooms r
LEFT JOIN users u ON r.host_id = u.id
WHERE r.status IN ('lobby', 'active')
  AND r.expires_at > CURRENT_TIMESTAMP
ORDER BY r.created_at DESC;

-- ============================================================================
-- RECORD MIGRATION
-- ============================================================================

INSERT INTO migrations (name) VALUES ('002_production_schema') ON CONFLICT DO NOTHING;
