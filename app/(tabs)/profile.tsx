/**
 * Profile screen — tab ④
 *
 * Bold user profile with gradient avatar,
 * budget info in rounded cards, and colorful action buttons.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontWeight, gradients, shadows, spacing } from '../../src/constants/colors';
import { APP_NAME, APP_VERSION } from '../../src/constants/config';
import { useAuth } from '../../src/context/AuthContext';
import { useBudgetContext } from '../../src/context/BudgetContext';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { formatCurrency } from '../../src/utils/formatCurrency';

export default function ProfileScreen() {
    const colors = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuth();
    const { budget } = useBudgetContext();

    const handleEditBudget = useCallback(() => router.push('/budget-setup'), [router]);

    const handleLogout = useCallback(async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await logout();
                        router.replace('/login');
                    } catch {
                        Alert.alert('Error', 'Failed to sign out.');
                    }
                },
            },
        ]);
    }, [logout, router]);


    const initial = (user?.displayName || user?.email || '?')[0].toUpperCase();

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
                {/* Avatar + Name */}
                <View style={styles.profileSection}>
                    <LinearGradient
                        colors={gradients.fresh as unknown as [string, string, ...string[]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatar}
                    >
                        <Text style={styles.avatarLetter}>{initial}</Text>
                    </LinearGradient>
                    <Text style={[styles.userName, { color: '#FFF' }]}>
                        {user?.displayName || 'User'}
                    </Text>
                    <Text style={[styles.userEmail, { color: '#94A3B8' }]}>
                        {user?.email}
                    </Text>
                </View>

                {/* Budget Card */}
                {budget && (
                    <View style={[styles.card, styles.glassCard, shadows.sm]}>
                        <Text style={[styles.cardTitle, { color: '#94A3B8' }]}>
                            Active Budget
                        </Text>
                        <Text style={[styles.budgetAmount, { color: colors.primary }]}>
                            {formatCurrency(budget.dailyLimit, budget.currency)} / day
                        </Text>
                        <View style={styles.budgetDetail}>
                            <Text style={[styles.detailLabel, { color: '#94A3B8' }]}>
                                Weekly
                            </Text>
                            <Text style={[styles.detailValue, { color: '#FFF' }]}>
                                {formatCurrency(budget.dailyLimit * 7, budget.currency)}
                            </Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]} />
                        <View style={styles.budgetDetail}>
                            <Text style={[styles.detailLabel, { color: '#94A3B8' }]}>
                                Monthly
                            </Text>
                            <Text style={[styles.detailValue, { color: '#FFF' }]}>
                                {formatCurrency(budget.dailyLimit * 30, budget.currency)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Actions */}
                <View style={[styles.card, styles.glassCard, shadows.sm]}>
                    <TouchableOpacity
                        style={styles.actionRow}
                        onPress={handleEditBudget}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#10B981' + '18' }]}>
                            <Ionicons name="wallet-outline" size={20} color="#10B981" />
                        </View>
                        <Text style={[styles.actionLabel, { color: '#FFF' }]}>
                            Edit Budget
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]} />

                    <TouchableOpacity
                        style={styles.actionRow}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#F43F5E' + '18' }]}>
                            <Ionicons name="log-out-outline" size={20} color="#F43F5E" />
                        </View>
                        <Text style={[styles.actionLabel, { color: '#F43F5E' }]}>
                            Sign Out
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <Text style={[styles.appInfo, { color: '#64748B' }]}>
                    {APP_NAME} v{APP_VERSION}
                </Text>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.huge,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },

    // ─── Profile ────────────────────────────────────────
    profileSection: {
        alignItems: 'center',
        marginBottom: spacing.xxxl,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    avatarLetter: {
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.heavy,
        color: '#FFF',
    },
    userName: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
    },
    userEmail: {
        fontSize: fontSize.md,
        marginTop: spacing.xs,
    },

    // ─── Card ───────────────────────────────────────────
    card: {
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        marginBottom: spacing.lg,
    },
    cardTitle: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
    },
    budgetAmount: {
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.heavy,
        letterSpacing: -0.5,
        marginBottom: spacing.xl,
    },
    budgetDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
    },
    detailLabel: {
        fontSize: fontSize.md,
    },
    detailValue: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
    },

    // ─── Actions ────────────────────────────────────────
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    actionLabel: {
        flex: 1,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },

    // ─── Footer ─────────────────────────────────────────
    appInfo: {
        textAlign: 'center',
        fontSize: fontSize.xs,
        marginTop: spacing.xl,
    },
});
