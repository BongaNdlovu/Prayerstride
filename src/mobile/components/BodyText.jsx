import { StyleSheet, Text } from 'react-native';
import { typography } from '../theme';

const VARIANTS = {
  body: typography.body,
  small: typography.bodySmall,
  caption: typography.caption,
  label: typography.label,
};

export default function BodyText({ variant = 'body', children, style, ...props }) {
  return (
    <Text style={[VARIANTS[variant] || VARIANTS.body, style]} {...props}>
      {children}
    </Text>
  );
}
