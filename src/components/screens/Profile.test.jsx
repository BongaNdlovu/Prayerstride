import { render, screen } from '@testing-library/react';
import Profile from './Profile';
import { usePrayerData } from '../../hooks/usePrayerData';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: {},
}));

// Mock hooks
vi.mock('../../hooks/usePersistentState', () => ({
  usePersistentState: vi.fn((key, initial) => [initial, vi.fn()]),
}));

vi.mock('../../hooks/usePrayerData', () => ({
  usePrayerData: vi.fn(() => ({ prayers: [] })),
}));

vi.mock('../../hooks/useIsAdmin', () => ({
  useIsAdmin: vi.fn(() => ({ isAdmin: false, loading: false })),
}));

vi.mock('../../hooks/useReports', () => ({
  submitReport: vi.fn(),
}));

vi.mock('../BottomNav', () => ({
  default: () => <div data-testid="bottom-nav">BottomNav</div>,
}));

vi.mock('../ui/SceneImage', () => ({
  default: () => <div data-testid="scene-image">SceneImage</div>,
}));

describe('Profile', () => {
  const defaultProps = {
    activeTab: 'profile',
    onNavigate: vi.fn(),
    onGo: vi.fn(),
    user: {
      uid: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  it('should render profile screen', () => {
    render(<Profile {...defaultProps} />);
    
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should display user name', () => {
    render(<Profile {...defaultProps} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should display user email when no bio', () => {
    render(<Profile {...defaultProps} />);
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should display menu items', () => {
    render(<Profile {...defaultProps} />);
    
    expect(screen.getByText('My Prayers')).toBeInTheDocument();
    expect(screen.getByText('Answered Prayers')).toBeInTheDocument();
    expect(screen.getByText('My Stats')).toBeInTheDocument();
    expect(screen.getByText('Prayer Stopwatch')).toBeInTheDocument();
  });

  it('should call onGo when menu item is clicked', () => {
    const onGo = vi.fn();
    render(<Profile {...defaultProps} onGo={onGo} />);
    
    const myPrayersButton = screen.getByText('My Prayers').closest('button');
    myPrayersButton.click();
    
    expect(onGo).toHaveBeenCalledWith('myPrayers');
  });

  it('should display prayer statistics', () => {
    usePrayerData.mockReturnValue({
      prayers: [
        { id: '1', authorUid: 'test-user', status: 'active' },
        { id: '2', authorUid: 'test-user', status: 'answered' },
        { id: '3', authorUid: 'other-user', status: 'answered' },
      ],
    });

    render(<Profile {...defaultProps} />);

    expect(screen.getByText('Prayers').previousSibling).toHaveTextContent('2');
    expect(screen.getByText('Answered').previousSibling).toHaveTextContent('1');
  });

  it('should display guest user when no user provided', () => {
    render(<Profile {...defaultProps} user={null} />);
    
    expect(screen.getByText('Guest')).toBeInTheDocument();
    expect(screen.getByText('Sign in to sync your prayer journey.')).toBeInTheDocument();
  });

  it('should render bottom navigation', () => {
    render(<Profile {...defaultProps} />);
    
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  it('should have report button', () => {
    render(<Profile {...defaultProps} />);
    
    const reportButton = screen.getByLabelText('Report user');
    expect(reportButton).toBeInTheDocument();
  });
});
