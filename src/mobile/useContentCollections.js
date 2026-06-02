import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
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
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [collectionName, enabled, mapper]);

  return { items, loading, error };
}

function defaultMapper(item) {
  return { id: item.id, ...item.data() };
}

export function useFollowing(userId, enabled = true) {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId && enabled));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !enabled) {
      setFollowing([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    return onSnapshot(
      query(collection(db, 'users', userId, 'following'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setFollowing(snapshot.docs.map(defaultMapper));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [userId, enabled]);

  return { following, loading, error };
}

export function useDevotions(enabled = true) {
  const result = useCollection('devotions', enabled);
  return { devotions: result.items, loading: result.loading, error: result.error };
}

export function useStudyGuide(guideId, enabled = true) {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(Boolean(guideId && enabled));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!guideId || !enabled) {
      setGuide(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    return onSnapshot(
      doc(db, 'studyGuides', guideId),
      (snapshot) => {
        const data = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
        setGuide(data?.status === 'active' ? data : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [guideId, enabled]);

  return { guide, loading, error };
}

export function useGuideLesson(guideId, lessonId, enabled = true) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(Boolean(guideId && enabled));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!guideId || !enabled) {
      setLesson(null);
      setLoading(false);
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
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [guideId, lessonId, enabled]);

  return { lesson, loading, error };
}
