import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext.jsx';

function mapTestimony(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title,
    text: data.body,
    body: data.body,
    userId: data.authorUid,
    authorUid: data.authorUid,
    name: data.isAnonymous ? 'Anonymous' : data.authorName,
    authorName: data.authorName,
    isAnonymous: data.isAnonymous,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    prayerId: data.prayerId ?? null,
    shared: Boolean(data.shared),
    tags: data.tags || [],
  };
}

export function useTestimonies() {
  const { user } = useAuth();
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user) {
      setTestimonies([]);
      setLoading(false);
      return undefined;
    }

    return onSnapshot(
      query(collection(db, 'testimonies'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setTestimonies(snapshot.docs.map(mapTestimony));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [user, reloadKey]);

  const retry = useCallback(() => setReloadKey((value) => value + 1), []);

  return { testimonies, loading, error, retry };
}

export async function addTestimony(data, user) {
  if (!user) throw new Error('You must be signed in to create a testimony.');

  return addDoc(collection(db, 'testimonies'), {
    title: data.title,
    body: data.body || data.text,
    prayerId: data.prayerId ?? null,
    shared: Boolean(data.shared),
    authorUid: user.uid,
    authorName: data.isAnonymous ? 'Anonymous' : (user.displayName || user.email || 'You'),
    isAnonymous: Boolean(data.isAnonymous),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    tags: data.tags || [],
  });
}
