import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { spacing } from '../theme';
import { useAnnouncements } from '../useAnnouncements';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import AsyncState from '../components/AsyncState';

export default function AnnouncementsScreen({ onBack }) {
  const { announcements, loading, error, retry } = useAnnouncements(true);

  return (
    <ScreenScaffold scroll={false} style={styles.shell}>
      <AppHeader title="Announcements" subtitle="Community updates from PrayerStride leaders." onBack={onBack} />
      <AsyncState
        loading={loading}
        error={error}
        onRetry={retry}
        empty={!loading && !error && announcements.length === 0}
        emptyLabel="No active announcements right now."
      >
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={retry} />}
          renderItem={({ item }) => (
            <GlassCard style={styles.card}>
              <Heading level="eyebrow">{item.categoryLabel}</Heading>
              <Heading level="h4" style={styles.title}>{item.title}</Heading>
              <BodyText variant="body" style={styles.body}>{item.body}</BodyText>
              <BodyText variant="caption" style={styles.date}>
                {item.displayDate}{item.displayTime ? ` · ${item.displayTime}` : ''}
              </BodyText>
            </GlassCard>
          )}
        />
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.tabBar, gap: spacing.md },
  card: { marginBottom: 0 },
  title: { marginTop: spacing.sm },
  body: { marginTop: spacing.sm },
  date: { marginTop: spacing.sm },
});
