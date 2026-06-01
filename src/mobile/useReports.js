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
  const { isAdmin, loading: adminLoading } = useIsAdmin(user);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(Boolean(user && enabled));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !user) {
      setReports([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    if (adminLoading) {
      setLoading(true);
      return undefined;
    }

    if (!isAdmin) {
      setReports([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);

    return onSnapshot(
      query(collection(db, 'reports'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setReports(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [user, isAdmin, adminLoading, enabled]);

  return { reports, loading, error };
}

export async function resolveReport(reportId) {
  return updateDoc(doc(db, 'reports', reportId), { status: 'resolved' });
}

export async function dismissReport(reportId) {
  return updateDoc(doc(db, 'reports', reportId), { status: 'dismissed' });
}
