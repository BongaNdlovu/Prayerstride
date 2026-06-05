import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getApps, initializeApp } from 'firebase/app';
import * as firebaseAuth from '@firebase/auth';

import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { warn } from './logger';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const { getAuth, initializeAuth } = firebaseAuth;

function createAuthInstance() {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  const getReactNativePersistence = firebaseAuth.getReactNativePersistence;
  if (typeof getReactNativePersistence !== 'function') {
    warn('React Native auth persistence is unavailable, reusing default auth instance');
    return getAuth(app);
  }

  return initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

let authInstance;
try {
  authInstance = createAuthInstance();
} catch (e) {
  if (e?.code !== 'auth/already-initialized') throw e;
  warn('Auth already initialized, reusing existing instance');
  authInstance = getAuth(app);
}
export const auth = authInstance;

export const db = getFirestore(app);
export const storage = getStorage(app);
