/**
 * Auth gate / index screen.
 *
 * This is the app entry point. It shows nothing visible —
 * the AuthGate in _layout.tsx handles redirection.
 * This file exists because Expo Router requires an index route.
 */

import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '../src/hooks/useThemeColors';

export default function IndexScreen() {
    const colors = useThemeColors();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]} />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
