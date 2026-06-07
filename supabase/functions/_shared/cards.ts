import { CARD_DISTRIBUTION, PLAYABLE_SHAPES, WHOT_NUMBERS } from './constants.ts';
import type { Card, Shape } from './types.ts';

let cardIdCounter = 0;

export function resetCardIdCounter(seed = 0): void {
  cardIdCounter = seed;
}

function nextCardId(shape: Shape, number: number): string {
  cardIdCounter += 1;
  return `${shape}-${number}-${cardIdCounter}`;
}

export function createStandardDeck(): Card[] {
  resetCardIdCounter(0);
  const deck: Card[] = [];

  for (const [shape, numbers] of Object.entries(CARD_DISTRIBUTION)) {
    for (const number of numbers) {
      deck.push({
        id: nextCardId(shape as Shape, number),
        shape: shape as Shape,
        number,
      });
    }
  }

  for (const number of WHOT_NUMBERS) {
    deck.push({
      id: nextCardId('whot', number),
      shape: 'whot',
      number,
    });
  }

  return deck;
}

export function isWhot(card: Card): boolean {
  return card.shape === 'whot' || card.number === 20;
}

export function getPlayableShapes(): Shape[] {
  return [...PLAYABLE_SHAPES];
}
