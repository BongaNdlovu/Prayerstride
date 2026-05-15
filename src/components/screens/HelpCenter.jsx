import { ArrowLeft, Search, HelpCircle, MessageCircle } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import Card from '../ui/Card';

export default function HelpCenter({ onBack, activeTab, onNavigate }) {
  const topics = [
    'How PrayerStride works',
    'Creating a prayer request',
    'Privacy & security',
    'Managing notifications',
    'Giving & donations',
  ];

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Help Center" onBack={onBack} />
      <div className="mt-4 px-5 space-y-4">
        <div className="flex items-center gap-2 rounded-2xl border border-[#e6ddcf] bg-white/80 px-3 py-2.5">
          <Search size={16} className="text-slate-400" />
          <span className="text-sm text-slate-400">Search for help...</span>
        </div>
        <h2 className="font-serif text-xl text-navy">Popular Topics</h2>
        <div className="space-y-2">
          {topics.map((t) => (
            <Card key={t} className="flex items-center justify-between p-4">
              <span className="text-sm font-semibold text-slate-800">{t}</span>
              <HelpCircle size={18} className="text-slate-400" />
            </Card>
          ))}
        </div>
        <Card className="mt-6 p-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0f6] text-navy">
            <MessageCircle size={22} />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">Still need help? We are here for you.</p>
          <a href="mailto:support@prayerstride.app" className="mt-3 inline-block rounded-2xl bg-navy px-6 py-2.5 text-sm font-semibold text-white">Contact Support</a>
        </Card>
      </div>
    </AppScreen>
  );
}
