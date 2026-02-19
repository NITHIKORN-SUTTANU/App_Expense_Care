/**
 * Budget & expenses context provider.
 *
 * Manages the active budget and expenses state with real-time
 * Firestore listeners. Automatically subscribes when a user is
 * authenticated and cleans up on logout.
 *
 * Usage:
 *   Wrap your authenticated screens with <BudgetProvider>
 *   Access with: const { budget, expenses, ... } = useBudgetContext();
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import * as budgetService from '../services/budgetService';
import * as expenseService from '../services/expenseService';
import { AllBudgetStatuses, Budget, CreateBudgetInput, CreateExpenseInput, Expense } from '../types';
import { getAllBudgetStatuses } from '../utils/budgetCalculations';
import { endOfMonth, startOfMonth } from '../utils/dateHelpers';
import { useAuth } from './AuthContext';

// ─── State Types ─────────────────────────────────────────────────────────────

interface BudgetState {
    budget: Budget | null;
    expenses: Expense[];
    isLoading: boolean;
}

interface BudgetContextValue extends BudgetState {
    /** Computed budget statuses for daily/weekly/monthly */
    statuses: AllBudgetStatuses | null;
    /** Create a new budget (deactivates previous) */
    createBudget: (data: CreateBudgetInput) => Promise<void>;
    /** Update the active budget */
    updateBudget: (data: Partial<CreateBudgetInput>) => Promise<void>;
    /** Add a new expense */
    addExpense: (data: Omit<CreateExpenseInput, 'budgetId'>) => Promise<void>;
    /** Delete an expense by ID */
    deleteExpense: (expenseId: string) => Promise<void>;
    /** Update an existing expense */
    updateExpense: (expenseId: string, data: Partial<CreateExpenseInput>) => Promise<void>;
    /** Refresh data manually */
    refresh: () => void;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

type BudgetAction =
    | { type: 'SET_LOADING' }
    | { type: 'SET_BUDGET'; budget: Budget | null }
    | { type: 'SET_EXPENSES'; expenses: Expense[] }
    | { type: 'RESET' };

const initialState: BudgetState = {
    budget: null,
    expenses: [],
    isLoading: false,
};

function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
    switch (action.type) {
        case 'SET_BUDGET':
            return { ...state, budget: action.budget, isLoading: false };
        case 'SET_EXPENSES':
            return { ...state, expenses: action.expenses };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const BudgetContext = createContext<BudgetContextValue | null>(null);

// ─── Provider Component ──────────────────────────────────────────────────────

interface BudgetProviderProps {
    children: React.ReactNode;
}

export function BudgetProvider({ children }: BudgetProviderProps) {
    const { user, isLoading: authLoading } = useAuth();
    const [state, dispatch] = useReducer(budgetReducer, initialState);

    // Track subscription refresh key for manual refresh
    const [refreshKey, setRefreshKey] = React.useState(0);

    // ─── Real-time listeners ────────────────────────────────────────────────

    // Subscribe to active budget changes
    useEffect(() => {
        if (!user) {
            dispatch({ type: 'RESET' });
            return;
        }

        const uid = user.uid;
        const unsubscribe = budgetService.onBudgetSnapshot(uid, (budget) => {
            dispatch({ type: 'SET_BUDGET', budget });
        });

        return unsubscribe;
    }, [user?.uid, refreshKey]);

    // Subscribe to expenses for the current month
    useEffect(() => {
        if (!user) return;

        const uid = user.uid;
        const monthStart = startOfMonth();
        const monthEnd = endOfMonth();

        const unsubscribe = expenseService.onExpensesSnapshot(
            uid,
            monthStart,
            monthEnd,
            (expenses) => {
                dispatch({ type: 'SET_EXPENSES', expenses });
            }
        );

        return unsubscribe;
    }, [user?.uid, refreshKey]);

    // ─── Computed Values ────────────────────────────────────────────────────

    const statuses = useMemo<AllBudgetStatuses | null>(() => {
        if (!state.budget) return null;
        return getAllBudgetStatuses(state.budget, state.expenses);
    }, [state.budget, state.expenses]);

    // ─── Actions ────────────────────────────────────────────────────────────

    const createBudget = useCallback(
        async (data: CreateBudgetInput) => {
            if (!user) throw new Error('You must be signed in to create a budget.');
            await budgetService.createBudget(user.uid, data);
            // Real-time listener will update state automatically
        },
        [user]
    );

    const updateBudget = useCallback(
        async (data: Partial<CreateBudgetInput>) => {
            if (!user) throw new Error('You must be signed in.');
            if (!state.budget) throw new Error('No active budget to update.');
            await budgetService.updateBudget(user.uid, state.budget.id, data);
        },
        [user, state.budget]
    );

    const addExpense = useCallback(
        async (data: Omit<CreateExpenseInput, 'budgetId'>) => {
            if (!user) throw new Error('You must be signed in to add expenses.');
            if (!state.budget) throw new Error('Please set up a budget first.');
            await expenseService.addExpense(user.uid, {
                ...data,
                budgetId: state.budget.id,
            });
        },
        [user, state.budget]
    );

    const deleteExpense = useCallback(
        async (expenseId: string) => {
            if (!user) throw new Error('You must be signed in.');
            await expenseService.deleteExpense(user.uid, expenseId);
        },
        [user]
    );

    const updateExpense = useCallback(
        async (expenseId: string, data: Partial<CreateExpenseInput>) => {
            if (!user) throw new Error('You must be signed in.');
            await expenseService.updateExpense(user.uid, expenseId, data);
        },
        [user]
    );

    const refresh = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    // ─── Memoized context value ─────────────────────────────────────────────

    const value = useMemo<BudgetContextValue>(
        () => ({
            ...state,
            statuses,
            createBudget,
            updateBudget,
            addExpense,
            deleteExpense,
            updateExpense,
            refresh,
        }),
        [state, statuses, createBudget, updateBudget, addExpense, deleteExpense, updateExpense, refresh]
    );

    return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Access budget state and actions from any component.
 *
 * @throws Error if used outside of BudgetProvider
 */
export function useBudgetContext(): BudgetContextValue {
    const context = useContext(BudgetContext);
    if (!context) {
        throw new Error(
            'useBudgetContext must be used within a BudgetProvider. Wrap your authenticated screens with <BudgetProvider>.'
        );
    }
    return context;
}
