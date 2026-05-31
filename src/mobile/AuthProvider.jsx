import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
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

const AuthContext = createContext(null);
const MIN_PASSWORD_LENGTH = 12;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth,
    (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      if (nextUser) {
        bootstrapOwner().catch(() => {});
      }
    },
    (error) => {
      console.error('Auth state change error', error);
      setLoading(false);
    },
  ), []);

  const value = useMemo(() => ({
    user,
    loading,
    async signIn(email, password) {
      return signInWithEmailAndPassword(auth, email, password);
    },
    async register(email, password, name, profile = {}) {
      if (!password || password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      }
      const credential = await createUserWithEmailAndPassword(auth, email, password);
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
        guardianEmail: profile.guardianEmail,
        isSeventhDayAdventist: profile.isSeventhDayAdventist === true,
        churchName: profile.churchName,
        termsAccepted: profile.termsAccepted === true,
        termsVersion: TERMS_VERSION,
        privacyVersion: PRIVACY_VERSION,
      });
      await sendEmailVerification(credential.user);
      return { credential, registration };
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
