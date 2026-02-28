/**
 * Add Expense bottom-sheet modal.
 *
 * Opens from the Home screen's FAB button.
 * Collects amount, category, optional note, and date.
 * Features elevated submit button and polished category chips.
 */

import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    InputAccessoryView,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { borderRadius, fontSize, fontWeight, gradients, shadows, spacing } from '../constants/colors';
import { MAX_NOTE_LENGTH } from '../constants/config';
import { useBudgetContext } from '../context/BudgetContext';
import { CategoryKey } from '../types';

interface AddExpenseSheetProps {
    /** Whether the sheet is visible */
    isOpen: boolean;
    /** Called when the sheet should close */
    onClose: () => void;
}

/**
 * Bottom-sheet modal for adding a new expense.
 * Validates inputs and submits via BudgetContext.
 */
export function AddExpenseSheet({ isOpen, onClose }: AddExpenseSheetProps) {
    const { addExpense } = useBudgetContext();
    const bottomSheetRef = useRef<BottomSheet>(null);

    // ─── Form State ──────────────────────────────────────────────────────────
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<CategoryKey>('food');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const snapPoints = useMemo(() => ['65%', '85%'], []);

    // ─── Reset form ──────────────────────────────────────────────────────────
    const resetForm = useCallback(() => {
        setAmount('');
        setCategory('food');
        setNote('');
    }, []);

    // ─── Submit handler ──────────────────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero.');
            return;
        }

        setIsSubmitting(true);
        try {
            await addExpense({
                amount: numericAmount,
                category,
                note: note.trim(),
                date: new Date(),
            });
            resetForm();
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error?.message ?? 'Failed to add expense. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [amount, category, note, addExpense, resetForm, onClose]);

    // ─── Close handler ────────────────────────────────────────────────────────
    const handleSheetChange = useCallback(
        (index: number) => {
            if (index === -1) onClose();
        },
        [onClose]
    );

    if (!isOpen) return null;

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose
            onChange={handleSheetChange}
            backgroundStyle={{ backgroundColor: '#1E293B' }}
            handleIndicatorStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', width: 40 }}
        >
            <BottomSheetView style={styles.content}>
                {/* Header */}
                <Text style={[styles.title, { color: '#FFF' }]}>Add Expense</Text>

                {/* Amount */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: '#94A3B8' }]}>Amount</Text>
                    <TextInput
                        style={[
                            styles.amountInput,
                            {
                                color: '#FFF',
                                borderBottomColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        ]}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        placeholderTextColor="#94A3B8"
                        keyboardType="decimal-pad"
                        autoFocus
                        editable={!isSubmitting}
                        inputAccessoryViewID="done_toolbar"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                    />
                    <InputAccessoryView nativeID="done_toolbar">
                        <View style={styles.accessory}>
                            <TouchableOpacity
                                onPress={Keyboard.dismiss}
                                style={styles.doneButton}
                            >
                                <Text style={styles.doneButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </InputAccessoryView>
                </View>

                {/* Category Selector */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: '#94A3B8' }]}>Category</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map((cat) => {
                            const isSelected = category === cat.key;
                            return (
                                <TouchableOpacity
                                    key={cat.key}
                                    style={[
                                        styles.categoryChip,
                                        {
                                            backgroundColor: isSelected ? `${cat.color}20` : 'rgba(255, 255, 255, 0.06)',
                                            borderColor: isSelected ? cat.color : 'rgba(255, 255, 255, 0.08)',
                                            borderWidth: 1,
                                            width: '48%', // 2 columns approx
                                        },
                                        isSelected && shadows.sm,
                                    ]}
                                    onPress={() => setCategory(cat.key)}
                                    disabled={isSubmitting}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={cat.icon as any}
                                        size={18}
                                        color={isSelected ? cat.color : '#94A3B8'}
                                        style={styles.catIcon}
                                    />
                                    <Text
                                        style={[
                                            styles.categoryLabel,
                                            {
                                                color: isSelected ? cat.color : '#FFF',
                                                fontWeight: isSelected ? fontWeight.semibold : fontWeight.medium,
                                            },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Note */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: '#94A3B8' }]}>
                        Note (optional)
                    </Text>
                    <TextInput
                        style={[
                            styles.noteInput,
                            {
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                color: '#FFF',
                                borderColor: 'rgba(255, 255, 255, 0.08)',
                            },
                        ]}
                        value={note}
                        onChangeText={setNote}
                        placeholder="What was this expense for?"
                        placeholderTextColor="#94A3B8"
                        maxLength={MAX_NOTE_LENGTH}
                        multiline
                        numberOfLines={2}
                        editable={!isSubmitting}
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={gradients.primary as unknown as [string, string, ...string[]]}
                        style={[styles.submitButton, shadows.glow]}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitText}>
                                Add Expense
                            </Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheet>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: spacing.xxl,
        paddingTop: spacing.sm,
    },
    title: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.heavy,
        marginBottom: spacing.xl,
        letterSpacing: -0.5,
    },
    section: {
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        marginBottom: spacing.sm,
    },
    amountInput: {
        fontSize: fontSize.display,
        fontWeight: fontWeight.bold,
        borderBottomWidth: 2,
        paddingVertical: spacing.sm,
        textAlign: 'center',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        // gap removed; apply margins on chips
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginBottom: spacing.sm,
        marginRight: spacing.sm / 2,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
    },
    catIcon: {
        marginRight: spacing.xs,
    },
    categoryLabel: {
        fontSize: fontSize.xs,
    },
    noteInput: {
        borderWidth: 1,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: fontSize.md,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    submitButton: {
        height: 56,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: '#FFF',
    },
    accessory: {
        width: '100%',
        height: 48,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingHorizontal: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    doneButton: {
        padding: spacing.sm,
    },
    doneButtonText: {
        color: '#34D399',
        fontWeight: fontWeight.bold,
        fontSize: fontSize.md,
    },
});
