/**
 * StreakCard — displays the user's budget streak on the Home screen.
 *
 * Shows a fire emoji, streak count, and motivational message
 * in a polished glass card with gradient accent.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, fontSize, fontWeight, shadows, spacing } from '../constants/colors';
import { getStreakMessage, StreakResult } from '../utils/streakCalculations';

interface StreakCardProps {
    streak: StreakResult;
}

export function StreakCard({ streak }: StreakCardProps) {
    const { streakDays, isActiveToday } = streak;
    const message = getStreakMessage(streakDays);

    return (
        <View style={[styles.container, shadows.sm]}>
            <LinearGradient
                colors={
                    streakDays >= 7
                        ? ['rgba(251, 146, 60, 0.15)', 'rgba(239, 68, 68, 0.10)']
                        : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Fire + Streak Count */}
                <View style={styles.topRow}>
                    <Text style={styles.fireEmoji}>🔥</Text>
                    <View style={styles.countContainer}>
                        <Text style={[
                            styles.streakCount,
                            streakDays >= 7 && styles.streakCountHot,
                        ]}>
                            {streakDays}
                        </Text>
                        <Text style={styles.streakLabel}>
                            {streakDays === 1 ? 'Day' : 'Days'}
                        </Text>
                    </View>
                </View>

                {/* Message */}
                <Text style={styles.message}>{message}</Text>

                {/* Today Status */}
                <View style={styles.todayRow}>
                    <View style={[
                        styles.todayDot,
                        { backgroundColor: isActiveToday ? '#34D399' : '#EF4444' },
                    ]} />
                    <Text style={styles.todayText}>
                        {isActiveToday ? 'On track today' : 'Over budget today'}
                    </Text>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    gradient: {
        padding: spacing.lg,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    fireEmoji: {
        fontSize: 32,
    },
    countContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing.xs,
    },
    streakCount: {
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.heavy,
        color: '#FFF',
        letterSpacing: -1,
    },
    streakCountHot: {
        color: '#FB923C',
    },
    streakLabel: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: '#94A3B8',
    },
    message: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: '#CBD5E1',
        marginBottom: spacing.md,
    },
    todayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    todayDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    todayText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
        color: '#94A3B8',
    },
});
