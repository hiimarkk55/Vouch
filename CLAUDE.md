# VOUCH // SYSTEM CONFIG
> Role: Senior Lead Engineer (Full-Stack & Mobile Architecture)
> Focus: High-stakes accountability, Biometric verification, Cyber-terminal UI.

## 01 // PROJECT OVERVIEW

VOUCH is a **Social Accountability Engine** that combines:
- **Web Platform** (Next.js) - Squad management, roast feed, manifesto
- **Mobile App** (React Native + Expo) - Daily workout logging with biometric proof

**Mission**: Eliminate friction in accountability. Every interaction <10 seconds.

---

## 02 // TECH STACK

### Web Platform
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Identity**: Privy.io (Web SDK)
- **Database**: Firebase Firestore
- **Theme**: Dark mode only. Primary: #00FFFF (Neon Cyan), Secondary: #000000.

### Mobile App
- **Framework**: React Native + Expo (SDK 54+)
- **Styling**: NativeWind (Tailwind for Mobile)
- **Identity**: Privy.io (Mobile SDK)
- **Database**: Firebase (Shared with web)
- **Biometrics**: Apple HealthKit + Google Fit
- **Theme**: Dark mode only. Primary: #00FFFF (Neon Cyan), Secondary: #000000.

---

## 03 // PROJECT ARCHITECTURE

### Web Project (`/`)
- `/src/app`: Next.js App Router pages
- `/src/components`: UI components (LandingPage, Manifesto, RoastFeed, etc.)
- `/src/auth`: Privy authentication wrapper
- `/src/squads`: Squad dashboard and management
- `/src/firebase`: Firebase config (TODO)

### Mobile Project (`/mobile`)
- `/src/components`: UI components (Atomic design)
- `/src/screens`: Main view logic (Squad, Roast, Vouch, Identity)
- `/src/hooks`: Biometric and Auth hooks
- `/src/constants`: Theme and global config
- `/src/services`: Firebase and vouch services
- `/src/navigation`: React Navigation setup

---

## 04 // CORE CONVENTIONS & RULES

