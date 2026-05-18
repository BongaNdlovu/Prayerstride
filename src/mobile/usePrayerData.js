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
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase';

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
    privacy: data.privacy || 'community',
    prayerLimit: data.prayerLimit || 'daily',
    urgent: Boolean(data.urgent),
    allowShare: data.allowShare !== false,
    createdAt: data.createdAt,
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

export function usePrayers(enabled, options = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      return undefined;
    }

    const currentUid = options.userId || auth.currentUser?.uid;
    const includeAll = Boolean(options.includeAll);
    const prayerRef = collection(db, 'prayers');
    const queries = includeAll
      ? [query(prayerRef, orderBy('createdAt', 'desc'))]
      : [
          query(prayerRef, where('privacy', '==', 'community'), orderBy('createdAt', 'desc')),
          ...(currentUid ? [query(prayerRef, where('authorUid', '==', currentUid), orderBy('createdAt', 'desc'))] : []),
        ];

    const sourceMaps = queries.map(() => new Map());
    const publish = () => {
      const docsById = new Map();
      sourceMaps.forEach((sourceMap) => {
        sourceMap.forEach((item, id) => docsById.set(id, item));
      });
      setItems(Array.from(docsById.values()).sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? b.createdAt?.seconds ?? 0;
        return bTime - aTime;
      }));
      setLoading(false);
    };

    const unsubscribers = queries.map((prayerQuery, index) => onSnapshot(
      prayerQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            sourceMaps[index].delete(change.doc.id);
            return;
          }
          sourceMaps[index].set(change.doc.id, mapPrayer(change.doc));
        });
        publish();
      },
      () => setLoading(false),
    ));

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [enabled, options.includeAll, options.userId]);

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
    prayerLimit: data.prayerLimit || 'daily',
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
    prayerLimit: data.prayerLimit || 'daily',
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
