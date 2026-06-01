import { useCallback, useEffect, useState } from 'react';
import { blockUser, listBlocks, unblockUser } from './api';

export function useBlocks(enabled = true) {
  const [blockedUids, setBlockedUids] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setBlockedUids([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await listBlocks();
      setBlockedUids(result.blockedUids || []);
    } catch (err) {
      setBlockedUids([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isBlocked = useCallback((uid) => blockedUids.includes(uid), [blockedUids]);
  const block = useCallback(async (uid) => {
    await blockUser(uid);
    await refresh();
  }, [refresh]);
  const unblock = useCallback(async (uid) => {
    await unblockUser(uid);
    await refresh();
  }, [refresh]);

  return {
    blockedUids,
    loading,
    error,
    refresh,
    isBlocked,
    blockUser: block,
    unblockUser: unblock,
  };
}

export function filterBlockedItems(items, blockedUids, getAuthorUid = (item) => item.authorUid) {
  if (!blockedUids?.length) return items;
  const blocked = new Set(blockedUids);
  return items.filter((item) => !blocked.has(getAuthorUid(item)));
}
