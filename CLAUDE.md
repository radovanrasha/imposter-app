# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start           # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run in browser
npm run lint        # Run ESLint (expo lint)
```

TypeScript is in strict mode. Path alias `@/*` maps to the project root.

## Architecture

Uses **Expo Router** (file-based routing). All screens live in `app/` and correspond directly to navigation routes.

**Game flow** (linear stack navigation):
```
index → setup → game → discussion → voting → [reveal-word] → result → index
```

**Screen data** is passed between routes as JSON strings via `useLocalSearchParams()` — not through a global store. Only scores are global state (`app/ScoreContext.tsx`).

**Game logic summary**:
- `setup.tsx`: Configures players, impostors, categories, difficulty. Persists settings with AsyncStorage.
- `game.tsx`: Distributes roles (citizens get the word, imposters get `"?"`). Uses card-flip animation (react-native-reanimated).
- `discussion.tsx`: 5-minute countdown timer.
- `voting.tsx`: Each player votes; plays `assets/audio/voting-music.mp3` (expo-av).
- `result.tsx`: Determines winner, awards +1 score to winners via `ScoreContext`.

**Word data** lives in `constants/words_easy.ts` and `constants/words_hard.ts`. Each entry has a word and a hint — citizens see the word, imposters see only the hint.

**Theming** is defined in `constants/theme.ts`. Screens use inline `StyleSheet.create()` with a purple/indigo + teal color palette.
