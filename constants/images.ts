/**
 * Centralized image asset registry.
 * Import all images here — never import directly in components.
 */

/** Asset paths — swap to require() once PNG files are generated */
const asset = (name: string) => `../assets/images/${name}`;

export const brandImages = {
  appIcon: asset('app_icon.png'),
  logoLight: asset('logo_light.png'),
  logoDark: asset('logo_dark.png'),
  mascotHappy: require('../assets/images/mascot_happy.png'), // DONE — base character
  mascotCelebrating: asset('mascot_celebrating.png'),
  mascotSad: asset('mascot_sad.png'),
  mascotThinking: asset('mascot_thinking.png'),
  mascotNeutral: asset('mascot_neutral.png'),
  mascotWelcome: asset('mascot_welcome.png'),
} as const;

export const onboardingImages = {
  hero: asset('onboarding_hero.png'),
  featurePlay: asset('feature_play.png'),
  featureWin: asset('feature_win.png'),
  featureWithdraw: asset('feature_withdraw.png'),
} as const;

export const gameImages = {
  cardBack: asset('card_back.png'),
  tableFelt: asset('table_felt.png'),
} as const;

export const emptyStateImages = {
  lobby: asset('empty_lobby.png'),
  wallet: asset('empty_wallet.png'),
  tournament: asset('empty_tournament.png'),
} as const;

export const resultImages = {
  winCelebration: asset('win_celebration.png'),
  lossScreen: asset('loss_screen.png'),
} as const;

/** Mascot generation prompt template (Section 6) */
export const MASCOT_GENERATION_PROMPT = `Same character, same art style, same colors,
same gold chain, same cap, same jacket.
Same face and proportions exactly.

Generate this specific expression and pose:
[INSERT EXPRESSION DESCRIPTION]

Background: Transparent (no black background).
Format: Square 1024x1024.`;
