/**
 * Budget service (Firebase JS SDK).
 *
 * CRUD operations for budget documents in Firestore.
 * Uses modular Firestore imports for tree-shaking.
 *
 * Firestore path: users/{uid}/budgets/{budgetId}
 */

import {
    collection,
    doc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
    writeBatch,
    type QueryDocumentSnapshot
} from 'firebase/firestore';
import { MAX_BUDGET_LIMIT, MIN_BUDGET_LIMIT } from '../constants/config';
import { Budget, CreateBudgetInput } from '../types';
import { db } from './firebase';

// ─── Collection Reference Helper ─────────────────────────────────────────────

function budgetsRef(uid: string) {
    return collection(db, 'users', uid, 'budgets');
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Create a new budget and deactivate any existing active budget.
 *
 * Uses a Firestore batch write for atomicity.
 *
 * @returns The ID of the newly created budget
 */
export async function createBudget(uid: string, data: CreateBudgetInput): Promise<string> {
    validateBudgetInput(data);

    const batch = writeBatch(db);
    const colRef = budgetsRef(uid);

    // Deactivate currently active budgets
    const activeQuery = query(colRef, where('isActive', '==', true));
    const activeSnapshots = await getDocs(activeQuery);

    activeSnapshots.docs.forEach((docSnap) => {
        batch.update(docSnap.ref, { isActive: false });
    });

    // Create the new budget
    const newBudgetRef = doc(colRef);
    batch.set(newBudgetRef, {
        userId: uid,
        dailyLimit: data.dailyLimit,
        weeklyLimit: data.weeklyLimit ?? null,
        monthlyLimit: data.monthlyLimit ?? null,
        currency: data.currency,
        startDate: Timestamp.fromDate(data.startDate),
        endDate: Timestamp.fromDate(data.endDate),
        isActive: true,
    });

    await batch.commit();
    return newBudgetRef.id;
}

/**
 * Get the currently active budget, or null if none exists.
 */
export async function getActiveBudget(uid: string): Promise<Budget | null> {
    const q = query(budgetsRef(uid), where('isActive', '==', true), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;
    return mapSnapshotToBudget(snapshot.docs[0]);
}

/**
 * Update specific fields on an existing budget.
 */
export async function updateBudget(
    uid: string,
    budgetId: string,
    data: Partial<CreateBudgetInput>
): Promise<void> {
    if (data.dailyLimit !== undefined) {
        validateLimit(data.dailyLimit, 'Daily limit');
    }
    if (data.weeklyLimit !== undefined && data.weeklyLimit !== null) {
        validateLimit(data.weeklyLimit, 'Weekly limit');
    }
    if (data.monthlyLimit !== undefined && data.monthlyLimit !== null) {
        validateLimit(data.monthlyLimit, 'Monthly limit');
    }

    const updateFields: Record<string, unknown> = {};

    if (data.dailyLimit !== undefined) updateFields.dailyLimit = data.dailyLimit;
    if (data.weeklyLimit !== undefined) updateFields.weeklyLimit = data.weeklyLimit;
    if (data.monthlyLimit !== undefined) updateFields.monthlyLimit = data.monthlyLimit;
    if (data.currency !== undefined) updateFields.currency = data.currency;
    if (data.startDate !== undefined) {
        updateFields.startDate = Timestamp.fromDate(data.startDate);
    }
    if (data.endDate !== undefined) {
        updateFields.endDate = Timestamp.fromDate(data.endDate);
    }

    await updateDoc(doc(db, 'users', uid, 'budgets', budgetId), updateFields);
}

/**
 * Deactivate a budget (soft delete).
 */
export async function deactivateBudget(uid: string, budgetId: string): Promise<void> {
    await updateDoc(doc(db, 'users', uid, 'budgets', budgetId), { isActive: false });
}

/**
 * Get all budgets ordered by most recent first.
 */
export async function getBudgetHistory(uid: string): Promise<Budget[]> {
    const q = query(budgetsRef(uid), orderBy('startDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapSnapshotToBudget);
}

/**
 * Subscribe to real-time updates on the active budget.
 *
 * @returns Unsubscribe function
 */
export function onBudgetSnapshot(
    uid: string,
    callback: (budget: Budget | null) => void
): () => void {
    const q = query(budgetsRef(uid), where('isActive', '==', true), limit(1));

    return onSnapshot(
        q,
        (snapshot) => {
            if (snapshot.empty) {
                callback(null);
            } else {
                callback(mapSnapshotToBudget(snapshot.docs[0]));
            }
        },
        (error) => {
            console.error('[BudgetService] Snapshot error:', error);
            callback(null);
        }
    );
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

/** Convert a Firestore document snapshot to a typed Budget object. */
function mapSnapshotToBudget(docSnap: QueryDocumentSnapshot): Budget {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        userId: data.userId,
        dailyLimit: data.dailyLimit,
        weeklyLimit: data.weeklyLimit ?? null,
        monthlyLimit: data.monthlyLimit ?? null,
        currency: data.currency,
        startDate: data.startDate?.toDate() ?? new Date(),
        endDate: data.endDate?.toDate() ?? new Date(),
        isActive: data.isActive ?? false,
    };
}

// ─── Input Validation ────────────────────────────────────────────────────────

function validateLimit(value: number, label: string): void {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new Error(`${label} must be a valid number.`);
    }
    if (value < MIN_BUDGET_LIMIT) {
        throw new Error(`${label} must be at least ${MIN_BUDGET_LIMIT}.`);
    }
    if (value > MAX_BUDGET_LIMIT) {
        throw new Error(`${label} cannot exceed ${MAX_BUDGET_LIMIT.toLocaleString()}.`);
    }
}

function validateBudgetInput(data: CreateBudgetInput): void {
    validateLimit(data.dailyLimit, 'Daily limit');

    if (data.weeklyLimit != null) {
        validateLimit(data.weeklyLimit, 'Weekly limit');
    }
    if (data.monthlyLimit != null) {
        validateLimit(data.monthlyLimit, 'Monthly limit');
    }
    if (!data.currency || data.currency.length !== 3) {
        throw new Error('Currency must be a valid 3-letter ISO code.');
    }
    if (data.endDate <= data.startDate) {
        throw new Error('End date must be after start date.');
    }
}
