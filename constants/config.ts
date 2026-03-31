// API host is read from EXPO_PUBLIC_API_HOST in .env.local (never committed to git).
// Copy .env.example to .env.local and set your value there.
const API_HOST = process.env.EXPO_PUBLIC_API_HOST ?? 'localhost:8080';

const isSecure = API_HOST.includes('ngrok') || API_HOST.includes('radovanrasha.com');

export const API_URL = isSecure ? `https://${API_HOST}` : `http://${API_HOST}`;
export const WS_URL  = isSecure ? `wss://${API_HOST}`  : `ws://${API_HOST}`;
