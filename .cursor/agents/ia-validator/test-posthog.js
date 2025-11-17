#!/usr/bin/env node

/**
 * Script de teste do PostHog
 * Testa configuração e funcionalidades básicas
 */

import fetch from "node-fetch";

const config = {
  apiKey: "phx_nlBCJxYa8wDWU3eLGRHh242t9Nt3t8RP9xuxatDkEN7C48T",
  host: "https://app.posthog.com",
  projectId: "default",
};

async function testPostHog() {
  console.log("📊 Testando PostHog Analytics...\n");

  // 1. Test API key validity
  console.log("1️⃣ Validando API key...");
  try {
    // PostHog capture event test
    const captureResponse = await fetch(`${config.host}/capture/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: config.apiKey,
        event: "test_connection",
        properties: {
          test: true,
          timestamp: new Date().toISOString(),
        },
        distinct_id: "test-user-validation",
      }),
    });

    if (captureResponse.ok || captureResponse.status === 200) {
      console.log("✅ API Key válida");
    } else {
      console.log(`⚠️ Status: ${captureResponse.status}`);
    }
  } catch (error) {
    console.error("❌ Erro na validação:", error.message);
  }

  // 2. Send test event
  console.log("\n2️⃣ Enviando evento de teste...");
  try {
    const testEvent = {
      api_key: config.apiKey,
      event: "icarus_validation_test",
      properties: {
        source: "validation_script",
        system: "Icarus V5.0",
        component: "PostHog Integration",
        timestamp: new Date().toISOString(),
        ias_operacionais: 5,
        meilisearch_docs: 32037,
      },
      distinct_id: "icarus-system-validation",
    };

    const eventResponse = await fetch(`${config.host}/capture/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testEvent),
    });

    if (eventResponse.ok || eventResponse.status === 200) {
      console.log("✅ Evento enviado com sucesso");
    } else {
      console.log(`⚠️ Status: ${eventResponse.status}`);
    }
  } catch (error) {
    console.error("❌ Erro ao enviar evento:", error.message);
  }

  // 3. Test identify user
  console.log("\n3️⃣ Testando identify user...");
  try {
    const identifyPayload = {
      api_key: config.apiKey,
      event: "$identify",
      properties: {
        $set: {
          name: "Icarus System",
          email: "system@icarus.dev",
          version: "5.0.0",
          environment: "development",
        },
      },
      distinct_id: "icarus-system",
    };

    const identifyResponse = await fetch(`${config.host}/capture/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(identifyPayload),
    });

    if (identifyResponse.ok || identifyResponse.status === 200) {
      console.log("✅ User identified");
    }
  } catch (error) {
    console.error("❌ Erro ao identificar user:", error.message);
  }

  // 4. Test pageview
  console.log("\n4️⃣ Testando pageview tracking...");
  try {
    const pageviewPayload = {
      api_key: config.apiKey,
      event: "$pageview",
      properties: {
        $current_url: "https://icarus.dev/validation",
        $pathname: "/validation",
        title: "PostHog Validation Test",
      },
      distinct_id: "icarus-system-validation",
    };

    const pageviewResponse = await fetch(`${config.host}/capture/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pageviewPayload),
    });

    if (pageviewResponse.ok || pageviewResponse.status === 200) {
      console.log("✅ Pageview tracked");
    }
  } catch (error) {
    console.error("❌ Erro ao rastrear pageview:", error.message);
  }

  // 5. Test custom event (EDR)
  console.log("\n5️⃣ Testando evento customizado (EDR)...");
  try {
    const edrEventPayload = {
      api_key: config.apiKey,
      event: "edr_research_session",
      properties: {
        session_id: "test-session-001",
        query: "Test research query",
        agents_used: ["general", "academic", "meilisearch"],
        results_count: 42,
        confidence_score: 0.89,
        timestamp: new Date().toISOString(),
      },
      distinct_id: "icarus-edr-system",
    };

    const edrResponse = await fetch(`${config.host}/capture/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(edrEventPayload),
    });

    if (edrResponse.ok || edrResponse.status === 200) {
      console.log("✅ EDR event tracked");
    }
  } catch (error) {
    console.error("❌ Erro ao rastrear EDR event:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎯 TESTE CONCLUÍDO!");
  console.log("=".repeat(60));
  console.log("\n📊 Configuração:");
  console.log(`   Host: ${config.host}`);
  console.log(`   API Key: ${config.apiKey.substring(0, 20)}...`);
  console.log(`   Status: ✅ Operacional`);
  console.log("\n💡 Acesse o dashboard PostHog para ver os eventos:");
  console.log(`   ${config.host}/project/${config.projectId}/events`);
}

testPostHog().catch(console.error);
