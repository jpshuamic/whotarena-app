import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { formatNaira } from '../../lib/paystack';

type TournamentStatus = 'live' | 'upcoming';

type Tournament = {
  id: string;
  title: string;
  prizeKobo: number;
  entryKobo: number;
  players: number;
  maxPlayers: number;
  startsAt: string;
  status: TournamentStatus;
};

const TOURNAMENTS: Tournament[] = [
  {
    id: '1',
    title: 'Daily Champion',
    prizeKobo: 1000000,
    entryKobo: 50000,
    players: 12,
    maxPlayers: 16,
    startsAt: 'Live Now',
    status: 'live',
  },
  {
    id: '2',
    title: 'Weekend Grand Prix',
    prizeKobo: 5000000,
    entryKobo: 200000,
    players: 4,
    maxPlayers: 32,
    startsAt: 'Sat 8:00 PM',
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Bronze League Cup',
    prizeKobo: 500000,
    entryKobo: 20000,
    players: 8,
    maxPlayers: 16,
    startsAt: 'Sun 2:00 PM',
    status: 'upcoming',
  },
];

export default function TournamentsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Tournaments</Text>
            <Text style={styles.headerSub}>Compete for big prize pools</Text>
          </View>
          <MaterialCommunityIcons name="trophy-outline" size={28} color={colors.gold} />
        </View>

        {/* Tournament cards */}
        {TOURNAMENTS.map((t) => (
          <View key={t.id} style={styles.card}>
            {/* Top row: title + status */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{t.title}</Text>
              <View style={[styles.statusBadge, t.status === 'live' ? styles.statusLive : styles.statusUpcoming]}>
                {t.status === 'live' && (
                  <View style={styles.liveDot} />
                )}
                <Text style={[styles.statusText, t.status === 'live' ? styles.statusTextLive : styles.statusTextUpcoming]}>
                  {t.status === 'live' ? 'Live' : t.startsAt}
                </Text>
              </View>
            </View>

            {/* Prize pool */}
            <Text style={styles.prizeAmount}>{formatNaira(t.prizeKobo)}</Text>
            <Text style={styles.prizeLabel}>Prize Pool</Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="people-outline" size={14} color="rgba(255,255,255,0.5)" />
                <Text style={styles.statText}>{t.players}/{t.maxPlayers} players</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.5)" />
                <Text style={styles.statText}>Entry: {formatNaira(t.entryKobo)}</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${(t.players / t.maxPlayers) * 100}%` }]} />
            </View>

            {/* Register button */}
            <TouchableOpacity
              style={[styles.registerBtn, t.status === 'live' ? styles.registerBtnLive : styles.registerBtnUpcoming]}
            >
              <Ionicons
                name={t.status === 'live' ? 'play-circle-outline' : 'alarm-outline'}
                size={18}
                color={t.status === 'live' ? '#0D1B2A' : colors.gold}
              />
              <Text style={[styles.registerBtnText, t.status === 'live' ? styles.registerBtnTextLive : styles.registerBtnTextUpcoming]}>
                {t.status === 'live' ? 'Join Now' : 'Register'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Empty hint */}
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.3)" />
          <Text style={styles.hintText}>New tournaments drop daily. Check back often.</Text>
        </View>
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
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    color: colors.warmWhite,
    fontSize: 26,
    fontWeight: '800',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.darkSurface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: colors.warmWhite,
    fontSize: 17,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  statusLive: {
    backgroundColor: 'rgba(255,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.3)',
  },
  statusUpcoming: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.coralRed,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextLive: {
    color: colors.coralRed,
  },
  statusTextUpcoming: {
    color: colors.gold,
  },
  prizeAmount: {
    color: colors.vibrantGreen,
    fontSize: 32,
    fontWeight: '800',
  },
  prizeLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  progressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.electricBlue,
    borderRadius: 2,
  },
  registerBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  registerBtnLive: {
    backgroundColor: colors.vibrantGreen,
  },
  registerBtnUpcoming: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  registerBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  registerBtnTextLive: {
    color: '#0D1B2A',
  },
  registerBtnTextUpcoming: {
    color: colors.gold,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
  },
  hintText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
  },
});
