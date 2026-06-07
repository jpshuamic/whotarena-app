-- WhotArena initial schema (Section 8)
-- All money stored in kobo (bigint). ₦1,500 = 150000.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  phone text,
  avatar_url text,
  real_balance bigint NOT NULL DEFAULT 0 CHECK (real_balance >= 0),
  bonus_balance bigint NOT NULL DEFAULT 0 CHECK (bonus_balance >= 0),
  total_games integer NOT NULL DEFAULT 0,
  total_wins integer NOT NULL DEFAULT 0,
  win_rate numeric(5, 4) NOT NULL DEFAULT 0,
  is_banned boolean NOT NULL DEFAULT false,
  is_bot boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stake_level text NOT NULL CHECK (stake_level IN ('practice', 'bronze', 'silver', 'gold', 'diamond', 'tournament')),
  entry_fee bigint NOT NULL DEFAULT 0 CHECK (entry_fee >= 0),
  max_players integer NOT NULL CHECK (max_players BETWEEN 2 AND 5),
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Room players
CREATE TABLE IF NOT EXISTS room_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seat_number integer NOT NULL CHECK (seat_number >= 0),
  has_paid boolean NOT NULL DEFAULT false,
  final_position integer,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, player_id),
  UNIQUE (room_id, seat_number)
);

-- Games
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  variant text NOT NULL DEFAULT '1v1' CHECK (variant IN ('1v1', '3player', '5player')),
  status text NOT NULL DEFAULT 'dealing' CHECK (status IN ('dealing', 'active', 'finished')),
  current_turn uuid REFERENCES profiles(id),
  deck jsonb NOT NULL DEFAULT '[]'::jsonb,
  pile jsonb NOT NULL DEFAULT '[]'::jsonb,
  direction text NOT NULL DEFAULT 'normal' CHECK (direction IN ('normal', 'reverse')),
  called_shape text,
  pending_pick integer NOT NULL DEFAULT 0,
  pending_pick_type text CHECK (pending_pick_type IN ('two', 'three')),
  winner_id uuid REFERENCES profiles(id),
  rake_amount bigint NOT NULL DEFAULT 0,
  shuffle_seed text,
  started_at timestamptz,
  finished_at timestamptz
);

-- Player hands
CREATE TABLE IF NOT EXISTS player_hands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (game_id, player_id)
);

-- Game moves
CREATE TABLE IF NOT EXISTS game_moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  move_type text NOT NULL CHECK (move_type IN ('play', 'pick', 'whot_call')),
  card_played jsonb,
  whot_call text,
  game_state jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'game_win', 'game_loss', 'rake', 'bonus')),
  amount bigint NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  reference text,
  game_id uuid REFERENCES games(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reference)
);

-- Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  entry_fee bigint NOT NULL DEFAULT 0,
  prize_pool bigint NOT NULL DEFAULT 0,
  max_players integer NOT NULL,
  current_players integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'finished')),
  starts_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Bot configs
CREATE TABLE IF NOT EXISTS bot_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  target_win_rate numeric(4, 3) NOT NULL DEFAULT 0.550,
  stake_levels text[] NOT NULL DEFAULT ARRAY['practice', 'bronze', 'silver'],
  min_think_ms integer NOT NULL DEFAULT 1200,
  max_think_ms integer NOT NULL DEFAULT 3800,
  aggression numeric(3, 2) NOT NULL DEFAULT 0.50 CHECK (aggression BETWEEN 0 AND 1),
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Platform settings
CREATE TABLE IF NOT EXISTS platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Admin audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  target_type text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Helper functions
CREATE OR REPLACE FUNCTION increment_profile_balance(profile_uuid uuid, delta bigint)
RETURNS void LANGUAGE sql STABLE AS $$
  UPDATE profiles
  SET real_balance = real_balance + delta
  WHERE id = profile_uuid;
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_games_room ON games(room_id);
CREATE INDEX IF NOT EXISTS idx_player_hands_game ON player_hands(game_id);
CREATE INDEX IF NOT EXISTS idx_game_moves_game ON game_moves(game_id);
CREATE INDEX IF NOT EXISTS idx_transactions_player ON transactions(player_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
