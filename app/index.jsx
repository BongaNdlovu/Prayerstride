import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  ImageBackground,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BarChart3, Bell, Bookmark, ChevronRight, Flame, Heart, Home, Plus, Search, Sparkles, User, Users } from 'lucide-react-native';
import { useAuth } from '../src/mobile/AuthProvider';
import { addPrayer, usePrayers, useTestimonies } from '../src/mobile/usePrayerData';
import { prayForRequest, reactToTestimony } from '../src/mobile/api';
import { registerForPushNotifications } from '../src/mobile/notifications';
import { colors, shadow } from '../src/mobile/theme';

const tabs = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'prayers', label: 'Prayers', icon: Sparkles },
  { key: 'create', label: 'Create', icon: Plus },
  { key: 'praise', label: 'Praise', icon: Heart },
  { key: 'stats', label: 'Stats', icon: BarChart3 },
  { key: 'profile', label: 'Profile', icon: User },
];

const scenes = {
  dawn: require('../src/assets/compressed-scenes/1.jpg'),
  bible: require('../src/assets/compressed-scenes/2.jpg'),
  community: require('../src/assets/compressed-scenes/3.jpg'),
  chapel: require('../src/assets/compressed-scenes/4.jpg'),
  answered: require('../src/assets/compressed-scenes/5.jpg'),
  texture: require('../src/assets/compressed-scenes/6.jpg'),
};

export default function MobileApp() {
  const { user, loading, signIn, register, signOut } = useAuth();
  const [tab, setTab] = useState('home');
  const [selectedPrayer, setSelectedPrayer] = useState(null);

  useEffect(() => {
    if (!user) return;
    registerForPushNotifications().catch((error) => {
      console.warn('Push registration failed', error);
    });
  }, [user]);

  if (loading) return <Centered label="Preparing PrayerStride..." />;
  if (!user) return <AuthScreen onSignIn={signIn} onRegister={register} />;

  const content = selectedPrayer ? (
    <PrayerDetail prayer={selectedPrayer} onBack={() => setSelectedPrayer(null)} />
  ) : (
    <TabContent tab={tab} user={user} signOut={signOut} onOpenPrayer={setSelectedPrayer} />
  );

  return (
    <SafeAreaView style={styles.shell}>
      <View style={styles.appBody}>{content}</View>
      {!selectedPrayer && <BottomTabs active={tab} onChange={setTab} />}
    </SafeAreaView>
  );
}

