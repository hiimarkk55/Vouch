# VOUCH // BIOMETRIC SYNC ARCHITECTURE

> **Critical Design Decision**: All vouches MUST attempt biometric verification FIRST

---

## PHILOSOPHY

**Biometric Priority** is the core principle of VOUCH's accountability system. We trust objective data from health sensors over manual input. This ensures:

1. **Authenticity**: Workouts are verified by device sensors
2. **No Gaming**: Can't fake biometric data
3. **Automatic**: Zero friction for honest users
4. **High-Stakes**: Manual entry is a last resort

---

## SYNC PRIORITY CASCADE

```
┌─────────────────────────────────────┐
│  1. ATTEMPT BIOMETRIC SYNC          │
│     - iOS: HealthKit                │
│     - Android: Google Fit           │
│     - Timeout: 5 seconds            │
└─────────────────────────────────────┘
              │
              ├─── SUCCESS? ──> Create Verified Vouch
              │                 (verified: true, source: 'healthkit')
              │
              └─── FAILED? ──> Fallback to Manual Entry
                               (verified: false, source: 'manual')
                               ⚠️ User gets roasted for manual entry
```

---

## iOS: HEALTHKIT INTEGRATION

### Permissions Required

Configured in `app.json` under `ios.infoPlist`:

```json
{
  "NSHealthShareUsageDescription": "VOUCH needs access to your health data to verify workout completion and sync biometric proof-of-work.",
  "NSHealthUpdateUsageDescription": "VOUCH needs to write workout data for verified activities."
}
```

### Data Points We Read

1. **Workout Sessions**
   - Activity type (running, cycling, strength, etc.)
   - Start/end time
   - Duration
   - Total energy burned (calories)

2. **Biometric Correlations**
   - Heart rate (average during workout)
   - Distance (for cardio activities)
   - Active energy burned

### Implementation

See `src/hooks/useBiometricSync.ts`:

```typescript
// Initialize HealthKit on app launch
AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS, callback);

// Fetch most recent workout (last 24 hours)
const workout = await fetchRecentWorkout();

// Data structure returned:
{
  type: 'running',
  duration: 45,           // minutes
  calories: 420,
  distance: 8000,         // meters
  heartRate: 145,         // avg BPM
  verified: true,         // ✓ From HealthKit
  source: 'healthkit'
}
```

### Workout Type Mapping

HealthKit has 70+ activity types. We map them to 4 VOUCH categories:

| HealthKit Activity | VOUCH Type |
|-------------------|------------|
| Running, Walking, Hiking | `running` |
| Cycling, Biking | `cycling` |
| Strength Training, CrossFit | `strength` |
| Everything else | `other` |

---

## ANDROID: GOOGLE FIT INTEGRATION

### Status: TODO (Not Yet Implemented)

**Next Steps**:
1. Set up Google Fit API in Google Cloud Console
2. Configure OAuth consent screen
3. Request Activity Recognition permission
4. Implement `fetchFromGoogleFit()` in `useBiometricSync.ts`

### Required Permissions

In `app.json` under `android.permissions`:

```json
[
  "ACTIVITY_RECOGNITION",
  "ACCESS_FINE_LOCATION"  // For GPS-based workouts
]
```

### Google Fit API Scopes

```typescript
const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.location.read',
  'https://www.googleapis.com/auth/fitness.body.read',
];
```

### Implementation Plan

```typescript
// Similar to HealthKit, but using Google Fit APIs
import GoogleFit from 'react-native-google-fit';

// Initialize
GoogleFit.authorize(GOOGLE_FIT_SCOPES);

// Fetch recent workout
const sessions = await GoogleFit.getActivitySamples({
  startDate: oneDayAgo,
  endDate: now,
});
```

---

## FALLBACK: MANUAL ENTRY

### When Manual Entry is Used

1. Biometric source unavailable (no HealthKit/Google Fit)
2. Sync fails (network error, timeout)
3. No recent workouts found
4. User denies permissions

### Consequences

```typescript
if (workoutData.source === 'manual') {
  // ⚠️ User gets roasted by AI
  roastUser("MANUAL ENTRY DETECTED. WHERE'S THE PROOF?");

  // ⚠️ Marked as unverified
  vouch.verified = false;

  // ⚠️ Lower credibility in squad
  updateSquadTrust(userId, -10);
}
```

### Manual Entry UI (TODO)

Still requires:
- Workout type selection
- Duration input
- Calories estimate
- Photo proof (REQUIRED)

**Photo is mandatory for manual entries** to prevent complete gaming.

---

## SYNC FLOW DIAGRAM

```
USER OPENS CAMERA SCREEN
         │
         ▼
    CAPTURE PHOTO
         │
         ▼
┌────────────────────┐
│ useBiometricSync() │
└────────────────────┘
         │
    ┌────┴────┐
    │         │
  iOS?     Android?
    │         │
    ▼         ▼
HealthKit  GoogleFit
    │         │
    └────┬────┘
         │
    ┌────┴────┐
    │ Success? │
    └────┬────┘
         │
    ┌────┴────┐
   YES       NO
    │         │
    ▼         ▼
VERIFIED  MANUAL
 VOUCH    ENTRY
    │         │
    └────┬────┘
         │
         ▼
  UPLOAD TO FIREBASE
         │
         ▼
  UPDATE SQUAD FEED
```

---

## ERROR HANDLING

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `HealthKit init failed` | Permissions denied | Prompt user to enable in Settings |
| `No recent workouts found` | No activity in last 24h | Allow manual entry |
| `Network timeout` | Firebase unreachable | Cache locally, sync later |
| `Photo upload failed` | Storage quota | Compress image, retry |

### Retry Logic

```typescript
// Exponential backoff for network failures
const retrySync = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchRecentWorkout();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // 1s, 2s, 4s
    }
  }
};
```

---

## PERFORMANCE TARGETS

| Operation | Target | Max Acceptable |
|-----------|--------|----------------|
| HealthKit permission request | 1s | 3s |
| Fetch recent workout | 2s | 5s |
| Photo upload to Firebase | 2s | 5s |
| Total vouch creation | 5s | 10s |

**Remember**: Every interaction must be under 10 seconds.

---

## TESTING

### Manual Testing Checklist

- [ ] iOS: Complete workout in Apple Health, verify it syncs
- [ ] Android: Complete workout in Google Fit, verify it syncs
- [ ] Deny permissions, verify fallback to manual entry
- [ ] Enable airplane mode, verify offline caching
- [ ] Capture photo, verify upload to Firebase Storage
- [ ] Check Firestore, verify vouch document created

### Automated Tests (TODO)

```typescript
describe('useBiometricSync', () => {
  it('should fetch HealthKit data on iOS', async () => {
    // Mock HealthKit response
    // Assert workout data is parsed correctly
  });

  it('should fallback to manual if sync fails', async () => {
    // Mock HealthKit failure
    // Assert manual entry is prompted
  });
});
```

---

## FUTURE ENHANCEMENTS

1. **Real-time Heart Rate Monitoring**
   - Verify user is actually exercising during vouch
   - Detect anomalies (too low HR = sitting around)

2. **GPS Route Validation**
   - For outdoor runs/cycles
   - Prevent treadmill gaming

3. **Wearable Integration**
   - Apple Watch direct sync
   - Garmin, Fitbit, Whoop support

4. **AI Workout Validation**
   - Analyze photo for workout authenticity
   - Detect gym vs. couch

---

**BIOMETRIC SYNC IS NON-NEGOTIABLE. TRUST THE SENSORS, NOT THE USERS.**
