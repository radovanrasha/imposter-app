import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { UserCircle2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PlayerData = { id: number; name: string; role: 'citizen' | 'imposter'; word: string };

export default function VotingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const playersData: PlayerData[] = params.playersData ? JSON.parse(params.playersData as string) : [];

    const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
    const [votes, setVotes] = useState<Record<string, number>>({});
    const soundRef = useRef<Audio.Sound | null>(null);

    // Initialize Audio
    useEffect(() => {
        const loadAndPlayAudio = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../assets/audio/voting-music.mp3'),
                    { shouldPlay: true, isLooping: true, volume: 0.5 }
                );
                soundRef.current = sound;
            } catch (error) {
                console.log("Could not load audio. Skipping.", error);
            }
        };

        loadAndPlayAudio();

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const handleVote = (votedPlayerName: string) => {
        const newVotes = { ...votes };
        newVotes[votedPlayerName] = (newVotes[votedPlayerName] || 0) + 1;
        setVotes(newVotes);

        if (currentVoterIndex < playersData.length - 1) {
            setCurrentVoterIndex(currentVoterIndex + 1);
        } else {
            // All players voted
            if (soundRef.current) {
                soundRef.current.stopAsync();
            }
            router.replace({
                pathname: '/result',
                params: {
                    playersData: JSON.stringify(playersData),
                    votesData: JSON.stringify(newVotes)
                }
            });
        }
    };

    if (playersData.length === 0) return null;

    const currentVoter = playersData[currentVoterIndex];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Vreme je za Glasanje!</Text>
                <Text style={styles.currentVoterText}>
                    Telefonom sada upravlja: <Text style={styles.boldText}>{currentVoter.name}</Text>
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.listContainer}>
                <Text style={styles.subtitle}>Koga nominuješ kao Impostera?</Text>

                {playersData.map((player) => {
                    // One cannot vote for themselves
                    if (player.id === currentVoter.id) return null;

                    return (
                        <TouchableOpacity
                            key={player.id}
                            style={styles.playerCard}
                            onPress={() => handleVote(player.name)}
                        >
                            <UserCircle2 color="#7C3AED" size={32} />
                            <Text style={styles.playerName}>{player.name}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <Text style={styles.footerText}>
                Glasanje: {currentVoterIndex + 1} / {playersData.length}
            </Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Light gray 100
        padding: 20,
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    headerTitle: {
        color: '#EF4444', // Danger Red
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginVertical: 10,
        letterSpacing: 1,
    },
    currentVoterText: {
        fontSize: 18,
        color: '#4B5563',
        textAlign: 'center',
    },
    boldText: {
        fontWeight: 'bold',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 20,
        textAlign: 'center',
    },
    listContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    playerName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 15,
    },
    footerText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#9CA3AF',
        fontWeight: 'bold',
        marginTop: 20,
    }
});
