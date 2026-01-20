# VOUCH Longevity Monitoring Architecture

## Overview

This document outlines the technical architecture for adding in-depth heart rate and longevity monitoring to VOUCH, enabling features like:
- Daily recovery scores (like Whoop)
- HRV and RHR trend tracking
- Sleep analysis and optimization
- Strain vs Recovery balance
- Squad health leaderboards

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ MOBILE APP (React Native + Expo)                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │ HealthKit Sync   │        │ Google Fit Sync  │          │
│  │ (iOS)            │        │ (Android)        │          │
│  └────────┬─────────┘        └────────┬─────────┘          │
│           │                           │                     │
│           └───────────┬───────────────┘                     │
│                       │                                     │
│           ┌───────────▼──────────────┐                      │
│           │ Longevity Data Service   │                      │
│           │ - Process raw data       │                      │
│           │ - Calculate metrics      │                      │
│           │ - Batch sync (1hr)       │                      │
│           └───────────┬──────────────┘                      │
│                       │                                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌───────────────┐ ┌──────────────┐ ┌─────────────┐
│  TimescaleDB  │ │  Firestore   │ │  Firebase   │
│  (PostgreSQL) │ │              │ │  Storage    │
├───────────────┤ ├──────────────┤ ├─────────────┤
│               │ │              │ │             │
│ Raw Time-     │ │ Daily        │ │ Workout     │
│ Series Data:  │ │ Summaries:   │ │ Photos      │
│               │ │              │ │             │
│ • HR (5s)     │ │ • Recovery   │ │             │
│ • HRV         │ │ • Strain     │ │             │
│ • Sleep       │ │ • Trends     │ │             │
│ • SpO2        │ │ • Squads     │ │             │
│ • Resp Rate   │ │ • Users      │ │             │
│               │ │              │ │             │
│ Retention:    │ │ Retention:   │ │ Retention:  │
│ 90 days       │ │ Forever      │ │ 1 year      │
│               │ │              │ │             │
└───────┬───────┘ └──────┬───────┘ └─────────────┘
        │                │
        │    ┌───────────▼──────────────┐
        │    │ Firebase Cloud Functions │
        └───►│ (Scheduled jobs)         │
             ├──────────────────────────┤
             │                          │
             │ • Calculate Recovery     │
             │ • Calculate Strain       │
             │ • Detect Anomalies       │
             │ • Generate Insights      │
             │ • Aggregate to Firestore │
             │                          │
             │ Runs: Every 1 hour       │
             │                          │
             └──────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ WEB DASHBOARD (Next.js)                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │ Recovery Score  │  │ HRV/RHR Trends   │                 │
│  │ (Firestore)     │  │ (TimescaleDB)    │                 │
│  └─────────────────┘  └──────────────────┘                 │
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │ Sleep Analysis  │  │ Squad Health     │                 │
│  │ (TimescaleDB)   │  │ Leaderboard      │                 │
│  └─────────────────┘  │ (Firestore)      │                 │
│                       └──────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Storage Strategy

### TimescaleDB (Raw Time-Series Data)

**Tables:**

```sql
-- Continuous heart rate (sampled every 5-60 seconds)
CREATE TABLE heart_rate (
  user_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  value INTEGER NOT NULL,  -- BPM
  source TEXT,             -- 'apple_watch', 'whoop', etc
  motion_context TEXT      -- 'sedentary', 'active', 'workout'
);

SELECT create_hypertable('heart_rate', 'timestamp');

-- Heart Rate Variability (nightly readings)
CREATE TABLE hrv (
  user_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  sdnn FLOAT,              -- Standard deviation (primary HRV metric)
  rmssd FLOAT,             -- Root mean square (parasympathetic activity)
  measurement_quality TEXT -- 'excellent', 'good', 'fair', 'poor'
);

SELECT create_hypertable('hrv', 'timestamp');

-- Resting heart rate (nightly)
CREATE TABLE resting_heart_rate (
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  value INTEGER NOT NULL,
  sleep_hr_avg INTEGER,
  sleep_hr_min INTEGER
);

-- Sleep stages
CREATE TABLE sleep_stages (
  user_id TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  stage TEXT NOT NULL,     -- 'awake', 'rem', 'light', 'deep'
  source TEXT
);

SELECT create_hypertable('sleep_stages', 'start_time');

-- Respiratory rate (during sleep)
CREATE TABLE respiratory_rate (
  user_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  value FLOAT NOT NULL,    -- Breaths per minute
  source TEXT
);

SELECT create_hypertable('respiratory_rate', 'timestamp');

-- Blood oxygen saturation
CREATE TABLE spo2 (
  user_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  value INTEGER NOT NULL,  -- Percentage (0-100)
  source TEXT
);

SELECT create_hypertable('spo2', 'timestamp');

-- Continuous aggregates for performance
CREATE MATERIALIZED VIEW heart_rate_hourly
WITH (timescaledb.continuous) AS
SELECT
  user_id,
  time_bucket('1 hour', timestamp) AS hour,
  AVG(value) as avg_hr,
  MIN(value) as min_hr,
  MAX(value) as max_hr,
  COUNT(*) as sample_count
FROM heart_rate
GROUP BY user_id, hour;

-- Retention policy: Keep raw data for 90 days
SELECT add_retention_policy('heart_rate', INTERVAL '90 days');
SELECT add_retention_policy('hrv', INTERVAL '365 days');  -- Keep HRV longer
SELECT add_retention_policy('sleep_stages', INTERVAL '365 days');
```

