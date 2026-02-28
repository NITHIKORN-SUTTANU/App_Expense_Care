import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { borderRadius, fontSize, fontWeight, shadows, spacing } from '../constants/colors';
import { useThemeColors } from '../hooks/useThemeColors';
import { hexWithAlpha } from '../utils/colorUtils';
import { formatDateLocal } from '../utils/dateHelpers';

export interface DateRange {
    start: Date;
    end: Date;
}

interface CustomDateRangePickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (range: DateRange) => void;
    initialRange?: DateRange | null;
}

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
    visible,
    onClose,
    onSelect,
    initialRange,
}) => {
    const colors = useThemeColors();

    const defaultDate = new Date();

    // We keep track of the month currently being viewed in the calendar
    const [currentMonth, setCurrentMonth] = useState(
        initialRange?.start ? new Date(initialRange.start) : new Date(defaultDate)
    );

    const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);

    // Mode toggle
    const [isRangeMode, setIsRangeMode] = useState(
        initialRange && initialRange.start.getTime() !== initialRange.end.getTime() ? true : false
    );

    // Selected dates
    const [startDate, setStartDate] = useState<Date | null>(initialRange?.start || defaultDate);
    const [endDate, setEndDate] = useState<Date | null>(initialRange?.end || defaultDate);

    // Sync when modal opens
    useEffect(() => {
        if (visible) {
            const start = initialRange?.start || new Date();
            const end = initialRange?.end || new Date();
            setStartDate(start);
            setEndDate(end);
            setCurrentMonth(new Date(start));
            setIsRangeMode(start.getTime() !== end.getTime());
            setIsYearPickerVisible(false);
        }
    }, [visible, initialRange]);

    // Handle day press logic for both modes
    const handleDayPress = (day: DateData) => {
        const selectedDate = new Date(day.year, day.month - 1, day.day);

        if (!isRangeMode) {
            // Single day mode
            setStartDate(selectedDate);
            setEndDate(selectedDate);
        } else {
            // Range mode logic
            if (!startDate || (startDate && endDate)) {
                // If nothing selected yet, OR both already selected -> start a new range
                setStartDate(selectedDate);
                setEndDate(null);
            } else if (startDate && !endDate) {
                // If only start is selected
                if (selectedDate.getTime() < startDate.getTime()) {
                    // Selected a date before the start date -> swap them
                    setEndDate(startDate);
                    setStartDate(selectedDate);
                } else {
                    // Selected a date after the start date -> set as end date
                    setEndDate(selectedDate);
                }
            }
        }
    };

    /**
     * Build the markedDates object expected by react-native-calendars markingType="period"
     */
    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};

        if (!startDate) return marks;

        const startStr = formatDateLocal(startDate);

        if (!isRangeMode || (startDate && !endDate) || (startDate && endDate && startDate.getTime() === endDate.getTime())) {
            // Single day selection
            marks[startStr] = {
                startingDay: true,
                endingDay: true,
                color: colors.primary,
                textColor: '#FFF',
            };
            return marks;
        }

        // We have a start and an end date
        if (startDate && endDate) {
            const endStr = formatDateLocal(endDate);

            // Mark start
            marks[startStr] = {
                startingDay: true,
                color: colors.primary,
                textColor: '#FFF',
            };

            // Mark end
            marks[endStr] = {
                endingDay: true,
                color: colors.primary,
                textColor: '#FFF',
            };

            // Mark in-between dates
            let curr = new Date(startDate);
            curr.setDate(curr.getDate() + 1);
            while (curr.getTime() < endDate.getTime()) {
                const currStr = formatDateLocal(curr);
                marks[currStr] = {
                    color: hexWithAlpha(colors.primary, '40'), // 25% opacity
                    textColor: '#FFF',
                };
                curr.setDate(curr.getDate() + 1);
            }
        }

        return marks;
    }, [startDate, endDate, isRangeMode, colors.primary]);

    const handleConfirm = () => {
        if (startDate) {
            onSelect({
                start: startDate,
                end: endDate || startDate, // Fallback to start if end not picked
            });
            onClose();
        }
    };

    const handleYearSelect = (year: number) => {
        const newDate = new Date(currentMonth);
        newDate.setFullYear(year);
        setCurrentMonth(newDate);
        setIsYearPickerVisible(false);
    };

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 50;
        const endYear = currentYear;
        const yearsList = [];
        for (let i = startYear; i <= endYear; i++) {
            yearsList.push(i);
        }
        return yearsList.reverse();
    }, []);

    // Format selected text for header
    const selectedText = useMemo(() => {
        if (!startDate) return 'Select Date';
        const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        if (!isRangeMode || (startDate && !endDate) || (startDate.getTime() === endDate?.getTime())) {
            return startStr;
        }

        if (startDate && endDate) {
            const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return `${startStr} - ${endStr}`;
        }
        return 'Select Date';
    }, [startDate, endDate, isRangeMode]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <Pressable
                    style={[styles.container, { backgroundColor: '#1E293B' }]}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.yearButton}
                            onPress={() => setIsYearPickerVisible(!isYearPickerVisible)}
                        >
                            <Text style={[styles.title, { color: '#FFF' }]}>
                                {currentMonth.getFullYear()}
                            </Text>
                            <Ionicons
                                name={isYearPickerVisible ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#94A3B8"
                                style={{ marginLeft: spacing.xs }}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    {/* Mode Toggle & Status */}
                    <View style={styles.modeContainer}>
                        <View style={styles.modeToggleRow}>
                            <Text style={styles.modeText}>Select Date Range</Text>
                            <Switch
                                value={isRangeMode}
                                onValueChange={(val) => {
                                    setIsRangeMode(val);
                                    if (!val && startDate) {
                                        // Switching to single mode, reset end date
                                        setEndDate(startDate);
                                    }
                                }}
                                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: hexWithAlpha(colors.primary, '80') }}
                                thumbColor={isRangeMode ? colors.primary : '#f4f3f4'}
                            />
                        </View>
                        <Text style={styles.selectedDateText}>{selectedText}</Text>
                    </View>

                    {isYearPickerVisible ? (
                        <View style={styles.yearListContainer}>
                            <FlatList
                                data={years}
                                keyExtractor={(item) => item.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.yearItem,
                                            item === currentMonth.getFullYear() && { backgroundColor: colors.primary },
                                        ]}
                                        onPress={() => handleYearSelect(item)}
                                    >
                                        <Text
                                            style={[
                                                styles.yearText,
                                                item === currentMonth.getFullYear() ? { color: '#FFF' } : { color: '#94A3B8' },
                                            ]}
                                        >
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                                initialNumToRender={15}
                                getItemLayout={(data, index) => ({ length: 48, offset: 48 * index, index })}
                            />
                        </View>
                    ) : (
                        <Calendar
                            markingType="period"
                            theme={{
                                backgroundColor: 'transparent',
                                calendarBackground: 'transparent',
                                textSectionTitleColor: '#94A3B8',
                                todayTextColor: colors.primary,
                                dayTextColor: '#FFF',
                                textDisabledColor: '#475569',
                                arrowColor: '#FFF',
                                disabledArrowColor: '#475569',
                                monthTextColor: '#FFF',
                                textDayFontWeight: '500',
                                textMonthFontWeight: 'bold',
                                textDayHeaderFontWeight: '500',
                                textDayFontSize: 14,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 12,
                            }}
                            current={formatDateLocal(currentMonth)}
                            key={currentMonth.toISOString()}
                            onDayPress={handleDayPress}
                            onMonthChange={(month) => {
                                setCurrentMonth(new Date(month.timestamp));
                            }}
                            markedDates={markedDates}
                            enableSwipeMonths={true}
                            maxDate={formatDateLocal(new Date())}
                        />
                    )}

                    {!isYearPickerVisible && (
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.footerButton, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
                                onPress={() => {
                                    const today = new Date();
                                    setStartDate(today);
                                    setEndDate(today);
                                    setCurrentMonth(today);
                                }}
                            >
                                <Text style={[styles.footerButtonText, { color: '#FFF' }]}>
                                    Today
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.footerButton,
                                    { backgroundColor: colors.primary },
                                    { marginLeft: spacing.md },
                                    isRangeMode && !endDate && { opacity: 0.5 } // Disabled if waiting for end date
                                ]}
                                disabled={isRangeMode && !endDate}
                                onPress={handleConfirm}
                            >
                                <Text style={[styles.footerButtonText, { color: '#FFF' }]}>
                                    Confirm
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
        maxWidth: 380,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        ...shadows.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        padding: spacing.xs,
    },
    closeButton: {
        padding: spacing.xs,
    },
    modeContainer: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: spacing.sm,
    },
    modeToggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    modeText: {
        color: '#CBD5E1',
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    selectedDateText: {
        color: '#FFF',
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        textAlign: 'center',
        marginTop: spacing.xs,
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    footerButton: {
        flex: 1,
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
