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

const AuthContext = createContext(null);
const MIN_PASSWORD_LENGTH = 12;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const bootstrappedUidRef = useRef('');

  useEffect(() => onAuthStateChanged(auth,
    (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      if (!nextUser) bootstrappedUidRef.current = '';
      if (nextUser && bootstrappedUidRef.current !== nextUser.uid) {
        bootstrappedUidRef.current = nextUser.uid;
        bootstrapOwner().catch(() => {});
      }
    },
    (error) => {
      logError('Auth state change error', error);
      setLoading(false);
    },
  ), []);

  const value = useMemo(() => ({
    user,
    loading,
    registering,
    async signIn(email, password) {
      return signInWithEmailAndPassword(auth, email, password);
    },
    async register(email, password, name, profile = {}) {
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
          } catch {
            await deleteUser(credential.user).catch(() => {});
          }
        }
        throw error;
      } finally {
        setRegistering(false);
      }
    },
    async completePendingRegistration(profile = {}) {
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
      return firebaseSignOut(auth);
    },
    async resetPassword(email) {
      return sendPasswordResetEmail(auth, email);
    },
    async changePassword(currentPassword, newPassword) {
      const currentUser = auth.currentUser;
      if (!currentUser?.email) throw new Error('No email is linked to this account.');
      if (!currentPassword || !newPassword) throw new Error('Enter your current and new password.');
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      }
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      return updatePassword(currentUser, newPassword);
    },
    async deleteAccount(password) {
      const currentUser = auth.currentUser;
      if (!currentUser?.email) throw new Error('No email is linked to this account.');
      if (!password) throw new Error('Enter your password to confirm deletion.');
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      await currentUser.getIdToken(true);
      await deleteOwnAccount();
      await firebaseSignOut(auth);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
