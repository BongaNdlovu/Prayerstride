import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext.jsx';

function mapPrayer(docSnap) {
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
    anonymous: data.isAnonymous,
    isAnonymous: data.isAnonymous,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    count: data.prayedCount || 0,
    prayedCount: data.prayedCount || 0,
    status: data.status,
    privacy: data.privacy || 'community',
    urgent: Boolean(data.urgent),
    urgency: Boolean(data.urgent),
    allowShare: data.allowShare !== false,
    answered: data.status === 'answered',
  };
}

export function usePrayers() {
  const { user } = useAuth();
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user) {
      setPrayers([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const constraints = [orderBy('createdAt', 'desc')];

    const unsubscribe = onSnapshot(
      query(collection(db, 'prayers'), ...constraints),
      (snapshot) => {
        setPrayers(snapshot.docs.map(mapPrayer));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user, reloadKey]);

  const retry = useCallback(() => setReloadKey((value) => value + 1), []);

  return { prayers, loading, error, retry };
}

export async function addPrayer(data, user) {
  if (!user) throw new Error('You must be signed in to create a prayer.');

  return addDoc(collection(db, 'prayers'), {
    title: data.title,
    body: data.body || data.text,
    authorUid: user.uid,
    authorName: data.isAnonymous ? 'Anonymous' : (user.displayName || user.email || 'You'),
    isAnonymous: Boolean(data.isAnonymous ?? data.anonymous),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    prayedCount: 0,
    status: 'active',
    privacy: data.privacy || 'community',
    urgent: Boolean(data.urgent ?? data.urgency),
    allowShare: data.allowShare !== false,
  });
}

export async function updatePrayer(prayerId, data) {
  if (!prayerId) throw new Error('Missing prayer request.');
  return updateDoc(doc(db, 'prayers', prayerId), {
    title: data.title,
    body: data.body || data.text,
    isAnonymous: Boolean(data.isAnonymous ?? data.anonymous),
    privacy: data.privacy || 'community',
    urgent: Boolean(data.urgent ?? data.urgency),
    allowShare: data.allowShare !== false,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePrayer(prayerId) {
  if (!prayerId) throw new Error('Missing prayer request.');
  return deleteDoc(doc(db, 'prayers', prayerId));
}

export async function markAnswered(prayerId) {
  return updateDoc(doc(db, 'prayers', prayerId), {
    status: 'answered',
    updatedAt: serverTimestamp(),
  });
}