function AuthScreen({ onSignIn, onRegister }) {
  const [mode, setMode] = useState('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === 'register') await onRegister(email.trim(), password, name.trim());
      else await onSignIn(email.trim(), password);
    } catch (error) {
      Alert.alert('Could not continue', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.authShell}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.authBody}>
        <ImageBackground source={scenes.chapel} resizeMode="cover" imageStyle={styles.authSceneImage} style={styles.authScene}>
          <View style={styles.sceneOverlayStrong} />
          <View style={styles.authInner}>
            <View style={styles.brandMark}>
              <Sparkles color={colors.gold} size={34} />
            </View>
            <Text style={styles.heroTitle}>PrayerStride</Text>
            <Text style={styles.heroCopy}>A daily walk in prayer, encouragement, and answered testimony.</Text>

            <View style={styles.glassCard}>
              {mode === 'register' && (
                <TextInput value={name} onChangeText={setName} placeholder="Name" style={styles.glassInput} placeholderTextColor="rgba(248,243,234,0.56)" />
              )}
              <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={styles.glassInput} placeholderTextColor="rgba(248,243,234,0.56)" />
              <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={styles.glassInput} placeholderTextColor="rgba(248,243,234,0.56)" />
              <Pressable disabled={busy} onPress={submit} style={styles.cinematicButton}>
                <Text style={styles.cinematicButtonText}>{busy ? 'One moment...' : mode === 'register' ? 'Create Account' : 'Sign In'}</Text>
              </Pressable>
              <Pressable onPress={() => setMode(mode === 'register' ? 'signIn' : 'register')} style={styles.linkButton}>
                <Text style={styles.glassLinkText}>{mode === 'register' ? 'I already have an account' : 'Create a new account'}</Text>
              </Pressable>
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TabContent({ tab, user, signOut, onOpenPrayer }) {
  if (tab === 'discover' || tab === 'prayers') return <DiscoverScreen onOpenPrayer={onOpenPrayer} />;
  if (tab === 'create') return <CreatePrayerScreen user={user} />;
  if (tab === 'praise') return <PraiseScreen />;
  if (tab === 'stats') return <StatsScreen />;
  if (tab === 'profile') return <ProfileScreen user={user} signOut={signOut} />;
  return <HomeScreen onOpenPrayer={onOpenPrayer} />;
}

function HomeScreen({ onOpenPrayer }) {
  const { prayers, loading } = usePrayers(true);
  const featured = prayers[0];

  return (
    <View style={styles.cinematicScreen}>
      <ScrollView contentContainerStyle={styles.cinematicContent}>
      <ImageBackground source={scenes.dawn} resizeMode="cover" imageStyle={styles.heroImage} style={styles.imageHero}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.cinematicEyebrow}>PrayerStride</Text>
          <Text style={styles.cinematicTitle}>Begin in quiet light</Text>
          <Text style={styles.cinematicSubtitle}>A daily walk in prayer, presence, and hope.</Text>
          <View style={styles.heroActions}>
            <Pressable style={styles.roundAction}>
              <Bell size={20} color={colors.ivory} />
            </Pressable>
            <Pressable style={styles.roundAction}>
              <Search size={20} color={colors.ivory} />
            </Pressable>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.homeStack}>
        <View style={styles.glassCard}>
          <View style={styles.missionHeader}>
            <View style={styles.missionText}>
              <Text style={styles.cinematicEyebrow}>Today's Prayer Mission</Text>
              <Text style={styles.missionTitle}>{featured?.title || 'Pray for peace in our home'}</Text>
            </View>
            <View style={styles.missionIcon}>
              <Sparkles size={25} color={colors.ink} />
            </View>
          </View>
          <Text style={styles.glassBody}>{featured?.body || 'A family has asked for prayer during a difficult season. Take two quiet minutes and lift them up.'}</Text>
          <Pressable onPress={() => featured && onOpenPrayer(featured)} style={styles.cinematicButton}>
            <Text style={styles.cinematicButtonText}>Pray Now</Text>
            <ChevronRight size={18} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.oldStatsGrid}>
          <GlassStat icon={Flame} value="7 days" label="walking with God" />
          <GlassStat icon={Heart} value="2" label="answered prayers this week" />
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.oldSectionTitle}>Prayer Requests</Text>
          <Text style={styles.viewAllText}>View all</Text>
        </View>
      </View>
      {loading ? <ActivityIndicator color={colors.navy} /> : null}
      <View style={styles.homeList}>
        {prayers.length === 0 ? <Empty label="No prayers yet." /> : null}
        {prayers.map((prayer) => <PrayerCard key={prayer.id} prayer={prayer} onPress={() => onOpenPrayer(prayer)} variant="glass" />)}
      </View>
      </ScrollView>
    </View>
  );
}

function DiscoverScreen({ onOpenPrayer }) {
  const { prayers } = usePrayers(true);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => prayers.filter((prayer) => `${prayer.title} ${prayer.body}`.toLowerCase().includes(query.toLowerCase())), [prayers, query]);

  return (
    <View style={styles.cinematicScreen}>
      <PageHero scene="community" eyebrow="Explore" title="Find a prayer to carry" subtitle="Search requests, people, and praise reports in a quieter, warmer space." compact bleed={false} />
      <View style={styles.searchPanel}>
        <Search size={18} color="rgba(248,243,234,0.62)" />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search prayers..." style={styles.searchInput} placeholderTextColor="rgba(248,243,234,0.58)" />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cinematicListContent}
        ListEmptyComponent={<Empty label="No matching prayers." />}
        renderItem={({ item }) => <PrayerCard prayer={item} onPress={() => onOpenPrayer(item)} variant="glass" />}
      />
    </View>
  );
}

