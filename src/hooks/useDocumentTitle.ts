/**
 * Hook: useDocumentTitle
 * Atualiza o título do documento (tab do navegador) dinamicamente
 */

import { useEffect } from 'react';

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | Icarus Make`;

    // Cleanup: restaura título anterior ao desmontar
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

export default useDocumentTitle;
