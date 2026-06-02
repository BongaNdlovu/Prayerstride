import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import BodyText from './BodyText';
import EmptyState from './EmptyState';
import PrimaryButton from './PrimaryButton';

export default function AsyncState({ loading, error, empty, emptyLabel, onRetry, children }) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.navy} />
        <BodyText variant="small" style={styles.hint}>Loading...</BodyText>
      </View>
    );
  }

  if (error) {
    const message = error?.code === 'failed-precondition'
      ? 'Prayer data is still being prepared. Please try again shortly.'
      : (error.message || String(error));
    return (
      <View style={styles.center}>
        <BodyText variant="body" style={styles.error}>{message}</BodyText>
        {onRetry ? <PrimaryButton label="Try again" variant="secondary" onPress={onRetry} /> : null}
      </View>
    );
  }

  if (empty) {
    return <EmptyState label={emptyLabel || 'No items yet.'} />;
  }

  return children;
}

const styles = StyleSheet.create({
  center: { paddingVertical: spacing.xxl, alignItems: 'center', gap: spacing.sm },
  hint: { marginTop: spacing.sm },
  error: { color: colors.urgent, textAlign: 'center' },
});