**Why TimescaleDB:**
- ✅ PostgreSQL extension (familiar SQL)
- ✅ Automatic compression (10x reduction after 7 days)
- ✅ Continuous aggregates (pre-compute hourly/daily summaries)
- ✅ Retention policies (auto-delete old data)
- ✅ Fast time-range queries
- ✅ Can self-host or use Timescale Cloud

---

### Firestore (Daily Summaries & User Data)

**Collections:**

```typescript
// longevity_daily/{userId}/days/{date}
{
  userId: string;
  date: '2026-01-20';

  // Recovery metrics (calculated at 6am daily)
  recovery: {
    score: 85,           // 0-100 (composite of HRV, RHR, sleep)
    hrv: {
      value: 65,         // Today's HRV (ms)
      baseline: 62,      // 30-day average
      trend: 'improving' // 'improving', 'stable', 'declining'
    },
    rhr: {
      value: 52,         // Today's resting HR
      baseline: 54,
      trend: 'improving'
    },
    sleep: {
      total: 7.5,        // hours
      efficiency: 92,    // percentage
      rem: 1.5,
      deep: 2.0,
      light: 4.0,
      awake: 0.5,
      quality: 'excellent' // 'excellent', 'good', 'fair', 'poor'
    }
  },

  // Strain (calculated at midnight)
  strain: {
    score: 12.5,         // 0-21 (cardiovascular load)
    breakdown: {
      workout: 8.5,      // From workouts
      daily: 4.0         // From daily activities
    },
    recommendation: 'moderate_activity' // Based on recovery
  },

  // Alerts
  alerts: [
    {
      type: 'low_recovery',
      message: 'Recovery below baseline. Consider light activity today.',
      severity: 'warning'
    }
  ],

  // Calculated by Cloud Function
  calculatedAt: Timestamp,
  dataQuality: 'complete' // 'complete', 'partial', 'missing'
}

// longevity_trends/{userId}
{
  userId: string;

  // 30-day rolling averages
  trends: {
    hrv: {
      current: 65,
      week_1: 63,
      week_2: 64,
      week_3: 62,
      week_4: 60,
      direction: 'improving',
      percentChange: 8.3
    },
    rhr: {
      current: 52,
      week_1: 53,
      week_2: 54,
      week_3: 55,
      week_4: 56,
      direction: 'improving',
      percentChange: -7.1
    },
    sleep: {
      avgDuration: 7.4,
      avgEfficiency: 89,
      consistency: 'good' // Based on sleep time variance
    },
    recovery: {
      avgScore: 78,
      daysAbove80: 18,
      daysBelow60: 3
    }
  },

  updatedAt: Timestamp
}

// squad_health/{squadId}
{
  squadId: string;
  members: [
    {
      userId: string,
      displayName: string,
      currentRecovery: 85,
      weeklyAvgRecovery: 78,
      weeklyStrain: 14.5,
      rank: 1
    }
  ],
  updatedAt: Timestamp
}
```

---

## Data Sync Strategy

### Mobile → TimescaleDB

**Frequency:** Every 1 hour (background task)

```typescript
// mobile/src/services/longevitySync.ts

import { timescaleApi } from './timescale-api';
import AppleHealthKit from 'react-native-health';

export const syncLongevityData = async (userId: string) => {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // Last hour

  // Fetch from HealthKit
  const [heartRate, hrv, sleep, spo2, respRate] = await Promise.all([
    fetchHeartRateSamples(startTime, endTime),
    fetchHRVSamples(startTime, endTime),
    fetchSleepSamples(startTime, endTime),
    fetchSpO2Samples(startTime, endTime),
    fetchRespiratoryRateSamples(startTime, endTime),
  ]);

  // Batch insert to TimescaleDB
  await timescaleApi.batchInsert({
    userId,
    heartRate,
    hrv,
    sleep,
    spo2,
    respRate,
  });
};

// Schedule background task (runs every hour)
BackgroundFetch.configure({
  minimumFetchInterval: 60, // minutes
  stopOnTerminate: false,
  startOnBoot: true,
}, async (taskId) => {
  const userId = await getCurrentUserId();
  await syncLongevityData(userId);
  BackgroundFetch.finish(taskId);
});
```

