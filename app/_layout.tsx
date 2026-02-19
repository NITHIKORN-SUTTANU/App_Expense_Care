/**
 * Root layout — app entry point.
 *
 * Wraps the entire app with providers (Auth, navigation)
 * and handles the auth gate (redirect to login if not signed in).
 */

import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { BudgetProvider } from '../src/context/BudgetContext';


/**
 * Navigation guard component.
 *
 * Redirects unauthenticated users to the login screen
 * and authenticated users away from auth screens.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {

    if (isLoading) return; // Wait until auth state is determined

    const isOnAuthScreen = segments[0] === 'login' || segments[0] === 'register';

    const isRoot = !segments[0];

    if (!isAuthenticated && !isOnAuthScreen) {

      router.replace('/login');
    } else if (isAuthenticated && (isOnAuthScreen || isRoot)) {

      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return null; // Or a splash screen
  }

  return <>{children}</>;

}

/**
 * Root layout component.
 *
 * Sets up the navigation stack and wraps everything with providers.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <BudgetProvider>
          <AuthGate>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="add-expense"
                options={{
                  presentation: 'modal',
                  headerShown: false,
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="budget-setup"
                options={{
                  presentation: 'modal',
                  headerShown: true,
                  headerTitle: 'Set Up Budget',
                  headerStyle: { backgroundColor: '#0F172A' },
                  headerTintColor: '#FFF',
                }}
              />
              <Stack.Screen
                name="edit-expense"
                options={{
                  presentation: 'modal',
                  headerShown: false,
                  animation: 'slide_from_bottom',
                }}
              />
            </Stack>
          </AuthGate>
        </BudgetProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
