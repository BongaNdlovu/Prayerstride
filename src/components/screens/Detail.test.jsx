import { render, screen, fireEvent } from '@testing-library/react';
import Detail from './Detail';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: {},
}));

// Mock hooks
vi.mock('../../hooks/usePersistentState', () => ({
  usePersistentState: vi.fn((key, initial) => [initial, vi.fn()]),
}));

vi.mock('../../hooks/usePrayerData', () => ({
  usePrayerData: vi.fn(() => ({
    markAnswered: vi.fn(),
  })),
}));

vi.mock('../../lib/api', () => ({
  prayForRequest: vi.fn(),
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

vi.mock('../ui/GlassCard', () => ({
  default: ({ children }) => <div data-testid="glass-card">{children}</div>,
}));

describe('Detail', () => {
  const defaultProps = {
    request: {
      id: 'prayer-1',
      title: 'Test Prayer',
      text: 'Please pray for my health',
      name: 'Test User',
      time: '2 hours ago',
      count: 5,
      answered: false,
      authorUid: 'test-user',
    },
    user: {
      uid: 'test-user',
      name: 'Test User',
    },
    onBack: vi.fn(),
    onGo: vi.fn(),
    activeTab: 'prayers',
    onNavigate: vi.fn(),
  };

  it('should render prayer detail', () => {
    render(<Detail {...defaultProps} />);
    
    expect(screen.getByText('Test Prayer')).toBeInTheDocument();
    expect(screen.getByText('Please pray for my health')).toBeInTheDocument();
  });

  it('should display prayer author', () => {
    render(<Detail {...defaultProps} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should display prayer count', () => {
    render(<Detail {...defaultProps} />);
    
    expect(screen.getByText('5 praying')).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', () => {
    const onBack = vi.fn();
    render(<Detail {...defaultProps} onBack={onBack} />);

    fireEvent.click(screen.getAllByRole('button')[0]);

    expect(onBack).toHaveBeenCalled();
  });

  it('should display pray button', () => {
    render(<Detail {...defaultProps} />);
    
    expect(screen.getByText("I'll Pray")).toBeInTheDocument();
  });

  it('should display answered status when prayer is answered', () => {
    render(<Detail {...defaultProps} request={{ ...defaultProps.request, answered: true }} />);
    
    expect(screen.getByText('Answered')).toBeInTheDocument();
  });

  it('should show answered menu for own prayers', () => {
    render(<Detail {...defaultProps} />);

    fireEvent.click(screen.getAllByRole('button').at(-1));

    expect(screen.getByText('Mark as Answered')).toBeInTheDocument();
    expect(screen.getByText('Create Testimony')).toBeInTheDocument();
  });

  it('should not show answered menu for other users prayers', () => {
    render(<Detail {...defaultProps} user={{ uid: 'other-user' }} />);
    
    const sparklesButton = screen.queryByRole('button', { name: /sparkles/i });
    expect(sparklesButton).not.toBeInTheDocument();
  });

  it('should display testimony creation option for own answered prayers', () => {
    render(<Detail {...defaultProps} request={{ ...defaultProps.request, answered: true }} />);
    
    expect(screen.getByText('Share Your Testimony')).toBeInTheDocument();
  });

  it('should not display testimony creation for other users answered prayers', () => {
    render(<Detail {...defaultProps} user={{ uid: 'other-user' }} request={{ ...defaultProps.request, answered: true }} />);

    expect(screen.queryByText('Share Your Testimony')).not.toBeInTheDocument();
    expect(screen.getByText('Celebrate with them and keep encouraging the community.')).toBeInTheDocument();
  });

  it('should display bookmark button', () => {
    render(<Detail {...defaultProps} />);

    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(5);
  });

  it('should display prayer stopwatch button', () => {
    const onGo = vi.fn();
    render(<Detail {...defaultProps} onGo={onGo} />);

    fireEvent.click(screen.getAllByRole('button').at(-4));

    expect(onGo).toHaveBeenCalledWith('prayerStopwatch', { request: defaultProps.request });
  });

  it('should render bottom navigation', () => {
    render(<Detail {...defaultProps} />);
    
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  it('should display report menu option', () => {
    render(<Detail {...defaultProps} />);

    fireEvent.click(screen.getAllByRole('button')[1]);

    expect(screen.getByText('Report')).toBeInTheDocument();
  });

  it('should display not found state when prayer is null', () => {
    render(<Detail {...defaultProps} request={null} />);
    
    expect(screen.getByText('Prayer not found')).toBeInTheDocument();
    expect(screen.getByText('Go back')).toBeInTheDocument();
  });

  it('should call onGo when timer button is clicked', () => {
    const onGo = vi.fn();
    render(<Detail {...defaultProps} onGo={onGo} />);

    fireEvent.click(screen.getAllByRole('button').at(-4));

    expect(onGo).toHaveBeenCalledWith('prayerStopwatch', { request: defaultProps.request });
  });
});
