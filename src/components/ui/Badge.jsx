export default function Badge({ children, className = '' }) {
  return (
    <span className={`inline-block rounded-full bg-[#f2e7d6] px-2 py-1 text-xs font-medium text-navy ${className}`}>
      {children}
    </span>
  );
}
