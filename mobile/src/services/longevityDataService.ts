/**
 * VOUCH // LONGEVITY DATA SERVICE
 *
 * Fetches in-depth biometric data from HealthKit/Google Fit:
 * - Continuous heart rate
 * - Heart Rate Variability (HRV)
 * - Resting Heart Rate (RHR)
 * - Sleep stages
 * - Respiratory rate
 * - Blood oxygen (SpO2)
 *
 * Priority: HealthKit (iOS) > Google Fit (Android) > Manual Entry
 */

import { Platform } from 'react-native';
import AppleHealthKit, { HealthKitPermissions } from 'react-native-health';

// ============================================================================
// HEALTHKIT PERMISSIONS
// ============================================================================

const LONGEVITY_PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      // Cardiovascular
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
      AppleHealthKit.Constants.Permissions.WalkingHeartRateAverage,

      // Sleep
      AppleHealthKit.Constants.Permissions.SleepAnalysis,

      // Respiratory
      AppleHealthKit.Constants.Permissions.RespiratoryRate,
      AppleHealthKit.Constants.Permissions.OxygenSaturation,

      // Activity
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.Workout,

      // Distance
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.DistanceCycling,
    ],
    write: [],
  },
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface HeartRateData {
  timestamp: Date;
  value: number; // BPM
  source: string;
}

export interface HRVData {
  timestamp: Date;
  sdnn: number; // Standard deviation (ms)
  source: string;
}

export interface RestingHeartRateData {
  date: string;
  value: number;
}

export interface SleepData {
  startDate: Date;
  endDate: Date;
  stage: 'AWAKE' | 'ASLEEP' | 'INBED' | 'REM' | 'DEEP' | 'LIGHT';
  source: string;
}

export interface SpO2Data {
  timestamp: Date;
  value: number; // Percentage
  source: string;
}

export interface RespiratoryRateData {
  timestamp: Date;
  value: number; // Breaths per minute
  source: string;
}

export interface LongevityDataSnapshot {
  heartRate: HeartRateData[];
  hrv: HRVData[];
  restingHeartRate: RestingHeartRateData | null;
  sleep: SleepData[];
  spo2: SpO2Data[];
  respiratoryRate: RespiratoryRateData[];
  fetchedAt: Date;
}

// ============================================================================
// LONGEVITY DATA SERVICE
// ============================================================================

class LongevityDataService {
  private initialized = false;

  /**
   * Initialize HealthKit with longevity permissions
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.warn('[LONGEVITY] Android not yet supported');
      return false;
    }

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(
        LONGEVITY_PERMISSIONS,
        (error: string | undefined) => {
          if (error) {
            console.error('[LONGEVITY] HealthKit init failed:', error);
            this.initialized = false;
            resolve(false);
          } else {
            console.log('[LONGEVITY] HealthKit initialized');
            this.initialized = true;
            resolve(true);
          }
        }
      );
    });
  }

  /**
   * Fetch all longevity data for a given time range
   * Default: Last 24 hours
   */
  async fetchData(
    startDate?: Date,
    endDate?: Date
  ): Promise<LongevityDataSnapshot> {
    if (!this.initialized) {
      await this.initialize();
    }

    const start = startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    console.log(
      `[LONGEVITY] Fetching data from ${start.toISOString()} to ${end.toISOString()}`
    );

    // Fetch all metrics in parallel
    const [
      heartRate,
      hrv,
      restingHeartRate,
      sleep,
      spo2,
      respiratoryRate,
    ] = await Promise.all([
      this.fetchHeartRate(start, end),
      this.fetchHRV(start, end),
      this.fetchRestingHeartRate(end), // Today's RHR
      this.fetchSleep(start, end),
      this.fetchSpO2(start, end),
      this.fetchRespiratoryRate(start, end),
    ]);

    return {
      heartRate,
      hrv,
      restingHeartRate,
      sleep,
      spo2,
      respiratoryRate,
      fetchedAt: new Date(),
    };
  }

  /**
   * Fetch continuous heart rate samples
   * Returns ~12-720 samples depending on activity level
   */
  private async fetchHeartRate(
    startDate: Date,
    endDate: Date
  ): Promise<HeartRateData[]> {
    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 1000, // HealthKit returns max samples
      };

