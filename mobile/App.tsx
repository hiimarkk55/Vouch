/**
 * VOUCH // MOBILE APP ENTRY POINT
 * React Native + Expo + Privy Mobile SDK
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrivyProvider } from '@privy-io/expo';
import { Config } from './src/constants/config';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  // TEMPORARY: Disabled custom font loading
  // Fonts will be added back after testing core functionality
  const fontsLoaded = true;

  return (
    <SafeAreaProvider>
      <PrivyProvider appId={Config.privy.appId}>
        <AppNavigator />
      </PrivyProvider>
    </SafeAreaProvider>
  );
}
