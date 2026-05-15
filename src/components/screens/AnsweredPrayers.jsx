import AppScreen from '../ui/AppScreen';
import AppHeader from '../ui/AppHeader';
import TestimonyCard from '../ui/TestimonyCard';
import EmptyState from '../ui/EmptyState';
import { Heart } from 'lucide-react';
import AsyncState from '../ui/AsyncState';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useTestimonies } from '../../hooks/useTestimonies';

export default function AnsweredPrayers({ onBack, activeTab, onNavigate }) {
  const { user } = useAuth();
  const { testimonies, loading, error, retry } = useTestimonies();
  const ownTestimonies = testimonies.filter((item) => item.authorUid === user?.uid);

  return (
    <AppScreen activeTab={activeTab} onNavigate={onNavigate}>
      <AppHeader title="Answered Prayers" onBack={onBack} />
      <div className="mt-4 px-5 space-y-3">
        <AsyncState loading={loading} error={error} empty={ownTestimonies.length === 0} emptyIcon={Heart} emptyTitle="No testimonies yet" emptySubtitle="When your prayers are answered, your shared testimonies will appear here." onRetry={retry}>
          {ownTestimonies.map((t) => (
            <TestimonyCard key={t.id} testimony={t} />
          ))}
        </AsyncState>
      </div>
    </AppScreen>
  );
}
