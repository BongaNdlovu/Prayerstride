import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
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
  const { blockedUids, error: blocksError, refresh: retryBlocks } = useBlocks(true);
  const uid = auth.currentUser?.uid;
  const { following } = useFollowing(uid, Boolean(uid));
  const [tab, setTab] = useState('All');
  const [reacted, setReacted] = useState({});
  const listError = error || blocksError;
  const retryAll = () => {
    retry();
    retryBlocks();
  };

  const followingIds = useMemo(
    () => new Set(following.map((item) => item.followedUid || item.uid || item.targetUid || item.id)),
    [following],
  );

  const visible = useMemo(() => {
    const unblocked = filterBlockedItems(testimonies, blockedUids);
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
  }, [testimonies, blockedUids, tab, followingIds]);

  const react = async (id, key) => {
    if (reacted[`${id}:${key}`]) return;
    setReacted((current) => ({ ...current, [`${id}:${key}`]: true }));
    try {
      await reactToTestimony(id, key);
    } catch (error) {
      setReacted((current) => ({ ...current, [`${id}:${key}`]: false }));
      Alert.alert('Reaction not saved', error.message);
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
            <Pressable key={testimony.id} onPress={() => onOpenTestimony?.(testimony)}>
              <TestimonyCard
                testimony={{
                  ...testimony,
                  praiseGod: Number(testimony.praiseGod || 0) + (reacted[`${testimony.id}:praiseGod`] ? 1 : 0),
                  amen: Number(testimony.amen || 0) + (reacted[`${testimony.id}:amen`] ? 1 : 0),
                }}
                onReact={react}
              />
            </Pressable>
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
