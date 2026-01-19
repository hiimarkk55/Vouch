/**
 * VOUCH // MOBILE APP ENTRY POINT
 * React Native + Expo + Privy Mobile SDK
 */

import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrivyProvider } from '@privy-io/expo';
import * as Font from 'expo-font';
import { Config } from './src/constants/config';
import AppNavigator from './src/navigation/AppNavigator';
import './global.css'; // NativeWind styles

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'SpaceMono-Regular': require('./assets/fonts/SpaceMono-Regular.ttf'),
          'SpaceMono-Bold': require('./assets/fonts/SpaceMono-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Font loading failed:', error);
        // Continue without custom fonts
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaProvider>
      <PrivyProvider appId={Config.privy.appId}>
        <AppNavigator />
      </PrivyProvider>
    </SafeAreaProvider>
  );
}
