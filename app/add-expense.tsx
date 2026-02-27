
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    InputAccessoryView,
    Keyboard,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomDatePicker } from '../src/components/CustomDatePicker';
import { CATEGORIES } from '../src/constants/categories';
import { borderRadius, fontSize, fontWeight, gradients, shadows, spacing } from '../src/constants/colors';
import { MAX_NOTE_LENGTH } from '../src/constants/config';
import { useBudgetContext } from '../src/context/BudgetContext';
import { CategoryKey } from '../src/types';

export default function AddExpenseScreen() {
    const router = useRouter();
    const { addExpense } = useBudgetContext();

    // ─── Form State ──────────────────────────────────────────────────────────
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<CategoryKey>('food');
    const [note, setNote] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                date: selectedDate,
            });
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error?.message ?? 'Failed to add expense. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [amount, category, note, selectedDate, addExpense, router]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Add Expense</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={28} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {/* Amount */}
                <View style={styles.section}>
                    <Text style={styles.label}>Amount</Text>
                    <TextInput
                        style={styles.amountInput}
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
                    {Platform.OS === 'ios' && (
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
                    )}
                </View>

                {/* Category Selector */}
                <View style={styles.section}>
                    <Text style={styles.label}>Category</Text>
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

                {/* Date Selector */}
                <View style={styles.section}>
                    <Text style={styles.label}>Date</Text>
                    <TouchableOpacity
                        style={styles.dateSelector}
                        onPress={() => setShowDatePicker(true)}
                        disabled={isSubmitting}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#94A3B8" />
                        <Text style={styles.dateText}>
                            {selectedDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* Note */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                        Note (optional)
                    </Text>
                    <TextInput
                        style={styles.noteInput}
                        value={note}
                        onChangeText={setNote}
                        placeholder="What was this expense for?"
                        placeholderTextColor="#94A3B8"
                        maxLength={MAX_NOTE_LENGTH}
                        multiline
                        numberOfLines={2}
                        editable={!isSubmitting}
                        returnKeyType="default"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                    style={styles.submitContainer}
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
            </ScrollView>

            {/* Date Picker Modal */}
            <CustomDatePicker
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onSelect={(date) => {
                    setSelectedDate(date);
                    setShowDatePicker(false);
                }}
                selectedDate={selectedDate}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E293B',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
    },
    closeButton: {
        padding: spacing.xs,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: borderRadius.full,
    },
    content: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
    },
    title: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: '#FFF',
        letterSpacing: -0.5,
    },
    section: {
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        marginBottom: spacing.sm,
        color: '#94A3B8',
    },
    amountInput: {
        fontSize: fontSize.display,
        fontWeight: fontWeight.bold,
        borderBottomWidth: 2,
        paddingVertical: spacing.sm,
        textAlign: 'center',
        color: '#FFF',
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
    },
    categoryLabel: {
        fontSize: fontSize.xs,
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    dateText: {
        flex: 1,
        fontSize: fontSize.md,
        color: '#FFF',
        fontWeight: fontWeight.medium,
    },
    noteInput: {
        borderWidth: 1,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: fontSize.md,
        minHeight: 100, // Taller for full screen
        textAlignVertical: 'top',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        color: '#FFF',
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    submitContainer: {
        marginTop: spacing.md,
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
