/**
 * Expense service (Firebase JS SDK).
 *
 * CRUD operations for expense documents in Firestore.
 * Uses modular Firestore imports for tree-shaking.
 *
 * Firestore path: users/{uid}/expenses/{expenseId}
 */

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
    type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { CATEGORIES } from '../constants/categories';
import { MAX_NOTE_LENGTH } from '../constants/config';
import { CategoryKey, CreateExpenseInput, Expense } from '../types';
import { endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from '../utils/dateHelpers';
import { db } from './firebase';

// ─── Collection Reference Helper ─────────────────────────────────────────────

function expensesRef(uid: string) {
    return collection(db, 'users', uid, 'expenses');
}

// ─── Valid category keys for validation ──────────────────────────────────────

const VALID_CATEGORY_KEYS = new Set<string>(CATEGORIES.map((c) => c.key));

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Add a new expense document.
 *
 * @returns The ID of the newly created expense
 */
export async function addExpense(uid: string, data: CreateExpenseInput): Promise<string> {
    validateExpenseInput(data);

    const docRef = await addDoc(expensesRef(uid), {
        userId: uid,
        budgetId: data.budgetId,
        amount: data.amount,
        category: data.category,
        note: data.note?.trim() ?? '',
        date: Timestamp.fromDate(data.date),
        createdAt: serverTimestamp(),
    });

    return docRef.id;
}

/**
 * Delete a single expense by its ID.
 */
export async function deleteExpense(uid: string, expenseId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'expenses', expenseId));
}

/**
 * Update an existing expense.
 */
export async function updateExpense(
    uid: string,
    expenseId: string,
    data: Partial<CreateExpenseInput>
): Promise<void> {
    const updates: any = { ...data };
    if (updates.date) {
        updates.date = Timestamp.fromDate(updates.date);
    }
    // Remove undefined values
    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    await updateDoc(doc(db, 'users', uid, 'expenses', expenseId), updates);
}

/**
 * Query expenses within a date range, ordered by date descending.
 */
export async function getExpensesByDateRange(
    uid: string,
    start: Date,
    end: Date
): Promise<Expense[]> {
    const q = query(
        expensesRef(uid),
        where('date', '>=', Timestamp.fromDate(start)),
        where('date', '<=', Timestamp.fromDate(end)),
        orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapSnapshotToExpense);
}

/**
 * Get today's expenses.
 */
export async function getExpensesForToday(uid: string): Promise<Expense[]> {
    return getExpensesByDateRange(uid, startOfDay(), endOfDay());
}

/**
 * Get this week's expenses.
 */
export async function getExpensesForWeek(uid: string): Promise<Expense[]> {
    return getExpensesByDateRange(uid, startOfWeek(), endOfWeek());
}

/**
 * Get this month's expenses.
 */
export async function getExpensesForMonth(uid: string): Promise<Expense[]> {
    return getExpensesByDateRange(uid, startOfMonth(), endOfMonth());
}

/**
 * Subscribe to real-time expense updates within a date range.
 *
 * @returns Unsubscribe function
 */
export function onExpensesSnapshot(
    uid: string,
    start: Date,
    end: Date,
    callback: (expenses: Expense[]) => void
): () => void {
    const q = query(
        expensesRef(uid),
        where('date', '>=', Timestamp.fromDate(start)),
        where('date', '<=', Timestamp.fromDate(end)),
        orderBy('date', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const expenses = snapshot.docs.map(mapSnapshotToExpense);
            callback(expenses);
        },
        (error) => {
            console.error('[ExpenseService] Snapshot error:', error);
            callback([]);
        }
    );
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

/** Convert a Firestore document snapshot to a typed Expense object. */
function mapSnapshotToExpense(docSnap: QueryDocumentSnapshot): Expense {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        userId: data.userId,
        budgetId: data.budgetId,
        amount: data.amount,
        category: data.category as CategoryKey,
        note: data.note ?? '',
        date: data.date?.toDate() ?? new Date(),
        createdAt: data.createdAt?.toDate() ?? new Date(),
    };
}

// ─── Input Validation ────────────────────────────────────────────────────────

function validateExpenseInput(data: CreateExpenseInput): void {
    if (typeof data.amount !== 'number' || isNaN(data.amount)) {
        throw new Error('Amount must be a valid number.');
    }
    if (data.amount <= 0) {
        throw new Error('Amount must be greater than zero.');
    }
    if (data.amount > 1_000_000) {
        throw new Error('Amount seems too large. Please verify.');
    }
    if (!VALID_CATEGORY_KEYS.has(data.category)) {
        throw new Error('Please select a valid category.');
    }
    if (data.note && data.note.length > MAX_NOTE_LENGTH) {
        throw new Error(`Note must be ${MAX_NOTE_LENGTH} characters or fewer.`);
    }
    if (!data.budgetId || data.budgetId.trim().length === 0) {
        throw new Error('Please set up a budget before adding expenses.');
    }
    if (!(data.date instanceof Date) || isNaN(data.date.getTime())) {
        throw new Error('Please provide a valid date.');
    }
}
