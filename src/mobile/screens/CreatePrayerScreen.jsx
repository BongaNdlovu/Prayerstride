import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { EyeOff, Lock, Sparkles, Users } from 'lucide-react-native';
import { alpha, colors, sharedStyles, spacing } from '../theme';
import { addPrayer } from '../usePrayerData';
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

function frequencyHelper(limit) {
  if (limit === 'once') return 'Each person can pray for this once.';
  if (limit === 'weekly') return 'Each person can pray for this once per week.';
  return 'Each person can pray for this once per day.';
}

export default function CreatePrayerScreen({ user }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [privacy, setPrivacy] = useState('community');
  const [prayerLimit, setPrayerLimit] = useState('daily');
  const [anonymous, setAnonymous] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing details', 'Add a title and prayer request.');
      return;
    }

    setBusy(true);
    try {
      await addPrayer({
        title: title.trim(),
        body: body.trim(),
        privacy: privacy === 'hidden' ? 'private' : privacy,
        allowShare: privacy !== 'hidden',
        prayerLimit: prayerLimit === 'weekly' ? 'daily' : prayerLimit,
        isAnonymous: anonymous,
        urgent,
      }, user);
      setTitle('');
      setBody('');
      setAnonymous(false);
      setUrgent(false);
      Alert.alert('Prayer shared', 'Your request is now in the community feed.');
    } catch (error) {
      Alert.alert('Could not share prayer', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenScaffold pageContent>
      <AppHeader centered showLogo title="Create Prayer Request" subtitle="Share what you'd like others to pray for" />

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

        <PrimaryButton
          label="Share Prayer"
          icon={Sparkles}
          onPress={submit}
          busy={busy}
          style={styles.submit}
        />
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
});
