/**
 * Login screen — Bold & Colorful.
 *
 * Full-screen gradient background, large rounded inputs,
 * vibrant button with glow shadow, playful layout.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, fontSize, fontWeight, gradients, shadows, spacing } from '../src/constants/colors';
import { APP_NAME } from '../src/constants/config';
import { useAuth } from '../src/context/AuthContext';
import { useThemeColors } from '../src/hooks/useThemeColors';

export default function LoginScreen() {
    const colors = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = useCallback(async () => {
        if (!email.trim() || !password) {
            Alert.alert('Missing Fields', 'Please enter both email and password.');
            return;
        }

        setIsSubmitting(true);
        try {
            await login(email.trim(), password);
            router.replace('/(tabs)');
        } catch (error: any) {
            const message =
                error?.code === 'auth/invalid-credential'
                    ? 'Invalid email or password. Please try again.'
                    : error?.code === 'auth/too-many-requests'
                        ? 'Too many login attempts. Please try again later.'
                        : error?.message ?? 'An error occurred. Please try again.';
            Alert.alert('Login Failed', message);
        } finally {
            setIsSubmitting(false);
        }
    }, [email, password, login, router]);

    return (
        <LinearGradient
            colors={['#0F172A', '#1E293B', '#0F172A']}
            style={styles.container}
        >
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingTop: insets.top + spacing.huge },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    {/* Brand */}
                    <View style={styles.brandSection}>
                        <LinearGradient
                            colors={gradients.fresh as unknown as [string, string, ...string[]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconCircle}
                        >
                            <Ionicons name="wallet" size={36} color="#FFF" />
                        </LinearGradient>
                        <Text style={styles.brandName}>{APP_NAME}</Text>
                        <Text style={styles.tagline}>
                            Your money, your way 💸
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Welcome back</Text>

                        {/* Email */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor="#94A3B8"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>

                        {/* Password */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#94A3B8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#94A3B8"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isSubmitting}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={gradients.primary as unknown as [string, string, ...string[]]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.button, shadows.glow]}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Sign In</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
                        <Link href="/register" asChild>
                            <TouchableOpacity>
                                <Text style={styles.footerLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.xxl,
        paddingBottom: spacing.huge,
    },

    // ─── Brand ──────────────────────────────────────────
    brandSection: {
        alignItems: 'center',
        marginBottom: spacing.huge,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    brandName: {
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.heavy,
        color: '#FFF',
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: fontSize.lg,
        color: '#94A3B8',
        marginTop: spacing.xs,
    },

    // ─── Form Card ──────────────────────────────────────
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: borderRadius.xl,
        padding: spacing.xxl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    formTitle: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: '#FFF',
        marginBottom: spacing.xxl,
    },

    // ─── Inputs ─────────────────────────────────────────
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        height: 56,
    },
    inputIcon: {
        marginRight: spacing.md,
    },
    input: {
        flex: 1,
        fontSize: fontSize.md,
        color: '#FFF',
        height: '100%',
    },

    // ─── Button ─────────────────────────────────────────
    button: {
        height: 56,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.sm,
    },
    buttonText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: '#FFF',
        letterSpacing: 0.5,
    },

    // ─── Footer ─────────────────────────────────────────
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.xxxl,
    },
    footerText: {
        fontSize: fontSize.md,
        color: '#94A3B8',
    },
    footerLink: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: '#34D399',
    },
});
