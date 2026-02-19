/**
 * Firebase app initialization (JS SDK).
 *
 * Uses the modular Firebase JS SDK which is compatible
 * with Expo Go — no native build required.
 *
 * Handles Expo hot-reload gracefully by catching re-initialization errors.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
// @ts-ignore — subpath export varies by Firebase SDK version
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase configuration object.
 *
 * Get this from Firebase Console:
 * 1. Go to Project Settings (⚙️ gear icon)
 * 2. Scroll to "Your apps" section
 * 3. Click "Add app" → Web (</>) icon
 * 4. Copy the config object
 */
const firebaseConfig = {
    apiKey: "AIzaSyDe_ywa7xU3E1lQEw7bvxqKstEEWVpV4r4",
    authDomain: "expensecare-fdff8.firebaseapp.com",
    projectId: "expensecare-fdff8",
    storageBucket: "expensecare-fdff8.firebasestorage.app",
    messagingSenderId: "241410100842",
    appId: "1:241410100842:web:223787de6bfe5d71cb4413",
    measurementId: "G-K1GXT24797"
};

/**
 * Initialize Firebase (or reuse existing instance).
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Firebase Auth instance with AsyncStorage persistence.
 *
 * Uses try/catch to handle Expo hot-reload:
 * - First load: initializeAuth() sets up persistence
 * - Hot-reload: initializeAuth() throws → fall back to getAuth()
 */
let auth: ReturnType<typeof getAuth>;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} catch (error) {
    // Already initialized (Expo hot-reload) — reuse existing instance
    auth = getAuth(app);
}

export { auth };

/**
 * Firestore database instance.
 */
export const db = getFirestore(app);

export default app;
