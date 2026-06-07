export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'game_win'
  | 'game_loss'
  | 'rake'
  | 'bonus';

export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  playerId: string;
  type: TransactionType;
  amountKobo: number;
  status: TransactionStatus;
  reference: string | null;
  gameId: string | null;
  createdAt: string;
}

export interface WalletBalance {
  realBalanceKobo: number;
  bonusBalanceKobo: number;
}

export const ANTI_FRAUD_RULES = {
  minPaidGamesBeforeWithdrawal: 1,
  sameAccountAsDeposit: true,
  flagMultipleAccountsPerDevice: true,
} as const;
