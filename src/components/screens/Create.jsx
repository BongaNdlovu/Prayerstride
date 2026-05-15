import { Eye, Flame, Globe2, Send, ShieldCheck, UserRound } from 'lucide-react';
import { useState } from 'react';
import BottomNav from '../BottomNav';
import SceneImage from '../ui/SceneImage';
import { usePersistentState } from '../../hooks/usePersistentState';
import { addPrayer } from '../../hooks/usePrayers';

export default function Create({ onGo, activeTab, onNavigate, user }) {
  const [text, setText] = usePersistentState('draft:prayer-request', '');
  const [settings, setSettings] = usePersistentState('draft:prayer-settings', {
    privacy: true,
    urgency: false,
    anonymous: false,
    shareable: true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const options = [
    { key: 'privacy', icon: Globe2, title: 'Community', text: 'Visible to trusted PrayerStride members' },
    { key: 'urgency', icon: Flame, title: 'Time-sensitive', text: 'Ask others to pray soon' },
    { key: 'anonymous', icon: UserRound, title: 'Anonymous', text: 'Hide my name from this request' },
    { key: 'shareable', icon: Send, title: 'Shareable', text: 'Allow others to share this request' },
  ];

  const toggle = (key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  const post = async () => {
    if (busy) return;
    if (!text.trim() || !user) {
      setError('Write a prayer request before posting.');
      return;
    }
    const title = text.trim().split('\n')[0]?.slice(0, 64) || 'Prayer request';
    const data = {
      title,
      body: text.trim(),
      isAnonymous: settings.anonymous,
      privacy: settings.privacy ? 'community' : 'private',
      urgent: settings.urgency,
      allowShare: settings.shareable,
    };

    setBusy(true);
    setError('');
    try {
      await addPrayer(data, user);
    } catch (err) {
      setError('We could not post this request. Please try again.');
      setBusy(false);
      return;
    }

    setBusy(false);
    setText('');
    onGo("myPrayers");
  };

  return (
    <div className="cinematic-bg relative flex h-full flex-col overflow-hidden text-ivory">
      <SceneImage scene="dawn" className="absolute inset-0 opacity-70" />
      <div className="absolute inset-0 bg-ink/62" />
      <div className="no-scrollbar relative z-10 min-h-0 flex-1 overflow-y-auto px-5 pb-4">
      <div className="mt-4 flex items-center justify-between">
        <button onClick={() => onGo("home")} className="text-sm text-ivory/70">
          Cancel
        </button>
        <h1 className="font-semibold text-ivory">Create Request</h1>
        <button disabled={busy} onClick={post} className="text-sm font-semibold text-candle disabled:opacity-50">{busy ? 'Posting' : 'Post'}</button>
      </div>
      <h2 className="mt-10 font-serif text-3xl leading-tight text-ivory">
        What do you need
        <br />
        prayer for?
      </h2>
      <p className="mt-3 text-sm leading-6 text-ivory/68">Share as much or as little as you're comfortable with.</p>
      {error && <p className="mt-4 rounded-2xl border border-red-300/30 bg-red-950/35 px-4 py-3 text-sm text-red-100">{error}</p>}
      <textarea value={text} maxLength={1500} onChange={(e) => setText(e.target.value)} className="mt-7 h-40 w-full resize-none rounded-2xl border border-ivory/15 bg-ivory/10 p-4 text-sm text-ivory outline-none placeholder:text-ivory/45 focus:border-candle" placeholder="Write your request..." />
      <div className="mt-3 flex items-center justify-between text-xs text-ivory/45">
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
            <button key={key} onClick={() => toggle(key)} className="flex w-full items-center justify-between rounded-2xl border border-ivory/15 bg-ivory/10 p-4 text-left backdrop-blur transition active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${on ? 'bg-candle text-ink' : 'bg-ivory/10 text-ivory/55'}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="font-semibold text-ivory">{title}</div>
                  <div className="text-xs text-ivory/58">{text}</div>
                </div>
              </div>
              <div className={`h-8 w-14 shrink-0 rounded-full p-1 transition ${on ? "bg-candle" : "bg-ivory/20"}`}>
                <div className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-6" : "translate-x-0"}`} />
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-ivory/45">By posting, you agree to our community guidelines.</p>
      </div>
      <BottomNav active={activeTab} onNavigate={onNavigate} />
    </div>
  );
}
