# ANDROID STUDIO SETUP GUIDE
> Testing VOUCH Mobile App on Android Studio Emulator

## 01 // OVERVIEW

This guide will help you set up Android Studio emulator for testing the VOUCH mobile app. We use **Expo Dev Client** instead of Expo Go for better native module support (camera, biometrics, etc.).

**Why Android Studio over Expo Go?**
- ✓ Full access to native modules (HealthKit, Google Fit, Camera)
- ✓ Test actual app performance
- ✓ Debug native code issues
- ✓ Match production environment
- ✓ No Expo Go limitations

---

## 02 // PREREQUISITES

### Required Software

1. **Android Studio** (Latest version)
   - Download: https://developer.android.com/studio
   - Includes: Android SDK, Emulator, Build Tools

2. **Node.js 20.x**
   ```bash
   node --version  # Should be v20.19.4 or similar
   ```

3. **EAS CLI** (Expo Application Services)
   ```bash
   npm install -g eas-cli
   ```

4. **Expo Account**
   ```bash
   eas login
   ```

---

## 03 // ANDROID STUDIO INSTALLATION

### Step 1: Install Android Studio

1. Download Android Studio from: https://developer.android.com/studio
2. Run the installer and follow the setup wizard
3. Choose "Standard" installation type
4. Install Android SDK and Android Virtual Device (AVD)

### Step 2: Install Android SDK Components

Open Android Studio → Settings/Preferences → Appearance & Behavior → System Settings → Android SDK

**Install these SDK Platforms:**
- ✓ Android 14.0 (API Level 35) - *Required for VOUCH*
- ✓ Android 13.0 (API Level 33)
- ✓ Android 12.0 (API Level 31)

**Install these SDK Tools:**
- ✓ Android SDK Build-Tools 35.0.0
- ✓ Android Emulator
- ✓ Android SDK Platform-Tools
- ✓ Android SDK Command-line Tools
- ✓ Google Play services

### Step 3: Configure Environment Variables

Add to your `~/.bashrc`, `~/.zshrc`, or `~/.profile`:

```bash
# Android SDK
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Apply changes:
```bash
source ~/.bashrc  # or ~/.zshrc
```

Verify:
```bash
echo $ANDROID_HOME
adb --version
```

---

## 04 // CREATE ANDROID VIRTUAL DEVICE (AVD)

### Step 1: Open AVD Manager

Android Studio → Tools → Device Manager → Create Device

### Step 2: Choose Device

**Recommended:** Pixel 7 Pro (or any recent Pixel device)
- Reason: Good performance, modern sensors, representative of real devices

### Step 3: Select System Image

- **API Level**: 35 (Android 14.0)
- **Target**: Google APIs (includes Play Store)
- **ABI**: x86_64 (faster on most computers)

Click "Download" if not already installed.

### Step 4: Configure AVD

**AVD Name**: `Vouch_Test_Device`

**Advanced Settings:**
- RAM: 4096 MB (or more)
- VM Heap: 512 MB
- Internal Storage: 6 GB
- SD Card: 512 MB
- Graphics: Hardware - GLES 2.0

**Enable these sensors:**
- ✓ Accelerometer
- ✓ GPS
- ✓ Camera (front and back)

Click "Finish"

---

## 05 // BUILD DEVELOPMENT CLIENT

The VOUCH app uses **Expo Dev Client** for development. This requires a one-time build.

### Option A: Local Build (Faster, Recommended)

```bash
cd /home/user/Vouch/mobile

# Install dependencies (if not already done)
npm install

# Build development client for Android emulator
npx expo run:android
```

This will:
1. Generate native Android project in `android/` folder
2. Build debug APK
3. Install on running emulator
4. Start Metro bundler

**First build takes 5-10 minutes. Subsequent builds are faster.**

### Option B: EAS Build (Cloud-based)

```bash
cd /home/user/Vouch/mobile

# Build development APK in the cloud
eas build --profile development --platform android

# Download the .apk file when complete
# Install on emulator:
adb install path/to/vouch-mobile.apk
```

---

## 06 // RUNNING THE APP

### Step 1: Start Android Emulator

**From Android Studio:**
- Tools → Device Manager → Select your AVD → Play button

**From Command Line:**
```bash
emulator -avd Vouch_Test_Device
```

Verify emulator is running:
```bash
adb devices
# Should show: emulator-5554    device
```

### Step 2: Start Development Server

```bash
cd /home/user/Vouch/mobile

# Start Expo dev server
npm start