      AppleHealthKit.getHeartRateSamples(
        options,
        (error: Object, results: any[]) => {
          if (error) {
            console.error('[LONGEVITY] Heart rate fetch failed:', error);
            resolve([]);
            return;
          }

          const samples: HeartRateData[] = results.map((sample) => ({
            timestamp: new Date(sample.startDate),
            value: Math.round(sample.value),
            source: sample.sourceName || 'unknown',
          }));

          console.log(
            `[LONGEVITY] Fetched ${samples.length} heart rate samples`
          );
          resolve(samples);
        }
      );
    });
  }

  /**
   * Fetch Heart Rate Variability (HRV)
   * Typically measured during sleep, 1-3 readings per night
   */
  private async fetchHRV(
    startDate: Date,
    endDate: Date
  ): Promise<HRVData[]> {
    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 100,
      };

      AppleHealthKit.getHeartRateVariabilitySamples(
        options,
        (error: Object, results: any[]) => {
          if (error) {
            console.error('[LONGEVITY] HRV fetch failed:', error);
            resolve([]);
            return;
          }

          const samples: HRVData[] = results.map((sample) => ({
            timestamp: new Date(sample.startDate),
            sdnn: sample.value, // Already in milliseconds
            source: sample.sourceName || 'unknown',
          }));

          console.log(`[LONGEVITY] Fetched ${samples.length} HRV samples`);
          resolve(samples);
        }
      );
    });
  }

  /**
   * Fetch today's Resting Heart Rate
   * Apple Watch calculates this once per day during sleep
   */
  private async fetchRestingHeartRate(
    date: Date
  ): Promise<RestingHeartRateData | null> {
    return new Promise((resolve) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const options = {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
        ascending: false,
        limit: 1,
      };

      AppleHealthKit.getRestingHeartRateSamples(
        options,
        (error: Object, results: any[]) => {
          if (error || !results || results.length === 0) {
            console.warn('[LONGEVITY] No resting heart rate found');
            resolve(null);
            return;
          }

          const rhr: RestingHeartRateData = {
            date: date.toISOString().split('T')[0],
            value: Math.round(results[0].value),
          };

          console.log(
            `[LONGEVITY] Resting heart rate: ${rhr.value} BPM`
          );
          resolve(rhr);
        }
      );
    });
  }

  /**
   * Fetch sleep stages
   * Returns segments of sleep (Awake, REM, Deep, Light)
   */
  private async fetchSleep(
    startDate: Date,
    endDate: Date
  ): Promise<SleepData[]> {
    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      AppleHealthKit.getSleepSamples(
        options,
        (error: Object, results: any[]) => {
          if (error) {
            console.error('[LONGEVITY] Sleep fetch failed:', error);
            resolve([]);
            return;
          }

          const samples: SleepData[] = results.map((sample) => ({
            startDate: new Date(sample.startDate),
            endDate: new Date(sample.endDate),
            stage: this.mapSleepStage(sample.value),
            source: sample.sourceName || 'unknown',
          }));

          console.log(`[LONGEVITY] Fetched ${samples.length} sleep segments`);
          resolve(samples);
        }
      );
    });
  }

  /**
   * Fetch blood oxygen saturation (SpO2)
   * Apple Watch Series 6+ measures during sleep
   */
  private async fetchSpO2(
    startDate: Date,
    endDate: Date
  ): Promise<SpO2Data[]> {
    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 100,
      };

      // Note: This requires react-native-health to support SpO2
      // If not available, wrap in try-catch
      try {
        AppleHealthKit.getOxygenSaturationSamples(
          options,
          (error: Object, results: any[]) => {
            if (error) {
              console.warn('[LONGEVITY] SpO2 fetch failed (may not be supported):', error);
              resolve([]);
              return;
            }

            const samples: SpO2Data[] = results.map((sample) => ({
              timestamp: new Date(sample.startDate),
              value: Math.round(sample.value * 100), // Convert to percentage
              source: sample.sourceName || 'unknown',
            }));

            console.log(`[LONGEVITY] Fetched ${samples.length} SpO2 samples`);
            resolve(samples);
          }
        );
      } catch (error) {
        console.warn('[LONGEVITY] SpO2 not available');
        resolve([]);
      }
    });
  }

  /**
   * Fetch respiratory rate
   * Measured during sleep by Apple Watch
   */
  private async fetchRespiratoryRate(
    startDate: Date,
    endDate: Date
  ): Promise<RespiratoryRateData[]> {
    return new Promise((resolve) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ascending: false,
        limit: 100,
      };

      try {
        AppleHealthKit.getRespiratoryRateSamples(
          options,
          (error: Object, results: any[]) => {
            if (error) {
              console.warn('[LONGEVITY] Respiratory rate fetch failed:', error);
              resolve([]);
              return;
            }

            const samples: RespiratoryRateData[] = results.map((sample) => ({
              timestamp: new Date(sample.startDate),
              value: sample.value,
              source: sample.sourceName || 'unknown',
            }));

            console.log(
              `[LONGEVITY] Fetched ${samples.length} respiratory rate samples`
            );
            resolve(samples);
          }
        );
      } catch (error) {
        console.warn('[LONGEVITY] Respiratory rate not available');
        resolve([]);
      }
    });
  }

  /**
   * Map HealthKit sleep values to standardized stages
   */
  private mapSleepStage(value: string): SleepData['stage'] {
    const lowerValue = value.toLowerCase();

    if (lowerValue.includes('awake')) return 'AWAKE';
    if (lowerValue.includes('rem')) return 'REM';
    if (lowerValue.includes('deep')) return 'DEEP';
    if (lowerValue.includes('core') || lowerValue.includes('light')) return 'LIGHT';
    if (lowerValue.includes('asleep')) return 'ASLEEP';

    return 'INBED'; // Fallback
  }

  /**
   * Calculate summary statistics from raw data
   */
  calculateDailySummary(snapshot: LongevityDataSnapshot) {
    return {
      avgHeartRate: this.calculateAverage(snapshot.heartRate.map((s) => s.value)),
      minHeartRate: Math.min(...snapshot.heartRate.map((s) => s.value)),
      maxHeartRate: Math.max(...snapshot.heartRate.map((s) => s.value)),

      avgHRV: this.calculateAverage(snapshot.hrv.map((s) => s.sdnn)),
      hrvCount: snapshot.hrv.length,

      restingHR: snapshot.restingHeartRate?.value || null,

      totalSleepHours: this.calculateTotalSleepHours(snapshot.sleep),
      sleepStages: this.calculateSleepStages(snapshot.sleep),

      avgSpO2: this.calculateAverage(snapshot.spo2.map((s) => s.value)),
      minSpO2: Math.min(...snapshot.spo2.map((s) => s.value)),

      avgRespiratoryRate: this.calculateAverage(
        snapshot.respiratoryRate.map((s) => s.value)
      ),
    };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  }

  private calculateTotalSleepHours(sleepData: SleepData[]): number {
    const totalMs = sleepData
      .filter((s) => s.stage !== 'AWAKE' && s.stage !== 'INBED')
      .reduce((sum, s) => {
        return sum + (s.endDate.getTime() - s.startDate.getTime());
      }, 0);

    return Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10; // Round to 1 decimal
  }

  private calculateSleepStages(sleepData: SleepData[]) {
    const stages = {
      rem: 0,
      deep: 0,
      light: 0,
      awake: 0,
    };

    sleepData.forEach((s) => {
      const hours =
        (s.endDate.getTime() - s.startDate.getTime()) / (1000 * 60 * 60);

      if (s.stage === 'REM') stages.rem += hours;
      else if (s.stage === 'DEEP') stages.deep += hours;
      else if (s.stage === 'LIGHT' || s.stage === 'ASLEEP') stages.light += hours;
      else if (s.stage === 'AWAKE') stages.awake += hours;
    });

    return {
      rem: Math.round(stages.rem * 10) / 10,
      deep: Math.round(stages.deep * 10) / 10,
      light: Math.round(stages.light * 10) / 10,
      awake: Math.round(stages.awake * 10) / 10,
    };
  }
}

// Export singleton instance
export const longevityDataService = new LongevityDataService();

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Fetch last 24 hours of longevity data
 *
 * ```typescript
 * import { longevityDataService } from '@/services/longevityDataService';
 *
 * // Initialize on app start
 * await longevityDataService.initialize();
 *
 * // Fetch data
 * const data = await longevityDataService.fetchData();
 *
 * console.log('Heart Rate samples:', data.heartRate.length);
 * console.log('HRV samples:', data.hrv.length);
 * console.log('Resting HR:', data.restingHeartRate?.value);
 *
 * // Calculate summary
 * const summary = longevityDataService.calculateDailySummary(data);
 * console.log('Summary:', summary);
 * ```
 */
