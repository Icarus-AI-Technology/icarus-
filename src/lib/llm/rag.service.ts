type StoredDocument = {
  id: string;
  pageContent: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

type SearchResult = StoredDocument & { score: number };

const STORAGE_KEY = 'icarus-rag-docs';
const MAX_DOCS = 500;

const isBrowser = typeof window !== 'undefined';
let fallbackStore: StoredDocument[] = [];

function cloneDocuments(docs: StoredDocument[]): StoredDocument[] {
  return docs.map((doc) => ({
    ...doc,
    metadata: { ...(doc.metadata || {}) },
  }));
}

function readFromStorage(): StoredDocument[] {
  if (isBrowser) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredDocument[];
        if (Array.isArray(parsed)) {
          return cloneDocuments(parsed);
        }
      }
    } catch (error) {
      console.warn('[RAGService] Falha ao ler localStorage, usando memória temporária.', error);
    }
  }

  return cloneDocuments(fallbackStore);
}

function persistToStorage(docs: StoredDocument[]) {
  const snapshot = cloneDocuments(docs);

  if (isBrowser) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      fallbackStore = snapshot;
      return;
    } catch (error) {
      console.warn('[RAGService] Não foi possível persistir no localStorage.', error);
    }
  }

  fallbackStore = snapshot;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .filter(Boolean);
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
}

export class RAGService {
  private documents: StoredDocument[] = [];

  constructor() {
    this.documents = readFromStorage();
  }

  private persist() {
    persistToStorage(this.documents);
  }

  private scoreDocument(doc: StoredDocument, queryTokens: string[]): number {
    if (queryTokens.length === 0) return 0;

    const normalizedContent = normalize(doc.pageContent);
    let score = 0;

    for (const token of queryTokens) {
      if (normalizedContent.includes(token)) {
        score += 1;
      }
    }

    return score;
  }

  private matchesFilter(metadata: Record<string, unknown>, filter: Record<string, unknown>): boolean {
    const entries = Object.entries(filter || {});
    if (entries.length === 0) return true;

    return entries.every(([key, value]) => {
      if (value === undefined) return true;
      const target = metadata?.[key];

      if (typeof value === 'string') {
        return normalize(String(target ?? '')).includes(normalize(value));
      }

      if (typeof value === 'number' || typeof value === 'boolean') {
        return target === value;
      }

      return JSON.stringify(target) === JSON.stringify(value);
    });
  }

  private runSearch(query: string, limit: number, dataset: StoredDocument[] = this.documents) {
    const tokens = tokenize(query);
    if (tokens.length === 0) return [];

    return dataset
      .map<SearchResult>((doc) => ({
        ...doc,
        score: this.scoreDocument(doc, tokens),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...doc }) => ({
        pageContent: doc.pageContent,
        metadata: doc.metadata,
        score,
        createdAt: doc.createdAt,
        id: doc.id,
      }));
  }

  async addDocuments(texts: string[], metadatas: Record<string, unknown>[] = []) {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error('Forneça pelo menos um documento para indexar.');
    }

    const now = new Date().toISOString();
    const validDocs = texts
      .map((text, index) => {
        const trimmed = text?.trim();
        if (!trimmed) return null;

        return {
          id: createId(),
          pageContent: trimmed,
          metadata: { ...(metadatas[index] || {}) },
          createdAt: now,
        } satisfies StoredDocument;
      })
      .filter((item): item is StoredDocument => Boolean(item));

    if (validDocs.length === 0) {
      throw new Error('Nenhum documento válido foi fornecido.');
    }

    this.documents = [...validDocs, ...this.documents].slice(0, MAX_DOCS);
    this.persist();

    return { success: true, count: validDocs.length };
  }

  async search(query: string, k: number = 4) {
    return this.runSearch(query, k);
  }

  async searchWithFilter(query: string, filter: Record<string, unknown>, k: number = 4) {
    const filteredDocs = this.documents.filter((doc) => this.matchesFilter(doc.metadata, filter));
    return this.runSearch(query, k, filteredDocs);
  }

  /**
   * Remove todos os documentos indexados. Útil em cenários de teste.
   */
  clear() {
    this.documents = [];
    this.persist();
  }

  /**
   * Lista documentos armazenados. Exposto apenas para fins de depuração.
   */
  listDocuments(): StoredDocument[] {
    return cloneDocuments(this.documents);
  }
}

export const ragService = new RAGService();

