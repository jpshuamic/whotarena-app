import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    // Force React Native's native fetch; prevents cross-fetch/whatwg-fetch
    // from being used, which fails in the native environment.
    fetch: globalThis.fetch.bind(globalThis),
  },
});

/** Realtime tables (Section 13) */
export const REALTIME_TABLES = [
  'games',
  'player_hands',
  'room_players',
  'game_moves',
] as const;
