// src/app/api/agents/status/route.ts
import { NextResponse } from "next/server";
import { AgentOrchestrator } from "@/lib/agents/orchestrator";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const agents = AgentOrchestrator.getAvailableAgents();

    const agentStatus = agents.map((agent) => {
      const commands = AgentOrchestrator.getAvailableCommands(agent);

      return {
        name: agent,
        status: "online",
        commands: commands.length,
        commandsList: commands,
        lastCheck: new Date().toISOString(),
      };
    });

    // Ler últimos logs de validação
    const validatorDir = path.join(
      process.cwd(),
      ".cursor/agents/ia-validator",
    );
    let latestValidation = null;

    if (fs.existsSync(validatorDir)) {
      const files = fs
        .readdirSync(validatorDir)
        .filter((f) => f.startsWith("topology-validation"))
        .sort()
        .reverse();

      if (files.length > 0) {
        const reportPath = path.join(validatorDir, files[0]);
        latestValidation = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      agents: agentStatus,
      totalAgents: agents.length,
      totalCommands: agentStatus.reduce((sum, a) => sum + a.commands, 0),
      validation: latestValidation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
