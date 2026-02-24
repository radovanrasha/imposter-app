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
                <View style={styles.imposterBox}>
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
        color: '#FF4500',
        fontSize: 36,
        fontWeight: 'bold',
        marginVertical: 20,
        letterSpacing: 2,
    },
    scrollContent: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 20,
    },
    imposterBox: {
        backgroundColor: '#1E1E1E',
        padding: 30,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
        marginBottom: 40,
        borderWidth: 2,
        borderColor: '#FF4500',
    },
    imposterBoxTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    imposterName: {
        color: '#FF4500',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    wordTitle: {
        color: '#aaa',
        fontSize: 18,
        marginBottom: 10,
    },
    secretWord: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    buttonContainer: {
        width: '100%',
        paddingBottom: 20,
    },
    button: {
        backgroundColor: '#FF4500',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 15,
    },
    secondaryButton: {
        backgroundColor: '#333333',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
