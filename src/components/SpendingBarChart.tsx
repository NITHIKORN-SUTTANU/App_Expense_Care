/**
 * SpendingBarChart — 7-day spending comparison bar chart.
 *
 * Shows animated vertical bars for the last 7 days with
 * a dashed line for the daily budget limit reference.
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';
import { borderRadius, fontSize, fontWeight, shadows, spacing } from '../constants/colors';
import { DailySpending } from '../utils/comparisonCalculations';
import { formatCurrency } from '../utils/formatCurrency';

interface SpendingBarChartProps {
    data: DailySpending[];
    dailyLimit: number;
    currency: string;
}

const CHART_HEIGHT = 160;
const BAR_MIN_HEIGHT = 4;

export function SpendingBarChart({ data, dailyLimit, currency }: SpendingBarChartProps) {
    // Find the max value for scaling (at least the daily limit)
    const maxAmount = Math.max(dailyLimit, ...data.map(d => d.amount)) * 1.15;

    // Budget limit line position (as percentage from bottom)
    const limitPercent = maxAmount > 0 ? (dailyLimit / maxAmount) * 100 : 50;

    return (
        <View style={[styles.container, styles.glassCard, shadows.sm]}>
            {/* Title */}
            <Text style={styles.title}>Last 7 Days</Text>

            {/* Chart Area */}
            <View style={styles.chartArea}>
                {/* Budget Limit Line */}
                <View style={[styles.limitLine, { bottom: `${limitPercent}%` }]}>
                    <Text style={styles.limitLabel}>
                        {formatCurrency(dailyLimit, currency)}
                    </Text>
                    <View style={styles.dashedLine} />
                </View>

                {/* Bars */}
                <View style={styles.barsRow}>
                    {data.map((day, index) => {
                        const barPercent = maxAmount > 0
                            ? Math.max((day.amount / maxAmount) * 100, day.amount > 0 ? (BAR_MIN_HEIGHT / CHART_HEIGHT) * 100 : 0)
                            : 0;
                        const isOverBudget = day.amount > dailyLimit;

                        return (
                            <View key={index} style={styles.barColumn}>
                                {/* Bar with amount */}
                                <View style={styles.barTrack}>
                                    <AnimatedBar
                                        percent={barPercent}
                                        isOverBudget={isOverBudget}
                                        isToday={day.isToday}
                                        index={index}
                                        amount={day.amount}
                                    />
                                </View>

                                {/* Day label */}
                                <Text style={[
                                    styles.dayLabel,
                                    day.isToday && styles.dayLabelToday,
                                ]}>
                                    {day.dayLabel}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

// ─── Animated Bar Sub-component ──────────────────────────────────────────────

function AnimatedBar({
    percent,
    isOverBudget,
    isToday,
    index,
    amount,
}: {
    percent: number;
    isOverBudget: boolean;
    isToday: boolean;
    index: number;
    amount: number;
}) {
    const height = useSharedValue(0);

    useEffect(() => {
        height.value = 0;
        height.value = withDelay(
            index * 80,
            withTiming(percent, { duration: 600 })
        );
    }, [percent]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: `${height.value}%`,
    }));

    return (
        <Animated.View
            style={[
                styles.bar,
                animatedStyle,
                {
                    backgroundColor: isOverBudget
                        ? '#EF4444'
                        : isToday
                            ? '#34D399'
                            : '#34D39980',
                },
                isToday && styles.barToday,
            ]}
        >
            {amount > 0 && (
                <Text style={[
                    styles.barAmount,
                    isOverBudget && styles.barAmountOver,
                ]} numberOfLines={1}>
                    {amount >= 1000
                        ? `${(amount / 1000).toFixed(1)}k`
                        : Math.round(amount)}
                </Text>
            )}
        </Animated.View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    title: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: '#FFF',
        marginBottom: spacing.lg,
    },
    chartArea: {
        height: CHART_HEIGHT,
        position: 'relative',
    },
    barsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '100%',
        gap: spacing.xs,
    },
    barColumn: {
        flex: 1,
        alignItems: 'center',
        height: '100%',
        justifyContent: 'flex-end',
    },
    barTrack: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    bar: {
        width: '70%',
        borderRadius: 6,
        minHeight: 0,
        alignItems: 'center',
        overflow: 'visible',
    },
    barToday: {
        width: '80%',
    },
    barAmount: {
        fontSize: 9,
        fontWeight: fontWeight.semibold,
        color: '#FFF',
        position: 'absolute',
        top: -14,
        textAlign: 'center',
    },
    barAmountOver: {
        color: '#EF4444',
    },
    dayLabel: {
        fontSize: 10,
        fontWeight: fontWeight.medium,
        color: '#64748B',
        marginTop: spacing.xs,
    },
    dayLabelToday: {
        color: '#34D399',
        fontWeight: fontWeight.bold,
    },
    limitLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    limitLabel: {
        fontSize: 8,
        fontWeight: fontWeight.semibold,
        color: '#FB923C',
        marginRight: spacing.xs,
    },
    dashedLine: {
        flex: 1,
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#FB923C40',
    },
});
