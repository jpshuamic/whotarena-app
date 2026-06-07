import { STARTING_HAND_SIZE } from '../constants/game';
import type {
  Card,
  GameDirection,
  GameState,
  GameVariant,
  MoveInput,
  PlayerSlot,
  Shape,
} from '../types/game';
import { isWhot } from './cards';
import {
  applyPickStack,
  clearPickStack,
  getPickCountForCard,
  getSkipCount,
  isGeneralMarket,
  resolveCalledShape,
} from './effects';
import {
  createShuffledDeck,
  dealCards,
  drawCards,
  generateShuffleSeed,
  shuffleDeck,
} from './deck';
import {
  canPickFromDeck,
  getValidPlayableCards,
  isValidPickMove,
  isValidPlayMove,
  mustPick,
} from './moves';

function variantToPlayerCount(variant: GameVariant): number {
  if (variant === '1v1') return 2;
  if (variant === '3player') return 3;
  return 5;
}

function getPlayerIndex(state: GameState, playerId: string): number {
  return state.players.findIndex((p) => p.id === playerId);
}

function getNextPlayerId(
  state: GameState,
  fromPlayerId: string,
  steps = 1,
): string {
  const index = getPlayerIndex(state, fromPlayerId);
  if (index === -1) return fromPlayerId;

  const count = state.players.length;
  const direction = state.direction === 'normal' ? 1 : -1;
  const nextIndex = (index + direction * steps + count * 10) % count;
  return state.players[nextIndex]!.id;
}

function removeCardFromHand(
  hands: Record<string, Card[]>,
  playerId: string,
  cardId: string,
): Record<string, Card[]> {
  return {
    ...hands,
    [playerId]: (hands[playerId] ?? []).filter((c) => c.id !== cardId),
  };
}

function checkWinner(hands: Record<string, Card[]>): string | null {
  for (const [playerId, hand] of Object.entries(hands)) {
    if (hand.length === 0) return playerId;
  }
  return null;
}

export function createInitialGameState(
  roomId: string,
  players: PlayerSlot[],
  variant: GameVariant,
  seed = generateShuffleSeed(),
): GameState {
  const shuffled = createShuffledDeck(seed);
  const playerIds = players.map((p) => p.id);
  const { deck, hands } = dealCards(shuffled, playerIds, STARTING_HAND_SIZE);

  let pile: Card[] = [];
  let remainingDeck = [...deck];

  while (pile.length === 0 && remainingDeck.length > 0) {
    const starter = remainingDeck.shift()!;
    if (isWhot(starter)) {
      remainingDeck.push(starter);
      continue;
    }
    pile = [starter];
  }

  return {
    id: `game-${seed}`,
    roomId,
    status: 'active',
    variant,
    players,
    hands,
    deck: remainingDeck,
    pile,
    currentPlayerId: players[0]!.id,
    direction: 'normal',
    calledShape: null,
    pendingPick: 0,
    pendingPickType: null,
    winnerId: null,
    moveHistory: [],
    shuffleSeed: seed,
    startedAt: Date.now(),
    finishedAt: null,
  };
}

export function createBotVsBotGame(
  botCount: number,
  seed: string,
): GameState {
  const variant: GameVariant =
    botCount === 2 ? '1v1' : botCount === 3 ? '3player' : '5player';

  const players: PlayerSlot[] = Array.from({ length: botCount }, (_, i) => ({
    id: `bot-${i + 1}`,
    seatNumber: i,
    isBot: true,
  }));

  return createInitialGameState(`sim-${seed}`, players, variant, seed);
}

function advanceTurn(
  state: GameState,
  extraSkips = 0,
): Pick<GameState, 'currentPlayerId'> {
  const steps = 1 + extraSkips;
  return {
    currentPlayerId: getNextPlayerId(state, state.currentPlayerId, steps),
  };
}

function applyGeneralMarket(
  state: GameState,
  actingPlayerId: string,
): Pick<GameState, 'hands' | 'deck'> {
  let deck = [...state.deck];
  const hands = { ...state.hands };

  for (const player of state.players) {
    if (player.id === actingPlayerId) continue;
    const { deck: newDeck, drawn } = drawCards(deck, 1);
    deck = newDeck;
    hands[player.id] = [...(hands[player.id] ?? []), ...drawn];
  }

  return { hands, deck };
}

function reshufflePileIntoDeck(state: GameState): GameState {
  if (state.deck.length > 0 || state.pile.length <= 1) {
    return state;
  }

  const top = state.pile[state.pile.length - 1]!;
  const rest = state.pile.slice(0, -1);
  const shuffled = shuffleDeck(rest, `${state.shuffleSeed}-reshuffle`);

  return {
    ...state,
    deck: shuffled,
    pile: [top],
  };
}

