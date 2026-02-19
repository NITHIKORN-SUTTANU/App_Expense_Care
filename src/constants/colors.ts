/**
 * Design tokens for Expense Care.
 *
 * Bold & colorful design system inspired by Revolut / Cash App.
 * Vibrant gradients, large radii, playful and modern feel.
 */

/** Base color palette */
export const palette = {
    // Primary brand — vibrant emerald/teal
    emerald50: '#ECFDF5',
    emerald100: '#D1FAE5',
    emerald400: '#34D399',
    emerald500: '#10B981',
    emerald600: '#059669',
    emerald700: '#047857',

    // Accent — electric purple
    purple400: '#A78BFA',
    purple500: '#8B5CF6',
    purple600: '#7C3AED',

    // Accent — vivid blue
    blue400: '#60A5FA',
    blue500: '#3B82F6',

    // Warning — vibrant amber
    amber50: '#FFFBEB',
    amber400: '#FBBF24',
    amber500: '#F59E0B',
    amber600: '#D97706',

    // Danger — bold rose
    rose50: '#FFF1F2',
    rose400: '#FB7185',
    rose500: '#F43F5E',
    rose600: '#E11D48',

    // Neutrals — softer tones
    white: '#FFFFFF',
    gray50: '#F8FAFC',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray300: '#CBD5E1',
    gray400: '#94A3B8',
    gray500: '#64748B',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1E293B',
    gray900: '#0F172A',
    black: '#000000',

    // Vibrant category colors
    categoryFood: '#F97316',
    categoryTransport: '#3B82F6',
    categoryShopping: '#EC4899',
    categoryEntertainment: '#8B5CF6',
    categoryBills: '#EAB308',
    categoryHealth: '#EF4444',
    categoryEducation: '#06B6D4',
    categoryOther: '#64748B',
} as const;

/** Theme color shape */
export interface ThemeColors {
    background: string;
    surface: string;
    surfaceElevated: string;
    card: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    primary: string;
    primaryDark: string;
    primaryLight: string;
    primaryText: string;
    budgetSafe: string;
    budgetWarning: string;
    budgetOver: string;
    budgetSafeBg: string;
    budgetWarningBg: string;
    budgetOverBg: string;
    border: string;
    borderLight: string;
    divider: string;
    icon: string;
    iconActive: string;
    placeholder: string;
    tabBar: string;
    tabBarBorder: string;
    tabActive: string;
    tabInactive: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    overlay: string;
    shimmer: string;
}

/** Light theme colors */
export const lightColors: ThemeColors = {
    // Backgrounds — soft cool gray
    background: '#F0F4F8',
    surface: palette.white,
    surfaceElevated: palette.white,
    card: palette.white,

    // Text — rich dark slate
    text: palette.gray900,
    textSecondary: palette.gray500,
    textTertiary: palette.gray400,
    textInverse: palette.white,

    // Primary actions
    primary: palette.emerald500,
    primaryDark: palette.emerald700,
    primaryLight: palette.emerald100,
    primaryText: palette.white,

    // Budget status
    budgetSafe: palette.emerald500,
    budgetWarning: palette.amber500,
    budgetOver: palette.rose500,
    budgetSafeBg: palette.emerald50,
    budgetWarningBg: palette.amber50,
    budgetOverBg: palette.rose50,

    // UI elements — borderless cards, soft dividers
    border: 'transparent',
    borderLight: palette.gray100,
    divider: palette.gray200,
    icon: palette.gray400,
    iconActive: palette.emerald500,
    placeholder: palette.gray400,

    // Tab bar
    tabBar: palette.white,
    tabBarBorder: 'transparent',
    tabActive: palette.emerald500,
    tabInactive: palette.gray400,

    // Semantic
    success: palette.emerald500,
    warning: palette.amber500,
    error: palette.rose500,
    info: palette.blue500,

    // Overlay
    overlay: 'rgba(15, 23, 42, 0.6)',
    shimmer: palette.gray200,
};

/** Dark theme colors */
export const darkColors: ThemeColors = {
    // Backgrounds — deep navy
    background: '#0F172A',
    surface: '#162032',
    surfaceElevated: '#1E293B',
    card: '#162032',

    // Text
    text: palette.gray50,
    textSecondary: palette.gray400,
    textTertiary: palette.gray500,
    textInverse: palette.gray900,

    // Primary actions
    primary: palette.emerald400,
    primaryDark: palette.emerald600,
    primaryLight: palette.emerald700,
    primaryText: palette.gray900,

    // Budget status
    budgetSafe: palette.emerald400,
    budgetWarning: palette.amber400,
    budgetOver: palette.rose400,
    budgetSafeBg: 'rgba(16, 185, 129, 0.15)',
    budgetWarningBg: 'rgba(245, 158, 11, 0.15)',
    budgetOverBg: 'rgba(244, 63, 94, 0.15)',

    // UI elements
    border: 'transparent',
    borderLight: 'rgba(255, 255, 255, 0.15)',
    divider: 'rgba(255, 255, 255, 0.08)',
    icon: palette.gray400,
    iconActive: palette.emerald400,
    placeholder: palette.gray500,

    // Tab bar
    tabBar: '#0F172A',
    tabBarBorder: 'transparent',
    tabActive: palette.emerald400,
    tabInactive: palette.gray500,

    // Semantic
    success: palette.emerald400,
    warning: palette.amber400,
    error: palette.rose400,
    info: palette.blue400,

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
    shimmer: palette.gray700,
};

/** Category colors shared across both themes */
export const categoryColors: Record<string, string> = {
    food: palette.categoryFood,
    transport: palette.categoryTransport,
    shopping: palette.categoryShopping,
    entertainment: palette.categoryEntertainment,
    bills: palette.categoryBills,
    health: palette.categoryHealth,
    education: palette.categoryEducation,
    other: palette.categoryOther,
} as const;

/** Spacing scale (in dp) — generous for bold layouts */
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
} as const;

/** Border radius — extra rounded for playful feel */
export const borderRadius = {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    xxl: 36,
    full: 9999,
} as const;

/** Font sizes — bold and impactful */
export const fontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 28,
    xxxl: 36,
    display: 48,
    hero: 56,
} as const;

/** Font weights */
export const fontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
};

/**
 * Cross-platform shadow presets.
 * Softer, more colorful shadows for the bold style.
 */
export const shadows = {
    sm: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    md: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
    },
    lg: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 20,
        elevation: 8,
    },
    glow: {
        shadowColor: palette.emerald500,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
} as const;

/** Vibrant gradient presets */
export const gradients = {
    primary: [palette.emerald400, palette.emerald600] as readonly [string, string],
    hero: ['#10B981', '#059669', '#047857'] as readonly string[],
    purple: [palette.purple400, palette.purple600] as readonly [string, string],
    sunset: ['#F97316', '#EC4899'] as readonly [string, string],
    ocean: ['#3B82F6', '#8B5CF6'] as readonly [string, string],
    fresh: ['#34D399', '#3B82F6'] as readonly [string, string],
    warm: ['#F59E0B', '#D97706'] as readonly [string, string],
    danger: ['#F43F5E', '#E11D48'] as readonly [string, string],
} as const;

/** Standard animation timings (ms) */
export const animationTiming = {
    fast: 200,
    normal: 400,
    slow: 800,
    ring: 1000,
} as const;
