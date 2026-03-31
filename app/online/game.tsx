import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnlineGame } from '../OnlineGameContext';

const { width } = Dimensions.get('window');

export default function OnlineGameScreen() {
    const { myRole, myWord, myHint, sendMessage } = useOnlineGame();

    const flipValue = useSharedValue(0);
    const isFlipped = useSharedValue(false);

    const flipStart = () => {
        isFlipped.value = true;
        flipValue.value = withTiming(180, { duration: 300 });
    };

    const flipEnd = () => {
        isFlipped.value = false;
        flipValue.value = withTiming(0, { duration: 300 });
    };

    const frontStyle = useAnimatedStyle(() => ({
        transform: [{ rotateY: `${interpolate(flipValue.value, [0, 180], [0, 180])}deg` }, { perspective: 1000 }],
        backfaceVisibility: 'hidden',
    }));

    const backStyle = useAnimatedStyle(() => ({
        transform: [{ rotateY: `${interpolate(flipValue.value, [0, 180], [180, 360])}deg` }, { perspective: 1000 }],
        backfaceVisibility: 'hidden',
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    }));

    const markReady = () => {
        sendMessage('ready');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Tvoja uloga</Text>
            <Text style={styles.subheader}>Drži kartu da vidiš svoju ulogu!</Text>

            <View style={styles.cardContainer}>
                <Pressable style={{ flex: 1 }} onPressIn={flipStart} onPressOut={flipEnd}>
                    <View style={styles.cardWrapper}>
                        <Animated.View style={[styles.card, styles.cardFront, frontStyle]}>
                            <Text style={styles.cardFrontText}>DRŽI DA OTKRIJEŠ</Text>
                            <Text style={styles.cardFrontSubtext}>Samo ti smeš da gledaš!</Text>
                        </Animated.View>

                        <Animated.View style={[
                            styles.card,
                            backStyle,
                            myRole === 'imposter' ? styles.imposterCard : styles.citizenCard
                        ]}>
                            <Text style={styles.roleText}>
                                {myRole === 'citizen' ? 'Tvoja reč je:' : 'Tvoja pomoćna reč:'}
                            </Text>
                            <Text style={[styles.wordText, myRole === 'imposter' && styles.imposterWord]}>
                                {myRole === 'citizen' ? myWord : myHint}
                            </Text>
                        </Animated.View>
                    </View>
                </Pressable>
            </View>

            <TouchableOpacity style={styles.readyButton} onPress={markReady}>
                <Text style={styles.readyButtonText}>SPREMAN SAM</Text>
            </TouchableOpacity>
            <Text style={styles.readyNote}>Svi igrači moraju biti spremni da bi diskusija počela</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20, justifyContent: 'space-between' },
    header: { fontSize: 32, fontWeight: '900', color: '#1F2937', textAlign: 'center', marginTop: 10 },
    subheader: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 10 },
    cardContainer: { flex: 1, marginVertical: 20, justifyContent: 'center', alignItems: 'center' },
    cardWrapper: {
        width: width * 0.85, height: width * 1.0,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
    },
    card: { width: '100%', height: '100%', borderRadius: 24, padding: 30, justifyContent: 'center', alignItems: 'center' },
    cardFront: { backgroundColor: '#8B5CF6', borderWidth: 4, borderColor: '#DDD6FE' },
    cardFrontText: { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 10, letterSpacing: 1 },
    cardFrontSubtext: { color: '#EDE9FE', fontSize: 16, textAlign: 'center', fontWeight: '600' },
    citizenCard: { backgroundColor: '#fff', borderWidth: 4, borderColor: '#14B8A6' },
    imposterCard: { backgroundColor: '#FEF2F2', borderWidth: 4, borderColor: '#EF4444' },
    roleText: { color: '#6B7280', fontSize: 16, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
    wordText: { color: '#1F2937', fontSize: 44, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
    imposterWord: { color: '#EF4444' },
    hintBox: { marginTop: 20, padding: 16, backgroundColor: '#fff', borderRadius: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
    hintTitle: { color: '#9CA3AF', fontSize: 13, marginBottom: 6, fontWeight: 'bold', textTransform: 'uppercase' },
    hintText: { color: '#1F2937', fontSize: 26, fontWeight: '900', textAlign: 'center' },
    readyButton: {
        backgroundColor: '#14B8A6', padding: 22, borderRadius: 20, alignItems: 'center',
        shadowColor: '#14B8A6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
    },
    readyButtonText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1.5 },
    readyNote: { textAlign: 'center', color: '#9CA3AF', fontSize: 13, marginTop: 8, marginBottom: 4 },
});
