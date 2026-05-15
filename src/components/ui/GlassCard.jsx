export default function GlassCard({ children, className = '', onClick }) {
  const classes = `glass-panel rounded-[24px] p-4 text-ivory ${className}`;
  if (onClick) {
    return (
      <button onClick={onClick} className={`w-full text-left transition active:scale-[0.98] ${classes}`}>
        {children}
      </button>
    );
  }
  return <div className={classes}>{children}</div>;
}
