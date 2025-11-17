// Meilisearch Cloud Configuration
// URL: https://edge.meilisearch.com
// Host: https://ms-ed15a9ff096f-33289.nyc.meilisearch.io

import { MeiliSearch } from "meilisearch";

// Configuration
export const meilisearchConfig = {
  url: "https://edge.meilisearch.com",
  host: "https://ms-ed15a9ff096f-33289.nyc.meilisearch.io",
  apiKey:
    import.meta.env.VITE_MEILISEARCH_API_KEY ||
    "ad1aa420c6b6710ae03f6d23b3f816c3611ed9d0",
  index: "icarus_index",
  analytics: true,
};

// Client instance
export const meilisearchClient = new MeiliSearch({
  host: meilisearchConfig.url,
  apiKey: meilisearchConfig.apiKey,
});

// Helper functions
export async function testConnection() {
  try {
    const health = await meilisearchClient.health();
    console.log("✅ Meilisearch conectado:", health);
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar Meilisearch:", error);
    return false;
  }
}

export async function searchIcarus(query: string, options = {}) {
  try {
    const index = meilisearchClient.index(meilisearchConfig.index);

    const results = await index.search(query, {
      limit: 20,
      attributesToRetrieve: [
        "id",
        "section_title",
        "breadcrumbs",
        "hierarchy",
        "content",
        "keywords",
        "path_slug",
      ],
      attributesToHighlight: ["content", "section_title", "breadcrumbs"],
      showMatchesPosition: true,
      showRankingScore: true,
      ...options,
    });

    return results;
  } catch (error) {
    console.error("❌ Erro na busca:", error);
    throw error;
  }
}

export async function createOrUpdateIndex() {
  try {
    // Criar ou atualizar índice
    const index = meilisearchClient.index(meilisearchConfig.index);

    // Configurar atributos de busca
    await index.updateSearchableAttributes([
      "content",
      "section_title",
      "breadcrumbs",
      "hierarchy",
      "keywords",
      "path_slug",
    ]);

    // Configurar atributos filtráveis
    await index.updateFilterableAttributes([
      "top_level",
      "parent_section",
      "path_slug",
    ]);

    // Configurar atributos ordenáveis
    await index.updateSortableAttributes(["order"]);

    console.log("✅ Índice configurado com sucesso");
    return true;
  } catch (error) {
    console.error("❌ Erro ao configurar índice:", error);
    return false;
  }
}

export async function indexDocuments(documents: any[]) {
  try {
    const index = meilisearchClient.index(meilisearchConfig.index);
    const task = await index.addDocuments(documents);

    console.log("✅ Documentos indexados:", task);
    return task;
  } catch (error) {
    console.error("❌ Erro ao indexar documentos:", error);
    throw error;
  }
}

export default meilisearchClient;
