import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { alpha, colors, spacing } from '../theme';
import BodyText from './BodyText';
import EmptyState from './EmptyState';
import PrimaryButton from './PrimaryButton';
import { getErrorMessage } from '../errors';

export default function AsyncState({ loading, error, empty, emptyLabel, onRetry, children }) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.teal} />
        <BodyText variant="small" style={styles.hint}>Loading...</BodyText>
      </View>
    );
  }

  if (error) {
    const message = getErrorMessage(error);
    return (
      <View style={[styles.center, styles.errorPanel]}>
        <View style={styles.errorIcon}>
          <AlertCircle size={20} color={colors.urgent} />
        </View>
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
  errorPanel: {
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(220,79,79,0.16)',
    borderRadius: 18,
    backgroundColor: 'rgba(220,79,79,0.06)',
  },
  errorIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.ink06,
  },
  error: { color: colors.urgent, textAlign: 'center' },
});
