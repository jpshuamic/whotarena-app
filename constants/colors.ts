export const colors = {
  deepNavy: '#0D1B2A',
  electricBlue: '#1E90FF',
  vibrantGreen: '#00C853',
  warmWhite: '#F5F5F5',
  gold: '#FFD700',
  coralRed: '#FF4444',
  darkSurface: '#1A2B3C',
  starPurple: '#9B59B6',
} as const;

export const cardShapeColors: Record<string, string> = {
  circle: colors.electricBlue,
  triangle: colors.vibrantGreen,
  cross: colors.coralRed,
  square: colors.gold,
  star: colors.starPurple,
  whot: colors.deepNavy,
};
