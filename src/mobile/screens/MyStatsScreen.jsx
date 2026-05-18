import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Flame, Heart, Users } from 'lucide-react-native';
import { colors } from '../theme';
import { usePrayers } from '../usePrayerData';
import { usePrayerSessions } from '../usePrayerSessions';
import { useTestimonies } from '../usePrayerData';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import StatCard from '../components/StatCard';
import MiniLineChart from '../components/MiniLineChart';
import StreakCalendar from '../components/StreakCalendar';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function sessionDate(session) {
  const value = session?.createdAt;
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'number' || typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function dateKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function buildWeeklyStats(sessions, today = new Date()) {
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const counts = new Map();
  sessions.forEach((session) => {
    const date = sessionDate(session);
    if (!date) return;
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    const offset = Math.floor((day - weekStart) / 86400000);
    if (offset >= 0 && offset < 7) {
      counts.set(offset, (counts.get(offset) || 0) + 1);
    }
  });

  return DAY_LABELS.map((day, index) => ({ day, prayers: counts.get(index) || 0 }));
}

function calculateStreak(sessions, today = new Date()) {
  const activeDates = new Set(
    sessions
      .map(sessionDate)
      .filter(Boolean)
      .map((date) => dateKey(date)),
  );

  let cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  let streak = 0;

  while (activeDates.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function formatMinutes(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function MyStatsScreen({ user }) {
  const { prayers } = usePrayers(true, { userId: user?.uid });
  const { sessions, totalSeconds } = usePrayerSessions(user?.uid, true);
  const { testimonies } = useTestimonies(true);
  const myPrayers = prayers.filter((p) => p.authorUid === user?.uid);
  const answered = myPrayers.filter((p) => p.status === 'answered');
  const todayIndex = new Date().getDay();
  const weeklyPrayerData = useMemo(() => buildWeeklyStats(sessions), [sessions]);
  const streak = useMemo(() => calculateStreak(sessions), [sessions]);
  const activeDayIndexes = weeklyPrayerData.map((item, index) => (item.prayers > 0 ? index : null)).filter((index) => index !== null);
  const weeklyTotal = weeklyPrayerData.reduce((sum, item) => sum + item.prayers, 0);
  const myTestimonies = testimonies.filter((testimony) => testimony.authorUid === user?.uid);

  return (
    <CinematicScreen pageContent>
      <PageHero scene="bible" eyebrow="Rhythm" title="Your prayer walk" subtitle="A calm record of consistency, care, and people carried in prayer." compact />
      <View style={styles.card}>
        <View style={styles.missionHeader}>
          <View style={styles.missionText}>
            <Text style={styles.eyebrow}>Prayer Streak</Text>
            <Text style={styles.missionTitle}>{streak} {streak === 1 ? 'day' : 'days'} walking with God</Text>
          </View>
          <View style={styles.missionIcon}>
            <Flame size={24} color={colors.ink} />
          </View>
        </View>
        <View style={styles.streakWrap}>
          <StreakCalendar streak={streak} currentDayIndex={todayIndex} activeDayIndexes={activeDayIndexes} />
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.sectionRowCompact}>
          <View>
            <Text style={styles.eyebrow}>Prayer Activity</Text>
            <Text style={styles.chartTitle}>This week</Text>
          </View>
          <Text style={styles.viewAll}>{weeklyTotal} this week</Text>
        </View>
        <MiniLineChart data={weeklyPrayerData} />
      </View>
      <View style={styles.statsGrid}>
        <StatCard icon={Flame} value={`${myPrayers.length}`} label="prayers shared" />
        <StatCard icon={Heart} value={`${answered.length}`} label="answered" />
      </View>
      <View style={styles.statsGrid}>
        <StatCard icon={Users} value={`${myTestimonies.length}`} label="testimonies" />
        <StatCard icon={Flame} value={`${sessions.length}`} label="prayer sessions" />
      </View>
      <View style={styles.card}>
        <View style={styles.missionHeader}>
          <View style={styles.missionText}>
            <Text style={styles.eyebrow}>Prayer Time</Text>
            <Text style={styles.missionTitle}>{formatMinutes(totalSeconds)}</Text>
          </View>
          <View style={styles.missionIcon}>
            <Users size={24} color={colors.ink} />
          </View>
        </View>
        <Text style={styles.glassBody}>Time spent in prayer and encouragement across the community.</Text>
      </View>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18, marginBottom: 14 },
  missionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  missionText: { flex: 1 },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 2.4, textTransform: 'uppercase' },
  missionTitle: { marginTop: 8, color: colors.ivory, fontSize: 25, lineHeight: 31, fontWeight: '800' },
  missionIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  glassBody: { marginTop: 12, color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 23 },
  streakWrap: { marginTop: 18 },
  sectionRowCompact: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  chartTitle: { marginTop: 6, color: colors.ivory, fontSize: 22, fontWeight: '800' },
  viewAll: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 14 },
});
