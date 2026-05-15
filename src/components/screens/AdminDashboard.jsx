import { useState } from 'react';
import { ArrowLeft, Users, FileText, AlertTriangle, Ban, BarChart3, CheckCircle2, Heart, MessageSquare, Settings, Flag, Pin, Bell, Eye, Clock, MoreHorizontal } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import StatCard from '../ui/StatCard';
import Card from '../ui/Card';
import MiniLineChart from '../ui/MiniLineChart';
import { mockAdminStats, mockReports } from '../../data/mockData';
import { usePersistentState } from '../../hooks/usePersistentState';

export default function AdminDashboard({ onBack, activeTab, onNavigate, onGo }) {
  const [reports, setReports] = usePersistentState('admin:reports', mockReports);
  const [activeTabFilter, setActiveTabFilter] = useState('overview');
  const [showMenu, setShowMenu] = useState(null);

  const openReports = reports.filter((r) => r.status === 'open');
  const resolvedReports = reports.filter((r) => r.status === 'resolved');
  const dismissedReports = reports.filter((r) => r.status === 'dismissed');

  const handleViewReport = (reportId) => {
    onGo?.('reportDetails', { reportId });
  };

  const handleQuickAction = (action) => {
    if (action === 'reviewReports') {
      setActiveTabFilter('reports');
    }
  };

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Admin Dashboard" onBack={onBack} />
      <div className="mt-4 px-5 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'reports', label: `Reports (${openReports.length})` },
            { key: 'users', label: 'Users' },
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
                { icon: Users, label: 'Manage Users', action: 'manageUsers' },
                { icon: Pin, label: 'Pinned Requests', action: 'pinned' },
                { icon: Bell, label: 'Announcements', action: 'announcements' },
                { icon: Settings, label: 'System Settings', action: 'settings' },
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
                    >
                      <Eye size={16} className="text-slate-600" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {activeTabFilter === 'users' && (
          <Card className="p-6 text-center">
            <Users size={32} className="mx-auto text-navy" />
            <h3 className="mt-3 font-serif text-lg text-navy">User Management</h3>
            <p className="mt-2 text-sm text-slate-600">View and manage user accounts, suspensions, and blocks.</p>
          </Card>
        )}

        {activeTabFilter === 'content' && (
          <Card className="p-6 text-center">
            <FileText size={32} className="mx-auto text-navy" />
            <h3 className="mt-3 font-serif text-lg text-navy">Content Moderation</h3>
            <p className="mt-2 text-sm text-slate-600">Review flagged content and take moderation actions.</p>
          </Card>
        )}
      </div>
    </AppScreen>
  );
}
