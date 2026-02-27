/**
 * Comparison chart calculation utilities.
 *
 * Computes daily spending totals for the last 7 days
 * to power the spending comparison bar chart.
 */

import { Expense } from '../types';

export interface DailySpending {
    /** The date for this day */
    date: Date;
    /** Short day label (e.g., "Mon", "Tue") */
    dayLabel: string;
    /** Total amount spent on this day */
    amount: number;
    /** Whether this is today */
    isToday: boolean;
}

/**
 * Get daily spending totals for the last 7 days.
 *
 * @param expenses - All user expenses
 * @returns Array of 7 days with spending totals, oldest first
 */
export function getLast7DaysSpending(expenses: Expense[]): DailySpending[] {
    const today = new Date();
    const days: DailySpending[] = [];

    // Build a map of date key → total for efficient lookup
    const dailyTotals = new Map<string, number>();
    for (const expense of expenses) {
        const key = toDateKey(expense.date);
        dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + expense.amount);
    }

    // Generate the last 7 days (oldest first)
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const key = toDateKey(date);
        const amount = dailyTotals.get(key) ?? 0;

        const dayLabel = i === 0
            ? 'Today'
            : date.toLocaleDateString('en-US', { weekday: 'short' });

        days.push({
            date,
            dayLabel,
            amount,
            isToday: i === 0,
        });
    }

    return days;
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
