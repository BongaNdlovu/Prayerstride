import { Activity, BookOpen, CalendarDays, ChevronRight, Clock, Flame, Heart, Send, Timer, TrendingUp, Users } from 'lucide-react';
import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import StreakCalendar from '../ui/StreakCalendar';
import MiniLineChart from '../ui/MiniLineChart';
import Card from '../ui/Card';
import { mockStats } from '../../data/mockData';

const focusAreas = [
  ['Family', 42, 'bg-[#e8f0f6]'],
  ['Healing', 31, 'bg-[#f2e7d6]'],
  ['Guidance', 18, 'bg-[#e7dfd2]'],
  ['Provision', 9, 'bg-[#f8ead6]'],
];

const totalRecentPrayers = mockStats.chartData.reduce((sum, item) => sum + item.prayers, 0);
const weeklySummary = [
  ['Prayers lifted', totalRecentPrayers, TrendingUp],
  ['Daily average', Math.round(totalRecentPrayers / mockStats.chartData.length), Activity],
  ['Best day', 'Sun', CalendarDays],
];

export default function MyStats({ onBack, activeTab, onNavigate, onGo }) {
  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Stats" onBack={onBack} />
      <div className="mt-4 space-y-4 px-5">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">Prayer Rhythm</p>
              <h2 className="mt-2 font-serif text-3xl leading-tight text-navy">{mockStats.streak} day streak</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">You are building a steady habit of prayer and follow-up.</p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e8f0f6] text-navy">
              <Flame size={25} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl text-navy">14 Day Prayer Activity</h3>
              <p className="text-xs text-slate-500">Prayers completed per day.</p>
            </div>
            <span className="rounded-full bg-[#e8f0f6] px-3 py-1 text-xs font-semibold text-navy">+38%</span>
          </div>
          <div className="mt-5">
            <MiniLineChart data={mockStats.chartData} width={310} height={170} />
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-2">
          {weeklySummary.map(([label, value, Icon]) => (
            <Card key={label} className="p-3 text-center">
              <Icon size={18} className="mx-auto text-gold" />
              <div className="mt-2 font-serif text-2xl text-navy">{value}</div>
              <div className="text-[10px] leading-tight text-slate-500">{label}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            [BookOpen, mockStats.totalPrayers, 'Total prayers'],
            [Users, mockStats.peopleSupported, 'People supported'],
            [Send, mockStats.requestsSent, 'Requests shared'],
            [Heart, mockStats.testimonies, 'Testimonies'],
            [Clock, mockStats.prayerTime, 'Prayer time'],
            [Flame, `${mockStats.bestStreak}d`, 'Best streak'],
          ].map(([Icon, value, label]) => (
            <Card key={label} className="p-4">
              <Icon size={20} className="text-gold" />
              <div className="mt-3 font-serif text-2xl text-navy">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </Card>
          ))}
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-navy">Prayer Focus</h3>
            <span className="text-xs font-semibold text-slate-500">Last 30 days</span>
          </div>
          <div className="mt-4 space-y-3">
            {focusAreas.map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className="text-slate-500">{value}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-stone">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl text-navy">Consistency</h3>
              <p className="text-xs text-slate-500">Current week completion</p>
            </div>
            <p className="font-serif text-2xl text-navy">6/7</p>
          </div>
          <div className="mt-4">
            <StreakCalendar streak={mockStats.streak} currentDayIndex={6} />
          </div>
        </Card>

        <Card className="p-5 text-center">
          <p className="text-sm italic text-slate-700">&ldquo;Continue steadfastly in prayer, being watchful in it with thanksgiving.&rdquo;</p>
          <p className="mt-2 text-xs font-semibold text-navy">Colossians 4:2</p>
        </Card>

        <button onClick={() => onGo?.('detail')} className="flex w-full items-center justify-between rounded-2xl border border-[#e6ddcf] bg-white/80 p-4 text-left transition active:scale-[0.98]">
          <span className="font-semibold text-slate-900">Continue today&apos;s prayer mission</span>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
        <button onClick={() => onGo?.('prayerStopwatch')} className="flex w-full items-center justify-between rounded-2xl border border-[#e6ddcf] bg-white/80 p-4 text-left transition active:scale-[0.98]">
          <span className="flex items-center gap-3 font-semibold text-slate-900">
            <Timer size={18} className="text-navy" />
            Open prayer stopwatch
          </span>
          <ChevronRight size={18} className="text-slate-400" />
        </button>
      </div>
    </AppScreen>
  );
}
