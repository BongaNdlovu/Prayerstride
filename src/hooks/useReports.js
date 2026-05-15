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
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext.jsx';
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

export function useReports() {
  const { isAdmin } = useIsAdmin();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(isAdmin);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
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
  }, [isAdmin]);

  return { reports, loading, error };
}

export async function updateReportStatus(reportId, status) {
  return updateDoc(doc(db, 'reports', reportId), { status });
}

export async function resolveReport(reportId) {
  return updateReportStatus(reportId, 'resolved');
}

export async function dismissReport(reportId) {
  return updateReportStatus(reportId, 'dismissed');
}
