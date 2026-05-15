import { useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import Card from '../ui/Card';
import { useReports, resolveReport, dismissReport } from '../../hooks/useReports';
import { useIsAdmin } from '../../hooks/useIsAdmin';

export default function ReportDetails({ onBack, activeTab, onNavigate, reportId, type = 'report' }) {
  const { isAdmin } = useIsAdmin();
  const { reports: firebaseReports } = useReports();
  const [actionTaken, setActionTaken] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const report = firebaseReports.find((r) => r.id === reportId);

  if (!isAdmin) {
    return (
      <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
        <AppHeader title="Access Denied" onBack={onBack} />
        <div className="mt-10 px-5 text-center">
          <p className="text-sm text-slate-600">You do not have permission to view this report.</p>
        </div>
      </AppScreen>
    );
  }

  if (!report) {
    return (
      <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
        <AppHeader title="Report Details" onBack={onBack} />
        <div className="mt-10 px-5 text-center">
          <p className="text-sm text-slate-500">Report not found.</p>
        </div>
      </AppScreen>
    );
  }

  const handleAction = (action) => {
    setActionTaken(action);
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    try {
      if (actionTaken === 'dismissed') {
        await dismissReport(reportId);
      } else {
        await resolveReport(reportId);
      }
    } catch (err) {
      console.error('Failed to update report:', err);
    }
    setShowConfirm(false);
    onBack();
  };

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Report Details" onBack={onBack} />
      <div className="mt-4 px-5 space-y-4">
        <Card className={`space-y-3 p-4 ${report.status === 'resolved' ? 'border-green-300 bg-green-50' : report.status === 'dismissed' ? 'border-slate-300 bg-slate-50' : ''}`}>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Report ID</span>
            <span className="font-mono text-slate-800">{report.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Reported by</span>
            <span className="font-semibold text-slate-800">{report.reportedByUid}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Target ID</span>
            <span className="font-semibold text-slate-800">{report.targetId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Target type</span>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">{report.targetType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Status</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              report.status === 'pending' ? 'bg-amber-100 text-amber-700' :
              report.status === 'resolved' ? 'bg-green-100 text-green-700' :
              report.status === 'dismissed' ? 'bg-slate-100 text-slate-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {report.status}
            </span>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reason</p>
          <p className="mt-2 text-sm leading-5 text-slate-700">{report.reason}</p>
        </Card>

        {showConfirm && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900">Confirm Action</h4>
                <p className="mt-1 text-xs text-amber-700">You are about to {actionTaken === 'dismissed' ? 'dismiss' : 'resolve'} this report.</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={confirmAction}
                    className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition active:scale-95"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="rounded-xl border border-amber-200 bg-white px-4 py-2 text-xs font-semibold text-amber-700 transition active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {report.status === 'pending' && (
          <div className="space-y-2">
            <button
              onClick={() => handleAction('resolved')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-700 py-3.5 font-semibold text-white transition active:scale-[0.98]"
            >
              <CheckCircle2 size={18} /> Resolve Report
            </button>
            <button
              onClick={() => handleAction('dismissed')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/75 py-3.5 font-semibold text-slate-600 transition active:scale-[0.98]"
            >
              <X size={18} /> Dismiss Report
            </button>
            <p className="rounded-2xl border border-slate-200 bg-white/70 p-3 text-xs leading-5 text-slate-500">
              Content deletion, warnings, blocking, and suspension are disabled until the moderation backend is implemented.
            </p>
          </div>
        )}

        {report.status === 'resolved' && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 size={20} />
              <span className="font-semibold">Resolved</span>
            </div>
            <p className="mt-2 text-sm text-green-700">This report has been resolved.</p>
          </div>
        )}

        {report.status === 'dismissed' && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-700">
              <X size={20} />
              <span className="font-semibold">Dismissed</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">This report has been dismissed.</p>
          </div>
        )}
      </div>
    </AppScreen>
  );
}
