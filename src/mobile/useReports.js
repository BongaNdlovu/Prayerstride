import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import { useIsAdmin } from './useIsAdmin';
import { adminUpdateReport, submitContentReport } from './api';

export async function submitReport(targetId, targetType, reason, user) {
  if (!user) throw new Error('You must be signed in to report content.');

  return submitContentReport({
    targetId,
    targetType,
    reason,
    reportedByUid: user.uid,
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
  return adminUpdateReport(reportId, 'resolved');
}

export async function dismissReport(reportId) {
  return adminUpdateReport(reportId, 'dismissed');
}
