import { useRouter } from 'expo-router';
import { BookOpen, CheckSquare, Users, UserX } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import wordsEasy from '../../constants/words_easy';
import { useOnlineGame } from '../OnlineGameContext';

const CATEGORIES = wordsEasy.map(c => c.category);

export default function OnlineLobbyScreen() {
    const router = useRouter();
    const { roomCode, isHost, players, sendMessage, reset } = useOnlineGame();

    const [impostersCount, setImpostersCount] = useState(1);
    const [unknownImposters, setUnknownImposters] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([CATEGORIES[0]]);

    const maxImposters = Math.floor(players.length / 3);

    // Keep impostersCount in valid range as players join/leave
    useEffect(() => {
        if (impostersCount > maxImposters) {
            setImpostersCount(Math.max(1, maxImposters));
        }
    }, [players.length]);

    const increaseImposters = () => setImpostersCount(i => Math.min(maxImposters, i + 1));
    const decreaseImposters = () => setImpostersCount(i => Math.max(1, i - 1));

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const selectAllCategories = () => {
        setSelectedCategories(
            selectedCategories.length === CATEGORIES.length ? [] : [...CATEGORIES]
        );
    };

    const startGame = () => {
        if (players.length < 3) {
            Alert.alert('Nedovoljno igrača', 'Potrebno je najmanje 3 igrača.');
            return;
        }
        if (selectedCategories.length === 0) {
            Alert.alert('Nema kategorija', 'Izaberite barem jednu kategoriju.');
            return;
        }

        const allItems = wordsEasy
            .filter(cat => selectedCategories.includes(cat.category))
            .flatMap(cat => cat.items);
        const item = allItems[Math.floor(Math.random() * allItems.length)];

        const actualImposters = unknownImposters
            ? Math.floor(Math.random() * maxImposters) + 1
            : impostersCount;

        sendMessage('start_game', {
            word: item.word,
            hint: item.hint,
            imposters_count: actualImposters,
        });
    };

    const leaveRoom = () => {
        reset();
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Čekaonica</Text>
                <View style={styles.codeBox}>
                    <Text style={styles.codeLabel}>KOD SOBE</Text>
                    <Text style={styles.code}>{roomCode}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.playersBox}>
                    <View style={styles.sectionHeader}>
                        <Users color="#7C3AED" size={22} />
                        <Text style={styles.sectionTitle}>Igrači ({players.length})</Text>
                    </View>
                    {players.map(p => (
                        <View key={p.id} style={styles.playerRow}>
                            <Text style={styles.playerName}>{p.name}</Text>
                            {p.is_host && <Text style={styles.hostBadge}>HOST</Text>}
                        </View>
                    ))}
                </View>

                {isHost && (
                    <View style={styles.settingsBox}>
                        <Text style={styles.sectionTitle}>Podešavanja</Text>

                        {/* Imposters */}
                        <View style={[styles.settingRow, unknownImposters && styles.rowDisabled]}>
                            <Text style={styles.settingLabel}>Imposteri</Text>
                            <View style={styles.counter}>
                                <TouchableOpacity style={styles.counterBtn} onPress={decreaseImposters} disabled={unknownImposters}>
                                    <Text style={styles.counterBtnText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.counterValue}>{impostersCount}</Text>
                                <TouchableOpacity style={styles.counterBtn} onPress={increaseImposters} disabled={unknownImposters}>
                                    <Text style={styles.counterBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={[styles.imposterHint, unknownImposters && styles.rowDisabled]}>
                            Max {maxImposters} za {players.length} igrača
                        </Text>

                        <TouchableOpacity
                            style={styles.checkboxRow}
                            onPress={() => setUnknownImposters(!unknownImposters)}
                        >
                            <View style={[styles.checkboxOutline, unknownImposters && styles.checkboxActive]}>
                                {unknownImposters && <CheckSquare color="#fff" size={18} />}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.settingLabel}>Nepoznat broj impostera</Text>
                                <Text style={styles.checkboxSubtitle}>Niko ne zna koliko ih ima do kraja igre</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Categories */}
                        <View style={styles.categorySection}>
                            <View style={styles.sectionHeader}>
                                <BookOpen color="#F59E0B" size={20} />
                                <Text style={styles.settingLabel}>Kategorije</Text>
                            </View>

                            <TouchableOpacity style={styles.selectAllBtn} onPress={selectAllCategories}>
                                <CheckSquare
                                    color={selectedCategories.length === CATEGORIES.length ? '#14B8A6' : '#9CA3AF'}
                                    size={18}
                                />
                                <Text style={styles.selectAllText}>
                                    {selectedCategories.length === CATEGORIES.length ? 'Deselektuj Sve' : 'Izaberi Sve'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.categories}>
                                {CATEGORIES.map(cat => {
                                    const isActive = selectedCategories.includes(cat);
                                    return (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
                                            onPress={() => toggleCategory(cat)}
                                        >
                                            <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                {isHost ? (
                    <TouchableOpacity style={styles.startButton} onPress={startGame}>
                        <Text style={styles.startButtonText}>POČNI IGRU</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.waitingBox}>
                        <Text style={styles.waitingText}>Čekanje da host počne igru...</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.leaveButton} onPress={leaveRoom}>
                    <Text style={styles.leaveButtonText}>NAPUSTI SOBU</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
    header: { alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '900', color: '#1F2937' },
    codeBox: {
        marginTop: 8, backgroundColor: '#EDE9FE', borderRadius: 16,
        paddingHorizontal: 24, paddingVertical: 10, alignItems: 'center',
    },
    codeLabel: { fontSize: 12, color: '#7C3AED', fontWeight: '700', letterSpacing: 2 },
    code: { fontSize: 36, fontWeight: '900', color: '#7C3AED', letterSpacing: 8 },
    scrollContent: { paddingBottom: 16, gap: 12 },
    playersBox: {
        backgroundColor: '#fff', borderRadius: 20, padding: 16,
        borderWidth: 1, borderColor: '#E5E7EB',
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
    playerRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    playerName: { fontSize: 17, fontWeight: '600', color: '#374151' },
    hostBadge: {
        backgroundColor: '#7C3AED', color: '#fff', fontSize: 11,
        fontWeight: '800', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
    },
    settingsBox: {
        backgroundColor: '#fff', borderRadius: 20, padding: 16,
        borderWidth: 1, borderColor: '#E5E7EB', gap: 12,
    },
    settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    settingLabel: { fontSize: 16, fontWeight: '700', color: '#374151' },
    imposterHint: { fontSize: 13, color: '#9CA3AF', marginTop: -6 },
    counter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    counterBtn: {
        backgroundColor: '#EDE9FE', width: 36, height: 36,
        borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    },
    counterBtnText: { fontSize: 22, fontWeight: '700', color: '#7C3AED' },
    counterValue: { fontSize: 22, fontWeight: '900', color: '#1F2937', minWidth: 24, textAlign: 'center' },
    rowDisabled: { opacity: 0.3 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
    checkboxOutline: {
        width: 24, height: 24, borderRadius: 6, borderWidth: 2,
        borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    checkboxActive: { backgroundColor: '#14B8A6', borderColor: '#14B8A6' },
    checkboxSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    categorySection: { gap: 12 },
    selectAllBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        padding: 10, backgroundColor: '#F9FAFB',
        borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, alignSelf: 'flex-start',
    },
    selectAllText: { color: '#4B5563', fontWeight: 'bold', fontSize: 14 },
    categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    categoryBtn: {
        backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
        paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    },
    categoryBtnActive: { backgroundColor: '#14B8A6', borderColor: '#14B8A6' },
    categoryText: { color: '#6B7280', fontWeight: '600', fontSize: 14 },
    categoryTextActive: { color: '#fff' },
    footer: { gap: 10, paddingTop: 10 },
    startButton: {
        backgroundColor: '#14B8A6', padding: 22, borderRadius: 20, alignItems: 'center',
        shadowColor: '#14B8A6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
    },
    startButtonText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1.5 },
    waitingBox: {
        backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center',
        borderWidth: 2, borderColor: '#E5E7EB',
    },
    waitingText: { fontSize: 16, color: '#6B7280', fontWeight: '600' },
    leaveButton: {
        backgroundColor: '#fff', borderWidth: 2, borderColor: '#E5E7EB',
        padding: 16, borderRadius: 16, alignItems: 'center',
    },
    leaveButtonText: { color: '#EF4444', fontSize: 16, fontWeight: '800' },
});
