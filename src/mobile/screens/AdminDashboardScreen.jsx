import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { useReports, resolveReport, dismissReport } from '../useReports';
import { useUsers } from '../useUsers';
import { usePrayers, useTestimonies } from '../usePrayerData';
import { useIsAdmin } from '../useIsAdmin';
import { adminArchiveAnnouncement, adminCreateAnnouncement, adminDeleteContent, adminDeleteAccount, adminSuspendUser, adminUpdateAnnouncement, getSpiritualEngagementMetrics } from '../api';
import { useAnnouncements } from '../useAnnouncements';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';

const TABS = ['Overview', 'Reports', 'Members', 'Content', 'Announcements', 'Analytics'];
const ANNOUNCEMENT_CATEGORIES = ['events', 'prayer', 'updates'];

export default function AdminDashboardScreen({ user, go }) {
  const { isAdmin } = useIsAdmin(user);
  const { reports } = useReports(true);
  const { users } = useUsers(true);
  const { prayers } = usePrayers(isAdmin, { includeAll: isAdmin });
  const { testimonies } = useTestimonies(isAdmin);
  const { announcements } = useAnnouncements(isAdmin, { includeArchived: true });
  const [tab, setTab] = useState('Overview');

  if (!isAdmin) {
    return (
      <CinematicScreen>
        <View style={styles.denied}>
          <Text style={styles.deniedText}>Access denied. Admin only.</Text>
        </View>
      </CinematicScreen>
    );
  }

  return (
    <CinematicScreen>
      <PageHero scene="bible" eyebrow="Stewardship" title="Admin Console" subtitle="Manage reports, members, and content." compact />
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>
      {tab === 'Overview' && <OverviewStats users={users} prayers={prayers} reports={reports} testimonies={testimonies} />}
      {tab === 'Reports' && <ReportsList reports={reports} go={go} onResolve={resolveReport} onDismiss={dismissReport} />}
      {tab === 'Members' && <MembersList users={users} currentUid={user?.uid} onSuspend={adminSuspendUser} onDelete={adminDeleteAccount} />}
      {tab === 'Content' && <ContentList prayers={prayers} testimonies={testimonies} onDelete={adminDeleteContent} />}
      {tab === 'Announcements' && <AnnouncementsAdminList announcements={announcements} />}
      {tab === 'Analytics' && <AnalyticsPanel user={user} />}
    </CinematicScreen>
  );
}

