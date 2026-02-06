import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
// RN build of @firebase/auth has these; Metro resolves to RN. TS may use browser types.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { initializeAuth, getReactNativePersistence } = require('@firebase/auth');
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// Use .env (EXPO_PUBLIC_FIREBASE_*) to override; these are your project defaults.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyDrJY-JpG32RVPQrO5Z67wQRoUHUc9Q_5M",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "apart-admin.firebaseapp.com",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL ?? "https://apart-admin-default-rtdb.firebaseio.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "apart-admin",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "apart-admin.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "108578467447",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "1:108578467447:web:3aa0b9a6adab03698d2072",
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = getFirebaseApp();

// React Native needs explicit persistence; getAuth() causes auth/configuration-not-found.
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (err: unknown) {
  const code = (err as { code?: string })?.code;
  if (code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw err;
  }
}
export { auth };
export const db: Firestore = getFirestore(app);

// Optional: use emulator in development
// if (__DEV__) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export async function ensureAnonymousAuth(): Promise<void> {
  const { currentUser } = auth;
  if (currentUser?.isAnonymous) return;
  try {
    await signInAnonymously(auth);
  } catch (e) {
    console.error('Anonymous sign-in failed', e);
    throw e;
  }
}

export { signInAnonymously };
