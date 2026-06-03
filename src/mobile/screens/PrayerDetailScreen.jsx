import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Bookmark,
  Clock,
  MoreHorizontal,
  Users,
} from 'lucide-react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import { bookmarkPrayer, getPrayerBookmark, prayForRequest, unbookmarkPrayer } from '../api';
import { bumpGamificationRefresh } from '../gamificationRefresh';
import { markAnswered } from '../usePrayerData';
import { prayedButtonLabel, prayedStorageKey } from '../prayerLimit';
import { submitReport } from '../useReports';
import { formatFirestoreDate } from '../sessionStats';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';
import MotionPressable from '../components/MotionPressable';
import { warn } from '../logger';
import { getErrorMessage } from '../errors';

function Tag({ label, tone = 'default' }) {
  return (
    <View style={[styles.tag, tone === 'urgent' && styles.tagUrgent, tone === 'community' && styles.tagCommunity]}>
      <Text style={[styles.tagText, tone === 'urgent' && styles.tagTextUrgent, tone === 'community' && styles.tagTextCommunity]}>
        {label}
      </Text>
    </View>
  );
}

function AvatarStack({ count, authorName }) {
  const slots = Math.min(4, Math.max(1, Math.min(count, 4)));
  const initials = ['P', 'A', 'M', 'J'].slice(0, slots);
  if (authorName) initials[0] = authorName.slice(0, 1).toUpperCase();

  return (
    <View style={styles.avatarStack}>
      {initials.map((letter, index) => (
        <View key={`${letter}-${index}`} style={[styles.stackAvatar, { marginLeft: index ? -10 : 0, zIndex: slots - index }]}>
          <Text style={styles.stackAvatarText}>{letter}</Text>
        </View>
      ))}
    </View>
  );
}

