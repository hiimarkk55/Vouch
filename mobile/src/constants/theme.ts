/**
 * VOUCH // TERMINAL THEME CONFIG
 * Cyber-terminal aesthetic: Dark mode only, neon cyan accents
 */

export const Colors = {
  primary: '#00FFFF',      // Neon Cyan
  secondary: '#000000',    // Pure Black
  background: '#000000',
  surface: '#1a1a1a',
  success: '#00FF41',      // Terminal Green
  error: '#FF0040',        // Terminal Red
  warning: '#FFD700',
  text: '#00FFFF',
  textSecondary: '#808080',
  border: '#333333',
} as const;

export const Fonts = {
  mono: 'SpaceMono-Regular',
  monoBold: 'SpaceMono-Bold',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

/**
 * Terminal Command Aesthetic
 * All text should mimic command-line interface
 */
export const TerminalStyles = {
  prompt: '> ',
  cursor: '_',
  linePrefix: '// ',
  success: '[✓] ',
  error: '[✗] ',
  loading: '[...] ',
} as const;
