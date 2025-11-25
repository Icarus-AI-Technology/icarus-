import { beforeEach, describe, expect, it } from 'vitest';
import { ragService } from '../lib/llm/rag.service';

describe('RAGService', () => {
  beforeEach(() => {
    ragService.clear();
  });

  it('deve ser instanciado corretamente', () => {
    expect(ragService).toBeDefined();
    expect(ragService.listDocuments()).toHaveLength(0);
  });

  it('deve adicionar documentos com metadados', async () => {
    const result = await ragService.addDocuments(['Documento A'], [{ categoria: 'teste' }]);
    expect(result.success).toBe(true);
    expect(result.count).toBe(1);

    const docs = ragService.listDocuments();
    expect(docs).toHaveLength(1);
    expect(docs[0].metadata).toMatchObject({ categoria: 'teste' });
  });

  it('deve buscar documentos relevantes', async () => {
    await ragService.addDocuments(
      ['Gestão hospitalar com IA', 'Tutorial financeiro'],
      [{ modulo: 'saude' }, { modulo: 'financas' }]
    );

    const results = await ragService.search('hospitalar', 2);
    expect(results).toHaveLength(1);
    expect(results[0].metadata).toMatchObject({ modulo: 'saude' });
  });

  it('deve aplicar filtro de metadados', async () => {
    await ragService.addDocuments(
      ['Procedimento cirúrgico', 'Checklist financeiro'],
      [{ modulo: 'cirurgia' }, { modulo: 'financas' }]
    );

    const results = await ragService.searchWithFilter('procedimento', { modulo: 'cirurgia' }, 2);
    expect(results).toHaveLength(1);
    expect(results[0].metadata).toMatchObject({ modulo: 'cirurgia' });
  });
});
