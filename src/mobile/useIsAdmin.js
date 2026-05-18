import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export function useIsAdmin(user) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(Boolean(user));

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return undefined;
    }

    return onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      const data = snapshot.data();
      setIsAdmin(data?.role === 'admin');
      setLoading(false);
    });
  }, [user]);

  return { isAdmin, loading };
}

export function useSuspendedStatus(user) {
  const [suspended, setSuspended] = useState(false);
  const [suspendedReason, setSuspendedReason] = useState('');
  const [loading, setLoading] = useState(Boolean(user));

  useEffect(() => {
    if (!user) {
      setSuspended(false);
      setSuspendedReason('');
      setLoading(false);
      return undefined;
    }

    return onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      const data = snapshot.data();
      setSuspended(Boolean(data?.suspended));
      setSuspendedReason(data?.suspendedReason || '');
      setLoading(false);
    });
  }, [user]);

  return { suspended, suspendedReason, loading };
}
