import { ScrollView, StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080b13' },
  content: { paddingBottom: 22 },
  pageContent: { paddingBottom: 120, paddingHorizontal: 16 },
});

export default function CinematicScreen({ children, scroll = true, pageContent = false }) {
  const contentStyle = pageContent ? styles.pageContent : styles.content;

  if (!scroll) {
    return <View style={styles.screen}>{children}</View>;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator
        persistentScrollbar
      >
        {children}
      </ScrollView>
    </View>
  );
}
