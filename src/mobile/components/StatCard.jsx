import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const styles = StyleSheet.create({
  card: { flex: 1, minHeight: 116, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', borderRadius: 22, padding: 16 },
  value: { marginTop: 10, color: colors.ivory, fontSize: 25, fontWeight: '800' },
  label: { marginTop: 3, color: 'rgba(248,243,234,0.58)', fontSize: 12 },
});

export default function StatCard({ icon: Icon, value, label }) {
  return (
    <View style={styles.card}>
      {Icon ? <Icon color={colors.gold} size={21} /> : null}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
