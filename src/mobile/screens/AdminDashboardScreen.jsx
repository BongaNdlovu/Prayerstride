import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { alpha, colors, fonts, sharedStyles, spacing } from '../theme';
import { useReports, resolveReport, dismissReport } from '../useReports';
import { useUsers } from '../useUsers';
import { usePrayers } from '../usePrayerData';
import { useIsAdmin } from '../useIsAdmin';
import { adminArchiveAnnouncement, adminCreateAnnouncement, adminDeleteContent, adminDeleteAccount, adminSuspendUser, adminUnsuspendUser, adminUpdateAnnouncement, getSpiritualEngagementMetrics } from '../api';
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
import AsyncState from '../components/AsyncState';
import { getErrorMessage } from '../errors';

const TABS = ['Overview', 'Reports', 'Members', 'Content', 'Announcements', 'Analytics'];
const ANNOUNCEMENT_CATEGORIES = ['events', 'prayer', 'updates'];

export default function AdminDashboardScreen({ user, go, onBack }) {
  const { isAdmin, loading: adminLoading, error: adminError } = useIsAdmin(user);
  const { reports, loading: reportsLoading, error: reportsError, retry: retryReports } = useReports(user, true);
  const { users, loading: usersLoading, error: usersError, retry: retryUsers } = useUsers(user, true);
  const { prayers, loading: prayersLoading, error: prayersError, retry: retryPrayers } = usePrayers(isAdmin, { includeAll: isAdmin });
  const { announcements, loading: announcementsLoading, error: announcementsError, retry: retryAnnouncements } = useAnnouncements(isAdmin, { includeArchived: true, user });
  const [tab, setTab] = useState('Overview');
  const dataLoading = reportsLoading || usersLoading || prayersLoading || announcementsLoading;
  const dataError = reportsError || usersError || prayersError || announcementsError;
  const refreshAdminData = useCallback(() => {
    retryReports();
    retryUsers();
    retryPrayers();
    retryAnnouncements();
  }, [retryReports, retryUsers, retryPrayers, retryAnnouncements]);
  const refreshAfter = useCallback(async (action) => {
    const result = await action();
    refreshAdminData();
    return result;
  }, [refreshAdminData]);

  if (adminLoading) {
    return (
      <ScreenScaffold scroll={false} style={styles.deniedShell}>
        <AsyncState loading />
      </ScreenScaffold>
    );
  }

  if (adminError) {
    return (
      <ScreenScaffold scroll={false} style={styles.deniedShell}>
        <AsyncState error={adminError} />
      </ScreenScaffold>
    );
  }

  if (!isAdmin) {
    return (
      <ScreenScaffold scroll={false} style={styles.deniedShell}>
        <BodyText variant="label" style={styles.deniedText}>Access denied. Admin only.</BodyText>
      </ScreenScaffold>
    );
  }

  const refreshControl = <RefreshControl refreshing={dataLoading} onRefresh={refreshAdminData} />;

  return (
    <ScreenScaffold scroll={false} style={styles.shell}>
      <AppHeader title="Admin Console" subtitle="Manage reports, members, and content." onBack={onBack} />
      <PillTabs tabs={TABS} active={tab} onChange={setTab} style={styles.tabs} />
      <AsyncState loading={dataLoading} error={dataError}>
        {tab === 'Overview' && <OverviewStats users={users} prayers={prayers} reports={reports} />}
        {tab === 'Reports' && <ReportsList reports={reports} go={go} onResolve={(id) => refreshAfter(() => resolveReport(id))} onDismiss={(id) => refreshAfter(() => dismissReport(id))} refreshControl={refreshControl} />}
        {tab === 'Members' && <MembersList users={users} currentUid={user?.uid} onSuspend={(uid, reason) => refreshAfter(() => adminSuspendUser(uid, reason))} onUnsuspend={(uid) => refreshAfter(() => adminUnsuspendUser(uid))} onDelete={(uid) => refreshAfter(() => adminDeleteAccount(uid))} refreshControl={refreshControl} />}
        {tab === 'Content' && <ContentList prayers={prayers} onDelete={(id, type) => refreshAfter(() => adminDeleteContent(id, type))} refreshControl={refreshControl} />}
        {tab === 'Announcements' && <AnnouncementsAdminList announcements={announcements} onChanged={refreshAdminData} refreshControl={refreshControl} />}
        {tab === 'Analytics' && <AnalyticsPanel user={user} />}
      </AsyncState>
    </ScreenScaffold>
  );
}

async function runAdminAction(action, errorTitle) {
  try {
    await action();
  } catch (error) {
    Alert.alert(errorTitle, getErrorMessage(error));
  }
}

