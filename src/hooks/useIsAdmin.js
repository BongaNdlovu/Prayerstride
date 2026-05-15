import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext.jsx';

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(Boolean(user));

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return undefined;
    }

    return onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      setIsAdmin(snapshot.data()?.role === 'admin');
      setLoading(false);
    });
  }, [user]);

  return { isAdmin, loading };
}
