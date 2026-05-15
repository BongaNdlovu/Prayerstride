import BottomNav from '../BottomNav';

export default function AppScreen({ children, activeTab, onNavigate, className = '', showNav = true }) {
  return (
    <div className={`cinematic-bg cinematic-texture relative flex h-full flex-col overflow-hidden text-ivory ${className}`}>
      <div className="no-scrollbar relative z-10 min-h-0 flex-1 overflow-y-auto pb-4">
        {children}
      </div>
      {showNav && <BottomNav active={activeTab} onNavigate={onNavigate} />}
    </div>
  );
}
