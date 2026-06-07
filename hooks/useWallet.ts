import { supabase } from '../lib/supabase';

export function useWallet(userId: string | null) {
  return {
    refreshBalance: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('profiles')
        .select('real_balance, bonus_balance')
        .eq('id', userId)
        .single();
      return data;
    },
  };
}
