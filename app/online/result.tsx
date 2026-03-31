import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnlineGame } from '../OnlineGameContext';

export default function OnlineResultScreen() {
    const router = useRouter();
    const { gameResult, isHost, reset, sendMessage } = useOnlineGame();

    if (!gameResult) return null;

    const { voted_out_name, was_imposter, imposters, word } = gameResult;

    const goHome = () => {
        reset();
        router.replace('/');
    };

    const playAgain = () => {
        sendMessage('reset_game');
        // navigation happens via game_reset broadcast received by all players
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Rezultati Glasanja</Text>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Najviše glasova dobija:</Text>
                    <Text style={styles.votedName}>{voted_out_name}</Text>
                </View>

                <View style={[styles.resultBox, was_imposter ? styles.citizenWinBox : styles.imposterWinBox]}>
                    {was_imposter ? (
                        <>
                            <Text style={styles.winnerTitle}>IGRAČI POBEĐUJU!</Text>
                            <Text style={styles.winnerSubtext}>{voted_out_name} je bio IMPOSTER!</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.winnerTitle}>IMPOSTER POBEĐUJE!</Text>
                            <Text style={styles.winnerSubtext}>{voted_out_name} je bio Nedužni Igrač.</Text>
                        </>
                    )}

                    <View style={styles.revealBox}>
                        <Text style={styles.revealLabel}>Svi Imposteri su bili:</Text>
                        {imposters.map(p => (
                            <Text key={p.id} style={styles.imposterName}>{p.name}</Text>
                        ))}
                        <Text style={styles.revealLabel}>Pravi pojam je bio:</Text>
                        <Text style={styles.secretWord}>{word}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.buttonRow}>
                {isHost && (
                    <TouchableOpacity style={styles.button} onPress={playAgain}>
                        <Text style={styles.buttonText}>IGRAJ PONOVO</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={goHome}>
                    <Text style={[styles.buttonText, styles.secondaryButtonText]}>POČETNI EKRAN</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
    headerTitle: { color: '#1F2937', fontSize: 32, fontWeight: '900', textAlign: 'center', marginVertical: 10, letterSpacing: 0.5 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
    infoBox: {
        backgroundColor: '#fff', padding: 28, borderRadius: 24, alignItems: 'center', width: '100%',
        borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8,
    },
    infoTitle: { color: '#6B7280', fontSize: 15, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    votedName: { color: '#1F2937', fontSize: 34, fontWeight: '900', textAlign: 'center' },
    resultBox: { width: '100%', padding: 28, borderRadius: 24, alignItems: 'center', borderWidth: 4 },
    citizenWinBox: { backgroundColor: '#F0FDFA', borderColor: '#14B8A6' },
    imposterWinBox: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
    winnerTitle: { fontSize: 28, fontWeight: '900', color: '#1F2937', textAlign: 'center', marginBottom: 8 },
    winnerSubtext: { fontSize: 17, fontWeight: 'bold', color: '#4B5563', textAlign: 'center', marginBottom: 20 },
    revealBox: { width: '100%', alignItems: 'center', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#D1D5DB' },
    revealLabel: { color: '#6B7280', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4, marginTop: 12 },
    imposterName: { color: '#EF4444', fontSize: 22, fontWeight: '900', marginBottom: 4 },
    secretWord: { color: '#14B8A6', fontSize: 24, fontWeight: '900' },
    buttonRow: { gap: 12, marginTop: 16 },
    button: {
        backgroundColor: '#7C3AED', padding: 22, borderRadius: 20, alignItems: 'center',
        shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
    },
    secondaryButton: {
        backgroundColor: '#fff', borderWidth: 2, borderColor: '#E5E7EB',
        shadowOpacity: 0, elevation: 0,
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1.5 },
    secondaryButtonText: { color: '#7C3AED' },
});
