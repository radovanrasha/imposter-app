import { useRouter } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScore } from './ScoreContext';

export default function HomeScreen() {
    const router = useRouter();
    const [rulesVisible, setRulesVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'igra' | 'tabela'>('igra');
    const { scores } = useScore();

    // Sort scores from highest to lowest
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    return (
        <SafeAreaView style={styles.container}>
            {/* TABS */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'igra' && styles.activeTabButton]}
                    onPress={() => setActiveTab('igra')}
                >
                    <Text style={[styles.tabText, activeTab === 'igra' && styles.activeTabText]}>IGRA</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'tabela' && styles.activeTabButton]}
                    onPress={() => setActiveTab('tabela')}
                >
                    <Text style={[styles.tabText, activeTab === 'tabela' && styles.activeTabText]}>TABELA</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'igra' ? (
                <>
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
                </>
            ) : (
                <View style={styles.scoreboardContainer}>
                    <View style={styles.scoreHeaderRow}>
                        <Trophy color="#F59E0B" size={32} />
                        <Text style={styles.scoreTitle}>Tabela Pobeda</Text>
                    </View>

                    {sortedScores.length > 0 ? (
                        <ScrollView style={styles.scoreList}>
                            {sortedScores.map(([name, score], index) => (
                                <View key={name} style={styles.scoreItem}>
                                    <View style={styles.scoreRank}>
                                        <Text style={styles.scoreRankText}>{index + 1}.</Text>
                                    </View>
                                    <Text style={styles.scoreName}>{name}</Text>
                                    <View style={styles.scorePointsBox}>
                                        <Text style={styles.scorePointsText}>{score}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyScoreContainer}>
                            <Text style={styles.emptyScoreText}>Još uvek nema odigranih partija!</Text>
                            <Text style={styles.emptyScoreSubtext}>Započni novu igru da osvojiš prve bodove.</Text>
                        </View>
                    )}
                </View>
            )}

            {/* RULES MODAL */}
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
                            Cilj igrača je da kroz diskusiju otkriju ko ne zna pravu reč. Imposterova uloga je da preživi glasanje!
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
        padding: 20,
    },
    // TABS
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB', // Gray 200
        borderRadius: 16,
        padding: 4,
        marginBottom: 20,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTabButton: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6B7280', // Gray 500
    },
    activeTabText: {
        color: '#7C3AED', // Indigo
    },
    // IGRA TAB
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
        paddingBottom: 20,
        gap: 15,
        justifyContent: 'flex-end',
        flex: 1,
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
    // TABELA TAB
    scoreboardContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    scoreHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 10,
    },
    scoreTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1F2937',
    },
    scoreList: {
        flex: 1,
    },
    scoreItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    scoreRank: {
        width: 30,
    },
    scoreRankText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#9CA3AF',
    },
    scoreName: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
    },
    scorePointsBox: {
        backgroundColor: '#FEF3C7', // Amber 100
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 12,
    },
    scorePointsText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#D97706', // Amber 600
    },
    emptyScoreContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyScoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyScoreSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
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
