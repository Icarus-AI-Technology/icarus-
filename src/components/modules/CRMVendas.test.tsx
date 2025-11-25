import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CRMVendas } from '@/components/modules/CRMVendas';
import { ToastProvider } from '@/contexts/ToastContext';

vi.mock('@/hooks', () => {
  return {
    useDocumentTitle: vi.fn(),
    useLeads: () => ({
      leads: [],
      loading: false,
      error: null,
      getTaxaConversao: vi.fn().mockResolvedValue({
        total: 0,
        ganhos: 0,
        perdidos: 0,
        emAndamento: 0,
        taxaConversao: 0,
      }),
      updateLead: vi.fn(),
      deleteLead: vi.fn(),
    }),
  };
});

describe('CRMVendas', () => {
  it('deve estar definido', async () => {
    render(
      <ToastProvider>
        <CRMVendas />
      </ToastProvider>
    );
    const headings = await screen.findAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
