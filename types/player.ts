export interface Profile {
  id: string;
  username: string;
  phone: string;
  avatarUrl: string | null;
  realBalanceKobo: number;
  bonusBalanceKobo: number;
  totalGames: number;
  totalWins: number;
  winRate: number;
  isBanned: boolean;
  isBot: boolean;
  createdAt: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  totalWinningsKobo: number;
}
