import { useState } from 'react';
import { Users, FileText, AlertTriangle, ShieldCheck, HeartHandshake, Flag, Eye, CheckCircle2, Archive, Search, Trash2, Ban } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import StatCard from '../ui/StatCard';
import Card from '../ui/Card';
import { useReports, resolveReport, dismissReport } from '../../hooks/useReports';
import { useIsAdmin } from '../../hooks/useIsAdmin';
import { useUsers } from '../../hooks/useUsers';
import { usePrayers } from '../../hooks/usePrayers';
import { useTestimonies } from '../../hooks/useTestimonies';
import { adminDeleteContent, adminSuspendUser } from '../../lib/api';
import EmptyState from '../ui/EmptyState';

const reportsRoute = 'admin:reports';

export default function AdminDashboard({ onBack, activeTab, onNavigate, onGo }) {
  const { isAdmin } = useIsAdmin();
  const { reports: firebaseReports } = useReports();
  const { users } = useUsers();
  const { prayers } = usePrayers();
  const { testimonies } = useTestimonies();
  const [activeTabFilter, setActiveTabFilter] = useState('overview');
  const [showMenu, setShowMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const reports = firebaseReports.length > 0 ? firebaseReports.map((r) => ({
    id: r.id,
    reportedBy: r.reportedByUid,
    reportedUser: r.targetId,
    content: r.reason,
    reason: r.targetType,
    status: r.status,
  })) : [];

  const openReports = reports.filter((r) => r.status === 'pending');
  const resolvedReports = reports.filter((r) => r.status === 'resolved');
  const dismissedReports = reports.filter((r) => r.status === 'dismissed');
  const filteredUsers = users.filter((user) => `${user.displayName || ''} ${user.email || ''} ${user.role || ''}`.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleViewReport = (reportId) => {
    onGo?.('reportDetails', { reportId });
  };

  const handleQuickAction = (action) => {
    if (action === 'reviewReports') {
      setActiveTabFilter('reports');
    } else if (action === 'manageUsers') {
      setActiveTabFilter('members');
    } else if (action === 'announcements') {
      setActiveTabFilter('broadcasts');
    } else if (action === 'settings') {
      setActiveTabFilter('stewardship');
    }
  };

  if (!isAdmin) {
    return (
      <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
        <AppHeader title="Access Denied" onBack={onBack} />
        <div className="mt-10 px-5 text-center">
          <ShieldCheck size={48} className="mx-auto text-slate-300" />
          <p className="mt-4 text-sm text-slate-600">You do not have permission to access this area.</p>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Stewardship Console" onBack={onBack} />
      <div className="mt-4 px-5 space-y-4">
        <Card className="bg-navy p-4 text-white">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-candle text-ink">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl">Owner tools</h2>
              <p className="mt-1 text-xs leading-5 text-white/72">Care for members, review reports, and keep the PrayerStride community trustworthy.</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'reports', label: `Reports (${openReports.length})` },
            { key: 'members', label: 'Members' },
            { key: 'content', label: 'Content' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTabFilter(tab.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${activeTabFilter === tab.key ? 'bg-navy text-white' : 'bg-white text-slate-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTabFilter === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Users} value={users.length.toLocaleString()} label="Members" />
              <StatCard icon={FileText} value={prayers.length.toLocaleString()} label="Prayer Requests" />
              <StatCard icon={AlertTriangle} value={openReports.length.toLocaleString()} label="Open Reports" />
              <StatCard icon={HeartHandshake} value={testimonies.length.toLocaleString()} label="Testimonies" />
            </div>
            <h3 className="font-serif text-lg text-navy">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Flag, label: 'Review Reports', action: 'reviewReports' },
                { icon: Users, label: 'Manage Members', action: 'manageUsers' },
              ].map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => handleQuickAction(qa.action)}
                  className="warm-panel flex min-h-[58px] items-center gap-2 rounded-2xl p-3 text-left transition active:scale-[0.98]"
                >
                  <qa.icon size={18} className="text-navy" />
                  <span className="min-w-0 text-xs font-semibold leading-snug text-slate-800">{qa.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {activeTabFilter === 'reports' && (
          <>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All', count: reports.length },
                { key: 'open', label: 'Open', count: openReports.length },
                { key: 'resolved', label: 'Resolved', count: resolvedReports.length },
                { key: 'dismissed', label: 'Dismissed', count: dismissedReports.length },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setShowMenu(filter.key === showMenu ? null : filter.key)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    showMenu === filter.key ? 'bg-navy text-white' : 'bg-sand text-slate-600'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {(showMenu === 'open' ? openReports :
                showMenu === 'resolved' ? resolvedReports :
                showMenu === 'dismissed' ? dismissedReports :
                reports).map((report) => (
                <Card key={report.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">{report.reason}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          report.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">{report.content}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <span>By: {report.reportedBy}</span>
                        <span>Target: {report.reportedUser}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewReport(report.id)}
                      className="ml-3 flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition"
                      aria-label="View report details"
                    >
                      <Eye size={16} className="text-slate-600" />
                    </button>
                  </div>
                  {(report.status === 'pending') && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={() => resolveReport(report.id)} className="flex items-center justify-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-xs font-semibold text-white transition active:scale-95">
                        <CheckCircle2 size={14} />
                        Resolve
                      </button>
                      <button onClick={() => dismissReport(report.id)} className="flex items-center justify-center gap-1.5 rounded-xl border border-[#e6ddcf] bg-sand px-3 py-2 text-xs font-semibold text-slate-700 transition active:scale-95">
                        <Archive size={14} />
                        Dismiss
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}

        {activeTabFilter === 'members' && (
          <>
            <div className="flex items-center gap-2 rounded-2xl border border-[#e6ddcf] bg-white/80 px-3 py-2.5">
              <Search size={17} className="text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search members"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-3">
              {filteredUsers.length === 0 && (
                <EmptyState icon={Users} title="No members found" subtitle="Real users will appear here after account creation." />
              )}
              {filteredUsers.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ded3c4] text-sm font-semibold text-navy">
                      {(user.displayName || user.email || 'U').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-900">{user.displayName || 'PrayerStride member'}</h3>
                        <span className="shrink-0 rounded-full bg-[#f2e7d6] px-2 py-0.5 text-[10px] font-medium text-navy">{user.role}</span>
                        {user.suspended && <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">Suspended</span>}
                      </div>
                      <p className="truncate text-xs text-slate-500">{user.email || 'No email'}</p>
                    </div>
                    {user.role !== 'admin' && (
                      <button
                        onClick={async () => {
                          try { await adminSuspendUser(user.id, 'Suspended by admin'); } catch (err) { console.error(err); }
                        }}
                        className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-red-50 transition"
                        aria-label="Suspend user"
                      >
                        <Ban size={16} className="text-red-500" />
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {activeTabFilter === 'content' && (
          <div className="space-y-3">
            <h3 className="font-serif text-lg text-navy">Live Content ({prayers.length + testimonies.length})</h3>
            {prayers.map((prayer) => (
              <Card key={prayer.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-slate-900">{prayer.title}</h4>
                    <p className="mt-1 text-xs text-slate-500 truncate">{prayer.authorName || 'Unknown'}</p>
                  </div>
                  <button
                    onClick={async () => {
                      try { await adminDeleteContent(prayer.id, 'prayer'); } catch (err) { console.error(err); }
                    }}
                    className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-red-50 transition"
                    aria-label="Delete prayer"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </Card>
            ))}
            {testimonies.map((testimony) => (
              <Card key={testimony.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-slate-900">{testimony.title}</h4>
                    <p className="mt-1 text-xs text-slate-500 truncate">{testimony.authorName || 'Unknown'}</p>
                  </div>
                  <button
                    onClick={async () => {
                      try { await adminDeleteContent(testimony.id, 'testimony'); } catch (err) { console.error(err); }
                    }}
                    className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-red-50 transition"
                    aria-label="Delete testimony"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs leading-5 text-slate-500">
          Admin moderation actions (content deletion, user suspension) are now available via the server-enforced Worker endpoints.
        </div>
      </div>
    </AppScreen>
  );
}
