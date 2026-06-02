import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export function useIsAdmin(user) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);
    return onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        const data = snapshot.data();
        setIsAdmin(data?.role === 'admin' && data?.suspended !== true);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setIsAdmin(false);
        setError(err);
        setLoading(false);
      },
    );
  }, [user]);

  return { isAdmin, loading, error };
}

export function useSuspendedStatus(user) {
  const [suspended, setSuspended] = useState(false);
  const [suspendedReason, setSuspendedReason] = useState('');
  const [registrationState, setRegistrationState] = useState('');
  const [profileUid, setProfileUid] = useState('');
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!user) {
      setSuspended(false);
      setSuspendedReason('');
      setRegistrationState('');
      setProfileUid('');
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);
    return onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (!snapshot.exists()) {
          setSuspended(false);
          setSuspendedReason('');
          setRegistrationState('');
          setProfileUid('');
          setError(new Error('Your account profile could not be found. Please try again or sign out.'));
          setLoading(false);
          return;
        }
        const data = snapshot.data();
        setSuspended(Boolean(data?.suspended));
        setSuspendedReason(data?.suspendedReason || '');
        setRegistrationState(data?.registrationState || '');
        setProfileUid(user.uid);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [user, retryVersion]);

  return { suspended, suspendedReason, registrationState, profileUid, loading, error, retry };
}
