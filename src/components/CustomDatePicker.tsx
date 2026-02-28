import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { borderRadius, fontSize, fontWeight, shadows, spacing } from '../constants/colors';
import { useThemeColors } from '../hooks/useThemeColors';
import { startOfWeek } from '../utils/dateHelpers';

interface CustomDatePickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (date: Date) => void;
    selectedDate: Date | null;
    /** When true, highlights the entire week (Mon–Sun) around the selected date */
    highlightWeek?: boolean;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    visible,
    onClose,
    onSelect,
    selectedDate,
    highlightWeek = false,
}) => {
    const colors = useThemeColors();

    const [currentMonth, setCurrentMonth] = React.useState(selectedDate || new Date());
    const [isYearPickerVisible, setIsYearPickerVisible] = React.useState(false);
    const [tempSelectedDate, setTempSelectedDate] = React.useState<Date | null>(selectedDate);

    // Sync temp date when modal opens
    React.useEffect(() => {
        if (visible) {
            setTempSelectedDate(selectedDate || new Date());
            setCurrentMonth(selectedDate || new Date());
        }
    }, [visible, selectedDate]);

    // Format date in local time to YYYY-MM-DD
    const formatDateLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const markedDates = React.useMemo(() => {
        if (!tempSelectedDate) return {};

        const selectedKey = formatDateLocal(tempSelectedDate);

        if (!highlightWeek) {
            return {
                [selectedKey]: {
                    selected: true,
                    selectedColor: colors.primary,
                },
            };
        }

        // Highlight entire week with individual circles
        const weekStart = startOfWeek(tempSelectedDate);
        const marks: Record<string, any> = {};

        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            const key = formatDateLocal(d);
            const isSelected = key === selectedKey;

            marks[key] = {
                selected: true,
                selectedColor: isSelected ? colors.primary : 'rgba(52, 211, 153, 0.15)',
                selectedTextColor: isSelected ? '#FFF' : '#94A3B8',
            };
        }

        return marks;
    }, [tempSelectedDate, highlightWeek, colors.primary]);

    const handleDayPress = (day: DateData) => {
        // Create date from timestamp to avoid timezone issues
        const date = new Date(day.year, day.month - 1, day.day);
        setTempSelectedDate(date);
    };

    const handleYearSelect = (year: number) => {
        const newDate = new Date(currentMonth);
        newDate.setFullYear(year);
        setCurrentMonth(newDate);
        setIsYearPickerVisible(false);
    };

    const handleConfirm = () => {
        if (tempSelectedDate) {
            onSelect(tempSelectedDate);
            onClose();
        }
    };

    const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 50; // 50 years back
        const endYear = currentYear;       // Current year only
        const yearsList = [];
        for (let i = startYear; i <= endYear; i++) {
            yearsList.push(i);
        }
        return yearsList.reverse(); // Newest first
    }, []);

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
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.yearButton}
                            onPress={() => setIsYearPickerVisible(!isYearPickerVisible)}
                        >
                            <Text style={[styles.title, { color: '#FFF' }]}>
                                {currentMonth.getFullYear()}
                            </Text>
                            <Ionicons
                                    name={isYearPickerVisible ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color="#94A3B8"
                                    style={styles.yearIcon}
                                />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#94A3B8" />
                        </TouchableOpacity>
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
                                            item === currentMonth.getFullYear() && { backgroundColor: colors.primary }
                                        ]}
                                        onPress={() => handleYearSelect(item)}
                                    >
                                        <Text style={[
                                            styles.yearText,
                                            item === currentMonth.getFullYear() ? { color: '#FFF' } : { color: '#94A3B8' }
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
                        <Calendar
                            // Basic styling
                            theme={{
                                backgroundColor: 'transparent',
                                calendarBackground: 'transparent',
                                textSectionTitleColor: '#94A3B8',
                                selectedDayBackgroundColor: colors.primary,
                                selectedDayTextColor: '#FFF',
                                todayTextColor: colors.primary,
                                dayTextColor: '#FFF',
                                textDisabledColor: '#475569',
                                dotColor: colors.primary,
                                selectedDotColor: '#FFF',
                                arrowColor: '#FFF',
                                disabledArrowColor: '#475569',
                                monthTextColor: '#FFF',
                                indicatorColor: colors.primary,
                                textDayFontWeight: '500',
                                textMonthFontWeight: 'bold',
                                textDayHeaderFontWeight: '500',
                                textDayFontSize: 14,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 12,
                            }}
                            // Behavior
                            current={formatDateLocal(currentMonth)}
                            key={currentMonth.toISOString()} // Force re-render when year changes
                            onDayPress={handleDayPress}
                            onMonthChange={(month) => {
                                const newDate = new Date(month.timestamp);
                                // Adjust for timezone offset if necessary, but timestamp is usually UTC midnight
                                // Creating a date from it and using getFullYear should be safe enough for year tracking
                                setCurrentMonth(newDate);
                            }}
                            markedDates={markedDates}
                            enableSwipeMonths={true}
                            maxDate={formatDateLocal(new Date())} // Restrict future dates
                        />
                    )}

                    {!isYearPickerVisible && (
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.footerButton, { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'transparent' }]}
                                onPress={() => {
                                    // Jump to today
                                    const today = new Date();
                                    setTempSelectedDate(today);
                                    setCurrentMonth(today);
                                }}
                            >
                                <Text style={[styles.footerButtonText, { color: '#FFF' }]}>
                                    Today
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.footerButton, { backgroundColor: colors.primary, borderColor: colors.primary, marginLeft: spacing.md }]}
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
        // gap removed; use icon/text margins
        padding: spacing.xs,
    },
    yearIcon: {
        marginLeft: spacing.xs,
    },
    yearListContainer: {
        height: 340, // Match Approx Calendar Height
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
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerButtonText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
});
