/**
 * Empty state component.
 *
 * Shown when a list or view has no data to display.
 * Provides a friendly message and optional action button.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, fontSize, fontWeight, gradients, shadows, spacing } from '../constants/colors';

interface EmptyStateProps {
    /** Icon name from Ionicons */
    icon: string;
    /** Main heading text */
    title: string;
    /** Subtitle / description */
    subtitle?: string;
    /** Optional action button label */
    actionLabel?: string;
    /** Callback when action button is pressed */
    onAction?: () => void;
}

/**
 * Renders a centered empty state with icon, text, and optional CTA.
 */
export function EmptyState({
    icon,
    title,
    subtitle,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradients.primary as unknown as [string, string, ...string[]]}
                style={[styles.iconCircle, shadows.md]}
            >
                <Ionicons name={icon as any} size={36} color="#FFF" />
            </LinearGradient>
            <Text style={[styles.title, { color: '#FFF' }]}>{title}</Text>
            {subtitle ? (
                <Text style={[styles.subtitle, { color: '#94A3B8' }]}>{subtitle}</Text>
            ) : null}
            {actionLabel && onAction ? (
                <TouchableOpacity
                    onPress={onAction}
                    activeOpacity={0.85}
                    style={{ marginTop: spacing.xl }}
                >
                    <LinearGradient
                        colors={gradients.primary as unknown as [string, string, ...string[]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                            {
                                height: 50,
                                borderRadius: borderRadius.lg,
                                paddingHorizontal: spacing.xl,
                                alignItems: 'center',
                                justifyContent: 'center',
                            },
                            shadows.glow,
                        ]}
                    >
                        <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: '#FFF' }}>
                            {actionLabel}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xxxl,
        paddingVertical: spacing.xxxl,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.md,
        textAlign: 'center',
        lineHeight: 22,
    },
});
