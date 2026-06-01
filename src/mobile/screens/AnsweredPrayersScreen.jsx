import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { spacing } from '../theme';
import { usePrayers } from '../usePrayerData';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import PrayerCard from '../components/PrayerCard';
import AsyncState from '../components/AsyncState';

export default function AnsweredPrayersScreen({ user, onOpenPrayer, onBack }) {
  const uid = user?.uid;
  const { prayers, loading, error, retry } = usePrayers(true, { userId: uid });
  const mine = useMemo(
    () => (uid ? prayers.filter((p) => p.authorUid === uid && p.status === 'answered') : []),
    [prayers, uid],
  );

  const header = (
    <AppHeader
      onBack={onBack}
      title="Answered Prayers"
      subtitle="Celebrate what God has done"
    />
  );

  return (
    <ScreenScaffold scroll={false} pageContent style={styles.screen}>
      <FlatList
        data={mine}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={(
          <AsyncState loading={loading} error={error} onRetry={retry} empty={!loading && !error} emptyLabel="No answered prayers yet." />
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
  list: { paddingTop: spacing.sm, paddingBottom: spacing.tabBar, gap: spacing.md },
});
