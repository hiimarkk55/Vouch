# VOUCH // MOBILE APP

> **Social Accountability Engine - Mobile Edition**
> React Native + Expo + Privy Mobile SDK + Firebase

---

## MISSION

The mobile app is the **Daily Log** for the VOUCH guild. Every interaction must be under 10 seconds. **Friction is the enemy; accountability is the product.**

---

## TECH STACK

- **Framework**: React Native + Expo (SDK 54+)
- **Styling**: NativeWind (Tailwind for Mobile)
- **Identity**: Privy.io Mobile SDK
- **Database**: Firebase (shared with web)
- **Biometrics**: Apple HealthKit + Google Fit
- **Navigation**: React Navigation (Native Stack)

---

## PROJECT STRUCTURE

```
mobile/
├── src/
│   ├── components/       # UI components (Atomic design)
│   │   └── TerminalButton.tsx
│   ├── screens/          # Main view logic
│   │   ├── LoginScreen.tsx
│   │   └── ProofOfWorkCamera.tsx
│   ├── hooks/            # Biometric and Auth hooks
│   │   ├── useBiometricSync.ts
│   │   └── usePrivyAuth.ts
│   ├── constants/        # Theme and global config
│   │   ├── theme.ts
│   │   └── config.ts
│   ├── services/         # Firebase and API services
│   │   ├── firebase.ts
│   │   └── vouchService.ts
│   └── navigation/       # App navigation
│       └── AppNavigator.tsx
├── App.tsx               # Entry point
├── package.json
├── app.json              # Expo config
└── tailwind.config.js    # NativeWind config
```

---

## SETUP INSTRUCTIONS

### Quick Start (Android Studio)

**For Android Studio emulator setup, see:**
- 📱 **`QUICKSTART_ANDROID.md`** - Get running in 15 minutes
- 📖 **`ANDROID_STUDIO_SETUP.md`** - Complete setup guide

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `EXPO_PUBLIC_PRIVY_APP_ID`: Your Privy app ID (same as web)
- `EXPO_PUBLIC_FIREBASE_*`: Firebase config (shared with web project)
- `EXPO_PUBLIC_MOCK_BIOMETRICS=true`: Enable mock data for emulator testing

### 3. Install Space Mono Font

Download Space Mono font and place in `assets/fonts/`:
- `SpaceMono-Regular.ttf`
- `SpaceMono-Bold.ttf`

### 4. Run Development Server

**For Android Studio Emulator (Recommended):**
```bash
# First time: Build and install development client
npm run android

# Subsequent runs: Start dev server
npm start
# Then press 'a' for Android
```

**For Expo Go (Limited Features):**
```bash
npm start
# Scan QR code with Expo Go app
```

---

## BIOMETRIC SYNC LOGIC

**CRITICAL: All vouches MUST attempt biometric sync before manual entry.**

### Priority Order:
1. **iOS**: Apple HealthKit (primary)
2. **Android**: Google Fit (primary)
3. **Fallback**: Manual entry (only if biometric unavailable)

### How it Works:

```typescript
// 1. User captures workout photo
const photo = await captureProofOfWork();

// 2. Attempt biometric sync (ALWAYS FIRST)
const { success, data } = await fetchRecentWorkout();

if (success && data) {
  // Verified workout with biometric proof
  await createVouch(userId, data, photo);
} else {
  // Manual entry required (biometric unavailable)
  await promptManualEntry();
}
```

### HealthKit Permissions (iOS)

Configured in `app.json`:
- `NSHealthShareUsageDescription`: Read workout data
- `NSHealthUpdateUsageDescription`: Write verified workouts

Permissions requested in `useBiometricSync.ts`:
- Active Energy Burned
- Workout data
- Heart Rate
- Distance (Walking/Running/Cycling)

### Google Fit (Android)

**TODO**: Implement Google Fit API integration
- Activity Recognition permission
- Fitness API setup
- OAuth consent screen

---

## TERMINAL AESTHETIC GUIDELINES

### Color Palette
- **Primary**: `#00FFFF` (Neon Cyan)
- **Background**: `#000000` (Pure Black)
- **Success**: `#00FF41` (Terminal Green)
- **Error**: `#FF0040` (Terminal Red)

### Typography
- **Font**: Space Mono (monospace only)
- **Prefixes**: Use `>` for commands, `//` for comments
- **Style**: Everything must feel like a terminal command

### Example UI

```typescript
<Text className="font-mono text-neon-cyan">
  > AUTHENTICATE TO CONTINUE
</Text>

<Text className="font-mono text-terminal-green text-xs">
  // BIOMETRIC SYNC: READY
</Text>
```

---

## PERFORMANCE TARGETS

- **Max Interaction Time**: 10 seconds per action
- **Max File Lines**: 250 lines (per CLAUDE.md)
- **Camera Capture**: < 2 seconds
- **Biometric Sync**: < 5 seconds
- **Photo Upload**: < 3 seconds

---

## DEVELOPMENT COMMANDS

### Android Studio Development

```bash
# Build and run on Android emulator (first time)
npm run android

# Start emulator (from command line)
npm run emulator

# Start dev server only
npm start

# Clean Android build
npm run android:clean

# View React Native logs
npm run logcat

# Generate native Android project
npm run prebuild
```

### iOS Development

```bash
# Build and run on iOS simulator
npm run ios

# Start iOS simulator only
npm run ios:simulator
```

### General Commands

```bash
# Run linter
npm run lint

# Run tests
npm test

# Build for production (EAS)
npm run build:ios
npm run build:android
```

---

## ROAST AI PERSONA

The tone of all generated messages must be:
- **High-Stakes**: No second chances
- **Brutally Honest**: Call out excuses
- **Sovereign**: No soft corporate language

Example:
```
"NO EXCUSES. YOUR SQUAD IS COUNTING ON YOU."
"BIOMETRIC SYNC FAILED. MANUAL ENTRY = WEAK."
```

---

## FIREBASE SCHEMA (Shared with Web)

### Collections

#### `vouches`
```typescript
{
  userId: string;
  workoutData: {
    type: 'running' | 'cycling' | 'strength' | 'other';
    duration: number;      // minutes
    calories: number;
    distance?: number;     // meters
    heartRate?: number;    // avg BPM
    verified: boolean;     // true if biometric
    source: 'healthkit' | 'googlefit' | 'manual';
  };
  photoUrl?: string;
  timestamp: Timestamp;
}
```

#### `squads` (TODO)
```typescript
{
  name: string;
  members: string[];     // user IDs
  createdAt: Timestamp;
}
```

---

## NEXT STEPS

- [ ] Implement Google Fit integration (Android)
- [ ] Create Squad management screens
- [ ] Build Roast Feed with AI persona
- [ ] Add push notifications for accountability
- [ ] Implement streak tracking
- [ ] Create leaderboard view

---

## TROUBLESHOOTING

### HealthKit not working on iOS
1. Ensure `NSHealthShareUsageDescription` is in `app.json`
2. Check simulator has Health app enabled
3. Verify permissions in device Settings > Privacy > Health

### Camera not working
1. Check permissions in `app.json`
2. Verify `expo-camera` plugin is installed
3. Restart dev server after permission changes

### Privy login failing
1. Verify `EXPO_PUBLIC_PRIVY_APP_ID` is set
2. Check Privy dashboard for mobile app configuration
3. Ensure network connectivity

---

**FRICTION IS THE ENEMY. ACCOUNTABILITY IS THE PRODUCT.**
