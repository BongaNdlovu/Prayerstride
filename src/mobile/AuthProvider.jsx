import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  updateProfile,
} from '@firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { bootstrapOwner, completeRegistration, deleteOwnAccount } from './api';
import { PRIVACY_VERSION, TERMS_VERSION } from './legal';
import { error as logError } from './logger';
import { toUserFacingError } from './errors';
import { clearCachedProfile } from './profileCache';
import { isMockDataEnabled, resetMockDataForTests } from './mockData';

const AuthContext = createContext(null);
const MIN_PASSWORD_LENGTH = 12;
const MOCK_USER = {
  uid: 'demo-admin',
  displayName: 'Demo Admin',
  email: 'demo@prayerstride.test',
  emailVerified: true,
  photoURL: null,
  getIdToken: async () => 'mock-token',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const bootstrappedUidRef = useRef('');
  const mockMode = isMockDataEnabled();

  useEffect(() => {
    if (mockMode) {
      resetMockDataForTests();
      setUser(MOCK_USER);
      setLoading(false);
      bootstrappedUidRef.current = MOCK_USER.uid;
      return undefined;
    }

    return onAuthStateChanged(auth,
      (nextUser) => {
        setUser(nextUser);
        setLoading(false);
        if (!nextUser) {
          bootstrappedUidRef.current = '';
          clearCachedProfile();
        }
        if (nextUser && bootstrappedUidRef.current !== nextUser.uid) {
          const uid = nextUser.uid;
          bootstrapOwner()
            .then(() => {
              if (auth.currentUser?.uid === uid) {
                bootstrappedUidRef.current = uid;
              }
            })
            .catch((error) => {
              logError('Owner bootstrap failed', error);
            });
        }
      },
      (error) => {
        logError('Auth state change error', error);
        setLoading(false);
      },
    );
  }, [mockMode]);

  const value = useMemo(() => ({
    user,
    loading,
    registering,
    async signIn(email, password) {
      if (mockMode) {
        setUser(MOCK_USER);
        return { user: MOCK_USER };
      }
      try {
        return await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        throw toUserFacingError(error, 'Could not sign in. Please try again.');
      }
    },
    async register(email, password, name, profile = {}) {
      if (mockMode) {
        setUser(MOCK_USER);
        return { credential: { user: MOCK_USER }, registration: { ok: true, profile: MOCK_USER } };
      }
      if (!password || password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      }
      setRegistering(true);
      let credential;
      try {
        credential = await createUserWithEmailAndPassword(auth, email, password);
        const displayName = name;
        await updateProfile(credential.user, { displayName });
        await setDoc(doc(db, 'users', credential.user.uid), {
          uid: credential.user.uid,
          displayName,
          email,
          createdAt: serverTimestamp(),
          role: 'user',
          owner: false,
          photoURL: null,
          registrationState: 'pending_completion',
        });
        const registration = await completeRegistration({
          dateOfBirth: profile.dateOfBirth,
          isSeventhDayAdventist: profile.isSeventhDayAdventist === true,
          churchName: profile.churchName,
          termsAccepted: profile.termsAccepted === true,
          termsVersion: TERMS_VERSION,
          privacyVersion: PRIVACY_VERSION,
        });
        try {
          await sendEmailVerification(credential.user);
        } catch (error) {
          logError('Email verification delivery failed', error);
        }
        return { credential, registration };
      } catch (error) {
        if (credential?.user) {
          try {
            await deleteOwnAccount();
          } catch (backendCleanupError) {
            logError('Registration backend cleanup failed', backendCleanupError);
            try {
              await deleteUser(credential.user);
            } catch (authCleanupError) {
              logError('Registration auth cleanup failed', authCleanupError);
              await firebaseSignOut(auth).catch((signOutError) => {
                logError('Registration cleanup sign-out failed', signOutError);
              });
              throw new Error('Registration could not be completed or fully rolled back. Please contact support.');
            }
          }
        }
        throw toUserFacingError(error, 'Could not create your account. Please try again.');
      } finally {
        setRegistering(false);
      }
    },
    async completePendingRegistration(profile = {}) {
      if (mockMode) {
        setUser(MOCK_USER);
        return { ok: true, profile: MOCK_USER };
      }
      setRegistering(true);
      try {
        return await completeRegistration({
          dateOfBirth: profile.dateOfBirth,
          isSeventhDayAdventist: profile.isSeventhDayAdventist === true,
          churchName: profile.churchName,
          termsAccepted: profile.termsAccepted === true,
          termsVersion: TERMS_VERSION,
          privacyVersion: PRIVACY_VERSION,
        });
      } finally {
        setRegistering(false);
      }
    },
    async signOut() {
      clearCachedProfile();
      if (mockMode) {
        setUser(null);
        return undefined;
      }
      return firebaseSignOut(auth);
    },
    async resetPassword(email) {
      if (mockMode) return undefined;
      try {
        return await sendPasswordResetEmail(auth, email);
      } catch (error) {
        throw toUserFacingError(error, 'Could not send a reset email. Please try again.');
      }
    },
    async changePassword(currentPassword, newPassword) {
      if (mockMode) return undefined;
      const currentUser = auth.currentUser;
      if (!currentUser?.email) throw new Error('No email is linked to this account.');
      if (!currentPassword || !newPassword) throw new Error('Enter your current and new password.');
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      }
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      try {
        await reauthenticateWithCredential(currentUser, credential);
        return await updatePassword(currentUser, newPassword);
      } catch (error) {
        throw toUserFacingError(error, 'Could not change your password. Please try again.');
      }
    },
    async deleteAccount(password) {
      if (mockMode) {
        resetMockDataForTests();
        clearCachedProfile();
        setUser(null);
        return undefined;
      }
      const currentUser = auth.currentUser;
      if (!currentUser?.email) throw new Error('No email is linked to this account.');
      if (!password) throw new Error('Enter your password to confirm deletion.');
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      try {
        await reauthenticateWithCredential(currentUser, credential);
        await currentUser.getIdToken(true);
        await deleteOwnAccount();
        await firebaseSignOut(auth);
      } catch (error) {
        throw toUserFacingError(error, 'Could not delete your account. Please try again.');
      }
    },
  }), [user, loading, registering, mockMode]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
