# Android Emulator Troubleshooting Guide (Windows)

## Quick Reference

Most emulator connection issues can be fixed with:

```cmd
adb kill-server && adb start-server
```

---

## Common Issues & Solutions

### Issue 1: "cannot connect to 127.0.0.1:5554"

**Cause**: ADB server isn't running or emulator isn't started properly.

**Solution**:
```cmd
# Step 1: Restart ADB
adb kill-server
adb start-server

# Step 2: Check devices
adb devices

# Step 3: If no devices, start emulator manually
emulator -list-avds
emulator -avd <YOUR_AVD_NAME>

# Step 4: Wait for boot, then verify
adb devices
# Should show: emulator-5554    device

# Step 5: Run Expo
cd C:\Users\markp\Documents\Vouch\mobile
npx expo start --android
```

---

### Issue 2: Port 5554 Already in Use

**Symptoms**: Error mentions port conflict or "address already in use"

**Solution**:
```cmd
# Find process using port 5554
netstat -ano | findstr :5554

# Note the PID (last column), then kill it
taskkill /PID <PID_NUMBER> /F

# Restart ADB
adb kill-server
adb start-server
```

---

### Issue 3: Emulator Won't Start

**Symptoms**: `emulator -avd` command hangs or fails

**Solution**:
```cmd
# Option A: Use Android Studio
1. Open Android Studio
2. Click "Device Manager" (right sidebar)
3. Start emulator from there

# Option B: Start with verbose logging
emulator -avd <YOUR_AVD_NAME> -verbose

# Option C: Start without snapshot
emulator -avd <YOUR_AVD_NAME> -no-snapshot-load

# Option D: Check ANDROID_HOME is set
echo %ANDROID_HOME%
# Should show: C:\Users\<username>\AppData\Local\Android\Sdk

# If not set:
setx ANDROID_HOME "C:\Users\markp\AppData\Local\Android\Sdk"
```

---

### Issue 4: "device offline" in adb devices

**Symptoms**: `adb devices` shows emulator but status is "offline"

**Solution**:
```cmd
# Restart ADB in root mode
adb kill-server
adb root
adb start-server

# Or restart the emulator
adb reboot
```

---

## Recommended Workflow

### Option A: Use Expo Start (Easiest)

```cmd
cd C:\Users\markp\Documents\Vouch\mobile

# Start Expo dev server
npx expo start

# Wait for QR code to appear, then press 'a' for Android
# Expo will automatically start the emulator if needed
```

### Option B: Pre-Start Emulator (Most Reliable)

```cmd
# Terminal 1: Start emulator
emulator -avd Medium_Phone_API_36

# Wait for emulator to fully boot (30-60 seconds)
# You should see the Android home screen

# Terminal 2: Run Expo
cd C:\Users\markp\Documents\Vouch\mobile
npx expo start --android
```

### Option C: Use npm Scripts

```cmd
cd C:\Users\markp\Documents\Vouch\mobile

# Start emulator (if you have one configured)
npm run emulator

# In another terminal
npm run android
```

---

## Verification Commands

```cmd
# Check ADB is running
adb version

# List available emulators
emulator -list-avds

# Check connected devices
adb devices
# Expected output:
# List of devices attached
# emulator-5554    device

# Check emulator name
adb -s emulator-5554 emu avd name

# View Android logs (helpful for debugging)
npm run logcat
```

---

## Environment Setup

### Required Environment Variables

```cmd
# Android SDK
ANDROID_HOME=C:\Users\markp\AppData\Local\Android\Sdk

# Add to PATH
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

### Verify Setup

```cmd
# Check paths
echo %ANDROID_HOME%
adb version
emulator -version

# If any command fails, update PATH
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator"
```

---

## Nuclear Option: Full Reset

If nothing works, try a complete reset:

```cmd
# 1. Close all emulators and Android Studio

# 2. Kill all ADB processes
taskkill /F /IM adb.exe

# 3. Delete ADB server cache
rd /s /q "%USERPROFILE%\.android\adbkey"
rd /s /q "%USERPROFILE%\.android\adbkey.pub"

# 4. Restart ADB
adb kill-server
adb start-server

# 5. Cold boot emulator (slower but more reliable)
emulator -avd Medium_Phone_API_36 -no-snapshot-load -wipe-data

# 6. Run Expo
npx expo start --android
```

---

## React Native Version Warning

If you see:
```
› Using react-native@0.76.6 instead of recommended react-native@0.81.5
```

**This is usually OK** - Expo SDK 54 uses React Native 0.76.x by default.

To verify and fix dependencies:
```cmd
npx expo install --check
npx expo install --fix
```

---

## Performance Tips

### Speed Up Emulator Boot

1. **Use Android Studio**: Device Manager → Settings → Enable "Quick Boot"
2. **Increase RAM**: AVD Manager → Edit Device → Advanced Settings → RAM: 4096 MB
3. **Enable Hardware Acceleration**:
   - Intel: Enable HAXM
   - AMD: Enable WHPX (Windows Hypervisor Platform)

### Reduce Expo Build Time

```cmd
# Use development build (faster)
npx expo run:android --variant debug

# Skip prebuild if already done
npx expo start --android --no-install
```

---

## Common Error Messages

### "No Android connected device found"
→ Start emulator first, wait for boot, then run Expo

### "SDK location not found"
→ Create `mobile/android/local.properties`:
```
sdk.dir=C:\\Users\\markp\\AppData\\Local\\Android\\Sdk
```

### "Gradle build failed"
→ Clean and rebuild:
```cmd
cd android
gradlew clean
cd ..
npx expo run:android
```

### "INSTALL_FAILED_INSUFFICIENT_STORAGE"
→ Wipe emulator data:
```cmd
emulator -avd <YOUR_AVD_NAME> -wipe-data
```

---

## Support Resources

- [Expo Android Setup](https://docs.expo.dev/workflow/android-studio-emulator/)
- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Android Studio Emulator Docs](https://developer.android.com/studio/run/emulator)

---

## Quick Checklist

Before asking for help, verify:

- [ ] Android Studio installed with SDK
- [ ] Environment variables set (`ANDROID_HOME`, `PATH`)
- [ ] At least one AVD created in Android Studio
- [ ] ADB is running (`adb devices` works)
- [ ] Emulator can start manually (`emulator -avd <name>`)
- [ ] `package-lock.json` exists (`npm install` completed)
- [ ] Expo CLI is up to date (`npm install -g expo-cli`)

---

**Remember**: The emulator takes 30-60 seconds to boot. Always wait for the Android home screen before running Expo commands.
