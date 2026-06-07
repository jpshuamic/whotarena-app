import type { Shape, StakeLevel } from './types.ts';

export const STARTING_HAND_SIZE = 5;

export const CARD_DISTRIBUTION: Record<Exclude<Shape, 'whot'>, number[]> = {
  circle: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  triangle: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  cross: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  square: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  star: [1, 2, 3, 4, 5, 6, 7, 8],
};

export const WHOT_NUMBERS = [20, 20, 20, 20, 20];

export const PLAYABLE_SHAPES: Exclude<Shape, 'whot'>[] = [
  'circle',
  'triangle',
  'cross',
  'square',
  'star',
];

export const BOT_TARGET_WIN_RATES: Record<StakeLevel, number> = {
  practice: 0.45,
  bronze: 0.52,
  silver: 0.55,
  gold: 0.58,
  diamond: 0.6,
  tournament: 0,
};
