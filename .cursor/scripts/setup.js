#!/usr/bin/env node
/**
 * Setup script to scaffold the .cursor directory structure and seed files.
 * Idempotent: existing files are not overwritten unless explicitly needed.
 */
import { promises as fs } from 'fs';
import path from 'node:path';

const encoder = new TextEncoder();

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureFile(filePath, content) {
  const exists = await pathExists(filePath);
  if (!exists) {
    const dir = path.dirname(filePath);
    await ensureDir(dir);
    await fs.writeFile(filePath, typeof content === 'string' ? content : encoder.encode(content));
  }
}

async function ensureJSON(filePath, data) {
  const exists = await pathExists(filePath);
  if (!exists) {
    const dir = path.dirname(filePath);
    await ensureDir(dir);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
  }
}

function nowIso() {
  return new Date().toISOString();
}

function getAgentsSpec() {
  return [
    { id: '00-ORCHESTRATOR', type: 'single', title: 'Orquestrador mestre' },
    {
      id: '01-design-system',
      title: 'Design System',
      subagents: ['1.1-components', '1.2-responsive-a11y', '1.3-themes'],
    },
    {
      id: '02-frontend',
      title: 'Frontend',
      subagents: ['2.1-routes', '2.2-hooks-context', '2.3-typescript', '2.4-performance'],
    },
    {
      id: '03-backend',
      title: 'Backend',
      subagents: ['3.1-schema-tables', '3.2-rpc-views', '3.3-triggers-constraints', '3.4-rls-documentation'],
    },
    {
      id: '04-integrations',
      title: 'Integrações',
      subagents: ['4.1-external-apis', '4.2-supabase-services', '4.3-transportadoras', '4.4-webhooks-queue'],
    },
    {
      id: '05-ai',
      title: 'AI',
      subagents: ['5.1-ml-models', '5.2-vector-search', '5.3-llm-services', '5.4-compliance-ai'],
    },
    {
      id: '06-modules',
      title: 'Módulos',
      subagents: [
        '6.1-core-business',
        '6.2-compras-fornecedores',
        '6.3-logistica-frota',
        '6.4-rh-pessoas',
        '6.5-analytics-bi',
        '6.6-integracoes-automacao',
        '6.7-inventario-armazem',
      ],
    },
    {
      id: '07-security',
      title: 'Segurança',
      subagents: ['7.1-auth-rbac', '7.2-validations-sanitization', '7.3-anvisa-regulatory', '7.4-abbott-score'],
    },
    {
      id: '08-testing',
      title: 'Testes',
      subagents: ['8.1-e2e-playwright', '8.2-unit-vitest', '8.3-qa-scripts', '8.4-benchmarks'],
    },
    {
      id: '09-deploy',
      title: 'Deploy',
      subagents: ['9.1-build-bundle', '9.2-env-configs', '9.3-vercel-setup', '9.4-cicd-monitoring'],
    },
  ];
}

function makeStatusTemplate() {
  return {
    status: 'pending',
    progress: 0,
    updatedAt: nowIso(),
    notes: [],
  };
}

function makeAgentMd(title, id) {
  return `# ${title} (${id})\n\n- Status: pending\n- Atualizado: ${nowIso()}\n\n## Objetivos\n\nDescrever objetivos do agente ${title}.\n\n## Entradas\n- TBD\n\n## Saídas\n- TBD\n`;
}

function makeSubagentMd(name, parentId) {
  return `# ${name} (subagent de ${parentId})\n\n- Status: pending\n- Atualizado: ${nowIso()}\n\n## Escopo\n- TBD\n`;
}

function makeReportMd(title) {
  return `# ${title} - Relatório\n\nGerado em ${nowIso()}.\n\n## Resumo\n- TBD\n\n## Passos executados\n- TBD\n`;
}

async function seedTemplates(base) {
  const templatesDir = path.join(base, 'templates');
  await ensureDir(templatesDir);
  await ensureFile(
    path.join(templatesDir, 'AGENT-TEMPLATE.md'),
    `# AGENTE - Template\n\n## Objetivos\n- ...\n\n## Entradas\n- ...\n\n## Saídas\n- ...\n`
  );
  await ensureFile(
    path.join(templatesDir, 'SUBAGENT-TEMPLATE.md'),
    `# SUBAGENTE - Template\n\n## Escopo\n- ...\n`
  );
  await ensureJSON(path.join(templatesDir, 'STATUS-TEMPLATE.json'), makeStatusTemplate());
  await ensureFile(
    path.join(templatesDir, 'REPORT-TEMPLATE.md'),
    `# Relatório - Template\n\n## Resumo\n- ...\n\n## Execução\n- ...\n`
  );
}

