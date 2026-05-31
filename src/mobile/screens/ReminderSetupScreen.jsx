import { StyleSheet, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { alpha, colors, spacing } from '../theme';
import ScreenScaffold from '../components/ScreenScaffold';
import LogoMark from '../components/LogoMark';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import PrimaryButton from '../components/PrimaryButton';

export default function ReminderSetupScreen({ onContinue, onSkip }) {
  return (
    <ScreenScaffold scroll={false} style={styles.centered}>
      <View style={styles.iconWrap}>
        <Bell color={colors.gold} size={32} />
      </View>
      <LogoMark size={40} />
      <Heading level="h2" style={styles.title}>Stay on track</Heading>
      <BodyText variant="body" style={styles.subtitle}>
        Enable reminders so you never miss a moment to pray for someone. You can change this anytime in settings.
      </BodyText>
      <PrimaryButton label="Enable Reminders" onPress={onContinue} style={styles.cta} />
      <PrimaryButton label="Not now" onPress={onSkip} variant="ghost" style={styles.skip} />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  iconWrap: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha.gold18, marginBottom: spacing.xxl },
  title: { marginTop: spacing.lg, textAlign: 'center' },
  subtitle: { marginTop: spacing.md, textAlign: 'center', maxWidth: 280 },
  cta: { marginTop: spacing.xxxl, alignSelf: 'stretch' },
  skip: { marginTop: spacing.md, alignSelf: 'stretch' },
});
