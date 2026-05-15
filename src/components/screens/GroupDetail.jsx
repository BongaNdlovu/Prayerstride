import { useState } from 'react';
import { ArrowLeft, Users, Heart, BookOpen } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import { mockGroups, mockGroupMembers } from '../../data/mockData';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';

export default function GroupDetail({ onBack, activeTab, onNavigate, groupId }) {
  const group = mockGroups.find((g) => g.id === groupId) || mockGroups[0];
  const [activeTab2, setActiveTab2] = useState('Activity');
  const tabs = ['Activity', 'About', 'Resources'];

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <div className="px-5 pt-4">
        <button onClick={onBack} className="text-slate-700"><ArrowLeft size={22} /></button>
      </div>
      <div className="mt-4 px-5">
        <Card className="p-5">
          <h1 className="font-serif text-2xl text-navy">{group.name}</h1>
          <p className="mt-1 text-xs text-slate-500">{group.type} group - {group.members.toLocaleString()} members</p>
          <p className="mt-3 text-sm leading-5 text-slate-600">{group.description}</p>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 rounded-2xl bg-navy py-3 font-semibold text-white">Join Group</button>
            <button className="rounded-2xl border px-4 py-3 font-semibold text-slate-700">Follow</button>
          </div>
        </Card>
        <div className="mt-4 flex gap-2">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab2(t)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${activeTab2 === t ? 'bg-navy text-white' : 'bg-white text-slate-600'}`}>
              {t}
            </button>
          ))}
        </div>
        {activeTab2 === 'Activity' && (
          <div className="mt-4 space-y-2">
            {['Sarah P. prayed for peace', 'James T. prayed for strength', 'Melissa R. prayed for healing'].map((a, i) => (
              <Card key={i} className="p-3 text-sm text-slate-700">{a}</Card>
            ))}
          </div>
        )}
        {activeTab2 === 'About' && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-slate-600">A safe space to share prayer requests and encourage one another.</p>
          </div>
        )}
        {activeTab2 === 'Resources' && (
          <div className="mt-4 space-y-2">
            <Card className="flex items-center gap-3 p-3"><BookOpen size={18} className="text-navy" /> <span className="text-sm font-semibold">Study Guide</span></Card>
            <Card className="flex items-center gap-3 p-3"><Heart size={18} className="text-navy" /> <span className="text-sm font-semibold">Prayer Prompts</span></Card>
          </div>
        )}
      </div>
    </AppScreen>
  );
}
