/**
 * VOUCH // APP NAVIGATION
 * Stack navigation for mobile app
 * TEMPORARY: Privy authentication removed for testing
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import ProofOfWorkCamera from '../screens/ProofOfWorkCamera';
import { Colors } from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  // TEMPORARY: Removed Privy auth - just show login screen for now
  // Will add back authentication flow later

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontFamily: 'monospace',
            fontSize: 16,
          },
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Camera"
          component={ProofOfWorkCamera}
          options={{
            title: 'PROOF-OF-WORK',
            headerBackTitle: 'BACK',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