function AnalyticsPanel({ user }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mountedRef = useRef(false);
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  const loadMetrics = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError('');
    getSpiritualEngagementMetrics(30, { signal: controller.signal })
      .then((result) => {
        if (mountedRef.current && requestId === requestIdRef.current) setMetrics(result);
      })
      .catch((err) => {
        if (err?.name === 'AbortError' || controller.signal.aborted) return;
        if (mountedRef.current && requestId === requestIdRef.current) {
          setError(getErrorMessage(err, 'Failed to load analytics'));
        }
      })
      .finally(() => {
        if (mountedRef.current && requestId === requestIdRef.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadMetrics();
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [loadMetrics]);

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
  const maxActivityCount = Math.max(...chartActivity.map((entry) => entry.count), 1);
  const totalActivity = chartActivity.reduce((sum, entry) => sum + Number(entry.count || 0), 0);
  const retentionValue = metrics.windowTooShortForRetention ? '-' : `${m.retentionRate}%`;

  return (
    <View style={styles.section}>
      <Heading level="h3">Spiritual Engagement</Heading>
      <BodyText variant="caption" style={styles.sectionSubtitle}>Last {metrics.window?.days || 30} days</BodyText>

      <View style={styles.statsGrid}>
        <StatCard value={String(m.requestCount)} label="Prayer Requests" style={styles.adminStatCard} />
        <StatCard value={`${m.responseRate}%`} label="Response Rate" style={styles.adminStatCard} />
        <StatCard value={String(m.density)} label="Prayers per Request" style={styles.adminStatCard} />
        <StatCard value={String(m.activePrayingUsers7d)} label="Active Praying Users (7d)" style={styles.adminStatCard} />
      </View>

      <View style={styles.statsGrid}>
        <StatCard value={String(m.requestOnly)} label="Request Only" style={styles.adminStatCard} />
        <StatCard value={String(m.prayOnly)} label="Pray Only" style={styles.adminStatCard} />
        <StatCard value={String(m.both)} label="Both" style={styles.adminStatCard} />
        <StatCard value={retentionValue} label="7-Day Retention" style={styles.adminStatCard} />
      </View>

      <View style={styles.statsGrid}>
        <StatCard value={String(m.averageTimeToFirstPrayerMinutes ?? '-')} label="Avg Time to First Prayer (min)" style={styles.adminStatCard} />
        <StatCard value={String(m.medianTimeToFirstPrayerMinutes ?? '-')} label="Median Time to First Prayer (min)" style={styles.adminStatCard} />
        <StatCard value={String(m.retentionEligible)} label="Retention Eligible" style={styles.adminStatCard} />
        <StatCard value={String(m.totalPrayActions)} label="Total Pray Actions" style={styles.adminStatCard} />
      </View>

      {chartActivity.length > 0 ? (
        <GlassCard style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <View>
              <Heading level="h4" style={styles.chartHeading}>Prayer Activity</Heading>
              <BodyText variant="caption" style={styles.chartTitle}>Latest 14 days</BodyText>
            </View>
            <View style={styles.chartSummary}>
              <BodyText variant="label">{totalActivity}</BodyText>
              <BodyText variant="caption">total</BodyText>
            </View>
          </View>
          <View style={styles.chartFrame}>
            <View style={styles.chartYAxis}>
              <BodyText variant="caption" style={styles.axisLabel}>{maxActivityCount}</BodyText>
              <BodyText variant="caption" style={styles.axisLabel}>{Math.round(maxActivityCount / 2)}</BodyText>
              <BodyText variant="caption" style={styles.axisLabel}>0</BodyText>
            </View>
            <View style={styles.chartBars}>
              {chartActivity.map((entry) => {
                const height = Math.max(6, (entry.count / maxActivityCount) * 96);
                return (
                  <View key={entry.day} style={styles.barWrap}>
                    <BodyText variant="caption" style={styles.barValue}>{entry.count}</BodyText>
                    <View style={[styles.bar, { height }]} />
                    <BodyText variant="caption" style={styles.barLabel}>{entry.day.slice(5)}</BodyText>
                  </View>
                );
              })}
            </View>
          </View>
        </GlassCard>
      ) : null}
    </View>
  );
}

function OverviewStats({ users, prayers, reports }) {
  return (
    <View style={styles.section}>
      <View style={styles.statsGrid}>
        <StatCard value={String(users.length)} label="Users" style={styles.adminStatCard} />
        <StatCard value={String(prayers.length)} label="Prayers" style={styles.adminStatCard} />
        <StatCard value={String(reports.filter((r) => r.status === 'pending').length)} label="Open Reports" style={styles.adminStatCard} />
        <StatCard value={String(prayers.filter((p) => p.status === 'answered').length)} label="Answered Prayers" style={styles.adminStatCard} />
      </View>
    </View>
  );
}

function ReportsList({ reports, go, onResolve, onDismiss, refreshControl }) {
  return (
    <FlatList
      data={reports}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={refreshControl}
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
              <PrimaryButton label="Resolve" onPress={() => runAdminAction(() => onResolve(item.id), 'Could not resolve report')} style={styles.actionBtn} textStyle={styles.actionText} />
              <PrimaryButton label="Dismiss" onPress={() => runAdminAction(() => onDismiss(item.id), 'Could not dismiss report')} variant="ghost" style={styles.actionBtnOutline} />
            </View>
          </GlassCard>
        </Pressable>
      )}
    />
  );
}

