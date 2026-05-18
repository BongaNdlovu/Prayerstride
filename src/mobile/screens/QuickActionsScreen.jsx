import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus, Sparkles, Heart, BookOpen, Timer } from 'lucide-react-native';
import { colors } from '../theme';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

const ACTIONS = [
  { label: 'Create Prayer Request', route: 'create', icon: Plus },
  { label: 'Create Testimony', route: 'createTestimony', icon: Heart },
  { label: 'My Prayers', route: 'myPrayers', icon: Sparkles },
  { label: 'Following', route: 'following', icon: BookOpen },
  { label: 'Prayer Timer', route: 'prayerStopwatch', icon: Timer },
];

export default function QuickActionsScreen({ go }) {
  return (
    <CinematicScreen pageContent>
      <PageHero scene="dawn" eyebrow="Actions" title="Quick Actions" subtitle="Jump into prayer, praise, or reflection." compact />
      {ACTIONS.map((action) => (
        <Pressable key={action.route} onPress={() => go(action.route)} style={styles.card}>
          <View style={styles.iconWrap}>
            <action.icon size={22} color={colors.ink} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ))}
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', borderRadius: 18, padding: 16, marginBottom: 10, backgroundColor: 'rgba(248,243,234,0.06)' },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  label: { flex: 1, color: colors.ivory, fontSize: 16, fontWeight: '600' },
  arrow: { color: 'rgba(248,243,234,0.4)', fontSize: 24 },
});
