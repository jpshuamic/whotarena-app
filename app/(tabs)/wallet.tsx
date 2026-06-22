import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { formatNaira } from '../../lib/paystack';
import { useWalletStore } from '../../store/walletStore';

type TransactionType = 'credit' | 'debit';

type Transaction = {
  id: string;
  label: string;
  amount: number;
  type: TransactionType;
  date: string;
};

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', label: 'Silver Room Win', amount: 90000, type: 'credit', date: 'Today, 2:14 PM' },
  { id: '2', label: 'Bronze Room Entry', amount: -20000, type: 'debit', date: 'Today, 1:50 PM' },
  { id: '3', label: 'Deposit via Paystack', amount: 500000, type: 'credit', date: 'Yesterday' },
  { id: '4', label: 'Gold Room Entry', amount: -200000, type: 'debit', date: 'Yesterday' },
  { id: '5', label: 'Withdrawal to Bank', amount: -300000, type: 'debit', date: '20 Jun' },
];

export default function WalletScreen() {
  const { realBalanceKobo, bonusBalanceKobo } = useWalletStore();

  const handleDeposit = () => {
    Alert.alert('Deposit', 'Paystack deposit flow coming soon.');
  };

  const handleWithdraw = () => {
    Alert.alert('Withdraw', 'Bank transfer withdrawal coming soon.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wallet</Text>
          <Ionicons name="card-outline" size={24} color={colors.warmWhite} />
        </View>

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatNaira(realBalanceKobo)}</Text>
          {bonusBalanceKobo > 0 && (
            <View style={styles.bonusRow}>
              <Ionicons name="gift-outline" size={14} color={colors.gold} />
              <Text style={styles.bonusText}>Bonus: {formatNaira(bonusBalanceKobo)}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.depositBtn} onPress={handleDeposit}>
            <Ionicons name="add-circle-outline" size={20} color="#0D1B2A" />
            <Text style={styles.depositBtnText}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw}>
            <Ionicons name="arrow-up-circle-outline" size={20} color={colors.warmWhite} />
            <Text style={styles.withdrawBtnText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions */}
        <Text style={styles.sectionHeading}>Recent Transactions</Text>

        {MOCK_TRANSACTIONS.map((tx) => (
          <View key={tx.id} style={styles.txRow}>
            <View style={[styles.txIcon, tx.type === 'credit' ? styles.txIconCredit : styles.txIconDebit]}>
              <Ionicons
                name={tx.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                size={16}
                color={tx.type === 'credit' ? colors.vibrantGreen : colors.coralRed}
              />
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txLabel}>{tx.label}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text style={[styles.txAmount, tx.type === 'credit' ? styles.txAmountCredit : styles.txAmountDebit]}>
              {tx.type === 'credit' ? '+' : ''}{formatNaira(Math.abs(tx.amount))}
            </Text>
          </View>
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
  headerTitle: {
    color: colors.warmWhite,
    fontSize: 26,
    fontWeight: '800',
  },
  balanceCard: {
    backgroundColor: colors.darkSurface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    color: colors.vibrantGreen,
    fontSize: 42,
    fontWeight: '800',
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  bonusText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  depositBtn: {
    flex: 1,
    backgroundColor: colors.vibrantGreen,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  depositBtnText: {
    color: '#0D1B2A',
    fontSize: 15,
    fontWeight: '800',
  },
  withdrawBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  withdrawBtnText: {
    color: colors.warmWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeading: {
    color: colors.warmWhite,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkSurface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  txIconCredit: {
    backgroundColor: 'rgba(0,200,83,0.12)',
  },
  txIconDebit: {
    backgroundColor: 'rgba(255,68,68,0.12)',
  },
  txInfo: {
    flex: 1,
  },
  txLabel: {
    color: colors.warmWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  txDate: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txAmountCredit: {
    color: colors.vibrantGreen,
  },
  txAmountDebit: {
    color: colors.coralRed,
  },
});
