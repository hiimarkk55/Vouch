/**
 * VOUCH // PRIVY AUTH HOOK
 * Simplified authentication state management
 */

import { useEffect } from 'react';
import { usePrivy, useLoginWithOAuth } from '@privy-io/expo';
import { initializeFirebase } from '@services/firebase';

export function usePrivyAuth() {
  const { user, isReady, logout, getAccessToken } = usePrivy();

  // Login methods using OAuth (Google, Twitter, etc.)
  const { login: loginWithOAuth, state: oAuthState } = useLoginWithOAuth();

  // Derive authenticated state from user existence
  const isAuthenticated = user !== null;

  // Initialize Firebase when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      initializeFirebase();
    }
  }, [isAuthenticated]);

  return {
    isReady,
    isAuthenticated,
    user,
    logout,
    getAccessToken,
    // OAuth login (Google, Twitter, Discord, etc.)
    loginWithOAuth,
    oAuthState,
  };
}
