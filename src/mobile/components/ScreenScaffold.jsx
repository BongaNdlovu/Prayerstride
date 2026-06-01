import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import LogoMark from './LogoMark';
import Heading from './Heading';
import SectionDivider from './SectionDivider';

export default function ScreenScaffold({
  children,
  scroll = true,
  pageContent = false,
  showLogo = false,
  title,
  subtitle,
  headerRight,
  onBack,
  style,
  contentStyle,
}) {
  const inner = (
    <>
      {(showLogo || title) && (
        <View style={styles.header}>
          {onBack ? <View style={styles.backSpacer} /> : null}
          <View style={styles.headerCenter}>
            {showLogo ? <LogoMark size={44} /> : null}
            {title ? <Heading level="h2" style={styles.title}>{title}</Heading> : null}
            {subtitle ? <Heading level="h4" style={styles.subtitle}>{subtitle}</Heading> : null}
            {title ? <SectionDivider style={styles.divider} /> : null}
          </View>
          {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : <View style={styles.backSpacer} />}
        </View>
      )}
      {children}
    </>
  );

  const containerStyle = [styles.screen, style];
  const scrollContentStyle = [
    pageContent ? styles.pageContent : styles.content,
    contentStyle,
  ];

  if (!scroll) {
    return (
      <LinearGradient colors={['#0A1628', '#040810']} style={containerStyle}>
        {inner}
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0A1628', '#040810']} style={containerStyle}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
        horizontal={false}
        keyboardShouldPersistTaps="handled"
      >
        {inner}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screen },
  scroll: { flex: 1, width: '100%' },
  content: { flexGrow: 1, width: '100%', paddingBottom: spacing.xxl },
  pageContent: { flexGrow: 1, width: '100%', paddingBottom: spacing.tabBar, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerRight: { width: 40, alignItems: 'flex-end' },
  backSpacer: { width: 40 },
  title: { marginTop: spacing.sm, textAlign: 'center', fontSize: 28 },
  subtitle: { marginTop: spacing.xs, textAlign: 'center', fontSize: 14, opacity: 0.72 },
  divider: { marginTop: spacing.md, marginBottom: spacing.sm },
});
