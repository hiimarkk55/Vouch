# VOUCH // INSTALLATION GUIDE

Step-by-step setup instructions for the VOUCH mobile app.

---

## PREREQUISITES

- **Node.js**: v18+ ([download](https://nodejs.org/))
- **npm**: v9+ (comes with Node.js)
- **iOS**: macOS with Xcode 14+ (for iOS development)
- **Android**: Android Studio (for Android development)
- **Expo CLI**: Installed globally

```bash
npm install -g expo-cli
```

---

## STEP 1: CLONE & NAVIGATE

```bash
cd /path/to/Vouch/mobile
```

---

## STEP 2: INSTALL DEPENDENCIES

```bash
npm install
```

This will install:
- React Native + Expo (SDK 54)
- NativeWind (Tailwind for mobile)
- Privy Mobile SDK
- Firebase
- React Native Health (HealthKit)
- Camera & navigation dependencies

**Expected time**: 2-3 minutes

---

## STEP 3: DOWNLOAD FONTS

Download **Space Mono** font:

1. Visit [Google Fonts - Space Mono](https://fonts.google.com/specimen/Space+Mono)
2. Click "Download family"
3. Extract the ZIP
4. Copy these files to `mobile/assets/fonts/`:
   - `SpaceMono-Regular.ttf`
   - `SpaceMono-Bold.ttf`

```bash
# Verify fonts are in place
ls assets/fonts/
# Should show: README.md, SpaceMono-Regular.ttf, SpaceMono-Bold.ttf
```

---

## STEP 4: CONFIGURE FIREBASE

### 4.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it `vouch-app` (or your preference)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 4.2 Add iOS App

1. In Firebase project, click iOS icon
2. **Bundle ID**: `io.vouch.mobile`
3. Download `GoogleService-Info.plist`
4. **Don't add to project yet** - just note the config values

### 4.3 Add Android App

1. Click Android icon
2. **Package name**: `io.vouch.mobile`
3. Download `google-services.json`
4. **Don't add to project yet** - just note the config values

### 4.4 Enable Firestore

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose a location (e.g., `us-central1`)

### 4.5 Enable Storage

1. Go to **Storage**
2. Click "Get started"
3. Use default security rules for now

---

## STEP 5: CONFIGURE PRIVY

### 5.1 Create Privy App

1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Create a new app (or use existing)
3. Copy your **App ID** (starts with `cl...`)

### 5.2 Enable Mobile SDK

1. In Privy Dashboard, go to **Settings**
2. Enable **Mobile SDK**
3. Add allowed bundle IDs:
   - iOS: `io.vouch.mobile`
   - Android: `io.vouch.mobile`

---

## STEP 6: ENVIRONMENT VARIABLES

Create `.env` file in `mobile/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Privy
EXPO_PUBLIC_PRIVY_APP_ID=clxxxxxxxxxxxxxxxxxx

# Firebase (from Firebase Console)
EXPO_PUBLIC_FIREBASE_PROJECT_ID=vouch-app-xxxxx
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=vouch-app-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=vouch-app-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Where to find these values**:
- Privy App ID: Privy Dashboard > Settings
- Firebase values: Firebase Console > Project Settings > General > Your apps

---

## STEP 7: RUN THE APP

### Option A: Expo Go (Quick Start)

```bash
npm start
```

1. Scan QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app
2. App opens in Expo Go

**Limitations**:
- HealthKit won't work (requires native build)
- Camera may have issues

### Option B: Development Build (Recommended)

For full functionality (HealthKit, Camera, etc.):

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas login
eas build:configure

# Build for iOS
eas build --profile development --platform ios

# Build for Android
eas build --profile development --platform android
```

1. Download the build to your device
2. Install it
3. Run `npm start` and connect

---

## STEP 8: VERIFY SETUP

### Checklist

- [ ] App launches without errors
- [ ] Terminal-style login screen appears
- [ ] "CONNECT WALLET" button is visible
- [ ] Can tap login button (Privy modal opens)
- [ ] After login, camera screen is accessible
- [ ] Camera permission prompt appears
- [ ] Can capture photo

### Test Biometric Sync (iOS Only)

1. Open Apple Health app
2. Add a workout (e.g., run for 30 minutes)
3. Open VOUCH mobile app
4. Go to camera screen
5. Capture proof-of-work photo
6. Check console logs for HealthKit data

```bash
# View logs
npx expo start --dev-client
# Logs will show biometric sync results
```

---

## TROUBLESHOOTING

### "Module not found: expo-router"

```bash
npm install expo-router@~4.0.14
npx expo install expo-router
```

### "NativeWind not working"

1. Check `babel.config.js` has `nativewind/babel`
2. Clear cache: `npx expo start -c`

### "HealthKit permissions denied"

1. Go to iOS Settings > Privacy > Health
2. Find VOUCH app
3. Enable all permissions

### "Camera not working"

1. Check `app.json` has camera permissions
2. Rebuild app: `eas build --profile development --platform ios`
3. Reinstall app on device

### "Firebase initialization failed"

1. Verify `.env` file exists
2. Check all `EXPO_PUBLIC_FIREBASE_*` vars are set
3. Restart dev server: `npx expo start -c`

---

## NEXT STEPS

After successful installation:

1. **Read documentation**:
   - `README.md` - Architecture overview
   - `BIOMETRIC_SYNC.md` - HealthKit integration
   - `WEB_INTEGRATION.md` - Web + mobile sync

2. **Set up Firebase Security Rules**:
   - Go to Firebase Console > Firestore > Rules
   - Copy rules from `WEB_INTEGRATION.md`

3. **Configure web project**:
   - Add Firebase to web app (see `WEB_INTEGRATION.md`)
   - Use same Privy App ID
   - Test cross-platform sync

4. **Start building**:
   - Create squad dashboard screen
   - Implement roast feed
   - Add push notifications

---

## DEVELOPMENT WORKFLOW

```bash
# Start dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Clear cache and restart
npx expo start -c

# View logs
npx react-native log-ios      # iOS
npx react-native log-android  # Android
```

---

## DEPLOYMENT

### iOS (App Store)

```bash
# Production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Android (Play Store)

```bash
# Production build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

---

## SUPPORT

- **Issues**: File on GitHub
- **CLAUDE.md**: Reference for conventions
- **Privy Docs**: https://docs.privy.io/
- **Expo Docs**: https://docs.expo.dev/

---

**YOU'RE READY. NOW BUILD SOMETHING BRUTAL.**
