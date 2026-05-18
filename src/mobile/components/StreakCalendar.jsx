import { StyleSheet, Text, View } from 'react-native';
import { Flame } from 'lucide-react-native';
import { colors } from '../theme';

const styles = StyleSheet.create({
  calendar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  days: { flex: 1, minHeight: 48, borderRadius: 18, backgroundColor: 'rgba(248,243,234,0.1)', borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  day: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(248,243,234,0.08)' },
  dayActive: { backgroundColor: 'rgba(200,137,43,0.22)' },
  dayCurrent: { borderWidth: 2, borderColor: 'rgba(200,137,43,0.62)' },
  dayText: { color: 'rgba(248,243,234,0.5)', fontSize: 11, fontWeight: '800' },
  dayTextActive: { color: colors.ivory },
  count: { minHeight: 48, borderRadius: 999, backgroundColor: 'rgba(248,243,234,0.1)', borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 6 },
  countText: { color: colors.ivory, fontSize: 18, fontWeight: '800' },
});

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function StreakCalendar({ streak = 7, currentDayIndex = 6 }) {
  return (
    <View style={styles.calendar}>
      <View style={styles.days}>
        {DAYS.map((day, index) => {
          const isStreakDay = index <= currentDayIndex;
          const isCurrentDay = index === currentDayIndex;

          return (
            <View key={`${day}-${index}`} style={[styles.day, isStreakDay && styles.dayActive, isCurrentDay && styles.dayCurrent]}>
              <Text style={[styles.dayText, isStreakDay && styles.dayTextActive]}>{day}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.count}>
        <Flame size={16} color={colors.gold} />
        <Text style={styles.countText}>{streak}</Text>
      </View>
    </View>
  );
}
