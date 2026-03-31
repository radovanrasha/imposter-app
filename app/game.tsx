import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import wordsEasy from '../constants/words_easy';
import wordsHard from '../constants/words_hard';

const { width } = Dimensions.get('window');

type WordItem = { word: string; hint: string };
type CategoryData = { category: string; items: WordItem[] };

const ALL_BASES: Record<string, CategoryData[]> = {
    easy: wordsEasy,
    hard: wordsHard
};

export default function GameScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const playersNames: string[] = params.players ? JSON.parse(params.players as string) : ["Igrač 1", "Igrač 2", "Igrač 3"];
    const playersCount = playersNames.length;
    const unknownImposters = params.unknownImposters === 'true';
    const impostersCount = unknownImposters
        ? Math.floor(Math.random() * Math.floor(playersCount / 3)) + 1
        : Number(params.imposters) || 1;
    const categories: string[] = params.categories ? JSON.parse(params.categories as string) : ["Životinje"];
    const bases: string[] = params.bases ? JSON.parse(params.bases as string) : ["easy"];
    const showWordToImposter = params.showWordToImposter === 'true';

    const [playersData, setPlayersData] = useState<{ id: number; name: string; role: 'citizen' | 'imposter'; word: string, hint?: string }[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [hasRevealed, setHasRevealed] = useState(false);

    const flipValue = useSharedValue(0);

    useEffect(() => {
        // Generate roles and word
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];

        let wordList: WordItem[] = [];
        bases.forEach(baseId => {
            const baseData = ALL_BASES[baseId];
            if (baseData) {
                const catData = baseData.find(c => c.category === randomCategory);
                if (catData) {
                    wordList = wordList.concat(catData.items);
                }
            }
        });

        if (wordList.length === 0) {
            wordList = ALL_BASES["easy"].find(c => c.category === "Životinje")?.items || [];
        }

        // Shuffle and pick one item (word + hint)
        const shuffledList = [...wordList].sort(() => 0.5 - Math.random());
        const secretItem = shuffledList[0];

        let roles: ('citizen' | 'imposter')[] = Array(playersCount).fill('citizen');
        let impostersAssigned = 0;
        while (impostersAssigned < impostersCount) {
            const randIdx = Math.floor(Math.random() * playersCount);
            if (roles[randIdx] !== 'imposter') {
                roles[randIdx] = 'imposter';
                impostersAssigned++;
            }
        }

        const newPlayersData = roles.map((role, idx) => ({
            id: idx + 1,
            name: playersNames[idx],
            role,
            word: role === 'imposter' ? 'Ti si Imposter!' : secretItem.word,
            hint: role === 'imposter' ? secretItem.hint : undefined
        }));

        setPlayersData(newPlayersData);
    }, []);

    const flipCardStart = () => {
        setIsFlipped(true);
        setHasRevealed(true);
        flipValue.value = withTiming(180, { duration: 300 });
    };

    const flipCardEnd = () => {
        setIsFlipped(false);
        flipValue.value = withTiming(0, { duration: 300 });
    };

    const nextTurn = () => {
        if (currentPlayer < playersCount - 1) {
            setCurrentPlayer(p => p + 1);
            setIsFlipped(false);
            setHasRevealed(false);
            flipValue.value = 0;
        } else {
            // Pick random starting player name
            const startingPlayerName = playersNames[Math.floor(Math.random() * playersCount)];
            // All players have seen their words
            router.replace({
                pathname: '/discussion',
                params: {
                    playersData: JSON.stringify(playersData),
                    startingPlayerName,
                    showWordToImposter: showWordToImposter ? 'true' : 'false'
                }
            });
        }
    };

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(flipValue.value, [0, 180], [0, 180]);
        return {
            transform: [{ rotateY: `${rotateY}deg` }, { perspective: 1000 }],
            backfaceVisibility: 'hidden',
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(flipValue.value, [0, 180], [180, 360]);
        return {
            transform: [{ rotateY: `${rotateY}deg` }, { perspective: 1000 }],
            backfaceVisibility: 'hidden',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        };
    });

    if (playersData.length === 0) return null;

    const currentRole = playersData[currentPlayer];

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>{currentRole.name}</Text>

            <View style={styles.cardContainer}>
                <Pressable
                    style={{ flex: 1 }}
                    onPressIn={flipCardStart}
                    onPressOut={flipCardEnd}
                >
                    <View style={styles.cardWrapper}>
                        {/* Front of Card (Hidden) */}
                        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
                            <Text style={styles.cardFrontText}>DRŽI DA OTKRIJEŠ</Text>
                            <Text style={styles.cardFrontSubtext}>Samo ti smeš da gledaš!</Text>
                        </Animated.View>

                        {/* Back of Card (Revealed) */}
                        <Animated.View style={[
                            styles.card,
                            styles.cardBack,
                            backAnimatedStyle,
                            currentRole.role === 'imposter' ? styles.imposterCard : styles.citizenCard
                        ]}>
                            <Text style={styles.roleText}>
                                {currentRole.role === 'citizen' ? 'Tvoja reč je:' : 'Uloga:'}
                            </Text>
                            <Text style={[styles.wordText, currentRole.role === 'imposter' && styles.imposterWord]}>
                                {currentRole.word}
                            </Text>
                            {currentRole.hint && (
                                <View style={styles.hintBox}>
                                    <Text style={styles.hintTitle}>Pomoćna reč (slična):</Text>
                                    <Text style={styles.hintText}>{currentRole.hint}</Text>
                                </View>
                            )}
                        </Animated.View>
                    </View>
                </Pressable>
            </View>

            <TouchableOpacity
                style={[styles.nextButton, !hasRevealed && styles.nextButtonDisabled]}
                onPress={nextTurn}
                disabled={!hasRevealed}
            >
                <Text style={styles.nextButtonText}>
                    {currentPlayer < playersCount - 1 ? 'SLEDEĆI IGRAČ' : 'ZAPOČNI DISKUSIJU'}
                </Text>
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
        color: '#1F2937', // Dark gray 800
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginVertical: 20,
        letterSpacing: 0.5,
    },
    cardContainer: {
        flex: 1,
        marginVertical: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardWrapper: {
        width: width * 0.85,
        height: width * 1.1,
        // The shadow is placed here so it doesn't rotate during the 3D flip
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    card: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
        // Moving shadow from here to cardWrapper
    },
    cardFront: {
        backgroundColor: '#8B5CF6', // Soft Violet instead of Dark Blue (#7C3AED) or White
        borderWidth: 4,
        borderColor: '#DDD6FE', // Lighter purple border
    },
    cardFrontText: {
        color: '#FFFFFF', // White text
        fontSize: 28,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: 1,
    },
    cardFrontSubtext: {
        color: '#EDE9FE', // Very light purple subtitle
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    cardBack: {
        backgroundColor: '#FFFFFF',
    },
    citizenCard: {
        borderWidth: 4,
        borderColor: '#14B8A6', // Teal border for citizen
    },
    imposterCard: {
        borderWidth: 4,
        borderColor: '#EF4444', // Red border for imposter
        backgroundColor: '#FEF2F2', // Very light red background
    },
    roleText: {
        color: '#6B7280', // Gray 500
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    wordText: {
        color: '#1F2937', // Gray 800
        fontSize: 48,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 20,
    },
    imposterWord: {
        color: '#EF4444', // Danger Red
    },
    hintBox: {
        marginTop: 30,
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA', // Light red border
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    hintTitle: {
        color: '#9CA3AF', // Gray 400
        fontSize: 14,
        marginBottom: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    hintText: {
        color: '#1F2937',
        fontSize: 28,
        fontWeight: '900',
        textAlign: 'center',
    },
    nextButton: {
        backgroundColor: '#14B8A6', // Teal 500
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    nextButtonDisabled: {
        backgroundColor: '#D1D5DB', // Gray 300
        shadowOpacity: 0,
        elevation: 0,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1.5,
    }
});
