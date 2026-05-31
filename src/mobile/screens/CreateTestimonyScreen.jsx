import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { alpha, colors, sharedStyles, spacing } from '../theme';
import { addTestimony, usePrayers } from '../usePrayerData';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';
import EmptyState from '../components/EmptyState';

const DETAILS_LIMIT = 1500;

export default function CreateTestimonyScreen({ user, linkedPrayerId, onDone }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [prayerId, setPrayerId] = useState(linkedPrayerId || null);
  const [busy, setBusy] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const { prayers } = usePrayers(true, { userId: user?.uid });
  const myPrayers = prayers.filter((p) => p.authorUid === user?.uid && p.status === 'active');

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing details', 'Add a title and testimony.');
      return;
    }
    setBusy(true);
    try {
      await addTestimony({ title: title.trim(), body: body.trim(), prayerId, shared: true }, user);
      setTitle('');
      setBody('');
      setPrayerId(null);
      if (onDone) onDone();
      Alert.alert('Testimony shared', 'Your praise report is now in the community feed.');
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
          placeholderTextColor={alpha.ivory55}
          style={sharedStyles.input}
        />

        <Text style={sharedStyles.fieldLabel}>Your story</Text>
        <TextInput
          value={body}
          onChangeText={(text) => setBody(text.slice(0, DETAILS_LIMIT))}
          placeholder="Tell your story..."
          multiline
          maxLength={DETAILS_LIMIT}
          placeholderTextColor={alpha.ivory55}
          style={[sharedStyles.input, sharedStyles.textArea]}
        />
        <BodyText variant="caption" style={styles.counter}>{body.length}/{DETAILS_LIMIT}</BodyText>

        <Pressable onPress={() => setShowPicker(!showPicker)} style={styles.pickerButton}>
          <BodyText variant="small">
            {linkedTitle ? `Linked to: ${linkedTitle}` : 'Link to a prayer (optional)'}
          </BodyText>
        </Pressable>

        {showPicker ? (
          <View style={styles.pickerList}>
            <FlatList
              data={[{ id: null, title: 'No linked prayer' }, ...myPrayers]}
              keyExtractor={(item) => item.id || 'none'}
              nestedScrollEnabled
              ListEmptyComponent={<EmptyState label="No active prayers to link." />}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => { setPrayerId(item.id); setShowPicker(false); }}
                  style={styles.pickerItem}
                >
                  <BodyText variant="small" style={prayerId === item.id && styles.pickerItemActive}>
                    {item.title}
                  </BodyText>
                </Pressable>
              )}
            />
          </View>
        ) : null}

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
    borderColor: alpha.ivory16,
    backgroundColor: alpha.ivory10,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  pickerList: {
    maxHeight: 200,
    marginTop: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: alpha.ivory16,
    backgroundColor: alpha.ivory10,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: alpha.ivory10,
  },
  pickerItemActive: { color: colors.gold },
  submit: { marginTop: spacing.xl },
});
