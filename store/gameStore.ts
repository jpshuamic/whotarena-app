import { create } from 'zustand';
import type { GameState } from '../types/game';

interface GameStoreState {
  activeGame: GameState | null;
  setActiveGame: (game: GameState | null) => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  activeGame: null,
  setActiveGame: (game) => set({ activeGame: game }),
}));
