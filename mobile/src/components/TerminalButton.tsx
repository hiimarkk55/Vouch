/**
 * VOUCH // TERMINAL BUTTON COMPONENT
 * Reusable cyber-terminal style button
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Colors } from '@constants/theme';

interface TerminalButtonProps {
  onPress: () => void;
  label: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function TerminalButton({
  onPress,
  label,
  disabled = false,
  loading = false,
  variant = 'primary',
}: TerminalButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'border-terminal-red';
      case 'secondary':
        return 'border-terminal-gray';
      default:
        return 'border-neon-cyan';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'danger':
        return 'text-terminal-red';
      case 'secondary':
        return 'text-terminal-gray';
      default:
        return 'text-neon-cyan';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        bg-terminal-gray
        border
        ${getVariantStyles()}
        px-6
        py-4
        active:bg-neon-cyan/10
        ${(disabled || loading) && 'opacity-50'}
      `}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <Text className={`font-mono-bold ${getTextColor()} text-center text-base`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
