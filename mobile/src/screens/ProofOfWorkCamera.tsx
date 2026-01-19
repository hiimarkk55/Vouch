/**
 * VOUCH // PROOF-OF-WORK CAMERA
 * Workout verification via photo evidence
 * Target: <10 second interaction time
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { Colors, TerminalStyles } from '@constants/theme';
import TerminalButton from '@components/TerminalButton';

export default function ProofOfWorkCamera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Request permissions on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        // TODO: Upload to Firebase Storage
        // TODO: Sync with biometric data
        // TODO: Create Vouch entry in Firestore
        Alert.alert(
          'PROOF CAPTURED',
          'Syncing with biometric data...',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('CAPTURE FAILED', 'Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleCamera = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-terminal-bg justify-center items-center px-6">
        <Text className="font-mono text-neon-cyan">
          {TerminalStyles.loading}INITIALIZING CAMERA...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-terminal-bg justify-center px-6">
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <Text className="font-mono text-neon-cyan text-xl mb-4">
          CAMERA ACCESS REQUIRED
        </Text>
        <Text className="font-mono text-terminal-gray text-sm mb-8">
          // VOUCH NEEDS CAMERA TO VERIFY WORKOUTS
        </Text>
        <TerminalButton
          onPress={requestPermission}
          label="> GRANT PERMISSION"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-terminal-bg">
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Camera View */}
      <View className="flex-1">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
        >
          {/* Overlay HUD */}
          <View className="flex-1 justify-between p-6">
            {/* Top Bar */}
            <View className="bg-terminal-bg/80 p-4 border border-neon-cyan/30">
              <Text className="font-mono-bold text-neon-cyan text-lg">
                PROOF-OF-WORK
              </Text>
              <Text className="font-mono text-terminal-green text-xs mt-1">
                {TerminalStyles.linePrefix}CAPTURE WORKOUT EVIDENCE
              </Text>
            </View>

            {/* Center Crosshair Guide */}
            <View className="items-center justify-center">
              <View className="w-48 h-48 border-2 border-neon-cyan/50">
                <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-neon-cyan" />
                <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-neon-cyan" />
                <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-neon-cyan" />
                <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-neon-cyan" />
              </View>
            </View>

            {/* Bottom Controls */}
            <View className="bg-terminal-bg/80 p-4 border border-neon-cyan/30">
              <View className="flex-row justify-between items-center">
                {/* Flip Camera */}
                <TouchableOpacity
                  onPress={toggleCamera}
                  className="bg-terminal-gray border border-terminal-gray px-4 py-3"
                >
                  <Text className="font-mono text-neon-cyan text-xs">
                    FLIP
                  </Text>
                </TouchableOpacity>

                {/* Capture Button */}
                <TouchableOpacity
                  onPress={handleCapture}
                  disabled={isCapturing}
                  className="w-20 h-20 rounded-full border-4 border-neon-cyan justify-center items-center bg-terminal-gray active:bg-neon-cyan/20"
                >
                  <View className="w-16 h-16 rounded-full bg-neon-cyan/30" />
                </TouchableOpacity>

                {/* Spacer for symmetry */}
                <View className="w-16" />
              </View>

              <Text className="font-mono text-terminal-gray text-xs text-center mt-4">
                {TerminalStyles.linePrefix}SYNC WITH HEALTHKIT AFTER CAPTURE
              </Text>
            </View>
          </View>
        </CameraView>
      </View>
    </View>
  );
}
