import { STAKE_LEVELS } from '../constants/stakes';
import type {
  BotConfig,
  BotDecisionContext,
  Card,
  GameState,
  MoveInput,
  Shape,
  StakeLevel,
} from '../types/game';
import { getPlayableShapes, isWhot } from './cards';
import { getLegalMoves } from './state';
import { getPickCountForCard } from './effects';
import { getEffectiveShape, getTopCard } from './moves';

const DEFAULT_CONFIG: BotConfig = {
  targetWinRate: 0.55,
  minThinkMs: 1200,
  maxThinkMs: 3800,
  aggression: 0.5,
  deliberateSuboptimalRate: 0.05,
};

export function getBotConfigForStake(stakeLevel: StakeLevel): BotConfig {
  const stake = STAKE_LEVELS[stakeLevel];
  return {
    ...DEFAULT_CONFIG,
    targetWinRate: stake.botEnabled ? DEFAULT_CONFIG.targetWinRate : 0,
  };
}

export function getThinkingDelayMs(config: BotConfig): number {
  const range = config.maxThinkMs - config.minThinkMs;
  return config.minThinkMs + Math.floor(Math.random() * (range + 1));
}

interface ScoredMove {
  move: MoveInput;
  score: number;
}

function getOpponentMode(
  opponentCounts: number[],
  aggression: number,
): 'attack' | 'conservative' | 'neutral' {
  const minCards = Math.min(...opponentCounts);
  const maxCards = Math.max(...opponentCounts);

  if (minCards <= 3 || aggression > 0.7) return 'attack';
  if (maxCards >= 10 || aggression < 0.3) return 'conservative';
  return 'neutral';
}

function isSpecialAttackCard(card: Card): boolean {
  return [1, 2, 5, 8, 14].includes(card.number);
}

function shapeRarityInHand(hand: Card[], shape: Shape): number {
  return hand.filter((c) => c.shape === shape).length;
}

function scorePlayMove(
  state: GameState,
  botId: string,
  move: Extract<MoveInput, { type: 'play' }>,
  opponentCounts: Record<string, number>,
  config: BotConfig,
): number {
  const hand = state.hands[botId] ?? [];
  const card = hand.find((c) => c.id === move.cardId);
  if (!card) return -Infinity;

  let score = 0;
  const opponents = Object.entries(opponentCounts)
    .filter(([id]) => id !== botId)
    .map(([, count]) => count);

  const mode = getOpponentMode(opponents, config.aggression);

  if (isSpecialAttackCard(card) && mode === 'attack') {
    score += 100;
    if (card.number === 2 || card.number === 5) score += 40;
    if (card.number === 14) score += 30;
  }

  const remainingHand = hand.filter((c) => c.id !== card.id);
  score += (hand.length - remainingHand.length) * 20;

  const top = getTopCard(state);
  if (top && card.shape === top.shape && card.number === top.number) {
    score += 25;
  }

  if (isWhot(card) && move.whotCall) {
    const rarest = getPlayableShapes().reduce((best, shape) => {
      const counts = Object.values(state.hands)
        .filter((_, idx) => state.players[idx]?.id !== botId)
        .map((h) => shapeRarityInHand(h, shape));
      const minRarity = Math.min(...counts, 99);
      return minRarity < best.rarity ? { shape, rarity: minRarity } : best;
    }, { shape: move.whotCall, rarity: 99 });
    score += (5 - rarest.rarity) * 15;
  }

  if (mode === 'conservative') {
    score += remainingHand.length * 5;
    if (isSpecialAttackCard(card)) score -= 20;
  }

  const effectiveShape = getEffectiveShape(state);
  if (effectiveShape) {
    const shapeMatches = remainingHand.filter(
      (c) => c.shape === effectiveShape || c.number === card.number,
    ).length;
    score += shapeMatches * 8;
  }

  if (getPickCountForCard(card) > 0 && mode === 'attack') {
    score += 35;
  }

  return score;
}

function scoreMove(
  ctx: BotDecisionContext,
  move: MoveInput,
): number {
  if (move.type === 'pick') {
    return ctx.state.pendingPick > 0 ? -50 : -10;
  }

  return scorePlayMove(
    ctx.state,
    ctx.botId,
    move,
    ctx.opponentCardCounts,
    ctx.config,
  );
}

function pickSecondBest(scored: ScoredMove[]): MoveInput | null {
  if (scored.length < 2) return scored[0]?.move ?? null;
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  return sorted[1]!.move;
}

/** Layer 1–5 bot decision: valid moves only, human disguise, priority tree, opponent tracking, calibration */
export function getBotMove(ctx: BotDecisionContext): MoveInput | null {
  const legal = getLegalMoves(ctx.state, ctx.botId);
  if (legal.length === 0) return null;

  if (Math.random() < ctx.config.deliberateSuboptimalRate) {
    const random = legal[Math.floor(Math.random() * legal.length)]!;
    return random;
  }

  const scored: ScoredMove[] = legal.map((move) => ({
    move,
    score: scoreMove(ctx, move),
  }));

  scored.sort((a, b) => b.score - a.score);

  if (ctx.calibrateDown) {
    return pickSecondBest(scored);
  }

  return scored[0]!.move;
}

export function shouldCalibrateWinRate(
  actualWinRate: number,
  targetWinRate: number,
  botIsWinning: boolean,
): boolean {
  return botIsWinning && actualWinRate > targetWinRate;
}
