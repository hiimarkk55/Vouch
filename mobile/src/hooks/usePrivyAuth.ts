/**
 * VOUCH // PRIVY AUTH HOOK
 * Simplified authentication state management
 */

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/expo';
import { initializeFirebase } from '@services/firebase';

export function usePrivyAuth() {
  const {
    ready,
    authenticated,
    user,
    login,
    logout,
  } = usePrivy();

  // Initialize Firebase when user authenticates
  useEffect(() => {
    if (authenticated) {
      initializeFirebase();
    }
  }, [authenticated]);

  return {
    isReady: ready,
    isAuthenticated: authenticated,
    user,
    login,
    logout,
  };
}
