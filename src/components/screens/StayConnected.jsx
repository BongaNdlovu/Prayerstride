import { ArrowLeft, Bell, Mail, ShieldCheck } from 'lucide-react';
import ToggleRow from '../ui/ToggleRow';

export default function StayConnected({ onBack, onContinue, onSkip }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-sand px-6 pb-8">
      <button onClick={onBack} className="mt-3 w-fit text-navy">
        <ArrowLeft size={22} />
      </button>
      <div className="mt-6 rounded-[30px] border border-[#e6ddcf] bg-white/75 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f1dfc8] text-gold">
          <Bell size={28} />
        </div>
      </div>
      <h1 className="mt-7 font-serif text-3xl leading-tight text-navy">Stay Connected</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Choose how you want to hear from PrayerStride.</p>
      <div className="mt-6 space-y-3">
        <ToggleRow title="Push Notifications" subtitle="Receive reminders for prayer and answered requests." initial={true} />
        <ToggleRow title="Prayer Updates" subtitle="Get encouragement and stories from the community." initial={true} />
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-[#e6ddcf] bg-white/50 p-3">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-navy" />
        <p className="text-xs leading-5 text-slate-600">We will never spam you or share your information.</p>
      </div>
      <button onClick={onContinue} className="mt-auto rounded-2xl bg-navy py-4 font-semibold text-white transition hover:bg-[#0a3358]">
        Continue
      </button>
      <button onClick={onSkip} className="mt-3 text-center text-sm font-semibold text-slate-500">
        Not now
      </button>
    </div>
  );
}
