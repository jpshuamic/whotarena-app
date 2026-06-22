import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// Registration is handled via Google/Facebook OAuth or email OTP on the welcome screen.
export default function RegisterScreen() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(auth)/welcome');
  }, [router]);
  return null;
}
