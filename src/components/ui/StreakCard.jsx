import { Flame } from 'lucide-react';
import Card from './Card';

export default function StreakCard({ streak, bestStreak }) {
  return (
    <Card className="relative overflow-hidden bg-white/85 p-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f3e6d2] text-gold">
        <Flame size={28} />
      </div>
      <p className="mt-3 text-sm font-semibold text-gold">You are on fire!</p>
      <div className="mt-1 text-5xl font-serif text-navy">{streak}</div>
      <p className="text-xs text-slate-500">day streak</p>
      <p className="mt-2 text-xs text-slate-400">Best streak: {bestStreak} days</p>
    </Card>
  );
}
