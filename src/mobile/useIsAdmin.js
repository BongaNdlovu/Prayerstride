import { useCallback, useEffect, useState } from 'react';
import { getMyProfile } from './api';

function useMyProfile(user) {
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
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getMyProfile();
        if (cancelled) return;
        const nextProfile = result.profile;
        if (!nextProfile) {
          setProfile(null);
          setError(new Error('Your account profile could not be found. Please try again or sign out.'));
        } else {
          setProfile(nextProfile);
          setError(null);
        }
      } catch (err) {
        if (cancelled) return;
        setProfile(null);
        setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, retryVersion]);

  return { profile, loading, error, retry };
}

export function useIsAdmin(user) {
  const { profile, loading, error } = useMyProfile(user);
  const isAdmin = profile?.role === 'admin' && profile?.suspended !== true;
  return { isAdmin, loading, error };
}

export function useSuspendedStatus(user) {
  const { profile, loading, error, retry } = useMyProfile(user);
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
