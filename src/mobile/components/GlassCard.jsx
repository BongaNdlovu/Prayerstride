import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: 'rgba(248,243,234,0.16)',
    backgroundColor: 'rgba(248,243,234,0.11)',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#101820',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 6,
  },
});

export default function GlassCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
