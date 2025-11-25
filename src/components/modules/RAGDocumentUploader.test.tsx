import { describe, it, expect, vi } from 'vitest';
import type { PropsWithChildren, ButtonHTMLAttributes } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RAGDocumentUploader } from './RAGDocumentUploader';
import { ragService } from '@/lib/llm/rag.service';

// Mocks
vi.mock('@/lib/llm/rag.service', () => ({
  ragService: {
    addDocuments: vi.fn().mockResolvedValue({ success: true })
  }
}));

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    addToast: vi.fn()
  })
}));

vi.mock('@/components/oraclusx-ds', () => ({
  Card: ({ children, className }: PropsWithChildren<{ className?: string }>) => (
    <div className={className}>{children}</div>
  ),
  Button: ({
    children,
    ...props
  }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) => <button {...props}>{children}</button>,
  Progress: ({ value }: { value?: number }) => (
    <div data-testid="progress" style={{ width: `${value ?? 0}%` }} />
  )
}));

describe('RAGDocumentUploader', () => {
  it('deve renderizar corretamente', () => {
    render(<RAGDocumentUploader />);
    expect(screen.getByText('Upload para Base de Conhecimento (RAG)')).toBeInTheDocument();
    expect(screen.getByText('Arraste arquivos aqui ou clique para selecionar')).toBeInTheDocument();
  });

  it('deve processar upload de arquivo de texto', async () => {
    render(<RAGDocumentUploader />);

    const file = new File(['conteúdo teste'], 'teste.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('Selecionar Arquivos', { selector: 'input' });

    Object.defineProperty(input, 'files', {
      value: [file]
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText('teste.txt')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(ragService.addDocuments).toHaveBeenCalled();
    });
  });
});

