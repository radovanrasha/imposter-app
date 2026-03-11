import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const router = useRouter();
    const [rulesVisible, setRulesVisible] = useState(false);

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
                    onPress={() => setRulesVisible(true)}
                >
                    <Text style={[styles.buttonText, styles.secondaryButtonText]}>PRAVILA</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={rulesVisible}
                onRequestClose={() => setRulesVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Pravila Igre</Text>
                        <Text style={styles.modalText}>
                            Svi igrači dobijaju istu reč, osim impostera koji dobija pomoćnu reč ili oznaku "Ti si Imposter".
                        </Text>
                        <Text style={styles.modalText}>
                            Cilj građana je da kroz diskusiju otkriju ko ne zna pravu reč. Imposterova uloga je da preživi glasanje!
                        </Text>

                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={() => setRulesVisible(false)}
                        >
                            <Text style={styles.closeModalButtonText}>ZATVORI</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Light gray 100
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
        fontWeight: '900',
        color: '#1F2937', // Dark gray 800
        letterSpacing: 2,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#6B7280', // Gray 500
        fontWeight: '600',
    },
    buttonContainer: {
        paddingBottom: 40,
        gap: 15,
    },
    button: {
        backgroundColor: '#7C3AED', // Indigo
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    secondaryButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    secondaryButtonText: {
        color: '#7C3AED', // Match the Indigo primary color
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 30,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1F2937',
        marginBottom: 20,
    },
    modalText: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 15,
        lineHeight: 24,
    },
    closeModalButton: {
        backgroundColor: '#14B8A6', // Teal
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 16,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    closeModalButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    }
});
