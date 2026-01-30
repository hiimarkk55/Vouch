# ANDROID STUDIO QUICK START
> Get VOUCH running on Android emulator in 15 minutes

## PREREQUISITES CHECK

```bash
# Verify installations
node --version          # Should be v20.x
npm --version           # Should be 10.x
echo $ANDROID_HOME      # Should show Android SDK path
adb --version           # Should show Android Debug Bridge version
```

If any command fails, see `ANDROID_STUDIO_SETUP.md` for full installation guide.

---

## STEP 1: CREATE EMULATOR (ONE-TIME SETUP)

1. Open Android Studio
2. Tools → Device Manager → Create Device
3. Select: **Pixel 7 Pro**
4. System Image: **API Level 35 (Android 14)**
5. AVD Name: `Vouch_Test_Device`
6. Advanced Settings:
   - RAM: 4096 MB
   - Graphics: Hardware - GLES 2.0
7. Click Finish

---

## STEP 2: INSTALL DEPENDENCIES

```bash
cd /home/user/Vouch/mobile

# Install Node modules
npm install

# Verify expo CLI
npx expo --version
```

---

## STEP 3: CONFIGURE ENVIRONMENT

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

Required variables:
- `EXPO_PUBLIC_PRIVY_APP_ID` - From https://dashboard.privy.io
- `EXPO_PUBLIC_FIREBASE_*` - From Firebase Console

Set `EXPO_PUBLIC_MOCK_BIOMETRICS=true` for emulator testing.

---

## STEP 4: START EMULATOR

**Option A: From Android Studio**
- Tools → Device Manager → Play button on `Vouch_Test_Device`

**Option B: From Terminal**
```bash
npm run emulator
```

Wait for emulator to fully boot (~30 seconds).

Verify:
```bash
adb devices
# Should show: emulator-5554    device
```

---

## STEP 5: BUILD AND RUN APP

**First Time (Initial Build - Takes 5-10 minutes):**
```bash
npm run android
```

This will:
1. Generate native Android project in `android/` folder
2. Build debug APK
3. Install on emulator
4. Start Metro bundler
5. Launch app

**Subsequent Runs (Fast):**
```bash
npm start           # Start Metro bundler
# Then press 'a' to open on Android
```

---

## STEP 6: VERIFY APP IS RUNNING

You should see:
- ✓ VOUCH splash screen (black background)
- ✓ Terminal-style login screen
- ✓ Neon cyan (#00FFFF) text
- ✓ Space Mono font

Test:
- Press `Cmd/Ctrl + M` to open Dev Menu
- Select "Reload" to test hot reloading

---

## DAILY DEVELOPMENT WORKFLOW

```bash
# Terminal 1: Start emulator (if not already running)
npm run emulator

# Terminal 2: Start dev server
npm start

# Press 'a' to launch on Android
# Or run: npm run android
```

**Dev Menu shortcuts:**
- `Cmd/Ctrl + M` - Open menu
- `R` (in terminal) - Reload
- `D` (in terminal) - Open DevTools

---

## TESTING VOUCH FEATURES

### Camera (Proof-of-Work Photos)
```bash
# Push test image to emulator
adb push test-workout.jpg /sdcard/Pictures/
```

### Location (Gym Check-ins)
```bash
# Set GPS coordinates
adb emu geo fix -122.084 37.4219
```

### Biometric Data
Emulator uses mock data when `EXPO_PUBLIC_MOCK_BIOMETRICS=true`.
For real Google Fit testing, use physical Android device.

### Logs
```bash
# React Native logs only
npm run logcat

# All Android logs
adb logcat

# Filter for errors
adb logcat *:E
```

---

## COMMON ISSUES & FIXES

### Emulator won't start
```bash
# Check virtualization
emulator -accel-check

# Linux: Enable KVM
sudo apt install qemu-kvm
sudo usermod -aG kvm $USER
# Log out and back in
```

### "Unable to connect to development server"
```bash
# Reverse port
adb reverse tcp:8081 tcp:8081

# Restart Metro
npm start -- --reset-cache
```

### App crashes on launch
```bash
# Clear app data
adb shell pm clear io.vouch.mobile

# Rebuild
npm run android
```

### Build errors
```bash
# Clean build
npm run android:clean
rm -rf node_modules
npm install
npm run android
```

---

## DEVELOPMENT BUILD vs EXPO GO

**You're using Development Build (Recommended for VOUCH)**

| Feature | Development Build | Expo Go |
|---------|------------------|---------|
| Camera | ✓ Full access | ✗ Limited |
| Biometrics | ✓ Native modules | ✗ Not supported |
| Performance | ✓ Production-like | ✗ Slower |
| Custom native code | ✓ Supported | ✗ Restricted |

Development builds take longer to create (first build only), but provide full native functionality.

---

## FILE STRUCTURE AFTER BUILD

```
mobile/
├── android/              # Generated native project
│   ├── app/
│   ├── build.gradle
│   └── gradlew
├── src/                  # Your React Native code
├── app.json              # Expo config
├── package.json          # Dependencies + scripts
└── .env                  # Environment variables
```

The `android/` folder is auto-generated. Don't manually edit unless necessary.

---

## PERFORMANCE TIPS

1. **Enable Fast Refresh**: Dev Menu → "Fast Refresh"
2. **Use terminal reload**: Press `R` instead of tapping "Reload"
3. **Close other apps**: Emulator performs better with more RAM
4. **Use x86_64 image**: Faster than ARM on Intel/AMD processors
5. **Increase emulator RAM**: Edit AVD → 6GB+ if you have 16GB+ system RAM

---

## NEXT STEPS

Once app is running:

1. Test authentication flow (Privy login)
2. Verify dark mode theme (pure black + cyan)
3. Test camera capture
4. Check terminal aesthetic on all screens
5. Validate Firebase connectivity

See `ANDROID_STUDIO_SETUP.md` for detailed troubleshooting and advanced configuration.

---

**TERMINAL AESTHETIC CHECK:**
- [ ] Background: Pure black (#000000)
- [ ] Text: Neon cyan (#00FFFF)
- [ ] Font: Space Mono (monospace)
- [ ] UI: Command-line style prompts

**VOUCH MISSION: <10 second interactions. Zero friction. Real accountability.**
