export default function SectionHeader({ title, action, onAction }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <h3 className="font-serif text-xl text-navy">{title}</h3>
      {action && (
        <button onClick={onAction} className="text-xs font-semibold text-navy">
          {action}
        </button>
      )}
    </div>
  );
}
