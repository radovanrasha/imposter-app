import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../constants/api';
import { useOnlineGame } from '../OnlineGameContext';

export default function OnlineIndexScreen() {
    const router = useRouter();
    const { connect } = useOnlineGame();

    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
    const [loading, setLoading] = useState(false);

    const createRoom = async () => {
        if (!name.trim()) { Alert.alert('Unesite ime'); return; }
        setLoading(true);
        try {
            const { data } = await api.post('/rooms', { host_name: name.trim() });
            connect(data.room_code, data.player_id, true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            router.push('/online/lobby' as any);
        } catch {
            Alert.alert('Greška', 'Nije moguće kreirati sobu');
        } finally {
            setLoading(false);
        }
    };

    const joinRoom = async () => {
        if (!name.trim()) { Alert.alert('Unesite ime'); return; }
        if (!roomCode.trim()) { Alert.alert('Unesite kod sobe'); return; }
        setLoading(true);
        try {
            const { data } = await api.post(`/rooms/${roomCode.toUpperCase()}/join`, { name: name.trim() });
            connect(roomCode.toUpperCase(), data.player_id, false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            router.push('/online/lobby' as any);
        } catch (err: any) {
            const msg = err?.response?.status === 404 ? 'Soba nije pronađena' : 'Nije moguće ući u sobu';
            Alert.alert('Greška', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>ONLINE MOD</Text>

            {mode === 'choose' ? (
                <View style={styles.content}>
                    <TouchableOpacity style={styles.button} onPress={() => setMode('create')}>
                        <Text style={styles.buttonText}>KREIRAJ SOBU</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => setMode('join')}>
                        <Text style={[styles.buttonText, styles.secondaryText]}>PRIDRUŽI SE SOBI</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backText}>← Nazad</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.content}>
                    <Text style={styles.label}>Tvoje ime</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Npr. Pera"
                        maxLength={20}
                        autoFocus
                    />

                    {mode === 'join' && (
                        <>
                            <Text style={styles.label}>Kod sobe</Text>
                            <TextInput
                                style={[styles.input, styles.codeInput]}
                                value={roomCode}
                                onChangeText={t => setRoomCode(t.toUpperCase())}
                                placeholder="ABCD"
                                maxLength={4}
                                autoCapitalize="characters"
                            />
                        </>
                    )}

                    <TouchableOpacity
                        style={[styles.button, loading && styles.disabledButton]}
                        onPress={mode === 'create' ? createRoom : joinRoom}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Učitavanje...' : mode === 'create' ? 'KREIRAJ' : 'PRIDRUŽI SE'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.backButton} onPress={() => setMode('choose')}>
                        <Text style={styles.backText}>← Nazad</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
    title: {
        fontSize: 36, fontWeight: '900', color: '#1F2937',
        textAlign: 'center', marginBottom: 40, letterSpacing: 2,
    },
    content: { flex: 1, justifyContent: 'center', gap: 16 },
    label: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: -8 },
    input: {
        backgroundColor: '#fff', borderRadius: 16, padding: 18,
        fontSize: 18, borderWidth: 2, borderColor: '#E5E7EB',
    },
    codeInput: {
        fontSize: 28, fontWeight: '900', textAlign: 'center',
        letterSpacing: 8, color: '#7C3AED',
    },
    button: {
        backgroundColor: '#7C3AED', padding: 22, borderRadius: 20,
        alignItems: 'center', marginTop: 8,
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1.5 },
    secondaryButton: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#E5E7EB' },
    secondaryText: { color: '#7C3AED' },
    disabledButton: { backgroundColor: '#D1D5DB' },
    backButton: { alignItems: 'center', marginTop: 8 },
    backText: { color: '#6B7280', fontSize: 16, fontWeight: '600' },
});
