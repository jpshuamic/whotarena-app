import { isWhot } from './cards.ts';
import type { Card, GameState, Shape } from './types.ts';

export function getPickCountForCard(card: Card): number {
  if (card.number === 2) return 2;
  if (card.number === 5) return 3;
  return 0;
}

export function getSkipCount(card: Card): number {
  if (card.number === 1 || card.number === 8) return 1;
  return 0;
}

export function isGeneralMarket(card: Card): boolean {
  return card.number === 14;
}

export function applyPickStack(
  state: GameState,
  card: Card,
): Pick<GameState, 'pendingPick' | 'pendingPickType'> {
  const added = getPickCountForCard(card);
  if (added === 0) {
    return { pendingPick: 0, pendingPickType: null };
  }

  const type = card.number === 5 ? 'three' : 'two';
  return {
    pendingPick: state.pendingPick + added,
    pendingPickType: type,
  };
}

export function clearPickStack(): Pick<
  GameState,
  'pendingPick' | 'pendingPickType'
> {
  return { pendingPick: 0, pendingPickType: null };
}

export function resolveCalledShape(
  card: Card,
  whotCall?: Shape,
): Shape | null {
  if (isWhot(card) && whotCall) return whotCall;
  if (!isWhot(card)) return null;
  return null;
}
