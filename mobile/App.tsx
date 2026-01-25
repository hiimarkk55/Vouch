/**
 * VOUCH // MOBILE APP ENTRY POINT
 * Ultra-minimal version for debugging
 */

import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>VOUCH</Text>
      <Text style={styles.subtitle}>// MOBILE APP LOADED</Text>
      <Text style={styles.status}>✓ React Native: WORKING</Text>
      <Text style={styles.status}>✓ Expo: WORKING</Text>
      <Text style={styles.status}>✓ NO SPLASH SCREEN HANG</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00FFFF',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#00FFFF',
    opacity: 0.7,
    marginBottom: 40,
  },
  status: {
    fontSize: 16,
    color: '#00FF41',
    marginVertical: 8,
  },
});
