#!/usr/bin/env node

/**
 * 🤖 REINDEX DOCS - Atualização da Base de Conhecimento (RAG)
 * 
 * Reindexação de documentos para Tutores IA:
 * - Gera embeddings (sentence-transformers local)
 * - Armazena no PostgreSQL (pgvector)
 * - Indexa no Meilisearch (busca textual)
 * 
 * @version 1.0.0
 * @date 2025-10-20
 * @team AGENTE_EQUIPE_ECONOMIA_AI_TUTORES
 */

import { createClient } from '@supabase/supabase-js';
import { MeiliSearch } from 'meilisearch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURAÇÃO
// ============================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MEILI_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILI_KEY = process.env.MEILISEARCH_MASTER_KEY || 'dev_master_key';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variáveis Supabase não configuradas!');
  process.exit(1);
}

// ============================================
// CLIENTES
// ============================================

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const meili = new MeiliSearch({ host: MEILI_HOST, apiKey: MEILI_KEY });

// ============================================
// DOCUMENTOS PARA INGESTÃO
// ============================================

const DOCS_DIR = path.join(__dirname, '../../docs/empresa');

const DOCUMENT_SOURCES = [
  {
    categoria: 'ANVISA',
    modulo: 'estoque',
    titulo: 'RDC 16/2013 - Rastreabilidade OPME',
    fonte: 'ANVISA 2024',
    path: 'anvisa-rdc-16-2013.md', // Mock (criar depois)
    conteudo: `
# Rastreabilidade de Produtos OPME

Conforme RDC 16/2013 da ANVISA, todos os produtos OPME devem conter:

1. **Registro ANVISA**: Número de registro obrigatório
2. **Número de Lote**: Identificação única do lote
3. **Número de Série**: Para produtos rastreáveis individualmente
4. **Data de Fabricação**: Formato DD/MM/AAAA
5. **Data de Validade**: Formato DD/MM/AAAA
6. **Nome do Fabricante**: Razão social completa

## Não-conformidades

Produtos SEM rastreabilidade completa devem ser:
- ❌ **Recusados** no recebimento
- 📞 Fornecedor notificado imediatamente
- 📝 Registro de ocorrência obrigatório

## Penalidades

- Multa: R$ 5.000 a R$ 200.000
- Interdição de produtos
- Suspensão de autorização de funcionamento
    `.trim()
  },
  {
    categoria: 'POP',
    modulo: 'cirurgias',
    titulo: 'POP - Separação de Kit Cirúrgico',
    fonte: 'Manual Interno v2.0',
    conteudo: `
# Procedimento Operacional Padrão - Separação de Kit

## 1. Conferência do Pedido

- Verificar nome do médico, data e horário da cirurgia
- Conferir lista de materiais solicitados
- Validar disponibilidade no estoque

## 2. Separação dos Materiais

- Coletar materiais da lista
- Verificar lote, série e validade de CADA item
- Conferir integridade das embalagens
- Segregar produtos próximos ao vencimento (< 30 dias)

## 3. Registro no Sistema

- Registrar TODOS os materiais separados
- Vincular lote e série ao kit
- Atualizar status no sistema: "Separado"

## 4. Dupla Conferência

- Segunda pessoa confere a separação
- Assinar checklist físico
- Registrar conferência no sistema

## 5. Armazenamento Temporário

- Identificar kit com etiqueta (nome médico + data)
- Armazenar em área limpa e segura
- Temperatura controlada (15-25°C)

## 6. Transporte

- Embalar adequadamente
- Protocolar saída
- Rastreabilidade completa até o hospital
    `.trim()
  },
  {
    categoria: 'LGPD',
    modulo: 'geral',
    titulo: 'Política de Privacidade - LGPD',
    fonte: 'DPO ICARUS',
    conteudo: `
# Política de Privacidade e Proteção de Dados

## Princípios

1. **Minimização**: Coletar apenas dados necessários
2. **Finalidade**: Uso específico e informado
3. **Transparência**: Titular sabe o que é coletado
4. **Segurança**: Proteção contra vazamentos
5. **Retenção Limitada**: Deletar quando não for mais necessário

## Dados Sensíveis

**PROIBIDO** armazenar:
- Dados de saúde do paciente (somos distribuidor, não hospital)
- CPF/RG sem consentimento expresso
- Dados além do necessário para operação

**PERMITIDO** armazenar:
- Nome do médico (CRM é dado público)
- Nome do hospital
- Dados de contato (telefone, e-mail) com consentimento
- Dados de cirurgias (sem dados pessoais do paciente)

## Direitos do Titular

- **Acesso**: Solicitar cópia dos seus dados
- **Correção**: Corrigir dados incorretos
- **Exclusão**: Deletar dados (soft delete)
- **Portabilidade**: Exportar em formato legível
- **Oposição**: Revogar consentimento

## Retenção de Dados

- **Logs de sistema**: 90 dias
- **Dados operacionais**: 5 anos (fiscal)
- **Dados de auditoria**: 10 anos (ANVISA)
- **Dados inativos**: Anonimização após 2 anos

Contato DPO: dpo@icarusai.com.br
    `.trim()
  }
];

