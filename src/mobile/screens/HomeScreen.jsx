import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Bell, ChevronRight, Clock, Users } from 'lucide-react-native';
import { alpha, colors, fonts, spacing } from '../theme';
import { auth } from '../firebase';
import { usePrayers } from '../usePrayerData';
import { usePrayerSessions } from '../usePrayerSessions';
import {
  countUniqueAuthorsThisMonth,
  formatPrayerTime,
  todaySeconds,
} from '../sessionStats';
import ScreenScaffold from '../components/ScreenScaffold';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import PrayerCard from '../components/PrayerCard';
import PrimaryButton from '../components/PrimaryButton';
import AsyncState from '../components/AsyncState';
import LogoMark from '../components/LogoMark';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen({ onOpenPrayer, go }) {
  const uid = auth.currentUser?.uid;
  const { prayers, loading, error } = usePrayers(true);
  const { sessions, loading: sessionsLoading, error: sessionsError } = usePrayerSessions(uid, Boolean(uid));
  const featured = prayers[0];
  const listError = error || sessionsError;
  const listLoading = loading || sessionsLoading;
  const recentPrayers = prayers.slice(0, 3);
  const todayTime = useMemo(() => formatPrayerTime(todaySeconds(sessions)), [sessions]);
  const peopleHelpedThisMonth = useMemo(
    () => countUniqueAuthorsThisMonth(prayers),
    [prayers],
  );

  return (
    <ScreenScaffold pageContent>
      <View style={styles.topBar}>
        <View>
          <BodyText variant="caption" style={styles.greeting}>{greeting()}</BodyText>
          <Heading level="h2" style={styles.headline}>Who can you carry in prayer today?</Heading>
        </View>
        <Pressable onPress={() => go('notifications')} style={styles.bellBtn}>
          <Bell size={20} color={colors.gold} />
        </Pressable>
      </View>

      {featured ? (
        <GlassCard style={styles.missionCard}>
          <BodyText variant="caption" style={styles.missionEyebrow}>TODAY'S PRAYER MISSION</BodyText>
          <View style={styles.missionRow}>
            <View style={styles.missionAvatar}>
              <BodyText variant="label">{(featured.authorName || 'E').slice(0, 1)}</BodyText>
            </View>
            <View style={styles.missionInfo}>
              <Heading level="h4">{featured.authorName || 'Community member'}</Heading>
              <BodyText variant="small">{featured.title}</BodyText>
            </View>
          </View>
          <BodyText variant="body" style={styles.missionBody}>{featured.body}</BodyText>
          <PrimaryButton label="Pray Now" onPress={() => onOpenPrayer(featured)} icon={ChevronRight} style={styles.missionCta} />
        </GlassCard>
      ) : (
        <GlassCard style={styles.missionCard}>
          <LogoMark size={36} />
          <Heading level="h3" style={styles.missionTitle}>Start your first request</Heading>
          <BodyText variant="body">Share a prayer need or begin a private stopwatch session.</BodyText>
          <PrimaryButton label="Create Prayer" onPress={() => go('create')} style={styles.missionCta} />
        </GlassCard>
      )}

      <View style={styles.statsGrid}>
        <StatCard icon={Clock} value={todayTime} label="Prayer Time" sublabel="Today" />
        <StatCard icon={Users} value={String(peopleHelpedThisMonth)} label="People Helped" sublabel="This Month" />
      </View>

      <View style={styles.sectionRow}>
        <Heading level="h4">Prayer Requests</Heading>
        <Pressable onPress={() => go('myPrayers')}>
          <BodyText variant="small" style={styles.viewAll}>View All</BodyText>
        </Pressable>
      </View>

      <AsyncState loading={listLoading} error={listError} empty={!listLoading && !listError && prayers.length === 0} emptyLabel="No community prayers yet. Be the first to share.">
        <View style={styles.list}>
          {recentPrayers.map((prayer) => (
            <PrayerCard key={prayer.id} prayer={prayer} onPress={() => onOpenPrayer(prayer)} variant="list" />
          ))}
        </View>
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.lg, paddingTop: spacing.sm },
  greeting: { color: colors.gold, marginBottom: spacing.xs },
  headline: { fontSize: 26, lineHeight: 32, maxWidth: 280 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha.ivory12 },
  missionCard: { marginBottom: spacing.lg },
  missionEyebrow: { letterSpacing: 2, color: colors.gold, marginBottom: spacing.md },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  missionAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha.gold22 },
  missionInfo: { flex: 1 },
  missionBody: { marginBottom: spacing.md },
  missionCta: { marginTop: spacing.sm },
  missionTitle: { marginTop: spacing.md, marginBottom: spacing.sm },
  statsGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  viewAll: { color: colors.gold, fontFamily: fonts.sansSemiBold },
  list: { marginTop: spacing.xs },
});