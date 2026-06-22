import { Redirect } from 'expo-router';

// DEV BYPASS: skip auth, go straight to lobby. Restore href="/(auth)/welcome" when auth is ready.
export default function Index() {
  return <Redirect href="/(tabs)/" />;
}
