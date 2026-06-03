import { useCallback, useEffect, useState } from 'react';
import { getAdminUsers, getMyProfile } from './api';
import { useIsAdmin } from './useIsAdmin';
import { clearCachedProfile, getCachedProfile, setCachedProfile } from './profileCache';

export function useUsers(user, enabled = true) {
  const { isAdmin, loading: adminLoading } = useIsAdmin(user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(Boolean(user && enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!enabled || !user) {
      setUsers([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    if (adminLoading) {
      setLoading(true);
      return undefined;
    }

    if (!isAdmin) {
      setUsers([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getAdminUsers();
        if (cancelled) return;
        setUsers(result.users || []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setUsers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, adminLoading, enabled, retryVersion]);

  return { users, loading, error, retry };
}

export function useUserProfile(uid, enabled = true) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(uid && enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => {
    if (uid) clearCachedProfile(uid);
    setRetryVersion((version) => version + 1);
  }, [uid]);

  useEffect(() => {
    if (!uid || !enabled) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const cached = getCachedProfile(uid);
    if (cached) {
      setProfile(cached);
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
      setError(null);
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await getMyProfile();
        if (cancelled) return;
        const nextProfile = result.profile || null;
        setProfile(nextProfile);
        if (nextProfile) setCachedProfile(uid, nextProfile);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        if (!cached) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid, enabled, retryVersion]);

  return { profile, loading, error, retry };
}
