#!/usr/bin/env node
/**
 * Supabase Auditor Pro - Agente de Auditoria de Banco de Dados
 * 
 * Executa auditoria completa de um projeto Supabase incluindo:
 * - Schema & Tabelas
 * - Índices
 * - RLS & Segurança
 * - Storage & Buckets
 * - Performance & Saúde
 * - Funções & Triggers
 */

import { createClient } from '@supabase/supabase-js';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { 
  AuditConfig, 
  AuditReport, 
  AuditIssue, 
  Severity,
  AuditCategory
} from './types.js';
import { 
  formatReportMarkdown, 
  generateIssueId,
  createTableBackup 
} from './utils.js';

class SupabaseDatabaseAuditor {
  private supabase: any;
  private config: AuditConfig;
  private report: AuditReport;
  private spinner: any;

  constructor(config: AuditConfig) {
    this.config = config;
    this.report = {
      projectId: config.projectId || 'unknown',
      projectName: 'Projeto Supabase',
      timestamp: new Date(),
      summary: {
        totalIssues: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0
      },
      categories: {
        'Schema & Tabelas': [],
        'Índices': [],
        'RLS & Segurança': [],
        'Storage & Buckets': [],
        'Performance & Saúde': [],
        'Funções & Triggers': []
      }
    };
  }

