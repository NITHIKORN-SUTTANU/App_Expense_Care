/**
 * Expenses screen — tab ②
 *
 * Bold card-grouped expense list with pull-to-refresh
 * and long-press-to-delete. Borderless rounded cards.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Modal,
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomDateRangePicker, DateRange } from '../../src/components/CustomDateRangePicker';
import { EmptyState } from '../../src/components/EmptyState';
import { ExpenseCard } from '../../src/components/ExpenseCard';
import { SwipeableRow } from '../../src/components/SwipeableRow';
import { CATEGORIES, getCategoryByKey } from '../../src/constants/categories';
import { borderRadius, fontSize, fontWeight, shadows, spacing } from '../../src/constants/colors';
import { useBudgetContext } from '../../src/context/BudgetContext';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { CategoryKey, Expense } from '../../src/types';
import { endOfDay, startOfDay } from '../../src/utils/dateHelpers';

interface DateSection {
    title: string;
    data: Expense[];
}

export default function ExpensesScreen() {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const { budget, expenses, deleteExpense } = useBudgetContext();

    // Default DateRange to today only
    const [dateRange, setDateRange] = useState<DateRange | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const filteredExpenses = useMemo(() => {
        let result = expenses.slice();

        // Filter by DateRange
        if (dateRange) {
            const rangeStart = startOfDay(dateRange.start).getTime();
            const rangeEnd = endOfDay(dateRange.end).getTime();

            result = result.filter((expense) => {
                const expenseTime = expense.date.getTime();
                return expenseTime >= rangeStart && expenseTime <= rangeEnd;
            });
        }

        // Filter by Category
        if (selectedCategory !== 'all') {
            result = result.filter((expense) => expense.category === selectedCategory);
        }

        // Sort by Date Descending (Newest first)
        return result.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [expenses, dateRange, selectedCategory]);

    const sections = useMemo<DateSection[]>(() => {
        const grouped = new Map<string, Expense[]>();
        for (const expense of filteredExpenses) {
            const categoryKey = expense.category;
            if (!grouped.has(categoryKey)) grouped.set(categoryKey, []);
            grouped.get(categoryKey)!.push(expense);
        }

        return Array.from(grouped.entries()).map(([key, items]) => {
            const category = getCategoryByKey(key as any);
            return {
                title: category.label,
                data: items,
            };
        });
    }, [filteredExpenses]);

    const handleDateSelect = (range: DateRange) => {
        setDateRange(range);
        setShowDatePicker(false);
    };

    const periodDateLabel = useMemo(() => {
        if (!dateRange) return 'All Dates';

        const { start, end } = dateRange;
        const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        if (start.getTime() === end.getTime()) {
            return fmt(start);
        }
        return `${fmt(start)} \u2013 ${fmt(end)}`;
    }, [dateRange]);


    const handleDelete = useCallback(
        (expense: Expense) => {
            Alert.alert(
                'Delete Expense',
                `Remove "${expense.note}" for ${expense.amount}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => deleteExpense(expense.id),
                    },
                ]
            );
        },
        [deleteExpense]
    );



    if (!budget) {
        return (
            <LinearGradient
                colors={['#0F172A', '#1E293B', '#0F172A']}
                style={styles.container}
            >
                <EmptyState
                    icon="wallet-outline"
                    title="No Budget Yet"
                    subtitle="Set up your budget on the Home tab to start tracking."
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
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingTop: insets.top + spacing.xl },
                ]}
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({ section }) => (
                    <Text style={[styles.sectionHeader, { color: '#94A3B8' }]}>
                        {section.title}
                    </Text>
                )}
                renderItem={({ item, index, section }) => (
                    <SwipeableRow onDelete={() => handleDelete(item)}>
                        <View style={[
                            styles.cardItem,
                            styles.glassCard,
                            index === 0 && styles.cardFirst,
                            index === section.data.length - 1 && styles.cardLast,
                            index === 0 && shadows.sm,
                        ]}>
                            <ExpenseCard
                                expense={item}
                                currency={currency}
                                onLongPress={() => handleDelete(item)}
                                onPress={() => router.push({ pathname: '/edit-expense', params: { id: item.id } })}
                            />
                        </View>
                    </SwipeableRow>
                )}
                ItemSeparatorComponent={() => (
                    <View style={[styles.separator, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]} />
                )}
                ListHeaderComponent={
                    <View>
                        <Text style={[styles.pageTitle, { color: '#FFF', marginBottom: spacing.md }]}>Expenses</Text>

                        <View style={{ flexDirection: 'row', marginBottom: spacing.sm, flexWrap: 'wrap' }}>
                            {/* Category Filter Button */}
                            <TouchableOpacity
                                onPress={() => setShowCategoryPicker(true)}
                                style={[
                                    styles.filterButton,
                                    {
                                        backgroundColor: selectedCategory === 'all'
                                            ? 'rgba(255, 255, 255, 0.1)'
                                            : 'rgba(52, 211, 153, 0.2)',
                                    },
                                ]}
                                // add spacing between filter buttons
                                activeOpacity={0.9}>
                                <Ionicons name="filter" size={16} color="#FFF" style={styles.filterIcon} />
                                <Text style={[styles.filterButtonText, { color: '#FFF' }]}>
                                    {selectedCategory === 'all' ? 'All' : getCategoryByKey(selectedCategory).label}
                                </Text>
                                {selectedCategory !== 'all' && (
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            setSelectedCategory('all');
                                        }}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons name="close-circle" size={16} color="#94A3B8" style={{ marginLeft: 4 }} />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>

                            {/* Date Filter Button */}
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                style={[styles.filterButton, { backgroundColor: dateRange ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.1)', marginLeft: spacing.sm }]}
                            >
                                <Ionicons name="calendar" size={16} color="#FFF" />
                                <Text style={[styles.filterButtonText, { color: '#FFF' }]}>
                                    {periodDateLabel}
                                </Text>
                                {dateRange !== null && (
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            setDateRange(null);
                                        }}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons name="close-circle" size={16} color="#94A3B8" style={{ marginLeft: 4 }} />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        </View>

                        <CustomDateRangePicker
                            visible={showDatePicker}
                            onClose={() => setShowDatePicker(false)}
                            onSelect={handleDateSelect}
                            initialRange={dateRange ?? { start: new Date(), end: new Date() }}
                        />

                        {/* Category Picker Modal */}
                        <Modal
                            visible={showCategoryPicker}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={() => setShowCategoryPicker(false)}
                        >
                            <TouchableOpacity
                                style={styles.modalContainer}
                                activeOpacity={1}
                                onPress={() => setShowCategoryPicker(false)}
                            >
                                <View style={[styles.categoryModalContent, { backgroundColor: '#1E293B' }]}>
                                    <Text style={[styles.modalTitle, { color: '#FFF', marginBottom: spacing.md, textAlign: 'center' }]}>Filter by Category</Text>

                                    <TouchableOpacity
                                        style={[styles.categoryOption, selectedCategory === 'all' && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
                                        onPress={() => {
                                            setSelectedCategory('all');
                                            setShowCategoryPicker(false);
                                        }}
                                    >
                                        <Ionicons name="apps" size={20} color="#FFF" />
                                        <Text style={[styles.categoryOptionText, { color: '#FFF' }]}>All Categories</Text>
                                        {selectedCategory === 'all' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                                    </TouchableOpacity>

                                    {CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.key}
                                            style={[styles.categoryOption, selectedCategory === cat.key && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
                                            onPress={() => {
                                                setSelectedCategory(cat.key);
                                                setShowCategoryPicker(false);
                                            }}
                                        >
                                            <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                                            <Text style={[styles.categoryOptionText, { color: '#FFF' }]}>{cat.label}</Text>
                                            {selectedCategory === cat.key && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <EmptyState
                        icon="receipt-outline"
                        title="No Expenses"
                        subtitle="Adjust your filters or tap + to add your first expense."
                    />
                }
            />
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
    listContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxxl,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderLeftWidth: 1,
        borderRightWidth: 1,
    },
    pageTitle: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.heavy,
        letterSpacing: -0.5,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },

    sectionHeader: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: spacing.xl,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.xs,
    },
    cardItem: {
        // paddingHorizontal: spacing.lg, // Removed to let card fill the wrapper
    },
    cardFirst: {
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        paddingTop: spacing.xs,
        borderTopWidth: 1,
    },
    cardLast: {
        borderBottomLeftRadius: borderRadius.lg,
        borderBottomRightRadius: borderRadius.lg,
        paddingBottom: spacing.xs,
        borderBottomWidth: 1,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: spacing.lg,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: spacing.lg,
    },

    modalTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },

    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        // gap removed; use icon/text margins
    },
    filterIcon: {
        marginRight: spacing.xs,
    },
    filterButtonText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },

    categoryModalContent: {
        width: '90%',
        maxWidth: 340,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
        // gap removed; use icon/text margins
    },
    categoryOptionText: {
        flex: 1,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    categoryOptionIcon: {
        marginRight: spacing.md,
    },
});
