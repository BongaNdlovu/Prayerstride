import { useCallback, useEffect, useState } from 'react';
import { getDevotions, getStudyGuide, getStudyGuideLesson } from './api';

export function useDevotions(enabled = true) {
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

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getDevotions();
        if (cancelled) return;
        setItems(result.devotions || []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, retryVersion]);

  return { devotions: items, loading, error, retry };
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

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getStudyGuide(guideId);
        if (cancelled) return;
        setGuide(result.guide || null);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setGuide(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getStudyGuideLesson(guideId, lessonId || null);
        if (cancelled) return;
        setLesson(result.lesson || null);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setLesson(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [guideId, lessonId, enabled, retryVersion]);

  return { lesson, loading, error, retry };
}
