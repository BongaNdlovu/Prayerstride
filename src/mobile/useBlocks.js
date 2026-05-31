import { useCallback, useEffect, useState } from 'react';
import { blockUser, listBlocks, unblockUser } from './api';

export function useBlocks(enabled = true) {
  const [blockedUids, setBlockedUids] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));

  const refresh = useCallback(async () => {
    if (!enabled) {
      setBlockedUids([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await listBlocks();
      setBlockedUids(result.blockedUids || []);
    } catch {
      setBlockedUids([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    blockedUids,
    loading,
    refresh,
    isBlocked: (uid) => blockedUids.includes(uid),
    blockUser: async (uid) => {
      await blockUser(uid);
      await refresh();
    },
    unblockUser: async (uid) => {
      await unblockUser(uid);
      await refresh();
    },
  };
}

export function filterBlockedItems(items, blockedUids, getAuthorUid = (item) => item.authorUid) {
  if (!blockedUids?.length) return items;
  const blocked = new Set(blockedUids);
  return items.filter((item) => !blocked.has(getAuthorUid(item)));
}
