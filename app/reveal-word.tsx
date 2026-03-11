import { useLocalSearchParams, useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RevealWordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const playersData = params.playersData as string;
    const showWordToImposter = params.showWordToImposter === 'true';

    // Parsiramo podatke da bismo našli reč
    const parsedPlayers = playersData ? JSON.parse(playersData) : [];
    const secretWord = parsedPlayers.find((p: any) => p.role === 'citizen')?.word || 'Nema';

    const renderContent = () => {
        if (showWordToImposter) {
            return (
                <View style={[styles.content, styles.shadow]}>
                    <Eye color="#7C3AED" size={80} style={styles.icon} />
                    <Text style={styles.title}>Zadata reč je bila:</Text>
                    <Text style={styles.word}>{secretWord}</Text>
                    <Text style={styles.subtitle}>Sada svi znaju reč! Ko se loše branio?</Text>
                </View>
            );
        }

        return (
            <View style={[styles.content, styles.shadow]}>
                <EyeOff color="#9CA3AF" size={80} style={styles.icon} />
                <Text style={styles.title}>Reč ostaje tajna!</Text>
                <Text style={styles.subtitle}>(Niste izabrali opciju za otkrivanje)</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Otkrivanje reči</Text>

            {renderContent()}

            <TouchableOpacity
                style={styles.nextButton}
                onPress={() => router.replace({
                    pathname: '/result',
                    params: { playersData } // Više nam ne treba showWordToImposter u Result ekranu
                })}
            >
                <Text style={styles.nextButtonText}>OTKRIJ IMPOSTERA</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Light gray 100
        padding: 20,
        justifyContent: 'space-between',
    },
    headerTitle: {
        color: '#1F2937', // Dark gray 800
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginVertical: 20,
        letterSpacing: 0.5,
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        marginVertical: 20,
        padding: 30,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        color: '#6B7280', // Gray 500
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    word: {
        color: '#7C3AED', // Vibrant Indigo
        fontSize: 48,
        fontWeight: '900',
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        color: '#9CA3AF', // Gray 400
        fontSize: 18,
        textAlign: 'center',
        paddingHorizontal: 10,
        marginTop: 10,
        fontWeight: '500',
    },
    nextButton: {
        backgroundColor: '#14B8A6', // Teal 500
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1.5,
    }
});
