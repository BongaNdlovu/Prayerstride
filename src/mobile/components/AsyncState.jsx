import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import EmptyState from './EmptyState';

export default function AsyncState({
  loading = false,
  error = null,
  empty = false,
  emptyLabel = 'Nothing here yet.',
  onRetry,
  children,
}) {
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
        <Text style={styles.meta}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Could not load</Text>
        <Text style={styles.meta}>{error.message || 'Something went wrong.'}</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (empty) {
    return <EmptyState label={emptyLabel} />;
  }

  return children;
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, paddingHorizontal: 16, gap: 10 },
  errorTitle: { color: colors.ivory, fontSize: 16, fontWeight: '800' },
  meta: { color: 'rgba(248,243,234,0.58)', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  retryButton: { marginTop: 8, minHeight: 44, paddingHorizontal: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  retryText: { color: colors.ink, fontSize: 14, fontWeight: '800' },
});
