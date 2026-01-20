/**
 * VOUCH Longevity Monitoring Schema
 *
 * TypeScript interfaces for in-depth health tracking:
 * - Heart Rate Variability (HRV)
 * - Resting Heart Rate (RHR)
 * - Sleep Analysis
 * - Recovery Score
 * - Strain Score
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// DAILY LONGEVITY DATA
// ============================================================================

/**
 * Collection: longevity_daily/{userId}/days/{date}
 * One document per user per day with all calculated metrics
 */
export interface LongevityDailyData {
  userId: string;
  date: string; // ISO date string 'YYYY-MM-DD'

  recovery: RecoveryMetrics;
  strain: StrainMetrics;
  alerts: HealthAlert[];

  dataQuality: 'complete' | 'partial' | 'missing';
  calculatedAt: Timestamp;
}

export interface RecoveryMetrics {
  score: number; // 0-100 composite score

  hrv: {
    value: number; // Today's HRV in milliseconds
    baseline: number; // 30-day rolling average
    trend: 'improving' | 'stable' | 'declining';
    percentile: number; // 0-100, compared to user's history
  };

  rhr: {
    value: number; // Today's resting HR (BPM)
    baseline: number; // 30-day rolling average
    trend: 'improving' | 'stable' | 'declining';
  };

  sleep: {
    total: number; // Total sleep hours
    efficiency: number; // Percentage (0-100)
    rem: number; // REM sleep hours
    deep: number; // Deep sleep hours
    light: number; // Light sleep hours
    awake: number; // Awake time hours
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    debt: number; // Accumulated sleep debt (hours)
  };

  recommendation: 'high_intensity' | 'moderate_activity' | 'light_activity' | 'rest_day';
}

export interface StrainMetrics {
  score: number; // 0-21 (Whoop-style cardiovascular load)

  breakdown: {
    workout: number; // Strain from workouts
    daily: number; // Strain from daily activities
  };

  heartRateStats: {
    avgDayHR: number; // Average HR while awake
    maxHR: number; // Max HR for the day
    timeInZones: {
      zone1: number; // Minutes in each zone
      zone2: number;
      zone3: number;
      zone4: number;
      zone5: number;
    };
  };

  recommendation: string; // Human-readable advice
}

export interface HealthAlert {
  type:
    | 'low_recovery'
    | 'high_strain'
    | 'abnormal_hrv'
    | 'abnormal_rhr'
    | 'poor_sleep'
    | 'overtraining'
    | 'illness_detected';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Timestamp;
}

// ============================================================================
// TREND DATA
// ============================================================================

/**
 * Collection: longevity_trends/{userId}
 * Rolling averages and long-term trends
 */
export interface LongevityTrends {
  userId: string;

  hrv: TrendMetric;
  rhr: TrendMetric;
  sleep: SleepTrend;
  recovery: RecoveryTrend;

  updatedAt: Timestamp;
}

export interface TrendMetric {
  current: number; // Most recent value
  week_1: number; // Average from 1 week ago
  week_2: number;
  week_3: number;
  week_4: number;
  direction: 'improving' | 'stable' | 'declining';
  percentChange: number; // Percentage change from 4 weeks ago
}

export interface SleepTrend {
  avgDuration: number; // Hours
  avgEfficiency: number; // Percentage
  consistency: 'excellent' | 'good' | 'fair' | 'poor';
  bedtimeVariance: number; // Minutes (lower is better)
  wakeTimeVariance: number; // Minutes (lower is better)
}

export interface RecoveryTrend {
  avgScore: number; // 0-100
  daysAbove80: number; // Count of high recovery days
  daysBelow60: number; // Count of low recovery days
  consistency: number; // 0-100, lower variance = higher consistency
}

// ============================================================================
// SQUAD HEALTH LEADERBOARD
// ============================================================================

/**
 * Collection: squad_health/{squadId}
 * Aggregated health metrics for squad comparison
 */
