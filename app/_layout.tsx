import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { type User } from '@supabase/supabase-js';
import { colors } from '../constants/colors';
import { supabase } from '../lib/supabase';
import './global.css';

async function createProfileIfNeeded(user: User): Promise<void> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();
  if (existing) return;

  const meta = user.user_metadata;
  const username =
    (typeof meta['name'] === 'string' ? meta['name'] : null) ??
    (typeof meta['full_name'] === 'string' ? meta['full_name'] : null) ??
    user.email?.split('@')[0] ??
    'Player';

  await supabase.from('profiles').insert({
    id: user.id,
    username,
    real_balance: 0,
    bonus_balance: 100000,
    total_games: 0,
    total_wins: 0,
    win_rate: 0.0,
    is_bot: false,
    is_banned: false,
  });
}

export default function RootLayout() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        void createProfileIfNeeded(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.deepNavy },
      }}
    />
  );
}