async function seedProtocols(base) {
  const protocolsDir = path.join(base, 'protocols');
  await ensureDir(protocolsDir);
  await ensureFile(
    path.join(protocolsDir, 'SYNC-PROTOCOL.md'),
    `# Protocolo de Sincronização\n\n- Mensagens no diretório \'messages\'\n- Locks no diretório \'locks\'\n- STATUS.json atualizado a cada etapa\n`
  );
  await ensureFile(
    path.join(protocolsDir, 'COMMUNICATION.md'),
    `# Comunicação entre Agentes\n\n- Mensagens assíncronas via arquivos\n- Logs em \'logs\'\n`
  );
  await ensureFile(
    path.join(protocolsDir, 'LOCKS.md'),
    `# Sistema de Locks\n\n- Exclusão mútua por arquivo\n- Tempo de expiração opcional\n`
  );
}

async function seedConfigs(base) {
  const configDir = path.join(base, 'config');
  await ensureDir(configDir);

  const agents = getAgentsSpec();
  const plan = {
    version: 1,
    generatedAt: nowIso(),
    order: agents
      .map((a) => a.id)
      .filter((id) => id !== '00-ORCHESTRATOR'),
    agents: Object.fromEntries(
      agents
        .filter((a) => a.id !== '00-ORCHESTRATOR')
        .map((a) => [a.id, { enabled: true, title: a.title }])
    ),
  };
  await ensureJSON(path.join(configDir, 'execution-plan.json'), plan);

  const resources = {
    version: 1,
    resources: [
      { id: 'reports', type: 'fs-dir', path: '.cursor/reports' },
      { id: 'logs', type: 'fs-dir', path: '.cursor/logs' },
      { id: 'messages', type: 'fs-dir', path: '.cursor/messages' },
      { id: 'locks', type: 'fs-dir', path: '.cursor/locks' },
    ],
    locks: [],
  };
  await ensureJSON(path.join(configDir, 'resources.json'), resources);
}

async function seedAgents(base) {
  const agentsDir = path.join(base, 'agents');
  await ensureDir(agentsDir);

  const specs = getAgentsSpec();

  // 00-ORCHESTRATOR.md
  const orchestratorMd = `# Orquestrador Mestre (00-ORCHESTRATOR)\n\nResponsável por coordenar a execução dos agentes conforme o plano em \`.cursor/config/execution-plan.json\`.\n`;
  await ensureFile(path.join(agentsDir, '00-ORCHESTRATOR.md'), orchestratorMd);

  for (const spec of specs) {
    if (spec.id === '00-ORCHESTRATOR') continue;
    const agentPath = path.join(agentsDir, spec.id);
    const subagentsPath = path.join(agentPath, 'subagents');
    await ensureDir(agentPath);
    await ensureDir(subagentsPath);

    await ensureFile(path.join(agentPath, 'AGENT.md'), makeAgentMd(spec.title, spec.id));
    await ensureJSON(path.join(agentPath, 'STATUS.json'), makeStatusTemplate());
    await ensureFile(path.join(agentPath, 'REPORT.md'), makeReportMd(spec.title));

    if (Array.isArray(spec.subagents)) {
      for (const sub of spec.subagents) {
        await ensureFile(path.join(subagentsPath, `${sub}.md`), makeSubagentMd(sub, spec.id));
      }
    }
  }
}

