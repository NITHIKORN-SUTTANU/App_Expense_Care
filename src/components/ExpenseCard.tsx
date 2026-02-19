/**
 * Expense card component.
 *
 * Displays a single expense in a list row format with
 * category icon, note, amount, and time.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCategoryByKey } from '../constants/categories';
import { fontSize, fontWeight, spacing } from '../constants/colors';
import { useThemeColors } from '../hooks/useThemeColors';
import { Expense } from '../types';
import { formatDisplayDate, formatTime } from '../utils/dateHelpers';
import { formatCurrency } from '../utils/formatCurrency';
import { CategoryIcon } from './CategoryIcon';

interface ExpenseCardProps {
    /** The expense data to display */
    expense: Expense;
    /** Currency code for formatting */
    currency?: string;
    /** Called when the card is pressed (e.g., for detail view) */
    onPress?: () => void;
    /** Called when the card is long-pressed (e.g., for delete) */
    onLongPress?: () => void;
}

/**
 * Renders a single expense as a list item card.
 */
export function ExpenseCard({
    expense,
    currency = 'USD',
    onPress,
    onLongPress,
}: ExpenseCardProps) {
    const colors = useThemeColors();
    const category = getCategoryByKey(expense.category);

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
        >
            <CategoryIcon category={expense.category} size={44} />

            <View style={styles.info}>
                <Text style={[styles.category, { color: colors.text }]} numberOfLines={1}>
                    {category.label}
                </Text>
                {expense.note ? (
                    <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={1}>
                        {expense.note}
                    </Text>
                ) : null}
            </View>

            <View style={styles.right}>
                <Text style={[styles.amount, { color: colors.text }]}>
                    -{formatCurrency(expense.amount, currency)}
                </Text>
                <Text style={[styles.time, { color: colors.textTertiary }]}>
                    {formatDisplayDate(expense.date)} • {formatTime(expense.date)}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.md,
    },
    info: {
        flex: 1,
        gap: 2,
    },
    category: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    note: {
        fontSize: fontSize.sm,
    },
    right: {
        alignItems: 'flex-end',
        gap: 2,
    },
    amount: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    time: {
        fontSize: fontSize.xs,
    },
});
