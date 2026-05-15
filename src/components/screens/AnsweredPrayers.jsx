import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import TestimonyCard from '../ui/TestimonyCard';
import { usePersistentState } from '../../hooks/usePersistentState';
import EmptyState from '../ui/EmptyState';
import { Heart } from 'lucide-react';

export default function AnsweredPrayers({ onBack, activeTab, onNavigate }) {
  const [localTestimonies] = usePersistentState('user:testimonies', []);

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Answered Prayers" onBack={onBack} />
      <div className="mt-4 px-5 space-y-3">
        {localTestimonies.length ? (
          localTestimonies.map((t) => (
            <TestimonyCard key={t.id} testimony={t} />
          ))
        ) : (
          <EmptyState icon={Heart} title="No testimonies yet" subtitle="When your prayers are answered, your shared testimonies will appear here." />
        )}
      </div>
    </AppScreen>
  );
}
