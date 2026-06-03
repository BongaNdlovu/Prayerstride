import { useCallback, useEffect, useState } from 'react';
import { useIsAdmin } from './useIsAdmin';
import { adminUpdateReport, getAdminReports, submitContentReport } from './api';

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
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

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

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getAdminReports();
        if (cancelled) return;
        setReports(result.reports || []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setReports([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, adminLoading, enabled, retryVersion]);

  return { reports, loading, error, retry };
}

export async function resolveReport(reportId) {
  return adminUpdateReport(reportId, 'resolved');
}

export async function dismissReport(reportId) {
  return adminUpdateReport(reportId, 'dismissed');
}
