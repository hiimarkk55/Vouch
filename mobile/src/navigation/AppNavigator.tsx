/**
 * VOUCH // APP NAVIGATION
 * Stack navigation for mobile app
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { usePrivyAuth } from '@hooks/usePrivyAuth';
import LoginScreen from '@screens/LoginScreen';
import ProofOfWorkCamera from '@screens/ProofOfWorkCamera';
import { Colors } from '@constants/theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isReady } = usePrivyAuth();

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontFamily: 'SpaceMono-Bold',
            fontSize: 16,
          },
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Camera"
              component={ProofOfWorkCamera}
              options={{
                title: 'PROOF-OF-WORK',
                headerBackTitle: 'BACK',
              }}
            />
            {/* TODO: Add other authenticated screens */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
