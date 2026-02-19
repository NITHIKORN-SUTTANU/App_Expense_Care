/**
 * Not found screen.
 *
 * Shown when the user navigates to an invalid route.
 */

import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fontSize, fontWeight, spacing } from '../src/constants/colors';
import { useThemeColors } from '../src/hooks/useThemeColors';

export default function NotFoundScreen() {
  const colors = useThemeColors();

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Page Not Found</Text>
        <Link href="/" asChild>
          <TouchableOpacity>
            <Text style={[styles.link, { color: colors.primary }]}>Go Home</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  link: {
    marginTop: spacing.lg,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
