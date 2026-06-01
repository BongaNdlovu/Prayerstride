import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { useIsAdmin } from './useIsAdmin';

export async function submitReport(targetId, targetType, reason, user) {
  if (!user) throw new Error('You must be signed in to report content.');

  return addDoc(collection(db, 'reports'), {
    targetId,
    targetType,
    reason,
    reportedByUid: user.uid,
    createdAt: serverTimestamp(),
    status: 'pending',
  });
}

export function useReports(user, enabled = true) {
  const { isAdmin } = useIsAdmin(user);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(isAdmin && enabled);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin || !enabled) {
      setReports([]);
      setLoading(false);
      return undefined;
    }

    return onSnapshot(
      query(collection(db, 'reports'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setReports(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [isAdmin, enabled]);

  return { reports, loading, error };
}

export async function resolveReport(reportId) {
  return updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
}

export async function dismissReport(reportId) {
  return updateDoc(doc(db, 'reports', reportId), { status: 'dismissed' });
}
