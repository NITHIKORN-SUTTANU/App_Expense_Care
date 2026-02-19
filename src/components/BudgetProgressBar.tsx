import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { animationTiming, fontSize, fontWeight, spacing } from '../constants/colors';
import { BudgetStatus } from '../types';

import { formatCurrency } from '../utils/formatCurrency';

interface BudgetProgressBarProps {
    status: BudgetStatus;
    height?: number;
    showPercentage?: boolean;
    limitAmount?: number;
    currency?: string;
}

export function BudgetProgressBar({
    status,
    height = 12,
    showPercentage = true,
    limitAmount,
    currency,
}: BudgetProgressBarProps) {
    const progress = Math.min(Math.max(status.percentUsed, 0), 100) / 100;
    const animatedProgress = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withTiming(progress, {
            duration: animationTiming.normal,
            easing: Easing.out(Easing.cubic),
        });
    }, [progress]);

    const progressStyle = useAnimatedStyle(() => {
        return {
            width: `${animatedProgress.value * 100}%`,
        };
    });

    return (
        <View style={styles.container}>
            <View style={[styles.track, { height, borderRadius: height / 2 }]}>
                <Animated.View
                    style={[
                        styles.bar,
                        { height, borderRadius: height / 2 },
                        progressStyle,
                    ]}
                />
            </View>
            {showPercentage && (
                <View style={{ alignItems: 'flex-end', marginTop: spacing.xs }}>
                    <Text style={styles.percentage}>
                        {Math.round(status.percentUsed)}% used
                    </Text>
                    {limitAmount !== undefined && currency && (
                        <Text style={styles.limitText}>
                            {formatCurrency(limitAmount, currency)} limit
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: spacing.lg,
    },
    track: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
    },
    bar: {
        backgroundColor: '#FFF',
    },
    percentage: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    limitText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
        marginTop: 2,
    },
});