function AnalyticsPanel({ user }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSpiritualEngagementMetrics(30)
      .then(setMetrics)
      .catch((err) => setError(err.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.section}>
        <ActivityIndicator color={colors.gold} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={() => { setLoading(true); setError(''); getSpiritualEngagementMetrics(30).then(setMetrics).catch((err) => setError(err.message || 'Failed')).finally(() => setLoading(false)); }} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!metrics?.metrics) return <EmptyState label="No analytics data available." />;

  const m = metrics.metrics;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Spiritual Engagement</Text>
      <Text style={styles.sectionSubtitle}>Last {metrics.window?.days || 30} days</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{m.requestCount}</Text>
          <Text style={styles.statLabel}>Prayer Requests</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{m.responseRate}%</Text>
          <Text style={styles.statLabel}>Response Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{m.density}</Text>
          <Text style={styles.statLabel}>Prayers per Request</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{m.activePrayingUsers7d}</Text>
          <Text style={styles.statLabel}>Active Praying Users (7d)</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{m.requestOnly}</Text>
          <Text style={styles.statLabel}>Request Only</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{m.prayOnly}</Text>
          <Text style={styles.statLabel}>Pray Only</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{m.both}</Text>
          <Text style={styles.statLabel}>Both</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{m.retentionRate}%</Text>
          <Text style={styles.statLabel}>7-Day Retention</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{m.averageTimeToFirstPrayerMinutes ?? '-'}</Text>
          <Text style={styles.statLabel}>Avg Time to First Prayer (min)</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{m.medianTimeToFirstPrayerMinutes ?? '-'}</Text>
          <Text style={styles.statLabel}>Median Time to First Prayer (min)</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{m.retentionEligible}</Text>
          <Text style={styles.statLabel}>Retention Eligible</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{m.totalPrayActions}</Text>
          <Text style={styles.statLabel}>Total Pray Actions</Text>
        </View>
      </View>

      {m.activityByDay && m.activityByDay.length > 0 ? (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Request Activity (30 days)</Text>
          <View style={styles.chartBars}>
            {m.activityByDay.map((entry) => {
              const maxCount = Math.max(...m.activityByDay.map((e) => e.count), 1);
              const height = Math.max(4, (entry.count / maxCount) * 80);
              return (
                <View key={entry.day} style={styles.barWrap}>
                  <Text style={styles.barValue}>{entry.count}</Text>
                  <View style={[styles.bar, { height }]} />
                  <Text style={styles.barLabel}>{entry.day.slice(5)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function OverviewStats({ users, prayers, reports, testimonies }) {
  return (
    <View style={styles.section}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}><Text style={styles.statValue}>{users.length}</Text><Text style={styles.statLabel}>Users</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{prayers.length}</Text><Text style={styles.statLabel}>Prayers</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{reports.filter((r) => r.status === 'pending').length}</Text><Text style={styles.statLabel}>Open Reports</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{testimonies.length}</Text><Text style={styles.statLabel}>Testimonies</Text></View>
      </View>
    </View>
  );
}

function ReportsList({ reports, go, onResolve, onDismiss }) {
  return (
    <FlatList
      data={reports}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<EmptyState label="No reports." />}
      renderItem={({ item }) => (
        <Pressable onPress={() => go('reportDetails', { report: item })} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.badge}>{item.status}</Text>
            <Text style={styles.cardType}>{item.targetType}</Text>
          </View>
          <Text style={styles.cardReason}>{item.reason}</Text>
          <View style={styles.cardActions}>
            <Pressable onPress={() => onResolve(item.id)} style={styles.actionBtn}>
              <Text style={styles.actionText}>Resolve</Text>
            </Pressable>
            <Pressable onPress={() => onDismiss(item.id)} style={styles.actionBtnOutline}>
              <Text style={styles.actionTextOutline}>Dismiss</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    />
  );
}

function MembersList({ users, currentUid, onSuspend, onDelete }) {
  const [search, setSearch] = useState('');
  const filtered = users.filter((u) => `${u.displayName || ''} ${u.email || ''}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.section}>
      <TextInput value={search} onChangeText={setSearch} placeholder="Search members..." style={styles.searchInput} placeholderTextColor="rgba(248,243,234,0.56)" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState label="No members found." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.memberName}>{item.displayName || 'Unknown'}</Text>
            <Text style={styles.memberEmail}>{item.email}</Text>
            <Text style={styles.memberRole}>{item.role || 'user'}{item.suspended ? ' (suspended)' : ''}</Text>
            {item.id !== currentUid && item.role !== 'admin' ? (
              <View style={styles.cardActions}>
                <Pressable onPress={() => {
                  Alert.alert('Suspend User', 'Are you sure?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Suspend', style: 'destructive', onPress: () => onSuspend(item.id, 'Admin action') },
                  ]);
                }} style={styles.actionBtnOutline}>
                  <Text style={styles.actionTextOutline}>Suspend</Text>
                </Pressable>
                <Pressable onPress={() => {
                  Alert.alert('Delete Account', 'This cannot be undone.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
                  ]);
                }} style={styles.actionBtnDanger}>
                  <Text style={styles.actionTextDanger}>Delete</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

function AnnouncementsAdminList({ announcements }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('events');
  const [startsAt, setStartsAt] = useState(new Date().toISOString());
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const saveAnnouncement = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing fields', 'Title and body are required.');
      return;
    }
    setBusy(true);
    try {
      if (editingId) {
        await adminUpdateAnnouncement({
          announcementId: editingId,
          title: title.trim(),
          body: body.trim(),
          category,
          startsAt,
        });
      } else {
        await adminCreateAnnouncement({
          title: title.trim(),
          body: body.trim(),
          category,
          startsAt,
        });
      }
      setTitle('');
      setBody('');
      setCategory('events');
      setStartsAt(new Date().toISOString());
      setEditingId(null);
      Alert.alert('Saved', 'Announcement saved.');
    } catch (error) {
      Alert.alert('Could not save', error.message);
    } finally {
      setBusy(false);
    }
  };

  const archiveAnnouncement = async (announcementId) => {
    try {
      await adminArchiveAnnouncement(announcementId);
      if (editingId === announcementId) setEditingId(null);
    } catch (error) {
      Alert.alert('Could not archive', error.message);
    }
  };

  return (
    <View style={styles.section}>
      <TextInput value={title} onChangeText={setTitle} placeholder="Announcement title" style={styles.searchInput} placeholderTextColor="rgba(248,243,234,0.56)" />
      <TextInput value={body} onChangeText={setBody} placeholder="Announcement body" multiline style={[styles.searchInput, { minHeight: 90 }]} placeholderTextColor="rgba(248,243,234,0.56)" />
      <TextInput value={startsAt} onChangeText={setStartsAt} placeholder="Starts at ISO timestamp" style={styles.searchInput} placeholderTextColor="rgba(248,243,234,0.56)" />
      <View style={styles.tabRow}>
        {ANNOUNCEMENT_CATEGORIES.map((value) => (
          <Pressable key={value} onPress={() => setCategory(value)} style={[styles.tab, category === value && styles.tabActive]}>
            <Text style={[styles.tabText, category === value && styles.tabTextActive]}>{value}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable disabled={busy} onPress={saveAnnouncement} style={styles.actionBtn}>
        <Text style={styles.actionText}>{busy ? 'Saving...' : editingId ? 'Update Announcement' : 'Create Announcement'}</Text>
      </Pressable>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState label="No announcements yet." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.badge}>{item.status}</Text>
            <Text style={styles.cardReason}>{item.title}</Text>
            <Text style={styles.memberEmail}>{item.categoryLabel} · {item.displayDate}</Text>
            <View style={styles.cardActions}>
              <Pressable onPress={() => { setEditingId(item.id); setTitle(item.title); setBody(item.body); setCategory(item.category); setStartsAt(item.startsAt || new Date().toISOString()); }} style={styles.actionBtnOutline}>
                <Text style={styles.actionTextOutline}>Edit</Text>
              </Pressable>
              {item.status === 'active' ? (
                <Pressable onPress={() => archiveAnnouncement(item.id)} style={styles.actionBtnDanger}>
                  <Text style={styles.actionTextDanger}>Archive</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        )}
      />
    </View>
  );
}

function ContentList({ prayers, testimonies, onDelete }) {
  const allContent = [
    ...prayers.map((p) => ({ ...p, contentType: 'prayer' })),
    ...testimonies.map((t) => ({ ...t, contentType: 'testimony' })),
  ];

  return (
    <FlatList
      data={allContent}
      keyExtractor={(item) => `${item.contentType}-${item.id}`}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<EmptyState label="No content." />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardType}>{item.contentType}</Text>
          <Text style={styles.cardReason}>{item.title}</Text>
          <Pressable onPress={() => {
            Alert.alert('Delete Content', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id, item.contentType) },
            ]);
          }} style={styles.actionBtnDanger}>
            <Text style={styles.actionTextDanger}>Delete</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  denied: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  deniedText: { color: 'rgba(248,243,234,0.62)', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.08)' },
  tabActive: { borderColor: colors.gold, backgroundColor: 'rgba(200,137,43,0.18)' },
  tabText: { color: 'rgba(248,243,234,0.62)', fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: colors.gold },
  section: { paddingHorizontal: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { flex: 1, minWidth: '45%', borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', borderRadius: 16, padding: 14, backgroundColor: 'rgba(248,243,234,0.06)' },
  statValue: { color: colors.ivory, fontSize: 24, fontWeight: '800' },
  statLabel: { marginTop: 4, color: 'rgba(248,243,234,0.5)', fontSize: 11 },
  card: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', borderRadius: 16, padding: 14, backgroundColor: 'rgba(248,243,234,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { color: colors.gold, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  cardType: { color: 'rgba(248,243,234,0.5)', fontSize: 11, textTransform: 'uppercase' },
  cardReason: { marginTop: 8, color: 'rgba(248,243,234,0.72)', fontSize: 14, lineHeight: 21 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { minHeight: 36, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  actionText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  actionBtnOutline: { minHeight: 36, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(248,243,234,0.2)' },
  actionTextOutline: { color: 'rgba(248,243,234,0.72)', fontSize: 12, fontWeight: '700' },
  actionBtnDanger: { minHeight: 36, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(200,137,43,0.4)' },
  actionTextDanger: { color: colors.gold, fontSize: 12, fontWeight: '700' },
  searchInput: { minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(248,243,234,0.16)', backgroundColor: 'rgba(248,243,234,0.1)', paddingHorizontal: 14, color: colors.ivory, fontSize: 14, marginBottom: 12 },
  memberName: { color: colors.ivory, fontSize: 15, fontWeight: '700' },
  memberEmail: { color: 'rgba(248,243,234,0.55)', fontSize: 12, marginTop: 2 },
  memberRole: { color: colors.gold, fontSize: 11, fontWeight: '800', marginTop: 6, textTransform: 'uppercase' },
  loadingText: { color: 'rgba(248,243,234,0.5)', fontSize: 13, textAlign: 'center', marginTop: 12 },
  errorText: { color: colors.gold, fontSize: 14, textAlign: 'center', marginBottom: 12 },
  retryButton: { minHeight: 40, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold, alignSelf: 'center' },
  retryText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  sectionTitle: { color: colors.ivory, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  sectionSubtitle: { color: 'rgba(248,243,234,0.4)', fontSize: 11, marginBottom: 16 },
  chartCard: { borderWidth: 1, borderColor: 'rgba(248,243,234,0.12)', borderRadius: 16, padding: 14, backgroundColor: 'rgba(248,243,234,0.05)', marginTop: 14 },
  chartTitle: { color: 'rgba(248,243,234,0.5)', fontSize: 11, fontWeight: '700', marginBottom: 12 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, minHeight: 110 },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  barValue: { color: 'rgba(248,243,234,0.4)', fontSize: 9, fontWeight: '700' },
  bar: { width: '100%', maxWidth: 20, borderRadius: 4, backgroundColor: colors.gold, minHeight: 2 },
  barLabel: { color: 'rgba(248,243,234,0.35)', fontSize: 8, marginTop: 2 },
});
