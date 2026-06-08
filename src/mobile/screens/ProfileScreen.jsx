import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Award,
  BarChart3,
  ChevronRight,
  Clock,
  Flame,
  Footprints,
  Heart,
  Megaphone,
  Settings,
  Sparkles,
  Trophy,
  User,
  Users,
} from 'lucide-react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import { XP_PER_LEVEL } from '../gamification';
import { useUserProfile } from '../useUsers';
import { useGamification } from '../useGamification';
import {
  cleanOptionalHandle,
  cleanOptionalPhotoURL,
  cleanOptionalProfileText,
  imageUriWithCacheBuster,
} from '../profileFields';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import StatCard from '../components/StatCard';
import AsyncState from '../components/AsyncState';
import PrimaryButton from '../components/PrimaryButton';

const PROFILE_ROUTES = {
  stride: 'stride',
  reminderSettings: 'reminderSettings',
  notifications: 'notifications',
  settings: 'settings',
  leaderboard: 'leaderboard',
  achievements: 'achievements',
};

const QUICK_LINKS = [
  { label: 'Stride', route: PROFILE_ROUTES.stride, icon: BarChart3 },
  { label: 'Ranks', route: PROFILE_ROUTES.leaderboard, icon: Users },
  { label: 'Prayer Times', route: PROFILE_ROUTES.reminderSettings, icon: Clock },
  { label: 'Achievements', route: PROFILE_ROUTES.achievements, icon: Sparkles },
];

const MORE_LINKS = [
  { label: 'Edit Profile', route: 'editProfile', icon: User },
  { label: 'Announcements', route: 'announcements', icon: Megaphone },
];

