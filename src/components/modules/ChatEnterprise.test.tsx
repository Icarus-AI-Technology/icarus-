import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatEnterprise } from '@/components/modules/ChatEnterprise';
import { ToastProvider } from '@/contexts/ToastContext';

describe('ChatEnterprise', () => {
  it('deve estar definido', () => {
    render(
      <ToastProvider>
        <ChatEnterprise />
      </ToastProvider>
    );
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings.length).toBeGreaterThan(0);
  });

  // TODO: Adicionar mais testes específicos
});
