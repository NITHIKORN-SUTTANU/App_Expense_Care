/**
 * Core TypeScript type definitions for Expense Care.
 *
 * All Firestore document shapes, enums, and derived types
 * are defined here for type-safety across the app.
 */

// ─── Firestore Document Types ────────────────────────────────────────────────

/** User profile stored at `users/{uid}` */
export interface User {
  uid: string;
  displayName: string;
  email: string;
  createdAt: Date;
}

/** Budget document stored at `users/{uid}/budgets/{budgetId}` */
export interface Budget {
  id: string;
  userId: string;
  dailyLimit: number;
  weeklyLimit: number | null;
  monthlyLimit: number | null;
  currency: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

/** Expense document stored at `users/{uid}/expenses/{expenseId}` */
export interface Expense {
  id: string;
  userId: string;
  budgetId: string;
  amount: number;
  category: CategoryKey;
  note: string;
  date: Date;
  createdAt: Date;
}

// ─── Category Types ──────────────────────────────────────────────────────────

/** All supported expense category keys */
export type CategoryKey =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'bills'
  | 'health'
  | 'education'
  | 'other';

/** Category definition with display metadata */
export interface CategoryDefinition {
  key: CategoryKey;
  label: string;
  icon: string;
  color: string;
}

// ─── Budget Status Types ─────────────────────────────────────────────────────

/** Budget health status based on spending percentage */
export type BudgetHealthStatus = 'safe' | 'warning' | 'over';

/** Time period for budget calculations */
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly';

/** Computed budget status for a single period */
export interface BudgetStatus {
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  status: BudgetHealthStatus;
}

/** Budget status across all active periods */
export interface AllBudgetStatuses {
  daily: BudgetStatus;
  weekly: BudgetStatus | null;
  monthly: BudgetStatus | null;
}

// ─── Category Summary Types ─────────────────────────────────────────────────

/** Single category's aggregated spending */
export interface CategorySummaryItem {
  category: CategoryKey;
  amount: number;
  percent: number;
}

/** Summary result for a given time period */
export interface PeriodSummary {
  total: number;
  categories: CategorySummaryItem[];
}

// ─── Form / Input Types ──────────────────────────────────────────────────────

/** Data required to create a new expense */
export interface CreateExpenseInput {
  amount: number;
  category: CategoryKey;
  note?: string;
  date: Date;
  budgetId: string;
}

/** Data required to create or update a budget */
export interface CreateBudgetInput {
  dailyLimit: number;
  weeklyLimit?: number | null;
  monthlyLimit?: number | null;
  currency: string;
  startDate: Date;
  endDate: Date;
}

// ─── Auth Types ──────────────────────────────────────────────────────────────

/** Authentication state managed by AuthContext */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
