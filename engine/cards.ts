import {
  CARD_DISTRIBUTION,
  WHOT_NUMBERS,
} from '../constants/game';
import type { Card, Shape } from '../types/game';

let cardIdCounter = 0;

export function resetCardIdCounter(seed = 0): void {
  cardIdCounter = seed;
}

function nextCardId(shape: Shape, number: number): string {
  cardIdCounter += 1;
  return `${shape}-${number}-${cardIdCounter}`;
}

/** Build the full standard Nigerian Whot deck */
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

export function isSpecialCard(card: Card): boolean {
  return [1, 2, 5, 8, 14, 20].includes(card.number);
}

export function getPlayableShapes(): Shape[] {
  return ['circle', 'triangle', 'cross', 'square', 'star'];
}

export function cardsEqual(a: Card, b: Card): boolean {
  return a.id === b.id;
}
