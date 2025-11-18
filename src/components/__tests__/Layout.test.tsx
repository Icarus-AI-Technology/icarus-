/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Container, Section, GlassCard, AnimatedCard } from '@/components/oraclusx-ds';

describe('Container', () => {
  it('renders children correctly', () => {
    render(
      <Container>
        <div>Test Content</div>
      </Container>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies maxWidth prop correctly', () => {
    const { container } = render(
      <Container maxWidth="5xl">Content</Container>
    );
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('max-w-[2048px]');
  });

  it('applies padding prop correctly', () => {
    const { container } = render(
      <Container padding="lg">Content</Container>
    );
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('p-8');
  });
});

describe('Section', () => {
  it('renders children correctly', () => {
    render(
      <Section>
        <div>Section Content</div>
      </Section>
    );
    expect(screen.getByText('Section Content')).toBeInTheDocument();
  });

  it('aplica espaçamento configurável', () => {
    const { container } = render(
      <Section spacing="lg">Content</Section>
    );
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('space-y-8');
  });
});

describe('GlassCard', () => {
  it('renders with glass effect', () => {
    const { container } = render(
      <GlassCard intensity="md">Glass Content</GlassCard>
    );
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('glass');
  });

  it('supports different blur levels', () => {
    const { container: container1 } = render(
      <GlassCard blur="sm">Content</GlassCard>
    );
    const { container: container2 } = render(
      <GlassCard blur="xl">Content</GlassCard>
    );
    
    expect(container1.firstChild).toHaveClass('orx-glass-sm');
    expect(container2.firstChild).toHaveClass('orx-glass-xl');
  });
});

describe('AnimatedCard', () => {
  it('renders with animation', () => {
    render(<AnimatedCard animation="fadeIn">Animated Content</AnimatedCard>);
    expect(screen.getByText('Animated Content')).toBeInTheDocument();
  });

  it('applies animation classes', () => {
    const { container } = render(
      <AnimatedCard animation="slide">Content</AnimatedCard>
    );
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('orx-animate-slide-up');
  });

  it('supports hover lift effect', () => {
    const { container } = render(
      <AnimatedCard hoverLift>Content</AnimatedCard>
    );
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('orx-hover-lift');
  });
});

