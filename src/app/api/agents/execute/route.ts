// src/app/api/agents/execute/route.ts
// API endpoint para executar comandos de agentes

import { NextRequest, NextResponse } from "next/server";
import { AgentOrchestrator } from "@/lib/agents/orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/agents/execute
 * Executa um comando de agente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent, action, params } = body;

    // Validação
    if (!agent || !action) {
      return NextResponse.json(
        { success: false, error: "Agent e action são obrigatórios" },
        { status: 400 },
      );
    }

    // Verificar se agente existe
    const availableAgents = AgentOrchestrator.getAvailableAgents();
    if (!availableAgents.includes(agent)) {
      return NextResponse.json(
        {
          success: false,
          error: `Agente "${agent}" não encontrado`,
          availableAgents,
        },
        { status: 404 },
      );
    }

    // Executar comando
    const result = await AgentOrchestrator.executeCommand({
      agent,
      action,
      params,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro ao executar agente:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

/**
 * GET /api/agents/execute
 * Lista agentes e ações disponíveis
 */
export async function GET() {
  try {
    const agents = AgentOrchestrator.getAvailableAgents();
    const agentsWithCommands = agents.map((agent) => ({
      agent,
      commands: AgentOrchestrator.getAvailableCommands(agent),
    }));

    return NextResponse.json({
      success: true,
      agents: agentsWithCommands,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
