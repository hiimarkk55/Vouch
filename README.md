# VOUCH // SOCIAL ACCOUNTABILITY ENGINE

> **High-stakes accountability through biometric verification and brutal honesty.**

![Status](https://img.shields.io/badge/status-alpha-orange)
![Web](https://img.shields.io/badge/web-Next.js%2016-black)
![Mobile](https://img.shields.io/badge/mobile-React%20Native-blue)
![Auth](https://img.shields.io/badge/auth-Privy.io-cyan)

---

## THE MISSION

**Friction is the enemy. Accountability is the product.**

VOUCH eliminates excuses through:
- **Biometric Verification**: HealthKit/Google Fit proves workouts are real
- **Social Pressure**: Squads hold each other accountable
- **Brutal Honesty**: AI roasts eliminate soft language
- **Zero Friction**: Every interaction under 10 seconds

---

## ARCHITECTURE

### 🌐 Web Platform (Next.js)
Squad management, roast feed, and manifesto display.

**Location**: `/` (root directory)

**Tech**: Next.js 16, Tailwind CSS 4, Privy.io, Firebase

**Features**: Wallet auth, Squad dashboard, Roast feed, Manual workout entry

### 📱 Mobile App (React Native + Expo)
Daily workout logging with biometric proof-of-work.

**Location**: `/mobile`

**Tech**: React Native + Expo, NativeWind, Privy Mobile SDK, HealthKit, Firebase

**Features**: Terminal-style login, Proof-of-work camera, HealthKit sync, Photo upload

**Status**: ✓ Initialized (see `/mobile/README.md`)

---

## QUICK START

### Web Development

```bash
npm install
cp .env.example .env.local  # Add your Privy App ID
npm run dev                  # Open http://localhost:3000
```

### Mobile Development

```bash
cd mobile
npm install
cp .env.example .env         # Add Privy + Firebase credentials
npm start                    # Press 'i' for iOS or 'a' for Android
```

**Full mobile setup**: See `/mobile/INSTALLATION.md`

---

## BIOMETRIC SYNC (Core Feature)

All mobile vouches attempt biometric verification FIRST:

```
1. User completes workout → Records in HealthKit/Google Fit
2. User opens VOUCH → Captures proof-of-work photo
3. App syncs biometric data (5s timeout)
4. IF SUCCESS: ✓ verified: true, high credibility
5. IF FAILED: ✗ verified: false, user gets roasted
```

**Implementation**: `mobile/src/hooks/useBiometricSync.ts`

**Deep Dive**: See `mobile/BIOMETRIC_SYNC.md`

---

## DOCUMENTATION

- 🚀 **Setup Guides**: `/mobile/INSTALLATION.md`, `CLAUDE.md`
- 🏗️ **Architecture**: `/mobile/BIOMETRIC_SYNC.md`, `/mobile/WEB_INTEGRATION.md`
- 📁 **Structure**: `/mobile/STRUCTURE.md`, `MOBILE_INIT_SUMMARY.md`

---

## DEVELOPMENT COMMANDS

**Web**:
```bash
npm run dev      # Start Next.js dev server
npm run build    # Build for production
npm run lint     # Run ESLint
```

**Mobile**:
```bash
cd mobile
npm start        # Start Expo dev server
npm run ios      # Run on iOS simulator
npm run android  # Run on Android emulator
```

---

## TERMINAL AESTHETIC

- **Colors**: Neon Cyan (#00FFFF) on Pure Black (#000000)
- **Fonts**: Geist Mono (web), Space Mono (mobile)
- **Style**: Command-line interface feel

```
> AUTHENTICATE TO CONTINUE
[✓] BIOMETRIC SYNC: READY
// NO EXCUSES. YOUR SQUAD IS COUNTING ON YOU.
```

---

## TECH STACK

| Component | Technology |
|-----------|------------|
| Web Framework | Next.js 16 |
| Mobile Framework | React Native + Expo |
| Styling | Tailwind CSS 4, NativeWind |
| Authentication | Privy.io (Web + Mobile) |
| Database | Firebase Firestore |
| Biometrics | Apple HealthKit, Google Fit |
| Language | TypeScript (strict mode) |

---

## ROADMAP

### Phase 1: Foundation ✓
- [x] Web platform with Privy auth
- [x] Mobile app with HealthKit sync
- [x] Firebase integration
- [x] Terminal UI

### Phase 2: Core Features
- [ ] Google Fit (Android)
- [ ] Squad dashboard
- [ ] AI roast feed
- [ ] Push notifications

### Phase 3: Scale
- [ ] Leaderboards
- [ ] Wearable integrations
- [ ] Real-time updates

---

**FRICTION IS THE ENEMY. ACCOUNTABILITY IS THE PRODUCT.**
