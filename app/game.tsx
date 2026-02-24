import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
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
    const impostersCount = Number(params.imposters) || 1;
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
                    <View style={{ flex: 1 }}>
                        {/* Front of Card (Hidden) */}
                        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
                            <Text style={styles.cardFrontText}>DRŽI DA OTKRIJEŠ</Text>
                            <Text style={styles.cardFrontSubtext}>Samo ti smeš da gledaš!</Text>
                        </Animated.View>

                        {/* Back of Card (Revealed) */}
                        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                            <Text style={[styles.cardBackText, currentRole.role === 'imposter' && styles.imposterText]}>
                                {currentRole.word}
                            </Text>

                            {currentRole.role === 'imposter' && (
                                <View style={styles.hintBox}>
                                    <Text style={styles.hintTitle}>Kategorija je o ovome slična:</Text>
                                    <Text style={styles.hintWord}>{currentRole.hint}</Text>
                                    <Text style={styles.hintSub}>Foliraj se!</Text>
                                </View>
                            )}
                        </Animated.View>
                    </View>
                </Pressable>
            </View>

            {hasRevealed && !isFlipped ? (
                <Pressable style={styles.nextButton} onPress={nextTurn}>
                    <Text style={styles.nextButtonText}>DALJE</Text>
                </Pressable>
            ) : (
                <View style={styles.placeholderButton} />
            )}
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
        color: '#FF4500',
        fontSize: 32,
        fontWeight: 'bold',
        marginVertical: 20,
        letterSpacing: 1,
    },
    cardContainer: {
        width: width * 0.8,
        height: width * 1.1,
        marginVertical: 30,
    },
    card: {
        flex: 1,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    cardFront: {
        backgroundColor: '#1E1E1E',
        borderWidth: 2,
        borderColor: '#333',
    },
    cardBack: {
        backgroundColor: '#333333',
        borderWidth: 2,
        borderColor: '#FF4500',
    },
    cardFrontText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cardFrontSubtext: {
        color: '#FF4500',
        fontSize: 16,
        marginTop: 20,
        fontWeight: '600',
    },
    cardBackText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    imposterText: {
        color: '#FF4500',
    },
    hintBox: {
        marginTop: 40,
        padding: 15,
        backgroundColor: 'rgba(255,69,0,0.1)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FF4500',
        alignItems: 'center',
    },
    hintTitle: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 5,
    },
    hintWord: {
        color: '#FF4500',
        fontSize: 22,
        fontWeight: 'bold',
    },
    hintSub: {
        color: '#aaa',
        fontSize: 12,
        marginTop: 5,
        fontStyle: 'italic',
    },
    nextButton: {
        backgroundColor: '#FF4500',
        width: '100%',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    placeholderButton: {
        height: 60,
        marginBottom: 20,
    },
});
