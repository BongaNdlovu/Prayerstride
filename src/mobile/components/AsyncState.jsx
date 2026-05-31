import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import BodyText from './BodyText';
import EmptyState from './EmptyState';

export default function AsyncState({ loading, error, empty, emptyLabel, children }) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
        <BodyText variant="small" style={styles.hint}>Loading...</BodyText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <BodyText variant="body" style={styles.error}>{error.message || String(error)}</BodyText>
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
