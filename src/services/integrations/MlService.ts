import axios from 'axios';

type EnvBag = { env?: Record<string, unknown> };
const runtimeImportMeta: EnvBag | undefined =
  typeof import.meta !== 'undefined' ? (import.meta as unknown as EnvBag) : undefined;

const ML_API_URL =
  (runtimeImportMeta?.env?.VITE_ML_API_URL as string | undefined) ||
  (typeof process !== 'undefined'
    ? (process.env?.VITE_ML_API_URL as string | undefined)
    : undefined) ||
  'http://localhost:8000';

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function resolveVectorEndpoint(): string | undefined {
  const fromImportMeta = runtimeImportMeta?.env?.VITE_ML_VECTOR_URL as string | undefined;
  if (fromImportMeta) return fromImportMeta;

  const fromProcess =
    typeof process !== 'undefined'
      ? (process.env?.ML_VECTOR_API_URL as string | undefined)
      : undefined;
  if (fromProcess) return fromProcess;

  if (typeof process !== 'undefined' && process.env?.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/ml/vectors`;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/ml/vectors`;
  }

  return undefined;
}

export async function generateLLM(prompt: string) {
  const { data } = await axios.post(`${ML_API_URL}/llm/mistral`, {
    prompt,
    max_tokens: 256,
    temperature: 0.2,
  });
  return data;
}

export async function analyzeFinance(text: string, task = 'sentiment') {
  const { data } = await axios.post(`${ML_API_URL}/nlp/finance`, { text, task });
  return data;
}

export async function optimizeObjective(objective: number[]) {
  const { data } = await axios.post(`${ML_API_URL}/optimizer/or-tools`, { objective });
  return data;
}

export async function forecastSeries(timestamps: string[], values: number[], horizon = 7) {
  const { data } = await axios.post(`${ML_API_URL}/timeseries/prophet`, {
    timestamps,
    values,
    horizon,
  });
  return data;
}

export async function addVectors(ids: string[], vectors: number[][]) {
  const { data } = await axios.post(`${ML_API_URL}/vector/faiss/add`, { ids, vectors });
  return data;
}

export async function clearVectors() {
  const { data } = await axios.post(`${ML_API_URL}/vector/faiss/clear`);
  return data;
}

export async function searchVector(query: number[], topK = 5) {
  const { data } = await axios.post(`${ML_API_URL}/vector/faiss/search`, { query, top_k: topK });
  return data;
}

type PersistVectorInput = {
  externalId: string;
  module: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
};

export async function persistVectors(payload: PersistVectorInput[], endpointOverride?: string) {
  const endpoint = endpointOverride ?? resolveVectorEndpoint();
  invariant(endpoint, 'VECTOR_ENDPOINT não configurado');

  const { data } = await axios.post(endpoint, {
    vectors: payload.map((item) => ({
      external_id: item.externalId,
      module: item.module,
      embedding: item.embedding,
      metadata: item.metadata ?? {},
    })),
  });

  return data;
}

export async function clearPersistedVectors(endpointOverride?: string) {
  const endpoint = endpointOverride ?? resolveVectorEndpoint();
  invariant(endpoint, 'VECTOR_ENDPOINT não configurado');

  const { data } = await axios.delete(endpoint);
  return data;
}

export async function listPersistedVectors(
  params?: { externalId?: string; module?: string },
  endpointOverride?: string
) {
  const endpoint = endpointOverride ?? resolveVectorEndpoint();
  invariant(endpoint, 'VECTOR_ENDPOINT não configurado');

  const search = new URLSearchParams();
  if (params?.externalId) search.set('external_id', params.externalId);
  if (params?.module) search.set('module', params.module);

  const { data } = await axios.get(
    `${endpoint}${search.toString() ? `?${search.toString()}` : ''}`
  );
  return data;
}
