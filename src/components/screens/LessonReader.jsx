import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { mockLesson } from '../../data/mockData';

export default function LessonReader({ onBack }) {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="flex h-full flex-col bg-sand">
      <div className="flex items-center justify-between px-5 pt-4">
        <button onClick={onBack} className="text-slate-700"><ArrowLeft size={22} /></button>
        <span className="text-xs font-semibold text-slate-500">Day {mockLesson.day} of {mockLesson.totalDays}</span>
        <div className="w-6" />
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-8 pt-6">
        <h1 className="font-serif text-3xl leading-tight text-navy">{mockLesson.title}</h1>
        <p className="mt-2 text-sm font-semibold text-gold">{mockLesson.reference}</p>
        <div className="mt-6 rounded-2xl border border-[#e6ddcf] bg-white/80 p-5">
          <p className="text-center font-serif text-lg italic leading-8 text-navy">&ldquo;{mockLesson.verse}&rdquo;</p>
        </div>
        <p className="mt-6 text-[15px] leading-7 text-slate-700">{mockLesson.body}</p>
        <div className="mt-6 rounded-2xl border border-[#e6ddcf] bg-[#e8f0f6]/40 p-5">
          <p className="text-sm font-semibold text-navy">Reflection</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">{mockLesson.reflection}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-[#e6ddcf] bg-white/80 px-5 py-4">
        <button className="flex h-12 w-12 items-center justify-center rounded-2xl border text-slate-700"><ChevronLeft size={20} /></button>
        <button onClick={() => setCompleted((c) => !c)} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold transition ${completed ? 'bg-[#e8f0f6] text-navy' : 'bg-navy text-white'}`}>
          <CheckCircle2 size={18} /> {completed ? 'Completed' : 'Mark Complete'}
        </button>
        <button className="flex h-12 w-12 items-center justify-center rounded-2xl border text-slate-700"><ChevronRight size={20} /></button>
      </div>
    </div>
  );
}
