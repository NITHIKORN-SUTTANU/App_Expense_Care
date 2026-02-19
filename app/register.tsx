/**
 * Registration screen — Bold & Colorful.
 *
 * Matching dark gradient style with login.
 * Display name, email, password + confirm with visibility toggles.
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

export default function RegisterScreen() {
    const colors = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { register } = useAuth();

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleRegister = useCallback(async () => {
        if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.');
            return;
        }

        setIsSubmitting(true);
        try {
            await register(email.trim(), password, displayName.trim());
            router.replace('/(tabs)');
        } catch (error: any) {
            const message =
                error?.code === 'auth/email-already-in-use'
                    ? 'This email is already registered. Please sign in instead.'
                    : error?.code === 'auth/invalid-email'
                        ? 'Please enter a valid email address.'
                        : error?.message ?? 'An error occurred. Please try again.';
            Alert.alert('Registration Failed', message);
        } finally {
            setIsSubmitting(false);
        }
    }, [displayName, email, password, confirmPassword, register, router]);

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
                        { paddingTop: insets.top + spacing.xxxl },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    {/* Brand */}
                    <View style={styles.brandSection}>
                        <LinearGradient
                            colors={gradients.ocean as unknown as [string, string, ...string[]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconCircle}
                        >
                            <Ionicons name="person-add" size={32} color="#FFF" />
                        </LinearGradient>
                        <Text style={styles.brandName}>Join {APP_NAME}</Text>
                        <Text style={styles.tagline}>Start tracking in seconds ⚡</Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        {/* Display Name */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Display name"
                                placeholderTextColor="#94A3B8"
                                value={displayName}
                                onChangeText={setDisplayName}
                                autoCapitalize="words"
                                autoComplete="name"
                            />
                        </View>

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
                                placeholder="Password (6+ characters)"
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

                        {/* Confirm Password */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="shield-checkmark-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm password"
                                placeholderTextColor="#94A3B8"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirm}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirm(!showConfirm)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#94A3B8"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Create Account Button */}
                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={isSubmitting}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={gradients.ocean as unknown as [string, string, ...string[]]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.button, shadows.glow]}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Create Account</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.footerLink}>Sign In</Text>
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

    brandSection: {
        alignItems: 'center',
        marginBottom: spacing.xxxl,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    brandName: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.heavy,
        color: '#FFF',
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: fontSize.md,
        color: '#94A3B8',
        marginTop: spacing.xs,
    },

    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: borderRadius.xl,
        padding: spacing.xxl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },

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
        color: '#60A5FA',
    },
});
