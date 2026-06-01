import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { alpha, colors, sharedStyles, spacing } from '../theme';
import { addTestimony, usePrayers } from '../usePrayerData';
import { bumpGamificationRefresh } from '../gamificationRefresh';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';
import EmptyState from '../components/EmptyState';
import ToggleRow from '../components/ToggleRow';

const DETAILS_LIMIT = 1500;

export default function CreateTestimonyScreen({ user, linkedPrayerId, onDone }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [prayerId, setPrayerId] = useState(linkedPrayerId || null);
  const [busy, setBusy] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { prayers } = usePrayers(true, { userId: user?.uid });
  const myPrayers = prayers.filter((p) => p.authorUid === user?.uid && p.status === 'active');

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing details', 'Add a title and testimony.');
      return;
    }
    setBusy(true);
    try {
      await addTestimony({ title: title.trim(), body: body.trim(), prayerId, shared: true, isAnonymous }, user);
      bumpGamificationRefresh();
      setTitle('');
      setBody('');
      setPrayerId(null);
      Alert.alert('Testimony shared', 'Your praise report is now in the community feed.', [
        { text: 'OK', onPress: () => { if (onDone) onDone(); } },
      ]);
    } catch (error) {
      Alert.alert('Could not share testimony', error.message);
    } finally {
      setBusy(false);
    }
  };

  const linkedTitle = prayerId
    ? myPrayers.find((p) => p.id === prayerId)?.title || 'Prayer'
    : null;

  return (
    <ScreenScaffold pageContent>
      <AppHeader centered showLogo title="Share Testimony" subtitle="Tell others what God has done" />

      <GlassCard style={styles.card}>
        <Text style={sharedStyles.fieldLabel}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Testimony title"
          placeholderTextColor={colors.textMuted}
          style={sharedStyles.input}
        />

        <Text style={sharedStyles.fieldLabel}>Your story</Text>
        <TextInput
          value={body}
          onChangeText={(text) => setBody(text.slice(0, DETAILS_LIMIT))}
          placeholder="Tell your story..."
          multiline
          maxLength={DETAILS_LIMIT}
          placeholderTextColor={colors.textMuted}
          style={[sharedStyles.input, sharedStyles.textArea]}
        />
        <BodyText variant="caption" style={styles.counter}>{body.length}/{DETAILS_LIMIT}</BodyText>

        <Pressable onPress={() => setShowPicker(!showPicker)} style={styles.pickerButton}>
          <BodyText variant="small">
            {linkedTitle ? `Linked to: ${linkedTitle}` : 'Link to a prayer (optional)'}
          </BodyText>
        </Pressable>

        {showPicker ? (
          <ScrollView style={styles.pickerList} nestedScrollEnabled>
            {[{ id: null, title: 'No linked prayer' }, ...myPrayers].map((item) => (
              <Pressable
                key={item.id || 'none'}
                onPress={() => { setPrayerId(item.id); setShowPicker(false); }}
                style={styles.pickerItem}
              >
                <BodyText variant="small" style={prayerId === item.id && styles.pickerItemActive}>
                  {item.title}
                </BodyText>
              </Pressable>
            ))}
            {myPrayers.length === 0 ? <EmptyState label="No active prayers to link." /> : null}
          </ScrollView>
        ) : null}
        <ToggleRow
          label="Share Anonymously"
          subtext="Your name will be hidden from this testimony."
          value={isAnonymous}
          onToggle={setIsAnonymous}
        />

        <PrimaryButton
          label="Share Testimony"
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
  pickerButton: {
    marginTop: spacing.md,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: alpha.navy06,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  pickerList: {
    maxHeight: 200,
    marginTop: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: alpha.navy06,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerItemActive: { color: colors.gold },
  submit: { marginTop: spacing.xl },
});
