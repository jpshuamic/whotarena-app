import { STARTING_HAND_SIZE } from './constants.ts';
import { createStandardDeck } from './cards.ts';
import type { Card } from './types.ts';

export function createSeededRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export function shuffleDeck(deck: Card[], seed: string): Card[] {
  const rng = createSeededRng(seed);
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }

  return shuffled;
}

export function createShuffledDeck(seed: string): Card[] {
  return shuffleDeck(createStandardDeck(), seed);
}

export function dealCards(
  deck: Card[],
  playerIds: string[],
  cardsPerPlayer = STARTING_HAND_SIZE,
): {
  deck: Card[];
  hands: Record<string, Card[]>;
} {
  const remaining = [...deck];
  const hands: Record<string, Card[]> = {};

  for (const playerId of playerIds) {
    hands[playerId] = remaining.splice(0, cardsPerPlayer);
  }

  return { deck: remaining, hands };
}

export function drawCards(deck: Card[], count: number): {
  deck: Card[];
  drawn: Card[];
} {
  const drawn = deck.slice(0, count);
  return {
    deck: deck.slice(count),
    drawn,
  };
}

export function generateShuffleSeed(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
