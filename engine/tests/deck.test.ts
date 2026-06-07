import { createStandardDeck } from '../cards';
import { createShuffledDeck, createSeededRng } from '../deck';
import { TOTAL_CARDS } from '../../constants/game';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function runDeckTests(): void {
  const deck = createStandardDeck();
  assert(deck.length === TOTAL_CARDS, `Expected ${TOTAL_CARDS} cards, got ${deck.length}`);

  const whots = deck.filter((c) => c.shape === 'whot');
  assert(whots.length === 5, `Expected 5 whot cards, got ${whots.length}`);

  const seed = 'provably-fair-test-seed';
  const shuffle1 = createShuffledDeck(seed);
  const shuffle2 = createShuffledDeck(seed);
  assert(
    shuffle1.map((c) => c.id).join(',') === shuffle2.map((c) => c.id).join(','),
    'Seeded shuffle must be deterministic',
  );

  const rng1 = createSeededRng('test');
  const rng2 = createSeededRng('test');
  assert(rng1() === rng2(), 'Seeded RNG must be deterministic');

  console.log('PASS: deck tests');
}

runDeckTests();
