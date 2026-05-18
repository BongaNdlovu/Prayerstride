import { useEffect, useState } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export function useNotificationSettings(userId, enabled = true) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(Boolean(userId && enabled));

  useEffect(() => {
    if (!userId || !enabled) {
      setSettings({});
      setLoading(false);
      return undefined;
    }

    return onSnapshot(doc(db, 'notificationSettings', userId),
      (snapshot) => {
        setSettings(snapshot.exists() ? snapshot.data() : {});
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [userId, enabled]);

  return { settings, loading };
}

export async function updateNotificationSettings(userId, settings) {
  return setDoc(doc(db, 'notificationSettings', userId), {
    prayerActivity: settings.prayerActivity,
    testimonyReactions: settings.testimonyReactions,
    pushEnabled: settings.pushEnabled,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
