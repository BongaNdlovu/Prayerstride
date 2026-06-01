import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { alpha, colors, fonts, sharedStyles, spacing } from '../theme';
import { useReports, resolveReport, dismissReport } from '../useReports';
import { useUsers } from '../useUsers';
import { usePrayers, useTestimonies } from '../usePrayerData';
import { useIsAdmin } from '../useIsAdmin';
import { adminArchiveAnnouncement, adminCreateAnnouncement, adminDeleteContent, adminDeleteAccount, adminSuspendUser, adminUpdateAnnouncement, getSpiritualEngagementMetrics } from '../api';
import { useAnnouncements } from '../useAnnouncements';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import PillTabs from '../components/PillTabs';
import PrimaryButton from '../components/PrimaryButton';
import StatCard from '../components/StatCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import EmptyState from '../components/EmptyState';

const TABS = ['Overview', 'Reports', 'Members', 'Content', 'Announcements', 'Analytics'];
const ANNOUNCEMENT_CATEGORIES = ['events', 'prayer', 'updates'];

export default function AdminDashboardScreen({ user, go, onBack }) {
  const { isAdmin } = useIsAdmin(user);
  const { reports } = useReports(true);
  const { users } = useUsers(true);
  const { prayers } = usePrayers(isAdmin, { includeAll: isAdmin });
  const { testimonies } = useTestimonies(isAdmin);
  const { announcements } = useAnnouncements(isAdmin, { includeArchived: true });
  const [tab, setTab] = useState('Overview');

  if (!isAdmin) {
    return (
      <ScreenScaffold scroll={false} style={styles.deniedShell}>
        <BodyText variant="label" style={styles.deniedText}>Access denied. Admin only.</BodyText>
      </ScreenScaffold>
    );
  }

  return (
    <ScreenScaffold scroll={false} style={styles.shell}>
      <AppHeader title="Admin Console" subtitle="Manage reports, members, and content." onBack={onBack} />
      <PillTabs tabs={TABS} active={tab} onChange={setTab} style={styles.tabs} />
      {tab === 'Overview' && <OverviewStats users={users} prayers={prayers} reports={reports} testimonies={testimonies} />}
      {tab === 'Reports' && <ReportsList reports={reports} go={go} onResolve={resolveReport} onDismiss={dismissReport} />}
      {tab === 'Members' && <MembersList users={users} currentUid={user?.uid} onSuspend={adminSuspendUser} onDelete={adminDeleteAccount} />}
      {tab === 'Content' && <ContentList prayers={prayers} testimonies={testimonies} onDelete={adminDeleteContent} />}
      {tab === 'Announcements' && <AnnouncementsAdminList announcements={announcements} />}
      {tab === 'Analytics' && <AnalyticsPanel user={user} />}
    </ScreenScaffold>
  );
}

