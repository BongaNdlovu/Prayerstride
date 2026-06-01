import { useCallback, useEffect, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import { useIsAdmin } from './useIsAdmin';

export function useUsers(user, enabled = true) {
  const { isAdmin, loading: adminLoading } = useIsAdmin(user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(Boolean(user && enabled));
  const [error, setError] = useState(null);

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

    setLoading(true);
    setError(null);

    return onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setUsers(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [user, isAdmin, adminLoading, enabled]);

  return { users, loading, error };
}

export function useUserProfile(uid, enabled = true) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(uid && enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!uid || !enabled) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    return onSnapshot(doc(db, 'users', uid),
      (snapshot) => {
        setProfile(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [uid, enabled, retryVersion]);

  return { profile, loading, error, retry };
}
