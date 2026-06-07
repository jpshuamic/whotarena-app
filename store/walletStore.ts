import { create } from 'zustand';

interface WalletStoreState {
  realBalanceKobo: number;
  bonusBalanceKobo: number;
  setBalances: (real: number, bonus: number) => void;
}

export const useWalletStore = create<WalletStoreState>((set) => ({
  realBalanceKobo: 0,
  bonusBalanceKobo: 0,
  setBalances: (real, bonus) =>
    set({ realBalanceKobo: real, bonusBalanceKobo: bonus }),
}));
