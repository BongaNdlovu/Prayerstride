import { useState } from 'react';
import { Users, FileText, AlertTriangle, Ban, ShieldCheck, HeartHandshake, MessageSquare, Settings, Flag, Pin, Bell, Eye, Clock, Megaphone, Lock, UserCheck, Radio, CheckCircle2, Archive, Search } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import StatCard from '../ui/StatCard';
import Card from '../ui/Card';
import MiniLineChart from '../ui/MiniLineChart';
import { mockAdminStats, mockReports, mockUsers, mockAnnouncements } from '../../data/mockData';
import { usePersistentState } from '../../hooks/usePersistentState';

export default function AdminDashboard({ onBack, activeTab, onNavigate, onGo }) {
  const [reports, setReports] = usePersistentState('admin:reports', mockReports);
  const [ownerSettings, setOwnerSettings] = usePersistentState('admin:owner-settings', {
    prayerReview: true,
    testimonyReview: false,
    publicGroups: true,
    newSignups: true,
  });
  const [activeTabFilter, setActiveTabFilter] = useState('overview');
  const [showMenu, setShowMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const openReports = reports.filter((r) => r.status === 'open');
  const resolvedReports = reports.filter((r) => r.status === 'resolved');
  const dismissedReports = reports.filter((r) => r.status === 'dismissed');
  const filteredUsers = mockUsers.filter((user) => `${user.name} ${user.handle} ${user.role}`.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleViewReport = (reportId) => {
    onGo?.('reportDetails', { reportId });
  };

  const updateReportStatus = (reportId, status) => {
    setReports((current) => current.map((report) => report.id === reportId ? { ...report, status } : report));
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
              <p className="mt-1 text-xs leading-5 text-white/72">Care for members, moderate sensitive content, publish updates, and keep the PrayerStride community trustworthy.</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'reports', label: `Reports (${openReports.length})` },
            { key: 'members', label: 'Members' },
            { key: 'content', label: 'Content' },
            { key: 'broadcasts', label: 'Broadcasts' },
            { key: 'stewardship', label: 'Settings' },
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
              <StatCard icon={Users} value={mockAdminStats.activeUsers.toLocaleString()} label="Active Users" />
              <StatCard icon={FileText} value={mockAdminStats.newPrayerRequests.toLocaleString()} label="New Requests" />
              <StatCard icon={AlertTriangle} value={openReports.length.toLocaleString()} label="Open Reports" />
              <StatCard icon={Ban} value={mockAdminStats.usersSuspended.toLocaleString()} label="Suspended" />
            </div>
            <h3 className="font-serif text-lg text-navy">Recent Activity</h3>
            <div className="space-y-2">
              {mockAdminStats.recentActivity.map((a) => (
                <Card key={a.id} className="flex items-center justify-between p-3">
                  <span className="text-sm text-slate-700">{a.text}</span>
                  <span className="text-[10px] text-slate-400">{a.time}</span>
                </Card>
              ))}
            </div>
            <h3 className="font-serif text-lg text-navy">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Flag, label: 'Review Reports', action: 'reviewReports' },
                { icon: Users, label: 'Manage Members', action: 'manageUsers' },
                { icon: Pin, label: 'Featured Prayers', action: 'pinned' },
                { icon: Bell, label: 'Announcements', action: 'announcements' },
                { icon: Settings, label: 'App Settings', action: 'settings' },
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
            <h3 className="font-serif text-lg text-navy">Community Health</h3>
            <Card className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-serif text-navy">{mockAdminStats.positiveContent}%</div>
                  <div className="text-[10px] text-slate-500">Positive Content</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-serif text-navy">{(mockAdminStats.thanksShared / 1000).toFixed(1)}k</div>
                  <div className="text-[10px] text-slate-500">Thanks Shared</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-serif text-navy">{mockAdminStats.prayersAnswered}</div>
                  <div className="text-[10px] text-slate-500">Prayers Answered</div>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <MiniLineChart data={mockAdminStats.adminChart} width={260} height={100} />
              </div>
            </Card>
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
                          report.status === 'open' ? 'bg-amber-100 text-amber-700' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">{report.content}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <span>By: {report.reportedBy}</span>
                        <span>User: {report.reportedUser}</span>
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
                  {report.status === 'open' && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={() => updateReportStatus(report.id, 'resolved')} className="flex items-center justify-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-xs font-semibold text-white transition active:scale-95">
                        <CheckCircle2 size={14} />
                        Resolve
                      </button>
                      <button onClick={() => updateReportStatus(report.id, 'dismissed')} className="flex items-center justify-center gap-1.5 rounded-xl border border-[#e6ddcf] bg-sand px-3 py-2 text-xs font-semibold text-slate-700 transition active:scale-95">
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
              {filteredUsers.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-navy" style={{ background: user.avatarColor }}>
                      {user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-900">{user.name}</h3>
                        <span className="shrink-0 rounded-full bg-[#f2e7d6] px-2 py-0.5 text-[10px] font-medium text-navy">{user.role}</span>
                      </div>
                      <p className="truncate text-xs text-slate-500">{user.handle} · {user.bio}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button className="rounded-xl bg-navy px-2 py-2 text-xs font-semibold text-white">Message</button>
                    <button className="rounded-xl border border-[#e6ddcf] bg-sand px-2 py-2 text-xs font-semibold text-slate-700">Role</button>
                    <button className="rounded-xl border border-red-200 bg-red-50 px-2 py-2 text-xs font-semibold text-red-700">Suspend</button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {activeTabFilter === 'content' && (
          <div className="space-y-3">
            {[
              { icon: FileText, title: 'Prayer requests awaiting review', count: 12, detail: 'Sensitive or urgent requests that need a human decision.' },
              { icon: HeartHandshake, title: 'Testimonies awaiting approval', count: 5, detail: 'Answered-prayer stories before they appear in Praise.' },
              { icon: Pin, title: 'Featured community prayers', count: 8, detail: 'Requests promoted to the home and discover sections.' },
              { icon: MessageSquare, title: 'Encouragement comments', count: 19, detail: 'Replies that may need pastoral or moderation care.' },
            ].map((item) => (
              <Card key={item.title} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f2e7d6] text-navy">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-navy px-2 py-1 text-xs font-semibold text-white">{item.count}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTabFilter === 'broadcasts' && (
          <div className="space-y-3">
            <button className="cinematic-button flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-ink transition active:scale-[0.98]">
              <Megaphone size={17} />
              Create Announcement
            </button>
            {mockAnnouncements.slice(0, 4).map((announcement) => (
              <Card key={announcement.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{announcement.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{announcement.type} · {announcement.date} {announcement.time}</p>
                  </div>
                  <span className="rounded-full bg-[#e8f0f6] px-2 py-1 text-[10px] font-semibold text-navy">Scheduled</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTabFilter === 'stewardship' && (
          <div className="space-y-3">
            {[
              { key: 'prayerReview', icon: ShieldCheck, title: 'Review public prayer requests', detail: 'Owner team approves sensitive public requests before they trend.' },
              { key: 'testimonyReview', icon: HeartHandshake, title: 'Review testimonies before publishing', detail: 'Adds a care step for stories shared in Praise.' },
              { key: 'publicGroups', icon: Users, title: 'Allow public group discovery', detail: 'Members can find and join public prayer groups.' },
              { key: 'newSignups', icon: UserCheck, title: 'Allow new account creation', detail: 'Temporarily close signups during maintenance or abuse spikes.' },
            ].map((setting) => (
              <Card key={setting.key} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f2e7d6] text-navy">
                    <setting.icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-900">{setting.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{setting.detail}</p>
                  </div>
                  <button
                    onClick={() => setOwnerSettings((current) => ({ ...current, [setting.key]: !current[setting.key] }))}
                    className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${ownerSettings[setting.key] ? 'bg-navy' : 'bg-slate-300'}`}
                    aria-label={`Toggle ${setting.title}`}
                  >
                    <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${ownerSettings[setting.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </Card>
            ))}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Owner access</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Only app owners, trusted admins, and assigned moderators should see this console.</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppScreen>
  );
}
