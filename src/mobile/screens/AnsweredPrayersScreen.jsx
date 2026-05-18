import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { usePrayers } from '../usePrayerData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import PrayerCard from '../components/PrayerCard';
import EmptyState from '../components/EmptyState';

export default function AnsweredPrayersScreen({ user, onOpenPrayer }) {
  const { prayers } = usePrayers(true, { userId: user?.uid });
  const mine = prayers.filter((p) => p.authorUid === user.uid && p.status === 'answered');

  return (
    <CinematicScreen>
      <PageHero scene="answered" eyebrow="Answered" title="Prayers God has answered" subtitle="Celebrate what God has done through your prayers." compact />
      <FlatList
        data={mine}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState label="No answered prayers yet." />}
        renderItem={({ item }) => <PrayerCard prayer={item} onPress={() => onOpenPrayer(item)} variant="glass" />}
      />
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
});
