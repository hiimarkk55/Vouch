/**
 * VOUCH // MOBILE APP ENTRY POINT
 * Ultra-minimal version - NO navigation, NO native modules
 */

import React from 'react';
import { StatusBar } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LoginScreen />
    </>
  );
}
