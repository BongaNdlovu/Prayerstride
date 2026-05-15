import { ArrowLeft, BookOpen, Clock, User, CheckCircle2 } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import { mockGuide } from '../../data/mockData';
import Card from '../ui/Card';

export default function GuideDetail({ onBack, activeTab, onNavigate, onStart }) {
  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <div className="px-5 pt-4">
        <button onClick={onBack} className="text-slate-700"><ArrowLeft size={22} /></button>
      </div>
      <div className="mt-4 px-5">
        <Card className="p-5">
          <h1 className="font-serif text-2xl text-navy">{mockGuide.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{mockGuide.subtitle}</p>
          <div className="mt-3 flex gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Clock size={12} /> {mockGuide.days} Days</span>
            <span className="flex items-center gap-1"><User size={12} /> {mockGuide.level}</span>
            <span className="flex items-center gap-1"><BookOpen size={12} /> {mockGuide.format}</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{mockGuide.description}</p>
          <div className="mt-4 space-y-2">
            {mockGuide.includes.map((inc, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 size={16} className="text-navy" /> {inc}
              </div>
            ))}
          </div>
          <button onClick={onStart} className="mt-5 w-full rounded-2xl bg-navy py-3.5 font-semibold text-white">Start Guide</button>
        </Card>
      </div>
    </AppScreen>
  );
}
