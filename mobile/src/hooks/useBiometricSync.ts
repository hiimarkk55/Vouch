/**
 * VOUCH // BIOMETRIC SYNC HOOK
 * Priority: HealthKit (iOS) > Google Fit (Android) > Manual Entry
 *
 * Critical Logic:
 * 1. Always attempt biometric sync FIRST
 * 2. Only fallback to manual if sync fails or unavailable
 * 3. Verify workout authenticity via biometric correlation
 */

import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
  HealthObserver,
} from 'react-native-health';

export interface WorkoutData {
  type: 'running' | 'cycling' | 'strength' | 'other';
  duration: number; // minutes
  calories: number;
  distance?: number; // meters
  heartRate?: number; // avg BPM
  startTime: Date;
  endTime: Date;
  verified: boolean; // true if from biometric source
  source: 'healthkit' | 'googlefit' | 'manual';
}

export interface BiometricSyncResult {
  success: boolean;
  data?: WorkoutData;
  error?: string;
  source: 'healthkit' | 'googlefit' | 'manual';
}

const HEALTHKIT_PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.DistanceCycling,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.Workout,
    ],
  },
};

export function useBiometricSync() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize HealthKit on iOS
  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS, (error: string | undefined) => {
        if (error) {
          console.error('[BIOMETRIC] HealthKit init failed:', error);
          setIsInitialized(false);
          setHasPermission(false);
        } else {
          setIsInitialized(true);
          setHasPermission(true);
        }
      });
    } else if (Platform.OS === 'android') {
      // TODO: Initialize Google Fit
      setIsInitialized(false);
      setHasPermission(false);
    }
  }, []);

  /**
   * Fetch most recent workout from HealthKit
   * Target: Last 24 hours
   */
  const fetchRecentWorkout = async (): Promise<BiometricSyncResult> => {
    setIsLoading(true);

    try {
      // iOS: HealthKit
      if (Platform.OS === 'ios' && isInitialized) {
        return await fetchFromHealthKit();
      }

      // Android: Google Fit
      if (Platform.OS === 'android') {
        return await fetchFromGoogleFit();
      }

      // Fallback: Manual entry required
      return {
        success: false,
        error: 'Biometric source unavailable',
        source: 'manual',
      };
    } catch (error) {
      console.error('[BIOMETRIC] Sync failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'manual',
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch from Apple HealthKit
   */
  const fetchFromHealthKit = async (): Promise<BiometricSyncResult> => {
    return new Promise((resolve) => {
      const options = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24h ago
        endDate: new Date().toISOString(),
        type: HealthObserver.Workout, // Query for workout samples
      };

      AppleHealthKit.getSamples(
        options,
        (error: string | undefined, results: any[]) => {
          if (error) {
            resolve({
              success: false,
              error: 'HealthKit fetch failed',
              source: 'healthkit',
            });
            return;
          }

          if (!results || results.length === 0) {
            resolve({
              success: false,
              error: 'No recent workouts found',
              source: 'healthkit',
            });
            return;
          }

          const workout = results[0] as any;
          resolve({
            success: true,
            data: {
              type: mapWorkoutType(workout.activityName),
              duration: workout.duration / 60, // seconds to minutes
              calories: workout.totalEnergyBurned || 0,
              distance: workout.totalDistance,
              heartRate: workout.averageHeartRate,
              startTime: new Date(workout.start),
              endTime: new Date(workout.end),
              verified: true,
              source: 'healthkit',
            },
            source: 'healthkit',
          });
        }
      );
    });
  };

  /**
   * Fetch from Google Fit (Android)
   * TODO: Implement Google Fit API integration
   */
  const fetchFromGoogleFit = async (): Promise<BiometricSyncResult> => {
    // Placeholder for Google Fit implementation
    return {
      success: false,
      error: 'Google Fit not yet implemented',
      source: 'googlefit',
    };
  };

  /**
   * Request permissions for biometric data
   */
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      return new Promise((resolve) => {
        AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS, (error: string | undefined) => {
          if (error) {
            Alert.alert(
              'PERMISSION DENIED',
              'HealthKit access required for workout verification.'
            );
            resolve(false);
          } else {
            setHasPermission(true);
            setIsInitialized(true);
            resolve(true);
          }
        });
      });
    }

    // TODO: Android Google Fit permissions
    return false;
  };

  return {
    isInitialized,
    hasPermission,
    isLoading,
    fetchRecentWorkout,
    requestPermissions,
  };
}

/**
 * Map HealthKit workout types to VOUCH categories
 */
function mapWorkoutType(activityName: string): WorkoutData['type'] {
  const activity = activityName?.toLowerCase() || '';

  if (activity.includes('run')) return 'running';
  if (activity.includes('cycle') || activity.includes('bike')) return 'cycling';
  if (activity.includes('strength') || activity.includes('weight')) return 'strength';

  return 'other';
}
