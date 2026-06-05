import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, PanResponder, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Award,
  Bell,
  Bookmark,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  Map,
  MoreHorizontal,
  Search,
  SendHorizontal,
  Sparkles,
  Target,
  Timer,
  Trophy,
  X,
  Zap,
} from 'lucide-react-native';
import { alpha, colors, fonts, radii, shadow, spacing } from '../theme';
import { DAILY_PRAY_GOAL, XP_AWARDS, XP_PER_LEVEL } from '../gamification';
import { auth } from '../firebase';
import { bookmarkPrayer, prayForRequest } from '../api';
import { addPrayer, usePrayers } from '../usePrayerData';
import { filterBlockedItems, useBlocks } from '../useBlocks';
import { useGamification } from '../useGamification';
import { useAppFeedback } from '../AppFeedbackProvider';
import { getErrorMessage } from '../errors';
import { PRAYER_DETAILS_LIMIT } from '../prayerFormOptions';
import ScreenScaffold from '../components/ScreenScaffold';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import AsyncState from '../components/AsyncState';
import ProgressRing from '../components/ProgressRing';
import StreakCalendar from '../components/StreakCalendar';

const DAILY_VERSES = [
  {
    text: 'God is our refuge and strength, a very present help in trouble.',
    ref: 'Psalm 46:1',
  },
  {
    text: 'Pray without ceasing, give thanks in all circumstances.',
    ref: '1 Thessalonians 5:17-18',
  },
  {
    text: 'The prayer of a righteous person has great power as it is working.',
    ref: 'James 5:16',
  },
];

function clampIndex(index, length) {
  if (!length) return 0;
  return Math.min(Math.max(index, 0), length - 1);
}

