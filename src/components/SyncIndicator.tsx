/**
 * Sync indicator component.
 *
 * Shows a small badge when the device is offline,
 * indicating that data will sync when connection is restored.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, fontSize, fontWeight, spacing } from '../constants/colors';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useThemeColors } from '../hooks/useThemeColors';

/**
 * Renders a small offline indicator badge.
 * Returns null when online (no visual noise).
 */
export function SyncIndicator() {
    const { isOnline, isChecking } = useNetworkStatus();
    const colors = useThemeColors();

    // Don't show anything while checking or when online
    if (isChecking || isOnline) return null;

    return (
        <View style={[styles.container, { backgroundColor: colors.warning }]}>
            <Ionicons name="cloud-offline" size={14} color={colors.textInverse} style={styles.icon} />
            <Text style={[styles.text, { color: colors.textInverse }]}>Offline</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        // gap removed for RN compatibility; use child margins instead
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    icon: {
        marginRight: spacing.xs,
    },
    text: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
    },
});
