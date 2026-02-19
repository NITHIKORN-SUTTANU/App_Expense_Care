/**
 * App-wide configuration constants.
 *
 * Centralizes magic numbers and thresholds for easy tuning.
 */

/** Budget warning threshold — shows warning when spending exceeds this % */
export const BUDGET_WARNING_THRESHOLD = 80;

/** Budget over threshold — marks budget as exceeded */
export const BUDGET_OVER_THRESHOLD = 100;

/** Default currency code */
export const DEFAULT_CURRENCY = 'USD';

/** Supported currencies */
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'THB', 'JPY', 'AUD'] as const;

/** Maximum note length for expenses */
export const MAX_NOTE_LENGTH = 200;

/** Minimum budget limit (prevents zero or negative limits) */
export const MIN_BUDGET_LIMIT = 1;

/** Maximum budget limit (sanity cap) */
export const MAX_BUDGET_LIMIT = 1_000_000;

/** Number of recent expenses to show on home screen */
export const HOME_RECENT_EXPENSES_COUNT = 5;

/** App metadata */
export const APP_NAME = 'Expense Care';
export const APP_VERSION = '1.0.0';
