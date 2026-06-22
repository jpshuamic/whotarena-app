import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({ scheme: 'whotarena' });

export function useAuth() {
  const signInWithEmail = async (email: string) => {
    return supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  };

  const verifyEmailOtp = async (email: string, token: string) => {
    return supabase.auth.verifyOtp({ email, token, type: 'email' });
  };

  const signInWithOAuthProvider = async (provider: 'google' | 'facebook') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) throw error ?? new Error('No OAuth URL returned');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return { data: null, error: null };

    const { data: session, error: sessionError } = await supabase.auth.getSessionFromUrl(result.url);
    return { data: session, error: sessionError };
  };

  const signOut = () => supabase.auth.signOut();

  return { signInWithEmail, verifyEmailOtp, signInWithOAuthProvider, signOut };
}
