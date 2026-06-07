-- DEPRECATED: Use supabase/migrations/ instead (001, 002, 003)
-- Kept for reference. Apply migrations in order via Supabase CLI or Dashboard.

-- Players / Users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  username text,
  phone text,
  avatar_url text,
  real_balance bigint,
  bonus_balance bigint,
  total_games integer,
  total_wins integer,
  win_rate numeric,
  is_banned boolean DEFAULT false,
  is_bot boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Game Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY,
  stake_level text,
  entry_fee bigint,
  max_players integer,
  status text,
  created_at timestamptz DEFAULT now()
);

-- Room Players
CREATE TABLE IF NOT EXISTS room_players (
  id uuid PRIMARY KEY,
  room_id uuid REFERENCES rooms(id),
  player_id uuid REFERENCES profiles(id),
  seat_number integer,
  has_paid boolean DEFAULT false,
  final_position integer,
  joined_at timestamptz DEFAULT now()
);

-- Games
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY,
  room_id uuid REFERENCES rooms(id),
  status text,
  current_turn uuid,
  deck jsonb,
  pile jsonb,
  direction text,
  winner_id uuid REFERENCES profiles(id),
  rake_amount bigint,
  started_at timestamptz,
  finished_at timestamptz
);

-- Player Hands
CREATE TABLE IF NOT EXISTS player_hands (
  id uuid PRIMARY KEY,
  game_id uuid REFERENCES games(id),
  player_id uuid REFERENCES profiles(id),
  cards jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Game Moves
CREATE TABLE IF NOT EXISTS game_moves (
  id uuid PRIMARY KEY,
  game_id uuid REFERENCES games(id),
  player_id uuid REFERENCES profiles(id),
  move_type text,
  card_played jsonb,
  whot_call text,
  game_state jsonb,
  created_at timestamptz DEFAULT now()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY,
  player_id uuid REFERENCES profiles(id),
  type text,
  amount bigint,
  status text,
  reference text,
  game_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY,
  name text,
  entry_fee bigint,
  prize_pool bigint,
  max_players integer,
  current_players integer,
  status text,
  starts_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Bot Configs
CREATE TABLE IF NOT EXISTS bot_configs (
  id uuid PRIMARY KEY,
  bot_id uuid REFERENCES profiles(id),
  target_win_rate numeric,
  stake_levels text[],
  min_think_ms integer,
  max_think_ms integer,
  aggression numeric,
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Platform Settings
CREATE TABLE IF NOT EXISTS platform_settings (
  key text PRIMARY KEY,
  value jsonb,
  updated_at timestamptz DEFAULT now()
);