function applyPickFromDeck(
  state: GameState,
  playerId: string,
  count: number,
): Pick<GameState, 'hands' | 'deck' | 'pendingPick' | 'pendingPickType'> {
  let deck = state.deck;
  let pickCount = count;

  if (deck.length < pickCount) {
    const withReshuffle = reshufflePileIntoDeck({ ...state, deck });
    deck = withReshuffle.deck;
  }

  pickCount = Math.min(count, deck.length);
  const { deck: newDeck, drawn } = drawCards(deck, pickCount);

  return {
    deck: newDeck,
    hands: {
      ...state.hands,
      [playerId]: [...(state.hands[playerId] ?? []), ...drawn],
    },
    ...clearPickStack(),
  };
}

export function applyPlayMove(
  state: GameState,
  playerId: string,
  card: Card,
  whotCall?: Shape,
): GameState {
  if (!isValidPlayMove(state, playerId, card, whotCall)) {
    throw new Error('Invalid play move');
  }

  let next: GameState = {
    ...state,
    hands: removeCardFromHand(state.hands, playerId, card.id),
    pile: [...state.pile, card],
    calledShape: resolveCalledShape(card, whotCall),
    moveHistory: [
      ...state.moveHistory,
      {
        playerId,
        moveType: isWhot(card) ? 'whot_call' : 'play',
        cardPlayed: card,
        whotCall,
        timestamp: Date.now(),
      },
    ],
  };

  const winnerId = checkWinner(next.hands);
  if (winnerId) {
    return {
      ...next,
      winnerId,
      status: 'finished',
      finishedAt: Date.now(),
    };
  }

  if (state.pendingPick > 0) {
    next = { ...next, ...applyPickStack(next, card) };
    return { ...next, ...advanceTurn(next) };
  }

  if (getPickCountForCard(card) > 0) {
    next = { ...next, ...applyPickStack(next, card) };
    return { ...next, ...advanceTurn(next) };
  }

  if (isGeneralMarket(card)) {
    const market = applyGeneralMarket(next, playerId);
    next = { ...next, ...market };
  }

  const skips = getSkipCount(card);
  return { ...next, ...advanceTurn(next, skips) };
}

export function applyPickMove(state: GameState, playerId: string): GameState {
  let working = reshufflePileIntoDeck(state);

  if (!isValidPickMove(working, playerId)) {
    throw new Error('Invalid pick move');
  }

  const count = working.pendingPick > 0 ? working.pendingPick : 1;

  let next: GameState = {
    ...working,
    ...applyPickFromDeck(working, playerId, count),
    moveHistory: [
      ...state.moveHistory,
      {
        playerId,
        moveType: 'pick',
        cardsPicked: count,
        timestamp: Date.now(),
      },
    ],
  };

  return { ...next, ...advanceTurn(next) };
}

export function applyMove(state: GameState, move: MoveInput): GameState {
  if (move.type === 'pick') {
    return applyPickMove(state, move.playerId);
  }

  const hand = state.hands[move.playerId] ?? [];
  const card = hand.find((c) => c.id === move.cardId);
  if (!card) throw new Error('Card not in hand');

  return applyPlayMove(state, move.playerId, card, move.whotCall);
}

export function getLegalMoves(state: GameState, playerId: string): MoveInput[] {
  if (state.status !== 'active' || state.currentPlayerId !== playerId) {
    return [];
  }

  const playMoves = getValidPlayableCards(state, playerId).flatMap((card) => {
    if (isWhot(card)) {
      const shapes: Shape[] = [
        'circle',
        'triangle',
        'cross',
        'square',
        'star',
      ];
      return shapes.map((shape) => ({
        type: 'play' as const,
        playerId,
        cardId: card.id,
        whotCall: shape,
      }));
    }
    return [{ type: 'play' as const, playerId, cardId: card.id }];
  });

  const pickMove: MoveInput[] =
    (mustPick(state, playerId) || state.pendingPick > 0) &&
    canPickFromDeck(state)
      ? [{ type: 'pick', playerId }]
      : [];

  return [...playMoves, ...pickMove];
}

export function calculatePotKobo(
  entryFeeKobo: number,
  playerCount: number,
): { pot: number; rake: number; winnerPayout: number } {
  const pot = entryFeeKobo * playerCount;
  const rake = Math.floor(pot * 0.1);
  const winnerPayout = pot - rake;
  return { pot, rake, winnerPayout };
}
