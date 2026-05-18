import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { addEncouragement, deleteEncouragement, updateEncouragement } from '../useEncouragements';
import EmptyState from '../components/EmptyState';

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
      <Text style={styles.heading}>Encouragements</Text>
      {loading ? <ActivityIndicator color={colors.navy} /> : null}
      {comments.length === 0 ? <EmptyState label="No encouragements yet." /> : null}
      {comments.map((comment) => (
        <View key={comment.id} style={styles.comment}>
          <Text style={styles.author}>{comment.authorName}</Text>
          {editingId === comment.id ? (
            <View>
              <TextInput value={editText} onChangeText={setEditText} style={styles.input} multiline placeholderTextColor="rgba(248,243,234,0.56)" />
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
              <Text style={styles.text}>{comment.text}</Text>
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
          <TextInput value={text} onChangeText={setText} placeholder="Add an encouragement..." style={styles.input} placeholderTextColor="rgba(248,243,234,0.56)" />
          <Pressable disabled={busy || !text.trim()} onPress={submit} style={[styles.smallButton, (busy || !text.trim()) && { opacity: 0.5 }]}>
            <Text style={styles.smallButtonText}>Send</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16 },
  heading: { color: colors.ivory, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  comment: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', borderRadius: 16, padding: 14, marginBottom: 10, backgroundColor: 'rgba(248,243,234,0.06)' },
  author: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  text: { marginTop: 6, color: 'rgba(248,243,234,0.78)', fontSize: 14, lineHeight: 21 },
  commentActions: { flexDirection: 'row', gap: 14, marginTop: 8 },
  actionLink: { color: 'rgba(248,243,234,0.5)', fontSize: 12, fontWeight: '700' },
  input: { marginTop: 8, minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', paddingHorizontal: 14, paddingVertical: 10, color: colors.ivory, fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 12 },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  smallButton: { minHeight: 38, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  smallButtonText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  smallButtonOutline: { minHeight: 38, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(248,243,234,0.2)' },
  smallButtonOutlineText: { color: 'rgba(248,243,234,0.72)', fontSize: 13, fontWeight: '700' },
});