### Universal Rules (Web + Mobile)
- **Dark Mode Only**: Pure black (#000000) background, neon cyan (#00FFFF) accents
- **Monospace Fonts**: Web uses Geist Mono, Mobile uses Space Mono
- **Terminal Aesthetic**: All text should feel like command-line interface
- **Roast AI Persona**: Brutally honest, high-stakes, no soft corporate language
- **Performance**: No file should exceed 250 lines. Use sub-agents for complex refactors.

### Mobile-Specific Rules
- **Biometric Priority**: All "Vouches" MUST attempt to sync with Apple HealthKit or Google Fit before falling back to manual entry.
- **10-Second Rule**: Every interaction must complete in under 10 seconds
- **UI Aesthetic**: Every screen must feel like a "Terminal Command"
- **Photo Proof Required**: All workout vouches require photo evidence

### Web-Specific Rules
- **Manual Entry**: Web vouches are marked as `verified: false`
- **Squad Management**: Web is primary interface for creating/managing squads
- **Roast Feed**: AI-generated roasts display on web dashboard

---

## 05 // BIOMETRIC SYNC ARCHITECTURE

**CRITICAL**: This is the core differentiator of VOUCH.

### Priority Cascade
```
1. ATTEMPT BIOMETRIC SYNC (iOS: HealthKit, Android: Google Fit)
   ├── Timeout: 5 seconds
   └── Fetch: workout type, duration, calories, HR, distance

2. IF SUCCESS:
   ✓ Create VERIFIED vouch (verified: true)
   ✓ source: 'healthkit' or 'googlefit'
   ✓ High credibility in squad

3. IF FAILED:
   ✗ Fallback to manual entry
   ✗ verified: false, source: 'manual'
   ✗ User gets roasted by AI
   ✗ Lower credibility score
```

### HealthKit Integration (iOS)
- **Permissions**: Workout data, heart rate, distance, active energy
- **Data Extracted**: Type, duration, calories, distance, avg HR, timestamps
- **Implementation**: `mobile/src/hooks/useBiometricSync.ts`

### Google Fit Integration (Android)
- **Status**: TODO
- **Required**: Activity Recognition permission, Fitness API setup
- **Implementation**: `mobile/src/hooks/useBiometricSync.ts` (placeholder exists)

---

## 06 // FIREBASE SCHEMA (Shared Database)

Both web and mobile use the **same Firebase project**.

### Collections

#### `users`
```typescript
{
  privyId: string;          // From Privy (same on web + mobile)
  walletAddress?: string;   // If using wallet login
  displayName?: string;
  createdAt: Timestamp;
  stats: {
    totalVouches: number;
    verifiedVouches: number;
    credibilityScore: number;
  };
}
```

#### `vouches`
```typescript
{
  userId: string;           // Privy user ID
  workoutData: {
    type: 'running' | 'cycling' | 'strength' | 'other';
    duration: number;       // minutes
    calories: number;
    distance?: number;      // meters
    heartRate?: number;     // avg BPM
    verified: boolean;      // true if from HealthKit/Google Fit
    source: 'healthkit' | 'googlefit' | 'manual' | 'web';
  };
  photoUrl?: string;        // Firebase Storage URL
  platform: 'web' | 'mobile';
  timestamp: Timestamp;
}
```

#### `squads`
```typescript
{
  name: string;
  members: string[];        // Array of Privy user IDs
  createdAt: Timestamp;
  settings: {
    roastLevel: 'brutal' | 'harsh' | 'savage';
    minVouchesPerWeek: number;
  };
}
```

#### `roasts`
```typescript
{
  userId: string;           // Target of roast
  squadId: string;
  message: string;          // AI-generated roast
  reason: string;           // 'missed_vouch' | 'manual_entry' | 'streak_broken'
  timestamp: Timestamp;
}
```

### Firebase Storage Structure
```
/vouches/{userId}/{timestamp}.jpg    # Workout photos
/avatars/{userId}.jpg                # User profile pics
```

---

## 07 // TERMINAL AESTHETIC GUIDELINES

### Color Palette
```typescript
Colors = {
  primary: '#00FFFF',      // Neon Cyan
  secondary: '#000000',    // Pure Black
  background: '#000000',
  surface: '#1a1a1a',      // Dark Gray
  success: '#00FF41',      // Terminal Green
  error: '#FF0040',        // Terminal Red
  warning: '#FFD700',      // Gold
  text: '#00FFFF',
  textSecondary: '#808080',
}
```

### Typography
- **Web**: Geist Mono (already configured)
- **Mobile**: Space Mono (download required)
- **Style**: All text should use monospace fonts

### UI Patterns
```typescript
// Command prompts
"> AUTHENTICATE TO CONTINUE"
"> CONNECT WALLET"
"> CAPTURE PROOF-OF-WORK"

// Status messages
"[✓] BIOMETRIC SYNC: READY"
"[✗] HEALTHKIT ACCESS DENIED"
"[...] UPLOADING TO FIREBASE..."

// Comments
"// NO EXCUSES. YOUR SQUAD IS COUNTING ON YOU."
"// FRICTION IS THE ENEMY. ACCOUNTABILITY IS THE PRODUCT."
```

---

## 08 // ROAST AI PERSONA

### Tone Guidelines
- **High-Stakes**: No second chances, everything matters
- **Brutally Honest**: Call out excuses immediately
- **Sovereign**: No soft corporate language, no hand-holding
- **Motivating**: Harsh but pushing for improvement

### Example Roasts
```
"3 DAYS WITHOUT A VOUCH. YOUR SQUAD IS CARRYING YOU."
"MANUAL ENTRY AGAIN? WHERE'S THE HEALTHKIT PROOF?"
"BIOMETRIC VERIFICATION: DISABLED. CREDIBILITY: ZERO."
"YOUR STREAK ENDED. START OVER. NO MERCY."
```

### When to Roast
1. Missed vouch deadline (daily/weekly target)
2. Manual entry instead of biometric
3. Streak broken
4. Inactive for 3+ days
5. Squad member completes vouch when you didn't

---

## 09 // COMMANDS

### Web Development
```bash
npm run dev      # Start Next.js dev server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Mobile Development
```bash
cd mobile
npm start                     # Start Expo dev server
npm run ios                   # Run on iOS simulator
npm run android               # Run on Android emulator
npm run build:ios             # Build for iOS (EAS)
npm run build:android         # Build for Android (EAS)
```

---

## 10 // DEVELOPMENT WORKFLOW

### Starting a New Feature

1. **Read CLAUDE.md** (this file) for conventions
2. **Check existing code** - Don't reinvent patterns
3. **Use TodoWrite** tool to plan multi-step tasks
4. **Keep files under 250 lines** - Refactor if needed
5. **Test biometric sync** on mobile features
6. **Commit with descriptive messages**

### Git Workflow

```bash
# Create feature branch
git checkout -b claude/feature-name-{sessionId}

# Make changes, commit frequently
git add .
git commit -m "Clear description of change"

# Push to remote
git push -u origin claude/feature-name-{sessionId}

# Create PR via GitHub CLI or web interface
```

---

## 11 // TESTING REQUIREMENTS

### Mobile App Testing
- [ ] HealthKit sync works on iOS device
- [ ] Camera captures and uploads photos
- [ ] Privy authentication flows
- [ ] Firebase writes vouches correctly
- [ ] Offline mode queues actions
- [ ] Terminal UI displays correctly

### Web App Testing
- [ ] Privy authentication works
- [ ] Squad creation and management
- [ ] Roast feed displays correctly
- [ ] Mobile vouches appear on web
- [ ] Terminal aesthetic consistent

### Cross-Platform Testing
- [ ] Same user ID on web + mobile
- [ ] Vouches sync between platforms
- [ ] Firebase real-time updates work
- [ ] Biometric badges show on web

---

## 12 // PERFORMANCE TARGETS

| Metric | Target | Maximum |
|--------|--------|---------|
| Mobile interaction time | 5s | 10s |
| Web page load | 1s | 3s |
| Camera capture | 1s | 2s |
| Biometric sync | 2s | 5s |
| Photo upload | 2s | 5s |
| File size (lines) | 150 | 250 |

---

## 13 // ENVIRONMENT SETUP

### Shared Variables (Web + Mobile)

```bash
# Privy (same app ID for both platforms)
NEXT_PUBLIC_PRIVY_APP_ID=clxxxxxxxxx        # Web
EXPO_PUBLIC_PRIVY_APP_ID=clxxxxxxxxx        # Mobile

# Firebase (shared project)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vouch-xxx   # Web
EXPO_PUBLIC_FIREBASE_PROJECT_ID=vouch-xxx   # Mobile

# (Same pattern for all Firebase vars)
```

**Critical**: Web uses `NEXT_PUBLIC_*`, Mobile uses `EXPO_PUBLIC_*`

---

## 14 // DOCUMENTATION STRUCTURE

```
/
├── README.md                    # Project overview (web + mobile)
├── CLAUDE.md                    # This file - conventions & architecture
├── MOBILE_INIT_SUMMARY.md       # Mobile app initialization summary
│
├── mobile/
│   ├── README.md                # Mobile app setup guide
│   ├── INSTALLATION.md          # Step-by-step install
│   ├── BIOMETRIC_SYNC.md        # HealthKit/Google Fit architecture
│   ├── WEB_INTEGRATION.md       # Cross-platform data sync
│   └── STRUCTURE.md             # File manifest
│
└── (web docs - TODO)
```

---

## 15 // THE MISSION

The VOUCH system exists to create **real accountability** through:

1. **Biometric Verification**: Sensors don't lie, humans do
2. **Social Pressure**: Squads hold each other accountable
3. **Brutal Honesty**: AI roasts eliminate excuses
4. **Zero Friction**: <10 second interactions
5. **Terminal Aesthetic**: Serious tools for serious people

**Core Principle**: Friction is the enemy. Accountability is the product.

---

## 16 // NEXT MILESTONES

### Phase 1: Foundation (COMPLETE ✓)
- [x] Web platform with Privy auth
- [x] Mobile app initialization
- [x] Terminal-style login screens
- [x] HealthKit biometric sync
- [x] Firebase integration
- [x] Proof-of-work camera

### Phase 2: Core Features (IN PROGRESS)
- [ ] Google Fit integration (Android)
- [ ] Squad dashboard (mobile + web)
- [ ] Roast feed with AI persona
- [ ] Push notifications
- [ ] Offline sync queue

### Phase 3: Scale
- [ ] Leaderboards
- [ ] Streak tracking
- [ ] Wearable integrations (Apple Watch, Garmin)
- [ ] Real-time squad updates
- [ ] AI workout validation (photo analysis)

---

**CLAUDE**: When implementing features, always reference this file for conventions. The terminal aesthetic, biometric priority, and performance targets are non-negotiable.

**VOUCH EXISTS TO ELIMINATE EXCUSES. BUILD ACCORDINGLY.**
