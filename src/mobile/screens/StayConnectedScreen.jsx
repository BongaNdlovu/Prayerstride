import { StyleSheet, View } from 'react-native';
import { Users } from 'lucide-react-native';
import { alpha, colors, spacing } from '../theme';
import ScreenScaffold from '../components/ScreenScaffold';
import LogoMark from '../components/LogoMark';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';

export default function StayConnectedScreen({ onContinue }) {
  return (
    <ScreenScaffold contentStyle={styles.centered}>
      <View style={styles.iconWrap}>
        <Users color={colors.gold} size={32} />
      </View>
      <LogoMark size={40} />
      <Heading level="h2" style={styles.title}>Stay connected</Heading>
      <BodyText variant="body" style={styles.subtitle}>
        Join a community of believers lifting each other up. Together we pray, encourage, and celebrate what God is doing.
      </BodyText>
      <PrimaryButton label="Continue" onPress={onContinue} style={styles.cta} />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  centered: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  iconWrap: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha.gold18, marginBottom: spacing.xxl },
  title: { marginTop: spacing.lg, textAlign: 'center' },
  subtitle: { marginTop: spacing.md, textAlign: 'center', maxWidth: 280 },
  cta: { marginTop: spacing.xxxl, alignSelf: 'stretch' },
});
