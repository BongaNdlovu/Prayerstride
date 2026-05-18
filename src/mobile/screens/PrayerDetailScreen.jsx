import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';
import { prayForRequest } from '../api';
import { markAnswered } from '../usePrayerData';
import { submitReport } from '../useReports';
import { useEncouragements } from '../useEncouragements';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import EncouragementThread from '../components/EncouragementThread';

export default function PrayerDetailScreen({ prayer, user, onBack, go, onRefresh }) {
  const [prayed, setPrayed] = useState(false);
  const [prayerCountDelta, setPrayerCountDelta] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { comments, loading: commentsLoading } = useEncouragements(prayer.id);
  const isOwner = user && prayer.authorUid === user.uid;

  useEffect(() => {
    loadBookmark();
    loadPrayedToday();
  }, [prayer.id]);

  const todayKey = () => new Date().toISOString().slice(0, 10);
  const prayedStorageKey = (dayKey = todayKey(), limit = prayer.prayerLimit || 'daily') => (
    limit === 'once' ? `prayed:${prayer.id}:once` : `prayed:${prayer.id}:${dayKey}`
  );

  const loadBookmark = async () => {
    try {
      const key = `bookmark:prayer:${prayer.id}`;
      const saved = await AsyncStorage.getItem(key);
      setBookmarked(saved === 'true');
    } catch (error) {
      console.warn('Failed to load bookmark', error);
    }
  };

  const loadPrayedToday = async () => {
    try {
      const saved = await AsyncStorage.getItem(prayedStorageKey());
      setPrayed(saved === 'true');
      setPrayerCountDelta(0);
    } catch (error) {
      console.warn('Failed to load prayer status', error);
    }
  };

  const toggleBookmark = async () => {
    try {
      const key = `bookmark:prayer:${prayer.id}`;
      const newValue = !bookmarked;
      await AsyncStorage.setItem(key, String(newValue));
      setBookmarked(newValue);
    } catch (error) {
      Alert.alert('Could not save bookmark', error.message);
    }
  };

  const pray = async () => {
    if (isOwner) {
      Alert.alert('Your request', 'You cannot pray for your own prayer request.');
      return;
    }
    if (prayed) return;
    setPrayed(true);
    try {
      const result = await prayForRequest(prayer.id);
      const dayKey = result.dayKey || todayKey();
      await AsyncStorage.setItem(prayedStorageKey(dayKey, result.prayerLimit), 'true');
      setPrayerCountDelta(result.duplicate ? 0 : 1);
      if (onRefresh) onRefresh();
    } catch (error) {
      setPrayed(false);
      setPrayerCountDelta(0);
      Alert.alert('Prayer not saved', error.message);
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report Prayer',
      'Why are you reporting this prayer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Inappropriate content',
          onPress: () => submitReportIfSignedIn('Inappropriate content'),
        },
        {
          text: 'Spam',
          onPress: () => submitReportIfSignedIn('Spam'),
        },
        {
          text: 'Other',
          onPress: () => submitReportIfSignedIn('User submitted report'),
        },
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
      Alert.alert('Could not submit report', error.message);
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
              Alert.alert('Could not update', error.message);
            }
          },
        },
      ],
    );
  };

  const handleTimer = () => {
    if (go) {
      go('prayerStopwatch', { prayerId: prayer.id, title: prayer.title });
    }
  };

  return (
    <CinematicScreen pageContent>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <PageHero scene="chapel" eyebrow="Prayer Request" title={prayer.title} subtitle={prayer.authorName} compact />
        <View style={styles.card}>
          <Text style={styles.body}>{prayer.body}</Text>
          <Text style={styles.meta}>{prayer.prayedCount + prayerCountDelta} people praying</Text>
          {prayer.createdAt && (
            <Text style={styles.meta}>{new Date(prayer.createdAt.seconds * 1000).toLocaleDateString()}</Text>
          )}
          {prayer.urgent && <Text style={styles.urgent}>Urgent</Text>}
          {prayer.privacy === 'private' && <Text style={styles.private}>Private</Text>}
        </View>

        <View style={styles.actionsRow}>
          <Pressable onPress={pray} style={[styles.actionButton, (prayed || isOwner) && styles.actionButtonDisabled]} disabled={prayed || isOwner}>
            <Text style={styles.actionButtonText}>
              {isOwner ? 'Your Request' : prayed ? (prayer.prayerLimit === 'once' ? 'Already Prayed' : 'Prayed Today') : "I'll Pray"}
            </Text>
          </Pressable>
          <Pressable onPress={toggleBookmark} style={styles.iconButton}>
            <Text style={styles.iconText}>{bookmarked ? '★' : '☆'}</Text>
          </Pressable>
          <Pressable onPress={handleTimer} style={styles.iconButton}>
            <Text style={styles.iconText}>⏱</Text>
          </Pressable>
          <Pressable onPress={() => setShowActions(!showActions)} style={styles.iconButton}>
            <Text style={styles.iconText}>⋯</Text>
          </Pressable>
        </View>

        {showActions && (
          <View style={styles.moreActions}>
            <Pressable onPress={handleReport} style={styles.moreActionButton}>
              <Text style={styles.moreActionText}>Report</Text>
            </Pressable>
            {isOwner && (
              <>
                <Pressable onPress={handleMarkAnswered} style={styles.moreActionButton}>
                  <Text style={styles.moreActionText}>Mark Answered</Text>
                </Pressable>
                {go && (
                  <Pressable onPress={() => go('editRequest', { prayer })} style={styles.moreActionButton}>
                    <Text style={styles.moreActionText}>Edit</Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        )}

        <EncouragementThread
          threadId={prayer.id}
          comments={comments}
          loading={commentsLoading}
          user={user}
          onRefresh={onRefresh}
        />
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  backButton: { alignSelf: 'flex-start', marginTop: 16, marginBottom: 4, paddingVertical: 8, paddingRight: 16 },
  backText: { color: colors.gold, fontWeight: '800' },
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18 },
  body: { marginTop: 12, color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 23 },
  meta: { flexShrink: 1, color: 'rgba(248,243,234,0.55)', fontSize: 12, marginTop: 12 },
  urgent: { marginTop: 8, color: '#ef4444', fontSize: 12, fontWeight: '700' },
  private: { marginTop: 4, color: 'rgba(248,243,234,0.5)', fontSize: 12, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 },
  actionButton: { flex: 1, minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  actionButtonDisabled: { opacity: 0.5 },
  actionButtonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  iconButton: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.08)' },
  iconText: { fontSize: 24, color: colors.gold },
  moreActions: { marginTop: 12, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', borderRadius: 16, overflow: 'hidden' },
  moreActionButton: { paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(248,243,234,0.08)' },
  moreActionText: { color: colors.ivory, fontSize: 15, fontWeight: '600' },
});
