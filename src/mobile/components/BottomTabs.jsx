import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Footprints, Home, Trophy, User } from 'lucide-react-native';
import { alpha, colors, fonts, onDark, shadow, spacing } from '../theme';
import { useAppTheme } from '../AppThemeProvider';

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
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingBottom: spacing.lg + 8,
    ...shadow.subtle,
  },
  shellDark: {
    borderTopColor: onDark.border,
    backgroundColor: 'rgba(13,27,42,0.94)',
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingHorizontal: spacing.sm,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 4, paddingBottom: spacing.xs },
  tabItemPressed: { opacity: 0.78 },
  tabIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: alpha.gold18, borderWidth: 1, borderColor: alpha.gold30 },
  tabStrideWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabStrideWrapActive: { backgroundColor: colors.night },
  tabStrideWrapDark: { backgroundColor: colors.night3 },
  tabLabel: { fontFamily: fonts.sansSemiBold, fontSize: 10, color: colors.ink3 },
  tabLabelActive: { color: colors.ink },
  tabLabelDark: { color: onDark.textMuted },
  tabLabelActiveDark: { color: onDark.text },
});

export default function BottomTabs({ active, onChange }) {
  const { darkMode } = useAppTheme();
  return (
    <View style={[styles.shell, darkMode && styles.shellDark]}>
      <View style={styles.tabs}>
        {tabs.map(({ key, label, icon: Icon }) => {
          const selected = key === active;
          const isStride = key === 'stride';

          return (
            <Pressable
              key={key}
              onPress={() => onChange(key, {})}
              style={({ pressed }) => [styles.tabItem, pressed && styles.tabItemPressed]}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
            >
              {isStride ? (
                <View style={[styles.tabStrideWrap, darkMode && styles.tabStrideWrapDark, selected && styles.tabStrideWrapActive]}>
                  <Icon size={14} color={selected ? colors.goldLight : darkMode ? onDark.textMuted : colors.ink3} />
                </View>
              ) : (
                <View style={[styles.tabIcon, selected && styles.tabIconActive]}>
                  <Icon size={19} color={selected ? (darkMode ? colors.goldLight : colors.ink) : (darkMode ? onDark.textMuted : colors.ink3)} />
                </View>
              )}
              <Text style={[styles.tabLabel, darkMode && styles.tabLabelDark, selected && styles.tabLabelActive, selected && darkMode && styles.tabLabelActiveDark]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