  /**
   * Inicializa conexão com Supabase via MCP
   */
  async initialize() {
    this.spinner = ora('Conectando ao Supabase...').start();
    
    try {
      // No contexto do Cursor com MCP, as credenciais são obtidas automaticamente
      // Este é um exemplo de como seria a integração
      const supabaseUrl = process.env.SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Credenciais do Supabase não encontradas. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
      }
      
      this.supabase = createClient(supabaseUrl, supabaseKey);
      
      // Testar conexão
      const { data, error } = await this.supabase.rpc('auditor.verificar_tamanho_banco');
      
      if (error) {
        throw new Error(`Erro ao conectar: ${error.message}`);
      }
      
      if (data && data.length > 0) {
        this.report.projectName = data[0].database_name;
      }
      
      this.spinner.succeed('Conectado ao Supabase com sucesso!');
    } catch (error: any) {
      this.spinner.fail('Falha ao conectar ao Supabase');
      throw error;
    }
  }

  /**
   * Executa auditoria completa
   */
  async runFullAudit() {
    console.log(chalk.bold.blue('\n🔍 Iniciando Auditoria Completa do Supabase\n'));
    
    await this.auditSchema();
    await this.auditIndexes();
    await this.auditRLS();
    await this.auditStorage();
    await this.auditPerformance();
    await this.auditFunctions();
    
    this.calculateSummary();
    await this.generateReport();
    
    if (this.config.mode === 'fix') {
      await this.executeFixes();
    }
  }

  /**
   * Auditoria de Schema & Tabelas
   */
  async auditSchema() {
    this.spinner = ora('Auditando Schema & Tabelas...').start();
    
    try {
      // Tabelas órfãs
      const { data: orphanTables } = await this.supabase.rpc('auditor.detectar_tabelas_orfas', { days_threshold: 90 });
      
      if (orphanTables && orphanTables.length > 0) {
        orphanTables.forEach((table: any) => {
          this.addIssue('Schema & Tabelas', {
            severity: table.days_inactive > 180 ? 'ALTO' : 'MÉDIO',
            title: `Tabela órfã: ${table.table_name}`,
            description: `A tabela ${table.schema_name}.${table.table_name} não teve acesso há ${table.days_inactive} dias`,
            impact: `Ocupando ${table.table_size} de espaço sem utilidade`,
            table: table.table_name,
            schema: table.schema_name,
            solution: 'Verifique se a tabela ainda é necessária. Se não, considere arquivar ou remover.',
            sql: `-- Arquivar antes de remover:\n-- CREATE TABLE archived.${table.table_name} AS SELECT * FROM ${table.schema_name}.${table.table_name};\n-- DROP TABLE ${table.schema_name}.${table.table_name};`,
            metadata: {
              days_inactive: table.days_inactive,
              total_rows: table.total_rows,
              table_size: table.table_size
            }
          });
        });
      }
      
      // Tabelas sem PK
      const { data: noPkTables } = await this.supabase.rpc('auditor.detectar_tabelas_sem_pk');
      
      if (noPkTables && noPkTables.length > 0) {
        noPkTables.forEach((table: any) => {
          this.addIssue('Schema & Tabelas', {
            severity: table.total_rows > 10000 ? 'CRÍTICO' : 'ALTO',
            title: `Tabela sem PRIMARY KEY: ${table.table_name}`,
            description: `A tabela ${table.schema_name}.${table.table_name} não possui chave primária`,
            impact: 'Performance degradada, impossível usar replicação, problemas com RLS',
            table: table.table_name,
            schema: table.schema_name,
            solution: 'Adicione uma PRIMARY KEY apropriada',
            sql: `-- Opção 1: Adicionar coluna ID\nALTER TABLE ${table.schema_name}.${table.table_name} ADD COLUMN id BIGSERIAL PRIMARY KEY;\n\n-- Opção 2: Usar coluna existente\n-- ALTER TABLE ${table.schema_name}.${table.table_name} ADD PRIMARY KEY (coluna_existente);`,
            metadata: {
              total_rows: table.total_rows,
              table_size: table.table_size
            }
          });
        });
      }
      
      // Bloat em tabelas
      const { data: bloatedTables } = await this.supabase.rpc('auditor.detectar_fragmentacao_tabelas');
      
      if (bloatedTables && bloatedTables.length > 0) {
        bloatedTables.forEach((table: any) => {
          this.addIssue('Schema & Tabelas', {
            severity: table.bloat_ratio > 5 ? 'ALTO' : 'MÉDIO',
            title: `Bloat detectado: ${table.table_name}`,
            description: `A tabela ${table.schema_name}.${table.table_name} tem ${table.bloat_ratio}x de bloat (${table.bloat_size} desperdiçados)`,
            impact: `Desperdício de ${table.bloat_size} de armazenamento e performance degradada`,
            table: table.table_name,
            schema: table.schema_name,
            solution: table.suggestion,
            sql: table.bloat_ratio > 5 
              ? `VACUUM FULL ${table.schema_name}.${table.table_name}; -- ATENÇÃO: Bloqueia a tabela`
              : `VACUUM ANALYZE ${table.schema_name}.${table.table_name};`,
            metadata: {
              bloat_ratio: table.bloat_ratio,
              bloat_size: table.bloat_size,
              total_size: table.total_size
            }
          });
        });
      }
      
      // JSONB mal usado
      const { data: jsonbMisuse } = await this.supabase.rpc('auditor.detectar_mau_uso_jsonb');
      
      if (jsonbMisuse && jsonbMisuse.length > 0) {
        jsonbMisuse.forEach((col: any) => {
          this.addIssue('Schema & Tabelas', {
            severity: 'BAIXO',
            title: `Possível uso inadequado de JSONB: ${col.table_name}.${col.column_name}`,
            description: `A coluna ${col.column_name} usa JSONB em uma tabela com ${col.total_rows} registros`,
            impact: 'Performance de queries pode ser melhorada com normalização',
            table: col.table_name,
            schema: col.schema_name,
            solution: col.suggestion,
            metadata: {
              column_name: col.column_name,
              total_rows: col.total_rows
            }
          });
        });
      }
      
      this.spinner.succeed('Auditoria de Schema concluída');
    } catch (error: any) {
      this.spinner.fail('Erro na auditoria de Schema');
      console.error(chalk.red(error.message));
    }
  }

  /**
   * Auditoria de Índices
   */
  async auditIndexes() {
    this.spinner = ora('Auditando Índices...').start();
    
    try {
      // Índices não usados
      const { data: unusedIndexes } = await this.supabase.rpc('auditor.detectar_indices_inutilizados');
      
      if (unusedIndexes && unusedIndexes.length > 0) {
        unusedIndexes.forEach((idx: any) => {
          this.addIssue('Índices', {
            severity: 'MÉDIO',
            title: `Índice não usado: ${idx.index_name}`,
            description: `O índice ${idx.index_name} na tabela ${idx.table_name} nunca foi utilizado`,
            impact: `Desperdiçando ${idx.index_size} e tornando escritas mais lentas`,
            table: idx.table_name,
            schema: idx.schema_name,
            solution: 'Remova o índice se confirmar que não é necessário',
            sql: idx.suggestion,
            metadata: {
              index_size: idx.index_size,
              index_scans: idx.index_scans
            }
          });
        });
      }
      
      // Índices duplicados
      const { data: duplicateIndexes } = await this.supabase.rpc('auditor.detectar_indices_duplicados');
      
      if (duplicateIndexes && duplicateIndexes.length > 0) {
        duplicateIndexes.forEach((idx: any) => {
          this.addIssue('Índices', {
            severity: 'MÉDIO',
            title: `Índices duplicados: ${idx.index1_name} e ${idx.index2_name}`,
            description: `Os índices ${idx.index1_name} e ${idx.index2_name} na tabela ${idx.table_name} são redundantes`,
            impact: 'Desperdício de espaço e performance de escrita degradada',
            table: idx.table_name,
            schema: idx.schema_name,
            solution: idx.suggestion,
            metadata: {
              index1: idx.index1_name,
              index2: idx.index2_name
            }
          });
        });
      }
      
      // Índices inválidos
      const { data: invalidIndexes } = await this.supabase.rpc('auditor.detectar_indices_invalidos');
      
      if (invalidIndexes && invalidIndexes.length > 0) {
        invalidIndexes.forEach((idx: any) => {
          this.addIssue('Índices', {
            severity: 'CRÍTICO',
            title: `Índice inválido: ${idx.index_name}`,
            description: `O índice ${idx.index_name} está marcado como INVALID`,
            impact: 'Índice não está sendo utilizado, queries podem estar lentas',
            table: idx.table_name,
            schema: idx.schema_name,
            solution: 'Reconstrua o índice',
            sql: idx.suggestion,
            metadata: {
              reason: idx.reason
            }
          });
        });
      }
      
      this.spinner.succeed('Auditoria de Índices concluída');
    } catch (error: any) {
      this.spinner.fail('Erro na auditoria de Índices');
      console.error(chalk.red(error.message));
    }
  }

  /**
   * Auditoria de RLS & Segurança
   */
  async auditRLS() {
    this.spinner = ora('Auditando RLS & Segurança...').start();
    
    try {
      // Tabelas sem RLS
      const { data: noRlsTables } = await this.supabase.rpc('auditor.detectar_tabelas_sem_rls');
      
      if (noRlsTables && noRlsTables.length > 0) {
        noRlsTables.forEach((table: any) => {
          this.addIssue('RLS & Segurança', {
            severity: table.severity as Severity,
            title: `Tabela sem RLS: ${table.table_name}`,
            description: `A tabela ${table.schema_name}.${table.table_name} não possui Row Level Security habilitado`,
            impact: 'Dados potencialmente expostos publicamente',
            table: table.table_name,
            schema: table.schema_name,
            solution: 'Habilite RLS e crie policies apropriadas',
            sql: table.suggestion,
            metadata: {
              total_rows: table.total_rows,
              has_user_id: table.has_user_id
            }
          });
        });
      }
      
      // Policies permissivas
      const { data: permissivePolicies } = await this.supabase.rpc('auditor.detectar_politicas_permissivas');
      
      if (permissivePolicies && permissivePolicies.length > 0) {
        permissivePolicies.forEach((policy: any) => {
          this.addIssue('RLS & Segurança', {
            severity: 'CRÍTICO',
            title: `Policy permissiva: ${policy.policy_name}`,
            description: `A policy ${policy.policy_name} na tabela ${policy.table_name} é muito permissiva`,
            impact: policy.risk,
            table: policy.table_name,
            schema: policy.schema_name,
            solution: 'Restrinja a policy para verificar permissões apropriadas',
            metadata: {
              policy_type: policy.policy_type,
              policy_definition: policy.policy_definition
            }
          });
        });
      }
      
      // Verificar auth.users
      const { data: authUsersCheck } = await this.supabase.rpc('auditor.verificar_auth_users_rls');
      
      if (authUsersCheck && authUsersCheck.length > 0) {
        const check = authUsersCheck[0];
        if (check.severity !== 'BAIXO') {
          this.addIssue('RLS & Segurança', {
            severity: check.severity as Severity,
            title: 'Configuração de auth.users',
            description: check.message,
            impact: 'Dados de usuários podem estar expostos',
            solution: 'Configure RLS e policies na tabela auth.users',
            sql: `ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "Users can view own data" ON auth.users FOR SELECT USING (auth.uid() = id);`
          });
        }
      }
      
      // Grants excessivos
      const { data: excessiveGrants } = await this.supabase.rpc('auditor.auditar_concessoes_excessivas');
      
      if (excessiveGrants && excessiveGrants.length > 0) {
        excessiveGrants.forEach((grant: any) => {
          this.addIssue('RLS & Segurança', {
            severity: grant.severity as Severity,
            title: `Grant excessivo para ${grant.grantee}`,
            description: `${grant.grantee} tem privilégio ${grant.privilege_type} na tabela ${grant.table_name}`,
            impact: grant.risk,
            table: grant.table_name,
            schema: grant.table_schema,
            solution: `Revogue privilégios desnecessários`,
            sql: `REVOKE ${grant.privilege_type} ON ${grant.table_schema}.${grant.table_name} FROM ${grant.grantee};`,
            metadata: {
              grantee: grant.grantee,
              privilege_type: grant.privilege_type,
              is_grantable: grant.is_grantable
            }
          });
        });
      }
      
      this.spinner.succeed('Auditoria de RLS & Segurança concluída');
    } catch (error: any) {
      this.spinner.fail('Erro na auditoria de RLS');
      console.error(chalk.red(error.message));
    }
  }

  /**
   * Auditoria de Storage & Buckets
   */
  async auditStorage() {
    this.spinner = ora('Auditando Storage & Buckets...').start();
    
    try {
      // Lista buckets
      const { data: buckets } = await this.supabase.rpc('auditor.listar_buckets_armazenamento');
      
      if (buckets) {
        buckets.forEach((bucket: any) => {
          if (bucket.is_public && bucket.total_objects > 0) {
            this.addIssue('Storage & Buckets', {
              severity: 'MÉDIO',
              title: `Bucket público: ${bucket.bucket_name}`,
              description: `O bucket ${bucket.bucket_name} é público e contém ${bucket.total_objects} arquivos`,
              impact: `${bucket.total_size} de dados potencialmente expostos`,
              solution: 'Revise se o bucket realmente precisa ser público',
              metadata: {
                bucket_name: bucket.bucket_name,
                total_objects: bucket.total_objects,
                total_size: bucket.total_size
              }
            });
          }
        });
      }
      
      // Arquivos duplicados
      const { data: duplicates } = await this.supabase.rpc('auditor.detectar_arquivos_duplicados');
      
      if (duplicates && duplicates.length > 0) {
        duplicates.forEach((dup: any) => {
          this.addIssue('Storage & Buckets', {
            severity: 'BAIXO',
            title: `Arquivos duplicados no bucket ${dup.bucket_name}`,
            description: `${dup.duplicate_count} arquivos duplicados encontrados`,
            impact: `Desperdiçando ${dup.total_wasted_size_pretty}`,
            solution: dup.suggestion,
            metadata: {
              duplicate_count: dup.duplicate_count,
              wasted_size: dup.total_wasted_size_pretty
            }
          });
        });
      }
      
      this.spinner.succeed('Auditoria de Storage concluída');
    } catch (error: any) {
      this.spinner.warn('Auditoria de Storage não disponível (pode não haver buckets configurados)');
    }
  }

  /**
   * Auditoria de Performance & Saúde
   */
  async auditPerformance() {
    this.spinner = ora('Auditando Performance & Saúde...').start();
    
    try {
      // Queries lentas
      const { data: slowQueries } = await this.supabase.rpc('auditor.obter_consultas_lentas', { limit_count: 10 });
      
      if (slowQueries && slowQueries.length > 0) {
        slowQueries.forEach((query: any) => {
          if (query.severity === 'CRÍTICO' || query.severity === 'ALTO') {
            this.addIssue('Performance & Saúde', {
              severity: query.severity as Severity,
              title: `Query lenta detectada`,
              description: `Query com tempo médio de ${query.mean_time_ms}ms`,
              impact: `${query.calls} chamadas totalizando ${query.total_time_ms}ms`,
              solution: query.suggestion,
              metadata: {
                query: query.query_text,
                mean_time: query.mean_time_ms,
                calls: query.calls
              }
            });
          }
        });
      }
      
      // Dead tuples
      const { data: deadTuples } = await this.supabase.rpc('auditor.detectar_tuplas_mortas');
      
      if (deadTuples && deadTuples.length > 0) {
        deadTuples.forEach((table: any) => {
          if (table.severity === 'CRÍTICO' || table.severity === 'ALTO') {
            this.addIssue('Performance & Saúde', {
              severity: table.severity as Severity,
              title: `Dead tuples em ${table.table_name}`,
              description: `${table.dead_tuples} dead tuples (${table.dead_ratio}% da tabela)`,
              impact: 'Performance degradada, necessário VACUUM',
              table: table.table_name,
              schema: table.schema_name,
              solution: table.suggestion,
              sql: table.suggestion,
              metadata: {
                dead_tuples: table.dead_tuples,
                dead_ratio: table.dead_ratio,
                last_vacuum: table.last_vacuum
              }
            });
          }
        });
      }
      
      this.spinner.succeed('Auditoria de Performance concluída');
    } catch (error: any) {
      this.spinner.warn('Auditoria de Performance parcial (pg_stat_statements pode não estar habilitado)');
    }
  }

  /**
   * Auditoria de Funções & Triggers
   */
  async auditFunctions() {
    this.spinner = ora('Auditando Funções & Triggers...').start();
    
    try {
      // Funções não usadas
      const { data: unusedFunctions } = await this.supabase.rpc('auditor.detectar_funcoes_inutilizadas');
      
      if (unusedFunctions && unusedFunctions.length > 0) {
        unusedFunctions.forEach((func: any) => {
          if (!func.is_trigger) {
            this.addIssue('Funções & Triggers', {
              severity: 'BAIXO',
              title: `Função não usada: ${func.function_name}`,
              description: `A função ${func.schema_name}.${func.function_name} nunca foi chamada`,
              impact: 'Código morto no banco',
              solution: func.suggestion,
              metadata: {
                language: func.language,
                source_lines: func.source_lines
              }
            });
          }
        });
      }
      
      // Funções SECURITY DEFINER
      const { data: secDefFunctions } = await this.supabase.rpc('auditor.detectar_funcoes_security_definer');
      
      if (secDefFunctions && secDefFunctions.length > 0) {
        secDefFunctions.forEach((func: any) => {
          this.addIssue('Funções & Triggers', {
            severity: func.severity as Severity,
            title: `Função SECURITY DEFINER: ${func.function_name}`,
            description: func.risk,
            impact: 'Risco de escalação de privilégio',
            solution: func.suggestion,
            metadata: {
              function_owner: func.function_owner,
              language: func.language
            }
          });
        });
      }
      
      // Triggers em tabelas quentes
      const { data: hotTriggers } = await this.supabase.rpc('auditor.detectar_gatilhos_tabelas_quentes', { write_threshold: 10000 });
      
      if (hotTriggers && hotTriggers.length > 0) {
        hotTriggers.forEach((trigger: any) => {
          this.addIssue('Funções & Triggers', {
            severity: trigger.severity as Severity,
            title: `Trigger em tabela de alto volume: ${trigger.trigger_name}`,
            description: `Trigger ${trigger.trigger_name} na tabela ${trigger.table_name} com ${trigger.total_writes} escritas`,
            impact: 'Pode estar degradando performance de escrita',
            table: trigger.table_name,
            schema: trigger.schema_name,
            solution: trigger.suggestion,
            metadata: {
              total_writes: trigger.total_writes,
              trigger_function: trigger.trigger_function
            }
          });
        });
      }
      
      this.spinner.succeed('Auditoria de Funções concluída');
    } catch (error: any) {
      this.spinner.fail('Erro na auditoria de Funções');
      console.error(chalk.red(error.message));
    }
  }

  /**
   * Adiciona issue ao relatório
   */
  private addIssue(category: AuditCategory, issueData: Omit<AuditIssue, 'id' | 'category'>) {
    const issue: AuditIssue = {
      id: generateIssueId(category, issueData.title),
      category,
      ...issueData
    };
    
    this.report.categories[category].push(issue);
  }

  /**
   * Calcula sumário do relatório
   */
  private calculateSummary() {
    let totalIssues = 0;
    const severityCounts: Record<Severity, number> = {
      'CRÍTICO': 0,
      'ALTO': 0,
      'MÉDIO': 0,
      'BAIXO': 0,
      'INFO': 0
    };
    
    Object.values(this.report.categories).forEach(issues => {
      totalIssues += issues.length;
      issues.forEach(issue => {
        severityCounts[issue.severity]++;
      });
    });
    
    this.report.summary = {
      totalIssues,
      critical: severityCounts['CRÍTICO'],
      high: severityCounts['ALTO'],
      medium: severityCounts['MÉDIO'],
      low: severityCounts['BAIXO'],
      info: severityCounts['INFO']
    };
  }

  /**
   * Gera relatório final
   */
  async generateReport() {
    console.log(chalk.bold.green('\n✅ Auditoria Concluída!\n'));
    
    // Exibir sumário no console
    console.log(chalk.bold('📊 Resumo:'));
    console.log(`  Total de problemas: ${this.report.summary.totalIssues}`);
    console.log(chalk.red(`  🔴 Críticos: ${this.report.summary.critical}`));
    console.log(chalk.yellow(`  🟠 Altos: ${this.report.summary.high}`));
    console.log(chalk.blue(`  🟡 Médios: ${this.report.summary.medium}`));
    console.log(chalk.gray(`  🔵 Baixos: ${this.report.summary.low}`));
    console.log('');
    
    // Salvar relatórios
    const timestamp = this.report.timestamp.toISOString().replace(/[:.]/g, '-');
    const outputDir = this.config.outputDir;
    
    await fs.mkdir(outputDir, { recursive: true });
    
    if (this.config.reportFormat === 'markdown' || this.config.reportFormat === 'both') {
      const mdPath = path.join(outputDir, `audit-${timestamp}.md`);
      const markdown = formatReportMarkdown(this.report);
      await fs.writeFile(mdPath, markdown);
      console.log(chalk.green(`📄 Relatório Markdown salvo em: ${mdPath}`));
    }
    
    if (this.config.reportFormat === 'json' || this.config.reportFormat === 'both') {
      const jsonPath = path.join(outputDir, `audit-${timestamp}.json`);
      await fs.writeFile(jsonPath, JSON.stringify(this.report, null, 2));
      console.log(chalk.green(`📄 Relatório JSON salvo em: ${jsonPath}`));
    }
  }

  /**
   * Executa correções automáticas (modo fix)
   */
  async executeFixes() {
    console.log(chalk.bold.yellow('\n⚠️  Modo FIX ativado - Executando correções...\n'));
    
    // Filtrar apenas issues com SQL e severidade crítica/alta
    const fixableIssues: AuditIssue[] = [];
    
    Object.values(this.report.categories).forEach(issues => {
      issues.forEach(issue => {
        if (issue.sql && (issue.severity === 'CRÍTICO' || issue.severity === 'ALTO')) {
          fixableIssues.push(issue);
        }
      });
    });
    
    if (fixableIssues.length === 0) {
      console.log(chalk.green('✅ Nenhuma correção automática necessária!'));
      return;
    }
    
    console.log(`Encontradas ${fixableIssues.length} correções possíveis.\n`);
    
    // Em produção, aqui seria um prompt interativo para confirmar cada fix
    console.log(chalk.yellow('ℹ️  No modo production, cada correção seria confirmada interativamente.'));
    console.log(chalk.yellow('ℹ️  Por segurança, não executando correções nesta demo.\n'));
    
    // Exemplo de como seria a execução:
    // for (const issue of fixableIssues) {
    //   const confirm = await promptConfirm(`Executar correção: ${issue.title}?`);
    //   if (confirm) {
    //     await this.supabase.rpc('execute_sql', { query: issue.sql });
    //   }
    // }
  }
}