function prayerMatchesQuery(prayer, query) {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return [
    prayer.authorName,
    prayer.name,
    prayer.title,
    prayer.body,
    prayer.text,
    prayer.category,
    prayer.scriptureRef,
    prayer.verse,
  ].filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function dailyVerse() {
  const day = Math.floor(Date.now() / 86400000);
  return DAILY_VERSES[day % DAILY_VERSES.length];
}

function formatXP(value) {
  return Math.max(0, Number(value) || 0).toLocaleString();
}

function ProgressDots({ count, activeIndex, onSelect }) {
  if (!count) return null;
  return (
    <View style={styles.progressDots}>
      {Array.from({ length: count }, (_, index) => (
        <Pressable
          key={index}
          onPress={() => onSelect(index)}
          style={[styles.progressDot, index === activeIndex && styles.progressDotActive]}
          accessibilityRole="button"
          accessibilityLabel={`Prayer ${index + 1} of ${count}`}
        />
      ))}
    </View>
  );
}

function PrayerFocusCard({ prayer, saved, prayed, onPray, onAmen, onSave, onMore }) {
  const initial = prayer.authorName?.slice(0, 1)?.toUpperCase() || 'P';
  return (
    <GlassCard style={styles.focusCard}>
      <View style={styles.focusHeader}>
        <View style={styles.focusAvatar}>
          <Text style={styles.focusAvatarText}>{initial}</Text>
        </View>
        <View style={styles.focusMeta}>
          <BodyText variant="label" numberOfLines={1}>{prayer.authorName || 'Community member'}</BodyText>
          {prayer.urgent ? (
            <BodyText variant="caption" style={styles.urgentLabel}>Urgent request</BodyText>
          ) : null}
        </View>
      </View>

      <View style={styles.focusBody}>
        <Text style={styles.focusQuote}>"</Text>
        <Heading level="h4" style={styles.focusTitle}>{prayer.title}</Heading>
        <BodyText variant="body" style={styles.focusText}>{prayer.body}</BodyText>
      </View>

      <View style={styles.focusActions}>
        <Pressable onPress={onPray} style={styles.focusAction} accessibilityLabel="Start prayer timer">
          <View style={[styles.focusActionIcon, styles.focusActionPrimary]}>
            <Timer size={18} color={colors.community} />
          </View>
          <BodyText variant="caption">Pray</BodyText>
        </Pressable>
        <Pressable onPress={onAmen} style={styles.focusAction} accessibilityLabel="Say amen">
          <View style={[styles.focusActionIcon, prayed && styles.focusActionAmen]}>
            <Heart size={18} color={prayed ? colors.urgent : colors.textMuted} fill={prayed ? colors.urgent : 'transparent'} />
          </View>
          <BodyText variant="caption">{prayed ? 'Amen' : 'Amen'}</BodyText>
        </Pressable>
        <Pressable onPress={onSave} style={styles.focusAction} accessibilityLabel="Save prayer">
          <View style={[styles.focusActionIcon, saved && styles.focusActionSaved]}>
            <Bookmark size={18} color={saved ? colors.gold : colors.textMuted} fill={saved ? colors.gold : 'transparent'} />
          </View>
          <BodyText variant="caption">{saved ? 'Saved' : 'Save'}</BodyText>
        </Pressable>
        <Pressable onPress={onMore} style={styles.focusAction} accessibilityLabel="More options">
          <View style={styles.focusActionIcon}>
            <MoreHorizontal size={18} color={colors.textMuted} />
          </View>
          <BodyText variant="caption">More</BodyText>
        </Pressable>
      </View>
    </GlassCard>
  );
}

function XPProgressPanel({ summary, onOpenDevotions }) {
  const levelInfo = summary.levelInfo;
  const progressPct = Math.round(Math.min(Math.max(levelInfo.progress || 0, 0), 1) * 100);
  const xpIntoLevel = Number(levelInfo.xpIntoLevel || 0);
  const xpToNextLevel = Number(levelInfo.xpToNextLevel || XP_PER_LEVEL);
  const verse = dailyVerse();

  return (
    <View style={styles.progressStack}>
      <GlassCard style={styles.xpPanel}>
        <View style={styles.xpTopRow}>
          <View style={styles.levelPill}>
            <Sparkles size={13} color={colors.gold} />
            <BodyText variant="caption" style={styles.levelPillText}>
              Level {levelInfo.level} - {summary.journey.title}
            </BodyText>
          </View>
          <BodyText variant="caption" style={styles.xpLabel}>
            {formatXP(xpIntoLevel)} / {formatXP(XP_PER_LEVEL)} XP
          </BodyText>
        </View>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${progressPct}%` }]} />
        </View>
        <View style={styles.xpMetaRow}>
          <BodyText variant="caption">{formatXP(xpToNextLevel)} XP to Level {levelInfo.level + 1}</BodyText>
          <BodyText variant="caption" style={styles.todayXp}>+{formatXP(summary.todayXP)} today</BodyText>
        </View>
      </GlassCard>

      <Pressable onPress={onOpenDevotions} accessibilityRole="button" accessibilityLabel="Open devotions">
        <LinearGradient colors={[colors.navyMid, colors.navyDeep]} style={styles.verseCard}>
          <View style={styles.verseLabelRow}>
            <BookOpen size={13} color={colors.goldLight} />
            <BodyText variant="caption" style={styles.verseLabel}>Today's Verse</BodyText>
          </View>
          <Heading level="h4" style={styles.verseText}>{verse.text}</Heading>
          <BodyText variant="caption" style={styles.verseRef}>{verse.ref}</BodyText>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

export default function HomeScreen({ onOpenPrayer, go }) {
  const feedback = useAppFeedback();
  const uid = auth.currentUser?.uid;
  const { prayers, loading: prayersLoading, error: prayersError, retry: retryPrayers } = usePrayers(true);
  const { blockedUids, loading: blocksLoading, error: blocksError, refresh: retryBlocks } = useBlocks(true);
  const {
    summary: gamified,
    retry: retryStats,
  } = useGamification(uid, Boolean(uid));

  const [currentFeedIndex, setCurrentFeedIndex] = useState(0);
  const [savedPrayerIds, setSavedPrayerIds] = useState(() => new Set());
  const [prayedPrayerIds, setPrayedPrayerIds] = useState(() => new Set());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTitle, setComposeTitle] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeBusy, setComposeBusy] = useState(false);

  const visiblePrayers = useMemo(
    () => (blocksLoading ? [] : filterBlockedItems(prayers, blockedUids)),
    [prayers, blockedUids, blocksLoading],
  );
  const currentPrayer = visiblePrayers[clampIndex(currentFeedIndex, visiblePrayers.length)];
  const searchResults = useMemo(
    () => visiblePrayers
      .map((prayer, index) => ({ prayer, index }))
      .filter(({ prayer }) => prayerMatchesQuery(prayer, searchQuery)),
    [searchQuery, visiblePrayers],
  );

  const listLoading = prayersLoading || blocksLoading;
  const listError = prayersError || blocksError;
  const retry = () => {
    retryPrayers();
    retryBlocks();
    retryStats();
  };

  const earnedBadges = useMemo(
    () => gamified.badges.filter((badge) => badge.state === 'earned').length,
    [gamified.badges],
  );

  const goToPrayerIndex = (nextIndex) => {
    if (!visiblePrayers.length) return;
    const clamped = clampIndex(nextIndex, visiblePrayers.length);
    if (clamped === currentFeedIndex && nextIndex !== clamped) {
      feedback.showToast({ message: nextIndex < 0 ? 'This is the first prayer' : "You've reached the end" });
    }
    setCurrentFeedIndex(clamped);
  };

  const feedIndexRef = useRef(currentFeedIndex);
  feedIndexRef.current = currentFeedIndex;
  const goToPrayerIndexRef = useRef(goToPrayerIndex);
  goToPrayerIndexRef.current = goToPrayerIndex;

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) > 24,
    onPanResponderRelease: (_event, gesture) => {
      if (gesture.dx < -40) goToPrayerIndexRef.current(feedIndexRef.current + 1);
      if (gesture.dx > 40) goToPrayerIndexRef.current(feedIndexRef.current - 1);
    },
  })).current;

  useEffect(() => {
    if (currentFeedIndex >= visiblePrayers.length && visiblePrayers.length > 0) {
      setCurrentFeedIndex(visiblePrayers.length - 1);
    }
  }, [visiblePrayers.length, currentFeedIndex]);

  const handleAmen = async (prayer) => {
    if (!prayer?.id || prayedPrayerIds.has(prayer.id)) return;
    try {
      const result = await prayForRequest(prayer.id);
      setPrayedPrayerIds((prev) => {
        const next = new Set(prev);
        next.add(prayer.id);
        return next;
      });
      feedback.showXp(result.xp, result.duplicate ? 'Already prayed for this request' : 'Amen recorded');
      if (!result.duplicate) retryStats();
    } catch (error) {
      Alert.alert('Prayer not saved', getErrorMessage(error));
    }
  };

  const handleSave = async (prayer) => {
    if (!prayer?.id) return;
    try {
      const result = await bookmarkPrayer(prayer.id);
      setSavedPrayerIds((prev) => {
        const next = new Set(prev);
        next.add(prayer.id);
        return next;
      });
      feedback.showXp(result.xp, result.duplicate ? 'Prayer already saved' : 'Prayer saved');
    } catch (error) {
      Alert.alert('Could not save prayer', getErrorMessage(error));
    }
  };

  const submitComposePrayer = async () => {
    if (!composeTitle.trim() || !composeBody.trim() || composeBusy) return;
    setComposeBusy(true);
    try {
      await addPrayer({
        title: composeTitle.trim(),
        body: composeBody.trim(),
        privacy: 'community',
        prayerLimit: 'daily',
        urgent: false,
        allowShare: true,
      }, auth.currentUser);
      setComposeOpen(false);
      setComposeTitle('');
      setComposeBody('');
      feedback.showToast({ message: 'Prayer shared' });
      retryPrayers();
    } catch (error) {
      Alert.alert('Could not share prayer', getErrorMessage(error));
    } finally {
      setComposeBusy(false);
    }
  };

  return (
    <ScreenScaffold pageContent>
      <View style={styles.topBar}>
        <View>
          <BodyText variant="caption" style={styles.greeting}>{greeting()}</BodyText>
          <Heading level="h2" style={styles.headline}>Who can you carry in prayer today?</Heading>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => setSearchOpen(true)} style={styles.headerIconBtn} accessibilityLabel="Search prayers">
            <Search size={19} color={colors.navy} />
          </Pressable>
          <Pressable onPress={() => setComposeOpen(true)} style={styles.headerIconBtn} accessibilityLabel="Share a prayer">
            <SendHorizontal size={19} color={colors.navy} />
          </Pressable>
          <Pressable onPress={() => go('achievements')} style={styles.headerIconBtn} accessibilityRole="button" accessibilityLabel="Badges">
            <Trophy size={19} color={colors.navy} />
          </Pressable>
          <Pressable onPress={() => go('notifications')} style={styles.headerIconBtn} accessibilityRole="button" accessibilityLabel="Notifications">
            <Bell size={20} color={colors.navy} />
          </Pressable>
        </View>
      </View>

      <AsyncState loading={listLoading} error={listError} onRetry={retry}>
        <XPProgressPanel summary={gamified} onOpenDevotions={() => go('devotions')} />

        <GlassCard style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <View style={styles.streakCopy}>
              <Heading level="eyebrow">Current Streak</Heading>
              <View style={styles.streakValueRow}>
                <Flame size={22} color={colors.coral} />
                <Heading level="stat" style={styles.streakValue}>{gamified.streak}</Heading>
                <BodyText variant="label">days</BodyText>
              </View>
            </View>
            <ProgressRing progress={gamified.dailyGoalProgress} size={88} strokeWidth={7} accent={colors.gold}>
              <View style={styles.ringCenter}>
                <Target size={18} color={colors.gold} />
                <Heading level="h4" style={styles.ringValue}>
                  {gamified.dailyPrayCount}/{DAILY_PRAY_GOAL}
                </Heading>
              </View>
            </ProgressRing>
          </View>
          <BodyText variant="caption" style={styles.goalCaption}>Today&apos;s prayer goal</BodyText>
          <StreakCalendar
            streak={gamified.streak}
            currentDayIndex={gamified.currentDayIndex}
            activeDayIndexes={gamified.activeDayIndexes}
          />
        </GlassCard>

        <View style={styles.inlineStats}>
          <GlassCard style={styles.inlineStatCard}>
            <Zap size={18} color={colors.gold} />
            <Heading level="h4" style={styles.inlineStatValue}>+{gamified.todayXP} XP</Heading>
            <BodyText variant="caption">Today</BodyText>
          </GlassCard>
          <GlassCard style={styles.inlineStatCard}>
            <Award size={18} color={colors.violet} />
            <Heading level="h4" style={styles.inlineStatValue}>Level {gamified.levelInfo.level}</Heading>
            <BodyText variant="caption">{earnedBadges} badges earned</BodyText>
          </GlassCard>
        </View>

        <Pressable onPress={() => go('achievements')}>
          <GlassCard style={styles.journeyCard}>
            <View style={styles.journeyRow}>
              <View style={styles.journeyIcon}>
                <Map size={22} color={colors.community} />
              </View>
              <View style={styles.journeyCopy}>
                <Heading level="eyebrow">Prayer Journey</Heading>
                <Heading level="h4">{gamified.journey.title}</Heading>
                <BodyText variant="small">{gamified.journey.subtitle}</BodyText>
                <View style={styles.levelBar}>
                  <View style={[styles.levelFill, { width: `${Math.round(gamified.levelInfo.progress * 100)}%` }]} />
                </View>
                <BodyText variant="caption">
                  {gamified.levelInfo.xpIntoLevel}/500 XP to next level
                </BodyText>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </View>
          </GlassCard>
        </Pressable>

        <Pressable onPress={() => go('dailyChallenge')}>
          <GlassCard style={styles.challengeCard}>
            <View style={styles.challengeRow}>
              <View style={styles.challengeIcon}>
                <Sparkles size={20} color={colors.gold} />
              </View>
              <View style={styles.challengeCopy}>
                <Heading level="eyebrow">Daily Challenge</Heading>
                <Heading level="h4">Pray for 5 People</Heading>
                <BodyText variant="small">
                  {gamified.dailyChallengeComplete
                    ? 'Completed today'
                    : `${gamified.dailyPrayCount}/${gamified.dailyChallengeGoal} carried so far`}
                </BodyText>
              </View>
              <BodyText variant="caption" style={styles.challengeXp}>+{XP_AWARDS.dailyChallenge} XP</BodyText>
            </View>
          </GlassCard>
        </Pressable>

        {currentPrayer ? (
          <View style={styles.feedViewport} {...panResponder.panHandlers}>
            <PrayerFocusCard
              prayer={currentPrayer}
              saved={savedPrayerIds.has(currentPrayer.id)}
              prayed={prayedPrayerIds.has(currentPrayer.id)}
              onPray={() => go('prayerStopwatch', { prayerId: currentPrayer.id, title: currentPrayer.title })}
              onAmen={() => handleAmen(currentPrayer)}
              onSave={() => handleSave(currentPrayer)}
              onMore={() => onOpenPrayer(currentPrayer)}
            />
            <View style={styles.feedNavRow}>
              <Pressable
                onPress={() => goToPrayerIndex(currentFeedIndex - 1)}
                style={styles.feedNavBtn}
                accessibilityLabel="Previous prayer"
              >
                <ChevronLeft size={22} color={colors.navy} />
              </Pressable>
              <ProgressDots
                count={visiblePrayers.length}
                activeIndex={currentFeedIndex}
                onSelect={setCurrentFeedIndex}
              />
              <Pressable
                onPress={() => goToPrayerIndex(currentFeedIndex + 1)}
                style={styles.feedNavBtn}
                accessibilityLabel="Next prayer"
              >
                <ChevronRight size={22} color={colors.navy} />
              </Pressable>
            </View>
          </View>
        ) : (
          <GlassCard style={styles.emptyFeedCard}>
            <BodyText variant="small">No prayer requests available right now.</BodyText>
          </GlassCard>
        )}
      </AsyncState>

      {searchOpen ? (
        <View style={styles.searchOverlay}>
          <View style={styles.searchHeader}>
            <Pressable onPress={() => { setSearchOpen(false); setSearchQuery(''); }} style={styles.searchCloseBtn}>
              <X size={20} color={colors.navy} />
            </Pressable>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search prayers..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              autoFocus
            />
          </View>
          {searchQuery.trim() ? searchResults.map(({ prayer, index }) => (
            <Pressable
              key={prayer.id}
              onPress={() => {
                setCurrentFeedIndex(index);
                setSearchOpen(false);
                setSearchQuery('');
              }}
              style={styles.searchResult}
            >
              <Text style={styles.searchResultTitle}>{prayer.title}</Text>
              <BodyText variant="caption" numberOfLines={1}>{prayer.body}</BodyText>
            </Pressable>
          )) : (
            <BodyText variant="small" style={styles.searchHint}>Search by name, request, category, or verse</BodyText>
          )}
        </View>
      ) : null}

      {composeOpen ? (
        <View style={styles.composeOverlay}>
          <View style={styles.composeSheet}>
            <View style={styles.composeHeader}>
              <Heading level="h4">Share a Prayer</Heading>
              <Pressable onPress={() => setComposeOpen(false)} style={styles.searchCloseBtn}>
                <X size={20} color={colors.navy} />
              </Pressable>
            </View>
            <TextInput
              value={composeTitle}
              onChangeText={setComposeTitle}
              placeholder="Title"
              placeholderTextColor={colors.textMuted}
              style={styles.composeInput}
              maxLength={120}
            />
            <TextInput
              value={composeBody}
              onChangeText={(text) => setComposeBody(text.slice(0, PRAYER_DETAILS_LIMIT))}
              placeholder="What would you like prayer for?"
              placeholderTextColor={colors.textMuted}
              style={[styles.composeInput, styles.composeBodyInput]}
              multiline
              maxLength={PRAYER_DETAILS_LIMIT}
            />
            <BodyText variant="caption" style={styles.composeCounter}>
              {composeBody.length}/{PRAYER_DETAILS_LIMIT}
            </BodyText>
            <PrimaryButton
              label={composeBusy ? 'Sharing...' : 'Share Prayer'}
              onPress={submitComposePrayer}
              busy={composeBusy}
              disabled={!composeTitle.trim() || !composeBody.trim()}
            />
          </View>
        </View>
      ) : null}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.lg, paddingTop: spacing.sm },
  greeting: { color: colors.gold, marginBottom: spacing.xs, fontFamily: fonts.sansSemiBold, letterSpacing: 1 },
  headline: { fontSize: 26, lineHeight: 32, maxWidth: 280 },
  headerActions: { flexDirection: 'row', gap: spacing.xs },
  headerIconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha.navy08 },
  progressStack: { gap: spacing.md, marginBottom: spacing.lg },
  xpPanel: { padding: spacing.lg },
  xpTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  levelPill: {
    flex: 1,
    minHeight: 30,
    borderRadius: radii.pill,
    backgroundColor: alpha.gold18,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  levelPillText: { flex: 1, color: colors.navy, fontFamily: fonts.sansSemiBold },
  xpLabel: { color: colors.textSecondary, fontFamily: fonts.sansSemiBold },
  xpTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: alpha.navy10,
    marginTop: spacing.md,
  },
  xpFill: { height: 8, borderRadius: 4, backgroundColor: colors.gold },
  xpMetaRow: { marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  todayXp: { color: colors.gold, fontFamily: fonts.sansSemiBold },
  verseCard: {
    minHeight: 150,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  verseLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  verseLabel: { color: colors.goldLight, fontFamily: fonts.sansExtraBold, letterSpacing: 1.6, textTransform: 'uppercase' },
  verseText: { color: colors.white, fontSize: 19, lineHeight: 28 },
  verseRef: { marginTop: spacing.md, color: colors.emerald, fontFamily: fonts.sansSemiBold },
  streakCard: { marginBottom: spacing.lg },
  streakHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg, marginBottom: spacing.sm },
  streakCopy: { flex: 1 },
  streakValueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  streakValue: { fontSize: 34, lineHeight: 38 },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringValue: { marginTop: 2, fontSize: 15 },
  goalCaption: { marginBottom: spacing.md, color: colors.textMuted },
  inlineStats: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  inlineStatCard: { flex: 1, alignItems: 'flex-start', gap: spacing.xs },
  inlineStatValue: { fontSize: 22, lineHeight: 28 },
  journeyCard: { marginBottom: spacing.lg },
  journeyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  journeyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.navy08,
  },
  journeyCopy: { flex: 1 },
  levelBar: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    height: 6,
    borderRadius: 3,
    backgroundColor: alpha.navy10,
    overflow: 'hidden',
  },
  levelFill: { height: 6, borderRadius: 3, backgroundColor: colors.community },
  challengeCard: { marginBottom: spacing.lg },
  challengeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  challengeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
  },
  challengeCopy: { flex: 1 },
  challengeXp: { color: colors.gold, fontFamily: fonts.sansSemiBold },
  feedViewport: { marginBottom: spacing.lg },
  focusCard: { minHeight: 320 },
  focusHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  focusAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.navy08,
  },
  focusAvatarText: { fontFamily: fonts.sansExtraBold, fontSize: 16, color: colors.navy },
  focusMeta: { flex: 1 },
  urgentLabel: { color: colors.urgent, marginTop: 2 },
  focusBody: { flex: 1, marginBottom: spacing.lg },
  focusQuote: { fontSize: 32, lineHeight: 32, color: alpha.gold30, fontFamily: fonts.display },
  focusTitle: { fontSize: 20, lineHeight: 26, marginBottom: spacing.sm },
  focusText: { lineHeight: 23 },
  focusActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  focusAction: { alignItems: 'center', gap: spacing.xs },
  focusActionIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.navy06,
  },
  focusActionPrimary: { backgroundColor: alpha.navy08 },
  focusActionAmen: { backgroundColor: 'rgba(239,68,68,0.12)' },
  focusActionSaved: { backgroundColor: alpha.gold18 },
  feedNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  feedNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.navy08,
  },
  progressDots: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1, justifyContent: 'center' },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: alpha.navy12 },
  progressDotActive: { width: 20, backgroundColor: colors.gold },
  emptyFeedCard: { marginBottom: spacing.lg, alignItems: 'center', paddingVertical: spacing.xxl },
  searchOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: colors.screen,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  searchHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  searchCloseBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha.navy08 },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textPrimary,
  },
  searchResult: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchResultTitle: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.xs },
  searchHint: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl },
  composeOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 60,
    backgroundColor: alpha.overlay,
    justifyContent: 'flex-end',
  },
  composeSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.tabBar,
    ...shadow.card,
  },
  composeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  composeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  composeBodyInput: { minHeight: 120, textAlignVertical: 'top' },
  composeCounter: { textAlign: 'right', marginBottom: spacing.md },
});
