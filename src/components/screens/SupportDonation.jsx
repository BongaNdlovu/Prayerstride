import { ShieldCheck, Heart } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import Card from '../ui/Card';

export default function SupportDonation({ onBack, activeTab, onNavigate }) {
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
        <Card className="p-4">
          <p className="text-sm font-semibold text-navy">Donations are not enabled yet</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            We removed the checkout button until a secure payment backend is live. Thank you for wanting to support the mission.
          </p>
        </Card>
        <div className="space-y-2 rounded-2xl border border-[#e6ddcf] bg-white/50 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-600"><ShieldCheck size={14} className="text-navy" /> Secure & encrypted</div>
          <div className="flex items-center gap-2 text-xs text-slate-600"><ShieldCheck size={14} className="text-navy" /> Checkout will return only after Stripe is connected</div>
        </div>
      </div>
    </AppScreen>
  );
}
