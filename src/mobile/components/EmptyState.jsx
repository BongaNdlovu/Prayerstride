import { StyleSheet, View } from 'react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import Heading from './Heading';
import BodyText from './BodyText';

export default function EmptyState({ label, style }) {
  return (
    <View style={[styles.wrap, style]}>
      <Heading level="h4" style={styles.title}>Nothing here yet</Heading>
      <BodyText variant="body" style={styles.label}>{label}</BodyText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: alpha.ivory16,
    borderRadius: radii.xxl,
    backgroundColor: alpha.ivory10,
  },
  title: { textAlign: 'center', marginBottom: spacing.sm },
  label: { textAlign: 'center', fontFamily: fonts.sans },
});
