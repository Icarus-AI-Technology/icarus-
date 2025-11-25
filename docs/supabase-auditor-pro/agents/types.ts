/**
 * Tipos compartilhados para os agentes de auditoria
 */

export type Severity = 'CRÍTICO' | 'ALTO' | 'MÉDIO' | 'BAIXO' | 'INFO';

export type AuditCategory = 
  | 'Schema & Tabelas'
  | 'Índices'
  | 'RLS & Segurança'
  | 'Storage & Buckets'
  | 'Performance & Saúde'
  | 'Funções & Triggers';

export interface AuditIssue {
  id: string;
  category: AuditCategory;
  severity: Severity;
  title: string;
  description: string;
  impact: string;
  table?: string;
  schema?: string;
  solution: string;
  sql?: string;
  metadata?: Record<string, any>;
}

export interface AuditReport {
  projectId: string;
  projectName: string;
  timestamp: Date;
  summary: {
    totalIssues: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  categories: {
    [key in AuditCategory]: AuditIssue[];
  };
  executedFixes?: AuditFix[];
}

export interface AuditFix {
  issueId: string;
  sql: string;
  executed: boolean;
  success: boolean;
  error?: string;
  timestamp: Date;
}

export interface AuditConfig {
  projectId?: string;
  mode: 'safe' | 'fix';
  severityFilters: Severity[];
  excludeTables: string[];
  excludeSchemas: string[];
  autoBackup: boolean;
  reportFormat: 'markdown' | 'json' | 'both';
  outputDir: string;
}

export interface EdgeFunctionIssue {
  functionName: string;
  severity: Severity;
  category: 'Segurança' | 'Performance' | 'Conformidade' | 'Logs & Erros' | 'Dependências';
  issue: string;
  description: string;
  line?: number;
  recommendation: string;
  code?: string;
}

export interface EdgeFunctionReport {
  projectId: string;
  timestamp: Date;
  functions: {
    name: string;
    issues: EdgeFunctionIssue[];
    stats: {
      errorRate?: number;
      avgColdStart?: number;
      totalCalls?: number;
    };
  }[];
  summary: {
    totalFunctions: number;
    totalIssues: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
  projectId: string;
}

