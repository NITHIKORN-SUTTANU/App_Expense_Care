/**
 * Tab navigator layout.
 *
 * Configures the 4-tab bottom navigation:
 *   ① Home  ② Expenses  ③ Summary  ④ Profile
 *
 * Wraps tabs with BudgetProvider for state access.
 */

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { fontSize, fontWeight, shadows } from '../../src/constants/colors';
import { useThemeColors } from '../../src/hooks/useThemeColors';

/** Icon name type for Ionicons */
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        // Tab bar styling
        tabBarActiveTintColor: '#34D399',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: 'rgba(255, 255, 255, 0.06)',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          ...shadows.md,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.medium,
        },
        // Header styling
        headerStyle: {
          backgroundColor: '#0F172A',
        },
        headerTintColor: '#FFF',
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Summary',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
