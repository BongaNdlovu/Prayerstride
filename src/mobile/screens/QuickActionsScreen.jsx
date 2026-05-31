import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight, Plus, Sparkles, Heart, BookOpen, Timer } from 'lucide-react-native';
import { colors, radii, spacing } from '../theme';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';

const ACTIONS = [
  { label: 'Create Prayer Request', route: 'create', icon: Plus },
  { label: 'Create Testimony', route: 'createTestimony', icon: Heart },
  { label: 'My Prayers', route: 'myPrayers', icon: Sparkles },
  { label: 'Following', route: 'following', icon: BookOpen },
  { label: 'Prayer Timer', route: 'prayerStopwatch', icon: Timer },
];

export default function QuickActionsScreen({ go, onBack }) {
  return (
    <ScreenScaffold pageContent>
      <AppHeader title="Quick Actions" subtitle="Jump into prayer, praise, or reflection." onBack={onBack} centered showLogo />
      <View style={styles.grid}>
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Pressable
              key={action.route}
              onPress={() => go(action.route)}
              style={({ pressed }) => [styles.gridItem, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <GlassCard style={styles.card}>
                <View style={styles.iconWrap}>
                  <Icon size={22} color={colors.ink} />
                </View>
                <Heading level="h4" style={styles.label}>{action.label}</Heading>
                <ChevronRight size={18} color={colors.gold} style={styles.arrow} />
              </GlassCard>
            </Pressable>
          );
        })}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    width: '47%',
    flexGrow: 1,
  },
  card: {
    minHeight: 140,
    marginBottom: 0,
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    marginBottom: spacing.md,
  },
  label: { fontSize: 15, lineHeight: 20, flex: 1 },
  arrow: { alignSelf: 'flex-end', marginTop: spacing.sm },
  pressed: { opacity: 0.92 },
});
