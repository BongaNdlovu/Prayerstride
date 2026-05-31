import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import { addEncouragement, deleteEncouragement, updateEncouragement } from '../useEncouragements';
import EmptyState from '../components/EmptyState';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';

export default function EncouragementThread({ threadId, comments, loading, user, onRefresh }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const submit = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await addEncouragement(threadId, text, user);
      setText('');
    } catch (error) {
      Alert.alert('Could not post', error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      await updateEncouragement(id, editText);
      setEditingId(null);
      setEditText('');
    } catch (error) {
      Alert.alert('Could not update', error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEncouragement(id);
    } catch (error) {
      Alert.alert('Could not delete', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Heading level="h4" style={styles.heading}>Encouragements</Heading>
      {loading ? <ActivityIndicator color={colors.gold} /> : null}
      {comments.length === 0 ? <EmptyState label="No encouragements yet." /> : null}
      {comments.map((comment) => (
        <View key={comment.id} style={styles.comment}>
          <Text style={styles.author}>{comment.authorName}</Text>
          {editingId === comment.id ? (
            <View>
              <TextInput value={editText} onChangeText={setEditText} style={styles.input} multiline placeholderTextColor={alpha.ivory55} />
              <View style={styles.editActions}>
                <Pressable onPress={() => handleEdit(comment.id)} style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>Save</Text>
                </Pressable>
                <Pressable onPress={() => { setEditingId(null); setEditText(''); }} style={styles.smallButtonOutline}>
                  <Text style={styles.smallButtonOutlineText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <BodyText variant="body" style={styles.text}>{comment.text}</BodyText>
              {user && comment.authorUid === user.uid ? (
                <View style={styles.commentActions}>
                  <Pressable onPress={() => { setEditingId(comment.id); setEditText(comment.text); }}>
                    <Text style={styles.actionLink}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(comment.id)}>
                    <Text style={styles.actionLink}>Delete</Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          )}
        </View>
      ))}
      {user ? (
        <View style={styles.inputRow}>
          <TextInput value={text} onChangeText={setText} placeholder="Add an encouragement..." style={styles.input} placeholderTextColor={alpha.ivory55} />
          <Pressable disabled={busy || !text.trim()} onPress={submit} style={[styles.smallButton, (busy || !text.trim()) && { opacity: 0.5 }]}>
            <Text style={styles.smallButtonText}>Send</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.lg },
  heading: { marginBottom: spacing.md },
  comment: { borderWidth: 1, borderColor: alpha.ivory12, borderRadius: radii.md, padding: 14, marginBottom: spacing.sm + 2, backgroundColor: alpha.ivory10 },
  author: { fontFamily: fonts.sansExtraBold, color: colors.gold, fontSize: 12 },
  text: { marginTop: 6 },
  commentActions: { flexDirection: 'row', gap: 14, marginTop: spacing.sm },
  actionLink: { fontFamily: fonts.sansBold, color: alpha.ivory55, fontSize: 12 },
  input: { marginTop: spacing.sm, minHeight: 44, borderRadius: radii.sm + 2, borderWidth: 1, borderColor: alpha.ivory16, backgroundColor: alpha.ivory10, paddingHorizontal: 14, paddingVertical: 10, color: colors.ivory, fontSize: 14, fontFamily: fonts.sans, flex: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
  editActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  smallButton: { minHeight: 38, paddingHorizontal: spacing.lg, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  smallButtonText: { fontFamily: fonts.sansExtraBold, color: colors.ink, fontSize: 13 },
  smallButtonOutline: { minHeight: 38, paddingHorizontal: spacing.lg, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: alpha.ivory20 },
  smallButtonOutlineText: { fontFamily: fonts.sansBold, color: alpha.ivory72, fontSize: 13 },
});
