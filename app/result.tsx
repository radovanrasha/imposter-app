import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScore } from './ScoreContext';

type PlayerData = { id: number; name: string; role: 'citizen' | 'imposter'; word: string };

export default function ResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { addScore } = useScore();

    const playersData: PlayerData[] = params.playersData ? JSON.parse(params.playersData as string) : [];
    const votesData: Record<string, number> = params.votesData ? JSON.parse(params.votesData as string) : {};

    const imposters = playersData.filter(p => p.role === 'imposter');
    const citizens = playersData.filter(p => p.role === 'citizen');

    // Find who got the most votes
    let maxVotes = -1;
    let votedOutPlayerName = "Niko (Izjednačeno)";

    Object.entries(votesData).forEach(([name, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            votedOutPlayerName = name;
        } else if (count === maxVotes) {
            votedOutPlayerName = "Niko (Izjednačeno)"; // Basic tie handling
        }
    });

    const votedOutPlayer = playersData.find(p => p.name === votedOutPlayerName);
    const wasImpostorVotedOut = votedOutPlayer?.role === 'imposter';

    useEffect(() => {
        // Apply scores instantly on mount
        if (wasImpostorVotedOut) {
            // Players (Citizens) Win
            const citizenNames = playersData.filter(p => p.role === 'citizen').map(c => c.name);
            addScore(citizenNames);
        } else {
            // Imposter Wins
            const imposterNames = playersData.filter(p => p.role === 'imposter').map(i => i.name);
            addScore(imposterNames);
        }
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Rezultati Glasanja</Text>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Voter Results */}
                <View style={[styles.infoBox, styles.shadow]}>
                    <Text style={styles.infoTitle}>Najviše glasova dobija:</Text>
                    <Text style={styles.votedName}>{votedOutPlayerName}</Text>
                    <Text style={styles.voteCount}>({maxVotes} glas/ova)</Text>
                </View>

                {/* Final Winner Result */}
                <View style={[styles.resultBox, styles.shadow, wasImpostorVotedOut ? styles.citizenWinBox : styles.imposterWinBox]}>
                    {wasImpostorVotedOut ? (
                        <>
                            <Text style={styles.winnerTitle}>IGRAČI POBEĐUJU!</Text>
                            <Text style={styles.winnerSubtext}>{votedOutPlayerName} je bio IMPOSTER!</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.winnerTitle}>IMPOSTER POBEĐUJE!</Text>
                            <Text style={styles.winnerSubtext}>{votedOutPlayerName} je bio Nedužni Igrač.</Text>
                        </>
                    )}

                    <View style={styles.revealAllBox}>
                        <Text style={styles.revealAllTitle}>Svi Imposteri su bili:</Text>
                        {imposters.map(p => (
                            <Text key={p.id} style={styles.revealAllName}>{p.name}</Text>
                        ))}
                        <Text style={styles.secretWordTitle}>Pravi pojam je bio:</Text>
                        <Text style={styles.secretWord}>{citizens[0]?.word || "Nepoznato"}</Text>
                    </View>
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
                    <Text style={[styles.buttonText, styles.secondaryButtonText]}>POČETNI EKRAN</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Light gray 100
        padding: 20,
    },
    headerTitle: {
        color: '#1F2937', // Dark gray 800
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginVertical: 10,
        letterSpacing: 0.5,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
    },
    infoBox: {
        backgroundColor: '#374151', // Gray 700
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#4B5563', // Gray 600
        marginBottom: 20,
    },
    infoTitle: {
        color: '#9CA3AF', // Gray 400
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    votedName: {
        color: '#F9FAFB', // White
        fontSize: 36,
        fontWeight: '900',
        marginBottom: 5,
        textAlign: 'center',
    },
    voteCount: {
        color: '#D1D5DB', // Gray 300
        fontSize: 16,
        fontWeight: '600',
    },
    resultBox: {
        width: '100%',
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 4,
    },
    citizenWinBox: {
        backgroundColor: '#F0FDFA',
        borderColor: '#14B8A6', // Teal
    },
    imposterWinBox: {
        backgroundColor: '#FEF2F2',
        borderColor: '#EF4444', // Red
    },
    winnerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#F9FAFB', // White
        textAlign: 'center',
        marginBottom: 10,
    },
    winnerSubtext: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D1D5DB', // Gray 300
        textAlign: 'center',
        marginBottom: 20,
    },
    revealAllBox: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#D1D5DB',
    },
    revealAllTitle: {
        color: '#9CA3AF', // Gray 400
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    revealAllName: {
        color: '#EF4444',
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 5,
    },
    secretWordTitle: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginTop: 15,
        marginBottom: 5,
    },
    secretWord: {
        color: '#14B8A6',
        fontSize: 24,
        fontWeight: '900',
    },
    buttonContainer: {
        width: '100%',
        marginTop: 10,
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
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    secondaryButtonText: {
        color: '#7C3AED',
    }
});
