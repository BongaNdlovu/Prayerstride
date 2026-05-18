import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../theme';

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(248,243,234,0.1)' },
  label: { color: colors.ivory, fontSize: 15, fontWeight: '600', flex: 1 },
});

export default function ToggleRow({ label, value, onToggle }) {
  return (
    <Pressable onPress={() => onToggle(!value)} style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: 'rgba(248,243,234,0.2)', true: colors.gold }} thumbColor={value ? colors.ink : colors.ivory} />
    </Pressable>
  );
}