function MembersList({ users, currentUid, onSuspend, onUnsuspend, onDelete, refreshControl }) {
  const [search, setSearch] = useState('');
  const filtered = users.filter((u) => `${u.displayName || ''} ${u.email || ''}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.section}>
      <TextInput value={search} onChangeText={setSearch} placeholder="Search members..." style={styles.searchInput} placeholderTextColor={colors.textMuted} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={refreshControl}
        ListEmptyComponent={<EmptyState label="No members found." />}
        renderItem={({ item }) => (
          <GlassCard style={styles.card}>
            <BodyText variant="label">{item.displayName || 'Unknown'}</BodyText>
            <BodyText variant="caption">{item.email}</BodyText>
            <Heading level="eyebrow" style={styles.memberRole}>{item.role || 'user'}{item.suspended ? ' (suspended)' : ''}</Heading>
            {item.id !== currentUid && item.role !== 'admin' ? (
              <View style={styles.cardActions}>
                <PrimaryButton
                  label={item.suspended ? 'Restore' : 'Suspend'}
                  variant="ghost"
                  onPress={() => {
                    Alert.alert(item.suspended ? 'Restore User' : 'Suspend User', 'Are you sure?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: item.suspended ? 'Restore' : 'Suspend', style: item.suspended ? 'default' : 'destructive', onPress: () => runAdminAction(() => item.suspended ? onUnsuspend(item.id) : onSuspend(item.id, 'Admin action'), item.suspended ? 'Could not restore user' : 'Could not suspend user') },
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
                      { text: 'Delete', style: 'destructive', onPress: () => runAdminAction(() => onDelete(item.id), 'Could not delete account') },
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

function AnnouncementsAdminList({ announcements, onChanged, refreshControl }) {
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
    if (Number.isNaN(new Date(startsAt).getTime())) {
      Alert.alert('Invalid start time', 'Enter a valid ISO timestamp.');
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
      onChanged?.();
      Alert.alert('Saved', 'Announcement saved.');
    } catch (error) {
      Alert.alert('Could not save', getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const archiveAnnouncement = async (announcementId) => {
    try {
      await adminArchiveAnnouncement(announcementId);
      if (editingId === announcementId) setEditingId(null);
      onChanged?.();
    } catch (error) {
      Alert.alert('Could not archive', getErrorMessage(error));
    }
  };

  return (
    <View style={styles.section}>
      <GlassCard style={styles.formCard}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Announcement title" style={styles.searchInput} placeholderTextColor={colors.textMuted} />
        <TextInput value={body} onChangeText={setBody} placeholder="Announcement body" multiline style={[styles.searchInput, styles.textArea]} placeholderTextColor={colors.textMuted} />
        <TextInput value={startsAt} onChangeText={setStartsAt} placeholder="Starts at ISO timestamp" style={styles.searchInput} placeholderTextColor={colors.textMuted} />
        <PillTabs tabs={ANNOUNCEMENT_CATEGORIES} active={category} onChange={setCategory} style={styles.categoryTabs} />
        <PrimaryButton label={busy ? 'Saving...' : editingId ? 'Update Announcement' : 'Create Announcement'} onPress={saveAnnouncement} disabled={busy} busy={busy} />
      </GlassCard>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={refreshControl}
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
                onPress={() => {
                  setEditingId(item.id);
                  setTitle(item.title);
                  setBody(item.body);
                  setCategory(item.category);
                  setStartsAt(item.startsAt instanceof Date ? item.startsAt.toISOString() : item.startsAt || new Date().toISOString());
                }}
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

function ContentList({ prayers, onDelete, refreshControl }) {
  const allContent = [
    ...prayers.map((p) => ({ ...p, contentType: 'prayer' })),
  ];

  return (
    <FlatList
      data={allContent}
      keyExtractor={(item) => `${item.contentType}-${item.id}`}
      contentContainerStyle={styles.list}
      refreshControl={refreshControl}
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
                { text: 'Delete', style: 'destructive', onPress: () => runAdminAction(() => onDelete(item.id, item.contentType), 'Could not delete content') },
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
  adminStatCard: { minWidth: 140 },
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
  chartHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.md },
  chartHeading: { fontSize: 18, lineHeight: 23 },
  chartTitle: { color: colors.ink3 },
  chartSummary: { alignItems: 'flex-end' },
  chartFrame: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.sm },
  chartYAxis: { width: 22, height: 132, justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 18 },
  axisLabel: { fontSize: 9, color: colors.ink4 },
  chartBars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 4, minHeight: 132, borderBottomWidth: 1, borderBottomColor: colors.border },
  barWrap: { flex: 1, minWidth: 12, alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  barValue: { fontSize: 9, fontFamily: fonts.sansBold, color: colors.ink3 },
  bar: { width: '100%', maxWidth: 18, borderRadius: 5, backgroundColor: colors.gold, minHeight: 3 },
  barLabel: { fontSize: 8, marginTop: 2, color: colors.ink4 },
});
