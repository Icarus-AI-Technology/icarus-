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
    expect(element.className).toContain('max-w-5xl');
  });

  it('applies padding prop correctly', () => {
    const { container } = render(
      <Container padding="lg">Content</Container>
    );
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('lg');
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

  it('applies padding classes', () => {
    const { container } = render(
      <Section padding="md">Content</Section>
    );
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('py');
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

  it('supports different intensities', () => {
    const { container: container1 } = render(
      <GlassCard intensity="sm">Content</GlassCard>
    );
    const { container: container2 } = render(
      <GlassCard intensity="xl">Content</GlassCard>
    );
    
    expect(container1.firstChild).toHaveClass('orx-glass-sm');
    expect(container2.firstChild).toHaveClass('orx-glass-xl');
  });
});

describe('AnimatedCard', () => {
  it('renders with animation', () => {
    const { container } = render(
      <AnimatedCard animation="fadeIn">Animated Content</AnimatedCard>
    );
    expect(screen.getByText('Animated Content')).toBeInTheDocument();
  });

  it('applies animation classes', () => {
    const { container } = render(
      <AnimatedCard animation="slideUp">Content</AnimatedCard>
    );
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('animate');
  });

  it('supports hover effects', () => {
    const { container } = render(
      <AnimatedCard hoverEffect="lift">Content</AnimatedCard>
    );
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('hover');
  });
});

