// src/app/api/agents/metrics/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const metricsFile = path.join(process.cwd(), ".cursor/agents/metrics.json");

    let metrics = {
      executions: [],
      totalExecutions: 0,
      avgExecutionTime: 0,
      successRate: 100,
    };

    if (fs.existsSync(metricsFile)) {
      metrics = JSON.parse(fs.readFileSync(metricsFile, "utf8"));
    }

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { agent, action, executionTime, success } = await request.json();

    const metricsFile = path.join(process.cwd(), ".cursor/agents/metrics.json");
    const metricsDir = path.dirname(metricsFile);

    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }

    let metrics = {
      executions: [],
      totalExecutions: 0,
      avgExecutionTime: 0,
      successRate: 100,
    };

    if (fs.existsSync(metricsFile)) {
      metrics = JSON.parse(fs.readFileSync(metricsFile, "utf8"));
    }

    // Adicionar nova execução
    metrics.executions.push({
      agent,
      action,
      executionTime,
      success,
      timestamp: new Date().toISOString(),
    });

    // Manter apenas últimas 100 execuções
    if (metrics.executions.length > 100) {
      metrics.executions = metrics.executions.slice(-100);
    }

    // Recalcular métricas
    metrics.totalExecutions = metrics.executions.length;
    metrics.avgExecutionTime =
      metrics.executions.reduce((sum, e) => sum + e.executionTime, 0) /
      metrics.totalExecutions;

    const successCount = metrics.executions.filter((e) => e.success).length;
    metrics.successRate = (successCount / metrics.totalExecutions) * 100;

    fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
