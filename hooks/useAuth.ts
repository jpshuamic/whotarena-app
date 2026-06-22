import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

// In Expo Go this resolves to exp://host/--/auth/callback; in standalone to whotarena://auth/callback
const REDIRECT_URI = makeRedirectUri({ scheme: 'whotarena', path: 'auth/callback' });

export function useAuth() {
  const signInWithEmail = async (email: string) => {
    return supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  };

  const verifyEmailOtp = async (email: string, token: string) => {
    return supabase.auth.verifyOtp({ email, token, type: 'email' });
  };

  const signInWithOAuthProvider = async (provider: 'google' | 'facebook'): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: REDIRECT_URI, skipBrowserRedirect: true },
    });
    if (error || !data.url) throw error ?? new Error('No OAuth URL returned');

    const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);
    if (result.type !== 'success') throw new Error('cancelled');

    // PKCE flow — extract authorization code and exchange for session
    const codeMatch = result.url.match(/[?&]code=([^&]+)/);
    if (codeMatch?.[1]) {
      const { error: sessionErr } = await supabase.auth.exchangeCodeForSession(
        decodeURIComponent(codeMatch[1])
      );
      if (sessionErr) throw sessionErr;
      return;
    }

    // Implicit flow fallback — tokens in URL fragment
    const atMatch = result.url.match(/[#&]access_token=([^&]+)/);
    const rtMatch = result.url.match(/[#&]refresh_token=([^&]+)/);
    if (atMatch?.[1] && rtMatch?.[1]) {
      const { error: sessionErr } = await supabase.auth.setSession({
        access_token: decodeURIComponent(atMatch[1]),
        refresh_token: decodeURIComponent(rtMatch[1]),
      });
      if (sessionErr) throw sessionErr;
    }
  };

  const signOut = () => supabase.auth.signOut();

  return { signInWithEmail, verifyEmailOtp, signInWithOAuthProvider, signOut };
}
