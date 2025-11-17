#!/usr/bin/env node

/**
 * Script de teste do Meilisearch Cloud
 * Testa conexão e funcionalidades básicas
 */

import fetch from "node-fetch";

const config = {
  url: "https://edge.meilisearch.com",
  host: "https://ms-ed15a9ff096f-33289.nyc.meilisearch.io",
  apiKey: "ad1aa420c6b6710ae03f6d23b3f816c3611ed9d0",
  index: "icarus_index",
};

async function testMeilisearch() {
  console.log("🔍 Testando Meilisearch Cloud...\n");

  // 1. Test Health
  console.log("1️⃣ Testando conexão...");
  try {
    const healthResponse = await fetch(`${config.url}/health`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "X-Meilisearch-Host": config.host,
      },
    });

    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log("✅ Health:", health);
    } else {
      console.log("⚠️ Health check failed:", healthResponse.status);
    }
  } catch (error) {
    console.error("❌ Erro no health check:", error.message);
  }

  // 2. Test Version
  console.log("\n2️⃣ Verificando versão...");
  try {
    const versionResponse = await fetch(`${config.url}/version`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "X-Meilisearch-Host": config.host,
      },
    });

    if (versionResponse.ok) {
      const version = await versionResponse.json();
      console.log("✅ Versão:", version);
    }
  } catch (error) {
    console.error("❌ Erro ao buscar versão:", error.message);
  }

  // 3. List Indexes
  console.log("\n3️⃣ Listando índices...");
  try {
    const indexesResponse = await fetch(`${config.url}/indexes`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "X-Meilisearch-Host": config.host,
      },
    });

    if (indexesResponse.ok) {
      const indexes = await indexesResponse.json();
      console.log("✅ Índices:", JSON.stringify(indexes, null, 2));
    }
  } catch (error) {
    console.error("❌ Erro ao listar índices:", error.message);
  }

  // 4. Create Index
  console.log("\n4️⃣ Criando/verificando índice icarus_index...");
  try {
    const createIndexResponse = await fetch(`${config.url}/indexes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        "X-Meilisearch-Host": config.host,
      },
      body: JSON.stringify({
        uid: config.index,
        primaryKey: "id",
      }),
    });

    if (createIndexResponse.ok) {
      const result = await createIndexResponse.json();
      console.log("✅ Índice criado:", result);
    } else if (createIndexResponse.status === 409) {
      console.log("✅ Índice já existe");
    } else {
      console.log("⚠️ Status:", createIndexResponse.status);
    }
  } catch (error) {
    console.error("❌ Erro ao criar índice:", error.message);
  }

  // 5. Index sample document
  console.log("\n5️⃣ Indexando documento de teste...");
  try {
    const sampleDoc = {
      id: "test-001",
      section_title: "Sistema Icarus V5.0",
      breadcrumbs: ["Home", "Documentação", "Início"],
      hierarchy: ["Sistema", "Documentação"],
      top_level: "Sistema",
      parent_section: "Documentação",
      content:
        "O Icarus V5.0 é um sistema completo com Enterprise Deep Research integrado.",
      order: 1,
      content_length: 85,
      keywords: ["icarus", "sistema", "edr", "pesquisa"],
      path_slug: "/docs/inicio",
    };

    const addDocResponse = await fetch(
      `${config.url}/indexes/${config.index}/documents`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
          "X-Meilisearch-Host": config.host,
        },
        body: JSON.stringify([sampleDoc]),
      },
    );

    if (addDocResponse.ok) {
      const result = await addDocResponse.json();
      console.log("✅ Documento indexado:", result);
    }
  } catch (error) {
    console.error("❌ Erro ao indexar documento:", error.message);
  }

  // 6. Search test
  console.log("\n6️⃣ Testando busca...");
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Aguardar indexação

    const searchResponse = await fetch(
      `${config.url}/indexes/${config.index}/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
          "X-Meilisearch-Host": config.host,
        },
        body: JSON.stringify({
          q: "icarus",
          limit: 5,
        }),
      },
    );

    if (searchResponse.ok) {
      const results = await searchResponse.json();
      console.log("✅ Resultados da busca:");
      console.log(`   Encontrados: ${results.hits?.length || 0} documentos`);
      if (results.hits?.length > 0) {
        console.log("   Primeiro resultado:", results.hits[0].section_title);
      }
    }
  } catch (error) {
    console.error("❌ Erro na busca:", error.message);
  }

  // 7. Stats
  console.log("\n7️⃣ Estatísticas do índice...");
  try {
    const statsResponse = await fetch(
      `${config.url}/indexes/${config.index}/stats`,
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "X-Meilisearch-Host": config.host,
        },
      },
    );

    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log("✅ Estatísticas:", JSON.stringify(stats, null, 2));
    }
  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎯 TESTE CONCLUÍDO!");
  console.log("=".repeat(60));
  console.log("\n📊 Configuração:");
  console.log(`   URL: ${config.url}`);
  console.log(`   Host: ${config.host}`);
  console.log(`   Índice: ${config.index}`);
  console.log(`   Analytics: Habilitado`);
}

testMeilisearch().catch(console.error);
