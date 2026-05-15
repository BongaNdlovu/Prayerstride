import { Eye, Flame, Globe2, Send, ShieldCheck, UserRound } from 'lucide-react';
import BottomNav from '../BottomNav';
import { usePersistentState } from '../../hooks/usePersistentState';
import { usePrayerData } from '../../hooks/usePrayerData';

export default function Create({ onGo, activeTab, onNavigate, user }) {
  const [text, setText] = usePersistentState('draft:prayer-request', '');
  const [settings, setSettings] = usePersistentState('draft:prayer-settings', {
    privacy: true,
    urgency: false,
    anonymous: false,
    shareable: true,
  });
  const { addPrayer } = usePrayerData(user);

  const options = [
    { key: 'privacy', icon: Globe2, title: 'Community', text: 'Visible to trusted PrayerStride members' },
    { key: 'urgency', icon: Flame, title: 'Time-sensitive', text: 'Ask others to pray soon' },
    { key: 'anonymous', icon: UserRound, title: 'Anonymous', text: 'Hide my name from this request' },
    { key: 'shareable', icon: Send, title: 'Shareable', text: 'Allow others to share this request' },
  ];

  const toggle = (key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  const post = () => {
    if (!text.trim()) return;
    const title = text.trim().split('\n')[0]?.slice(0, 64) || 'Prayer request';
    const request = {
      id: `local-${Date.now()}`,
      userId: user?.id || 'me',
      name: settings.anonymous ? 'Anonymous' : user?.name || 'You',
      title,
      text: text.trim(),
      status: 'active',
      tag: settings.urgency ? 'Urgent' : 'General',
      urgency: settings.urgency,
      anonymous: settings.anonymous,
      allowShare: settings.shareable,
      privacy: settings.privacy ? 'community' : 'private',
      count: 0,
      time: 'just now',
    };

    addPrayer(request);
    setText('');
    onGo("myPrayers");
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-sand">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-4">
      <div className="mt-4 flex items-center justify-between">
        <button onClick={() => onGo("home")} className="text-sm text-slate-700">
          Cancel
        </button>
        <h1 className="font-semibold text-slate-900">Create Request</h1>
        <button onClick={post} className="text-sm font-semibold text-navy">Post</button>
      </div>
      <h2 className="mt-10 font-serif text-3xl leading-tight text-navy">
        What do you need
        <br />
        prayer for?
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">Share as much or as little as you're comfortable with.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="mt-7 h-40 w-full resize-none rounded-2xl border border-[#e6ddcf] bg-white/80 p-4 text-sm outline-none focus:border-navy" placeholder="Write your request..." />
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex gap-4">
          <Eye size={18} />
          <Flame size={18} />
          <ShieldCheck size={18} />
        </div>
        <span>{text.length}/1500</span>
      </div>
      <div className="mt-6 space-y-3">
        {options.map(({ key, icon: Icon, title, text }) => {
          const on = settings[key];
          return (
            <button key={key} onClick={() => toggle(key)} className="flex w-full items-center justify-between rounded-2xl border border-[#e6ddcf] bg-white/75 p-4 text-left transition active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${on ? 'bg-[#e8f0f6] text-navy' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{title}</div>
                  <div className="text-xs text-slate-500">{text}</div>
                </div>
              </div>
              <div className={`h-8 w-14 shrink-0 rounded-full p-1 transition ${on ? "bg-navy" : "bg-slate-200"}`}>
                <div className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-6" : "translate-x-0"}`} />
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-slate-400">By posting, you agree to our community guidelines.</p>
      </div>
      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
