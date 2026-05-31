import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { EyeOff, Lock, Users } from 'lucide-react-native';
import { alpha, colors, sharedStyles, spacing } from '../theme';
import { updatePrayer, deletePrayer, markAnswered } from '../usePrayerData';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import BodyText from '../components/BodyText';
import SegmentedControl from '../components/SegmentedControl';
import ToggleRow from '../components/ToggleRow';
import PrimaryButton from '../components/PrimaryButton';

const DETAILS_LIMIT = 1000;

const PRIVACY_OPTIONS = [
  { value: 'community', label: 'Community', icon: Users },
  { value: 'private', label: 'Private', icon: Lock },
  { value: 'hidden', label: 'Hidden', icon: EyeOff },
];

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

function resolvePrivacy(prayer) {
  if (prayer?.privacy === 'private' && prayer?.allowShare === false) return 'hidden';
  return prayer?.privacy || 'community';
}

function frequencyHelper(limit) {
  if (limit === 'once') return 'Each person can pray for this once.';
  if (limit === 'weekly') return 'Each person can pray for this once per week.';
  return 'Each person can pray for this once per day.';
}

export default function EditRequestScreen({ prayer, user, onDone }) {
  const [title, setTitle] = useState(prayer?.title || '');
  const [body, setBody] = useState(prayer?.body || '');
  const [privacy, setPrivacy] = useState(resolvePrivacy(prayer));
  const [prayerLimit, setPrayerLimit] = useState(prayer?.prayerLimit || 'daily');
  const [anonymous, setAnonymous] = useState(Boolean(prayer?.isAnonymous));
  const [urgent, setUrgent] = useState(Boolean(prayer?.urgent));
  const [busy, setBusy] = useState(false);
  const [markingAnswered, setMarkingAnswered] = useState(false);

  const save = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing details', 'Add a title and prayer request.');
      return;
    }
    setBusy(true);
    try {
      await updatePrayer(prayer.id, {
        title: title.trim(),
        body: body.trim(),
        privacy: privacy === 'hidden' ? 'private' : privacy,
        allowShare: privacy !== 'hidden',
        prayerLimit: prayerLimit === 'weekly' ? 'daily' : prayerLimit,
        isAnonymous: anonymous,
        urgent,
      });
      if (onDone) onDone();
    } catch (error) {
      Alert.alert('Could not save', error.message);
    } finally {
      setBusy(false);
    }
  };

  const markAsAnswered = () => {
    Alert.alert(
      'Mark as Answered',
      'Has God answered this prayer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, mark answered',
          onPress: async () => {
            setMarkingAnswered(true);
            try {
              await markAnswered(prayer.id);
              if (onDone) onDone();
            } catch (error) {
              Alert.alert('Could not update', error.message);
            } finally {
              setMarkingAnswered(false);
            }
          },
        },
      ],
    );
  };

  const remove = () => {
    Alert.alert('Delete prayer', 'Are you sure you want to delete this prayer request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePrayer(prayer.id);
            if (onDone) onDone();
          } catch (error) {
            Alert.alert('Could not delete', error.message);
          }
        },
      },
    ]);
  };

  return (
    <ScreenScaffold pageContent>
      <AppHeader centered showLogo title="Edit Request" subtitle="Update your prayer request" />

      <GlassCard style={styles.card}>
        <Text style={sharedStyles.fieldLabel}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Prayer title"
          placeholderTextColor={alpha.ivory55}
          style={sharedStyles.input}
        />

        <Text style={sharedStyles.fieldLabel}>Details</Text>
        <TextInput
          value={body}
          onChangeText={(text) => setBody(text.slice(0, DETAILS_LIMIT))}
          placeholder="What should people pray for?"
          multiline
          maxLength={DETAILS_LIMIT}
          placeholderTextColor={alpha.ivory55}
          style={[sharedStyles.input, sharedStyles.textArea]}
        />
        <BodyText variant="caption" style={styles.counter}>{body.length}/{DETAILS_LIMIT}</BodyText>

        <BodyText variant="label" style={styles.sectionLabel}>Privacy</BodyText>
        <SegmentedControl options={PRIVACY_OPTIONS} value={privacy} onChange={setPrivacy} />

        <BodyText variant="label" style={styles.sectionLabel}>Frequency</BodyText>
        <SegmentedControl options={FREQUENCY_OPTIONS} value={prayerLimit} onChange={setPrayerLimit} />
        <BodyText variant="caption" style={styles.helper}>{frequencyHelper(prayerLimit)}</BodyText>

        <ToggleRow
          label="Post Anonymously"
          subtext="Your name will be hidden from this request"
          value={anonymous}
          onToggle={setAnonymous}
        />
        <ToggleRow
          label="Mark as Urgent"
          subtext="Ask the community to pray soon"
          value={urgent}
          onToggle={setUrgent}
        />

        <PrimaryButton label="Save Changes" onPress={save} busy={busy} style={styles.submit} />
        <PrimaryButton
          label="Mark as Answered"
          variant="ghost"
          onPress={markAsAnswered}
          busy={markingAnswered}
          style={styles.secondary}
        />
        <PrimaryButton label="Delete Prayer" variant="ghost" onPress={remove} style={styles.secondary} />
      </GlassCard>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.sm },
  counter: { marginTop: spacing.xs, textAlign: 'right' },
  sectionLabel: { marginTop: spacing.lg, color: colors.gold },
  helper: { marginTop: spacing.sm, textAlign: 'center' },
  submit: { marginTop: spacing.xl },
  secondary: { marginTop: spacing.md },
});
