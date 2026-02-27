import * as d3Shape from 'd3-shape';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { borderRadius, fontSize, fontWeight, spacing } from '../constants/colors';
import { useThemeColors } from '../hooks/useThemeColors';
import { ForecastResult } from '../utils/forecastCalculations';
import { formatCurrency } from '../utils/formatCurrency';

interface TrendForecastCardProps {
    forecast: ForecastResult;
    monthlyLimit: number;
    currency: string;
}

export function TrendForecastCard({ forecast, monthlyLimit, currency }: TrendForecastCardProps) {
    const colors = useThemeColors();

    const {
        totalSpent,
        projectedTotal,
        safeDailyLimit,
        status,
        daysElapsed,
        daysRemaining
    } = forecast;

    const totalDays = daysElapsed + daysRemaining;

    // Chart Dimensions
    const CHART_HEIGHT = 120;
    const CHART_WIDTH = 300; // Fixed inner width for simple viewBox scaling
    const PADDING_TOP = 20;
    const PADDING_BOTTOM = 20;
    const DRAWABLE_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    // Y-Scale Domain: Max between budget limit and projected overspend
    const maxY = Math.max(monthlyLimit, projectedTotal) * 1.1; // 10% headroom
    const minY = 0;

    // X-Scale Domain: Day 0 to Total Days
    const scaleX = (day: number) => (day / totalDays) * CHART_WIDTH;
    const scaleY = (amount: number) => {
        const ratio = amount / maxY;
        return CHART_HEIGHT - PADDING_BOTTOM - (ratio * DRAWABLE_HEIGHT);
    };

    // Actual Spend Line Data (Points 0 to daysElapsed)
    // For a robust visual, we just draw a straight line from (0,0) to (daysElapsed, totalSpent)
    // representing the average burn so far. A true daily historical line requires historical aggregating.
    const actualSpendData: [number, number][] = [
        [0, 0],
        [daysElapsed, totalSpent]
    ];

    // Projected Spend Line Data (Points daysElapsed to totalDays)
    const projectedSpendData: [number, number][] = [
        [daysElapsed, totalSpent],
        [totalDays, projectedTotal]
    ];

    const lineGenerator = d3Shape.line<[number, number]>()
        .x(d => scaleX(d[0]))
        .y(d => scaleY(d[1]))
        .curve(d3Shape.curveLinear);

    const actualPath = lineGenerator(actualSpendData) || '';
    const projectedPath = lineGenerator(projectedSpendData) || '';

    // Y coordinates for key horizontal lines
    const budgetLimitY = scaleY(monthlyLimit);
    const projectedEndY = scaleY(projectedTotal);

    // Dynamic coloring based on status
    const statusColor = status === 'over' ? colors.budgetOver
        : status === 'warning' ? colors.budgetWarning
            : colors.budgetSafe;

    const statusTitle = status === 'over' ? 'Danger'
        : status === 'warning' ? 'Watch Out'
            : 'On Track';

    const statusMessage = status === 'over'
        ? `Projected to overspend by ${formatCurrency(projectedTotal - monthlyLimit, currency)}`
        : status === 'warning'
            ? `Nearing your monthly limit`
            : `Projected to save ${formatCurrency(monthlyLimit - projectedTotal, currency)}`;

    return (
        <View style={[styles.card, { backgroundColor: 'rgba(255, 255, 255, 0.06)' }]}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Monthly Forecast</Text>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {statusTitle}
                    </Text>
                </View>
                <View style={styles.safeAmountContainer}>
                    <Text style={styles.safeLabel}>Safe to spend</Text>
                    <Text style={styles.safeAmount}>
                        {formatCurrency(safeDailyLimit, currency)}<Text style={{ fontSize: fontSize.xs }}>/day</Text>
                    </Text>
                </View>
            </View>

            {/* Message */}
            <Text style={styles.messageText}>{statusMessage}</Text>

            {/* SVG Chart */}
            <View style={styles.chartContainer}>
                <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
                    {/* Budget Limit Line */}
                    <Line
                        x1="0"
                        y1={budgetLimitY}
                        x2={CHART_WIDTH}
                        y2={budgetLimitY}
                        stroke={colors.budgetOver}
                        strokeWidth="1"
                        strokeOpacity="0.5"
                        strokeDasharray="4 4"
                    />

                    {/* Actual Spend Line */}
                    <Path
                        d={actualPath}
                        stroke={colors.primary}
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Projected Spend Line */}
                    <Path
                        d={projectedPath}
                        stroke={statusColor}
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="6 6"
                    />

                    {/* Today Marker */}
                    <Circle
                        cx={scaleX(daysElapsed)}
                        cy={scaleY(totalSpent)}
                        r="5"
                        fill={colors.primary}
                        stroke="#1E293B"
                        strokeWidth="2"
                    />

                    {/* End Marker */}
                    <Circle
                        cx={scaleX(totalDays)}
                        cy={projectedEndY}
                        r="4"
                        fill={statusColor}
                    />

                </Svg>
            </View>

            <View style={styles.axisLabels}>
                <Text style={styles.axisText}>Day 1</Text>
                <Text style={styles.axisText}>Today</Text>
                <Text style={styles.axisText}>Day {totalDays}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: '#FFF',
    },
    statusText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        marginTop: 2,
    },
    safeAmountContainer: {
        alignItems: 'flex-end',
    },
    safeLabel: {
        fontSize: fontSize.xs,
        color: '#94A3B8',
        fontWeight: fontWeight.medium,
        textTransform: 'uppercase',
    },
    safeAmount: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: '#FFF',
    },
    messageText: {
        fontSize: fontSize.sm,
        color: '#CBD5E1',
        marginBottom: spacing.xl,
    },
    chartContainer: {
        height: 120,
        width: '100%',
    },
    axisLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    axisText: {
        fontSize: fontSize.xs,
        color: '#64748B',
    }
});
