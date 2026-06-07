import { StyleSheet, Text } from 'react-native';
import { onDarkTypography, typography } from '../theme';
import { useAppTheme } from '../AppThemeProvider';

const LEVELS = {
  display: typography.display,
  h1: typography.h1,
  h2: typography.h2,
  h3: typography.h3,
  h4: typography.h4,
  stat: typography.stat,
  eyebrow: typography.eyebrow,
};

export default function Heading({ level = 'h2', children, style, ...props }) {
  const { darkMode } = useAppTheme();
  const levels = darkMode ? DARK_LEVELS : LEVELS;
  return (
    <Text style={[styles.base, levels[level] || levels.h2, style]} {...props}>
      {children}
    </Text>
  );
}

const DARK_LEVELS = {
  display: onDarkTypography.display,
  h1: onDarkTypography.h1,
  h2: onDarkTypography.h2,
  h3: onDarkTypography.h3,
  h4: onDarkTypography.h4,
  stat: { ...typography.stat, color: onDarkTypography.h2.color },
  eyebrow: onDarkTypography.eyebrow,
};

const styles = StyleSheet.create({
  base: { textAlign: 'left' },
});
