import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, gradients, spacing } from '../theme';
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
  variant = 'light',
  style,
  contentStyle,
}) {
  const isSpotlight = variant === 'spotlight';

  const inner = (
    <>
      {(showLogo || title) && (
        <View style={styles.header}>
          <View style={styles.headerCenter}>
            {showLogo ? <LogoMark size={44} /> : null}
            {title ? (
              <Heading level="h2" style={[styles.title, isSpotlight && styles.titleOnDark]}>
                {title}
              </Heading>
            ) : null}
            {subtitle ? (
              <Heading level="h4" style={[styles.subtitle, isSpotlight && styles.subtitleOnDark]}>
                {subtitle}
              </Heading>
            ) : null}
            {title ? <SectionDivider style={styles.divider} /> : null}
          </View>
          {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
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

  const background = isSpotlight ? (
    <LinearGradient colors={gradients.spotlight} style={StyleSheet.absoluteFillObject} />
  ) : null;

  if (!scroll) {
    return (
      <View style={containerStyle}>
        {background}
        {inner}
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {background}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
        horizontal={false}
        keyboardShouldPersistTaps="handled"
      >
        {inner}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flex: 1, width: '100%' },
  content: { flexGrow: 1, width: '100%', paddingBottom: spacing.xxl },
  pageContent: { flexGrow: 1, width: '100%', paddingTop: spacing.md, paddingBottom: spacing.tabBar, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerRight: { width: 40, alignItems: 'flex-end' },
  title: { marginTop: spacing.sm, textAlign: 'center', fontSize: 28 },
  titleOnDark: { color: colors.white },
  subtitle: { marginTop: spacing.xs, textAlign: 'center', fontSize: 14, opacity: 0.72 },
  subtitleOnDark: { color: colors.white, opacity: 0.72 },
  divider: { marginTop: spacing.md, marginBottom: spacing.sm },
});
