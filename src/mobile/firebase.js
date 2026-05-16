import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, inMemoryPersistence } from '@firebase/auth';

import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let authPersistence;
try {
  authPersistence = getReactNativePersistence(AsyncStorage);
} catch (e) {
  console.warn('AsyncStorage persistence unavailable, using in-memory auth', e);
  authPersistence = inMemoryPersistence;
}

let authInstance;
try {
  authInstance = initializeAuth(app, { persistence: authPersistence });
} catch (e) {
  console.warn('Auth already initialized, reusing existing instance', e);
  authInstance = getAuth(app);
}
export const auth = authInstance;

export const db = getFirestore(app);
export const storage = getStorage(app);
