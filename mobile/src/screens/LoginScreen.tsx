/**
 * VOUCH // LOGIN SCREEN
 * Terminal-style authentication via Privy Mobile SDK
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { usePrivy } from '@privy-io/expo';
import { Colors, TerminalStyles } from '@constants/theme';

export default function LoginScreen() {
  const { login, ready, authenticated } = usePrivy();
  const [cursorVisible, setCursorVisible] = useState(true);
  const [bootText, setBootText] = useState('');
  const bootSequence = [
    '> INITIALIZING VOUCH PROTOCOL...',
    '> LOADING ACCOUNTABILITY ENGINE...',
    '> BIOMETRIC SYNC: READY',
    '> AWAITING AUTHENTICATION...',
  ];

  // Terminal cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Boot sequence animation
  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootSequence.length) {
        setBootText((prev) => prev + bootSequence[currentLine] + '\n');
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (!ready) return;
    await login();
  };

  return (
    <View className="flex-1 bg-terminal-bg px-6 justify-center">
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Terminal Header */}
      <View className="mb-12">
        <Text className="font-mono-bold text-neon-cyan text-4xl mb-2">
          VOUCH
        </Text>
        <Text className="font-mono text-neon-cyan text-sm opacity-70">
          // SOCIAL ACCOUNTABILITY ENGINE
        </Text>
      </View>

      {/* Boot Sequence */}
      <View className="mb-8 min-h-[120px]">
        <Text className="font-mono text-terminal-green text-xs leading-5">
          {bootText}
          {cursorVisible && '_'}
        </Text>
      </View>

      {/* Authentication Section */}
      <View className="space-y-4">
        <Text className="font-mono text-neon-cyan text-sm mb-4">
          {TerminalStyles.prompt}AUTHENTICATE TO CONTINUE
        </Text>

        {/* Login Button - Terminal Style */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={!ready}
          className="bg-terminal-gray border border-neon-cyan px-6 py-4 active:bg-neon-cyan/10"
        >
          <Text className="font-mono-bold text-neon-cyan text-center text-base">
            {ready ? '> CONNECT WALLET' : '> INITIALIZING...'}
          </Text>
        </TouchableOpacity>

        {/* Info Text */}
        <View className="mt-8 border-t border-terminal-gray pt-4">
          <Text className="font-mono text-terminal-gray text-xs">
            // SECURE AUTHENTICATION VIA PRIVY
          </Text>
          <Text className="font-mono text-terminal-gray text-xs mt-1">
            // NO PASSWORDS. NO BULLSHIT.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="absolute bottom-8 left-6 right-6">
        <Text className="font-mono text-terminal-gray text-xs text-center">
          FRICTION IS THE ENEMY. ACCOUNTABILITY IS THE PRODUCT.
        </Text>
      </View>
    </View>
  );
}
