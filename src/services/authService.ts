/**
 * Authentication service (Firebase JS SDK).
 *
 * Wraps Firebase Auth with typed, app-specific functions.
 * Uses modular imports for tree-shaking efficiency.
 */

import {
    createUserWithEmailAndPassword,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    updateProfile as firebaseUpdateProfile,
    signInWithEmailAndPassword,
    signOut,
    type User as FirebaseUser,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { User } from '../types';
import { auth, db } from './firebase';

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Register a new user with email and password.
 *
 * Creates a Firebase Auth account AND a Firestore user profile document.
 *
 * @throws Auth errors on failure (e.g., email already in use)
 */
export async function register(
    email: string,
    password: string,
    displayName: string
): Promise<User> {
    validateEmail(email);
    validatePassword(password);
    validateDisplayName(displayName);

    // 1. Create auth account
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    // 2. Set display name on auth profile
    await firebaseUpdateProfile(credential.user, { displayName });

    // 3. Create Firestore user profile document
    const user: User = {
        uid: credential.user.uid,
        displayName,
        email,
        createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), {
        displayName: user.displayName,
        email: user.email,
        createdAt: serverTimestamp(),
    });

    return user;
}

/**
 * Sign in an existing user with email and password.
 */
export async function login(email: string, password: string): Promise<User> {
    validateEmail(email);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(credential.user);
}

/**
 * Sign out the current user.
 */
export async function logout(): Promise<void> {
    await signOut(auth);
}

/**
 * Get the currently signed-in user, or null.
 */
export function getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
}

/**
 * Subscribe to auth state changes.
 *
 * @param callback - Called with the User or null on every auth state change
 * @returns Unsubscribe function
 */
export function onAuthStateChanged(
    callback: (user: User | null) => void
): () => void {
    return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
        callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
    });
}

/**
 * Update the current user's display name.
 *
 * Updates both the Auth profile and the Firestore user document.
 */
export async function updateUserProfile(displayName: string): Promise<void> {
    validateDisplayName(displayName);

    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error('No user is currently signed in.');
    }

    await firebaseUpdateProfile(currentUser, { displayName });
    await updateDoc(doc(db, 'users', currentUser.uid), { displayName });
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

/** Map a Firebase Auth user to our app's User type. */
function mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName ?? '',
        email: firebaseUser.email ?? '',
        createdAt: new Date(firebaseUser.metadata.creationTime ?? Date.now()),
    };
}

// ─── Input Validation ────────────────────────────────────────────────────────

function validateEmail(email: string): void {
    if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address.');
    }
}

function validatePassword(password: string): void {
    if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
    }
}

function validateDisplayName(name: string): void {
    if (!name || name.trim().length < 2) {
        throw new Error('Display name must be at least 2 characters.');
    }
}
