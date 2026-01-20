/**
 * VOUCH // MOBILE APP ENTRY POINT
 * MINIMAL TEST VERSION - No Privy, No Navigation, Just Basic UI
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>VOUCH</Text>
        <Text style={styles.subtitle}>// MOBILE APP TEST</Text>
        <Text style={styles.status}>✓ React Native: WORKING</Text>
        <Text style={styles.status}>✓ Expo: WORKING</Text>
        <Text style={styles.status}>✓ StyleSheet: WORKING</Text>
        <Text style={styles.footer}>If you see this, the app loaded successfully!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00FFFF',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 14,
    color: '#00FFFF',
    opacity: 0.7,
    marginBottom: 40,
    fontFamily: 'monospace',
  },
  status: {
    fontSize: 16,
    color: '#00FF41',
    marginVertical: 8,
    fontFamily: 'monospace',
  },
  footer: {
    fontSize: 12,
    color: '#808080',
    marginTop: 40,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});
