export default function PhoneFrame({ children, className = "" }) {
  return (
    <div className={`relative mx-auto h-[720px] w-[350px] overflow-hidden rounded-[42px] border-[10px] border-[#08090d] bg-ink shadow-[0_34px_90px_rgba(2,7,18,0.52)] ${className}`}>
      <div className="absolute left-1/2 top-2 z-50 h-7 w-28 -translate-x-1/2 rounded-full bg-[#09090b]" />
      <div className="absolute inset-x-0 top-0 z-40 flex h-12 items-center justify-between px-7 pt-2 text-[11px] font-semibold text-ivory/80">
        <span>9:41</span>
        <span className="tracking-tight">LTE 82%</span>
      </div>
      <div className="h-full overflow-hidden pt-12">{children}</div>
      <div className="absolute bottom-2 left-1/2 h-1.5 w-28 -translate-x-1/2 rounded-full bg-black/80" />
    </div>
  );
}
