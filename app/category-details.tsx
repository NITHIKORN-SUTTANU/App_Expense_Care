
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpenseCard } from '../src/components/ExpenseCard';
import { SwipeableRow } from '../src/components/SwipeableRow';
import { getCategoryByKey } from '../src/constants/categories';
import { borderRadius, fontSize, fontWeight, shadows, spacing } from '../src/constants/colors';
import { useBudgetContext } from '../src/context/BudgetContext';
import { BudgetPeriod, CategoryKey, Expense } from '../src/types';
import { filterExpensesByDateRange, getDateRangeForPeriod } from '../src/utils/budgetCalculations';
import { formatCurrency } from '../src/utils/formatCurrency';

export default function CategoryDetailsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { category, period, start, end } = useLocalSearchParams<{ category: CategoryKey; period: string, start?: string, end?: string }>();
    const { expenses, budget, deleteExpense } = useBudgetContext();

    const categoryDef = getCategoryByKey(category!);

    const filteredExpenses = useMemo(() => {
        if (!period || !category) return [];

        let rangeStart: Date;
        let rangeEnd: Date;

        if (period === 'custom' && start && end) {
            rangeStart = new Date(start);
            rangeEnd = new Date(end);
        } else {
            const range = getDateRangeForPeriod(period as BudgetPeriod);
            rangeStart = range.start;
            rangeEnd = range.end;
        }

        const dateFiltered = filterExpensesByDateRange(expenses, rangeStart, rangeEnd);
        return dateFiltered
            .filter((e) => e.category === category)
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [expenses, category, period, start, end]);

    const handlePressExpense = (id: string) => {
        router.push({ pathname: '/edit-expense', params: { id } });
    };

    const handleDelete = useCallback(
        (expense: Expense) => {
            Alert.alert(
                'Delete Expense',
                `Remove "${expense.note || getCategoryByKey(expense.category).label}" for ${formatCurrency(expense.amount, budget?.currency || 'USD')}?`,
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
        [deleteExpense, budget?.currency]
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>
                    {categoryDef.label}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={filteredExpenses}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => (
                    <SwipeableRow onDelete={() => handleDelete(item)}>
                        <View style={[
                            styles.cardItem,
                            styles.glassCard,
                            index === 0 && styles.cardFirst,
                            index === filteredExpenses.length - 1 && styles.cardLast,
                            index === 0 && shadows.sm,
                        ]}>
                            <ExpenseCard
                                expense={item}
                                currency={budget?.currency || 'USD'}
                                onPress={() => handlePressExpense(item.id)}
                                onLongPress={() => handleDelete(item)}
                            />
                        </View>
                    </SwipeableRow>
                )}
                ItemSeparatorComponent={() => (
                    <View style={[styles.separator, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]} />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No expenses found for this period.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        padding: spacing.sm,
    },
    title: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: '#FFF',
    },
    listContent: {
        padding: spacing.xl,
        gap: spacing.md,
    },
    emptyContainer: {
        padding: spacing.xxl,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: fontSize.md,
    },
    cardItem: {
        // paddingHorizontal: spacing.lg,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderLeftWidth: 1,
        borderRightWidth: 1,
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
});
