import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart, Plus, Sparkles, Sun, User } from 'lucide-react-native';
import { alpha, colors, fonts, shadow, spacing } from '../theme';

const tabs = [
  { key: 'home', label: 'Today', icon: Sun },
  { key: 'discover', label: 'Pray', icon: Sparkles },
  { key: 'create', label: '', icon: Plus, fab: true },
  { key: 'praise', label: 'Praise', icon: Heart },
  { key: 'profile', label: 'Me', icon: User },
];

const styles = StyleSheet.create({
  shell: {
    position: 'relative',
    borderTopWidth: 1,
    borderTopColor: alpha.ivory12,
    backgroundColor: colors.screen,
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
  tabLabel: { fontFamily: fonts.sansSemiBold, fontSize: 10, color: alpha.ivory55 },
  tabLabelActive: { color: colors.gold },
  fabWrap: { flex: 1, alignItems: 'center', marginTop: -28 },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    ...shadow.fab,
  },
});

export default function BottomTabs({ active, onChange }) {
  return (
    <View style={styles.shell}>
      <View style={styles.tabs}>
        {tabs.map(({ key, label, icon: Icon, fab }) => {
          const selected = key === active;
          if (fab) {
            return (
              <Pressable key={key} onPress={() => onChange(key, {})} style={styles.fabWrap} accessibilityRole="button" accessibilityLabel="Create">
                <View style={styles.fab}>
                  <Icon size={26} color={colors.ink} strokeWidth={2.5} />
                </View>
              </Pressable>
            );
          }
          return (
            <Pressable key={key} onPress={() => onChange(key, {})} style={styles.tabItem} accessibilityRole="button" accessibilityLabel={label}>
              <View style={[styles.tabIcon, selected && styles.tabIconActive]}>
                <Icon size={20} color={selected ? colors.gold : alpha.ivory55} />
              </View>
              <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
