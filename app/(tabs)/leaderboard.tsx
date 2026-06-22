import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { formatNaira } from '../../lib/paystack';

type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly';

type LeaderboardPlayer = {
  id: string;
  rank: number;
  name: string;
  wins: number;
  earningsKobo: number;
  streak: number;
};

const PERIODS: { id: LeaderboardPeriod; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

const LEADERS: LeaderboardPlayer[] = [
  { id: '1', rank: 1, name: 'AdeKing', wins: 24, earningsKobo: 2250000, streak: 8 },
  { id: '2', rank: 2, name: 'WhotBoss', wins: 21, earningsKobo: 1840000, streak: 5 },
  { id: '3', rank: 3, name: 'CardNinja', wins: 18, earningsKobo: 1420000, streak: 4 },
  { id: '4', rank: 4, name: 'LagosAce', wins: 15, earningsKobo: 960000, streak: 3 },
  { id: '5', rank: 5, name: 'NaijaDealer', wins: 12, earningsKobo: 740000, streak: 2 },
  { id: '6', rank: 6, name: 'TableSharp', wins: 10, earningsKobo: 510000, streak: 2 },
];

function getRankColor(rank: number) {
  if (rank === 1) return colors.gold;
  if (rank === 2) return colors.electricBlue;
  if (rank === 3) return colors.vibrantGreen;
  return 'rgba(255,255,255,0.45)';
}

export default function LeaderboardScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('weekly');
  const topThree = LEADERS.slice(0, 3);
  const remaining = LEADERS.slice(3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Leaderboard</Text>
            <Text style={styles.headerSub}>Top earners and hottest streaks</Text>
          </View>
          <MaterialCommunityIcons name="podium-gold" size={30} color={colors.gold} />
        </View>

        <View style={styles.periodRow}>
          {PERIODS.map((period) => {
            const isSelected = selectedPeriod === period.id;
            return (
              <TouchableOpacity
                key={period.id}
                style={[styles.periodButton, isSelected && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod(period.id)}
              >
                <Text style={[styles.periodText, isSelected && styles.periodTextActive]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.podium}>
          {topThree.map((player) => (
            <View key={player.id} style={styles.podiumCard}>
              <View style={[styles.rankBadge, { borderColor: getRankColor(player.rank) }]}>
                <Text style={[styles.rankText, { color: getRankColor(player.rank) }]}>#{player.rank}</Text>
              </View>
              <Text style={styles.podiumName}>{player.name}</Text>
              <Text style={styles.podiumAmount}>{formatNaira(player.earningsKobo)}</Text>
              <Text style={styles.podiumMeta}>{player.wins} wins</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeading}>Chasing Pack</Text>

        {remaining.map((player) => (
          <View key={player.id} style={styles.playerRow}>
            <Text style={styles.rowRank}>#{player.rank}</Text>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{player.name.slice(0, 1)}</Text>
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <View style={styles.playerStats}>
                <Ionicons name="flame-outline" size={13} color={colors.gold} />
                <Text style={styles.playerMeta}>{player.streak} streak</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.playerMeta}>{player.wins} wins</Text>
              </View>
            </View>
            <Text style={styles.earnings}>{formatNaira(player.earningsKobo)}</Text>
          </View>
        ))}

        <View style={styles.userCard}>
          <View>
            <Text style={styles.userLabel}>Your Rank</Text>
            <Text style={styles.userRank}>Play a ranked room to qualify</Text>
          </View>
          <Ionicons name="stats-chart-outline" size={22} color={colors.electricBlue} />
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
    paddingBottom: 22,
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
  periodRow: {
    flexDirection: 'row',
    backgroundColor: colors.darkSurface,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  periodButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.electricBlue,
  },
  periodText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '700',
  },
  periodTextActive: {
    color: colors.deepNavy,
  },
  podium: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  podiumCard: {
    flex: 1,
    backgroundColor: colors.darkSurface,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  rankBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '800',
  },
  podiumName: {
    color: colors.warmWhite,
    fontSize: 13,
    fontWeight: '800',
  },
  podiumAmount: {
    color: colors.vibrantGreen,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  podiumMeta: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 3,
  },
  sectionHeading: {
    color: colors.warmWhite,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkSurface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  rowRank: {
    width: 36,
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    fontWeight: '800',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,144,255,0.14)',
    marginRight: 12,
  },
  avatarText: {
    color: colors.electricBlue,
    fontSize: 16,
    fontWeight: '800',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: colors.warmWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  playerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  playerMeta: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 12,
  },
  dot: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
  },
  earnings: {
    color: colors.vibrantGreen,
    fontSize: 13,
    fontWeight: '800',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30,144,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(30,144,255,0.25)',
  },
  userLabel: {
    color: colors.electricBlue,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userRank: {
    color: colors.warmWhite,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },
});
