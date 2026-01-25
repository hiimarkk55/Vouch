/**
 * VOUCH // MOBILE APP ENTRY POINT
 * React Native + Expo (Privy temporarily removed for testing)
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
