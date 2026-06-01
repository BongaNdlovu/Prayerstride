import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { alpha, spacing } from '../theme';
import { useTestimonies } from '../usePrayerData';
import { filterBlockedItems, useBlocks } from '../useBlocks';
import { useFollowing } from '../useContentCollections';
import { reactToTestimony } from '../api';
import { auth } from '../firebase';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import PillTabs from '../components/PillTabs';
import TestimonyCard from '../components/TestimonyCard';
import AsyncState from '../components/AsyncState';

const TABS = ['All', 'Following', 'Recent'];

export default function PraiseScreen({ onOpenTestimony }) {
  const { testimonies, loading, error, retry } = useTestimonies(true);
  const { blockedUids, loading: blocksLoading, refresh: retryBlocks } = useBlocks(true);
  const uid = auth.currentUser?.uid;
  const { following } = useFollowing(uid, Boolean(uid));
  const [tab, setTab] = useState('All');
  const [pendingReactions, setPendingReactions] = useState({});
  const reactingRef = useRef(new Set());
  const listError = error;
  const retryAll = () => {
    retry();
    retryBlocks();
  };

  const followingIds = useMemo(
    () => new Set(following.map((item) => item.followedUid || item.uid || item.targetUid || item.id)),
    [following],
  );

  const visible = useMemo(() => {
    const unblocked = blocksLoading ? [] : filterBlockedItems(testimonies, blockedUids);
    if (tab === 'Following') {
      return unblocked.filter((item) => followingIds.has(item.authorUid));
    }
    if (tab === 'Recent') {
      return [...unblocked].sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? b.createdAt?.seconds ?? 0;
        return bTime - aTime;
      });
    }
    return unblocked;
  }, [testimonies, blockedUids, blocksLoading, tab, followingIds]);

  useEffect(() => {
    setPendingReactions((current) => {
      let changed = false;
      const next = { ...current };

      Object.entries(current).forEach(([reactionKey, baseline]) => {
        const [id, key] = reactionKey.split(':');
        const testimony = testimonies.find((item) => item.id === id);
        if (!testimony) return;

        const serverCount = Number(testimony[key] || 0);
        if (serverCount >= baseline + 1) {
          delete next[reactionKey];
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [testimonies]);

  const react = async (id, key) => {
    const reactionKey = `${id}:${key}`;
    if (reactingRef.current.has(reactionKey) || pendingReactions[reactionKey] !== undefined) return;

    const testimony = testimonies.find((item) => item.id === id);
    const baseline = Number(testimony?.[key] || 0);

    reactingRef.current.add(reactionKey);
    setPendingReactions((current) => ({ ...current, [reactionKey]: baseline }));
    try {
      const result = await reactToTestimony(id, key);
      if (result.duplicate) {
        setPendingReactions((current) => {
          const next = { ...current };
          delete next[reactionKey];
          return next;
        });
      }
    } catch (error) {
      setPendingReactions((current) => {
        const next = { ...current };
        delete next[reactionKey];
        return next;
      });
      Alert.alert('Reaction not saved', error.message);
    } finally {
      reactingRef.current.delete(reactionKey);
    }
  };

  return (
    <ScreenScaffold pageContent>
      <AppHeader title="Praise & Testimonies" subtitle="Celebrate answered prayers together" />
      <PillTabs tabs={TABS} active={tab} onChange={setTab} style={styles.tabs} />

      <AsyncState
        loading={loading}
        error={listError}
        onRetry={retryAll}
        empty={!loading && !listError && visible.length === 0}
        emptyLabel={tab === 'Following' ? 'No testimonies from people you follow yet.' : 'No testimonies yet.'}
      >
        <View style={styles.list}>
          {visible.map((testimony) => (
            <TestimonyCard
              key={testimony.id}
              testimony={{
                ...testimony,
                praiseGod: Number(testimony.praiseGod || 0) + (pendingReactions[`${testimony.id}:praiseGod`] !== undefined ? 1 : 0),
                amen: Number(testimony.amen || 0) + (pendingReactions[`${testimony.id}:amen`] !== undefined ? 1 : 0),
              }}
              onPress={() => onOpenTestimony?.(testimony)}
              onReact={react}
            />
          ))}
        </View>
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  tabs: { marginBottom: spacing.md },
  list: { gap: spacing.sm },
});
