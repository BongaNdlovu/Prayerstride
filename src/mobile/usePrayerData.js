import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

function mapPrayer(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title,
    body: data.body,
    authorUid: data.authorUid,
    authorName: data.isAnonymous ? 'Anonymous' : data.authorName,
    prayedCount: data.prayedCount || 0,
    status: data.status || 'active',
  };
}

function mapTestimony(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title,
    body: data.body,
    authorUid: data.authorUid,
    authorName: data.isAnonymous ? 'Anonymous' : data.authorName,
    amen: data.amen || 0,
    praiseGod: data.praiseGod || 0,
  };
}

export function usePrayers(enabled) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      return undefined;
    }

    return onSnapshot(
      query(collection(db, 'prayers'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setItems(snapshot.docs.map(mapPrayer));
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [enabled]);

  return { prayers: items, loading };
}

export function useTestimonies(enabled) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      return undefined;
    }

    return onSnapshot(
      query(collection(db, 'testimonies'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setItems(snapshot.docs.map(mapTestimony));
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [enabled]);

  return { testimonies: items, loading };
}

export async function addPrayer(data, user) {
  return addDoc(collection(db, 'prayers'), {
    title: data.title,
    body: data.body,
    authorUid: user.uid,
    authorName: user.displayName || user.email || 'You',
    isAnonymous: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    prayedCount: 0,
    status: 'active',
    privacy: 'community',
    urgent: false,
    allowShare: true,
  });
}
