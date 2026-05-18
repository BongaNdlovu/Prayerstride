import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bell, ChevronRight, Flame, Heart, Search, Sparkles, Users } from 'lucide-react-native';
import { colors, scenes } from '../theme';
import { usePrayers } from '../usePrayerData';
import EmptyState from '../components/EmptyState';
import PrayerCard from '../components/PrayerCard';
import StatCard from '../components/StatCard';
import PageHero from '../components/PageHero';

export default function HomeScreen({ onOpenPrayer, go }) {
  const { prayers, loading } = usePrayers(true);
  const featured = prayers[0];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ImageBackground source={scenes.dawn} resizeMode="cover" imageStyle={styles.heroImage} style={styles.imageHero}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>PrayerStride</Text>
            <Text style={styles.title}>Begin in quiet light</Text>
            <Text style={styles.subtitle}>A daily walk in prayer, presence, and hope.</Text>
            <View style={styles.heroActions}>
              <Pressable style={styles.roundAction} onPress={() => go('notifications')}>
                <Bell size={20} color={colors.ivory} />
              </Pressable>
              <Pressable style={styles.roundAction} onPress={() => go('discover')}>
                <Search size={20} color={colors.ivory} />
              </Pressable>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.stack}>
          <View style={styles.glassCard}>
            <View style={styles.missionHeader}>
              <View style={styles.missionText}>
                <Text style={styles.eyebrow}>Today's Prayer Mission</Text>
                <Text style={styles.missionTitle}>{featured?.title || 'Pray for peace in our home'}</Text>
              </View>
              <View style={styles.missionIcon}>
                <Sparkles size={25} color={colors.ink} />
              </View>
            </View>
            <Text style={styles.glassBody}>{featured?.body || 'A family has asked for prayer during a difficult season. Take two quiet minutes and lift them up.'}</Text>
            <Pressable onPress={() => featured && onOpenPrayer(featured)} style={styles.button}>
              <Text style={styles.buttonText}>Pray Now</Text>
              <ChevronRight size={18} color={colors.ink} />
            </Pressable>
          </View>

          <View style={styles.statsGrid}>
            <StatCard icon={Flame} value="7 days" label="walking with God" />
            <StatCard icon={Heart} value="2" label="answered prayers this week" />
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Prayer Requests</Text>
            <Text style={styles.viewAll}>View all</Text>
          </View>
        </View>
        {loading ? <ActivityIndicator color={colors.navy} /> : null}
        <View style={styles.list}>
          {prayers.length === 0 ? <EmptyState label="No prayers yet." /> : null}
          {prayers.map((prayer) => <PrayerCard key={prayer.id} prayer={prayer} onPress={() => onOpenPrayer(prayer)} variant="glass" />)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080b13' },
  content: { paddingBottom: 22 },
  imageHero: { minHeight: 272, justifyContent: 'flex-end', overflow: 'hidden', borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  heroImage: { borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,11,19,0.34)' },
  heroContent: { minHeight: 272, justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 64, paddingBottom: 24 },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 2.4, textTransform: 'uppercase' },
  title: { marginTop: 8, color: colors.ivory, fontSize: 40, lineHeight: 46, fontWeight: '800' },
  subtitle: { marginTop: 12, maxWidth: 290, color: 'rgba(248,243,234,0.78)', fontSize: 14, lineHeight: 23 },
  heroActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  roundAction: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(248,243,234,0.14)' },
  stack: { marginTop: -22, paddingHorizontal: 16 },
  glassCard: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18 },
  missionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  missionText: { flex: 1 },
  missionTitle: { marginTop: 8, color: colors.ivory, fontSize: 25, lineHeight: 31, fontWeight: '800' },
  missionIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  glassBody: { marginTop: 12, color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 23 },
  button: { marginTop: 20, minHeight: 52, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: colors.gold },
  buttonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', gap: 12, marginTop: 14 },
  sectionRow: { marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.ivory, fontSize: 22, fontWeight: '800' },
  viewAll: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
});
