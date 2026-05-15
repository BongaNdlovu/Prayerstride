import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { isOwnerEmail, OWNER_DISPLAY_NAME } from '../data/owner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async signIn(email, password) {
      await signInWithEmailAndPassword(auth, email, password);
    },
    async register(email, password, displayName) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const isOwner = isOwnerEmail(email);
      const nextDisplayName = isOwner ? OWNER_DISPLAY_NAME : displayName;

      if (nextDisplayName) {
        await updateProfile(credential.user, { displayName: nextDisplayName });
      }

      await setDoc(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: nextDisplayName || credential.user.displayName || '',
        role: isOwner ? 'admin' : 'user',
        owner: isOwner,
        createdAt: serverTimestamp(),
        photoURL: null,
      }, { merge: true });

      await sendEmailVerification(credential.user);

      return credential.user;
    },
    async signOut() {
      await firebaseSignOut(auth);
    },
    async resetPassword(email) {
      await sendPasswordResetEmail(auth, email);
    },
    async updateUserProfile(profile) {
      if (!auth.currentUser) throw new Error('No signed-in user.');

      await updateProfile(auth.currentUser, {
        displayName: profile.name,
        photoURL: profile.photoURL ?? auth.currentUser.photoURL,
      });

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName: profile.name,
        handle: profile.handle || '',
        bio: profile.bio || '',
        photoURL: profile.photoURL ?? auth.currentUser.photoURL ?? null,
        updatedAt: serverTimestamp(),
      });
    },
    async deleteAccount() {
      if (!auth.currentUser) throw new Error('No signed-in user.');
      await deleteUser(auth.currentUser);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