async function seedScripts(base) {
  const scriptsDir = path.join(base, 'scripts');
  const utilsDir = path.join(scriptsDir, 'utils');
  await ensureDir(utilsDir);

  const loggerJs = [
    '// Simple logger that writes to .cursor/logs and console',
    "import { promises as fs } from 'fs';",
    "import path from 'node:path';",
    '',
    'export async function log(message, options = {}) {',
    "  const { level = 'info' } = options;",
    "  const line = [new Date().toISOString(), level, message].join(' ') + '\n';",
    "  const logsDir = path.resolve(process.cwd(), '.cursor/logs');",
    '  await fs.mkdir(logsDir, { recursive: true });',
    "  const logFile = path.join(logsDir, 'agents.log');",
    '  await fs.appendFile(logFile, line);',
    '  console.log(line.trim());',
    '}',
    ''
  ].join('\n');
  await ensureFile(path.join(utilsDir, 'logger.js'), loggerJs);

  const lockManagerJs = [
    '// Minimal file-based lock manager',
    "import { promises as fs } from 'fs';",
    "import path from 'node:path';",
    '',
    "const locksDir = path.resolve(process.cwd(), '.cursor/locks');",
    '',
    'export async function acquire(lockId) {',
    '  await fs.mkdir(locksDir, { recursive: true });',
    "  const file = path.join(locksDir, lockId + '.lock');",
    '  try {',
    '    await fs.writeFile(file, new Date().toISOString());',
    '    return true;',
    '  } catch {',
    '    return false;',
    '  }',
    '}',
    '',
    'export async function release(lockId) {',
    "  const file = path.join(locksDir, lockId + '.lock');",
    '  try {',
    '    await fs.unlink(file);',
    '  } catch {',
    '    // ignore',
    '  }',
    '}',
    ''
  ].join('\n');
  await ensureFile(path.join(utilsDir, 'lock-manager.js'), lockManagerJs);

  const statusUpdaterJs = [
    '// Update STATUS.json for an agent',
    "import { promises as fs } from 'fs';",
    "import path from 'node:path';",
    '',
    'export async function updateStatus(agentId, patch) {',
    "  const statusFile = path.resolve(process.cwd(), '.cursor/agents', agentId, 'STATUS.json');",
    '  const now = new Date().toISOString();',
    "  let current = { status: 'pending', progress: 0, updatedAt: now, notes: [] };",
    '  try {',
    "    const raw = await fs.readFile(statusFile, 'utf8');",
    '    current = JSON.parse(raw);',
    '  } catch { /* ignore */ }',
    '  const next = { ...current, ...patch, updatedAt: now };',
    "  await fs.writeFile(statusFile, JSON.stringify(next, null, 2) + '\n');",
    '  return next;',
    '}',
    ''
  ].join('\n');
  await ensureFile(path.join(utilsDir, 'status-updater.js'), statusUpdaterJs);

  const orchestratorJs = [
    '// Orchestrator: runs all enabled agents in order',
    "import { promises as fs } from 'fs';",
    "import path from 'node:path';",
    "import { log } from './utils/logger.js';",
    '',
    'async function readPlan() {',
    "  const file = path.resolve(process.cwd(), '.cursor/config/execution-plan.json');",
    "  const raw = await fs.readFile(file, 'utf8');",
    '  return JSON.parse(raw);',
    '}',
    '',
    'async function main() {',
    '  const plan = await readPlan();',
    "  await log('Iniciando Orquestração...');",
    '  for (const agentId of plan.order) {',
    '    const enabled = plan.agents?.[agentId]?.enabled !== false;',
    '    if (!enabled) {',
    "      await log('Ignorando agente desabilitado: ' + agentId);",
    '      continue;',
    '    }',
    "    await log('Executando agente: ' + agentId);",
    '    try {',
    "      const { runAgent } = await import('./run-agent.js');",
    '      await runAgent(agentId);',
    '    } catch (err) {',
    "      await log('Erro ao executar ' + agentId + ': ' + (err?.message || err), { level: 'error' });",
    '    }',
    '  }',
    "  await log('Orquestração concluída.');",
    '}',
    '',
    'main().catch(async (e) => {',
    "  await log('Falha crítica: ' + (e?.message || e), { level: 'error' });",
    '  process.exitCode = 1;',
    '});',
    ''
  ].join('\n');
  await ensureFile(path.join(scriptsDir, 'orchestrator.js'), orchestratorJs);

  const runAgentJs = [
    '// Run a specific agent by id',
    "import { promises as fs } from 'fs';",
    "import path from 'node:path';",
    "import { log } from './utils/logger.js';",
    "import { updateStatus } from './utils/status-updater.js';",
    '',
    'export async function runAgent(agentId) {',
    "  const agentDir = path.resolve(process.cwd(), '.cursor/agents', agentId);",
    '  const exists = await fs.stat(agentDir).then(() => true).catch(() => false);',
    '  if (!exists) {',
    "    await log('Agente não encontrado: ' + agentId, { level: 'error' });",
    '    return;',
    '  }',
    "  await updateStatus(agentId, { status: 'running' });",
    "  await log('[' + agentId + '] Início');",
    '  await new Promise((r) => setTimeout(r, 50));',
    "  await updateStatus(agentId, { status: 'done', progress: 100 });",
    "  await log('[' + agentId + '] Concluído');",
    '}',
    '',
    "if (import.meta.url === 'file://' + path.resolve(process.cwd(), '.cursor/scripts/run-agent.js')) {",
    '  const agentId = process.argv[2];',
    '  if (!agentId) {',
    "    console.error('Uso: node .cursor/scripts/run-agent.js <agent-id>');",
    '    process.exit(1);',
    '  }',
    '  runAgent(agentId).catch(async (e) => {',
    "    await log('Falha ao executar agente: ' + (e?.message || e), { level: 'error' });",
    '    process.exitCode = 1;',
    '  });',
    '}',
    ''
  ].join('\n');
  await ensureFile(path.join(scriptsDir, 'run-agent.js'), runAgentJs);

  const generateReportJs = [
    '// Generate consolidated report from agent reports',
    "import { promises as fs } from 'fs';",
    "import path from 'node:path';",
    "import { log } from './utils/logger.js';",
    '',
    'async function main() {',
    "  const agentsDir = path.resolve(process.cwd(), '.cursor/agents');",
    "  const outDir = path.resolve(process.cwd(), '.cursor/reports');",
    '  await fs.mkdir(outDir, { recursive: true });',
    '  const files = await fs.readdir(agentsDir, { withFileTypes: true });',
    '  const agentDirs = files.filter((d) => d.isDirectory());',
    "  let final = '# Relatório Final\\n\\n';",
    '  for (const dirent of agentDirs) {',
    "    const reportFile = path.join(agentsDir, dirent.name, 'REPORT.md');",
    '    try {',
    "      const content = await fs.readFile(reportFile, 'utf8');",
    "      final += '\\n## ' + dirent.name + '\\n\\n' + content + '\\n';",
    '    } catch { /* ignore missing */ }',
    '  }',
    "  await fs.writeFile(path.join(outDir, 'FINAL-REPORT.md'), final);",
    "  await log('Relatório final gerado.');",
    '}',
    '',
    'main().catch(async (e) => {',
    "  await log('Falha ao gerar relatório: ' + (e?.message || e), { level: 'error' });",
    '  process.exitCode = 1;',
    '});',
    ''
  ].join('\n');
  await ensureFile(path.join(scriptsDir, 'generate-report.js'), generateReportJs);
}

