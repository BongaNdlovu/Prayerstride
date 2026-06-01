import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  createPrayer as apiCreatePrayer,
  createTestimony as apiCreateTestimony,
  deletePrayer as apiDeletePrayer,
  markPrayerAnswered as apiMarkPrayerAnswered,
  updatePrayer as apiUpdatePrayer,
} from './api';

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
    category: data.category || '',
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
    authorName: data.isAnonymous ? 'Anonymous' : data.authorName,
    isAnonymous: Boolean(data.isAnonymous),
    amen: data.amen || 0,
    praiseGod: data.praiseGod || 0,
    prayerId: data.prayerId ?? null,
    createdAt: data.createdAt,
  };
}

export function usePrayers(enabled, options = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      setError(null);
      return undefined;
    }
    setLoading(true);
    setError(null);

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
      setError(null);
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
      (err) => {
        setError(err);
        setLoading(false);
      },
    ));

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [enabled, options.includeAll, options.userId, retryVersion]);

  return { prayers: items, loading, error, retry };
}

export function useTestimonies(enabled) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      setError(null);
      return undefined;
    }
    setLoading(true);
    setError(null);

    return onSnapshot(
      query(collection(db, 'testimonies'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setItems(snapshot.docs.map(mapTestimony));
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [enabled, retryVersion]);

  return { testimonies: items, loading, error, retry };
}

export async function addPrayer(data, user) {
  if (!user) throw new Error('You must be signed in to create a prayer.');
  const result = await apiCreatePrayer({
    title: data.title,
    body: data.body,
    isAnonymous: Boolean(data.isAnonymous ?? data.anonymous),
    privacy: data.privacy || 'community',
    prayerLimit: data.prayerLimit || 'daily',
    urgent: Boolean(data.urgent ?? data.urgency),
    allowShare: data.allowShare !== false,
  });
  return { id: result.prayerId };
}

export async function updatePrayer(prayerId, data) {
  if (!prayerId) throw new Error('Missing prayer request.');
  await apiUpdatePrayer(prayerId, {
    title: data.title,
    body: data.body || data.text,
    isAnonymous: Boolean(data.isAnonymous ?? data.anonymous),
    privacy: data.privacy || 'community',
    prayerLimit: data.prayerLimit || 'daily',
    urgent: Boolean(data.urgent ?? data.urgency),
    allowShare: data.allowShare !== false,
  });
}

export async function deletePrayer(prayerId) {
  if (!prayerId) throw new Error('Missing prayer request.');
  await apiDeletePrayer(prayerId);
}

export async function markAnswered(prayerId) {
  await apiMarkPrayerAnswered(prayerId);
}

export async function addTestimony(data, user) {
  if (!user) throw new Error('You must be signed in to create a testimony.');

  const result = await apiCreateTestimony({
    title: data.title,
    body: data.body || data.text,
    prayerId: data.prayerId ?? null,
    shared: Boolean(data.shared),
    isAnonymous: Boolean(data.isAnonymous),
    tags: data.tags || [],
  });

  return { id: result.testimonyId };
}
