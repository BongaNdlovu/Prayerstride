import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { spacing } from '../theme';
import { usePrayers } from '../usePrayerData';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import PillTabs from '../components/PillTabs';
import PrayerCard from '../components/PrayerCard';
import AsyncState from '../components/AsyncState';

const TABS = ['All', 'Active', 'Answered'];

export default function MyPrayersScreen({ user, onOpenPrayer, onBack }) {
  const uid = user?.uid;
  const { prayers, loading, error, retry } = usePrayers(true, { userId: uid });
  const [tab, setTab] = useState('All');

  const mine = useMemo(
    () => (uid ? prayers.filter((prayer) => prayer.authorUid === uid) : []),
    [prayers, uid],
  );

  const data = useMemo(() => {
    if (tab === 'Active') return mine.filter((prayer) => prayer.status === 'active');
    if (tab === 'Answered') return mine.filter((prayer) => prayer.status === 'answered');
    return mine;
  }, [mine, tab]);

  const header = (
    <View style={styles.header}>
      <AppHeader onBack={onBack} title="My Prayers" subtitle="Track your prayer requests" />
      <PillTabs tabs={TABS} active={tab} onChange={setTab} style={styles.tabs} />
    </View>
  );

  return (
    <ScreenScaffold scroll={false} pageContent style={styles.screen}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={(
          <AsyncState
            loading={loading}
            error={error}
            onRetry={retry}
            empty={!loading && !error}
            emptyLabel={tab === 'Answered' ? 'No answered prayers yet.' : tab === 'Active' ? 'No active prayers.' : 'No prayers yet.'}
          />
        )}
        renderItem={({ item }) => (
          <PrayerCard prayer={item} onPress={() => onOpenPrayer(item)} variant="glass" />
        )}
        showsVerticalScrollIndicator={false}
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingTop: spacing.sm },
  tabs: { marginBottom: spacing.md },
  list: { paddingBottom: spacing.tabBar, gap: spacing.md },
});
