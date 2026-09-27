import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import 'react-native-reanimated';

import { LaunchScreen } from '@/components/launch-screen';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const RootLayout = () => {
  const colorScheme = useColorScheme();

  /**
   * Gates the launch screen: false until the user taps the title block.
   * State lives in the root layout, so it survives navigation between tabs and
   * is discarded only when the app process restarts — i.e. the launch screen is
   * shown once per cold start (and again on a Fast Refresh / dev reload).
   */
  const [hasEntered, setHasEntered] = useState<boolean>(false);

  if (!hasEntered) {
    return (
      <>
        <LaunchScreen onContinue={() => setHasEntered(true)} />
        {/* The map and its scrim are dark, so force light status bar icons
            instead of inheriting the system colour scheme. */}
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
};

export default RootLayout;
