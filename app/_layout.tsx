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
  initialRouteName: 'index',
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

    const hideSplash = () => {
      // Use requestAnimationFrame and a small timeout to ensure the UI is fully painted
      requestAnimationFrame(() => {
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 150);
      });
    };

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'welcome' || segments[0] === 'onboarding';

    // Since app/index.tsx handles the initial routing, NavigationHandler only needs to enforce 
    // reactive state changes (like logging out) and hide the splash screen when on a valid route.
    
    // Check if we are on the gatekeeper index route. If so, just wait (it will redirect on its own).
    if (!segments[0]) {
       return; 
    }

    if (isFirstLaunch) {
      if (segments[0] !== 'welcome' && segments[0] !== 'onboarding') {
        router.replace('/welcome');
      } else {
        hideSplash();
      }
    } else if (!user) {
      if (segments[0] !== 'login') {
        router.replace('/login');
      } else {
        hideSplash();
      }
    } else if (user) {
      if (inAuthGroup) {
        router.replace('/(tabs)');
      } else {
        hideSplash();
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
              <Stack.Screen name="index" />
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
