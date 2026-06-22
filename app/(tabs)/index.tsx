import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RoomCard } from '../../components/lobby/RoomCard';
import { STAKE_LEVELS } from '../../constants/stakes';
import { colors } from '../../constants/colors';
import { formatNaira } from '../../lib/paystack';
import { useWalletStore } from '../../store/walletStore';
import { supabase } from '../../lib/supabase';

const VISIBLE_STAKES = Object.values(STAKE_LEVELS).filter((s) => s.launchEnabled);

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function LobbyScreen() {
  const router = useRouter();
  const { realBalanceKobo } = useWalletStore();
  const [username, setUsername] = useState('Player');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted || !data.user) return;
      const meta = data.user.user_metadata;
      const display =
        (typeof meta['full_name'] === 'string' ? meta['full_name'] : null) ??
        (typeof meta['name'] === 'string' ? meta['name'] : null) ??
        data.user.email?.split('@')[0] ??
        'Player';
      setUsername(display);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>WhotArena</Text>
          <View style={styles.balanceChip}>
            <Ionicons name="wallet-outline" size={14} color={colors.vibrantGreen} />
            <Text style={styles.balanceText}>{formatNaira(realBalanceKobo)}</Text>
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greetSection}>
          <Text style={styles.greeting}>{getGreeting()}, {username} 👋</Text>
          <Text style={styles.subtitle}>Ready to play?</Text>
          <View style={styles.onlinePill}>
            <Animated.View style={[styles.onlineDot, { opacity: pulseAnim }]} />
            <Text style={styles.onlineText}>247 players online</Text>
          </View>
        </View>

        {/* Stakes */}
        <Text style={styles.sectionHeading}>Choose Your Stakes</Text>
        {VISIBLE_STAKES.map((stake) => (
          <RoomCard
            key={stake.id}
            label={stake.label}
            badge={stake.badge}
            entryFee={stake.entryFee}
            maxPlayers={stake.maxPlayers}
            botEnabled={stake.botEnabled}
            color={stake.color}
            onPress={() => router.push(`/game/waiting?roomLevel=${stake.id}`)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deepNavy,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
  },
  brand: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkSurface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,200,83,0.25)',
  },
  balanceText: {
    color: colors.vibrantGreen,
    fontSize: 14,
    fontWeight: '700',
  },
  greetSection: {
    backgroundColor: colors.darkSurface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  greeting: {
    color: colors.warmWhite,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
  },
  subtitle: {
    color: colors.electricBlue,
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,200,83,0.1)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,200,83,0.25)',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.vibrantGreen,
  },
  onlineText: {
    color: colors.vibrantGreen,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeading: {
    color: colors.warmWhite,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
});
