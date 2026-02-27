/**
 * Summary screen — tab ③
 *
 * Category breakdown, pie chart, and flexible date filter.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryIcon } from '../../src/components/CategoryIcon';
import { CustomDateRangePicker, DateRange } from '../../src/components/CustomDateRangePicker';
import { EmptyState } from '../../src/components/EmptyState';
import { PieChart } from '../../src/components/PieChart';
import { SpendingBarChart } from '../../src/components/SpendingBarChart';
import { getCategoryByKey } from '../../src/constants/categories';
import { borderRadius, categoryColors, fontSize, fontWeight, shadows, spacing } from '../../src/constants/colors';
import { useBudgetContext } from '../../src/context/BudgetContext';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { getCategorySummary } from '../../src/utils/budgetCalculations';
import { getLast7DaysSpending } from '../../src/utils/comparisonCalculations';
import { formatCurrency } from '../../src/utils/formatCurrency';

export default function SummaryScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const { budget, expenses } = useBudgetContext();

    // Default to today
    const [dateRange, setDateRange] = useState<DateRange>({
        start: new Date(),
        end: new Date()
    });

    const [showDatePicker, setShowDatePicker] = useState(false);

    const summary = useMemo(
        () => getCategorySummary(expenses, dateRange.start, dateRange.end),
        [expenses, dateRange]
    );

    const maxAmount = summary.categories[0]?.amount ?? 1;

    // The bar chart still shows the last 7 days from right now as a quick health indicator.
    const last7Days = useMemo(
        () => getLast7DaysSpending(expenses),
        [expenses]
    );

    const periodDateLabel = useMemo(() => {
        const { start, end } = dateRange;
        const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        if (start.getTime() === end.getTime()) {
            return fmt(start);
        }
        return `${fmt(start)} \u2013 ${fmt(end)}`;
    }, [dateRange]);

    if (!budget) {
        return (
            <LinearGradient
                colors={['#0F172A', '#1E293B', '#0F172A']}
                style={styles.container}
            >
                <EmptyState
                    icon="bar-chart-outline"
                    title="No Data Yet"
                    subtitle="Set up your budget and add expenses to see the summary."
                />
            </LinearGradient>
        );
    }

    const currency = budget.currency;

    return (
        <LinearGradient
            colors={['#0F172A', '#1E293B', '#0F172A']}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.scroll,
                    { paddingTop: insets.top + spacing.xl },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <Text style={[styles.title, { color: '#FFF' }]}>Summary</Text>

                {/* Unified Date/Range Selector */}
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                    style={styles.dateSelectorButton}
                >
                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    <Text style={styles.dateSelectorText}>{periodDateLabel}</Text>
                    <Ionicons name="chevron-down" size={16} color="#94A3B8" />
                </TouchableOpacity>

                {/* Unified Date Range Picker */}
                <CustomDateRangePicker
                    visible={showDatePicker}
                    onClose={() => setShowDatePicker(false)}
                    initialRange={dateRange}
                    onSelect={(range) => setDateRange(range)}
                />

                {/* Pie Chart + Legend */}
                <Animated.View
                    entering={FadeInDown.duration(400)}
                    style={styles.chartSection}
                >
                    <PieChart
                        data={summary.categories}
                        total={summary.total}
                        currency={currency}
                    />
                    {summary.categories.length > 0 && summary.total > 0 && (
                        <View style={[styles.legendCard, styles.glassCard, shadows.sm]}>
                            {[...summary.categories]
                                .sort((a, b) => b.amount - a.amount)
                                .map((cat) => {
                                    const catDef = getCategoryByKey(cat.category);
                                    const catColor = categoryColors[cat.category] ?? '#94A3B8';
                                    const pct = ((cat.amount / summary.total) * 100).toFixed(1);
                                    return (
                                        <View key={cat.category} style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: catColor }]} />
                                            <Text style={styles.legendLabel} numberOfLines={1}>
                                                {catDef?.label ?? cat.category}
                                            </Text>
                                            <Text style={[styles.legendPct, { color: catColor }]}>
                                                {pct}%
                                            </Text>
                                        </View>
                                    );
                                })}
                        </View>
                    )}
                </Animated.View>

                {/* Category Breakdown */}
                {summary.categories.length === 0 ? (
                    <EmptyState
                        icon="pie-chart-outline"
                        title="No expenses"
                        subtitle="Nothing to show for this exact period."
                    />
                ) : (
                    <View style={{ marginTop: spacing.lg }}>
                        <Text style={styles.sectionHeader}>Category Breakdown</Text>
                        {summary.categories.map((cat, index) => {
                            const categoryDef = getCategoryByKey(cat.category);
                            const barWidth = Math.max((cat.amount / maxAmount) * 100, 8);
                            const catColor = categoryColors[cat.category] ?? colors.textSecondary;

                            return (
                                <Animated.View
                                    key={cat.category}
                                    entering={FadeInDown.delay(index * 60).duration(400)}
                                >
                                    <TouchableOpacity
                                        style={[styles.catRow, styles.glassCard, shadows.sm]}
                                        onPress={() => router.push({
                                            pathname: '/category-details',
                                            // TODO: Make detail screen accept start/end directly eventually
                                            params: { category: cat.category, period: 'custom', start: dateRange.start.toISOString(), end: dateRange.end.toISOString() }
                                        })}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.catIconCircle, { backgroundColor: catColor + '18' }]}>
                                            <CategoryIcon
                                                category={cat.category}
                                                size={22}
                                            />
                                        </View>
                                        <View style={styles.catInfo}>
                                            <View style={styles.catHeader}>
                                                <Text style={[styles.catName, { color: '#FFF' }]}>
                                                    {categoryDef?.label ?? cat.category}
                                                </Text>
                                                <Text style={[styles.catAmount, { color: '#FFF' }]}>
                                                    {formatCurrency(cat.amount, currency)}
                                                </Text>
                                            </View>
                                            <View style={[styles.barTrack, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
                                                <View
                                                    style={[
                                                        styles.barFill,
                                                        { width: `${barWidth}%`, backgroundColor: catColor },
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.tapHint}>Tap to view</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                )}

                {/* 7-Day Comparison Chart (always relative to now) */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                    <Text style={[styles.sectionHeader, { marginTop: spacing.xxl }]}>Recent Spending</Text>
                    <SpendingBarChart
                        data={last7Days}
                        dailyLimit={budget.dailyLimit}
                        currency={currency}
                    />
                </Animated.View>

                <View style={{ height: spacing.xxxl }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scroll: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxxl,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },

    title: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.heavy,
        letterSpacing: -0.5,
        marginBottom: spacing.md,
    },

    dateSelectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xl,
        gap: spacing.sm,
    },
    dateSelectorText: {
        color: '#FFF',
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        flex: 1,
        textAlign: 'center',
    },

    chartSection: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    legendCard: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.xs,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        gap: spacing.xs,
        paddingVertical: spacing.xs,
        flexShrink: 1,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendLabel: {
        fontSize: fontSize.xs,
        color: '#CBD5E1',
        fontWeight: fontWeight.medium,
        flexShrink: 1,
    },
    legendPct: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
    },

    sectionHeader: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: '#CBD5E1',
        marginBottom: spacing.md,
        letterSpacing: 0.5,
    },

    catRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
    },
    catIconCircle: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    catInfo: {
        flex: 1,
    },
    catHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    catName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    catAmount: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
    },
    barTrack: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },
    tapHint: {
        fontSize: fontSize.xs,
        color: '#64748B',
        marginTop: 4,
        textAlign: 'right',
    },
});
