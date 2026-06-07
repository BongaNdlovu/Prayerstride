import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, PanResponder, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  Bookmark,
  BookOpen,
  ArrowDown,
  ArrowUp,
  Heart,
  MoreHorizontal,
  PenLine,
  Search,
  SendHorizontal,
  Sparkles,
  Timer,
  Footprints,
  X,
} from 'lucide-react-native';
import { alpha, colors, fonts, radii, shadow, spacing } from '../theme';
import { XP_PER_LEVEL } from '../gamification';
import { auth } from '../firebase';
import { bookmarkPrayer } from '../api';
import { addPrayer, deletePrayer, markAnswered, usePrayers } from '../usePrayerData';
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
import SegmentedControl from '../components/SegmentedControl';

const PRAYER_CATEGORIES = ['Healing', 'Family', 'Strength', 'Provision', 'Guidance', 'Gratitude'];
const SWIPE_DISTANCE_THRESHOLD = 36;
const SWIPE_VELOCITY_THRESHOLD = 0.28;

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

function dailyVerse() {
  const day = Math.floor(Date.now() / 86400000);
  return DAILY_VERSES[day % DAILY_VERSES.length];
}

function formatXP(value) {
  return Math.max(0, Number(value) || 0).toLocaleString();
}

function isIntentionalVerticalSwipe(gesture) {
  return Math.abs(gesture.dy) > 12 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.35;
}

