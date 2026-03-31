import { Audio } from 'expo-av';
import { CheckCircle, Circle, UserCircle2 } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnlineGame } from '../OnlineGameContext';

export default function OnlineVotingScreen() {
    const { players, playerId, votesCast, totalPlayers, voteCounts, hasVoted, myVote, castVote } = useOnlineGame();
    const soundRef = useRef<Audio.Sound | null>(null);
    const voted = myVote !== '';
    const votedForId = myVote;

    useEffect(() => {
        const load = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../../assets/audio/voting-music.mp3'),
                    { shouldPlay: true, isLooping: true, volume: 0.5 }
                );
                soundRef.current = sound;
            } catch { /* audio optional */ }
        };
        load();
        return () => { soundRef.current?.unloadAsync(); };
    }, []);

    const total = totalPlayers || players.length;
    const isLastVoter = !voted && votesCast === total - 1;
    const hasVotedSet = new Set(hasVoted);

    const wouldCauseTie = (targetId: string): boolean => {
        if (!isLastVoter) return false;
        const sim: Record<string, number> = {};
        players.forEach(p => { if (p.id !== playerId) sim[p.id] = voteCounts[p.id] || 0; });
        sim[targetId] = (sim[targetId] || 0) + 1;
        const maxVotes = Math.max(...Object.values(sim));
        return Object.values(sim).filter(c => c === maxVotes).length > 1;
    };

    const handleVote = (targetId: string) => {
        if (voted || wouldCauseTie(targetId)) return;
        castVote(targetId);
        soundRef.current?.stopAsync();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Vreme je za Glasanje!</Text>
                <Text style={styles.progress}>Glasali: {votesCast} / {total}</Text>
            </View>

            {/* Who has voted */}
            <View style={styles.votersSection}>
                {players.map(player => {
                    const playerVoted = hasVotedSet.has(player.id);
                    const isMe = player.id === playerId;
                    return (
                        <View key={player.id} style={[styles.voterChip, playerVoted && styles.voterChipDone]}>
                            {playerVoted
                                ? <CheckCircle size={14} color="#10B981" />
                                : <Circle size={14} color="#D1D5DB" />
                            }
                            <Text style={[styles.voterName, playerVoted && styles.voterNameDone]}>
                                {isMe ? 'Ti' : player.name}
                            </Text>
                        </View>
                    );
                })}
            </View>

            <ScrollView contentContainerStyle={styles.listContainer}>
                {!voted && <Text style={styles.subtitle}>Koga nominuješ kao Impostera?</Text>}
                {isLastVoter && (
                    <Text style={styles.lastVoterHint}>Ti si poslednji! Možeš glasati samo za eliminaciju.</Text>
                )}

                {players.map(player => {
                    if (player.id === playerId) return null;

                    const count = voteCounts[player.id] || 0;
                    const isMyVote = voted && player.id === votedForId;
                    const blocked = isLastVoter && wouldCauseTie(player.id);
                    const disabled = voted || blocked;

                    return (
                        <TouchableOpacity
                            key={player.id}
                            style={[
                                styles.playerCard,
                                isMyVote && styles.playerCardVoted,
                                blocked && styles.playerCardBlocked,
                            ]}
                            onPress={() => handleVote(player.id)}
                            disabled={disabled}
                            activeOpacity={disabled ? 1 : 0.7}
                        >
                            <UserCircle2 color={blocked ? '#D1D5DB' : '#7C3AED'} size={32} />
                            <Text style={[styles.playerName, blocked && styles.playerNameBlocked]}>
                                {player.name}
                            </Text>
                            <View style={styles.rightSection}>
                                {count > 0 && (
                                    <View style={styles.voteBadge}>
                                        <Text style={styles.voteBadgeText}>{count} glas{count === 1 ? '' : 'a'}</Text>
                                    </View>
                                )}
                                {isMyVote && <CheckCircle color="#7C3AED" size={24} />}
                                {blocked && <Text style={styles.blockedLabel}>Izjednačenje</Text>}
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {voted && (
                    <Text style={styles.waitText}>Čekanje ostalih igrača...</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
    header: { marginBottom: 12, alignItems: 'center' },
    headerTitle: { color: '#EF4444', fontSize: 32, fontWeight: '900', textAlign: 'center', marginVertical: 10, letterSpacing: 1 },
    progress: { fontSize: 18, color: '#6B7280', fontWeight: '600' },
    votersSection: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 8,
        marginBottom: 16, justifyContent: 'center',
    },
    voterChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#fff', borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 5,
        borderWidth: 1.5, borderColor: '#E5E7EB',
    },
    voterChipDone: {
        borderColor: '#10B981',
        backgroundColor: '#ECFDF5',
    },
    voterName: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
    voterNameDone: { color: '#059669' },
    subtitle: { fontSize: 20, fontWeight: '700', color: '#374151', marginBottom: 12, textAlign: 'center' },
    lastVoterHint: { fontSize: 14, color: '#F59E0B', fontWeight: '600', textAlign: 'center', marginBottom: 16 },
    listContainer: { flexGrow: 1, justifyContent: 'center' },
    playerCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        padding: 20, borderRadius: 16, marginBottom: 15,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        borderWidth: 2, borderColor: '#E5E7EB',
    },
    playerCardVoted: { borderColor: '#7C3AED', backgroundColor: '#F5F3FF' },
    playerCardBlocked: { borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', opacity: 0.5 },
    playerName: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginLeft: 15, flex: 1 },
    playerNameBlocked: { color: '#9CA3AF' },
    rightSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    voteBadge: {
        backgroundColor: '#EF4444', borderRadius: 12,
        paddingHorizontal: 8, paddingVertical: 4,
    },
    voteBadgeText: { color: '#fff', fontWeight: '900', fontSize: 13 },
    blockedLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
    waitText: { textAlign: 'center', fontSize: 16, color: '#9CA3AF', marginTop: 24, fontWeight: '600' },
});
