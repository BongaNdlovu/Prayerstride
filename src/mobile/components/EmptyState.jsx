import { StyleSheet, View } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import Heading from './Heading';
import BodyText from './BodyText';

export default function EmptyState({ label, style }) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.iconWrap}>
        <Inbox size={20} color={colors.gold} />
      </View>
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
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    backgroundColor: alpha.gold18,
    borderWidth: 1,
    borderColor: alpha.gold30,
  },
  title: { textAlign: 'center', marginBottom: spacing.sm },
  label: { textAlign: 'center', fontFamily: fonts.sans },
});
