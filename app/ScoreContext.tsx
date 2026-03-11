import React, { createContext, useContext, useState } from 'react';

type ScoreContextType = {
    scores: Record<string, number>;
    addScore: (playerNames: string[]) => void;
    resetScores: () => void;
};

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export function ScoreProvider({ children }: { children: React.ReactNode }) {
    const [scores, setScores] = useState<Record<string, number>>({});

    // Add +1 point to each player in the list
    const addScore = (playerNames: string[]) => {
        setScores(prev => {
            const newScores = { ...prev };
            playerNames.forEach(name => {
                newScores[name] = (newScores[name] || 0) + 1;
            });
            return newScores;
        });
    };

    // Reset all scores
    const resetScores = () => {
        setScores({});
    };

    return (
        <ScoreContext.Provider value={{ scores, addScore, resetScores }}>
            {children}
        </ScoreContext.Provider>
    );
}

export function useScore() {
    const context = useContext(ScoreContext);
    if (context === undefined) {
        throw new Error('useScore must be used within a ScoreProvider');
    }
    return context;
}
