import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

function useCollection(collectionName, enabled = true, mapper) {
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
      query(
        collection(db, collectionName),
        where('status', '==', 'active'),
        orderBy('order', 'asc'),
      ),
      (snapshot) => {
        setItems(snapshot.docs.map(mapper || defaultMapper));
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [collectionName, enabled, mapper, retryVersion]);

  return { items, loading, error, retry };
}

function defaultMapper(item) {
  return { id: item.id, ...item.data() };
}

export function useDevotions(enabled = true) {
  const result = useCollection('devotions', enabled);
  return { devotions: result.items, loading: result.loading, error: result.error, retry: result.retry };
}

export function useStudyGuide(guideId, enabled = true) {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(Boolean(guideId && enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!guideId || !enabled) {
      setGuide(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);

    return onSnapshot(
      doc(db, 'studyGuides', guideId),
      (snapshot) => {
        const data = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
        setGuide(data?.status === 'active' ? data : null);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [guideId, enabled, retryVersion]);

  return { guide, loading, error, retry };
}

export function useGuideLesson(guideId, lessonId, enabled = true) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(Boolean(guideId && enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);

  useEffect(() => {
    if (!guideId || !enabled) {
      setLesson(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const lessonRef = lessonId
      ? doc(db, 'studyGuides', guideId, 'lessons', lessonId)
      : null;

    if (lessonRef) {
      return onSnapshot(
        lessonRef,
        (snapshot) => {
          const data = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
          setLesson(data?.status === 'active' ? data : null);
          setError(null);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        },
      );
    }

    return onSnapshot(
      query(
        collection(db, 'studyGuides', guideId, 'lessons'),
        where('status', '==', 'active'),
        orderBy('day', 'asc'),
      ),
      (snapshot) => {
        const firstLesson = snapshot.docs[0];
        setLesson(firstLesson ? { id: firstLesson.id, ...firstLesson.data() } : null);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [guideId, lessonId, enabled, retryVersion]);

  return { lesson, loading, error, retry };
}
