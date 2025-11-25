import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AutomacaoIA } from '@/components/modules/AutomacaoIA';

describe('AutomacaoIA', () => {
  it('deve estar definido', () => {
    render(<AutomacaoIA />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
