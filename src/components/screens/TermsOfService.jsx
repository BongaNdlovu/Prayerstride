import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';

export default function TermsOfService({ onBack, activeTab, onNavigate }) {
  const [open, setOpen] = useState({});
  const sections = [
    { title: 'Use of Our Services', text: 'PrayerStride provides a platform for prayer, community, and spiritual growth. You must be at least 13 years old to use our services.' },
    { title: 'User Responsibilities', text: 'You agree to use PrayerStride respectfully. Do not post harmful, hateful, or abusive content. Respect the privacy and beliefs of others.' },
    { title: 'Content & Conduct', text: 'You retain ownership of content you post. By posting, you grant us a license to display it within the app. We reserve the right to remove content that violates our guidelines.' },
    { title: 'Changes to Terms', text: 'We may update these terms from time to time. Continued use of PrayerStride after changes constitutes acceptance of the new terms.' },
    { title: 'Contact Us', text: 'For questions about these terms, please reach out through the Help Center.' },
  ];

  const toggle = (idx) => setOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Terms of Service" onBack={onBack} />
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
