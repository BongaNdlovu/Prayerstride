import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { mockLesson } from '../../data/mockData';
import SceneImage from '../ui/SceneImage';

export default function LessonReader({ onBack }) {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="cinematic-bg relative flex h-full flex-col text-ivory">
      <SceneImage scene="bible" className="absolute inset-0 opacity-55" />
      <div className="absolute inset-0 bg-ink/70" />
      <div className="relative z-10 flex items-center justify-between px-5 pt-4">
        <button onClick={onBack} className="text-ivory/70"><ArrowLeft size={22} /></button>
        <span className="text-xs font-semibold text-ivory/55">Day {mockLesson.day} of {mockLesson.totalDays}</span>
        <div className="w-6" />
      </div>
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-8 pt-6">
        <h1 className="font-serif text-3xl leading-tight text-ivory">{mockLesson.title}</h1>
        <p className="mt-2 text-sm font-semibold text-gold">{mockLesson.reference}</p>
        <div className="glass-panel mt-6 rounded-2xl p-5">
          <p className="text-center font-serif text-lg italic leading-8 text-ivory">&ldquo;{mockLesson.verse}&rdquo;</p>
        </div>
        <p className="mt-6 text-[15px] leading-7 text-ivory/75">{mockLesson.body}</p>
        <div className="mt-6 rounded-2xl border border-candle/20 bg-candle/10 p-5">
          <p className="text-sm font-semibold text-candle">Reflection</p>
          <p className="mt-1 text-sm leading-6 text-ivory/75">{mockLesson.reflection}</p>
        </div>
      </div>
      <div className="relative z-10 flex items-center gap-3 border-t border-ivory/10 bg-ink/82 px-5 py-4 backdrop-blur-xl">
        <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-ivory/15 text-ivory/70"><ChevronLeft size={20} /></button>
        <button onClick={() => setCompleted((c) => !c)} className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold transition ${completed ? 'bg-ivory/10 text-candle' : 'cinematic-button text-ink'}`}>
          <CheckCircle2 size={18} /> {completed ? 'Completed' : 'Mark Complete'}
        </button>
        <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-ivory/15 text-ivory/70"><ChevronRight size={20} /></button>
      </div>
    </div>
  );
}
