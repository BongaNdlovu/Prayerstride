import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import { mockTestimonies } from '../../data/mockData';
import TestimonyCard from '../ui/TestimonyCard';
import { usePersistentState } from '../../hooks/usePersistentState';

export default function AnsweredPrayers({ onBack, activeTab, onNavigate }) {
  const [localTestimonies] = usePersistentState('user:testimonies', []);
  const testimonies = [...localTestimonies, ...mockTestimonies];

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Answered Prayers" onBack={onBack} />
      <div className="mt-4 px-5 space-y-3">
        {testimonies.map((t) => (
          <TestimonyCard key={t.id} testimony={t} />
        ))}
      </div>
    </AppScreen>
  );
}
