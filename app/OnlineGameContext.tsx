import { useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { WS_URL } from '../constants/config';

export type PlayerInfo = { id: string; name: string; is_host: boolean; connected: boolean };

export type GameResult = {
    voted_out_name: string;
    was_imposter: boolean;
    imposters: PlayerInfo[];
    word: string;
};

type Phase = 'waiting' | 'card_reveal' | 'discussion' | 'voting' | 'result' | null;

interface OnlineGameState {
    roomCode: string;
    playerId: string;
    isHost: boolean;
    players: PlayerInfo[];
    myRole: 'citizen' | 'imposter' | null;
    myWord: string;
    myHint: string;
    myVote: string;
    phase: Phase;
    startingPlayerName: string;
    discussionDuration: number;
    discussionTimeLeft: number;
    votesCast: number;
    totalPlayers: number;
    voteCounts: Record<string, number>;
    hasVoted: string[];
    gameResult: GameResult | null;
    isReconnecting: boolean;
    sendMessage: (type: string, payload?: object) => void;
    castVote: (targetId: string) => void;
    connect: (roomCode: string, playerId: string, isHost: boolean) => void;
    reset: () => void;
    resetForNewGame: () => void;
}

const OnlineGameContext = createContext<OnlineGameState | null>(null);

export function OnlineGameProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const wsRef = useRef<WebSocket | null>(null);
    const intentionalClose = useRef(false);
    const wsUrlRef = useRef('');
    // Holds the latest message handler so reconnected sockets can reuse it
    const onMessageRef = useRef<((event: MessageEvent) => void) | null>(null);

    const [roomCode, setRoomCode] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [players, setPlayers] = useState<PlayerInfo[]>([]);
    const [myRole, setMyRole] = useState<'citizen' | 'imposter' | null>(null);
    const [myWord, setMyWord] = useState('');
    const [myHint, setMyHint] = useState('');
    const [myVote, setMyVote] = useState('');
    const [phase, setPhase] = useState<Phase>(null);
    const [startingPlayerName, setStartingPlayerName] = useState('');
    const [discussionDuration, setDiscussionDuration] = useState(300);
    const [discussionTimeLeft, setDiscussionTimeLeft] = useState(300);
    const [votesCast, setVotesCast] = useState(0);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
    const [hasVoted, setHasVoted] = useState<string[]>([]);
    const [gameResult, setGameResult] = useState<GameResult | null>(null);
    const [isReconnecting, setIsReconnecting] = useState(false);

    const sendMessage = useCallback((type: string, payload?: object) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, payload }));
        }
    }, []);

    const castVote = useCallback((targetId: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'vote', payload: { voted_player_id: targetId } }));
        }
        setMyVote(targetId);
    }, []);

    // openSocket creates a WebSocket and wires up handlers. On unexpected close it retries.
    const openSocket = useCallback((url: string) => {
        const socket = new WebSocket(url);
        wsRef.current = socket;

        socket.onmessage = (event) => onMessageRef.current?.(event);

        socket.onclose = () => {
            if (intentionalClose.current) return;
            setIsReconnecting(true);
            setTimeout(() => {
                if (!intentionalClose.current) {
                    openSocket(url);
                }
            }, 2000);
        };

        socket.onerror = () => {
            console.log('WebSocket error');
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const connect = useCallback((code: string, pid: string, host: boolean) => {
        setRoomCode(code);
        setPlayerId(pid);
        setIsHost(host);
        setPhase('waiting');
        intentionalClose.current = false;

        const url = `${WS_URL}/ws/${code}?player_id=${pid}`;
        wsUrlRef.current = url;

        // Define message handler (stored in ref so reconnected sockets reuse it)
        onMessageRef.current = (event: MessageEvent) => {
            const msg = JSON.parse(event.data);

            switch (msg.type) {
                case 'player_joined':
                case 'player_left':
                    setPlayers(msg.payload.players);
                    break;

                case 'role_assigned':
                    setMyRole(msg.payload.role);
                    setMyWord(msg.payload.word || '');
                    setMyHint(msg.payload.hint || '');
                    setPhase('card_reveal');
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    router.push('/online/game' as any);
                    break;

                case 'phase_discussion':
                    setStartingPlayerName(msg.payload.starting_player_name);
                    setDiscussionDuration(msg.payload.duration);
                    setDiscussionTimeLeft(msg.payload.duration);
                    setPhase('discussion');
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    router.push('/online/discussion' as any);
                    break;

                case 'discussion_timer':
                    setDiscussionTimeLeft(msg.payload.time_left);
                    break;

                case 'phase_voting':
                    setVoteCounts({});
                    setHasVoted([]);
                    setVotesCast(0);
                    setMyVote('');
                    setPhase('voting');
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    router.push('/online/voting' as any);
                    break;

                case 'vote_update':
                    setVotesCast(msg.payload.votes_cast);
                    setTotalPlayers(msg.payload.total_players);
                    setVoteCounts(msg.payload.vote_counts || {});
                    setHasVoted(msg.payload.has_voted || []);
                    break;

                case 'game_result':
                    setGameResult(msg.payload);
                    setPhase('result');
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    router.push('/online/result' as any);
                    break;

                case 'game_reset':
                    setMyRole(null);
                    setMyWord('');
                    setMyHint('');
                    setMyVote('');
                    setPhase('waiting');
                    setStartingPlayerName('');
                    setDiscussionDuration(300);
                    setDiscussionTimeLeft(300);
                    setVotesCast(0);
                    setTotalPlayers(0);
                    setVoteCounts({});
                    setHasVoted([]);
                    setGameResult(null);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    router.replace('/online/lobby' as any);
                    break;

                case 'reconnect_state': {
                    const p = msg.payload;
                    setPlayers(p.players || []);
                    setMyRole(p.role || null);
                    setMyWord(p.word || '');
                    setMyHint(p.hint || '');
                    setPhase(p.phase || null);
                    if (p.starting_player_name) setStartingPlayerName(p.starting_player_name);
                    if (p.discussion_time_left != null) setDiscussionTimeLeft(p.discussion_time_left);
                    if (p.votes_cast != null) setVotesCast(p.votes_cast);
                    if (p.total_players != null) setTotalPlayers(p.total_players);
                    if (p.vote_counts) setVoteCounts(p.vote_counts);
                    if (p.has_voted) setHasVoted(p.has_voted);
                    if (p.my_voted_player_id) setMyVote(p.my_voted_player_id);
                    if (p.game_result) setGameResult(p.game_result);
                    setIsReconnecting(false);
                    // Navigate to the correct screen
                    switch (p.phase) {
                        case 'card_reveal':
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            router.replace('/online/game' as any); break;
                        case 'discussion':
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            router.replace('/online/discussion' as any); break;
                        case 'voting':
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            router.replace('/online/voting' as any); break;
                        case 'result':
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            router.replace('/online/result' as any); break;
                        default:
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            router.replace('/online/lobby' as any); break;
                    }
                    break;
                }
            }
        };

        openSocket(url);
    }, [router, openSocket]);

    const reset = useCallback(() => {
        intentionalClose.current = true;
        wsRef.current?.close();
        wsRef.current = null;
        onMessageRef.current = null;
        setRoomCode('');
        setPlayerId('');
        setIsHost(false);
        setPlayers([]);
        setMyRole(null);
        setMyWord('');
        setMyHint('');
        setMyVote('');
        setPhase(null);
        setStartingPlayerName('');
        setDiscussionDuration(300);
        setDiscussionTimeLeft(300);
        setVotesCast(0);
        setTotalPlayers(0);
        setVoteCounts({});
        setHasVoted([]);
        setGameResult(null);
        setIsReconnecting(false);
    }, []);

    const resetForNewGame = useCallback(() => {
        setMyRole(null);
        setMyWord('');
        setMyHint('');
        setMyVote('');
        setPhase('waiting');
        setStartingPlayerName('');
        setDiscussionDuration(300);
        setDiscussionTimeLeft(300);
        setVotesCast(0);
        setTotalPlayers(0);
        setVoteCounts({});
        setHasVoted([]);
        setGameResult(null);
    }, []);

    return (
        <OnlineGameContext.Provider value={{
            roomCode, playerId, isHost, players,
            myRole, myWord, myHint, myVote,
            phase, startingPlayerName, discussionDuration,
            votesCast, totalPlayers, voteCounts, hasVoted, gameResult,
            discussionTimeLeft, isReconnecting,
            sendMessage, castVote, connect, reset, resetForNewGame,
        }}>
            {children}
        </OnlineGameContext.Provider>
    );
}

export function useOnlineGame() {
    const ctx = useContext(OnlineGameContext);
    if (!ctx) throw new Error('useOnlineGame must be used inside OnlineGameProvider');
    return ctx;
}