# Or start with Android directly
npm run android
```

### Step 3: Launch App on Emulator

If app is already installed:
- Open the VOUCH app from the emulator's app drawer
- App will connect to dev server automatically

If not installed, from terminal:
```bash
npx expo run:android
```

---

## 07 // DEVELOPMENT WORKFLOW

### Hot Reloading

Changes to your code will automatically reload in the emulator:
- **Fast Refresh**: Edit any component, see changes instantly
- **Full Reload**: Shake device (in emulator) → "Reload"

### Opening Dev Menu

**In Emulator:**
- Press `Cmd/Ctrl + M` (or shake device)
- Options: Reload, Debug, Element Inspector, Performance Monitor

**From Terminal:**
```bash
adb shell input keyevent 82
```

### Debug Options

1. **React Native Debugger**
   - Dev Menu → "Debug Remote JS"
   - Opens Chrome DevTools

2. **React DevTools**
   ```bash
   npx react-devtools
   ```

3. **Logcat (Native Logs)**
   ```bash
   adb logcat *:S ReactNative:V ReactNativeJS:V
   ```

4. **Network Inspector**
   - Dev Menu → "Toggle Inspector"
   - Tap any element to inspect

---

## 08 // TESTING VOUCH FEATURES

### Camera Testing

The emulator can simulate camera:
1. Dev Menu → Settings → Camera
2. Upload sample image or use virtual scene

For VOUCH proof-of-work photos:
```bash
# Push test image to emulator
adb push test-workout.jpg /sdcard/Pictures/
```

### Location Testing

```bash
# Set GPS coordinates (gym location)
adb emu geo fix -122.084 37.4219
```

### Google Fit Simulation

Currently, Google Fit doesn't work in emulator. For testing:
1. Use mock data in `mobile/src/hooks/useBiometricSync.ts`
2. Test manual entry flow
3. Test on physical device for real Google Fit integration

### Biometric Testing

Emulator doesn't support HealthKit/Google Fit sensors. Options:
1. **Mock Mode**: Set `__DEV__` flag to return test data
2. **Physical Device**: Required for real biometric testing

---

## 09 // OPTIMIZATIONS FOR ANDROID STUDIO

### Updated package.json Scripts

```json
{
  "scripts": {
    "start": "npx expo start",
    "android": "npx expo run:android",
    "android:release": "npx expo run:android --variant release",
    "ios": "npx expo run:ios",
    "android:clean": "cd android && ./gradlew clean && cd ..",
    "android:build": "cd android && ./gradlew assembleDebug && cd ..",
    "emulator": "emulator -avd Vouch_Test_Device",
    "logcat": "adb logcat *:S ReactNative:V ReactNativeJS:V"
  }
}
```

### App Performance Settings

For faster development in Android Studio, update `app.json`:

```json
{
  "expo": {
    "android": {
      "enableProguardInReleaseBuilds": false,
      "enableShrinkResourcesInReleaseBuilds": false
    }
  }
}
```

---

## 10 // TROUBLESHOOTING

### Issue: Emulator won't start

```bash
# Check if HAXM/KVM is enabled
emulator -accel-check

# Linux: Enable KVM
sudo apt install qemu-kvm
sudo usermod -aG kvm $USER
```

### Issue: "Unable to resolve module"

```bash
cd /home/user/Vouch/mobile
rm -rf node_modules
npm install
npm start -- --reset-cache
```

### Issue: App crashes on launch

```bash
# Clear app data
adb shell pm clear io.vouch.mobile

# Rebuild
npx expo run:android
```

### Issue: Metro bundler connection failed

```bash
# Reverse port 8081 to emulator
adb reverse tcp:8081 tcp:8081

# Restart dev server
npm start
```

### Issue: Build fails with SDK version error

Ensure `ANDROID_SDK_VERSION=35` is set:
```bash
echo $ANDROID_HOME
# Should show: /home/user/Android/Sdk

# Verify SDK 35 is installed
$ANDROID_HOME/tools/bin/sdkmanager --list | grep "system-images;android-35"
```

---

## 11 // QUICK REFERENCE

### Essential Commands

```bash
# Start everything
npm run emulator     # Terminal 1: Start emulator
npm start            # Terminal 2: Start dev server
npm run android      # Terminal 3: Build and run

# Debug
npm run logcat       # View React Native logs
adb logcat           # View all Android logs
adb shell            # Enter emulator shell

# Clean build
npm run android:clean
rm -rf android/build android/app/build
npm run android

# Install APK
adb install -r path/to/app.apk

# Uninstall
adb uninstall io.vouch.mobile

# Screenshot
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Dev Menu | Cmd/Ctrl + M |
| Reload | R (in terminal) |
| Element Inspector | Cmd/Ctrl + Shift + I |
| Performance Monitor | Cmd/Ctrl + Shift + P |

---

## 12 // NEXT STEPS

After setup is complete:

1. ✓ Test terminal-style login screen
2. ✓ Verify Privy authentication flow
3. ✓ Test camera capture for proof-of-work
4. ✓ Validate Firebase writes
5. ✓ Test manual workout entry (biometric will be mock data)
6. ✓ Verify dark mode theme (#000000 background, #00FFFF text)

---

## 13 // PRODUCTION BUILD TESTING

To test a build closer to production:

```bash
# Build release APK locally
npx expo run:android --variant release

# Or via EAS
eas build --profile preview --platform android
```

Install and test on emulator:
```bash
adb install app-release.apk
```

---

**REMEMBER**: Emulator is for UI/UX testing. For real biometric testing (Google Fit, HealthKit), use physical devices.

**VOUCH Terminal Aesthetic Check**: Every screen should feel like a command-line interface. Pure black background, cyan text, monospace fonts only.
