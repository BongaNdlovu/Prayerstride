export default function Card({ children, className = '', onClick }) {
  const base = 'warm-panel rounded-[22px] p-4 text-ink';
  if (onClick) {
    return (
      <button onClick={onClick} className={`w-full text-left transition active:scale-[0.98] ${base} ${className}`}>
        {children}
      </button>
    );
  }
  return <div className={`${base} ${className}`}>{children}</div>;
}
