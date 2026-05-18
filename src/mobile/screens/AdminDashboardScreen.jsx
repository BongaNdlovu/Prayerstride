import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { useReports, resolveReport, dismissReport } from '../useReports';
import { useUsers } from '../useUsers';
import { usePrayers, useTestimonies } from '../usePrayerData';
import { useIsAdmin } from '../useIsAdmin';
import { adminDeleteContent, adminSuspendUser, adminDeleteAccount } from '../api';
import CinematicScreen from '../components/CinematicScreen';
import PageHero from '../components/PageHero';
import EmptyState from '../components/EmptyState';

const TABS = ['Overview', 'Reports', 'Members', 'Content'];

export default function AdminDashboardScreen({ user, go }) {
  const { isAdmin } = useIsAdmin(user);
  const { reports } = useReports(true);
  const { users } = useUsers(true);
  const { prayers } = usePrayers(isAdmin);
  const { testimonies } = useTestimonies(isAdmin);
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
    </CinematicScreen>
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
});
