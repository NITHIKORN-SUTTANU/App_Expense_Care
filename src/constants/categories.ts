/**
 * Expense category definitions.
 *
 * Centralizes all category metadata (label, icon, color)
 * so changes propagate throughout the app.
 */

import { CategoryDefinition, CategoryKey } from '../types';
import { categoryColors } from './colors';

/** All available expense categories with display metadata */
export const CATEGORIES: CategoryDefinition[] = [
    { key: 'food', label: 'Food & Drinks', icon: 'fast-food', color: categoryColors.food },
    { key: 'transport', label: 'Transport', icon: 'bus', color: categoryColors.transport },
    { key: 'shopping', label: 'Shopping', icon: 'cart', color: categoryColors.shopping },
    { key: 'entertainment', label: 'Entertainment', icon: 'film', color: categoryColors.entertainment },
    { key: 'bills', label: 'Bills & Utilities', icon: 'flash', color: categoryColors.bills },
    { key: 'health', label: 'Health', icon: 'medkit', color: categoryColors.health },
    { key: 'education', label: 'Education', icon: 'school', color: categoryColors.education },
    { key: 'other', label: 'Other', icon: 'cube', color: categoryColors.other },
];

/**
 * Look up a category definition by its key.
 * Returns the 'other' category as a safe fallback for unknown keys.
 */
export function getCategoryByKey(key: CategoryKey): CategoryDefinition {
    return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
}

/** Map of category keys to their definitions for O(1) access */
export const CATEGORY_MAP: Record<CategoryKey, CategoryDefinition> = Object.fromEntries(
    CATEGORIES.map((c) => [c.key, c])
) as Record<CategoryKey, CategoryDefinition>;
