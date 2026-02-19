/**
 * useThemeColors hook.
 *
 * Returns the current theme's color palette based on
 * the device's color scheme preference.
 */

import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ThemeColors } from '../constants/colors';

/**
 * Get the active color palette based on device theme preference.
 *
 * @returns Color tokens for the current theme (light or dark)
 */
export function useThemeColors(): ThemeColors {
    const colorScheme = useColorScheme();
    return colorScheme === 'dark' ? darkColors : lightColors;
}
