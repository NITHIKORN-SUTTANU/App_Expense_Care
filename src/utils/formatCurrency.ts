/**
 * Currency formatting utilities.
 *
 * Provides consistent money display throughout the app.
 */

/**
 * Format a number as a currency string.
 *
 * @param amount - The numeric amount to format
 * @param currency - ISO 4217 currency code (default: 'USD')
 * @returns Formatted currency string, e.g. "$12.50"
 *
 * @example
 * formatCurrency(12.5)       // "$12.50"
 * formatCurrency(1000, 'EUR') // "€1,000.00"
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        // Fallback for unsupported currencies
        return `${currency} ${amount.toFixed(2)}`;
    }
}

/**
 * Format a number as a compact currency string (no decimals).
 * Useful for large numbers on small screens.
 *
 * @example
 * formatCurrencyCompact(1500) // "$1,500"
 */
export function formatCurrencyCompact(amount: number, currency: string = 'USD'): string {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency} ${Math.round(amount)}`;
    }
}
