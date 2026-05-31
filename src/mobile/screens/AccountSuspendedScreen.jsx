import { StyleSheet, View } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import { alpha, colors, spacing } from '../theme';
import ScreenScaffold from '../components/ScreenScaffold';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';

export default function AccountSuspendedScreen({ reason, onSignOut }) {
  return (
    <ScreenScaffold scroll={false} style={styles.centered}>
      <View style={styles.iconWrap}>
        <ShieldAlert color={colors.gold} size={32} />
      </View>
      <Heading level="h2" style={styles.title}>Account Suspended</Heading>
      <BodyText variant="body" style={styles.subtitle}>
        Your account has been temporarily suspended. This may be due to a violation of our community guidelines.
      </BodyText>
      {reason ? <BodyText variant="caption" style={styles.reason}>{reason}</BodyText> : null}
      <PrimaryButton label="Sign Out" onPress={onSignOut} variant="ghost" style={styles.cta} />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  iconWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold18,
    marginBottom: spacing.xxl,
  },
  title: { textAlign: 'center' },
  subtitle: { marginTop: spacing.md, textAlign: 'center', maxWidth: 280 },
  reason: { marginTop: spacing.sm, textAlign: 'center', maxWidth: 280 },
  cta: { marginTop: spacing.xxxl, alignSelf: 'stretch' },
});
