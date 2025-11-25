import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { APIGatewayDashboard } from '@/components/modules/APIGatewayDashboard';
import { ToastProvider } from '@/contexts/ToastContext';

describe('APIGatewayDashboard', () => {
  it('deve estar definido', () => {
    render(
      <ToastProvider>
        <APIGatewayDashboard />
      </ToastProvider>
    );
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
