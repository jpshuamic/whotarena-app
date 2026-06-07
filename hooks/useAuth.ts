import { supabase } from '../lib/supabase';

export function useAuth() {
  return {
    signInWithPhone: async (phone: string) => {
      return supabase.auth.signInWithOtp({ phone });
    },
    verifyOtp: async (phone: string, token: string) => {
      return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    },
    signOut: () => supabase.auth.signOut(),
  };
}
