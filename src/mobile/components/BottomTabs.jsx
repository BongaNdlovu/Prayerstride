import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Footprints, Home, Trophy, User } from 'lucide-react-native';
import { alpha, colors, fonts, spacing } from '../theme';

const tabs = [
  { key: 'home', label: 'Feed', icon: Home },
  { key: 'leaderboard', label: 'Ranks', icon: Trophy },
  { key: 'stride', label: 'Stride', icon: Footprints },
  { key: 'profile', label: 'Profile', icon: User },
];

const styles = StyleSheet.create({
  shell: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: 'rgba(250,250,248,0.92)',
    paddingBottom: spacing.lg + 8,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingHorizontal: spacing.sm,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 4, paddingBottom: spacing.xs },
  tabIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: alpha.gold18 },
  tabStrideWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabStrideWrapActive: { backgroundColor: colors.night },
  tabLabel: { fontFamily: fonts.sansSemiBold, fontSize: 10, color: colors.ink3 },
  tabLabelActive: { color: colors.ink },
});

export default function BottomTabs({ active, onChange }) {
  return (
    <View style={styles.shell}>
      <View style={styles.tabs}>
        {tabs.map(({ key, label, icon: Icon }) => {
          const selected = key === active;
          const isStride = key === 'stride';

          return (
            <Pressable key={key} onPress={() => onChange(key, {})} style={styles.tabItem} accessibilityRole="button" accessibilityLabel={label}>
              {isStride ? (
                <View style={[styles.tabStrideWrap, selected && styles.tabStrideWrapActive]}>
                  <Icon size={14} color={selected ? colors.goldLight : colors.ink3} />
                </View>
              ) : (
                <View style={[styles.tabIcon, selected && styles.tabIconActive]}>
                  <Icon size={19} color={selected ? colors.ink : colors.ink3} />
                </View>
              )}
              <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
