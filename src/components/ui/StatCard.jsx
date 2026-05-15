export default function StatCard({ icon: Icon, value, label, className = '' }) {
  return (
    <div className={`warm-panel rounded-2xl p-4 ${className}`}>
      {Icon && <Icon className="text-gold" size={20} />}
      <div className="mt-2 text-2xl font-serif text-navy">{value}</div>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