function AnalyticsPanel({ user }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);

  const loadMetrics = () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError('');
    getSpiritualEngagementMetrics(30)
      .then((result) => {
        if (mountedRef.current && requestId === requestIdRef.current) setMetrics(result);
      })
      .catch((err) => {
        if (mountedRef.current && requestId === requestIdRef.current) {
          setError(err.message || 'Failed to load analytics');
        }
      })
      .finally(() => {
        if (mountedRef.current && requestId === requestIdRef.current) setLoading(false);
      });
  };

  useEffect(() => {
    mountedRef.current = true;
    loadMetrics();
    return () => {
      mountedRef.current = false;
      requestIdRef.current++;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.section}>
        <ActivityIndicator color={colors.gold} />
        <BodyText variant="caption" style={styles.loadingText}>Loading analytics...</BodyText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <BodyText variant="body" style={styles.errorText}>{error}</BodyText>
        <PrimaryButton
          label="Retry"
          onPress={loadMetrics}
          disabled={loading}
          style={styles.retryButton}
        />
      </View>
    );
  }

  if (!metrics?.metrics) return <EmptyState label="No analytics data available." />;

  const m = metrics.metrics;
  const chartActivity = m.activityByDay?.slice(-14) || [];
  const retentionValue = metrics.windowTooShortForRetention ? '-' : `${m.retentionRate}%`;

  return (
    <View style={styles.section}>
      <Heading level="h3">Spiritual Engagement</Heading>
      <BodyText variant="caption" style={styles.sectionSubtitle}>Last {metrics.window?.days || 30} days</BodyText>

      <View style={styles.statsGrid}>
        <StatCard value={String(m.requestCount)} label="Prayer Requests" />
        <StatCard value={`${m.responseRate}%`} label="Response Rate" />
        <StatCard value={String(m.density)} label="Prayers per Request" />
        <StatCard value={String(m.activePrayingUsers7d)} label="Active Praying Users (7d)" />
      </View>

      <View style={styles.statsGrid}>
        <StatCard value={String(m.requestOnly)} label="Request Only" />
        <StatCard value={String(m.prayOnly)} label="Pray Only" />
        <StatCard value={String(m.both)} label="Both" />
        <StatCard value={retentionValue} label="7-Day Retention" />
      </View>

      <View style={styles.statsGrid}>
        <StatCard value={String(m.averageTimeToFirstPrayerMinutes ?? '-')} label="Avg Time to First Prayer (min)" />
        <StatCard value={String(m.medianTimeToFirstPrayerMinutes ?? '-')} label="Median Time to First Prayer (min)" />
        <StatCard value={String(m.retentionEligible)} label="Retention Eligible" />
        <StatCard value={String(m.totalPrayActions)} label="Total Pray Actions" />
      </View>

      {chartActivity.length > 0 ? (
        <GlassCard style={styles.chartCard}>
          <BodyText variant="caption" style={styles.chartTitle}>Request Activity (latest 14 active days)</BodyText>
          <View style={styles.chartBars}>
            {chartActivity.map((entry) => {
              const maxCount = Math.max(...chartActivity.map((e) => e.count), 1);
              const height = Math.max(4, (entry.count / maxCount) * 80);
              return (
                <View key={entry.day} style={styles.barWrap}>
                  <BodyText variant="caption" style={styles.barValue}>{entry.count}</BodyText>
                  <View style={[styles.bar, { height }]} />
                  <BodyText variant="caption" style={styles.barLabel}>{entry.day.slice(5)}</BodyText>
                </View>
              );
            })}
          </View>
        </GlassCard>
      ) : null}
    </View>
  );
}

