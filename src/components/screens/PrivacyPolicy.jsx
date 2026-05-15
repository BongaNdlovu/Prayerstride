import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';

export default function PrivacyPolicy({ onBack, activeTab, onNavigate }) {
  const [open, setOpen] = useState({});
  const sections = [
    { title: 'Information We Collect', text: 'We collect information you provide directly, such as your name, email, and prayer requests. We also collect usage data to improve the app.' },
    { title: 'How We Use Information', text: 'We use your information to provide and improve PrayerStride, send notifications you have opted into, and ensure community safety.' },
    { title: 'Data Sharing', text: 'We do not sell your personal information. We may share data with service providers who help us operate the app, under strict confidentiality agreements.' },
    { title: 'Your Choices', text: 'You can update your profile, delete your account, and manage notification preferences at any time in Settings.' },
    { title: 'Contact Us', text: 'If you have questions about this policy, please contact us through the Help Center.' },
  ];

  const toggle = (idx) => setOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Privacy Policy" onBack={onBack} />
      <div className="mt-4 px-5 space-y-2 pb-8">
        {sections.map((s, i) => (
          <div key={i} className="rounded-2xl border border-[#e6ddcf] bg-white/80 overflow-hidden">
            <button onClick={() => toggle(i)} className="flex w-full items-center justify-between p-4 text-left">
              <span className="font-semibold text-slate-900">{s.title}</span>
              {open[i] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>
            {open[i] && <p className="px-4 pb-4 text-sm leading-6 text-slate-600">{s.text}</p>}
          </div>
        ))}
      </div>
    </AppScreen>
  );
}
