import { useEffect, useState } from 'react';
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
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export function useEncouragements(threadId, enabled = true) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(Boolean(threadId && enabled));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!threadId || !enabled) {
      setComments([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    return onSnapshot(
      query(
        collection(db, 'encouragements'),
        where('threadId', '==', threadId),
        orderBy('createdAt', 'desc'),
      ),
      (snapshot) => {
        setComments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [threadId, enabled]);

  return { comments, loading, error };
}

export async function addEncouragement(threadId, text, user) {
  if (!user) throw new Error('Please sign in to encourage someone.');
  if (!threadId) throw new Error('This prayer is still loading.');
  if (!text.trim()) throw new Error('Write a short encouragement first.');

  return addDoc(collection(db, 'encouragements'), {
    threadId,
    authorUid: user.uid,
    authorName: user.displayName || user.email || 'PrayerStride member',
    text: text.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateEncouragement(commentId, text) {
  return updateDoc(doc(db, 'encouragements', commentId), {
    text: text.trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEncouragement(commentId) {
  return deleteDoc(doc(db, 'encouragements', commentId));
}
