import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { BookOpen, CheckSquare, Database, Plus, Trash2, Users, UserX } from 'lucide-react-native';
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
                <View style={styles.settingCard}>
                    <View style={styles.settingHeader}>
                        <Users color="#fff" size={24} />
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
                                    placeholderTextColor="#666"
                                    maxLength={20}
                                />
                                {players.length > 3 && (
                                    <TouchableOpacity
                                        style={styles.deletePlayerBtn}
                                        onPress={() => removePlayer(index)}
                                    >
                                        <Trash2 color="#FF4500" size={20} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>

                    {players.length < 20 && (
                        <TouchableOpacity style={styles.addPlayerBtn} onPress={addPlayer}>
                            <Plus color="#fff" size={20} />
                            <Text style={styles.addPlayerText}>Dodaj Igrača</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* IMPOSTERS */}
                <View style={styles.settingCard}>
                    <View style={styles.settingHeader}>
                        <UserX color="#FF4500" size={24} />
                        <Text style={styles.settingTitle}>Broj Impostera</Text>
                    </View>
                    <View style={styles.controls}>
                        <TouchableOpacity style={styles.controlBtn} onPress={decreaseImposters}>
                            <Text style={styles.controlBtnText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.valueText}>{imposters}</Text>
                        <TouchableOpacity style={styles.controlBtn} onPress={increaseImposters}>
                            <Text style={styles.controlBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* BASES */}
                <View style={styles.settingCard}>
                    <View style={styles.settingHeader}>
                        <Database color="#fff" size={24} />
                        <Text style={styles.settingTitle}>Težina (Baze pojmova)</Text>
                    </View>
                    <View style={styles.categories}>
                        {BASES.map(baza => {
                            const isActive = selectedBases.includes(baza.id);
                            return (
                                <TouchableOpacity
                                    key={baza.id}
                                    style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
                                    onPress={() => toggleBase(baza.id)}
                                >
                                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{baza.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* CATEGORY */}
                <View style={styles.settingCard}>
                    <View style={styles.settingHeader}>
                        <BookOpen color="#fff" size={24} />
                        <Text style={styles.settingTitle}>Kategorije</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.selectAllBtn}
                        onPress={selectAllCategories}
                    >
                        <CheckSquare color={selectedCategories.length === CATEGORIES.length ? "#FF4500" : "#fff"} size={20} />
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
                <View style={styles.settingCard}>
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setShowWordToImposter(!showWordToImposter)}
                    >
                        <CheckSquare
                            color={showWordToImposter ? "#FF4500" : "#fff"}
                            size={24}
                        />
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
        backgroundColor: '#121212',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    scrollContent: {
        padding: 20,
    },
    settingCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    settingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    settingTitle: {
        color: '#fff',
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
        backgroundColor: '#333',
        color: '#fff',
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
    },
    deletePlayerBtn: {
        padding: 15,
        marginLeft: 10,
        backgroundColor: '#333',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addPlayerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#444',
        padding: 15,
        borderRadius: 10,
        marginTop: 5,
    },
    addPlayerText: {
        color: '#fff',
        marginLeft: 10,
        fontWeight: 'bold',
        fontSize: 16,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    controlBtn: {
        backgroundColor: '#333',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlBtnText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    valueText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    categories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryBtn: {
        backgroundColor: '#333',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    categoryBtnActive: {
        backgroundColor: '#FF4500',
    },
    categoryText: {
        color: '#aaa',
        fontWeight: 'bold',
    },
    categoryTextActive: {
        color: '#fff',
    },
    selectAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#333',
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    selectAllText: {
        color: '#fff',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    startButton: {
        backgroundColor: '#FF4500',
        margin: 20,
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxTextContainer: {
        marginLeft: 10,
    },
    settingSubtitle: {
        color: '#aaa',
        fontSize: 12,
        marginTop: 2,
    },
});
