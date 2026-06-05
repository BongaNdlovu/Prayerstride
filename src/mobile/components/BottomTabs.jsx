import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BarChart3, Sun, Trophy, User } from 'lucide-react-native';
import { alpha, colors, fonts, spacing } from '../theme';

const tabs = [
  { key: 'home', label: 'Feed', icon: Sun },
  { key: 'leaderboard', label: 'Ranks', icon: Trophy },
  { key: 'myStats', label: 'Stride', icon: BarChart3 },
  { key: 'profile', label: 'Profile', icon: User },
];

const styles = StyleSheet.create({
  shell: {
    position: 'relative',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingBottom: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 4, paddingBottom: spacing.xs },
  tabIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: alpha.gold18 },
  tabLabel: { fontFamily: fonts.sansSemiBold, fontSize: 10, color: colors.textMuted },
  tabLabelActive: { color: colors.navy },
});

export default function BottomTabs({ active, onChange }) {
  return (
    <View style={styles.shell}>
      <View style={styles.tabs}>
        {tabs.map(({ key, label, icon: Icon }) => {
          const selected = key === active;
          return (
            <Pressable key={key} onPress={() => onChange(key, {})} style={styles.tabItem} accessibilityRole="button" accessibilityLabel={label}>
              <View style={[styles.tabIcon, selected && styles.tabIconActive]}>
                <Icon size={20} color={selected ? colors.navy : colors.textMuted} />
              </View>
              <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
