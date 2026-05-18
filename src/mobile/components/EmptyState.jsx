import { StyleSheet, Text } from 'react-native';

const styles = StyleSheet.create({
  text: { marginTop: 24, color: 'rgba(248,243,234,0.62)', textAlign: 'center', fontWeight: '700' },
});

export default function EmptyState({ label }) {
  return <Text style={styles.text}>{label}</Text>;
}
