import { mockPrayerRequests } from '../data/mockData';
import { usePersistentState } from './usePersistentState';

export function usePrayerData(user) {
  const [postedRequests, setPostedRequests] = usePersistentState('user:prayer-requests', []);
  const [answeredMap, setAnsweredMap] = usePersistentState('prayers:answered', {});

  const normalize = (prayer) => {
    const answered = Boolean(answeredMap[prayer.id] ?? prayer.answered ?? prayer.status === 'answered');
    return {
      ...prayer,
      name: prayer.anonymous ? 'Anonymous' : prayer.name || user?.name || 'You',
      userId: prayer.userId || user?.id || 'me',
      count: prayer.count || 0,
      tag: prayer.tag || 'General',
      time: prayer.time || 'just now',
      answered,
      status: answered ? 'answered' : prayer.status || 'active',
    };
  };

  const prayers = [...postedRequests, ...mockPrayerRequests].map(normalize);

  const addPrayer = (request) => {
    setPostedRequests((current) => [normalize(request), ...current]);
  };

  const markAnswered = (prayerId) => {
    setAnsweredMap((current) => ({ ...current, [prayerId]: true }));
    setPostedRequests((current) =>
      current.map((prayer) =>
        prayer.id === prayerId ? { ...prayer, answered: true, status: 'answered' } : prayer
      )
    );
  };

  return { prayers, postedRequests: postedRequests.map(normalize), addPrayer, markAnswered };
}
