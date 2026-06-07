import type { Shape } from '../types/game';

/** Per master prompt card lists (14+10+14+12+8+5 = 63) */
export const TOTAL_CARDS = 63;
export const STARTING_HAND_SIZE = 5;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;

export const SHAPES: Shape[] = [
  'circle',
  'triangle',
  'cross',
  'square',
  'star',
  'whot',
];

/** Standard Nigerian Whot card distribution */
export const CARD_DISTRIBUTION: Record<Exclude<Shape, 'whot'>, number[]> = {
  circle: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  triangle: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  cross: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  square: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  star: [1, 2, 3, 4, 5, 6, 7, 8],
};

export const WHOT_NUMBERS = [20, 20, 20, 20, 20];

export const SPECIAL_CARD_EFFECTS = {
  1: 'hold_on',
  2: 'pick_two',
  5: 'pick_three',
  8: 'suspension',
  14: 'general_market',
  20: 'whot',
} as const;

export type SpecialEffect =
  (typeof SPECIAL_CARD_EFFECTS)[keyof typeof SPECIAL_CARD_EFFECTS];

export const LAUNCH_VARIANTS = ['1v1', '3player', '5player'] as const;

export const POST_LAUNCH_VARIANTS = [
  'speed_whot',
  '2v2_team',
  'tournament_bracket',
] as const;

export const DISCONNECTION_RULES = {
  reconnectWindowMs: 30_000,
  forfeitEntryFeeOnDisconnect: true,
  botTakesOverHand: true,
} as const;

const BOT_NAME_POOL = [
  'Naira_Slayer', 'WhotDon_Lag', 'CardKing_PHC',
  'SharpSharp_Abj', 'DeckGod_NG', 'WinnerTake_All',
  'OmoNaija_Cards', 'AjeboCards', 'OgaAtTheTop',
  'JollofCards', 'SuruCard_Lag', 'AgbaPlayer_NG',
  'WhotBoss_PHC', 'NaijaCardLord', 'SharpGuy_Abj',
  'CardWizard_Lag', 'DeckHunter_NG', 'WhotSlayer99',
  'NairaCards_PHC', 'QuickDraw_Lag', 'AcePlayer_NG',
  'WhotKing_Delta', 'CardNinja_Abj', 'DeckMaster_PHC',
  'OmoLagos_Cards', 'SharpCard_NG', 'WhotArena_Pro',
  'NairaHunter_Lag', 'CardGuru_Abj', 'DeckLord_Delta',
  'WhotChamp_NG', 'AjeboPlayer', 'OgaCard_Lag',
  'NaijaSharp_PHC', 'CardBoss_Abj', 'WhotGod_NG',
  'DeckSlayer_Lag', 'SharpWin_Delta', 'CardAce_PHC',
  'OmoNaija_Win', 'WhotMaster_Abj', 'NairaGuru_NG',
  'CardKiller_Lag', 'DeckWizard_PHC', 'SharpDeck_Abj',
  'WhotNinja_NG', 'CardChamp_Delta', 'DeckAce_Lag',
  'NairaWin_PHC', 'OgaWhot_NG'
];

export function getRandomBotName(): string {
  return BOT_NAME_POOL[
    Math.floor(Math.random() * BOT_NAME_POOL.length)
  ];
}
