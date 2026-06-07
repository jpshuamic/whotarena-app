import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Realtime tables (Section 13) */
export const REALTIME_TABLES = [
  'games',
  'player_hands',
  'room_players',
  'game_moves',
] as const;
