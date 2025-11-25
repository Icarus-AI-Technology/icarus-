import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BIDashboardInterativo } from '@/components/modules/BIDashboardInterativo';
import { ToastProvider } from '@/contexts/ToastContext';

describe('BIDashboardInterativo', () => {
  it('deve estar definido', () => {
    render(
      <ToastProvider>
        <BIDashboardInterativo />
      </ToastProvider>
    );
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
