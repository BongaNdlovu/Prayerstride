import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Flame } from 'lucide-react-native';
import { colors } from '../theme';

const styles = StyleSheet.create({
  calendar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  days: { flex: 1, minHeight: 48, borderRadius: 18, backgroundColor: 'rgba(248,243,234,0.1)', borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  day: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(248,243,234,0.08)' },
  dayActive: { backgroundColor: 'rgba(200,137,43,0.22)' },
  dayCurrent: { borderWidth: 2, borderColor: 'rgba(200,137,43,0.72)' },
  dayPulse: { position: 'absolute', width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'rgba(200,137,43,0.55)' },
  dayText: { color: 'rgba(248,243,234,0.5)', fontSize: 11, fontWeight: '800' },
  dayTextActive: { color: colors.ivory },
  count: { minHeight: 48, borderRadius: 999, backgroundColor: 'rgba(248,243,234,0.1)', borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 6 },
  countText: { color: colors.ivory, fontSize: 18, fontWeight: '800' },
});

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function StreakCalendar({ streak = 7, currentDayIndex = new Date().getDay(), activeDayIndexes }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const activeIndexes = activeDayIndexes || DAYS.map((_, index) => index).filter((index) => index <= currentDayIndex);
  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.22],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <View style={styles.calendar}>
      <View style={styles.days}>
        {DAYS.map((day, index) => {
          const isStreakDay = activeIndexes.includes(index);
          const isCurrentDay = index === currentDayIndex;

          return (
            <View key={`${day}-${index}`} style={[styles.day, isStreakDay && styles.dayActive, isCurrentDay && styles.dayCurrent]}>
              {isCurrentDay && (
                <Animated.View
                  pointerEvents="none"
                  style={[styles.dayPulse, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]}
                />
              )}
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
