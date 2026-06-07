import { useCallback, useEffect, useState } from 'react';
import { getMyProfile } from './api';

const SUSPENSION_STATUS_REFRESH_MS = 15000;

function useMyProfile(user, { pollMs = 0 } = {}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    let intervalId;

    const loadProfile = async (quiet = false) => {
      if (!quiet) {
        setLoading(true);
        setError(null);
      }
      try {
        const result = await getMyProfile();
        if (cancelled) return;
        const nextProfile = result.profile;
        if (!nextProfile) {
          if (!quiet) {
            setProfile(null);
            setError(new Error('Your account profile could not be found. Please try again or sign out.'));
          }
        } else {
          setProfile(nextProfile);
          setError(null);
        }
      } catch (err) {
        if (cancelled) return;
        if (!quiet) {
          setProfile(null);
          setError(err);
        }
      } finally {
        if (!cancelled && !quiet) setLoading(false);
      }
    };

    loadProfile();
    if (pollMs > 0) {
      intervalId = setInterval(() => loadProfile(true), pollMs);
    }

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [pollMs, user?.uid, retryVersion]);

  return { profile, loading, error, retry };
}

export function useIsAdmin(user) {
  const { profile, loading, error } = useMyProfile(user);
  const isAdmin = profile?.role === 'admin' && profile?.suspended !== true;
  return { isAdmin, loading, error };
}

export function useSuspendedStatus(user) {
  const { profile, loading, error, retry } = useMyProfile(user, { pollMs: SUSPENSION_STATUS_REFRESH_MS });
  return {
    suspended: Boolean(profile?.suspended),
    suspendedReason: profile?.suspendedReason || '',
    registrationState: profile?.registrationState || '',
    profileUid: profile?.uid || '',
    loading,
    error,
    retry,
  };
}
