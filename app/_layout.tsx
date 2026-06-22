import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { COLORS } from '../constants/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

import { StatusBar } from 'expo-status-bar';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import { CheckInProvider } from '../context/CheckInContext';
import { useContext } from 'react';
import { useRouter, useSegments } from 'expo-router';

function NavigationHandler({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isFirstLaunch } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'welcome' || segments[0] === 'onboarding';

    if (isFirstLaunch) {
      // If first launch, user must go through onboarding
      if (segments[0] !== 'welcome' && segments[0] !== 'onboarding') {
        // Use a small delay to ensure router is ready
        setTimeout(() => router.replace('/welcome'), 1);
      }
    } else if (!user) {
      // If not first launch and not logged in, go to login
      if (segments[0] !== 'login') {
        setTimeout(() => router.replace('/login'), 1);
      }
    } else if (user) {
      // If logged in and trying to access auth screens, redirect to home
      if (inAuthGroup) {
        setTimeout(() => router.replace('/(tabs)'), 1);
      }
    }
  }, [user, isLoading, isFirstLaunch, segments]);

  return <>{children}</>;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const customTheme = {
    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: COLORS.background,
    },
  };

  return (
    <AuthProvider>
      <CheckInProvider>
        <ThemeProvider value={customTheme}>
          <StatusBar style="dark" />
          <NavigationHandler>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ contentStyle: { backgroundColor: COLORS.background } }} />
              <Stack.Screen name="welcome" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="login" />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </NavigationHandler>
        </ThemeProvider>
      </CheckInProvider>
    </AuthProvider>
  );
}
