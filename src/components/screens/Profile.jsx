import { useState } from 'react';
import { Settings, ChevronRight, Heart, Bell, BarChart3, Clock, Camera, ShieldCheck, Flag } from 'lucide-react';
import PrayingHandsIcon from '../PrayingHandsIcon';
import BottomNav from '../BottomNav';
import SceneImage from '../ui/SceneImage';
import { usePersistentState } from '../../hooks/usePersistentState';
import { usePrayerData } from '../../hooks/usePrayerData';
import { useIsAdmin } from '../../hooks/useIsAdmin';
import { submitReport } from '../../hooks/useReports';

export default function Profile({ activeTab, onNavigate, onGo, user }) {
  const { prayers } = usePrayerData(user);
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [reported, setReported] = useState(false);
  const [profile] = usePersistentState(`profile:${user?.id || 'guest'}`, {
    name: user?.name || 'Guest',
    handle: user?.handle || '',
    bio: '',
  });
  const userPrayers = prayers.filter((prayer) => prayer.authorUid === user?.uid);
  const answeredCount = userPrayers.filter((prayer) => prayer.status === 'answered').length;

  const handleReport = async () => {
    if (reported || !user?.uid) return;
    try {
      await submitReport(user.uid, 'user', 'Reported by user', user);
      setReported(true);
    } catch {}
  };
  const menu = [
    { icon: PrayingHandsIcon, label: 'My Prayers', key: 'myPrayers' },
    { icon: Heart, label: 'Answered Prayers', key: 'answeredPrayers' },
    { icon: BarChart3, label: 'My Stats', key: 'myStats' },
    { icon: Clock, label: 'Prayer Stopwatch', key: 'prayerStopwatch' },
    { icon: Bell, label: 'Notifications', key: 'notifications' },
    ...(isAdmin && !adminLoading ? [{ icon: ShieldCheck, label: 'Stewardship Console', key: 'adminDashboard' }] : []),
    { icon: Settings, label: 'Settings', key: 'settings' },
  ];

  return (
    <div className="cinematic-bg relative flex h-full flex-col overflow-hidden text-ivory">
      <SceneImage scene="community" className="absolute inset-0 opacity-55" />
      <div className="absolute inset-0 bg-ink/66" />
      <div className="no-scrollbar relative z-10 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-ivory">Profile</h1>
        <div className="flex items-center gap-3">
          <button onClick={handleReport} disabled={reported} className={`text-ivory transition ${reported ? 'opacity-40' : 'hover:text-red-300'}`} aria-label="Report user">
            <Flag size={18} fill={reported ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => onGo?.('settings')} className="text-ivory"><Settings size={22} /></button>
        </div>
      </div>
      <div className="glass-panel mt-6 rounded-[28px] p-4 text-center">
        <button onClick={() => onGo?.('editProfile')} className="relative mx-auto block h-20 w-20">
          {user?.photoURL || profile.photoURL ? (
            <img src={user?.photoURL || profile.photoURL} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-candle/18 text-candle">
              <Camera size={24} />
            </div>
          )}
          <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-candle text-ink shadow-sm">
            <Camera size={14} />
          </span>
        </button>
        <h2 className="mt-3 font-serif text-xl text-ivory">{profile.name || user?.name || 'Guest'}</h2>
        <p className="mt-1 text-xs text-ivory/58">{profile.bio || user?.email || 'Sign in to sync your prayer journey.'}</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            [userPrayers.length, "Prayers"],
            [answeredCount, "Answered"],
            [7, "Streak"],
          ].map(([n, l]) => (
            <div key={l} className="rounded-2xl bg-ivory/10 p-3">
              <div className="font-serif text-2xl text-ivory">{n}</div>
              <div className="text-xs text-ivory/55">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {menu.map((item) => (
          <button key={item.label} onClick={() => onGo?.(item.key)} className="flex min-h-[58px] w-full items-center justify-between gap-3 rounded-2xl border border-ivory/15 bg-ivory/10 p-4 backdrop-blur transition active:scale-[0.98]">
            <span className="flex min-w-0 items-center gap-3 font-semibold text-ivory">
              <item.icon size={19} className="text-candle" />
              <span className="truncate">{item.label}</span>
            </span>
            <ChevronRight size={18} className="text-ivory/45" />
          </button>
        ))}
      </div>
      </div>
      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