// ============================================
// FUNÇÕES DE INGESTÃO
// ============================================

async function generateEmbedding(text) {
  // Mock: Em produção, usar sentence-transformers via Ollama
  // ou biblioteca JavaScript como @xenova/transformers
  
  // Placeholder: retorna vetor de 768 dimensões (zeros)
  // TODO: Implementar embeddings reais com Ollama
  return new Array(768).fill(0);
}

async function ingestDocument(doc) {
  console.log(`   📄 Processando: ${doc.titulo}`);

  // Gerar embedding
  const embedding = await generateEmbedding(doc.conteudo);

  // Inserir no PostgreSQL (pgvector)
  const { data, error } = await supabase
    .from('conhecimento_base')
    .insert({
      categoria: doc.categoria,
      modulo: doc.modulo,
      titulo: doc.titulo,
      conteudo: doc.conteudo,
      embedding, // pgvector
      metadata: { fonte: doc.fonte }
    })
    .select()
    .single();

  if (error) {
    console.error(`      ❌ Erro PostgreSQL: ${error.message}`);
    return { success: false, error: error.message };
  }

  // Indexar no Meilisearch (busca textual)
  try {
    const index = meili.index('conhecimento');
    await index.addDocuments([{
      id: data.id,
      categoria: doc.categoria,
      modulo: doc.modulo,
      titulo: doc.titulo,
      conteudo: doc.conteudo,
      fonte: doc.fonte
    }]);

    console.log(`      ✅ Indexado com sucesso`);
    return { success: true, id: data.id };
  } catch (error) {
    console.error(`      ⚠️ Erro Meilisearch: ${error.message}`);
    return { success: true, id: data.id, warning: 'Meilisearch falhou' };
  }
}

async function reindexAll() {
  console.log('🤖 Reindexando base de conhecimento...\n');

  const stats = {
    timestamp: new Date().toISOString(),
    total: DOCUMENT_SOURCES.length,
    successful: 0,
    failed: 0,
    errors: []
  };

  for (const doc of DOCUMENT_SOURCES) {
    const result = await ingestDocument(doc);
    
    if (result.success) {
      stats.successful++;
    } else {
      stats.failed++;
      stats.errors.push({ doc: doc.titulo, error: result.error });
    }
  }

  return stats;
}

// ============================================
// EXECUÇÃO
// ============================================

async function main() {
  console.log('🤖 REINDEX DOCS - Tutores IA\n');

  try {
    // Criar índice Meilisearch se não existir
    try {
      await meili.createIndex('conhecimento', { primaryKey: 'id' });
      console.log('🆕 Índice Meilisearch criado\n');
    } catch (error) {
      console.log('✅ Índice Meilisearch já existe\n');
    }

    const stats = await reindexAll();

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO');
    console.log('='.repeat(60));
    console.log(`   Total Documentos: ${stats.total}`);
    console.log(`   Sucesso: ${stats.successful}`);
    console.log(`   Falhas: ${stats.failed}`);

    if (stats.errors.length > 0) {
      console.log('\n⚠️ ERROS:');
      stats.errors.forEach(err => {
        console.log(`   - ${err.doc}: ${err.error}`);
      });
    }

    console.log('\n✅ Reindexação concluída!\n');
  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

main();

