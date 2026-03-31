import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { BookOpen, CheckSquare, Plus, Trash2, Users, UserX } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import wordsEasy from '../constants/words_easy';

const CATEGORIES = wordsEasy.map(c => c.category);

const BASES = [
    { id: 'easy', label: 'Laka (Easy)' },
    { id: 'hard', label: 'Teška (Hard)' }
];

export default function SetupScreen() {
    const router = useRouter();
    const [players, setPlayers] = useState<string[]>(["Igrač 1", "Igrač 2", "Igrač 3"]);
    const [imposters, setImposters] = useState(1);
    const [unknownImposters, setUnknownImposters] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([CATEGORIES[0]]);
    const [selectedBases, setSelectedBases] = useState<string[]>(['easy']);
    const [showWordToImposter, setShowWordToImposter] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSettings = await AsyncStorage.getItem('imposterGameSettings');
                if (savedSettings) {
                    const parsed = JSON.parse(savedSettings);
                    if (parsed.players) setPlayers(parsed.players);
                    if (parsed.imposters) setImposters(parsed.imposters);
                    if (parsed.unknownImposters !== undefined) setUnknownImposters(parsed.unknownImposters);
                    if (parsed.selectedCategories) setSelectedCategories(parsed.selectedCategories);
                    if (parsed.selectedBases) setSelectedBases(parsed.selectedBases);
                    if (parsed.showWordToImposter !== undefined) setShowWordToImposter(parsed.showWordToImposter);
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        };

        loadSettings();
    }, []);

    const startGame = async () => {
        if (selectedBases.length === 0) {
            alert("Morate izabrati barem jednu bazu pojmova!");
            return;
        }

        if (selectedCategories.length === 0) {
            alert("Morate izabrati barem jednu kategoriju!");
            return;
        }

        if (players.some(p => p.trim() === '')) {
            alert("Svi igrači moraju imati ime!");
            return;
        }

        const settingsToSave = {
            players,
            imposters,
            unknownImposters,
            selectedCategories,
            selectedBases,
            showWordToImposter
        };

        try {
            await AsyncStorage.setItem('imposterGameSettings', JSON.stringify(settingsToSave));
        } catch (error) {
            console.error('Error saving settings:', error);
        }

        // Pass settings to game screen
        router.push({
            pathname: '/game',
            params: {
                players: JSON.stringify(players),
                imposters,
                unknownImposters: unknownImposters ? 'true' : 'false',
                categories: JSON.stringify(selectedCategories),
                bases: JSON.stringify(selectedBases),
                showWordToImposter: showWordToImposter ? 'true' : 'false'
            }
        });
    };

    const addPlayer = () => {
        if (players.length < 20) {
            setPlayers([...players, `Igrač ${players.length + 1}`]);
        }
    };

    const removePlayer = (index: number) => {
        if (players.length > 3) {
            const newPlayers = players.filter((_, i) => i !== index);
            setPlayers(newPlayers);
            if (newPlayers.length <= imposters * 2) {
                setImposters(Math.max(1, Math.floor(newPlayers.length / 3)));
            }
        }
    };

    const updatePlayerName = (text: string, index: number) => {
        const newPlayers = [...players];
        newPlayers[index] = text;
        setPlayers(newPlayers);
    };

    const increaseImposters = () => setImposters(i => Math.min(Math.floor(players.length / 3), i + 1));
    const decreaseImposters = () => setImposters(i => Math.max(1, i - 1));

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev =>
            prev.includes(cat)
                ? prev.filter(c => c !== cat)
                : [...prev, cat]
        );
    };

    const toggleBase = (baseId: string) => {
        setSelectedBases(prev =>
            prev.includes(baseId)
                ? prev.filter(b => b !== baseId)
                : [...prev, baseId]
        );
    };

    const selectAllCategories = () => {
        if (selectedCategories.length === CATEGORIES.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories([...CATEGORIES]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Postavke Igre</Text>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* PLAYERS */}
                <View style={[styles.settingCard, styles.shadow]}>
                    <View style={styles.settingHeader}>
                        <Users color="#7C3AED" size={24} />
                        <Text style={styles.settingTitle}>Igrači ({players.length})</Text>
                    </View>

                    <View style={styles.playersList}>
                        {players.map((name, index) => (
                            <View key={`player-${index}`} style={styles.playerInputRow}>
                                <TextInput
                                    style={styles.playerInput}
                                    value={name}
                                    onChangeText={(text) => updatePlayerName(text, index)}
                                    placeholder={`Igrač ${index + 1}`}
                                    placeholderTextColor="#9CA3AF"
                                    maxLength={20}
                                />
                                {players.length > 3 && (
                                    <TouchableOpacity
                                        style={styles.deletePlayerBtn}
                                        onPress={() => removePlayer(index)}
                                    >
                                        <Trash2 color="#EF4444" size={20} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>

                    {players.length < 20 && (
                        <TouchableOpacity style={styles.addPlayerBtn} onPress={addPlayer}>
                            <Plus color="#7C3AED" size={20} />
                            <Text style={styles.addPlayerText}>Dodaj Igrača</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* IMPOSTERS */}
                <View style={[styles.settingCard, styles.shadow]}>
                    <View style={styles.settingHeader}>
                        <UserX color="#EF4444" size={24} />
                        <Text style={styles.settingTitle}>Broj Impostera</Text>
                    </View>
                    <View style={[styles.controls, unknownImposters && styles.controlsDisabled]}>
                        <TouchableOpacity style={styles.controlBtn} onPress={decreaseImposters} disabled={unknownImposters}>
                            <Text style={styles.controlBtnText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.valueText}>{imposters}</Text>
                        <TouchableOpacity style={styles.controlBtn} onPress={increaseImposters} disabled={unknownImposters}>
                            <Text style={styles.controlBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[styles.checkboxRow, { marginTop: 16 }]}
                        onPress={() => setUnknownImposters(!unknownImposters)}
                    >
                        <View style={[styles.checkboxOutline, unknownImposters && styles.checkboxActive]}>
                            {unknownImposters && <CheckSquare color="#fff" size={20} />}
                        </View>
                        <View style={styles.checkboxTextContainer}>
                            <Text style={styles.settingTitle}>Nepoznat broj impostera</Text>
                            <Text style={styles.settingSubtitle}>Niko ne zna koliko ih ima do kraja igre</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* BASES - Hidden from UI, defaults to 'easy' which contains all words */}

                {/* CATEGORY */}
                <View style={[styles.settingCard, styles.shadow]}>
                    <View style={styles.settingHeader}>
                        <BookOpen color="#F59E0B" size={24} />
                        <Text style={styles.settingTitle}>Kategorije</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.selectAllBtn}
                        onPress={selectAllCategories}
                    >
                        <CheckSquare color={selectedCategories.length === CATEGORIES.length ? "#14B8A6" : "#9CA3AF"} size={20} />
                        <Text style={styles.selectAllText}>
                            {selectedCategories.length === CATEGORIES.length ? "Deselektuj Sve" : "Izaberi Sve"}
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
                                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{cat}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* SHOW WORD SETTING */}
                <View style={[styles.settingCard, styles.shadow]}>
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setShowWordToImposter(!showWordToImposter)}
                    >
                        <View style={[styles.checkboxOutline, showWordToImposter && styles.checkboxActive]}>
                            {showWordToImposter && <CheckSquare color="#fff" size={20} />}
                        </View>
                        <View style={styles.checkboxTextContainer}>
                            <Text style={styles.settingTitle}>Prikaži reč impostoru</Text>
                            <Text style={styles.settingSubtitle}>Na kraju igre prikaži koja je bila reč</Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startButtonText}>ZAPOČNI IGRU</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Light gray background
    },
    headerTitle: {
        color: '#1F2937', // Dark gray
        fontSize: 28,
        fontWeight: '900',
        textAlign: 'center',
        marginVertical: 20,
        letterSpacing: 0.5,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    settingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    settingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    settingTitle: {
        color: '#1F2937',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    playersList: {
        marginBottom: 10,
    },
    playerInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    playerInput: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        color: '#1F2937',
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    deletePlayerBtn: {
        padding: 15,
        marginLeft: 10,
        backgroundColor: '#FEE2E2', // Light red bg
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addPlayerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3E8FF', // Light purple bg
        padding: 15,
        borderRadius: 12,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#E9D5FF',
    },
    addPlayerText: {
        color: '#7C3AED',
        marginLeft: 10,
        fontWeight: '700',
        fontSize: 16,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    controlsDisabled: {
        opacity: 0.3,
    },
    controlBtn: {
        backgroundColor: '#F3F4F6',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    controlBtnText: {
        color: '#1F2937',
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 28,
    },
    valueText: {
        color: '#1F2937',
        fontSize: 32,
        fontWeight: '900',
    },
    categories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryBtn: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    categoryBtnActive: {
        backgroundColor: '#14B8A6',
        borderColor: '#14B8A6',
    },
    categoryText: {
        color: '#6B7280',
        fontWeight: '600',
    },
    categoryTextActive: {
        color: '#fff',
    },
    selectAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    selectAllText: {
        color: '#4B5563',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    startButton: {
        backgroundColor: '#7C3AED',
        margin: 20,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxOutline: {
        width: 26,
        height: 26,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    checkboxActive: {
        backgroundColor: '#14B8A6',
        borderColor: '#14B8A6',
    },
    checkboxTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    settingSubtitle: {
        color: '#6B7280',
        fontSize: 13,
        marginTop: 2,
    },
});
