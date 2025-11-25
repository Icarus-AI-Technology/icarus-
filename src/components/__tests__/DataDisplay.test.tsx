/**
 * @jest-environment jsdom
 */

import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader, StatsGrid, CategoryTabs } from '@/components/oraclusx-ds';
import { Users, TrendingUp } from 'lucide-react';

describe('PageHeader', () => {
  it('renders title correctly', () => {
    render(<PageHeader title="Test Page" />);
    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<PageHeader title="Test" description="Test Description" />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = render(<PageHeader title="Test" icon={Users} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(<PageHeader title="Test" badge={{ label: 'Beta', variant: 'warning' }} />);
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});

describe('StatsGrid', () => {
  const mockStats = [
    {
      title: 'Users',
      value: '1,284',
      trend: '+12%',
      trendUp: true,
      icon: Users,
    },
    {
      title: 'Revenue',
      value: '$45K',
      trend: '+8%',
      trendUp: true,
      icon: TrendingUp,
    },
  ];

  it('renders all stats', () => {
    render(<StatsGrid stats={mockStats} />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('1,284')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$45K')).toBeInTheDocument();
  });

  it('applies column count correctly', () => {
    const { container } = render(<StatsGrid stats={mockStats} columns={4} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('grid-cols');
  });

  it('shows loading state', () => {
    const { container } = render(<StatsGrid stats={mockStats} loading={true} />);
    expect(container.querySelector('.orx-animate-pulse')).toBeInTheDocument();
  });
});

describe('CategoryTabs', () => {
  const mockCategories = [
    { id: 'all', label: 'All', icon: Users, count: 45 },
    { id: 'active', label: 'Active', icon: Users, count: 32 },
  ];

  const mockOnChange = vi.fn();

  it('renders all categories', () => {
    render(
      <CategoryTabs
        categories={mockCategories}
        activeCategory="all"
        onCategoryChange={mockOnChange}
      />
    );
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows counts when provided', () => {
    render(
      <CategoryTabs
        categories={mockCategories}
        activeCategory="all"
        onCategoryChange={mockOnChange}
      />
    );
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
  });

  it('highlights active category', () => {
    const { container } = render(
      <CategoryTabs
        categories={mockCategories}
        activeCategory="active"
        onCategoryChange={mockOnChange}
      />
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons[1].className).toContain('active');
  });
});
