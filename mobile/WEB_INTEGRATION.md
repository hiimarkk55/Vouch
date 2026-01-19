# VOUCH // WEB + MOBILE INTEGRATION

This document outlines how the mobile app shares data with the web project.

---

## SHARED INFRASTRUCTURE

### 1. Firebase Database

Both web and mobile use the **same Firebase project**.

**Web Config Location**: To be created at `src/firebase/config.ts`

**Mobile Config Location**: `mobile/src/services/firebase.ts`

**Environment Variables** (must match):

```bash
# Web (.env.local)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket

# Mobile (.env)
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
```

### 2. Privy Authentication

Both platforms use **Privy** but with different SDKs:

- **Web**: `@privy-io/react-auth` (already installed)
- **Mobile**: `@privy-io/expo`

**Shared App ID**:
```bash
# Same Privy App ID for both
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id      # Web
EXPO_PUBLIC_PRIVY_APP_ID=your_app_id      # Mobile
```

**User ID Consistency**:
- Privy assigns same user ID across web and mobile
- Firebase vouches reference `userId` from Privy
- A user logged in on web will see mobile vouches and vice versa

---

## SHARED DATA SCHEMA

### Firestore Collections

#### `users`
```typescript
{
  privyId: string;          // From Privy (same on web + mobile)
  walletAddress?: string;   // If using wallet login
  displayName?: string;
  createdAt: Timestamp;
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
    verified: boolean;      // true if from biometric source
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
  };
}
```

### Firebase Storage Structure

```
vouch-app/
├── vouches/
│   └── {userId}/
│       ├── 1234567890.jpg    # Workout photos
│       └── 1234567891.jpg
└── avatars/
    └── {userId}.jpg
```

---

## AUTHENTICATION FLOW

### Web Login
1. User visits `https://vouch.app`
2. Clicks "Connect Wallet"
3. Privy modal opens → user authenticates
4. `privyId` stored in Firestore `users` collection
5. User can create vouches from web (manual entry)

### Mobile Login
1. User opens mobile app
2. Sees terminal-style login screen
3. Taps "CONNECT WALLET"
4. Privy SDK handles auth (same flow as web)
5. **Same `privyId`** is used
6. User can create vouches with biometric data

### Cross-Platform Session
- If user logs in on web, they're auto-logged in on mobile (and vice versa)
- Privy handles session management
- Firebase queries use same `userId` (Privy ID)

---

## DATA SYNC FLOW

```
┌─────────────┐         ┌──────────────┐
│   MOBILE    │         │     WEB      │
│   (Expo)    │         │  (Next.js)   │
└──────┬──────┘         └──────┬───────┘
       │                       │
       │    Both use Privy     │
       ├───────────┬───────────┤
       │           │           │
       ▼           ▼           ▼
   ┌────────────────────────────┐
   │    PRIVY AUTHENTICATION    │
   │    (Shared User ID)        │
   └────────────┬───────────────┘
                │
                ▼
   ┌────────────────────────────┐
   │    FIREBASE FIRESTORE      │
   │    (Shared Database)       │
   └────────────────────────────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
┌───────┐  ┌────────┐  ┌────────┐
│ users │  │vouches │  │ squads │
└───────┘  └────────┘  └────────┘
```

---

## WEB PROJECT SETUP (TODO)

To enable Firebase in the web project, create:

### 1. Firebase Config (`src/firebase/config.ts`)

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 2. Update `package.json` (add Firebase)

```json
{
  "dependencies": {
    "firebase": "^11.1.0"
  }
}
```

### 3. Environment Variables

Create `.env.local` in web project root:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=clxxxxxxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vouch-xxxxxxx
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vouch-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vouch-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

---

## VOUCH CREATION COMPARISON

### Mobile (Biometric Priority)
```typescript
// 1. Capture photo
const photo = await captureProofOfWork();

// 2. Sync with HealthKit/Google Fit
const { data } = await fetchRecentWorkout();

// 3. Create vouch with verified data
await createVouch(userId, data, photo);
// Result: verified=true, source='healthkit'
```

### Web (Manual Entry)
```typescript
// 1. User fills form
const workoutData = {
  type: 'running',
  duration: 45,
  calories: 420,
  verified: false,  // ⚠️ No biometric data on web
  source: 'web',
};

// 2. Optional photo upload
const photo = await uploadPhoto();

// 3. Create vouch
await createVouch(userId, workoutData, photo);
// Result: verified=false, source='web'
```

---

## FIREBASE SECURITY RULES

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Vouches: Users can read all, write their own
    match /vouches/{vouchId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null
                            && resource.data.userId == request.auth.uid;
    }

    // Squads: Members can read, admins can write
    match /squads/{squadId} {
      allow read: if request.auth != null
                  && request.auth.uid in resource.data.members;
      allow write: if request.auth != null
                   && request.auth.uid in resource.data.admins;
    }
  }
}
```

---

## TESTING CROSS-PLATFORM SYNC

### Test Checklist

1. **Create vouch on mobile** (with biometric data)
   - [ ] Verify it appears in Firestore
   - [ ] Verify photo uploaded to Storage
   - [ ] Check `verified: true`

2. **View vouch on web**
   - [ ] Query Firestore for user's vouches
   - [ ] Display biometric data (calories, HR, etc.)
   - [ ] Show "VERIFIED" badge

3. **Create squad on web**
   - [ ] Add members
   - [ ] Verify squad appears in Firestore

4. **View squad on mobile**
   - [ ] Fetch squad from Firestore
   - [ ] Display member vouches
   - [ ] Show biometric vs. manual ratio

---

## NEXT STEPS

1. [ ] Set up Firebase project (console.firebase.google.com)
2. [ ] Add web app to Firebase project
3. [ ] Add iOS app to Firebase project (bundle ID: `io.vouch.mobile`)
4. [ ] Add Android app to Firebase project (package: `io.vouch.mobile`)
5. [ ] Copy config to both web and mobile `.env` files
6. [ ] Deploy Firestore security rules
7. [ ] Test cross-platform sync

---

**ONE DATABASE. TWO PLATFORMS. ZERO EXCUSES.**