function CreatePrayerScreen({ user }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing details', 'Add a title and prayer request.');
      return;
    }

    setBusy(true);
    try {
      await addPrayer({ title: title.trim(), body: body.trim() }, user);
      setTitle('');
      setBody('');
      Alert.alert('Prayer shared', 'Your request is now in the community feed.');
    } catch (error) {
      Alert.alert('Could not share prayer', error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CinematicScroll>
      <PageHero scene="dawn" eyebrow="Create" title="Share a prayer with care" subtitle="Name the need, keep it clear, and invite the community to walk with you." compact />
      <View style={styles.glassCard}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Prayer title" style={styles.glassInput} placeholderTextColor="rgba(248,243,234,0.56)" />
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="What should people pray for?"
          multiline
          style={[styles.glassInput, styles.textArea]}
          placeholderTextColor="rgba(248,243,234,0.56)"
        />
        <Pressable disabled={busy} onPress={submit} style={styles.cinematicButton}>
          <Text style={styles.cinematicButtonText}>{busy ? 'Sharing...' : 'Share Prayer'}</Text>
        </Pressable>
      </View>
    </CinematicScroll>
  );
}

function PraiseScreen() {
  const { testimonies, loading } = useTestimonies(true);
  const [reacted, setReacted] = useState({});

  const react = async (id, key) => {
    if (reacted[`${id}:${key}`]) return;
    setReacted((current) => ({ ...current, [`${id}:${key}`]: true }));
    try {
      await reactToTestimony(id, key);
    } catch (error) {
      setReacted((current) => ({ ...current, [`${id}:${key}`]: false }));
      Alert.alert('Reaction not saved', error.message);
    }
  };

  return (
    <CinematicScroll>
      <PageHero scene="answered" eyebrow="Praise" title="Answered prayers, remembered" subtitle="Celebrate light breaking through ordinary days." compact />
      {loading ? <ActivityIndicator color={colors.navy} /> : null}
      {testimonies.length === 0 ? <Empty label="No testimonies yet." /> : null}
      {testimonies.map((testimony) => (
        <View key={testimony.id} style={styles.glassCard}>
          <Text style={styles.cinematicEyebrow}>Praise Report</Text>
          <Text style={styles.oldPrayerTitle}>{testimony.title}</Text>
          <Text style={styles.oldPrayerBody}>{testimony.body}</Text>
          <Text style={styles.oldPrayerMeta}>{testimony.authorName}</Text>
          <View style={styles.actionRow}>
            <ReactionButton label="Praise God" count={testimony.praiseGod + (reacted[`${testimony.id}:praiseGod`] ? 1 : 0)} onPress={() => react(testimony.id, 'praiseGod')} />
            <ReactionButton label="Amen" count={testimony.amen + (reacted[`${testimony.id}:amen`] ? 1 : 0)} onPress={() => react(testimony.id, 'amen')} />
          </View>
        </View>
      ))}
    </CinematicScroll>
  );
}

function StatsScreen() {
  return (
    <CinematicScroll>
      <PageHero scene="bible" eyebrow="Rhythm" title="Your prayer walk" subtitle="A calm record of consistency, care, and people carried in prayer." compact />
      <View style={styles.oldStatsGrid}>
        <GlassStat icon={Flame} value="21" label="current streak" />
        <GlassStat icon={Heart} value="248" label="total prayers" />
      </View>
      <View style={styles.glassCard}>
        <View style={styles.missionHeader}>
          <View style={styles.missionText}>
            <Text style={styles.cinematicEyebrow}>Prayer Time</Text>
            <Text style={styles.missionTitle}>14h 32m</Text>
          </View>
          <View style={styles.missionIcon}>
            <Users size={24} color={colors.ink} />
          </View>
        </View>
        <Text style={styles.glassBody}>Time spent in prayer and encouragement across the community.</Text>
      </View>
    </CinematicScroll>
  );
}

function PrayerDetail({ prayer, onBack }) {
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
    <CinematicScroll>
      <Pressable onPress={onBack} style={styles.glassBackButton}>
        <Text style={styles.glassLinkText}>Back</Text>
      </Pressable>
      <PageHero scene="chapel" eyebrow="Prayer Request" title={prayer.title} subtitle={prayer.authorName} compact />
      <View style={styles.glassCard}>
        <Text style={styles.glassBody}>{prayer.body}</Text>
        <Text style={styles.oldPrayerMeta}>{prayer.prayedCount + (prayed ? 1 : 0)} people praying</Text>
      </View>
      <Pressable onPress={pray} style={styles.cinematicButton}>
        <Text style={styles.cinematicButtonText}>{prayed ? 'You Prayed' : "I'll Pray"}</Text>
      </Pressable>
    </CinematicScroll>
  );
}

