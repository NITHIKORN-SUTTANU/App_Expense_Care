/**
 * Home screen — tab ①
 *
 * Bold dashboard with:
 * - Big greeting + gradient accent
 * - Budget ring with large budget numbers
 * - Colorful period cards
 * - Recent expenses in rounded cards
 * - Glowing FAB
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BudgetProgressBar } from '../../src/components/BudgetProgressBar';

import { EmptyState } from '../../src/components/EmptyState';
import { ExpenseCard } from '../../src/components/ExpenseCard';
import { StreakCard } from '../../src/components/StreakCard';
import { SwipeableRow } from '../../src/components/SwipeableRow';
import { SyncIndicator } from '../../src/components/SyncIndicator';
import { WarningBanner } from '../../src/components/WarningBanner';
import {
  borderRadius,
  fontSize,
  fontWeight,
  gradients,
  shadows,
  spacing,
} from '../../src/constants/colors';
import { APP_NAME, HOME_RECENT_EXPENSES_COUNT } from '../../src/constants/config';
import { getLifeQuote } from '../../src/constants/quotes';
import { useAuth } from '../../src/context/AuthContext';
import { useBudgetContext } from '../../src/context/BudgetContext';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { BudgetHealthStatus } from '../../src/types';
import { getPeriodLabel } from '../../src/utils/dateHelpers';
import { formatCurrency } from '../../src/utils/formatCurrency';
import { calculateBudgetStreak } from '../../src/utils/streakCalculations';

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { budget, expenses, statuses, deleteExpense } = useBudgetContext();

  const [quote] = useState(getLifeQuote());

  const recentExpenses = useMemo(
    () => expenses.slice(0, HOME_RECENT_EXPENSES_COUNT),
    [expenses]
  );

  const streak = useMemo(
    () => budget ? calculateBudgetStreak(expenses, budget.dailyLimit, budget.startDate) : null,
    [expenses, budget]
  );


  const handleOpenSheet = useCallback(() => router.push('/add-expense'), [router]);
  const handleSetupBudget = useCallback(() => router.push('/budget-setup'), [router]);

  const handleDelete = useCallback(
    (expense: any) => {
      Alert.alert(
        'Delete Expense',
        `Remove "${expense.note || 'Expense'}"?`,
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



  // No budget
  if (!budget || !statuses) {
    return (
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={styles.container}
      >
        <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <Text style={[styles.greeting, { color: '#FFF' }]}>
            Hello, {user?.displayName || 'there'}! 👋
          </Text>
          <Text style={[styles.subtitle, { color: '#94A3B8' }]}>
            {APP_NAME}
          </Text>
        </View>
        <EmptyState
          icon="wallet-outline"
          title="Set Up Your Budget"
          subtitle="Add a daily budget to start tracking your expenses."
          actionLabel="Set Up Budget"
          onAction={handleSetupBudget}
        />
      </LinearGradient>
    );

  }

  const daily = statuses.daily;
  const weekly = statuses.weekly;
  const monthly = statuses.monthly;
  const currency = budget.currency;

  const getStatusColor = (status: BudgetHealthStatus) =>
    status === 'over' ? colors.budgetOver
      : status === 'warning' ? colors.budgetWarning
        : colors.budgetSafe;


  const getStatusGradient = (status: BudgetHealthStatus) =>
    status === 'over' ? gradients.danger
      : status === 'warning' ? gradients.warm
        : gradients.primary;

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#0F172A']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting + Sync */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: '#FFF' }]}>
              {quote}
            </Text>
            <Text style={[styles.subtitle, { color: '#94A3B8' }]}>
              {getPeriodLabel('daily')}
            </Text>
          </View>
          <SyncIndicator />
        </Animated.View>

        {/* Budget Hero Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <LinearGradient
            colors={getStatusGradient(daily.status) as unknown as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroCard, shadows.lg]}
          >
            <View>
              <View style={styles.heroTop}>
                <View style={styles.heroTextBlock}>
                  <Text style={styles.heroLabel}>Today&apos;s Spending</Text>
                  <Text
                    style={styles.heroAmount}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.5}
                  >
                    {formatCurrency(daily.totalSpent, currency)}
                  </Text>
                  <Text style={styles.heroRemaining}>
                    {daily.remaining >= 0
                      ? `${formatCurrency(daily.remaining, currency)} left`
                      : `${formatCurrency(Math.abs(daily.remaining), currency)} over`}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <Text style={styles.statusText}>
                    {daily.remaining === 0 ? 'Max Limit' :
                      daily.remaining < 0 ? 'Over Limit' :
                        daily.status === 'warning' ? 'Nearing Limit' : 'On Track'}
                  </Text>
                </View>
              </View>
              <BudgetProgressBar
                status={daily}
                limitAmount={budget.dailyLimit}
                currency={currency}
              />
            </View>
          </LinearGradient>
        </Animated.View>



        {/* Warning */}
        {daily.status !== 'safe' && (
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={{ marginBottom: spacing.xl }}
          >
            <WarningBanner
              status={daily.status}
              message={
                daily.status === 'over'
                  ? (daily.remaining === 0
                    ? "You've reached your daily budget limit"
                    : `You've exceeded your daily budget by ${formatCurrency(Math.abs(daily.remaining), currency)}`)
                  : `You've used ${Math.round(daily.percentUsed)}% of your daily budget`
              }
            />
          </Animated.View>
        )}

        {/* Period Cards */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.periodRow}>
          {/* Weekly card */}
          {weekly && (
            <View style={[styles.periodCard, styles.glassCard, shadows.sm]}>
              <View style={[styles.periodDot, { backgroundColor: getStatusColor(weekly.status) }]} />
              <Text style={[styles.periodLabel, { color: '#94A3B8' }]}>This Week</Text>
              <Text style={[styles.periodAmount, { color: '#FFF' }]}>
                {formatCurrency(weekly.totalSpent, currency)}
              </Text>
              <Text style={[styles.periodRemaining, { color: getStatusColor(weekly.status) }]}>
                {weekly.remaining >= 0
                  ? `${formatCurrency(weekly.remaining, currency)} left`
                  : `${formatCurrency(Math.abs(weekly.remaining), currency)} over`}
              </Text>
              {/* Usage Bar */}
              <View style={styles.usageBarBg}>
                <View
                  style={[
                    styles.usageBarFill,
                    {
                      width: `${Math.min(weekly.percentUsed, 100)}%`,
                      backgroundColor: getStatusColor(weekly.status),
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Monthly card */}
          {monthly && (
            <View style={[styles.periodCard, styles.glassCard, shadows.sm]}>
              <View style={[styles.periodDot, { backgroundColor: getStatusColor(monthly.status) }]} />
              <Text style={[styles.periodLabel, { color: '#94A3B8' }]}>This Month</Text>
              <Text style={[styles.periodAmount, { color: '#FFF' }]}>
                {formatCurrency(monthly.totalSpent, currency)}
              </Text>
              <Text style={[styles.periodRemaining, { color: getStatusColor(monthly.status) }]}>
                {monthly.remaining >= 0
                  ? `${formatCurrency(monthly.remaining, currency)} left`
                  : `${formatCurrency(Math.abs(monthly.remaining), currency)} over`}
              </Text>
              {/* Usage Bar */}
              <View style={styles.usageBarBg}>
                <View
                  style={[
                    styles.usageBarFill,
                    {
                      width: `${Math.min(monthly.percentUsed, 100)}%`,
                      backgroundColor: getStatusColor(monthly.status),
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </Animated.View>

        {/* Streak Card */}
        {streak && (
          <Animated.View entering={FadeInDown.delay(350).duration(500)}>
            <StreakCard streak={streak} />
          </Animated.View>
        )}

        {/* Recent Expenses */}
        <Animated.View entering={FadeInDown.delay(450).duration(500)}>
          <Text style={[styles.sectionTitle, { color: '#FFF' }]}>Recent</Text>
          {recentExpenses.length === 0 ? (
            <View style={[styles.emptyCard, styles.glassCard, shadows.sm]}>
              <Ionicons name="receipt-outline" size={32} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: '#94A3B8' }]}>
                No expenses today
              </Text>
            </View>
          ) : (
            <View style={[styles.expensesCard, styles.glassCard, shadows.sm]}>
              {recentExpenses.map((expense, index) => (
                <View key={expense.id}>
                  {index > 0 && <View style={[styles.divider, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]} />}
                  <SwipeableRow onDelete={() => handleDelete(expense)}>
                    <ExpenseCard
                      expense={expense}
                      currency={currency}
                      onPress={() => router.push({ pathname: '/edit-expense', params: { id: expense.id } })}
                    />
                  </SwipeableRow>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <Animated.View
        entering={FadeInUp.delay(600).springify()}
        style={[styles.fabContainer, { bottom: insets.bottom + 24 }]}
      >
        <TouchableOpacity onPress={handleOpenSheet} activeOpacity={0.85}>
          <LinearGradient
            colors={gradients.primary as unknown as [string, string, ...string[]]}
            style={[styles.fab, shadows.glow]}
          >
            <Ionicons name="add" size={30} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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

  // ─── Header ───────────────────────────────────────────
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
    marginTop: spacing.sm,
    maxWidth: '85%',
  },
  subtitle: {
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },

  // ─── Hero Card ────────────────────────────────────────
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    marginBottom: spacing.xl,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextBlock: {
    flex: 1,
    marginRight: spacing.lg,
  },
  heroLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroAmount: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.heavy,
    color: '#FFF',
    marginTop: spacing.xs,
    letterSpacing: -1,
  },
  heroRemaining: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFF',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ─── Period Cards ─────────────────────────────────────
  periodRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  periodCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  periodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  periodLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  periodAmount: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  periodRemaining: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
  },
  usageBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  usageBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // ─── Expenses ─────────────────────────────────────────
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  expensesCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  emptyCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.lg,
  },

  // ─── FAB ──────────────────────────────────────────────
  fabContainer: {
    position: 'absolute',
    right: spacing.xxl,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
