/**
 * VOUCH // PROOF-OF-WORK CAMERA
 * Workout verification via photo evidence
 * Target: <10 second interaction time
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { Colors, TerminalStyles } from '../constants/theme';

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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {TerminalStyles.loading}INITIALIZING CAMERA...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <Text style={styles.permissionTitle}>
          CAMERA ACCESS REQUIRED
        </Text>
        <Text style={styles.permissionSubtitle}>
          // VOUCH NEEDS CAMERA TO VERIFY WORKOUTS
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>
            {"> GRANT PERMISSION"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          {/* Overlay HUD */}
          <View style={styles.overlay}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <Text style={styles.topBarTitle}>
                PROOF-OF-WORK
              </Text>
              <Text style={styles.topBarSubtitle}>
                {TerminalStyles.linePrefix}CAPTURE WORKOUT EVIDENCE
              </Text>
            </View>

            {/* Center Crosshair Guide */}
            <View style={styles.crosshairContainer}>
              <View style={styles.crosshair}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <View style={styles.controlsRow}>
                {/* Flip Camera */}
                <TouchableOpacity
                  onPress={toggleCamera}
                  style={styles.flipButton}
                >
                  <Text style={styles.flipButtonText}>
                    FLIP
                  </Text>
                </TouchableOpacity>

                {/* Capture Button */}
                <TouchableOpacity
                  onPress={handleCapture}
                  disabled={isCapturing}
                  style={styles.captureButton}
                  activeOpacity={0.7}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>

                {/* Spacer for symmetry */}
                <View style={styles.spacer} />
              </View>

              <Text style={styles.bottomHint}>
                {TerminalStyles.linePrefix}SYNC WITH HEALTHKIT AFTER CAPTURE
              </Text>
            </View>
          </View>
        </CameraView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Loading state
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontFamily: 'monospace',
    color: Colors.primary,
  },

  // Permission state
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  permissionTitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: Colors.primary,
    fontSize: 20,
    marginBottom: 16,
  },
  permissionSubtitle: {
    fontFamily: 'monospace',
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  permissionButtonText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    fontSize: 16,
  },

  // Camera view
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },

  // Top bar
  topBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  topBarTitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: Colors.primary,
    fontSize: 18,
  },
  topBarSubtitle: {
    fontFamily: 'monospace',
    color: Colors.success,
    fontSize: 12,
    marginTop: 4,
  },

  // Crosshair
  crosshairContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshair: {
    width: 192,
    height: 192,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 255, 0.5)',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primary,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primary,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primary,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primary,
  },

  // Bottom controls
  bottomControls: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flipButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flipButtonText: {
    fontFamily: 'monospace',
    color: Colors.primary,
    fontSize: 12,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 255, 255, 0.3)',
  },
  spacer: {
    width: 64,
  },
  bottomHint: {
    fontFamily: 'monospace',
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
