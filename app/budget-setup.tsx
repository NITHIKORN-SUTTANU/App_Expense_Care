/**
 * Budget Setup screen (modal).
 *
 * Allows the user to set daily, weekly, and monthly
 * spending limits. Opens as a modal from Home or Profile.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    borderRadius,
    fontSize,
    fontWeight,
    gradients,
    shadows,
    spacing
} from '../src/constants/colors';
import {
    DEFAULT_CURRENCY,
    MAX_BUDGET_LIMIT,
    MIN_BUDGET_LIMIT,
    SUPPORTED_CURRENCIES,
} from '../src/constants/config';
import { useBudgetContext } from '../src/context/BudgetContext';
import { useThemeColors } from '../src/hooks/useThemeColors';

export default function BudgetSetupScreen() {
    const colors = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { budget, createBudget, updateBudget } = useBudgetContext();

    const isEditing = budget !== null;

    // ─── Form State ──────────────────────────────────────────────────────────
    const [dailyLimit, setDailyLimit] = useState('');
    const [weeklyEnabled, setWeeklyEnabled] = useState(false);
    const [weeklyLimit, setWeeklyLimit] = useState('');
    const [monthlyEnabled, setMonthlyEnabled] = useState(false);
    const [monthlyLimit, setMonthlyLimit] = useState('');
    const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-fill form if editing an existing budget
    useEffect(() => {
        if (budget) {
            setDailyLimit(budget.dailyLimit.toString());
            setCurrency(budget.currency);
            if (budget.weeklyLimit != null) {
                setWeeklyEnabled(true);
                setWeeklyLimit(budget.weeklyLimit.toString());
            }
            if (budget.monthlyLimit != null) {
                setMonthlyEnabled(true);
                setMonthlyLimit(budget.monthlyLimit.toString());
            }
        }
    }, [budget]);

    // ─── Validation ──────────────────────────────────────────────────────────
    const validateLimit = (value: string, label: string): number | null => {
        const num = parseFloat(value);
        if (isNaN(num) || num < MIN_BUDGET_LIMIT) {
            Alert.alert('Invalid Input', `${label} must be at least $${MIN_BUDGET_LIMIT}.`);
            return null;
        }
        if (num > MAX_BUDGET_LIMIT) {
            Alert.alert('Invalid Input', `${label} cannot exceed $${MAX_BUDGET_LIMIT.toLocaleString()}.`);
            return null;
        }
        return num;
    };

    // ─── Submit Handler ──────────────────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        // Validate daily limit (required)
        const daily = validateLimit(dailyLimit, 'Daily limit');
        if (daily === null) return;

        // Validate optional limits
        let weekly: number | null = null;
        if (weeklyEnabled) {
            const val = validateLimit(weeklyLimit, 'Weekly limit');
            if (val === null) return;
            weekly = val;
        }

        let monthly: number | null = null;
        if (monthlyEnabled) {
            const val = validateLimit(monthlyLimit, 'Monthly limit');
            if (val === null) return;
            monthly = val;
        }

        setIsSubmitting(true);
        try {
            if (isEditing) {
                await updateBudget({
                    dailyLimit: daily,
                    weeklyLimit: weekly,
                    monthlyLimit: monthly,
                    currency,
                });
            } else {
                const now = new Date();
                const endDate = new Date(now);
                endDate.setFullYear(endDate.getFullYear() + 1); // Default: 1 year budget

                await createBudget({
                    dailyLimit: daily,
                    weeklyLimit: weekly,
                    monthlyLimit: monthly,
                    currency,
                    startDate: now,
                    endDate,
                });
            }
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error?.message ?? 'Failed to save budget.');
        } finally {
            setIsSubmitting(false);
        }
    }, [dailyLimit, weeklyEnabled, weeklyLimit, monthlyEnabled, monthlyLimit, currency, isEditing, createBudget, updateBudget, router]);


    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <LinearGradient
            colors={['#0F172A', '#1E293B', '#0F172A']}
            style={styles.container}
        >
            <ScrollView
                style={styles.flex}
                contentContainerStyle={[styles.content, { paddingTop: spacing.md }]}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={[styles.pageTitle, { color: '#FFF' }]}>
                    {isEditing ? 'Edit Budget' : 'Budget Setup'}
                </Text>
                <Text style={[styles.description, { color: '#94A3B8' }]}>
                    Set your spending limits. The daily limit is required. Weekly and monthly
                    limits are optional but recommended.
                </Text>

                {/* Daily Limit (required) */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: '#FFF' }]}>
                        Daily Limit *
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                color: '#FFF',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        ]}
                        value={dailyLimit}
                        onChangeText={setDailyLimit}
                        placeholder="e.g. 50"
                        placeholderTextColor="#94A3B8"
                        keyboardType="decimal-pad"
                        editable={!isSubmitting}
                    />
                </View>

                {/* Weekly Limit (optional) */}
                <View style={styles.section}>
                    <View style={styles.toggleRow}>
                        <Text style={[styles.sectionTitle, { color: '#FFF' }]}>
                            Weekly Limit
                        </Text>
                        <Switch
                            value={weeklyEnabled}
                            onValueChange={setWeeklyEnabled}
                            trackColor={{ false: '#334155', true: colors.primaryLight }}
                            thumbColor={weeklyEnabled ? colors.primary : '#94A3B8'}
                            disabled={isSubmitting}
                        />
                    </View>
                    {weeklyEnabled && (
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    color: '#FFF',
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                },
                            ]}
                            value={weeklyLimit}
                            onChangeText={setWeeklyLimit}
                            placeholder="e.g. 300"
                            placeholderTextColor="#94A3B8"
                            keyboardType="decimal-pad"
                            editable={!isSubmitting}
                        />
                    )}
                </View>

                {/* Monthly Limit (optional) */}
                <View style={styles.section}>
                    <View style={styles.toggleRow}>
                        <Text style={[styles.sectionTitle, { color: '#FFF' }]}>
                            Monthly Limit
                        </Text>
                        <Switch
                            value={monthlyEnabled}
                            onValueChange={setMonthlyEnabled}
                            trackColor={{ false: '#334155', true: colors.primaryLight }}
                            thumbColor={monthlyEnabled ? colors.primary : '#94A3B8'}
                            disabled={isSubmitting}
                        />
                    </View>
                    {monthlyEnabled && (
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    color: '#FFF',
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                },
                            ]}
                            value={monthlyLimit}
                            onChangeText={setMonthlyLimit}
                            placeholder="e.g. 1200"
                            placeholderTextColor="#94A3B8"
                            keyboardType="decimal-pad"
                            editable={!isSubmitting}
                        />
                    )}
                </View>

                {/* Currency Selector */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: '#FFF' }]}>Currency</Text>
                    <View style={styles.currencyRow}>
                        {SUPPORTED_CURRENCIES.map((cur) => {
                            const isSelected = currency === cur;
                            return (
                                <TouchableOpacity
                                    key={cur}
                                    style={[
                                        styles.currencyChip,
                                        {
                                            backgroundColor: isSelected ? colors.primary : 'rgba(255, 255, 255, 0.06)',
                                            borderColor: isSelected ? colors.primary : 'rgba(255, 255, 255, 0.1)',
                                        },
                                        isSelected && shadows.sm,
                                    ]}
                                    onPress={() => setCurrency(cur)}
                                    disabled={isSubmitting}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.currencyText,
                                            { color: isSelected ? colors.primaryText : '#94A3B8' },
                                        ]}
                                    >
                                        {cur}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={gradients.primary as unknown as [string, string, ...string[]]}
                        style={[styles.saveButton, shadows.md]}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.saveText}>
                                {isEditing ? 'Update Budget' : 'Create Budget'}
                            </Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    content: {
        paddingHorizontal: spacing.xxl,
        paddingBottom: spacing.xxxl,
    },
    pageTitle: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.heavy,
        letterSpacing: -0.5,
        marginBottom: spacing.lg,
    },
    description: {
        fontSize: fontSize.md,
        lineHeight: 22,
        marginBottom: spacing.xxl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.sm,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.lg,
        fontSize: fontSize.lg,
    },
    currencyRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        // gap removed; apply margins on chips
    },
    currencyChip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        marginRight: spacing.sm / 2,
        marginBottom: spacing.sm,
    },
    currencyText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    saveButton: {
        height: 56,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
    },
    saveText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: '#FFF',
    },
});
