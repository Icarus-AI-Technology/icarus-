import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    console.log("[Webhook-Processor] Starting webhook processing...");

    // Processar fila de webhooks pendentes
    const { data: pendingDeliveries } = await supabaseClient.rpc(
      "process_webhook_queue",
      {
        p_batch_size: 20,
      },
    );

    if (!pendingDeliveries || pendingDeliveries.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No pending webhooks",
          processed: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      `[Webhook-Processor] Processing ${pendingDeliveries.length} webhooks...`,
    );

    const results = [];

    for (const delivery of pendingDeliveries) {
      try {
        const result = await processWebhookDelivery(
          supabaseClient,
          delivery.delivery_id,
        );
        results.push(result);
      } catch (error) {
        console.error(
          `[Webhook-Processor] Error processing ${delivery.delivery_id}:`,
          error,
        );
        results.push({
          delivery_id: delivery.delivery_id,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.length - successCount;

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        successful: successCount,
        failed: failedCount,
        results: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[Webhook-Processor] Fatal error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

/**
 * Processar entrega de webhook individual
 */
async function processWebhookDelivery(
  client: any,
  deliveryId: string,
): Promise<any> {
  // 1. Buscar informações da delivery e do endpoint
  const { data: delivery, error: deliveryError } = await client
    .from("webhook_deliveries")
    .select("*, webhook_endpoints(*)")
    .eq("delivery_id", deliveryId)
    .single();

  if (deliveryError) throw deliveryError;

  const endpoint = delivery.webhook_endpoints;

  // 2. Atualizar status para "sending"
  await client
    .from("webhook_deliveries")
    .update({
      status: "sending",
      sent_at: new Date().toISOString(),
    })
    .eq("delivery_id", deliveryId);

  // 3. Preparar request
  const payload = {
    event_type: delivery.event_type,
    event_data: delivery.event_data,
    delivery_id: delivery.delivery_id,
    timestamp: new Date().toISOString(),
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "ICARUS-Webhook/1.0",
    "X-Webhook-Event": delivery.event_type,
    "X-Webhook-Delivery-Id": delivery.delivery_id,
    ...endpoint.custom_headers,
  };

  // 4. Adicionar autenticação
  if (endpoint.auth_type === "bearer") {
    headers["Authorization"] = `Bearer ${endpoint.auth_config.token}`;
  } else if (endpoint.auth_type === "api_key") {
    headers[endpoint.auth_config.header_name || "X-API-Key"] =
      endpoint.auth_config.api_key;
  } else if (endpoint.auth_type === "basic") {
    const credentials = btoa(
      `${endpoint.auth_config.username}:${endpoint.auth_config.password}`,
    );
    headers["Authorization"] = `Basic ${credentials}`;
  } else if (endpoint.auth_type === "hmac" && endpoint.secret_key) {
    // HMAC signature
    const signature = generateHmacSignature(
      JSON.stringify(payload),
      endpoint.secret_key,
    );
    headers["X-Webhook-Signature"] = signature;
  }

  const startTime = Date.now();

  try {
    // 5. Enviar webhook
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      endpoint.timeout_seconds * 1000,
    );

    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const responseBody = await response.text();

    // 6. Atualizar delivery com sucesso
    if (response.ok) {
      await client
        .from("webhook_deliveries")
        .update({
          status: "success",
          response_status: response.status,
          response_headers: Object.fromEntries(response.headers.entries()),
          response_body: responseBody.substring(0, 10000), // Limitar tamanho
          response_time_ms: responseTime,
          completed_at: new Date().toISOString(),
        })
        .eq("delivery_id", deliveryId);

      console.log(
        `[Webhook-Processor] Success: ${deliveryId} -> ${endpoint.url}`,
      );

      return {
        delivery_id: deliveryId,
        success: true,
        status: response.status,
        response_time_ms: responseTime,
      };
    } else {
      // 7. Falha - verificar se deve fazer retry
      const shouldRetry = delivery.retry_count < endpoint.max_retries;

      await client
        .from("webhook_deliveries")
        .update({
          status: shouldRetry ? "retrying" : "failed",
          response_status: response.status,
          response_headers: Object.fromEntries(response.headers.entries()),
          response_body: responseBody.substring(0, 10000),
          response_time_ms: responseTime,
          error_message: `HTTP ${response.status}: ${response.statusText}`,
          error_code: `HTTP_${response.status}`,
          retry_count: delivery.retry_count + 1,
          next_retry_at: shouldRetry
            ? new Date(
                Date.now() + endpoint.retry_delay_seconds * 1000,
              ).toISOString()
            : null,
          completed_at: !shouldRetry ? new Date().toISOString() : null,
        })
        .eq("delivery_id", deliveryId);

      console.warn(
        `[Webhook-Processor] Failed: ${deliveryId} -> ${endpoint.url} (${response.status})`,
      );

      return {
        delivery_id: deliveryId,
        success: false,
        status: response.status,
        will_retry: shouldRetry,
        retry_count: delivery.retry_count + 1,
      };
    }
  } catch (error) {
    // 8. Erro de rede/timeout
    const shouldRetry = delivery.retry_count < endpoint.max_retries;
    const responseTime = Date.now() - startTime;

    await client
      .from("webhook_deliveries")
      .update({
        status: shouldRetry ? "retrying" : "failed",
        response_time_ms: responseTime,
        error_message: error.message,
        error_code: error.name,
        retry_count: delivery.retry_count + 1,
        next_retry_at: shouldRetry
          ? new Date(
              Date.now() + endpoint.retry_delay_seconds * 1000,
            ).toISOString()
          : null,
        completed_at: !shouldRetry ? new Date().toISOString() : null,
      })
      .eq("delivery_id", deliveryId);

    console.error(
      `[Webhook-Processor] Error: ${deliveryId} -> ${endpoint.url}`,
      error.message,
    );

    return {
      delivery_id: deliveryId,
      success: false,
      error: error.message,
      will_retry: shouldRetry,
      retry_count: delivery.retry_count + 1,
    };
  }
}

/**
 * Gerar assinatura HMAC
 */
function generateHmacSignature(payload: string, secret: string): string {
  const hmac = createHmac("sha256", secret);
  hmac.update(payload);
  return "sha256=" + hmac.digest("hex");
}
