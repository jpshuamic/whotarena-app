import 'react-native-url-polyfill/auto';
import { Stack } from 'expo-router';
import { colors } from '../constants/colors';
import './global.css';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.deepNavy },
      }}
    />
  );
}
