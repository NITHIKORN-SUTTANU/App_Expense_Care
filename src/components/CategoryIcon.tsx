/**
 * Category icon badge component.
 *
 * Displays a category's icon inside a colored circle.
 * Used in expense lists, the add expense form, and summary views.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getCategoryByKey } from '../constants/categories';
import { borderRadius } from '../constants/colors';
import { CategoryKey } from '../types';

interface CategoryIconProps {
    /** The category key */
    category: CategoryKey;
    /** Icon container size in dp */
    size?: number;
}

/**
 * Renders a round icon badge for a given expense category.
 */
export function CategoryIcon({ category, size = 40 }: CategoryIconProps) {
    const def = getCategoryByKey(category);
    const iconSize = size * 0.5;

    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: borderRadius.md,
                    backgroundColor: `${def.color}20`, // 12% opacity tint
                },
            ]}
        >
            <Ionicons name={def.icon as any} size={iconSize} color={def.color} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
