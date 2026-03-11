import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScoreProvider } from './ScoreContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ScoreProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="setup" />
          <Stack.Screen name="game" />
          <Stack.Screen name="discussion" />
          <Stack.Screen name="voting" />
          <Stack.Screen name="result" />
        </Stack>
        <StatusBar style="auto" />
      </ScoreProvider>
    </ThemeProvider>
  );
}
