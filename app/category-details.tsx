
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpenseCard } from '../src/components/ExpenseCard';
import { getCategoryByKey } from '../src/constants/categories';
import { fontSize, fontWeight, spacing } from '../src/constants/colors';
import { useBudgetContext } from '../src/context/BudgetContext';
import { BudgetPeriod, CategoryKey } from '../src/types';
import { filterExpensesByDateRange, getDateRangeForPeriod } from '../src/utils/budgetCalculations';

export default function CategoryDetailsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { category, period } = useLocalSearchParams<{ category: CategoryKey; period: BudgetPeriod }>();
    const { expenses, budget, deleteExpense } = useBudgetContext();

    const categoryDef = getCategoryByKey(category!);

    const filteredExpenses = useMemo(() => {
        if (!period || !category) return [];
        const { start, end } = getDateRangeForPeriod(period);
        const dateFiltered = filterExpensesByDateRange(expenses, start, end);
        return dateFiltered
            .filter((e) => e.category === category)
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [expenses, category, period]);

    const handlePressExpense = (id: string) => {
        // Dismiss modal first if needed, or just push
        // But since this is likely a modal, pushing another modal might be weird.
        // Let's try pushing.
        router.push({ pathname: '/edit-expense', params: { id } });
    };

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
                renderItem={({ item }) => (
                    <ExpenseCard
                        expense={item}
                        currency={budget?.currency || 'USD'}
                        onPress={() => handlePressExpense(item.id)}
                        onLongPress={() => deleteExpense(item.id)}
                    />
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
});
