import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processMlJob } from '../ml.worker';
import * as MlService from '@/services/integrations/MlService';

vi.mock('@/services/integrations/MlService', () => ({
  generateLLM: vi.fn().mockResolvedValue({ content: 'ok' }),
  analyzeFinance: vi.fn().mockResolvedValue({ sentiment: 'neutral' }),
  optimizeObjective: vi.fn().mockResolvedValue({ result: [0] }),
  forecastSeries: vi.fn().mockResolvedValue({ forecast: [1], timestamps: ['2025-10-21'] }),
  persistVectors: vi.fn().mockResolvedValue({ status: 'ok' }),
}));

const mocked = MlService as unknown as {
  generateLLM: ReturnType<typeof vi.fn>;
  analyzeFinance: ReturnType<typeof vi.fn>;
  optimizeObjective: ReturnType<typeof vi.fn>;
  forecastSeries: ReturnType<typeof vi.fn>;
  persistVectors: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('processMlJob', () => {
  it('delegates LLM jobs', async () => {
    await processMlJob({ type: 'llm', prompt: 'teste' });
    expect(mocked.generateLLM).toHaveBeenCalledWith('teste');
  });

  it('delegates finance sentiment jobs', async () => {
    await processMlJob({ type: 'finance-sentiment', text: 'balanço' });
    expect(mocked.analyzeFinance).toHaveBeenCalledWith('balanço');
  });

  it('delegates optimizer jobs', async () => {
    await processMlJob({ type: 'optimizer', objective: [1, 2, 3] });
    expect(mocked.optimizeObjective).toHaveBeenCalledWith([1, 2, 3]);
  });

  it('delegates timeseries jobs', async () => {
    await processMlJob({
      type: 'timeseries',
      timestamps: ['2025-10-20', '2025-10-21'],
      values: [10, 12],
      horizon: 7,
    });
    expect(mocked.forecastSeries).toHaveBeenCalledWith(['2025-10-20', '2025-10-21'], [10, 12], 7);
  });

  it('delegates vector store jobs', async () => {
    const vectors = [
      { externalId: 'doc-1', module: 'cirurgias', embedding: [0.1, 0.2] },
    ];
    await processMlJob({ type: 'vector-store', vectors });
    expect(mocked.persistVectors).toHaveBeenCalledWith(vectors);
  });

  it('errors on unsupported job types', async () => {
    await expect(
      processMlJob(
        // @ts-expect-error teste proposital de erro
        { type: 'desconhecido' },
      ),
    ).rejects.toThrow('Tipo de job não suportado');
  });
});
