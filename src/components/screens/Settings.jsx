import { ChevronRight, User, ShieldCheck, Bell, BookOpen, HelpCircle, Info, LogOut, Power } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';

export default function Settings({ onBack, activeTab, onNavigate, onSection, onSignOut, onExitApp, onDeleteAccount }) {
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
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Account deletion is temporarily disabled until the backend cleanup endpoint is live.
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
