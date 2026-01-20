/**
 * VOUCH // LOGIN SCREEN
 * Terminal-style authentication via Privy Mobile SDK
 * TEMPORARY: Using StyleSheet instead of NativeWind due to Babel config issues
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { usePrivyAuth } from '@hooks/usePrivyAuth';
import { Colors, TerminalStyles } from '@constants/theme';

export default function LoginScreen() {
  const { loginWithOAuth, isReady, oAuthState } = usePrivyAuth();
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
    if (!isReady) return;
    await loginWithOAuth({ provider: 'google' });
  };

  const isLoading = oAuthState.status === 'loading';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Terminal Header */}
      <View style={styles.header}>
        <Text style={styles.title}>VOUCH</Text>
        <Text style={styles.subtitle}>
          // SOCIAL ACCOUNTABILITY ENGINE
        </Text>
      </View>

      {/* Boot Sequence */}
      <View style={styles.bootSequence}>
        <Text style={styles.bootText}>
          {bootText}
          {cursorVisible && '_'}
        </Text>
      </View>

      {/* Authentication Section */}
      <View style={styles.authSection}>
        <Text style={styles.promptText}>
          {TerminalStyles.prompt}AUTHENTICATE TO CONTINUE
        </Text>

        {/* Login Button - Terminal Style */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={!isReady || isLoading}
          style={[
            styles.loginButton,
            (!isReady || isLoading) && styles.loginButtonDisabled
          ]}
          activeOpacity={0.7}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? '> CONNECTING...' : isReady ? '> CONNECT WALLET' : '> INITIALIZING...'}
          </Text>
        </TouchableOpacity>

        {/* Info Text */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            // SECURE AUTHENTICATION VIA PRIVY
          </Text>
          <Text style={styles.infoText}>
            // NO PASSWORDS. NO BULLSHIT.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          FRICTION IS THE ENEMY. ACCOUNTABILITY IS THE PRODUCT.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // #000000
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: Colors.primary, // #00FFFF
    fontSize: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'monospace',
    color: Colors.primary,
    fontSize: 14,
    opacity: 0.7,
  },
  bootSequence: {
    marginBottom: 32,
    minHeight: 120,
  },
  bootText: {
    fontFamily: 'monospace',
    color: Colors.success, // #00FF41
    fontSize: 12,
    lineHeight: 20,
  },
  authSection: {
    marginTop: 16,
  },
  promptText: {
    fontFamily: 'monospace',
    color: Colors.primary,
    fontSize: 14,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: Colors.surface, // #1a1a1a
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 0, // Terminal sharp edges
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    fontSize: 16,
  },
  infoSection: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.textSecondary,
    paddingTop: 16,
  },
  infoText: {
    fontFamily: 'monospace',
    color: Colors.textSecondary, // #808080
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  footerText: {
    fontFamily: 'monospace',
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});
