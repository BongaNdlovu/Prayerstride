import { StyleSheet, Text, View } from 'react-native';
import { Flame } from 'lucide-react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function StreakCalendar({ streak = 0, currentDayIndex = 0, activeDayIndexes = [] }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.days}>
        {DAY_LABELS.map((day, index) => {
          const active = activeDayIndexes.includes(index);
          const current = index === currentDayIndex;
          return (
            <View key={`${day}-${index}`} style={[styles.day, active && styles.dayActive, current && styles.dayCurrent]}>
              <Text style={[styles.dayText, active && styles.dayTextActive]}>{day}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.count}>
        <Flame size={16} color={colors.coral} />
        <Text style={styles.countText}>{streak} day streak</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  days: {
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  day: {
    flex: 1,
    maxWidth: 34,
    aspectRatio: 1,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  dayActive: { backgroundColor: alpha.gold22 },
  dayCurrent: { borderWidth: 1, borderColor: colors.coral },
  dayText: { fontFamily: fonts.sansExtraBold, fontSize: 11, color: colors.textMuted },
  dayTextActive: { color: colors.navy },
  count: {
    alignSelf: 'flex-start',
    minHeight: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countText: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.navy },
});
