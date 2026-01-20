# Firebase Setup Guide

This directory contains Firebase configuration files for the VOUCH platform.

## Files

- `firestore.rules` - Security rules for Firestore Database
- `storage.rules` - Security rules for Firebase Storage
- `firestore-schema.ts` - TypeScript schema documentation for collections

---

## Setup Steps

### 1. Enable Firestore Database

```bash
# Login to Firebase CLI
firebase login

# Select your project
firebase use vouch-b0cd4

# Initialize Firestore
firebase init firestore
```

When prompted:
- Select **existing project**: `vouch-b0cd4`
- Firestore rules file: `firebase/firestore.rules`
- Firestore indexes file: `firebase/firestore.indexes.json`

**OR** enable via Console:
1. Go to https://console.firebase.google.com/project/vouch-b0cd4/firestore
2. Click "Create Database"
3. Choose **Start in production mode**
4. Select region (e.g., `us-central1`)

---

### 2. Enable Firebase Storage

```bash
# Initialize Storage
firebase init storage
```

When prompted:
- Storage rules file: `firebase/storage.rules`

**OR** enable via Console:
1. Go to https://console.firebase.google.com/project/vouch-b0cd4/storage
2. Click "Get Started"
3. Choose **Start in production mode**
4. Use same region as Firestore

---

### 3. Deploy Security Rules

After enabling Firestore and Storage, deploy the security rules:

```bash
# Deploy both Firestore and Storage rules
firebase deploy --only firestore:rules,storage:rules

# Or deploy individually
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

---

### 4. Create Initial Collections (Optional)

You can create collections manually via Firebase Console or they'll be created automatically when your app writes data.

**Recommended**: Create these collections with a dummy document to prevent errors:

1. Go to Firestore Console
2. Click "Start collection"
3. Create these collections:
   - `users`
   - `vouches`
   - `squads`
   - `roasts`

---

## Security Rules Overview

### Firestore Rules

- **users**: Anyone can read, users can only write their own profile
- **vouches**: Anyone can read, users can only create their own vouches, **cannot delete** (accountability!)
- **squads**: Squad members can read/update, anyone can create
- **roasts**: Squad members can read, **cannot update/delete** (permanent record!)

### Storage Rules

- **vouches/{userId}/{timestamp}.jpg**: Anyone can read, only owner can upload, **cannot delete** (proof is permanent!)
- **avatars/{userId}.jpg**: Anyone can read, only owner can upload/update/delete

---

## Firestore Schema

See `firestore-schema.ts` for complete TypeScript definitions.

### Collections

```typescript
// users/{privyId}
{
  privyId: string;
  walletAddress?: string;
  displayName?: string;
  createdAt: Timestamp;
  stats: {
    totalVouches: number;
    verifiedVouches: number;
    credibilityScore: number;
  };
}

// vouches/{autoId}
{
  userId: string;
  workoutData: {
    type: 'running' | 'cycling' | 'strength' | 'other';
    duration: number;
    calories: number;
    verified: boolean;
    source: 'healthkit' | 'googlefit' | 'manual' | 'web';
  };
  photoUrl?: string;
  platform: 'web' | 'mobile';
  timestamp: Timestamp;
}

// squads/{autoId}
{
  name: string;
  members: string[];
  createdAt: Timestamp;
  settings: {
    roastLevel: 'brutal' | 'harsh' | 'savage';
    minVouchesPerWeek: number;
  };
}

// roasts/{autoId}
{
  userId: string;
  squadId: string;
  message: string;
  reason: 'missed_vouch' | 'manual_entry' | 'streak_broken';
  timestamp: Timestamp;
}
```

---

## Testing Security Rules

After deploying, test your rules:

```bash
# Install Firebase Emulator Suite
firebase init emulators

# Start emulators
firebase emulators:start

# Run in browser
open http://localhost:4000
```

---

## Troubleshooting

### Rules not applying
```bash
# Force redeploy
firebase deploy --only firestore:rules --force
firebase deploy --only storage:rules --force
```

### Permission denied errors
- Check that user is authenticated with Privy
- Verify `request.auth.uid` matches `userId` in rules
- Check Firebase Console > Firestore > Rules tab for syntax errors

### Storage upload fails
- Verify file is under 10MB
- Check that file is an image (`image/*`)
- Ensure path matches pattern in `storage.rules`

---

## Next Steps

1. ✅ Enable Firestore Database
2. ✅ Enable Firebase Storage
3. ✅ Deploy security rules
4. Test authentication flow (Privy → Firebase)
5. Test vouch creation from mobile app
6. Verify photos upload to Storage
7. Check Firestore Console for data

**VOUCH EXISTS TO ELIMINATE EXCUSES. ACCOUNTABILITY STARTS WITH SECURE DATA.**
