export default function ScreenTitle({ title, subtitle, className = '' }) {
  return (
    <div className={`px-5 ${className}`}>
      <h1 className="font-serif text-3xl leading-tight text-navy">{title}</h1>
      {subtitle && <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>}
    </div>
  );
}