// CLI
const program = new Command();

program
  .name('supabase-auditor')
  .description('Auditoria completa de projetos Supabase')
  .version('1.0.0')
  .option('--mode <mode>', 'Modo de operação: safe ou fix', 'safe')
  .option('--project-id <id>', 'ID do projeto Supabase')
  .option('--severity <levels>', 'Filtrar por severidade (ex: CRÍTICO,ALTO)', 'CRÍTICO,ALTO,MÉDIO,BAIXO,INFO')
  .option('--output <dir>', 'Diretório de saída dos relatórios', './reports')
  .option('--format <format>', 'Formato do relatório: markdown, json ou both', 'both')
  .action(async (options) => {
    const config: AuditConfig = {
      projectId: options.projectId,
      mode: options.mode as 'safe' | 'fix',
      severityFilters: options.severity.split(',') as Severity[],
      excludeTables: [],
      excludeSchemas: ['pg_catalog', 'information_schema'],
      autoBackup: true,
      reportFormat: options.format as 'markdown' | 'json' | 'both',
      outputDir: options.output
    };
    
    try {
      const auditor = new SupabaseDatabaseAuditor(config);
      await auditor.initialize();
      await auditor.runFullAudit();
      
      process.exit(0);
    } catch (error: any) {
      console.error(chalk.red('\n❌ Erro fatal:'), error.message);
      process.exit(1);
    }
  });

program.parse();

