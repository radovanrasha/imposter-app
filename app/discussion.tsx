import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DiscussionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const playersData = params.playersData as string;
    const startingPlayerName = params.startingPlayerName as string;
    const showWordToImposter = params.showWordToImposter === 'true';

    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const finishDiscussion = () => {
        router.replace({
            pathname: '/voting',
            params: {
                playersData,
                showWordToImposter: showWordToImposter ? 'true' : 'false'
            }
        });
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Diskusija</Text>

            <View style={[styles.startingPlayerBox, styles.shadow]}>
                <User color="#7C3AED" size={32} />
                <Text style={styles.startingPlayerText}>{startingPlayerName} priča prvi!</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.timerCircle}>
                    <Clock color="#14B8A6" size={60} style={styles.icon} />
                    <Text style={styles.timer}>
                        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </Text>
                </View>
                <Text style={styles.subtitle}>Svi govore svoju reč (ili pojam) u smeru kazaljke na satu, zatim glasate ko je Imposter!</Text>
            </View>

            <TouchableOpacity style={styles.finishButton} onPress={finishDiscussion}>
                <Text style={styles.finishButtonText}>PREĐI NA GLASANJE</Text>
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
        color: '#1F2937',
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginVertical: 20,
        letterSpacing: 0.5,
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    startingPlayerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        marginVertical: 10,
        borderWidth: 2,
        borderColor: '#EDE9FE',
    },
    startingPlayerText: {
        color: '#7C3AED',
        fontSize: 20,
        fontWeight: '800',
        marginLeft: 15,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerCircle: {
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 4,
        borderColor: '#CCFBF1',
    },
    icon: {
        marginBottom: 10,
    },
    timer: {
        color: '#1F2937',
        fontSize: 64,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
    },
    subtitle: {
        color: '#6B7280',
        fontSize: 18,
        textAlign: 'center',
        paddingHorizontal: 20,
        fontWeight: '500',
        lineHeight: 26,
    },
    finishButton: {
        backgroundColor: '#EF4444', // Danger red logic
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    finishButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1.5,
    }
});