export interface SquadHealth {
  squadId: string;
  members: SquadMemberHealth[];
  updatedAt: Timestamp;
}

export interface SquadMemberHealth {
  userId: string;
  displayName: string;

  // Current metrics
  currentRecovery: number;
  currentStrain: number;

  // Weekly averages
  weeklyAvgRecovery: number;
  weeklyAvgStrain: number;
  weeklyAvgHRV: number;
  weeklyAvgSleep: number;

  // Leaderboard ranking
  rank: number;
  healthScore: number; // Composite score for ranking
}

// ============================================================================
// RAW TIME-SERIES DATA (Stored in TimescaleDB)
// ============================================================================

/**
 * These interfaces represent data in TimescaleDB
 * Used for detailed charts and analysis
 */

export interface HeartRateSample {
  user_id: string;
  timestamp: Date;
  value: number; // BPM
  source: 'apple_watch' | 'whoop' | 'oura' | 'other';
  motion_context?: 'sedentary' | 'active' | 'workout';
}

export interface HRVSample {
  user_id: string;
  timestamp: Date;
  sdnn: number; // Standard deviation (primary HRV metric)
  rmssd: number; // Root mean square (parasympathetic activity)
  measurement_quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface RestingHeartRate {
  user_id: string;
  date: string; // 'YYYY-MM-DD'
  value: number;
  sleep_hr_avg: number;
  sleep_hr_min: number;
}

export interface SleepStage {
  user_id: string;
  start_time: Date;
  end_time: Date;
  stage: 'awake' | 'rem' | 'light' | 'deep';
  source: 'apple_watch' | 'whoop' | 'oura' | 'other';
}

export interface RespiratoryRateSample {
  user_id: string;
  timestamp: Date;
  value: number; // Breaths per minute
  source: string;
}

export interface SpO2Sample {
  user_id: string;
  timestamp: Date;
  value: number; // Percentage (0-100)
  source: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface GetRecoveryRequest {
  userId: string;
  date?: string; // Defaults to today
}

export interface GetRecoveryResponse {
  recovery: RecoveryMetrics;
  strain: StrainMetrics;
  comparison: {
    vsYesterday: number; // Percentage change
    vsWeekAvg: number;
    vsMonthAvg: number;
  };
}

export interface GetTrendsRequest {
  userId: string;
  metric: 'hrv' | 'rhr' | 'sleep' | 'recovery';
  range: '7d' | '30d' | '90d' | '1y';
}

export interface GetTrendsResponse {
  data: Array<{
    date: string;
    value: number;
  }>;
  baseline: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface GetDetailedChartRequest {
  userId: string;
  metric: 'heart_rate' | 'hrv' | 'sleep' | 'spo2' | 'respiratory_rate';
  startDate: string;
  endDate: string;
}

export interface GetDetailedChartResponse {
  data: Array<{
    timestamp: Date;
    value: number;
  }>;
  stats: {
    avg: number;
    min: number;
    max: number;
    stdDev: number;
  };
}

// ============================================================================
// CALCULATION ALGORITHMS
// ============================================================================

/**
 * Recovery Score Algorithm (Whoop-inspired)
 *
 * Components:
 * - HRV (40%): Higher = better recovery
 * - RHR (30%): Lower = better recovery
 * - Sleep (30%): More + quality = better recovery
 *
 * Score: 0-100
 * - 67-100: Green (high recovery)
 * - 34-66: Yellow (moderate recovery)
 * - 0-33: Red (low recovery)
 */
export function calculateRecoveryScore(
  hrvValue: number,
  hrvBaseline: number,
  rhrValue: number,
  rhrBaseline: number,
  sleepHours: number,
  sleepEfficiency: number
): number {
  // HRV component (40%)
  const hrvPercent = Math.min(150, (hrvValue / hrvBaseline) * 100);
  const hrvScore = (hrvPercent / 150) * 40;

  // RHR component (30%)
  const rhrPercent = Math.max(50, (rhrBaseline / rhrValue) * 100);
  const rhrScore = ((rhrPercent - 50) / 50) * 30;

  // Sleep component (30%)
  const sleepDurationScore = Math.min(sleepHours / 8, 1) * 15;
  const sleepQualityScore = (sleepEfficiency / 100) * 15;
  const sleepScore = sleepDurationScore + sleepQualityScore;

  return Math.round(Math.min(100, hrvScore + rhrScore + sleepScore));
}

/**
 * Strain Score Algorithm (Whoop-inspired)
 *
 * Based on cardiovascular load (time in HR zones)
 * Scale: 0-21
 * - 0-9: Low strain
 * - 10-13: Moderate strain
 * - 14-17: High strain
 * - 18-21: All out
 */
export function calculateStrainScore(
  timeInZones: {
    zone1: number; // Minutes
    zone2: number;
    zone3: number;
    zone4: number;
    zone5: number;
  },
  maxHR: number,
  avgHR: number
): number {
  const strainPoints =
    timeInZones.zone1 * 0.1 +
    timeInZones.zone2 * 0.3 +
    timeInZones.zone3 * 0.6 +
    timeInZones.zone4 * 1.0 +
    timeInZones.zone5 * 1.5;

  return Math.min(21, Math.round(strainPoints / 60)); // Normalize to 0-21
}

// ============================================================================
// HEALTHKIT DATA MAPPING
// ============================================================================

/**
 * Maps HealthKit workout types to HR zones
 */
export const HR_ZONES = {
  zone1: { min: 0.5, max: 0.6, name: 'Recovery', color: '#00FF41' },
  zone2: { min: 0.6, max: 0.7, name: 'Endurance', color: '#00FFFF' },
  zone3: { min: 0.7, max: 0.8, name: 'Tempo', color: '#FFD700' },
  zone4: { min: 0.8, max: 0.9, name: 'Threshold', color: '#FF8C00' },
  zone5: { min: 0.9, max: 1.0, name: 'Max Effort', color: '#FF0040' },
} as const;

/**
 * Calculate which zone a heart rate falls into
 */
export function getHeartRateZone(
  hr: number,
  maxHR: number
): keyof typeof HR_ZONES {
  const percent = hr / maxHR;

  if (percent >= HR_ZONES.zone5.min) return 'zone5';
  if (percent >= HR_ZONES.zone4.min) return 'zone4';
  if (percent >= HR_ZONES.zone3.min) return 'zone3';
  if (percent >= HR_ZONES.zone2.min) return 'zone2';
  return 'zone1';
}

/**
 * Estimate max heart rate (220 - age formula)
 */
export function estimateMaxHR(age: number): number {
  return 220 - age;
}

// ============================================================================
// FIRESTORE COLLECTION PATHS
// ============================================================================

export const LONGEVITY_COLLECTIONS = {
  DAILY_DATA: 'longevity_daily',
  TRENDS: 'longevity_trends',
  SQUAD_HEALTH: 'squad_health',
} as const;

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: Get today's recovery score
 *
 * ```typescript
 * import { doc, getDoc } from 'firebase/firestore';
 * import { db } from '@/services/firebase';
 * import { LONGEVITY_COLLECTIONS, LongevityDailyData } from '@/firebase/longevity-schema';
 *
 * const today = new Date().toISOString().split('T')[0];
 * const docRef = doc(
 *   db,
 *   LONGEVITY_COLLECTIONS.DAILY_DATA,
 *   userId,
 *   'days',
 *   today
 * );
 *
 * const snapshot = await getDoc(docRef);
 * const data = snapshot.data() as LongevityDailyData;
 *
 * console.log(`Recovery Score: ${data.recovery.score}`);
 * console.log(`Recommendation: ${data.recovery.recommendation}`);
 * ```
 */
