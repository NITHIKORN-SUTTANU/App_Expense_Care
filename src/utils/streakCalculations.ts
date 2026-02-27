/**
 * Budget streak calculation utilities.
 *
 * Computes how many consecutive days the user has stayed
 * within their daily budget limit. Pure function, no side effects.
 */

import { Expense } from '../types';

export interface StreakResult {
    /** Number of consecutive days under budget (including today if applicable) */
    streakDays: number;
    /** Whether today is currently under budget */
    isActiveToday: boolean;
}

/**
 * Calculate the user's current budget streak.
 *
 * Walks backwards from today checking each day's total spending
 * against the daily limit. Days with no expenses count as under budget.
 *
 * @param expenses - All user expenses
 * @param dailyLimit - The user's daily budget limit
 * @param budgetStartDate - When the budget was created (don't count days before this)
 * @param maxLookbackDays - Maximum days to look back (default 365)
 * @returns Streak result with count and today's status
 */
export function calculateBudgetStreak(
    expenses: Expense[],
    dailyLimit: number,
    budgetStartDate: Date,
    maxLookbackDays = 365,
): StreakResult {
    if (dailyLimit <= 0) {
        return { streakDays: 0, isActiveToday: false };
    }

    // Build a map of date string → total spent for quick lookups
    const dailyTotals = new Map<string, number>();
    for (const expense of expenses) {
        const dateKey = toDateKey(expense.date);
        dailyTotals.set(dateKey, (dailyTotals.get(dateKey) ?? 0) + expense.amount);
    }

    const today = new Date();
    const startKey = toDateKey(budgetStartDate);
    let streakDays = 0;

    for (let i = 0; i < maxLookbackDays; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);

        const dateKey = toDateKey(checkDate);

        // Don't count days before the budget was created
        if (dateKey < startKey) break;

        const dayTotal = dailyTotals.get(dateKey) ?? 0;

        if (dayTotal > dailyLimit) {
            // Streak broken on this day
            break;
        }

        streakDays++;
    }

    // Check if today is still under budget
    const todayTotal = dailyTotals.get(toDateKey(today)) ?? 0;
    const isActiveToday = todayTotal <= dailyLimit;

    return { streakDays, isActiveToday };
}

/**
 * Convert a Date to a YYYY-MM-DD string key for grouping.
 */
function toDateKey(date: Date): string {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get a motivational message based on streak length.
 */
export function getStreakMessage(streakDays: number): string {
    if (streakDays === 0) return "Start fresh today!";
    if (streakDays === 1) return "Great start! Keep it up!";
    if (streakDays <= 3) return "You're building momentum!";
    if (streakDays <= 7) return "Impressive discipline!";
    if (streakDays <= 14) return "You're on fire! 🔥";
    if (streakDays <= 30) return "Legendary self-control!";
    return "Absolutely unstoppable! 🏆";
}