export default function ProfileScreen({ user, signOut, go }) {
  const { profile, loading: profileLoading, error: profileError, retry: retryProfile } = useUserProfile(user?.uid, Boolean(user?.uid));
  const {
    summary: gamified,
    error: gamificationError,
    retry: retryGamification,
  } = useGamification(user?.uid, Boolean(user?.uid));

  const displayName = cleanOptionalProfileText(profile?.displayName)
    || cleanOptionalProfileText(user?.displayName)
    || 'PrayerStride User';
  const handle = cleanOptionalHandle(profile?.handle);
  const bio = cleanOptionalProfileText(profile?.bio);
  const email = cleanOptionalProfileText(user?.email);
  const photoURL = cleanOptionalPhotoURL(profile?.photoURL) || cleanOptionalPhotoURL(user?.photoURL);
  const avatarUri = imageUriWithCacheBuster(photoURL, profile?.updatedAt || profile?.photoURL);
  const journeyTitle = cleanOptionalProfileText(gamified.journey?.title) || 'Prayer Strider';
  const statsUnavailable = Boolean(gamificationError);
  const earnedBadges = gamified.badges.filter((badge) => badge.state === 'earned').length;
  const impact = gamified.impact || {};
  const isAdmin = profile?.role === 'admin' && profile?.suspended !== true;
  const retry = () => {
    retryProfile();
    retryGamification();
  };

  return (
    <ScreenScaffold pageContent>
      <AppHeader
        title="Profile"
        rightAction={(
          <Pressable onPress={() => go(PROFILE_ROUTES.settings)} style={styles.gearBtn} accessibilityLabel="Settings">
            <Settings size={20} color={colors.ink} />
          </Pressable>
        )}
      />

      <AsyncState loading={profileLoading} error={profileError} onRetry={retry}>
      <GlassCard style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <Heading level="h3" style={styles.name}>{displayName}</Heading>
        {handle ? <BodyText variant="small" style={styles.handle}>@{handle}</BodyText> : null}
        <View style={styles.rankPill}>
          <Footprints size={11} color={colors.goldLight} />
          <BodyText variant="caption" style={styles.rankPillText}>{journeyTitle}</BodyText>
        </View>
        {bio ? <BodyText variant="body" style={styles.bio}>{bio}</BodyText> : (
          email ? <BodyText variant="caption" style={styles.bio}>{email}</BodyText> : null
        )}
      </GlassCard>

      {statsUnavailable ? (
        <View style={styles.statsErrorRow}>
          <BodyText variant="caption" style={styles.statsError}>
            Prayer stats are temporarily unavailable. Showing your profile with default stats.
          </BodyText>
          <PrimaryButton
            label="Retry"
            variant="ghost"
            onPress={retryGamification}
            style={styles.statsRetryButton}
          />
        </View>
      ) : null}

      <View style={styles.levelCard}>
        <View style={styles.levelCardRow}>
          <View style={styles.levelRank}>
            <Award size={22} color={colors.goldLight} />
            <View>
              <BodyText variant="caption" style={styles.levelRankLabel}>Current Rank</BodyText>
              <Heading level="h4" style={styles.levelRankName}>{journeyTitle}</Heading>
            </View>
          </View>
          <View style={styles.levelXpCol}>
            <Heading level="stat" style={styles.levelXpTotal}>{gamified.totalXP.toLocaleString()}</Heading>
            <BodyText variant="caption" style={styles.levelXpLabel}>Total XP</BodyText>
          </View>
        </View>
        <View style={styles.levelBarLabel}>
          <BodyText variant="caption">Level {gamified.levelInfo.level}</BodyText>
          <BodyText variant="caption">{gamified.levelInfo.xpIntoLevel} / {XP_PER_LEVEL} XP to Level {gamified.levelInfo.level + 1}</BodyText>
        </View>
        <View style={styles.levelBar}>
          <View style={[styles.levelBarFill, { width: `${Math.round(gamified.levelInfo.progress * 100)}%` }]} />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon={Flame} value={String(gamified.streak)} label="Day Streak" sublabel="Keep going" accent={colors.redSoft} style={styles.statCard} />
        <StatCard icon={BarChart3} value={String(impact.prayerSessions || 0)} label="Sessions" accent={colors.teal} style={styles.statCard} />
        <StatCard icon={Users} value={String(impact.peoplePrayedFor || 0)} label="Prayers Carried" accent={colors.community} style={styles.statCard} />
        <StatCard icon={Heart} value={String(impact.answeredPrayers || 0)} label="Answered Prayers" accent={colors.violet} style={styles.statCard} />
        <StatCard icon={Trophy} value={String(earnedBadges)} label="Badges" accent={colors.gold} style={styles.statCard} />
      </View>

      <Heading level="h4" style={styles.sectionTitle}>Quick Links</Heading>
      <GlassCard style={styles.menuCard}>
        {QUICK_LINKS.map((item, index) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.route}
              onPress={() => go(item.route)}
              style={({ pressed }) => [styles.menuItem, index === QUICK_LINKS.length - 1 && styles.menuItemLast, pressed && styles.pressed]}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIcon}>
                  <Icon size={18} color={colors.ink} />
                </View>
                <BodyText variant="label">{item.label}</BodyText>
              </View>
              <ChevronRight size={18} color={colors.ink3} />
            </Pressable>
          );
        })}
      </GlassCard>

      <Heading level="h4" style={styles.sectionTitle}>More</Heading>
      <GlassCard style={styles.menuCard}>
        {MORE_LINKS.map((item, index) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.route}
              onPress={() => go(item.route)}
              style={({ pressed }) => [styles.menuItem, index === MORE_LINKS.length - 1 && styles.menuItemLast, pressed && styles.pressed]}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIcon}>
                  <Icon size={18} color={colors.ink} />
                </View>
                <BodyText variant="label">{item.label}</BodyText>
              </View>
              <ChevronRight size={18} color={colors.ink3} />
            </Pressable>
          );
        })}
        {isAdmin ? (
          <Pressable onPress={() => go('adminDashboard')} style={({ pressed }) => [styles.menuItem, styles.menuItemLast, pressed && styles.pressed]}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Settings size={18} color={colors.ink} />
              </View>
              <BodyText variant="label">Admin Dashboard</BodyText>
            </View>
            <ChevronRight size={18} color={colors.ink3} />
          </Pressable>
        ) : null}
      </GlassCard>

      <Pressable onPress={signOut} style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}>
        <BodyText variant="label">Sign Out</BodyText>
      </Pressable>
      </AsyncState>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  gearBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  profileCard: { alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  avatarWrap: { marginBottom: spacing.md },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold22,
  },
  avatarImage: { width: 88, height: 88, borderRadius: 22 },
  avatarText: { fontFamily: fonts.sansExtraBold, fontSize: 32, color: colors.gold },
  name: { textAlign: 'center' },
  handle: { marginTop: spacing.xs, color: colors.ink3, textAlign: 'center' },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.night,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  rankPillText: { color: colors.goldLight, fontFamily: fonts.sansSemiBold, fontSize: 10.5 },
  bio: { marginTop: spacing.md, textAlign: 'center', maxWidth: 280 },
  statsErrorRow: { marginBottom: spacing.md, alignItems: 'center', gap: spacing.sm },
  statsError: { color: colors.redSoft, textAlign: 'center' },
  statsRetryButton: { minHeight: 36, paddingHorizontal: spacing.lg },
  levelCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.night,
    borderRadius: radii.xl,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  levelCardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  levelRank: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  levelRankLabel: { color: 'rgba(255,255,255,0.50)', fontFamily: fonts.sansExtraBold, letterSpacing: 1, textTransform: 'uppercase' },
  levelRankName: { color: colors.goldLight },
  levelXpCol: { alignItems: 'flex-end' },
  levelXpTotal: { color: colors.white, fontSize: 24 },
  levelXpLabel: { color: 'rgba(255,255,255,0.40)' },
  levelBarLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  levelBar: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  levelBarFill: { height: 5, borderRadius: 3, backgroundColor: colors.goldLight },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { minWidth: '46%' },
  sectionTitle: { marginBottom: spacing.sm },
  menuCard: { paddingVertical: spacing.xs },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
  },
  signOutButton: {
    marginTop: spacing.xl,
    minHeight: 52,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  pressed: { opacity: 0.92 },
});

