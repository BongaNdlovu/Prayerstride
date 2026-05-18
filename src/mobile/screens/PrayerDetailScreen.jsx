import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { prayForRequest } from '../api';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';

export default function PrayerDetailScreen({ prayer, onBack }) {
  const [prayed, setPrayed] = useState(false);

  const pray = async () => {
    if (prayed) return;
    setPrayed(true);
    try {
      await prayForRequest(prayer.id);
    } catch (error) {
      setPrayed(false);
      Alert.alert('Prayer not saved', error.message);
    }
  };

  return (
    <CinematicScreen pageContent>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <PageHero scene="chapel" eyebrow="Prayer Request" title={prayer.title} subtitle={prayer.authorName} compact />
      <View style={styles.card}>
        <Text style={styles.body}>{prayer.body}</Text>
        <Text style={styles.meta}>{prayer.prayedCount + (prayed ? 1 : 0)} people praying</Text>
      </View>
      <Pressable onPress={pray} style={styles.button}>
        <Text style={styles.buttonText}>{prayed ? 'You Prayed' : "I'll Pray"}</Text>
      </Pressable>
    </CinematicScreen>
  );
}

const styles = StyleSheet.create({
  backButton: { alignSelf: 'flex-start', marginTop: 16, marginBottom: 4, paddingVertical: 8, paddingRight: 16 },
  backText: { color: colors.gold, fontWeight: '800' },
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18 },
  body: { marginTop: 12, color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 23 },
  meta: { flexShrink: 1, color: 'rgba(248,243,234,0.55)', fontSize: 12, marginTop: 12 },
  button: { marginTop: 20, minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
});