async function seedRoots(base) {
  // Rules
  await ensureFile(
    path.join(base, '.cursorrules'),
    `# .cursorrules\n\nAgente Webdesign Expert: execute as tarefas do .cursorrules, criando os componentes conforme descrito e conectando tudo.\n\nGaranta que \`pnpm dev\` sobe sem erros e que o formulário faz POST para /api/contact.\n`
  );

  // Generated dirs
  await ensureDir(path.join(base, 'locks'));
  await ensureDir(path.join(base, 'messages'));
  await ensureDir(path.join(base, 'logs'));
  await ensureDir(path.join(base, 'reports'));

  // Seed report placeholders
  await ensureFile(path.join(base, 'reports/FINAL-REPORT.md'), '# Relatório Final\n\nTBD\n');
  await ensureFile(path.join(base, 'reports/AGENT-01-REPORT.md'), '# AGENT-01 - Relatório\n\nTBD\n');
}

async function main() {
  const base = path.resolve(process.cwd(), '.cursor');
  await ensureDir(base);
  await Promise.all([
    seedRoots(base),
    seedTemplates(base),
    seedProtocols(base),
    seedConfigs(base),
  ]);
  await seedAgents(base);
  await seedScripts(base);
   
  console.log(`Scaffold concluído em ${base}`);
}

main().catch((e) => {
   
  console.error('Falha no setup:', e);
  process.exitCode = 1;
});


