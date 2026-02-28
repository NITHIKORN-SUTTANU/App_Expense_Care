/**
 * MonthPicker — A month selection modal matching the CustomDatePicker style.
 *
 * Allows users to pick a specific month and year, matching the
 * visual design of the CustomDatePicker used for week selection.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, fontSize, fontWeight, shadows, spacing } from '../constants/colors';
import { useThemeColors } from '../hooks/useThemeColors';

const MONTHS = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December',
];

const SHORT_MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface MonthPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (date: Date) => void;
    selectedDate: Date;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({
    visible,
    onClose,
    onSelect,
    selectedDate,
}) => {
    const colors = useThemeColors();

    const [currentYear, setCurrentYear] = React.useState(selectedDate.getFullYear());
    const [isYearPickerVisible, setIsYearPickerVisible] = React.useState(false);

    // Sync when modal opens
    React.useEffect(() => {
        if (visible) {
            setCurrentYear(selectedDate.getFullYear());
            setIsYearPickerVisible(false);
        }
    }, [visible, selectedDate]);

    const handleYearSelect = (year: number) => {
        setCurrentYear(year);
        setIsYearPickerVisible(false);
    };

    const handleMonthSelect = (monthIndex: number) => {
        const d = new Date(currentYear, monthIndex, 1);
        onSelect(d);
    };

    const years = React.useMemo(() => {
        const thisYear = new Date().getFullYear();
        const startYear = thisYear - 50;
        const yearsList = [];
        for (let i = startYear; i <= thisYear; i++) {
            yearsList.push(i);
        }
        return yearsList.reverse();
    }, []);

    const nowMonth = new Date().getMonth();
    const nowYear = new Date().getFullYear();

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <Pressable
                    style={[styles.container, { backgroundColor: '#1E293B' }]}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Header — identical to CustomDatePicker */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.yearButton}
                            onPress={() => setIsYearPickerVisible(!isYearPickerVisible)}
                        >
                            <Text style={[styles.title, { color: '#FFF' }]}>
                                {currentYear}
                            </Text>
                            <Ionicons
                                name={isYearPickerVisible ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#94A3B8"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    {/* Year list — identical to CustomDatePicker */}
                    {isYearPickerVisible ? (
                        <View style={styles.yearListContainer}>
                            <FlatList
                                data={years}
                                keyExtractor={(item) => item.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.yearItem,
                                            item === currentYear && { backgroundColor: colors.primary },
                                        ]}
                                        onPress={() => handleYearSelect(item)}
                                    >
                                        <Text style={[
                                            styles.yearText,
                                            item === currentYear ? { color: '#FFF' } : { color: '#94A3B8' },
                                        ]}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                                initialNumToRender={15}
                                getItemLayout={(data, index) => (
                                    { length: 48, offset: 48 * index, index }
                                )}
                            />
                        </View>
                    ) : (
                        /* Month grid — 4 rows × 3 columns */
                        <View style={styles.monthGrid}>
                            {SHORT_MONTHS.map((label, i) => {
                                const isSelected = selectedDate.getMonth() === i && selectedDate.getFullYear() === currentYear;
                                const isCurrent = nowMonth === i && nowYear === currentYear;
                                const isFuture = currentYear > nowYear || (currentYear === nowYear && i > nowMonth);
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => !isFuture && handleMonthSelect(i)}
                                        disabled={isFuture}
                                        style={[
                                            styles.monthCell,
                                            isSelected && { backgroundColor: colors.primary },
                                            isCurrent && !isSelected && styles.monthCellCurrent,
                                            isFuture && { opacity: 0.3 },
                                        ]}
                                    >
                                        <Text style={[
                                            styles.monthCellText,
                                            isSelected && { color: '#FFF', fontWeight: fontWeight.bold },
                                            isCurrent && !isSelected && { color: colors.primary },
                                        ]}>
                                            {label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {/* Footer — "This Month" button (only when showing months) */}
                    {!isYearPickerVisible && (
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.footerButton, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
                                onPress={() => {
                                    setCurrentYear(nowYear);
                                    onSelect(new Date(nowYear, nowMonth, 1));
                                }}
                            >
                                <Text style={[styles.footerButtonText, { color: '#FFF' }]}>
                                    This Month
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Pressable>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    container: {
        width: '100%',
        maxWidth: 360,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        ...shadows.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.sm,
        paddingTop: spacing.sm,
    },
    title: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    yearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        // gap removed; use child margins
        padding: spacing.xs,
    },
    yearListContainer: {
        height: 340,
        marginTop: spacing.sm,
    },
    yearItem: {
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderRadius: borderRadius.md,
        marginVertical: 2,
    },
    yearText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.medium,
    },
    closeButton: {
        padding: spacing.xs,
    },

    // ─── Month Grid ──────────────────────────────────
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.sm,
        justifyContent: 'center',
    },
    monthCell: {
        width: '30%',
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        margin: spacing.xs,
    },
    monthCellCurrent: {
        borderWidth: 1.5,
        borderColor: 'rgba(52, 211, 153, 0.5)',
    },
    monthCellText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: '#94A3B8',
    },

    // ─── Footer ──────────────────────────────────────
    footer: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    footerButton: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerButtonText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
});
