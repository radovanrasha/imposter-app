import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PlayerData = { id: number; name: string; role: 'citizen' | 'imposter'; word: string };

export default function ResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const playersData: PlayerData[] = params.playersData ? JSON.parse(params.playersData as string) : [];

    const imposters = playersData.filter(p => p.role === 'imposter');

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Kraj Igre!</Text>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.imposterBox, styles.shadow]}>
                    <Text style={styles.imposterBoxTitle}>Imposteri su bili:</Text>
                    {imposters.map(p => (
                        <Text key={p.id} style={styles.imposterName}>{p.name}</Text>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.replace('/setup')}
                >
                    <Text style={styles.buttonText}>IGRAJ PONOVO</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => router.replace('/')}
                >
                    <Text style={styles.buttonText}>POČETNI EKRAN</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        color: '#1F2937', // Dark gray 800
        fontSize: 36,
        fontWeight: '900',
        textAlign: 'center',
        marginVertical: 20,
        letterSpacing: 0.5,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shadow: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    imposterBox: {
        backgroundColor: '#FFFFFF',
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        width: '100%',
        borderWidth: 4,
        borderColor: '#FECACA', // Light red border
    },
    imposterBoxTitle: {
        color: '#6B7280', // Gray 500
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    imposterName: {
        color: '#EF4444', // Danger Red
        fontSize: 42,
        fontWeight: '900',
        marginBottom: 10,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#7C3AED', // Indigo
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    secondaryButton: {
        backgroundColor: '#F3F4F6', // Blend with bg
        borderWidth: 2,
        borderColor: '#D1D5DB', // Gray 300
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1.5,
    }
});
