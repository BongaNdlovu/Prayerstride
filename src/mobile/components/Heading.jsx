import { StyleSheet, Text } from 'react-native';
import { typography } from '../theme';

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
  return (
    <Text style={[styles.base, LEVELS[level] || LEVELS.h2, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { textAlign: 'left' },
});
