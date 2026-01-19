/**
 * VOUCH // GLOBAL CONFIG
 * High-stakes accountability settings
 */

export const Config = {
  // Performance targets
  maxInteractionTime: 10000, // 10 seconds - friction is the enemy
  maxFileLines: 250,          // Per CLAUDE.md: no file exceeds 250 lines

  // Biometric sync priority
  biometricSources: {
    ios: 'HealthKit',
    android: 'GoogleFit',
    fallback: 'Manual',
  },

  // Roast AI Persona
  roastTone: 'high-stakes-sovereign', // Brutally honest, no soft language

  // Firebase config (shared with web)
  firebase: {
    // These will be populated from env vars
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  },

  // Privy config (Mobile SDK)
  privy: {
    appId: process.env.EXPO_PUBLIC_PRIVY_APP_ID || '',
  },
} as const;

export const AppRoutes = {
  LOGIN: '/login',
  SQUAD: '/squad',
  ROAST: '/roast',
  VOUCH: '/vouch',
  CAMERA: '/camera',
} as const;
