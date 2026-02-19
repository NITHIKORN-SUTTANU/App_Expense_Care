/**
 * Summary screen — tab ③
 *
 * Category breakdown with vibrant color bars,
 * big total number, period picker chips.
 */

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
import { EmptyState } from '../../src/components/EmptyState';
import { PieChart } from '../../src/components/PieChart';
import { getCategoryByKey } from '../../src/constants/categories';
import { borderRadius, categoryColors, fontSize, fontWeight, shadows, spacing } from '../../src/constants/colors';
import { useBudgetContext } from '../../src/context/BudgetContext';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { BudgetPeriod } from '../../src/types';
import { getCategorySummary } from '../../src/utils/budgetCalculations';
import { formatCurrency } from '../../src/utils/formatCurrency';

const TABS: { key: BudgetPeriod; label: string }[] = [
    { key: 'daily', label: 'Today' },
    { key: 'weekly', label: 'Week' },
    { key: 'monthly', label: 'Month' },
];

export default function SummaryScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const { budget, expenses } = useBudgetContext();
    const [activeTab, setActiveTab] = useState<BudgetPeriod>('daily');

    const summary = useMemo(
        () => getCategorySummary(expenses, activeTab),
        [expenses, activeTab]
    );

    const maxAmount = summary.categories[0]?.amount ?? 1;

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

                {/* Period Tabs */}
                <View style={styles.tabRow}>
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key)}
                                style={[
                                    styles.tab,
                                    isActive && { backgroundColor: colors.primary },
                                    !isActive && { backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1 },
                                    shadows.sm,
                                ]}
                                activeOpacity={0.8}
                            >
                                <Text style={[
                                    styles.tabText,
                                    { color: isActive ? '#FFF' : '#94A3B8' },
                                ]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Pie Chart */}
                <Animated.View
                    key={activeTab}
                    entering={FadeInDown.duration(400)}
                >
                    <PieChart
                        data={summary.categories}
                        total={summary.total}
                        currency={currency}
                    />
                </Animated.View>

                {/* Category Breakdown */}
                {summary.categories.length === 0 ? (
                    <EmptyState
                        icon="pie-chart-outline"
                        title="No expenses"
                        subtitle="Nothing to show for this period."
                    />
                ) : (
                    summary.categories.map((cat, index) => {
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
                                        params: { category: cat.category, period: activeTab }
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
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })
                )}

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
        marginBottom: spacing.xl,
    },

    tabRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.xxl,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
        alignItems: 'center',
    },
    tabText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
    },

    totalCard: {
        borderRadius: borderRadius.lg,
        padding: spacing.xxl,
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    totalLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    totalAmount: {
        fontSize: fontSize.display,
        fontWeight: fontWeight.heavy,
        marginTop: spacing.sm,
        letterSpacing: -1,
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
});
