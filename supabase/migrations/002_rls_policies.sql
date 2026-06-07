-- Row Level Security (Section 11)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Helper: admin role check via app_metadata (never user_metadata)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- Profiles: own profile only
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id AND NOT is_banned);

-- Rooms: players in room can read
CREATE POLICY rooms_select_member ON rooms
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM room_players rp
      WHERE rp.room_id = rooms.id AND rp.player_id = auth.uid()
    )
  );

-- Room players: visible to room members
CREATE POLICY room_players_select_member ON room_players
  FOR SELECT USING (
    public.is_admin()
    OR player_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM room_players rp
      WHERE rp.room_id = room_players.room_id AND rp.player_id = auth.uid()
    )
  );

-- Games: public state for room members (no other players' hands)
CREATE POLICY games_select_member ON games
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM room_players rp
      WHERE rp.room_id = games.room_id AND rp.player_id = auth.uid()
    )
  );

-- Player hands: own hand only
CREATE POLICY player_hands_select_own ON player_hands
  FOR SELECT USING (player_id = auth.uid() OR public.is_admin());

-- Game moves: room members can read move log
CREATE POLICY game_moves_select_member ON game_moves
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM games g
      JOIN room_players rp ON rp.room_id = g.room_id
      WHERE g.id = game_moves.game_id AND rp.player_id = auth.uid()
    )
  );

-- Transactions: own transactions only
CREATE POLICY transactions_select_own ON transactions
  FOR SELECT USING (player_id = auth.uid() OR public.is_admin());

-- Tournaments: public read
CREATE POLICY tournaments_select_all ON tournaments
  FOR SELECT USING (true);

-- Bot configs: admin only
CREATE POLICY bot_configs_admin ON bot_configs
  FOR ALL USING (public.is_admin());

-- Platform settings: admin only
CREATE POLICY platform_settings_admin ON platform_settings
  FOR ALL USING (public.is_admin());

-- Admin audit log: admin only
CREATE POLICY admin_audit_log_admin ON admin_audit_log
  FOR ALL USING (public.is_admin());

-- Realtime publication (Section 13)
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE player_hands;
ALTER PUBLICATION supabase_realtime ADD TABLE room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_moves;
