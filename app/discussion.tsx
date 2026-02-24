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
            pathname: '/reveal-word',
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

            <View style={styles.startingPlayerBox}>
                <User color="#FF4500" size={32} />
                <Text style={styles.startingPlayerText}>{startingPlayerName} priča prvi!</Text>
            </View>

            <View style={styles.content}>
                <Clock color="#FF4500" size={80} style={styles.icon} />
                <Text style={styles.timer}>
                    {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                </Text>
                <Text style={styles.subtitle}>Svi govore svoju reč (ili pojam) u smeru kazaljke na satu, zatim glasate ko je Imposter!</Text>
            </View>

            <TouchableOpacity style={styles.finishButton} onPress={finishDiscussion}>
                <Text style={styles.finishButtonText}>ZAVRŠI GLASANJE</Text>
            </TouchableOpacity>
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
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    startingPlayerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 69, 0, 0.1)',
        borderWidth: 2,
        borderColor: '#FF4500',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 15,
        marginTop: 10,
    },
    startingPlayerText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    icon: {
        marginBottom: 30,
    },
    timer: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    subtitle: {
        color: '#aaa',
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    finishButton: {
        backgroundColor: '#FF4500',
        width: '100%',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    finishButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
