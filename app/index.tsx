import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>IMPOSTER</Text>
                <Text style={styles.subtitle}>Ko se krije među nama?</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/setup')}
                >
                    <Text style={styles.buttonText}>NOVA IGRA</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => alert('Pravila: Svi igrači dobijaju istu reč, osim impostera koji dobija prazno ili "Ti si Imposter". Diskusijom pokušajte da ga otkrijete!')}
                >
                    <Text style={styles.buttonText}>PRAVILA</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'space-between',
        padding: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FF4500',
        letterSpacing: 2,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#FFFFFF',
        opacity: 0.8,
    },
    buttonContainer: {
        paddingBottom: 40,
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
