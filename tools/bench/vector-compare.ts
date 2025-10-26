#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import axios from 'axios';

const CONFIG_PATH = process.env.VECTOR_BENCH_CONFIG || 'data/embeddings/cirurgias_sample.json';
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';
const VECTOR_SEARCH_URL = process.env.ML_VECTOR_SEARCH_URL || 'http://localhost:3000/api/ml/vector-search';

async function searchFaiss(query: number[], topK: number) {
  const start = performance.now();
  const { data } = await axios.post(`${ML_API_URL}/vector/faiss/search`, { query, top_k: topK });
  const latency = performance.now() - start;
  const ids: string[] = data.ids || [];
  return { ids, latency };
}

type VectorSearchRow = { external_id: string };
type VectorSearchResponse = { results?: VectorSearchRow[] };

async function searchPgvector(query: number[], topK: number, module?: string) {
  const start = performance.now();
  const { data } = await axios.post<VectorSearchResponse>(
    VECTOR_SEARCH_URL,
    { query, topK, module },
    {
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.ML_VECTOR_TOKEN ? { Authorization: `Bearer ${process.env.ML_VECTOR_TOKEN}` } : {}),
      },
    }
  );
  const latency = performance.now() - start;
  const ids: string[] = data.results?.map((row) => row.external_id) || [];
  return { ids, latency };
}

function recallAtK(reference: string[], candidate: string[]) {
  if (reference.length === 0) return 0;
  const set = new Set(candidate);
  const intersection = reference.filter((id) => set.has(id));
  return intersection.length / reference.length;
}

async function main() {
  try {
    const fixture = JSON.parse(fs.readFileSync(path.resolve(CONFIG_PATH), 'utf8'));
    const vectors = Array.isArray(fixture) ? fixture : fixture.vectors;
    if (!Array.isArray(vectors) || vectors.length === 0) {
      throw new Error('Fixture não possui vetores');
    }

    type ReportRow = {
      externalId: string;
      module?: string;
      faissLatencyMs: number;
      pgvectorLatencyMs: number;
      recallAtK: number;
      faissTop: string[];
      pgvectorTop: string[];
    };
    const report: ReportRow[] = [];

    type Sample = { embedding: number[]; module?: string; externalId: string };
    for (const vector of vectors as Sample[]) {
      const query = vector.embedding;
      const topK = 5;

      const faiss = await searchFaiss(query, topK);
      const pgvector = await searchPgvector(query, topK, vector.module);

      const recall = recallAtK(faiss.ids, pgvector.ids);

      report.push({
        externalId: vector.externalId,
        module: vector.module,
        faissLatencyMs: faiss.latency,
        pgvectorLatencyMs: pgvector.latency,
        recallAtK: recall,
        faissTop: faiss.ids,
        pgvectorTop: pgvector.ids,
      });
    }

    const summary = {
      averageFaissLatency: report.reduce((acc, item) => acc + item.faissLatencyMs, 0) / report.length,
      averagePgvectorLatency: report.reduce((acc, item) => acc + item.pgvectorLatencyMs, 0) / report.length,
      averageRecall: report.reduce((acc, item) => acc + item.recallAtK, 0) / report.length,
      samples: report.length,
    };

    const output = { summary, detail: report, config: { CONFIG_PATH, ML_API_URL, VECTOR_SEARCH_URL } };

    fs.mkdirSync('docs/qa', { recursive: true });
    fs.writeFileSync('docs/qa/vector-benchmark.json', JSON.stringify(output, null, 2));

    console.log('Benchmark concluído:');
    console.table(report.map(({ externalId, faissLatencyMs, pgvectorLatencyMs, recallAtK }) => ({ externalId, faissLatencyMs: faissLatencyMs.toFixed(2), pgvectorLatencyMs: pgvectorLatencyMs.toFixed(2), recallAtK: recallAtK.toFixed(2) })));
    console.log('Médias:', summary);
  } catch (error) {
    console.error('Falha no benchmark:', (error as Error).message);
    process.exit(1);
  }
}

void main();