function ProfileScreen({ user, signOut }) {
  return (
    <CinematicScroll>
      <PageHero scene="community" eyebrow="Profile" title="Your place in the walk" subtitle="Settings, identity, and the path you are keeping with PrayerStride." compact />
      <View style={styles.glassCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.displayName || user.email || 'P').slice(0, 1).toUpperCase()}</Text>
        </View>
        <Text style={styles.oldPrayerTitle}>{user.displayName || 'PrayerStride User'}</Text>
        <Text style={styles.oldPrayerMeta}>{user.email}</Text>
      </View>
      <Pressable onPress={signOut} style={styles.secondaryGlassButton}>
        <Text style={styles.secondaryGlassButtonText}>Sign Out</Text>
      </Pressable>
    </CinematicScroll>
  );
}

function CinematicScroll({ children }) {
  return (
    <View style={styles.cinematicScreen}>
      <ScrollView contentContainerStyle={styles.cinematicPageContent}>
        {children}
      </ScrollView>
    </View>
  );
}

function PageHero({ scene = 'dawn', eyebrow, title, subtitle, compact = false, bleed = true }) {
  return (
    <ImageBackground source={scenes[scene] || scenes.dawn} resizeMode="cover" imageStyle={styles.heroImage} style={[styles.imageHero, compact && styles.compactHero, compact && !bleed && styles.compactHeroFlush]}>
      <View style={styles.heroOverlay} />
      <View style={[styles.heroContent, compact && styles.compactHeroContent]}>
        <Text style={styles.cinematicEyebrow}>{eyebrow}</Text>
        <Text style={[styles.cinematicTitle, compact && styles.compactHeroTitle]}>{title}</Text>
        {subtitle ? <Text style={styles.cinematicSubtitle}>{subtitle}</Text> : null}
      </View>
    </ImageBackground>
  );
}