export default function PrayerDetailScreen({ prayer, user, onBack, go, onRefresh }) {
  const [prayed, setPrayed] = useState(false);
  const [prayerCountDelta, setPrayerCountDelta] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const prayingRef = useRef(false);

  useEffect(() => {
    if (!prayer?.id) return;

    setPrayed(false);
    setPrayerCountDelta(0);
    setBookmarked(false);
    setShowActions(false);

    const loadPrayedToday = async () => {
      try {
        const limit = prayer.prayerLimit || 'daily';
        const saved = await AsyncStorage.getItem(prayedStorageKey(prayer.id, limit));
        setPrayed(saved === 'true');
        setPrayerCountDelta(0);
      } catch (error) {
        warn('Failed to load prayer status', error);
      }
    };

    const loadBookmark = async () => {
      try {
        const result = await getPrayerBookmark(prayer.id);
        setBookmarked(result.bookmarked === true);
      } catch (error) {
        warn('Failed to load bookmark', error);
      }
    };

    loadBookmark();
    loadPrayedToday();
  }, [prayer?.id, prayer?.prayerLimit]);

  if (!prayer) return null;

  const isOwner = user && prayer.authorUid === user.uid;
  const prayedCount = Number(prayer.prayedCount || 0) + prayerCountDelta;

  const toggleBookmark = async () => {
    try {
      const newValue = !bookmarked;
      if (newValue) await bookmarkPrayer(prayer.id);
      else await unbookmarkPrayer(prayer.id);
      setBookmarked(newValue);
    } catch (error) {
      Alert.alert('Could not save bookmark', getErrorMessage(error));
    }
  };

  const pray = async () => {
    if (isOwner) {
      Alert.alert('Your request', 'You cannot pray for your own prayer request.');
      return;
    }
    if (prayed || prayingRef.current) return;
    prayingRef.current = true;
    setPrayed(true);
    try {
      const result = await prayForRequest(prayer.id);
      const limit = result.prayerLimit || prayer.prayerLimit || 'daily';
      await AsyncStorage.setItem(prayedStorageKey(prayer.id, limit), 'true');
      setPrayerCountDelta(result.duplicate ? 0 : 1);
      if (!result.duplicate) bumpGamificationRefresh();
      if (onRefresh) onRefresh();
    } catch (error) {
      setPrayed(false);
      setPrayerCountDelta(0);
      Alert.alert('Prayer not saved', getErrorMessage(error));
    } finally {
      prayingRef.current = false;
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report Prayer',
      'Why are you reporting this prayer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Inappropriate content', onPress: () => submitReportIfSignedIn('Inappropriate content') },
        { text: 'Spam', onPress: () => submitReportIfSignedIn('Spam') },
        { text: 'Other', onPress: () => submitReportIfSignedIn('User submitted report') },
      ],
    );
  };

  const submitReportIfSignedIn = async (reason) => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to report content.');
      return;
    }
    try {
      await submitReport(prayer.id, 'prayer', reason, user);
      Alert.alert('Report submitted', 'Thank you for helping keep PrayerStride safe.');
    } catch (error) {
      Alert.alert('Could not submit report', getErrorMessage(error));
    }
  };

  const handleMarkAnswered = async () => {
    if (!isOwner) return;
    Alert.alert(
      'Mark as Answered',
      'Has God answered this prayer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, mark answered',
          onPress: async () => {
            try {
              await markAnswered(prayer.id);
              Alert.alert('Prayer marked answered', 'You can now share a testimony.');
              if (go) go('createTestimony', { prayerId: prayer.id });
              if (onRefresh) onRefresh();
            } catch (error) {
              Alert.alert('Could not update', getErrorMessage(error));
            }
          },
        },
      ],
    );
  };

  const handleTimer = () => {
    if (go) go('prayerStopwatch', { prayerId: prayer.id, title: prayer.title });
  };

  const prayLabel = isOwner
    ? 'Your Request'
    : prayedButtonLabel(prayer.prayerLimit || 'daily', prayed);

  return (
    <ScreenScaffold pageContent>
      <AppHeader onBack={onBack} title="Prayer Request" />

      <View style={styles.tagRow}>
        {prayer.urgent ? <Tag label="Urgent" tone="urgent" /> : null}
        {prayer.privacy === 'community' ? <Tag label="Community" tone="community" /> : null}
        {prayer.privacy === 'private' ? <Tag label="Private" /> : null}
      </View>

      <Heading level="h2" style={styles.title}>{prayer.title}</Heading>
      <BodyText variant="small" style={styles.author}>{prayer.authorName}</BodyText>
      <BodyText variant="body" style={styles.body}>{prayer.body}</BodyText>

      <GlassCard style={styles.prayingCard}>
        <View style={styles.prayingRow}>
          <AvatarStack count={prayedCount} authorName={prayer.authorName} />
          <View style={styles.prayingInfo}>
            <View style={styles.prayingTitleRow}>
              <Users size={16} color={colors.gold} />
              <Heading level="h4" style={styles.prayingCount}>{prayedCount} people praying</Heading>
            </View>
            {prayer.createdAt ? (
              <BodyText variant="caption">
                Posted {formatFirestoreDate(prayer.createdAt, 'date unavailable')}
              </BodyText>
            ) : null}
          </View>
        </View>
      </GlassCard>

      <PrimaryButton
        label={prayLabel}
        onPress={pray}
        disabled={prayed || isOwner}
        style={styles.prayBtn}
      />

      <View style={styles.actionsRow}>
        <MotionPressable onPress={toggleBookmark} style={styles.iconButton}>
          <Bookmark size={20} color={bookmarked ? colors.gold : colors.textSecondary} fill={bookmarked ? colors.gold : 'transparent'} />
          <BodyText variant="caption">Save</BodyText>
        </MotionPressable>
        <MotionPressable onPress={handleTimer} style={styles.iconButton}>
          <Clock size={20} color={colors.gold} />
          <BodyText variant="caption">Start Timer</BodyText>
        </MotionPressable>
        <MotionPressable onPress={() => setShowActions(!showActions)} style={styles.iconButton}>
          <MoreHorizontal size={20} color={colors.gold} />
          <BodyText variant="caption">More</BodyText>
        </MotionPressable>
      </View>

      {showActions ? (
        <GlassCard style={styles.moreActions}>
          <Pressable onPress={handleReport} style={styles.moreActionButton}>
            <BodyText variant="label">Report</BodyText>
          </Pressable>
          {isOwner ? (
            <>
              <Pressable onPress={handleMarkAnswered} style={styles.moreActionButton}>
                <BodyText variant="label">Mark Answered</BodyText>
              </Pressable>
              {go ? (
                <Pressable onPress={() => go('editRequest', { prayer })} style={[styles.moreActionButton, styles.moreActionLast]}>
                  <BodyText variant="label">Edit</BodyText>
                </Pressable>
              ) : null}
            </>
          ) : null}
        </GlassCard>
      ) : null}

    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  tag: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: alpha.navy10,
  },
  tagUrgent: { backgroundColor: alpha.navy10, borderWidth: 1, borderColor: colors.urgent },
  tagCommunity: { backgroundColor: alpha.navy10, borderWidth: 1, borderColor: colors.community },
  tagText: { fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.textSecondary },
  tagTextUrgent: { color: colors.urgent },
  tagTextCommunity: { color: colors.community },
  title: { marginTop: spacing.md },
  author: { marginTop: spacing.xs, color: colors.gold },
  body: { marginTop: spacing.lg },
  prayingCard: { marginTop: spacing.lg },
  prayingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  prayingInfo: { flex: 1 },
  prayingTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  prayingCount: { fontSize: 17 },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  stackAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold22,
    borderWidth: 2,
    borderColor: colors.screen,
  },
  stackAvatarText: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.gold },
  prayBtn: { marginTop: spacing.lg },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  iconButton: { alignItems: 'center', gap: spacing.xs, minWidth: 72 },
  moreActions: { paddingVertical: 0, marginBottom: spacing.lg, overflow: 'hidden' },
  moreActionButton: {
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  moreActionLast: { borderBottomWidth: 0 },
});
