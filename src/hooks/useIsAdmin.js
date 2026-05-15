import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext.jsx';

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [suspendedReason, setSuspendedReason] = useState('');
  const [loading, setLoading] = useState(Boolean(user));

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setSuspended(false);
      setSuspendedReason('');
      setLoading(false);
      return undefined;
    }

    return onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      const data = snapshot.data();
      setIsAdmin(data?.role === 'admin');
      setSuspended(Boolean(data?.suspended));
      setSuspendedReason(data?.suspendedReason || '');
      setLoading(false);
    });
  }, [user]);

  return { isAdmin, suspended, suspendedReason, loading };
}
