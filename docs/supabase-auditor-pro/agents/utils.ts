/**
 * Utilitários compartilhados para os agentes de auditoria
 */

import { AuditIssue, Severity, AuditReport, EdgeFunctionReport } from './types.js';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata relatório de auditoria em Markdown
 */
export function formatReportMarkdown(report: AuditReport): string {
  const { projectName, projectId, timestamp, summary, categories } = report;
  
  let md = `# 🔍 Auditoria Supabase - ${projectName}\n\n`;
  md += `**Data:** ${format(timestamp, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}\n`;
  md += `**Projeto ID:** \`${projectId}\`\n\n`;
  
  md += `## 📊 Resumo Executivo\n\n`;
  md += `- **Total de problemas:** ${summary.totalIssues}\n`;
  md += `- 🔴 **Críticos:** ${summary.critical}\n`;
  md += `- 🟠 **Altos:** ${summary.high}\n`;
  md += `- 🟡 **Médios:** ${summary.medium}\n`;
  md += `- 🔵 **Baixos:** ${summary.low}\n`;
  md += `- ⚪ **Informativos:** ${summary.info}\n\n`;
  
  // Gráfico ASCII simples
  const total = summary.totalIssues || 1;
  md += `### Distribuição de Severidade\n\n`;
  md += `\`\`\`\n`;
  md += `🔴 Crítico  ${'█'.repeat(Math.ceil((summary.critical / total) * 50))} ${summary.critical}\n`;
  md += `🟠 Alto     ${'█'.repeat(Math.ceil((summary.high / total) * 50))} ${summary.high}\n`;
  md += `🟡 Médio    ${'█'.repeat(Math.ceil((summary.medium / total) * 50))} ${summary.medium}\n`;
  md += `🔵 Baixo    ${'█'.repeat(Math.ceil((summary.low / total) * 50))} ${summary.low}\n`;
  md += `\`\`\`\n\n`;
  
  // Problemas por categoria
  const severityOrder: Severity[] = ['CRÍTICO', 'ALTO', 'MÉDIO', 'BAIXO', 'INFO'];
  
  for (const [categoryName, issues] of Object.entries(categories)) {
    if (issues.length === 0) continue;
    
    md += `---\n\n`;
    md += `## ${getCategoryEmoji(categoryName)} ${categoryName}\n\n`;
    md += `**Total de problemas:** ${issues.length}\n\n`;
    
    // Agrupar por severidade
    for (const severity of severityOrder) {
      const filteredIssues = issues.filter(i => i.severity === severity);
      if (filteredIssues.length === 0) continue;
      
      md += `### ${getSeverityEmoji(severity)} ${severity} (${filteredIssues.length})\n\n`;
      
      filteredIssues.forEach((issue, idx) => {
        md += `#### ${idx + 1}. ${issue.title}\n\n`;
        md += `**Descrição:** ${issue.description}\n\n`;
        if (issue.impact) {
          md += `**Impacto:** ${issue.impact}\n\n`;
        }
        if (issue.table) {
          md += `**Tabela:** \`${issue.schema ? issue.schema + '.' : ''}${issue.table}\`\n\n`;
        }
        md += `**Solução:**\n\n${issue.solution}\n\n`;
        if (issue.sql) {
          md += `**SQL:**\n\n\`\`\`sql\n${issue.sql}\n\`\`\`\n\n`;
        }
        if (issue.metadata && Object.keys(issue.metadata).length > 0) {
          md += `**Detalhes:**\n\`\`\`json\n${JSON.stringify(issue.metadata, null, 2)}\n\`\`\`\n\n`;
        }
      });
    }
  }
  
  md += `---\n\n`;
  md += `## 📝 Notas Finais\n\n`;
  md += `- Este relatório foi gerado automaticamente pelo **Supabase Auditor Pro**\n`;
  md += `- Revise cuidadosamente cada problema antes de executar correções\n`;
  md += `- Faça backup antes de executar alterações no modo \`fix\`\n`;
  md += `- Para dúvidas, consulte a documentação ou a comunidade Supabase\n\n`;
  
  md += `*Gerado em ${format(timestamp, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}*\n`;
  
  return md;
}

/**
 * Formata relatório de Edge Functions em Markdown
 */
