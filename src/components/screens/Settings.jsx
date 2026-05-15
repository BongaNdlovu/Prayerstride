import { useState } from 'react';
import { ChevronRight, User, ShieldCheck, Bell, BookOpen, HelpCircle, Info, LogOut, Power, Trash2, AlertTriangle } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import { deleteOwnAccount } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function Settings({ onBack, activeTab, onNavigate, onSection, onSignOut, onExitApp, onDeleteAccount }) {
  const { signOut } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const sections = [
    { title: 'Account', items: [
      { icon: User, label: 'Edit Profile', key: 'editProfile' },
      { icon: ShieldCheck, label: 'Privacy', key: 'privacy' },
    ]},
    { title: 'Preferences', items: [
      { icon: Bell, label: 'Notifications', key: 'notifications' },
    ]},
    { title: 'Support', items: [
      { icon: HelpCircle, label: 'Help & Support', key: 'help' },
      { icon: BookOpen, label: 'Give Feedback', key: 'feedback' },
      { icon: Info, label: 'About PrayerStride', key: 'about' },
    ]},
  ];

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteOwnAccount();
      await signOut();
    } catch (err) {
      setDeleteError(err);
      setDeleting(false);
    }
  };

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Settings" onBack={onBack} />
      <div className="mt-4 px-4 space-y-6">
        {sections.map((sec) => (
          <div key={sec.title}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{sec.title}</h3>
            <div className="mt-2 space-y-2">
              {sec.items.map((item) => (
                <button key={item.key} onClick={() => onSection?.(item.key)} className="flex w-full items-center justify-between rounded-2xl border border-[#e6ddcf] bg-white/75 p-4 text-left transition active:scale-[0.98]">
                  <span className="flex items-center gap-3 font-semibold text-slate-800">
                    <item.icon size={19} className="text-navy" /> {item.label}
                  </span>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="space-y-2">
          <button onClick={onSignOut} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-4 font-semibold text-red-700 transition active:scale-[0.98]">
            <LogOut size={18} /> Sign Out
          </button>
          <button onClick={onExitApp} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e6ddcf] bg-white/75 py-4 font-semibold text-slate-700 transition active:scale-[0.98]">
            <Power size={18} /> Exit App
          </button>

          {showDeleteConfirm ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Delete Account</h4>
                  <p className="mt-1 text-xs text-red-700">This permanently deletes your account, all prayers, testimonies, and data. This cannot be undone.</p>
                  {deleteError && (
                    <p className="mt-2 text-xs font-semibold text-red-800">{deleteError.message || 'Could not delete account. Please try again.'}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition active:scale-95 disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Delete Permanently'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                      className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white/75 py-4 font-semibold text-red-600 transition active:scale-[0.98]"
            >
              <Trash2 size={18} /> Delete Account
            </button>
          )}
        </div>
      </div>
    </AppScreen>
  );
}
