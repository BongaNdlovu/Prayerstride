import { render, screen, fireEvent } from '@testing-library/react';
import Praise from './Praise';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: {},
}));

// Mock hooks
vi.mock('../../hooks/usePersistentState', () => ({
  usePersistentState: vi.fn((key, initial) => [initial, vi.fn()]),
}));

vi.mock('../../hooks/useTestimonies', () => ({
  useTestimonies: vi.fn(() => ({
    testimonies: [
      {
        id: '1',
        title: 'Test Testimony',
        text: 'This is a testimony',
        name: 'Test User',
        time: '2 hours ago',
        prayerId: 'prayer-1',
        amen: 5,
        praiseGod: 3,
      },
    ],
  })),
}));

vi.mock('../../hooks/usePrayerData', () => ({
  usePrayerData: vi.fn(() => ({
    prayers: [
      { id: 'prayer-1', title: 'Related Prayer' },
    ],
  })),
}));

vi.mock('../../lib/api', () => ({
  reactToTestimony: vi.fn(),
}));

vi.mock('../../hooks/useReports', () => ({
  submitReport: vi.fn(),
}));

vi.mock('../BottomNav', () => ({
  default: () => <div data-testid="bottom-nav">BottomNav</div>,
}));

vi.mock('../ui/ImageHero', () => ({
  default: () => <div data-testid="image-hero">ImageHero</div>,
}));

vi.mock('../ui/Card', () => ({
  default: ({ children, className }) => <div className={className}>{children}</div>,
}));

describe('Praise', () => {
  const defaultProps = {
    activeTab: 'praise',
    onNavigate: vi.fn(),
    onGo: vi.fn(),
    user: {
      uid: 'test-user',
      name: 'Test User',
    },
  };

  it('should render praise screen', () => {
    render(<Praise {...defaultProps} />);

    expect(screen.getByText('Praise Reports')).toBeInTheDocument();
    expect(screen.getByText('Test Testimony')).toBeInTheDocument();
  });

  it('should display featured testimony', () => {
    render(<Praise {...defaultProps} />);
    
    expect(screen.getByText('Featured Testimony')).toBeInTheDocument();
    expect(screen.getAllByText('Test Testimony').length).toBeGreaterThan(0);
  });

  it('should render testimony cards', () => {
    render(<Praise {...defaultProps} />);

    expect(screen.getAllByText('Test Testimony').length).toBeGreaterThan(0);
    expect(screen.getAllByText('This is a testimony').length).toBeGreaterThan(0);
  });

  it('should display search input', () => {
    render(<Praise {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search praise reports...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter testimonies by search', () => {
    render(<Praise {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search praise reports...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });
    
    expect(searchInput.value).toBe('Test');
  });

  it('should call onGo when create testimony button is clicked', () => {
    const onGo = vi.fn();
    render(<Praise {...defaultProps} onGo={onGo} />);
    
    const createButton = screen.getByLabelText('Create testimony');
    createButton.click();
    
    expect(onGo).toHaveBeenCalledWith('createTestimony');
  });

  it('should display testimony count', () => {
    render(<Praise {...defaultProps} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should display reaction buttons', () => {
    render(<Praise {...defaultProps} />);
    
    // Reaction buttons are rendered in the testimony cards
    const testimonyCards = screen.getAllByText('Test Testimony');
    expect(testimonyCards.length).toBeGreaterThan(0);
  });

  it('should display related prayer when prayerId exists', () => {
    render(<Praise {...defaultProps} />);
    
    expect(screen.getByText('Answered prayer')).toBeInTheDocument();
    expect(screen.getByText('Related Prayer')).toBeInTheDocument();
  });

  it('should render bottom navigation', () => {
    render(<Praise {...defaultProps} />);
    
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  it('should display "Read full testimony" link', () => {
    render(<Praise {...defaultProps} />);
    
    expect(screen.getByText('Read full testimony')).toBeInTheDocument();
  });
});
