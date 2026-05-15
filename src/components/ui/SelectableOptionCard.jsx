export default function SelectableOptionCard({ icon: Icon, title, subtitle, selected, onClick, time }) {
  return (
    <button onClick={onClick} className="warm-panel flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left transition active:scale-[0.98]">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3e6d2] text-gold">
            <Icon size={20} />
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-slate-900">{title}</div>
          {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
          {time && <span className="mt-1 inline-block rounded-full border px-2 py-0.5 text-xs">{time}</span>}
        </div>
      </div>
      <div className={`h-5 w-5 shrink-0 rounded-full border transition ${selected ? 'border-candle bg-candle ring-4 ring-candle/20' : 'border-slate-300'}`} />
    </button>
  );
}
