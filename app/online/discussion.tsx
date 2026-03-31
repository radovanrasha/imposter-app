import { Clock, User } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnlineGame } from '../OnlineGameContext';

export default function OnlineDiscussionScreen() {
    const { startingPlayerName, discussionTimeLeft, isHost, sendMessage } = useOnlineGame();

    const minutes = Math.floor(discussionTimeLeft / 60);
    const seconds = discussionTimeLeft % 60;

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Diskusija</Text>

            <View style={styles.startingPlayerBox}>
                <User color="#7C3AED" size={32} />
                <Text style={styles.startingPlayerText}>{startingPlayerName} priča prvi!</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.timerCircle}>
                    <Clock color="#14B8A6" size={60} style={{ marginBottom: 10 }} />
                    <Text style={styles.timer}>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</Text>
                </View>
                <Text style={styles.subtitle}>
                    Svi govore svoju reč u smeru kazaljke na satu, zatim glasate ko je Imposter!
                </Text>
            </View>

            {isHost && (
                <TouchableOpacity style={styles.finishButton} onPress={() => sendMessage('end_discussion')}>
                    <Text style={styles.finishButtonText}>PREĐI NA GLASANJE</Text>
                </TouchableOpacity>
            )}
            {!isHost && (
                <View style={styles.waitBox}>
                    <Text style={styles.waitText}>Čekanje da host završi diskusiju...</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20, justifyContent: 'space-between' },
    headerTitle: { color: '#1F2937', fontSize: 32, fontWeight: '900', textAlign: 'center', marginVertical: 20, letterSpacing: 0.5 },
    startingPlayerBox: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#fff', padding: 20, borderRadius: 16, marginVertical: 10,
        borderWidth: 2, borderColor: '#EDE9FE',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    },
    startingPlayerText: { color: '#7C3AED', fontSize: 20, fontWeight: '800', marginLeft: 15 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    timerCircle: {
        width: 240, height: 240, borderRadius: 120, backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center', marginBottom: 30,
        shadowColor: '#14B8A6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
        borderWidth: 4, borderColor: '#CCFBF1',
    },
    timer: { color: '#1F2937', fontSize: 64, fontWeight: '900', fontVariant: ['tabular-nums'] },
    subtitle: { color: '#6B7280', fontSize: 17, textAlign: 'center', paddingHorizontal: 20, fontWeight: '500', lineHeight: 26 },
    finishButton: {
        backgroundColor: '#EF4444', padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 20,
        shadowColor: '#EF4444', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
    },
    finishButtonText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1.5 },
    waitBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: '#E5E7EB' },
    waitText: { color: '#6B7280', fontSize: 16, fontWeight: '600' },
});