export function formatEdgeFunctionsReportMarkdown(report: EdgeFunctionReport): string {
  const { projectId, timestamp, functions, summary } = report;
  
  let md = `# 🔍 Auditoria Edge Functions - Supabase\n\n`;
  md += `**Data:** ${format(timestamp, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}\n`;
  md += `**Projeto ID:** \`${projectId}\`\n\n`;
  
  md += `## 📊 Resumo Executivo\n\n`;
  md += `- **Total de funções:** ${summary.totalFunctions}\n`;
  md += `- **Total de problemas:** ${summary.totalIssues}\n`;
  md += `- 🔴 **Críticos:** ${summary.critical}\n`;
  md += `- 🟠 **Altos:** ${summary.high}\n`;
  md += `- 🟡 **Médios:** ${summary.medium}\n`;
  md += `- 🔵 **Baixos:** ${summary.low}\n\n`;
  
  // Por função
  for (const func of functions) {
    md += `---\n\n`;
    md += `## ⚡ ${func.name}\n\n`;
    
    if (func.stats.totalCalls !== undefined) {
      md += `**Estatísticas:**\n`;
      md += `- Chamadas totais: ${func.stats.totalCalls}\n`;
      if (func.stats.errorRate !== undefined) {
        md += `- Taxa de erro: ${func.stats.errorRate.toFixed(2)}%\n`;
      }
      if (func.stats.avgColdStart !== undefined) {
        md += `- Cold start médio: ${func.stats.avgColdStart}ms\n`;
      }
      md += `\n`;
    }
    
    if (func.issues.length === 0) {
      md += `✅ **Nenhum problema detectado**\n\n`;
      continue;
    }
    
    md += `**Problemas encontrados:** ${func.issues.length}\n\n`;
    
    // Agrupar por categoria
    const byCategory = func.issues.reduce((acc, issue) => {
      if (!acc[issue.category]) acc[issue.category] = [];
      acc[issue.category].push(issue);
      return acc;
    }, {} as Record<string, typeof func.issues>);
    
    for (const [category, issues] of Object.entries(byCategory)) {
      md += `### ${category}\n\n`;
      
      issues.forEach((issue, idx) => {
        md += `#### ${getSeverityEmoji(issue.severity)} ${issue.severity} - ${issue.issue}\n\n`;
        md += `**Descrição:** ${issue.description}\n\n`;
        if (issue.line !== undefined) {
          md += `**Linha:** ${issue.line}\n\n`;
        }
        md += `**Recomendação:** ${issue.recommendation}\n\n`;
        if (issue.code) {
          md += `**Código:**\n\`\`\`typescript\n${issue.code}\n\`\`\`\n\n`;
        }
      });
    }
  }
  
  md += `---\n\n`;
  md += `*Gerado em ${format(timestamp, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}*\n`;
  
  return md;
}

/**
 * Retorna emoji para severidade
 */
export function getSeverityEmoji(severity: Severity): string {
  const map: Record<Severity, string> = {
    'CRÍTICO': '🔴',
    'ALTO': '🟠',
    'MÉDIO': '🟡',
    'BAIXO': '🔵',
    'INFO': '⚪'
  };
  return map[severity] || '⚪';
}

/**
 * Retorna emoji para categoria
 */
export function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    'Schema & Tabelas': '📋',
    'Índices': '🔍',
    'RLS & Segurança': '🔒',
    'Storage & Buckets': '💾',
    'Performance & Saúde': '⚡',
    'Funções & Triggers': '⚙️'
  };
  return map[category] || '📌';
}

/**
 * Gera ID único para issue
 */
export function generateIssueId(category: string, title: string): string {
  const normalized = `${category}-${title}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${normalized}-${Date.now().toString(36)}`;
}

/**
 * Calcula score de prioridade (0-100, maior = mais crítico)
 */
export function calculatePriorityScore(issue: AuditIssue): number {
  const severityScores: Record<Severity, number> = {
    'CRÍTICO': 100,
    'ALTO': 70,
    'MÉDIO': 40,
    'BAIXO': 20,
    'INFO': 5
  };
  
  let score = severityScores[issue.severity] || 0;
  
  // Ajustes baseados em metadata
  if (issue.metadata?.tableSize && parseInt(issue.metadata.tableSize) > 1000000) {
    score += 10; // Tabelas grandes são mais críticas
  }
  
  if (issue.category === 'RLS & Segurança') {
    score += 5; // Segurança tem prioridade extra
  }
  
  return Math.min(100, score);
}

/**
 * Formata bytes para formato legível
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let value = bytes;
  
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  
  return `${value.toFixed(2)} ${units[i]}`;
}

/**
 * Valida SQL para prevenir SQL injection
 */
export function validateSql(sql: string): boolean {
  // Verifica padrões perigosos
  const dangerousPatterns = [
    /;\s*DROP/i,
    /;\s*DELETE\s+FROM/i,
    /;\s*TRUNCATE/i,
    /--/,
    /\/\*/
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(sql));
}

/**
 * Cria backup de uma tabela
 */
export async function createTableBackup(
  supabase: any,
  schema: string,
  table: string
): Promise<string> {
  const backupName = `${schema}_${table}_backup_${Date.now()}`;
  const sql = `CREATE TABLE ${backupName} AS SELECT * FROM ${schema}.${table};`;
  
  const { error } = await supabase.rpc('execute_sql', { query: sql });
  
  if (error) throw error;
  
  return backupName;
}

