import { StyleSheet, Text } from 'react-native';
import { onDarkTypography, typography } from '../theme';
import { useAppTheme } from '../AppThemeProvider';

const VARIANTS = {
  body: typography.body,
  small: typography.bodySmall,
  caption: typography.caption,
  label: typography.label,
};

export default function BodyText({ variant = 'body', children, style, ...props }) {
  const { darkMode } = useAppTheme();
  const variants = darkMode ? DARK_VARIANTS : VARIANTS;
  return (
    <Text style={[variants[variant] || variants.body, style]} {...props}>
      {children}
    </Text>
  );
}

const DARK_VARIANTS = {
  body: onDarkTypography.body,
  small: onDarkTypography.bodySmall,
  caption: onDarkTypography.caption,
  label: { ...typography.label, color: onDarkTypography.body.color },
};
