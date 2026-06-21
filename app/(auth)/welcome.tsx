import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/colors';
import { brandImages } from '../../constants/images';

const FEATURE_PILLS = ['Skill Game', 'Real Money', 'Instant Pay'];

export default function WelcomeScreen() {
  const router = useRouter();

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
        <Text style={[styles.subtext, styles.subtextSpacing]}>
          Deposit. Play. Withdraw instantly.
        </Text>

        <View style={styles.pillsRow}>
          {FEATURE_PILLS.map((pill) => (
            <View key={pill} style={styles.pill}>
              <Text style={styles.pillText}>{pill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Pressable
          style={styles.ctaButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.ctaButtonText}>Let's Play →</Text>
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
    width: '85%',
    height: 260,
    alignSelf: 'center',
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 28,
    lineHeight: 34,
  },
  subtext: {
    fontSize: 15,
    color: colors.electricBlue,
    textAlign: 'center',
    marginTop: 8,
  },
  subtextSpacing: {
    marginTop: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
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
    paddingBottom: 48,
    paddingTop: 24,
  },
  ctaButton: {
    backgroundColor: colors.electricBlue,
    width: '100%',
    height: 58,
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
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
