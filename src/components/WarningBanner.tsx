/**
 * Warning banner component.
 *
 * Displays a prominent warning when the user is close to
 * or has exceeded their budget limit.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, fontSize, fontWeight, spacing } from '../constants/colors';
import { BudgetHealthStatus } from '../types';

interface WarningBannerProps {
    /** Current budget health status */
    status: BudgetHealthStatus;
    /** Additional message to display */
    message?: string;
}

/**
 * Shows a warning or danger banner based on budget status.
 * Returns null when status is 'safe' (no banner needed).
 */
export function WarningBanner({ status, message }: WarningBannerProps) {
    if (status === 'safe') return null;

    const isOver = status === 'over';
    const color = isOver ? '#F43F5E' : '#F59E0B'; // Red or Amber
    const icon = isOver ? 'alert-circle' : 'warning';
    const defaultMessage = isOver
        ? "You've exceeded your budget limit!"
        : "You're approaching your budget limit.";

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: isOver ? 'rgba(244, 63, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                borderColor: isOver ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            }
        ]}>
            <Ionicons name={icon} size={20} color={color} style={styles.icon} />
            <Text style={[styles.text, { color: '#FFF' }]}>
                {message ?? defaultMessage}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        // gap removed for RN compatibility; use child margins instead
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
    },
    icon: {
        marginRight: spacing.md,
    },
    text: {
        flex: 1,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        lineHeight: 18,
    },
});
