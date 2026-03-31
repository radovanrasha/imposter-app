import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { OnlineGameProvider, useOnlineGame } from './OnlineGameContext';

function ReconnectingOverlay() {
    const { isReconnecting } = useOnlineGame();
    if (!isReconnecting) return null;
    return (
        <View style={styles.overlay}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.overlayText}>Reconnecting...</Text>
        </View>
    );
}

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <OnlineGameProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="setup" />
                    <Stack.Screen name="game" />
                    <Stack.Screen name="discussion" />
                    <Stack.Screen name="voting" />
                    <Stack.Screen name="result" />
                    <Stack.Screen name="online/index" />
                    <Stack.Screen name="online/lobby" />
                    <Stack.Screen name="online/game" />
                    <Stack.Screen name="online/discussion" />
                    <Stack.Screen name="online/voting" />
                    <Stack.Screen name="online/result" />
                </Stack>
                <ReconnectingOverlay />
                <StatusBar style="auto" />
            </OnlineGameProvider>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.75)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    overlayText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
});
