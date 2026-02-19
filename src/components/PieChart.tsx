import * as d3 from 'd3-shape';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { categoryColors, fontSize, fontWeight, palette } from '../constants/colors';
import { formatCurrency } from '../utils/formatCurrency';

// ─── Props ───────────────────────────────────────────────────────────────────

interface PieChartProps {
    data: { category: string; amount: number }[];
    total: number;
    currency: string;
    size?: number;
    strokeWidth?: number;
}

// ─── Animated Component ──────────────────────────────────────────────────────

const AnimatedPath = Animated.createAnimatedComponent(Path);

// ─── Component ───────────────────────────────────────────────────────────────

export function PieChart({
    data,
    total,
    currency,
    size = 220,
    strokeWidth = 24,
}: PieChartProps) {
    const radius = size / 2;
    const innerRadius = radius - strokeWidth;

    // Sort data descending for better visualization
    const sortedData = [...data].sort((a, b) => b.amount - a.amount);

    // Generate pie arcs
    const pieGenerator = d3.pie<{ category: string; amount: number }>()
        .value((d) => d.amount)
        .sort(null) // already sorted
        .startAngle(0)
        .endAngle(2 * Math.PI);

    const arcs = pieGenerator(sortedData);

    const arcGenerator = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius)
        .padAngle(0.05)
        .cornerRadius(8);

    // Animation state
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = 0;
        progress.value = withTiming(1, { duration: 800 });
    }, [data]);

    // Handle empty state
    if (total === 0) {
        return (
            <View style={[styles.container, { width: size, height: size }]}>
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <Path
                        d={
                            d3.arc()
                                .innerRadius(innerRadius)
                                .outerRadius(radius)
                                .startAngle(0)
                                .endAngle(2 * Math.PI)() || ''
                        }
                        fill={palette.gray700}
                        opacity={0.2}
                        transform={`translate(${size / 2}, ${size / 2})`}
                    />
                </Svg>
                <View style={styles.centerText}>
                    <Text style={styles.emptyText}>No Data</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <GWrapper x={size / 2} y={size / 2}>
                    {arcs.map((arc, index) => {
                        const pathDetail = arcGenerator(arc as any) || '';
                        const color = categoryColors[arc.data.category] || palette.gray500;

                        return (
                            <PieSlice
                                key={arc.data.category}
                                d={pathDetail}
                                color={color}
                                progress={progress}
                                index={index}
                            />
                        );
                    })}
                </GWrapper>
            </Svg>

            {/* Center Info */}
            <View style={styles.centerText}>
                <Text style={styles.label}>Total</Text>
                <Text style={styles.amount}>
                    {formatCurrency(total, currency)}
                </Text>
            </View>
        </View>
    );
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

/**
 * Wrapper for Svg G that allows children.
 * Note: react-native-svg G component handles children automatically
 */
function GWrapper({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
    const { G } = require('react-native-svg');
    return <G x={x} y={y}>{children}</G>;
}

function PieSlice({
    d,
    color,
    progress,
    index,
}: {
    d: string;
    color: string;
    progress: Animated.SharedValue<number>;
    index: number;
}) {
    const animatedProps = useAnimatedProps(() => {
        return {
            fillOpacity: progress.value,
            strokeOpacity: progress.value,
        };
    });

    return (
        <AnimatedPath
            d={d}
            fill={color}
            animatedProps={animatedProps}
        />
    );
}


// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginVertical: 24,
    },
    centerText: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: fontSize.sm,
        color: palette.gray400,
        fontWeight: fontWeight.semibold,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    amount: {
        fontSize: fontSize.xxl,
        color: palette.white,
        fontWeight: fontWeight.bold,
    },
    emptyText: {
        fontSize: fontSize.md,
        color: palette.gray500,
        fontWeight: fontWeight.medium,
    },
});