function OverviewStats({ users, prayers, reports, testimonies }) {
  return (
    <View style={styles.section}>
      <View style={styles.statsGrid}>
        <StatCard value={String(users.length)} label="Users" />
        <StatCard value={String(prayers.length)} label="Prayers" />
        <StatCard value={String(reports.filter((r) => r.status === 'pending').length)} label="Open Reports" />
        <StatCard value={String(testimonies.length)} label="Testimonies" />
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
        <Pressable onPress={() => go('reportDetails', { report: item })}>
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Heading level="eyebrow">{item.status}</Heading>
              <BodyText variant="caption">{item.targetType}</BodyText>
            </View>
            <BodyText variant="body" style={styles.cardReason}>{item.reason}</BodyText>
            <View style={styles.cardActions}>
              <PrimaryButton label="Resolve" onPress={() => onResolve(item.id)} style={styles.actionBtn} textStyle={styles.actionText} />
              <PrimaryButton label="Dismiss" onPress={() => onDismiss(item.id)} variant="ghost" style={styles.actionBtnOutline} />
            </View>
          </GlassCard>
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
      <TextInput value={search} onChangeText={setSearch} placeholder="Search members..." style={styles.searchInput} placeholderTextColor={alpha.ivory55} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState label="No members found." />}
        renderItem={({ item }) => (
          <GlassCard style={styles.card}>
            <BodyText variant="label">{item.displayName || 'Unknown'}</BodyText>
            <BodyText variant="caption">{item.email}</BodyText>
            <Heading level="eyebrow" style={styles.memberRole}>{item.role || 'user'}{item.suspended ? ' (suspended)' : ''}</Heading>
            {item.id !== currentUid && item.role !== 'admin' ? (
              <View style={styles.cardActions}>
                <PrimaryButton
                  label="Suspend"
                  variant="ghost"
                  onPress={() => {
                    Alert.alert('Suspend User', 'Are you sure?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Suspend', style: 'destructive', onPress: () => onSuspend(item.id, 'Admin action') },
                    ]);
                  }}
                  style={styles.actionBtnOutline}
                />
                <PrimaryButton
                  label="Delete"
                  variant="ghost"
                  onPress={() => {
                    Alert.alert('Delete Account', 'This cannot be undone.', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
                    ]);
                  }}
                  style={styles.dangerBtn}
                />
              </View>
            ) : null}
          </GlassCard>
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
      <GlassCard style={styles.formCard}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Announcement title" style={styles.searchInput} placeholderTextColor={alpha.ivory55} />
        <TextInput value={body} onChangeText={setBody} placeholder="Announcement body" multiline style={[styles.searchInput, styles.textArea]} placeholderTextColor={alpha.ivory55} />
        <TextInput value={startsAt} onChangeText={setStartsAt} placeholder="Starts at ISO timestamp" style={styles.searchInput} placeholderTextColor={alpha.ivory55} />
        <PillTabs tabs={ANNOUNCEMENT_CATEGORIES} active={category} onChange={setCategory} style={styles.categoryTabs} />
        <PrimaryButton label={busy ? 'Saving...' : editingId ? 'Update Announcement' : 'Create Announcement'} onPress={saveAnnouncement} disabled={busy} busy={busy} />
      </GlassCard>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState label="No announcements yet." />}
        renderItem={({ item }) => (
          <GlassCard style={styles.card}>
            <Heading level="eyebrow">{item.status}</Heading>
            <BodyText variant="body" style={styles.cardReason}>{item.title}</BodyText>
            <BodyText variant="caption">{item.categoryLabel} · {item.displayDate}</BodyText>
            <View style={styles.cardActions}>
              <PrimaryButton
                label="Edit"
                variant="ghost"
                onPress={() => { setEditingId(item.id); setTitle(item.title); setBody(item.body); setCategory(item.category); setStartsAt(item.startsAt || new Date().toISOString()); }}
                style={styles.actionBtnOutline}
              />
              {item.status === 'active' ? (
                <PrimaryButton label="Archive" variant="ghost" onPress={() => archiveAnnouncement(item.id)} style={styles.dangerBtn} />
              ) : null}
            </View>
          </GlassCard>
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
        <GlassCard style={styles.card}>
          <Heading level="eyebrow">{item.contentType}</Heading>
          <BodyText variant="body" style={styles.cardReason}>{item.title}</BodyText>
          <PrimaryButton
            label="Delete"
            variant="ghost"
            onPress={() => {
              Alert.alert('Delete Content', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id, item.contentType) },
              ]);
            }}
            style={[styles.dangerBtn, styles.deleteContentBtn]}
          />
        </GlassCard>
      )}
    />
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  deniedShell: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  deniedText: { textAlign: 'center' },
  tabs: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  section: { flex: 1, paddingHorizontal: spacing.lg },
  list: { paddingBottom: spacing.tabBar, gap: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  card: { marginBottom: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardReason: { marginTop: spacing.sm },
  cardActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { flex: 1, minHeight: 40 },
  actionText: { fontSize: 12 },
  actionBtnOutline: { flex: 1, minHeight: 40 },
  dangerBtn: { flex: 1, minHeight: 40, borderColor: alpha.gold30 },
  deleteContentBtn: { marginTop: spacing.md, alignSelf: 'flex-start', flex: 0, paddingHorizontal: spacing.lg },
  searchInput: { ...sharedStyles.input, marginTop: spacing.sm },
  textArea: { ...sharedStyles.textArea, minHeight: 90 },
  formCard: { marginBottom: spacing.md },
  categoryTabs: { marginBottom: spacing.md },
  memberRole: { marginTop: spacing.sm },
  loadingText: { textAlign: 'center', marginTop: spacing.md },
  errorText: { textAlign: 'center', marginBottom: spacing.md, color: colors.gold },
  retryButton: { alignSelf: 'center' },
  sectionSubtitle: { marginBottom: spacing.lg },
  chartCard: { marginTop: spacing.md },
  chartTitle: { marginBottom: spacing.md },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, minHeight: 110 },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  barValue: { fontSize: 9, fontFamily: fonts.sansBold },
  bar: { width: '100%', maxWidth: 20, borderRadius: 4, backgroundColor: colors.gold, minHeight: 2 },
  barLabel: { fontSize: 8, marginTop: 2 },
});
