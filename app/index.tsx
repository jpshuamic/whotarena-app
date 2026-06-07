import { Redirect } from 'expo-router';

/** Splash → routes to welcome (Screen 1→2) */
export default function SplashScreen() {
  return <Redirect href="/(auth)/welcome" />;
}
