import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
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
      // If the browser was dismissed or provider not configured, do nothing
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
        <Pressable style={styles.socialButton} onPress={() => handleOAuth('google')}>
          <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </Pressable>

        <Pressable style={styles.socialButton} onPress={() => handleOAuth('facebook')}>
          <FontAwesome name="facebook" size={20} color="#1877F2" style={styles.socialIcon} />
          <Text style={styles.socialButtonText}>Continue with Facebook</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable style={styles.ctaButton} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.ctaButtonText}>Create account →</Text>
        </Pressable>

        <View style={styles.signInRow}>
          <Text style={styles.signInPrompt}>Already have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </Pressable>
        </View>
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
  socialButton: {
    backgroundColor: '#FFFFFF',
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    color: '#0D1B2A',
    fontSize: 15,
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
  ctaButton: {
    backgroundColor: colors.electricBlue,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.electricBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  signInPrompt: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  signInLink: {
    color: colors.gold,
    fontWeight: '700',
    fontSize: 14,
  },
});
