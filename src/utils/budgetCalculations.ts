/**
 * Budget calculation utilities.
 *
 * Pure functions for computing budget status, warnings,
 * and category aggregations. No side effects.
 */

import { BUDGET_WARNING_THRESHOLD } from '../constants/config';
import {
    AllBudgetStatuses,
    Budget,
    BudgetHealthStatus,
    BudgetPeriod,
    BudgetStatus,
    CategorySummaryItem,
    Expense,
    PeriodSummary,
} from '../types';
import { endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from './dateHelpers';

// ─── Budget Status ───────────────────────────────────────────────────────────

/**
 * Determine the health status of a budget based on % used.
 */
function getHealthStatus(percentUsed: number): BudgetHealthStatus {
    if (percentUsed >= 100) return 'over';
    if (percentUsed >= BUDGET_WARNING_THRESHOLD) return 'warning';
    return 'safe';
}

/**
 * Calculate budget status for a given limit and set of expenses.
 *
 * @param limit - The spending limit for the period
 * @param expenses - Expenses that fall within the period
 * @returns Computed status including totals and health indicator
 */
export function getBudgetStatus(limit: number, expenses: Expense[]): BudgetStatus {
    if (limit <= 0) {
        return { totalSpent: 0, remaining: 0, percentUsed: 0, status: 'safe' };
    }

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = limit - totalSpent; // Allow negative
    const percentUsed = (totalSpent / limit) * 100; // Allow > 100%

    return {
        totalSpent,
        remaining,
        percentUsed,
        status: getHealthStatus(percentUsed),
    };
}

/**
 * Filter expenses to those within a date range (inclusive).
 */
export function filterExpensesByDateRange(expenses: Expense[], start: Date, end: Date): Expense[] {
    const startTime = start.getTime();
    const endTime = end.getTime();

    return expenses.filter((expense) => {
        const expenseTime = expense.date.getTime();
        return expenseTime >= startTime && expenseTime <= endTime;
    });
}

/**
 * Calculate budget status across all active periods (daily, weekly, monthly).
 *
 * @param budget - The active budget with limits
 * @param expenses - All user expenses (will be filtered per period)
 * @returns Status object for each active period
 */
export function getAllBudgetStatuses(budget: Budget, expenses: Expense[]): AllBudgetStatuses {
    const now = new Date();

    const todayExpenses = filterExpensesByDateRange(expenses, startOfDay(now), endOfDay(now));
    const weekExpenses = filterExpensesByDateRange(expenses, startOfWeek(now), endOfWeek(now));
    const monthExpenses = filterExpensesByDateRange(expenses, startOfMonth(now), endOfMonth(now));

    return {
        daily: getBudgetStatus(budget.dailyLimit, todayExpenses),
        weekly: budget.weeklyLimit
            ? getBudgetStatus(budget.weeklyLimit, weekExpenses)
            : null,
        monthly: budget.monthlyLimit
            ? getBudgetStatus(budget.monthlyLimit, monthExpenses)
            : null,
    };
}

// ─── Category Summary ────────────────────────────────────────────────────────

/**
 * Get date range boundaries for a given budget period.
 * @param period - The budget period
 * @param referenceDate - Optional date to use as reference (defaults to now)
 */
export function getDateRangeForPeriod(period: BudgetPeriod, referenceDate?: Date): { start: Date; end: Date } {
    const ref = referenceDate ?? new Date();

    switch (period) {
        case 'daily':
            return { start: startOfDay(ref), end: endOfDay(ref) };
        case 'weekly':
            return { start: startOfWeek(ref), end: endOfWeek(ref) };
        case 'monthly':
            return { start: startOfMonth(ref), end: endOfMonth(ref) };
    }
}

/**
 * Aggregate expenses by category for a given time period.
 *
 * Used by the Summary screen to render pie charts and ranked lists.
 *
 * @param expenses - All user expenses (will be filtered by period)
 * @param startDate - The beginning of the date range
 * @param endDate - The end of the date range
 * @returns Total spent and per-category breakdown sorted by amount (desc)
 */
export function getCategorySummary(expenses: Expense[], startDate: Date, endDate: Date): PeriodSummary {
    const filtered = filterExpensesByDateRange(expenses, startOfDay(startDate), endOfDay(endDate));

    if (filtered.length === 0) {
        return { total: 0, categories: [] };
    }

    // Aggregate amounts per category
    const categoryMap = new Map<string, number>();
    filtered.forEach((expense) => {
        const current = categoryMap.get(expense.category) ?? 0;
        categoryMap.set(expense.category, current + expense.amount);
    });

    const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);

    // Build sorted category summary
    const categories: CategorySummaryItem[] = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({
            category: category as CategorySummaryItem['category'],
            amount,
            percent: total > 0 ? (amount / total) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

    return { total, categories };
}
