import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { brandImages } from '../../constants/images';
import { useAuth } from '../../hooks/useAuth';

const FEATURE_PILLS = ['Skill Game', 'Real Money', 'Instant Pay'];

export default function WelcomeScreen() {
  const router = useRouter();
  const auth = useAuth();

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    try {
      await auth.signInWithOAuthProvider(provider);
      router.replace('/(tabs)');
    } catch {
      // Provider not configured or browser dismissed — stay on screen
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topSection}>
        <Text style={styles.brand}>WhotArena</Text>
        <Text style={styles.tagline}>Play Sharp. Win Real.</Text>
      </View>

      <View style={styles.middleSection}>
        <Image
          source={brandImages.mascotHappy}
          style={styles.mascot}
          resizeMode="contain"
        />
        <Text style={styles.headline}>Play Whot. Win Real Money.</Text>
        <Text style={styles.subtext}>Nigeria's #1 skill card game.</Text>

        <View style={styles.pillsRow}>
          {FEATURE_PILLS.map((pill) => (
            <View key={pill} style={styles.pill}>
              <Text style={styles.pillText}>{pill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Pressable style={styles.googleButton} onPress={() => handleOAuth('google')}>
          <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.btnIcon} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </Pressable>

        <Pressable style={styles.facebookButton} onPress={() => handleOAuth('facebook')}>
          <Ionicons name="logo-facebook" size={20} color="#FFFFFF" style={styles.btnIcon} />
          <Text style={styles.facebookButtonText}>Continue with Facebook</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.emailLink}>Sign in with email</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deepNavy,
  },
  topSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  brand: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: colors.electricBlue,
    fontWeight: '500',
    marginTop: 4,
  },
  middleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  mascot: {
    width: '90%',
    height: 260,
    alignSelf: 'center',
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 32,
  },
  subtext: {
    fontSize: 15,
    color: colors.electricBlue,
    textAlign: 'center',
    marginTop: 6,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  pill: {
    backgroundColor: colors.darkSurface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 16,
    gap: 12,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
  },
  facebookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '500',
  },
  emailLink: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
