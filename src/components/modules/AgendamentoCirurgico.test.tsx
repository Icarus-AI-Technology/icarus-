import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgendamentoCirurgico } from '@/components/modules/AgendamentoCirurgico';

describe('AgendamentoCirurgico', () => {
  it('deve estar definido', () => {
    render(<AgendamentoCirurgico />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
