import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/colors';
import { formatNaira } from '../../lib/paystack';
import { supabase } from '../../lib/supabase';
import { useWalletStore } from '../../store/walletStore';

type ProfileStat = {
  id: string;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { realBalanceKobo, bonusBalanceKobo } = useWalletStore();
  const [displayName, setDisplayName] = useState('Player');
  const [email, setEmail] = useState('Signed in');

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted || !data.user) return;

      const meta = data.user.user_metadata;
      const name =
        (typeof meta['username'] === 'string' ? meta['username'] : null) ??
        (typeof meta['full_name'] === 'string' ? meta['full_name'] : null) ??
        (typeof meta['name'] === 'string' ? meta['name'] : null) ??
        data.user.email?.split('@')[0] ??
        'Player';

      setDisplayName(name);
      setEmail(data.user.email ?? 'Signed in');
    });

    return () => {
      mounted = false;
    };
  }, []);

  const stats: ProfileStat[] = [
    { id: 'wins', label: 'Wins', value: '0', icon: 'trophy-outline', color: colors.gold },
    { id: 'played', label: 'Played', value: '0', icon: 'albums-outline', color: colors.electricBlue },
    { id: 'streak', label: 'Streak', value: '0', icon: 'flame-outline', color: colors.coralRed },
  ];

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Unable to sign out', 'Please try again.');
      return;
    }

    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSub}>Stats, security and account settings</Text>
          </View>
          <Ionicons name="settings-outline" size={26} color={colors.warmWhite} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Verified player</Text>
          </View>
        </View>

        <View style={styles.balanceRow}>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Cash Balance</Text>
            <Text style={styles.balanceValue}>{formatNaira(realBalanceKobo)}</Text>
          </View>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Bonus</Text>
            <Text style={styles.bonusValue}>{formatNaira(bonusBalanceKobo)}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Player Stats</Text>
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeading}>Account</Text>
        <View style={styles.menuList}>
          <TouchableOpacity style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Ionicons name="person-outline" size={20} color={colors.electricBlue} />
              <Text style={styles.menuText}>Edit profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.35)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color={colors.vibrantGreen} />
              <Text style={styles.menuText}>Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.35)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Ionicons name="help-circle-outline" size={20} color={colors.gold} />
              <Text style={styles.menuText}>Help center</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.35)" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={19} color={colors.coralRed} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.darkSurface,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,144,255,0.16)',
    borderWidth: 2,
    borderColor: 'rgba(30,144,255,0.45)',
    marginBottom: 14,
  },
  avatarText: {
    color: colors.electricBlue,
    fontSize: 32,
    fontWeight: '800',
  },
  name: {
    color: colors.warmWhite,
    fontSize: 22,
    fontWeight: '800',
  },
  email: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 13,
    marginTop: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,200,83,0.1)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,200,83,0.25)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.vibrantGreen,
  },
  statusText: {
    color: colors.vibrantGreen,
    fontSize: 12,
    fontWeight: '700',
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  balanceBox: {
    flex: 1,
    backgroundColor: colors.darkSurface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  balanceValue: {
    color: colors.vibrantGreen,
    fontSize: 18,
    fontWeight: '800',
  },
  bonusValue: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionHeading: {
    color: colors.warmWhite,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.darkSurface,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statValue: {
    color: colors.warmWhite,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 12,
    marginTop: 2,
  },
  menuList: {
    backgroundColor: colors.darkSurface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    color: colors.warmWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,68,68,0.35)',
    paddingVertical: 15,
    marginTop: 18,
  },
  signOutText: {
    color: colors.coralRed,
    fontSize: 15,
    fontWeight: '800',
  },
});
