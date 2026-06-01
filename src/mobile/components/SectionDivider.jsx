import { StyleSheet, View } from 'react-native';
import { alpha, colors } from '../theme';

export default function SectionDivider({ style }) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.line} />
      <View style={styles.diamond} />
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '80%', alignSelf: 'center' },
  line: { flex: 1, height: 1, backgroundColor: alpha.gold30 },
  diamond: {
    width: 6,
    height: 6,
    backgroundColor: colors.gold,
    transform: [{ rotate: '45deg' }],
  },
});
