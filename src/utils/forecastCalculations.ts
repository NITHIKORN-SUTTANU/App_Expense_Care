/**
 * Utilities for calculating and projecting spending trends.
 *
 * Forecast logic projects the user's current spending rate to the end of the month
 * to warn them early if they are on track to overspend their budget.
 */

import { BudgetHealthStatus, Expense } from '../types';
import { endOfMonth, startOfMonth } from './dateHelpers';

export interface ForecastResult {
    totalSpent: number;           // Actual spend so far this month
    projectedTotal: number;       // Projected spend by end of month
    safeDailyLimit: number;       // (Budget - totalSpent) / remaining days
    status: BudgetHealthStatus;   // Computed based on projected total vs budget
    currentBurnRate: number;      // Average spend per day so far
    daysElapsed: number;          // Days passed this month (including today)
    daysRemaining: number;        // Days left in the month (excluding today)
}

/**
 * Calculates current month spending forecast based on a monthly budget limit.
 *
 * NOTE: The provided 'monthlyLimit' should be the total budget for the month.
 * If the user only has a daily limit configured, pass (dailyLimit * daysInMonth).
 */
export function calculateMonthlyForecast(
    expenses: Expense[],
    monthlyLimit: number,
    referenceDate: Date = new Date()
): ForecastResult {
    const monthStart = startOfMonth(referenceDate);
    const monthEnd = endOfMonth(referenceDate);

    // Filter expenses safely within the current month bounds up to reference date
    // Note: We only look at expenses up to 'now' for burn rate, but
    // for this feature's logic, getting all expenses for the month is standard.
    const monthExpenses = expenses.filter(
        e => e.date >= monthStart && e.date <= monthEnd
    );

    const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Compute dates
    const totalDaysInMonth = monthEnd.getDate();
    const currentDayOfMonth = referenceDate.getDate();

    // We count today as elapsed for burn rate purposes because spending could have occurred today
    const daysElapsed = currentDayOfMonth;
    const daysRemaining = totalDaysInMonth - daysElapsed;

    // Daily burn rate = what they've spent on average per day so far
    const currentBurnRate = daysElapsed > 0 ? totalSpent / daysElapsed : 0;

    // Projected spend = what they've spent + (what they spend on average * days left)
    const projectedTotal = totalSpent + (currentBurnRate * daysRemaining);

    // Safe daily limit = how much they can spend per day for the remaining days without going over
    // If we're on the last day (daysRemaining === 0), the safe limit is just the remaining budget for today
    const remainingBudget = monthlyLimit - totalSpent;
    const safeDailyLimit = remainingBudget <= 0
        ? 0
        : (daysRemaining > 0 ? remainingBudget / daysRemaining : remainingBudget);

    // Determine projected health status
    let status: BudgetHealthStatus = 'safe';
    if (projectedTotal > monthlyLimit) {
        status = 'over';
    } else if (projectedTotal > monthlyLimit * 0.9) {
        status = 'warning';
    }

    return {
        totalSpent,
        projectedTotal,
        safeDailyLimit,
        status,
        currentBurnRate,
        daysElapsed,
        daysRemaining
    };
}
