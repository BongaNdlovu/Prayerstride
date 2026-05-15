import { ArrowLeft, ShieldCheck, Heart } from 'lucide-react';
import { useState } from 'react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import Card from '../ui/Card';
import ToggleRow from '../ui/ToggleRow';

export default function SupportDonation({ onBack, activeTab, onNavigate }) {
  const [amount, setAmount] = useState(25);
  const [monthly, setMonthly] = useState(false);
  const options = [10, 25, 50, 100];

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Support PrayerStride" onBack={onBack} />
      <div className="mt-4 px-5 space-y-4">
        <Card className="p-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f3e6d2] text-gold">
            <Heart size={24} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-700">Your generosity helps PrayerStride remain free, safe, and ad-free for everyone.</p>
        </Card>
        <div className="grid grid-cols-4 gap-2">
          {options.map((o) => (
            <button key={o} onClick={() => setAmount(o)} className={`rounded-2xl py-3 text-sm font-semibold transition ${amount === o ? 'bg-navy text-white' : 'bg-white text-slate-700 border border-[#e6ddcf]'}`}>
              ${o}
            </button>
          ))}
        </div>
        <button className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${amount === 'other' ? 'bg-navy text-white' : 'bg-white text-slate-700 border border-[#e6ddcf]'}`} onClick={() => setAmount('other')}>
          Other
        </button>
        <ToggleRow title="Monthly gift" subtitle="Give automatically each month." initial={monthly} onChange={setMonthly} />
        <button className="w-full rounded-2xl bg-navy py-4 font-semibold text-white transition hover:bg-[#0a3358]">
          Continue
        </button>
        <div className="space-y-2 rounded-2xl border border-[#e6ddcf] bg-white/50 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-600"><ShieldCheck size={14} className="text-navy" /> Secure & encrypted</div>
          <div className="flex items-center gap-2 text-xs text-slate-600"><ShieldCheck size={14} className="text-navy" /> 100% goes to mission</div>
          <div className="flex items-center gap-2 text-xs text-slate-600"><ShieldCheck size={14} className="text-navy" /> Receipts for tax purposes</div>
        </div>
      </div>
    </AppScreen>
  );
}