---

### TimescaleDB → Firestore (Cloud Function)

**Frequency:** Every 1 hour (aggregate data)

```typescript
// functions/src/calculateRecovery.ts

import { Timestamp } from 'firebase-admin/firestore';
import { timescaleClient } from './timescale-client';
import { db } from './firebase-admin';

export const calculateDailyRecovery = async (userId: string, date: string) => {
  // Fetch data from TimescaleDB
  const [hrvData, rhrData, sleepData] = await Promise.all([
    timescaleClient.query(`
      SELECT sdnn FROM hrv
      WHERE user_id = $1
      AND timestamp::date = $2
      ORDER BY timestamp DESC LIMIT 1
    `, [userId, date]),

    timescaleClient.query(`
      SELECT value FROM resting_heart_rate
      WHERE user_id = $1 AND date = $2
    `, [userId, date]),

    timescaleClient.query(`
      SELECT stage,
        EXTRACT(EPOCH FROM (end_time - start_time))/3600 as hours
      FROM sleep_stages
      WHERE user_id = $1
      AND start_time::date = $2
    `, [userId, date]),
  ]);

  // Calculate recovery score
  const recovery = calculateRecoveryScore({
    hrv: hrvData.rows[0]?.sdnn,
    rhr: rhrData.rows[0]?.value,
    sleep: aggregateSleep(sleepData.rows),
  });

  // Save to Firestore
  await db.collection('longevity_daily')
    .doc(userId)
    .collection('days')
    .doc(date)
    .set(recovery);
};

// Scheduled function (runs every hour)
export const scheduledRecoveryCalculation = functions.pubsub
  .schedule('0 * * * *')  // Every hour
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    const today = new Date().toISOString().split('T')[0];
    const users = await getActiveUsers();

    await Promise.all(
      users.map(user => calculateDailyRecovery(user.id, today))
    );
  });
```

---

## Cost Analysis

### At 10,000 Active Users

**TimescaleDB Cloud (Managed):**
```
Storage: 100 GB (90 days retention)
Compute: 2 vCPU, 8 GB RAM
Cost: $75-100/month
```

**Firestore:**
```
Storage: 5 GB (summaries only)
Reads: 100K/day (dashboards)
Writes: 50K/day (daily summaries)
Cost: $15/month
```

**Cloud Functions:**
```
Invocations: 240K/month (hourly for 10K users)
Compute: 1 million GB-seconds
Cost: $20/month
```

**Firebase Storage:**
```
Photos: 50 GB
Cost: $13/month
```

**TOTAL: ~$125/month** for 10,000 users

---

### At 100,000 Active Users

**TimescaleDB:** $300-500/month (larger instance)
**Firestore:** $150/month
**Cloud Functions:** $200/month
**Storage:** $130/month

**TOTAL: ~$800/month** for 100,000 users

---

## Data Retention Strategy

| Data Type | Retention | Storage |
|-----------|-----------|---------|
| Raw HR (5s intervals) | 90 days | TimescaleDB |
| Hourly HR aggregates | 2 years | TimescaleDB |
| Daily summaries | Forever | Firestore |
| HRV readings | 1 year | TimescaleDB |
| Sleep data | 1 year | TimescaleDB |
| Workout photos | 1 year | Firebase Storage |

---

## Privacy & Security

**HIPAA Compliance Considerations:**
- ❌ VOUCH is NOT currently HIPAA compliant
- ❌ Don't market as medical device
- ✅ Use for fitness/wellness only
- ✅ Encrypt data at rest (both DBs support this)
- ✅ User-initiated data deletion (GDPR compliance)

**Data Ownership:**
- Users own their health data
- Provide data export (JSON format)
- Provide data deletion (account deletion)

---

## Next Steps

1. **Set up TimescaleDB** (Cloud or self-hosted)
2. **Create database schema** (tables above)
3. **Implement HealthKit sync** (hourly background task)
4. **Deploy Cloud Functions** (recovery calculation)
5. **Build dashboard UI** (recovery score, trends)
6. **Test with beta users** (validate algorithms)

---

## References

- [TimescaleDB Best Practices](https://docs.timescale.com/timescaledb/latest/how-to-guides/hypertables/about-hypertables/)
- [HealthKit Data Types](https://developer.apple.com/documentation/healthkit/data_types)
- [Whoop Recovery Algorithm](https://www.whoop.com/us/en/thelocker/recovery-score-explained/)
- [HRV Interpretation Guide](https://elitehrv.com/normal-heart-rate-variability-age-gender)
