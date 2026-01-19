/**
 * VOUCH // VOUCH SERVICE
 * Manages workout vouches and biometric proof-of-work
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseDb, getFirebaseStorage } from './firebase';
import { WorkoutData } from '@hooks/useBiometricSync';

export interface Vouch {
  id?: string;
  userId: string;
  workoutData: WorkoutData;
  photoUrl?: string;
  timestamp: any;
  verified: boolean;
  source: 'healthkit' | 'googlefit' | 'manual';
}

/**
 * Create a new vouch with biometric data and optional photo
 */
export async function createVouch(
  userId: string,
  workoutData: WorkoutData,
  photoUri?: string
): Promise<string> {
  const db = getFirebaseDb();
  let photoUrl: string | undefined;

  // Upload photo if provided
  if (photoUri) {
    photoUrl = await uploadWorkoutPhoto(userId, photoUri);
  }

  // Create vouch document
  const vouch: Omit<Vouch, 'id'> = {
    userId,
    workoutData,
    photoUrl,
    timestamp: serverTimestamp(),
    verified: workoutData.verified,
    source: workoutData.source,
  };

  const docRef = await addDoc(collection(db, 'vouches'), vouch);
  return docRef.id;
}

/**
 * Upload workout photo to Firebase Storage
 */
async function uploadWorkoutPhoto(
  userId: string,
  photoUri: string
): Promise<string> {
  const storage = getFirebaseStorage();
  const filename = `${Date.now()}.jpg`;
  const storageRef = ref(storage, `vouches/${userId}/${filename}`);

  // Convert URI to blob
  const response = await fetch(photoUri);
  const blob = await response.blob();

  // Upload to Firebase Storage
  await uploadBytes(storageRef, blob);

  // Get download URL
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

/**
 * Fetch user's vouches
 */
export async function getUserVouches(userId: string): Promise<Vouch[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, 'vouches'),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Vouch[];
}

/**
 * Get vouches from user's squad
 */
export async function getSquadVouches(squadId: string): Promise<Vouch[]> {
  const db = getFirebaseDb();
  // TODO: Implement squad-based query after squad schema is defined
  return [];
}
