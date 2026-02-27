/**
 * Date helper utilities for budget period calculations.
 *
 * All date operations work in the user's local timezone.
 * Functions are pure and side-effect free.
 */

/**
 * Format date in local time to YYYY-MM-DD
 */
export function formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get the start of today (midnight local time).
 */
export function startOfDay(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Get the end of today (23:59:59.999 local time).
 */
export function endOfDay(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

/**
 * Get the start of the current week (Monday as first day).
 */
export function startOfWeek(date: Date = new Date()): Date {
    const d = new Date(date);
    const day = d.getDay();
    // Adjust so Monday = 0, Sunday = 6
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Get the end of the current week (Sunday 23:59:59.999).
 */
export function endOfWeek(date: Date = new Date()): Date {
    const start = startOfWeek(date);
    const d = new Date(start);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
}

/**
 * Get the start of the current month.
 */
export function startOfMonth(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Get the end of the current month.
 */
export function endOfMonth(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1, 0); // Last day of current month
    d.setHours(23, 59, 59, 999);
    return d;
}

/**
 * Check if a date falls within a range (inclusive).
 */
export function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
    const timestamp = date.getTime();
    return timestamp >= rangeStart.getTime() && timestamp <= rangeEnd.getTime();
}

/**
 * Check if two dates are the same calendar day.
 */
export function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

/**
 * Format a date for display in expense lists.
 *
 * @returns "Today", "Yesterday", or a formatted date string
 */
export function formatDisplayDate(date: Date): string {
    const now = new Date();
    if (isSameDay(date, now)) return 'Today';

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(date, yesterday)) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Format a time for display (e.g., "2:30 PM").
 */
export function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Get a human-readable label for a budget period.
 */
export function getPeriodLabel(period: 'daily' | 'weekly' | 'monthly'): string {
    const labels = {
        daily: 'Today',
        weekly: 'This Week',
        monthly: 'This Month',
    };
    return labels[period];
}