function swipeDirection(gesture) {
  if (gesture.dy <= -SWIPE_DISTANCE_THRESHOLD || gesture.vy <= -SWIPE_VELOCITY_THRESHOLD) return 1;
  if (gesture.dy >= SWIPE_DISTANCE_THRESHOLD || gesture.vy >= SWIPE_VELOCITY_THRESHOLD) return -1;
  return 0;
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

function PrayerFocusCard({ prayer, saved, prayed, canUpdate, onPray, onAmen, onSave, onMore, onUpdate, onDelete }) {
  const initial = prayer.authorName?.slice(0, 1)?.toUpperCase() || 'P';
  return (
    <View style={styles.focusCard}>
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
        <Text style={styles.focusQuote}>{'"'}</Text>
        {prayer.status === 'answered' ? (
          <View style={styles.answeredBadge}>
            <BodyText variant="caption" style={styles.answeredText}>Prayer Answered</BodyText>
          </View>
        ) : null}
        <BodyText variant="body" style={styles.focusText}>{prayer.body}</BodyText>
        {prayer.scriptureRef || prayer.category ? (
          <BodyText variant="caption" style={styles.focusVerse}>
            {prayer.scriptureRef || prayer.category}
          </BodyText>
        ) : null}
      </View>

      <View style={styles.focusActions}>
        <Pressable onPress={onPray} style={styles.focusAction} accessibilityLabel="Start prayer timer">
          <View style={[styles.focusActionIcon, styles.focusActionPrimary]}>
            <Timer size={18} color={colors.teal} />
          </View>
          <BodyText variant="caption">Pray</BodyText>
        </Pressable>
        <Pressable
          onPress={onAmen}
          disabled={prayed}
          style={[styles.focusAction, prayed && styles.focusActionLocked]}
          accessibilityLabel={prayed ? 'Prayer already completed' : 'Complete a timed prayer first'}
        >
          <View style={[styles.focusActionIcon, prayed && styles.focusActionAmen]}>
            <Heart size={18} color={prayed ? colors.redSoft : colors.ink3} fill={prayed ? colors.redSoft : 'transparent'} />
          </View>
          <BodyText variant="caption">{prayed ? 'Prayed' : 'Locked'}</BodyText>
        </Pressable>
        <Pressable onPress={onSave} style={styles.focusAction} accessibilityLabel="Save prayer">
          <View style={[styles.focusActionIcon, saved && styles.focusActionSaved]}>
            <Bookmark size={18} color={saved ? colors.gold : colors.ink3} fill={saved ? colors.gold : 'transparent'} />
          </View>
          <BodyText variant="caption">{saved ? 'Saved' : 'Save'}</BodyText>
        </Pressable>
        {canUpdate ? (
          <Pressable onPress={onUpdate} style={styles.focusAction} accessibilityLabel="Mark prayer answered">
            <View style={styles.focusActionIcon}>
              <PenLine size={18} color={colors.ink3} />
            </View>
            <BodyText variant="caption">Answered</BodyText>
          </Pressable>
        ) : (
        <Pressable onPress={onMore} style={styles.focusAction} accessibilityLabel="More options">
          <View style={styles.focusActionIcon}>
            <MoreHorizontal size={18} color={colors.ink3} />
          </View>
          <BodyText variant="caption">More</BodyText>
        </Pressable>
        )}
        {canUpdate ? (
          <Pressable onPress={onDelete} style={styles.focusAction} accessibilityLabel="Delete prayer request">
            <View style={styles.focusActionIcon}>
              <X size={18} color={colors.redSoft} />
            </View>
            <BodyText variant="caption">Delete</BodyText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function XPProgressPanel({ summary, onAchievements }) {
  const levelInfo = summary.levelInfo;
  const progressPct = Math.round(Math.min(Math.max(levelInfo.progress || 0, 0), 1) * 100);
  const xpIntoLevel = Number(levelInfo.xpIntoLevel || 0);

  return (
    <View style={styles.progressStack}>
      <View style={styles.xpBarWrap}>
        <View style={styles.xpBarRow}>
          <View style={styles.levelBadge}>
            <Sparkles size={10} color={colors.ink} />
            <BodyText variant="caption" style={styles.levelBadgeText}>
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
        <Pressable
          onPress={onAchievements}
          style={styles.achievementsLink}
          accessibilityRole="button"
          accessibilityLabel="Open achievements"
        >
          <Sparkles size={13} color={colors.gold} />
          <BodyText variant="caption" style={styles.achievementsLinkText}>
            Achievements
          </BodyText>
        </Pressable>
      </View>
    </View>
  );
}

function DailyVerseCard() {
  const verse = dailyVerse();
  return (
      <LinearGradient colors={[colors.night2, colors.night]} style={styles.verseCard}>
        <View style={styles.verseLabelRow}>
          <BookOpen size={13} color={colors.goldLight} />
          <BodyText variant="caption" style={styles.verseLabel}>Today's Verse</BodyText>
        </View>
        <Heading level="h4" style={styles.verseText}>{verse.text}</Heading>
        <BodyText variant="caption" style={styles.verseRef}>{verse.ref}</BodyText>
      </LinearGradient>
  );
}

export default function HomeScreen({ user, onOpenPrayer, go }) {
  const feedback = useAppFeedback();
  const currentUser = auth.currentUser || user;
  const uid = currentUser?.uid;
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
  const [composeBody, setComposeBody] = useState('');
  const [composeCategory, setComposeCategory] = useState('Guidance');
  const [composeScriptureRef, setComposeScriptureRef] = useState('');
  const [composeBusy, setComposeBusy] = useState(false);
  const [updatePrayer, setUpdatePrayer] = useState(null);
  const [updateBody, setUpdateBody] = useState('');
  const [updateBusy, setUpdateBusy] = useState(false);

  useEffect(() => {
    if (!Array.isArray(gamified.prayedTodayIds)) return;
    setPrayedPrayerIds(new Set(gamified.prayedTodayIds));
  }, [gamified.prayedTodayIds]);

  const visiblePrayers = useMemo(
    () => (blocksLoading ? [] : filterBlockedItems(prayers, blockedUids)),
    [prayers, blockedUids, blocksLoading],
  );
  const currentPrayer = visiblePrayers[clampIndex(currentFeedIndex, visiblePrayers.length)];
  const userInitial = (user?.displayName || user?.email || 'P').slice(0, 1).toUpperCase();
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
    onMoveShouldSetPanResponderCapture: (_event, gesture) => isIntentionalVerticalSwipe(gesture),
    onMoveShouldSetPanResponder: (_event, gesture) => isIntentionalVerticalSwipe(gesture),
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_event, gesture) => {
      const direction = swipeDirection(gesture);
      if (direction) goToPrayerIndexRef.current(feedIndexRef.current + direction);
    },
    onPanResponderTerminate: (_event, gesture) => {
      const direction = swipeDirection(gesture);
      if (direction) goToPrayerIndexRef.current(feedIndexRef.current + direction);
    },
    onShouldBlockNativeResponder: () => true,
  })).current;

  useEffect(() => {
    if (currentFeedIndex >= visiblePrayers.length && visiblePrayers.length > 0) {
      setCurrentFeedIndex(visiblePrayers.length - 1);
    }
  }, [visiblePrayers.length, currentFeedIndex]);

  const handleAmen = async (prayer) => {
    if (!prayer?.id || prayedPrayerIds.has(prayer.id)) return;
    feedback.showToast({ message: 'Use the prayer timer to complete and lock this request.' });
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
    if (!composeBody.trim() || composeBusy) return;
    setComposeBusy(true);
    try {
      await addPrayer({
        body: composeBody.trim(),
        category: composeCategory,
        scriptureRef: composeScriptureRef,
        privacy: 'community',
        prayerLimit: 'daily',
        urgent: false,
        allowShare: true,
      }, currentUser);
      setComposeOpen(false);
      setComposeBody('');
      setComposeCategory('Guidance');
      setComposeScriptureRef('');
      feedback.showToast({ message: 'Prayer shared' });
      retryPrayers();
    } catch (error) {
      Alert.alert('Could not share prayer', getErrorMessage(error));
    } finally {
      setComposeBusy(false);
    }
  };

  const submitUpdate = async () => {
    if (!updatePrayer?.id || !updateBody.trim() || updateBusy) return;
    setUpdateBusy(true);
    try {
      await markAnswered(updatePrayer.id);
      setUpdatePrayer(null);
      setUpdateBody('');
      feedback.celebrate();
      feedback.showToast({ message: 'Prayer marked answered' });
      retryPrayers();
      retryStats();
    } catch (error) {
      Alert.alert('Could not share update', getErrorMessage(error));
    } finally {
      setUpdateBusy(false);
    }
  };

  const handleDeletePrayer = (prayer) => {
    if (!prayer?.id || prayer.authorUid !== uid) return;
    Alert.alert('Delete Prayer Request', 'This cannot be undone. Delete this prayer request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePrayer(prayer.id);
            feedback.showToast({ message: 'Prayer request deleted' });
            retryPrayers();
            retryStats();
          } catch (error) {
            Alert.alert('Could not delete prayer', getErrorMessage(error));
          }
        },
      },
    ]);
  };

  return (
    <ScreenScaffold pageContent>
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Footprints size={16} color={colors.white} />
          </View>
          <Heading level="h3" style={styles.brandName}>PrayerStride</Heading>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => setSearchOpen(true)} style={styles.headerIconBtn} accessibilityLabel="Search prayers">
            <Search size={19} color={colors.ink} />
          </Pressable>
          <Pressable onPress={() => setComposeOpen(true)} style={styles.headerIconBtn} accessibilityLabel="Share a prayer">
            <SendHorizontal size={19} color={colors.ink} />
          </Pressable>
          <Pressable onPress={() => go('notifications')} style={styles.headerIconBtn} accessibilityRole="button" accessibilityLabel="Notifications">
            <Bell size={20} color={colors.ink} />
            <View style={styles.notifDot} />
          </Pressable>
          <Pressable onPress={() => go('profile')} style={styles.avatarRing} accessibilityRole="button" accessibilityLabel="Profile">
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>{userInitial}</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <AsyncState loading={listLoading} error={listError} onRetry={retry}>
        <XPProgressPanel summary={gamified} onAchievements={() => go('achievements')} />

        {currentPrayer ? (
          <View style={styles.feedViewport} {...panResponder.panHandlers}>
            <PrayerFocusCard
              prayer={currentPrayer}
              saved={savedPrayerIds.has(currentPrayer.id)}
              prayed={prayedPrayerIds.has(currentPrayer.id)}
              canUpdate={currentPrayer.authorUid === uid}
              onPray={() => go('timer', { prayerId: currentPrayer.id, title: currentPrayer.title, prayer: currentPrayer })}
              onAmen={() => handleAmen(currentPrayer)}
              onSave={() => handleSave(currentPrayer)}
              onMore={() => onOpenPrayer(currentPrayer)}
              onUpdate={() => {
                setUpdatePrayer(currentPrayer);
                setUpdateBody('');
              }}
              onDelete={() => handleDeletePrayer(currentPrayer)}
            />
            <View style={styles.feedNavRow}>
              <Pressable
                onPress={() => goToPrayerIndex(currentFeedIndex - 1)}
                style={styles.feedNavBtn}
                accessibilityLabel="Previous prayer"
              >
                <ArrowUp size={18} color={colors.ink} />
                <BodyText variant="caption" style={styles.feedNavText}>Prev</BodyText>
              </Pressable>
              <View style={styles.feedProgressWrap}>
                <ProgressDots
                  count={visiblePrayers.length}
                  activeIndex={currentFeedIndex}
                  onSelect={setCurrentFeedIndex}
                />
                <BodyText variant="caption" style={styles.swipeHint}>Swipe up / down</BodyText>
              </View>
              <Pressable
                onPress={() => goToPrayerIndex(currentFeedIndex + 1)}
                style={styles.feedNavBtn}
                accessibilityLabel="Next prayer"
              >
                <BodyText variant="caption" style={styles.feedNavText}>Next</BodyText>
                <ArrowDown size={18} color={colors.ink} />
              </Pressable>
            </View>
            <DailyVerseCard />
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
              <X size={20} color={colors.ink} />
            </Pressable>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search prayers..."
              placeholderTextColor={colors.ink3}
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
                <X size={20} color={colors.ink} />
              </Pressable>
            </View>
            <TextInput
              value={composeBody}
              onChangeText={(text) => setComposeBody(text.slice(0, PRAYER_DETAILS_LIMIT))}
              placeholder="What would you like prayer for?"
              placeholderTextColor={colors.ink3}
              style={[styles.composeInput, styles.composeBodyInput]}
              multiline
              maxLength={PRAYER_DETAILS_LIMIT}
            />
            <BodyText variant="caption" style={styles.composeCounter}>
              {composeBody.length}/{PRAYER_DETAILS_LIMIT}
            </BodyText>
            <BodyText variant="label" style={styles.composeLabel}>Category</BodyText>
            <SegmentedControl
              options={PRAYER_CATEGORIES.map((value) => ({ value, label: value }))}
              value={composeCategory}
              onChange={setComposeCategory}
              style={styles.composeSegments}
              segmentStyle={styles.composeSegment}
              labelStyle={styles.composeSegmentLabel}
            />
            <TextInput
              value={composeScriptureRef}
              onChangeText={setComposeScriptureRef}
              placeholder="Scripture Reference (optional)"
              placeholderTextColor={colors.ink3}
              style={styles.composeInput}
              maxLength={120}
            />
            <PrimaryButton
              label={composeBusy ? 'Sharing...' : 'Share Prayer'}
              onPress={submitComposePrayer}
              busy={composeBusy}
              disabled={!composeBody.trim()}
            />
          </View>
        </View>
      ) : null}

      {updatePrayer ? (
        <View style={styles.composeOverlay}>
          <View style={styles.composeSheet}>
            <View style={styles.composeHeader}>
              <Heading level="h4">Add Prayer Update</Heading>
              <Pressable onPress={() => setUpdatePrayer(null)} style={styles.searchCloseBtn}>
                <X size={20} color={colors.ink} />
              </Pressable>
            </View>
            <TextInput
              value={updateBody}
              onChangeText={(text) => setUpdateBody(text.slice(0, 280))}
              placeholder="Share a short answered-prayer note..."
              placeholderTextColor={colors.ink3}
              style={[styles.composeInput, styles.composeBodyInput]}
              multiline
              maxLength={280}
            />
            <BodyText variant="caption" style={styles.composeCounter}>
              {updateBody.length}/280
            </BodyText>
            <PrimaryButton
              label={updateBusy ? 'Sharing...' : 'Share Update'}
              onPress={submitUpdate}
              busy={updateBusy}
              disabled={!updateBody.trim()}
            />
          </View>
        </View>
      ) : null}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    ...shadow.gold,
  },
  brandName: {
    fontSize: 20,
    lineHeight: 25,
    color: colors.ink,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.redSoft,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    padding: 2,
    backgroundColor: colors.gold,
  },
  headerAvatar: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  headerAvatarText: { color: colors.gold, fontFamily: fonts.sansExtraBold, fontSize: 13 },
  progressStack: { gap: spacing.sm, marginBottom: spacing.lg },
  xpBarWrap: {
    paddingHorizontal: 0,
    gap: 4,
  },
  xpBarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.gold,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  levelBadgeText: { color: colors.ink, fontFamily: fonts.sansExtraBold, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase' },
  xpLabel: { color: colors.ink3 },
  xpTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: colors.surface3,
    marginTop: spacing.xs,
  },
  xpFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.goldLight,
  },
  xpMetaRow: { marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  todayXp: { color: colors.gold, fontFamily: fonts.sansSemiBold },
  achievementsLink: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: 4,
  },
  achievementsLinkText: { color: colors.gold, fontFamily: fonts.sansSemiBold },
  verseCard: {
    minHeight: 96,
    borderRadius: radii.md,
    padding: spacing.lg,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  verseLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  verseLabel: { color: colors.goldLight, fontFamily: fonts.sansExtraBold, letterSpacing: 1.2, textTransform: 'uppercase' },
  verseText: { color: colors.white, fontSize: 15, lineHeight: 21 },
  verseRef: { marginTop: spacing.sm, color: colors.tealLight, fontFamily: fonts.sansSemiBold },
  streakCard: { marginBottom: spacing.lg },
  streakHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg, marginBottom: spacing.sm },
  streakCopy: { flex: 1 },
  streakValueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  streakValue: { fontSize: 34, lineHeight: 38 },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringValue: { marginTop: 2, fontSize: 15 },
  goalCaption: { marginBottom: spacing.md, color: colors.ink3 },
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
    backgroundColor: alpha.ink08,
  },
  journeyCopy: { flex: 1 },
  levelBar: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    height: 6,
    borderRadius: 3,
    backgroundColor: alpha.ink10,
    overflow: 'hidden',
  },
  levelFill: { height: 6, borderRadius: 3, backgroundColor: colors.teal },
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
  focusCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    minHeight: 340,
    ...shadow.card,
  },
  focusHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  focusAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.ink08,
  },
  focusAvatarText: { fontFamily: fonts.sansExtraBold, fontSize: 16, color: colors.ink },
  focusMeta: { flex: 1 },
  urgentLabel: { color: colors.redSoft, marginTop: 2 },
  focusBody: { flex: 1, marginBottom: spacing.lg },
  focusQuote: { fontSize: 32, lineHeight: 32, color: colors.goldLight, fontFamily: fonts.display, opacity: 0.6 },
  focusTitle: { fontSize: 20, lineHeight: 26, marginBottom: spacing.sm },
  focusText: { lineHeight: 23 },
  focusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  focusActionLocked: { opacity: 0.72 },
  focusAction: { alignItems: 'center', gap: spacing.xs },
  focusActionIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.ink06,
  },
  focusActionPrimary: { backgroundColor: colors.tealPale, color: colors.teal },
  focusActionAmen: { backgroundColor: 'rgba(220,79,79,0.12)' },
  focusActionSaved: { backgroundColor: colors.goldPale },
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
    backgroundColor: alpha.ink08,
  },
  feedProgressWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  progressDots: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, justifyContent: 'center' },
  swipeHint: { color: colors.ink4, fontSize: 10 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surface3 },
  progressDotActive: { width: 24, borderRadius: 4, backgroundColor: colors.teal },
  emptyFeedCard: { marginBottom: spacing.lg, alignItems: 'center', paddingVertical: spacing.xxl },
  searchOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  searchHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  searchCloseBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha.ink08 },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
  },
  searchResult: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchResultTitle: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.ink, marginBottom: spacing.xs },
  searchHint: { color: colors.ink3, textAlign: 'center', marginTop: spacing.xxl },
  composeOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 60,
    backgroundColor: alpha.overlay,
    justifyContent: 'flex-end',
  },
  composeSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    paddingBottom: spacing.tabBar,
    ...shadow.card,
  },
  composeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  composeLabel: { marginTop: spacing.md, marginBottom: spacing.sm },
  composeSegments: {
    flexWrap: 'wrap',
    marginTop: 0,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  composeSegment: {
    flexBasis: '30%',
    flexGrow: 1,
    minWidth: 88,
    minHeight: 46,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  composeSegmentLabel: {
    fontSize: 12,
    lineHeight: 16,
    flexShrink: 1,
  },
  composeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  composeBodyInput: { minHeight: 120, textAlignVertical: 'top' },
  composeCounter: { textAlign: 'right', marginBottom: spacing.md },
  answeredBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: spacing.md,
  },
  answeredText: { color: '#16A34A', fontFamily: fonts.sansSemiBold, fontSize: 10.5 },
  focusVerse: {
    marginTop: spacing.md,
    color: colors.teal,
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  feedNavText: { color: colors.ink3 },
});
