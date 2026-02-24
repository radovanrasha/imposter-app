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
                <View style={styles.content}>
                    <Eye color="#FF4500" size={80} style={styles.icon} />
                    <Text style={styles.title}>Zadata reč je bila:</Text>
                    <Text style={styles.word}>{secretWord}</Text>
                    <Text style={styles.subtitle}>Sada svi znaju reč! Ko se loše branio?</Text>
                </View>
            );
        }

        return (
            <View style={styles.content}>
                <EyeOff color="#FF4500" size={80} style={styles.icon} />
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
        backgroundColor: '#121212',
        padding: 20,
        justifyContent: 'space-between',
    },
    headerTitle: {
        color: '#FF4500',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    word: {
        color: '#FF4500',
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        color: '#aaa',
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    nextButton: {
        backgroundColor: '#FF4500',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});
