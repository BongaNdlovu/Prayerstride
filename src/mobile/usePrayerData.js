import { useCallback, useEffect, useState } from 'react';
import {
  createPrayer as apiCreatePrayer,
  createTestimony as apiCreateTestimony,
  deletePrayer as apiDeletePrayer,
  getPrayers,
  getTestimonies,
  markPrayerAnswered as apiMarkPrayerAnswered,
  updatePrayer as apiUpdatePrayer,
} from './api';

function resolveScope(options = {}) {
  if (options.includeAll) return 'all';
  if (options.scope) return options.scope;
  if (options.userId) return 'mine';
  return 'feed';
}

export function usePrayers(enabled, options = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const retry = useCallback(() => setRetryVersion((version) => version + 1), []);
  const scope = resolveScope(options);
  const pageSize = Number(options.pageSize || 100);
  const status = options.status || null;

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
        const result = await getPrayers({
          scope,
          status,
          category: options.category,
          urgent: options.urgent,
          limit: pageSize,
        });
        if (cancelled) return;
        setItems(result.items || []);
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
  }, [enabled, scope, pageSize, status, options.category, options.urgent, retryVersion]);

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

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getTestimonies({ limit: 100 });
        if (cancelled) return;
        setItems(result.items || []);
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

  return { testimonies: items, loading, error, retry };
}

export async function addPrayer(data, user) {
  if (!user) throw new Error('You must be signed in to create a prayer.');
  const result = await apiCreatePrayer({
    title: data.title,
    body: data.body,
    category: data.category || null,
    scriptureRef: data.scriptureRef?.trim() || null,
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
  const payload = {};
  if ('title' in data) payload.title = data.title;
  if ('body' in data || 'text' in data) payload.body = data.body || data.text;
  if ('category' in data) payload.category = data.category || null;
  if ('scriptureRef' in data) payload.scriptureRef = data.scriptureRef?.trim() || null;
  if ('isAnonymous' in data || 'anonymous' in data) payload.isAnonymous = Boolean(data.isAnonymous ?? data.anonymous);
  if ('privacy' in data) payload.privacy = data.privacy || 'community';
  if ('prayerLimit' in data) payload.prayerLimit = data.prayerLimit || 'daily';
  if ('urgent' in data || 'urgency' in data) payload.urgent = Boolean(data.urgent ?? data.urgency);
  if ('allowShare' in data) payload.allowShare = data.allowShare !== false;
  await apiUpdatePrayer(prayerId, payload);
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
