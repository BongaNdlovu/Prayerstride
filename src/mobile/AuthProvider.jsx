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
import { isOwnerEmail, OWNER_DISPLAY_NAME } from '../data/owner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth,
    (nextUser) => {
      setUser(nextUser);
      setLoading(false);
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
    async register(email, password, name) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const isOwner = isOwnerEmail(email);
      const displayName = isOwner ? OWNER_DISPLAY_NAME : name;
      await updateProfile(credential.user, { displayName });
      await setDoc(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid,
        displayName,
        email,
        createdAt: serverTimestamp(),
        role: isOwner ? 'admin' : 'user',
        owner: isOwner,
        photoURL: null,
      });
      await sendEmailVerification(credential.user);
      return credential;
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
      if (newPassword.length < 6) throw new Error('New password must be at least 6 characters.');
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      return updatePassword(currentUser, newPassword);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
