import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
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
    authorName: data.authorName,
    amen: data.amen || 0,
    praiseGod: data.praiseGod || 0,
    prayerId: data.prayerId ?? null,
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
    authorName: data.isAnonymous ? 'Anonymous' : (user.displayName || user.email || 'You'),
    isAnonymous: Boolean(data.isAnonymous ?? data.anonymous),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    prayedCount: 0,
    status: 'active',
    privacy: data.privacy || 'community',
    urgent: Boolean(data.urgent ?? data.urgency),
    allowShare: data.allowShare !== false,
  });
}

export async function updatePrayer(prayerId, data) {
  if (!prayerId) throw new Error('Missing prayer request.');
  return updateDoc(doc(db, 'prayers', prayerId), {
    title: data.title,
    body: data.body || data.text,
    isAnonymous: Boolean(data.isAnonymous ?? data.anonymous),
    privacy: data.privacy || 'community',
    urgent: Boolean(data.urgent ?? data.urgency),
    allowShare: data.allowShare !== false,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePrayer(prayerId) {
  if (!prayerId) throw new Error('Missing prayer request.');
  return deleteDoc(doc(db, 'prayers', prayerId));
}

export async function markAnswered(prayerId) {
  return updateDoc(doc(db, 'prayers', prayerId), {
    status: 'answered',
    updatedAt: serverTimestamp(),
  });
}

export async function addTestimony(data, user) {
  if (!user) throw new Error('You must be signed in to create a testimony.');

  const testimony = {
    title: data.title,
    body: data.body || data.text,
    prayerId: data.prayerId ?? null,
    shared: Boolean(data.shared),
    authorUid: user.uid,
    authorName: data.isAnonymous ? 'Anonymous' : (user.displayName || user.email || 'You'),
    isAnonymous: Boolean(data.isAnonymous),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    amen: 0,
    praiseGod: 0,
    tags: data.tags || [],
  };

  if (!data.prayerId) return addDoc(collection(db, 'testimonies'), testimony);

  const testimonyRef = doc(collection(db, 'testimonies'));
  const batch = writeBatch(db);
  batch.set(testimonyRef, testimony);
  batch.update(doc(db, 'prayers', data.prayerId), {
    status: 'answered',
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return testimonyRef;
}