function BottomTabs({ active, onChange }) {
  return (
    <View style={styles.tabs}>
      {tabs.map(({ key, label, icon: Icon }) => {
        const selected = key === active;
        return (
          <Pressable key={key} onPress={() => onChange(key)} style={styles.tabItem}>
            <View style={[styles.tabIcon, selected && styles.tabIconActive]}>
              <Icon size={20} color={selected ? colors.ink : 'rgba(248,243,234,0.6)'} />
            </View>
            <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PrayerCard({ prayer, onPress, variant }) {
  const isGlass = variant === 'glass';
  return (
    <Pressable onPress={onPress} style={isGlass ? styles.oldPrayerCard : styles.card}>
      {isGlass ? (
        <>
          <View style={styles.oldPrayerMetaRow}>
            <Text style={styles.oldPrayerMeta}>{prayer.authorName || prayer.name || 'PrayerStride'} - 2h ago</Text>
            <Text style={styles.oldPrayerTag}>{prayer.tag || 'Prayer'}</Text>
          </View>
          <Text style={styles.oldPrayerTitle}>{prayer.title}</Text>
          <Text numberOfLines={3} style={styles.oldPrayerBody}>{prayer.body || prayer.text}</Text>
          <View style={styles.oldPrayerMetaRow}>
            <Text style={styles.oldPrayerMeta}>{prayer.prayedCount || prayer.count || 0} praying</Text>
            <Bookmark size={16} color="rgba(248,243,234,0.55)" />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.cardEyebrow}>Prayer Request</Text>
          <Text style={styles.cardTitle}>{prayer.title}</Text>
          <Text numberOfLines={3} style={styles.cardBody}>{prayer.body}</Text>
          <Text style={styles.authorText}>{prayer.authorName} - {prayer.prayedCount} praying</Text>
        </>
      )}
    </Pressable>
  );
}

function GlassStat({ icon: Icon, value, label }) {
  return (
    <View style={styles.glassStat}>
      <Icon color={colors.gold} size={21} />
      <Text style={styles.glassStatValue}>{value}</Text>
      <Text style={styles.glassStatLabel}>{label}</Text>
    </View>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <View style={styles.statCard}>
      <Icon color={colors.gold} size={19} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function ReactionButton({ label, count, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.reactionButton}>
      <Text style={styles.reactionText}>{label} - {count}</Text>
    </Pressable>
  );
}

function Empty({ label }) {
  return <Text style={styles.emptyText}>{label}</Text>;
}

function Centered({ label }) {
  return (
    <SafeAreaView style={styles.centered}>
      <ActivityIndicator color={colors.gold} />
      <Text style={styles.centeredText}>{label}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.ink },
  appBody: { flex: 1, backgroundColor: colors.ink },
  authShell: { flex: 1, backgroundColor: colors.ink },
  authBody: { flex: 1 },
  authScene: { flex: 1, justifyContent: 'center' },
  authSceneImage: { opacity: 0.92 },
  authInner: { flex: 1, justifyContent: 'center', padding: 24 },
  sceneOverlayStrong: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,11,19,0.66)' },
  brandMark: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(200,137,43,0.16)' },
  heroTitle: { marginTop: 24, color: colors.ivory, fontSize: 42, fontWeight: '700', textAlign: 'center' },
  heroCopy: { marginTop: 12, color: 'rgba(248,243,234,0.72)', fontSize: 16, lineHeight: 24, textAlign: 'center' },
  heroCopySmall: { marginTop: 10, color: 'rgba(248,243,234,0.72)', fontSize: 15, lineHeight: 22 },
  screenContent: { padding: 20, paddingBottom: 120 },
  listScreen: { flex: 1, padding: 20, paddingBottom: 0 },
  listContent: { paddingBottom: 120 },
  heroPanel: { padding: 22, borderRadius: 28, backgroundColor: colors.ink, ...shadow },
  eyebrow: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 1.6, textTransform: 'uppercase' },
  screenTitle: { marginTop: 8, color: colors.ivory, fontSize: 33, lineHeight: 39, fontWeight: '800' },
  pageTitle: { color: colors.navy, fontSize: 32, fontWeight: '800', marginBottom: 14 },
  subtleText: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  streakRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statCard: { flex: 1, borderRadius: 18, backgroundColor: colors.white, padding: 14, borderWidth: 1, borderColor: colors.stone },
  statValue: { marginTop: 8, color: colors.navy, fontSize: 22, fontWeight: '800' },
  statLabel: { marginTop: 2, color: colors.muted, fontSize: 11, fontWeight: '700' },
  sectionTitle: { marginTop: 24, marginBottom: 10, color: colors.navy, fontSize: 21, fontWeight: '800' },
  card: { marginTop: 12, padding: 18, borderRadius: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.stone, ...shadow },
  cardEyebrow: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  cardTitle: { marginTop: 6, color: colors.navy, fontSize: 22, fontWeight: '800' },
  cardBody: { marginTop: 10, color: '#475467', fontSize: 15, lineHeight: 23 },
  authorText: { marginTop: 12, color: colors.muted, fontSize: 12, fontWeight: '700' },
  input: { marginTop: 12, minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: colors.stone, backgroundColor: colors.white, paddingHorizontal: 16, color: colors.ink, fontSize: 15 },
  glassInput: { marginTop: 12, minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', paddingHorizontal: 16, color: colors.ivory, fontSize: 15 },
  textArea: { minHeight: 150, paddingTop: 16, textAlignVertical: 'top' },
  primaryButton: { marginTop: 18, minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: colors.gold },
  primaryButtonText: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  secondaryButton: { marginTop: 18, minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: colors.stone, backgroundColor: colors.white },
  secondaryButtonText: { color: colors.navy, fontSize: 16, fontWeight: '800' },
  linkButton: { alignItems: 'center', paddingVertical: 14 },
  linkText: { color: colors.navy, fontWeight: '800' },
  glassLinkText: { color: colors.gold, fontWeight: '800' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  reactionButton: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', paddingHorizontal: 14, paddingVertical: 9 },
  reactionText: { color: colors.ivory, fontSize: 12, fontWeight: '800' },
  backButton: { alignSelf: 'flex-start', marginBottom: 12, paddingVertical: 8, paddingRight: 16 },
  backText: { color: colors.navy, fontWeight: '800' },
  avatar: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand },
  avatarText: { color: colors.navy, fontSize: 28, fontWeight: '800' },
  tabs: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 10, paddingBottom: 18, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: 'rgba(248,243,234,0.12)', backgroundColor: '#080b13' },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  tabIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: colors.gold },
  tabLabel: { color: 'rgba(248,243,234,0.62)', fontSize: 10, fontWeight: '700' },
  tabLabelActive: { color: colors.gold },
  emptyText: { marginTop: 24, color: 'rgba(248,243,234,0.62)', textAlign: 'center', fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink },
  centeredText: { marginTop: 12, color: colors.ivory, fontWeight: '700' },
  cinematicScreen: { flex: 1, backgroundColor: '#080b13' },
  cinematicContent: { paddingBottom: 22 },
  cinematicPageContent: { paddingBottom: 120, paddingHorizontal: 16 },
  imageHero: { minHeight: 272, justifyContent: 'flex-end', overflow: 'hidden', borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  compactHero: { minHeight: 218, marginHorizontal: -16, marginBottom: 16 },
  compactHeroFlush: { marginHorizontal: 0 },
  heroImage: { borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,11,19,0.34)' },
  heroContent: { minHeight: 272, justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 64, paddingBottom: 24 },
  compactHeroContent: { minHeight: 218, paddingHorizontal: 16, paddingTop: 44, paddingBottom: 22 },
  cinematicEyebrow: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 2.4, textTransform: 'uppercase' },
  cinematicTitle: { marginTop: 8, color: colors.ivory, fontSize: 40, lineHeight: 46, fontWeight: '800' },
  compactHeroTitle: { fontSize: 31, lineHeight: 37 },
  cinematicSubtitle: { marginTop: 12, maxWidth: 290, color: 'rgba(248,243,234,0.78)', fontSize: 14, lineHeight: 23 },
  heroActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  roundAction: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(248,243,234,0.14)' },
  homeStack: { marginTop: -22, paddingHorizontal: 16 },
  glassCard: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 24, padding: 18, ...shadow },
  searchPanel: { marginHorizontal: 16, marginBottom: 12, minHeight: 52, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.11)', borderRadius: 18, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, color: colors.ivory, fontSize: 15 },
  missionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  missionText: { flex: 1 },
  missionTitle: { marginTop: 8, color: colors.ivory, fontSize: 25, lineHeight: 31, fontWeight: '800' },
  missionIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  glassBody: { marginTop: 12, color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 23 },
  cinematicButton: { marginTop: 20, minHeight: 52, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: colors.gold },
  cinematicButtonText: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  secondaryGlassButton: { marginTop: 18, minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.08)' },
  secondaryGlassButtonText: { color: colors.ivory, fontSize: 16, fontWeight: '800' },
  glassBackButton: { alignSelf: 'flex-start', marginTop: 16, marginBottom: 4, paddingVertical: 8, paddingRight: 16 },
  oldStatsGrid: { flexDirection: 'row', gap: 12, marginTop: 14 },
  glassStat: { flex: 1, minHeight: 116, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', borderRadius: 22, padding: 16 },
  glassStatValue: { marginTop: 10, color: colors.ivory, fontSize: 25, fontWeight: '800' },
  glassStatLabel: { marginTop: 3, color: 'rgba(248,243,234,0.58)', fontSize: 12 },
  sectionRow: { marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  oldSectionTitle: { color: colors.ivory, fontSize: 22, fontWeight: '800' },
  viewAllText: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  homeList: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  cinematicListContent: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  oldPrayerCard: { width: '100%', borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', borderRadius: 24, padding: 16 },
  oldPrayerMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  oldPrayerMeta: { flexShrink: 1, color: 'rgba(248,243,234,0.55)', fontSize: 12 },
  oldPrayerTag: { overflow: 'hidden', borderRadius: 999, backgroundColor: 'rgba(200,137,43,0.18)', paddingHorizontal: 9, paddingVertical: 5, color: colors.gold, fontSize: 11, fontWeight: '800' },
  oldPrayerTitle: { marginTop: 10, color: colors.ivory, fontSize: 21, lineHeight: 26, fontWeight: '800' },
  oldPrayerBody: { marginTop: 8, color: 'rgba(248,243,234,0.68)', fontSize: 14, lineHeight: 21 },
});
