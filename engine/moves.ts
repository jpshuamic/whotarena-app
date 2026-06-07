import type { Card, GameState, Shape } from '../types/game';
import { isWhot } from './cards';

export function getTopCard(state: GameState): Card | null {
  return state.pile.length > 0 ? state.pile[state.pile.length - 1]! : null;
}

/** Effective shape for matching after a Whot call */
export function getEffectiveShape(state: GameState): Shape | null {
  const top = getTopCard(state);
  if (!top) return null;
  if (isWhot(top) && state.calledShape) {
    return state.calledShape;
  }
  return top.shape === 'whot' ? null : top.shape;
}

export function getEffectiveNumber(state: GameState): number | null {
  const top = getTopCard(state);
  return top ? top.number : null;
}

export function canMatchCard(state: GameState, card: Card): boolean {
  if (isWhot(card)) return true;

  const top = getTopCard(state);
  if (!top) return true;

  const effectiveShape = getEffectiveShape(state);
  const effectiveNumber = getEffectiveNumber(state);

  if (effectiveShape && card.shape === effectiveShape) return true;
  if (effectiveNumber !== null && card.number === effectiveNumber) return true;

  return false;
}

export function canCounterPick(card: Card, pendingType: 'two' | 'three'): boolean {
  if (card.number === 2) return true;
  if (card.number === 5 && pendingType === 'three') return true;
  return false;
}

export function getValidPlayableCards(
  state: GameState,
  playerId: string,
): Card[] {
  const hand = state.hands[playerId] ?? [];

  if (state.pendingPick > 0) {
    return hand.filter((card) =>
      canCounterPick(card, state.pendingPickType ?? 'two'),
    );
  }

  return hand.filter((card) => canMatchCard(state, card));
}

export function mustPick(state: GameState, playerId: string): boolean {
  if (state.pendingPick > 0) {
    const counters = getValidPlayableCards(state, playerId);
    return counters.length === 0;
  }

  return getValidPlayableCards(state, playerId).length === 0;
}

export function isValidPlayMove(
  state: GameState,
  playerId: string,
  card: Card,
  whotCall?: Shape,
): boolean {
  if (state.status !== 'active') return false;
  if (state.currentPlayerId !== playerId) return false;

  const hand = state.hands[playerId] ?? [];
  if (!hand.some((c) => c.id === card.id)) return false;

  if (state.pendingPick > 0) {
    return canCounterPick(card, state.pendingPickType ?? 'two');
  }

  if (!canMatchCard(state, card)) return false;

  if (isWhot(card) && !whotCall) return false;

  return true;
}

export function canPickFromDeck(state: GameState): boolean {
  return state.deck.length > 0 || state.pile.length > 1;
}

export function isValidPickMove(state: GameState, playerId: string): boolean {
  if (state.status !== 'active') return false;
  if (state.currentPlayerId !== playerId) return false;
  const voluntaryPenalty = state.pendingPick > 0;
  if (!mustPick(state, playerId) && !voluntaryPenalty) return false;
  return canPickFromDeck(state);
}
