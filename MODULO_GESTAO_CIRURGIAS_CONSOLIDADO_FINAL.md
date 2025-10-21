# 🏥 MÓDULO GESTÃO DE CIRURGIAS - DOCUMENTAÇÃO CONSOLIDADA COMPLETA

**Sistema**: ICARUS v5.0  
**Categoria**: Core Business / Operacional  
**Prioridade**: CRÍTICA (P0)  
**Versão**: 5.0.0  
**Última Atualização**: Outubro 2025  
**Idioma**: Português Brasileiro (pt-BR)

---

## 📑 ÍNDICE GERAL CONSOLIDADO

### PARTE I - FUNDAMENTOS E ARQUITETURA
1. [Visão Geral](#1-visão-geral)
2. [Arquitetura do Sistema](#2-arquitetura-do-sistema)
3. [Sub-módulos](#3-sub-módulos)
4. [Dashboard de Cirurgias](#4-dashboard-de-cirurgias)
5. [Agendamento de Cirurgias](#5-agendamento-de-cirurgias)

### PARTE II - PROCESSOS OPERACIONAIS
6. [Autorização de Convênios](#6-autorização-de-convênios)
7. [Kit Cirúrgico](#7-kit-cirúrgico)
8. [Consumo Intraoperatório](#8-consumo-intraoperatório)
9. [Rastreabilidade OPME](#9-rastreabilidade-opme)
10. [Pós-Operatório](#10-pós-operatório)

### PARTE III - INTELIGÊNCIA E ANALYTICS
11. [IA para Cirurgias](#11-ia-para-cirurgias)
12. [Integrações Hospitalares](#12-integrações-hospitalares)
13. [Analytics e Indicadores](#13-analytics-e-indicadores)
14. [Faturamento de Cirurgias](#14-faturamento-de-cirurgias)

### PARTE IV - SUB-MÓDULO PORTAIS OPME
15. [Visão Geral Portais OPME](#15-visão-geral-portais-opme)
16. [Arquitetura Portais](#16-arquitetura-portais)
17. [Portais Integrados](#17-portais-integrados)
18. [Sistema de Palavras-Chave](#18-sistema-de-palavras-chave)
19. [Service de Integração](#19-service-de-integração)
20. [Interface Portais OPME](#20-interface-portais-opme)
21. [Cotações Automáticas](#21-cotações-automáticas)
22. [Comparação de Preços](#22-comparação-de-preços)
23. [Analytics Portais](#23-analytics-portais)

### PARTE V - CASOS DE USO E CONCLUSÃO
24. [Casos de Uso Completos](#24-casos-de-uso-completos)
25. [ROI e Conclusão](#25-roi-e-conclusão)

---

# PARTE I - FUNDAMENTOS E ARQUITETURA

## 1. VISÃO GERAL

### 1.1. Descrição

**Arquivo Principal**: `/components/modules/CirurgiasProcedimentos.tsx`

O módulo **Gestão de Cirurgias** é o **coração do negócio OPME**, pois é onde ocorre o consumo efetivo dos produtos médico-hospitalares. Gerencia todo o ciclo desde o agendamento até o faturamento pós-cirúrgico, garantindo rastreabilidade total, compliance ANVISA/ANS e otimização de recursos.

### 1.2. Objetivos

```yaml
Objetivos Principais:
  - Centralizar agendamento de cirurgias
  - Controlar autorização de convênios (OPME)
  - Gerenciar kit cirúrgico (produtos necessários)
  - Registrar consumo intraoperatório (rastreabilidade)
  - Automatizar faturamento pós-cirúrgico
  - Garantir compliance ANVISA/ANS
  - Otimizar agenda cirúrgica com IA
  - Reduzir glosas e não conformidades
  - Cotar produtos em múltiplos portais OPME
  - Comparar preços automaticamente

Métricas de Sucesso:
  - 100% de cirurgias com rastreabilidade
  - 0% de glosas por falta de documentação
  - Tempo médio de agendamento < 24h
  - Taxa de cancelamento < 5%
  - Tempo médio de autorização < 48h
  - 95% de cirurgias dentro do prazo
  - Redução de 30% em desperdício de materiais
  - Economia de 15% com cotações em portais
```

### 1.3. Importância para Negócio OPME

```yaml
Por que é o módulo MAIS CRÍTICO:

  Faturamento:
    - 100% do faturamento vem de cirurgias realizadas
    - Sem cirurgia = sem receita
    - Margem alta (40-60%) em OPME
    - Faturamento médio: R$ 50.000 - R$ 500.000/cirurgia

  Compliance Regulatório:
    - ANVISA exige rastreabilidade total
    - ANS exige autorização prévia
    - CFM exige registro completo
    - Auditoria de convênios é rigorosa
    - Penalidades altíssimas por não conformidade

  Operacional:
    - Coordenação complexa (médico + hospital + equipe + materiais)
    - Timing crítico (sala cirúrgica agendada)
    - Produtos de alto valor (próteses R$ 10K - R$ 200K)
    - Zero margem de erro (saúde do paciente)

  Competitivo:
    - Agilidade na autorização = diferencial
    - Disponibilidade de materiais = vantagem
    - Relacionamento médico-hospital = fidelização
    - Sistema organizado = confiança
    - Portais OPME = economia garantida

  Financeiro:
    - Glosas podem chegar a 20% do faturamento
    - Pagamento pode demorar 60-90 dias
    - Capital de giro intensivo
    - Má gestão = prejuízo garantido
    - Cotação em portais = 15% economia média
```

### 1.4. Fluxo Macro do Processo

```yaml
1. Agendamento:
   - Médico agenda cirurgia no hospital
   - Solicita produtos OPME necessários
   - Define equipe cirúrgica
   - IA sugere kit cirúrgico baseado em histórico

2. Cotação (NOVO - Portais OPME):
   - Sistema cota automaticamente em 4 portais
   - Compara preços (OPMENEXO, Inpart, EMS, VSSupply)
   - Sugere melhor fornecedor
   - Economia média de 15%

3. Autorização:
   - Operadora de saúde analisa solicitação
   - Médico envia justificativa técnica
   - Convênio aprova ou nega
   - Tempo: 24-72h (urgência) ou 7-15 dias (eletiva)

4. Preparação:
   - Separar kit cirúrgico
   - Enviar para hospital
   - Conferir com equipe
   - Esterilização (se aplicável)

5. Cirurgia:
   - Registrar entrada na sala
   - Consumo intraoperatório
   - Rastreabilidade (lote, validade, série)
   - Registrar saída

6. Pós-Operatório:
   - Registrar ocorrências
   - Devolver não utilizados
   - Faturar para convênio
   - Aguardar pagamento
```

---

## 2. ARQUITETURA DO SISTEMA

### 2.1. Diagrama de Componentes Consolidado

```
┌─────────────────────────────────────────────────────────────────────┐
│         GESTÃO DE CIRURGIAS - ARQUITETURA CONSOLIDADA                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  PRESENTATION LAYER                           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │  │
│  │  │  Dashboard │  │ Agendamento│  │Autorização │  │  Kit   │ │  │
│  │  │  Cirurgias │  │  Cirúrgico │  │  Convênio  │  │Cirúrg. │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────┘ │  │
│  │                                                               │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │  │
│  │  │  Consumo   │  │Rastreabil. │  │Pós-Operató │  │Fatura- │ │  │
│  │  │  Intraop.  │  │    OPME    │  │    rio     │  │ mento  │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────┘ │  │
│  │                                                               │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │  │
│  │  │  PORTAIS   │  │  Cotações  │  │ Comparação │  │Palavras│ │  │
│  │  │    OPME    │  │ Múltiplas  │  │   Preços   │  │ -Chave │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           ▼                                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              BUSINESS LOGIC LAYER                             │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │         CirurgiasService.ts                            │  │  │
│  │  │  - CRUD de cirurgias                                   │  │  │
│  │  │  - Validação de agenda                                 │  │  │
│  │  │  - Controle de status                                  │  │  │
│  │  │  - Notificações automáticas                            │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │         AutorizacaoService.ts                          │  │  │
│  │  │  - Solicitação de autorização                          │  │  │
│  │  │  - Tracking de status                                  │  │  │
│  │  │  - Integração com operadoras                           │  │  │
│  │  │  - Alertas de vencimento                               │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │         RastreabilidadeService.ts                      │  │  │
│  │  │  - Registro de lote/série                              │  │  │
│  │  │  - Controle de validade                                │  │  │
│  │  │  - Integração ANVISA                                   │  │  │
│  │  │  - Histórico completo                                  │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │         PortaisOPMEService.ts (NOVO)                  │  │  │
│  │  │  - Orquestrador de integrações                         │  │  │
│  │  │  - Cache de resultados                                 │  │  │
│  │  │  - Rate limiting                                       │  │  │
│  │  │  - Retry logic                                         │  │  │
│  │  │  - Cotação paralela em 4 portais                       │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │         PalavrasChaveService.ts (NOVO)                │  │  │
│  │  │  - Gerenciamento de keywords                           │  │  │
│  │  │  - Sinônimos e variações                               │  │  │
│  │  │  - IA para sugestão (GPT-4)                            │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │         CirurgiasAI.ts (IA)                           │  │  │
│  │  │  - Previsão de demanda por especialidade              │  │  │
│  │  │  - Otimização de agenda (ML)                          │  │  │
│  │  │  - Recomendação de kit cirúrgico                      │  │  │
│  │  │  - Detecção de anomalias                              │  │  │
│  │  │  - Previsão de glosas (NLP)                           │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           ▼                                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            INTEGRATION LAYER (APIs)                           │  │
│  │                                                               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │  │
│  │  │  ANVISA  │  │   ANS    │  │  TISS    │  │   Hospitais  │ │  │
│  │  │DataVisa  │  │(Operado- │  │  Padrão  │  │  (HL7/FHIR)  │ │  │
│  │  │   API    │  │   ras)   │  │          │  │              │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │  │
│  │                                                               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │  │
│  │  │ OPMENEXO │  │  Inpart  │  │    EMS   │  │   VSSupply   │ │  │
│  │  │API Oficial│  │ Scraping │  │  Ventura │  │   GraphQL    │ │  │
│  │  │  (REST)  │  │ + API Inv│  │  Híbrida │  │              │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │  │
│  │                                                               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │  │
│  │  │  GPT-4   │  │ WhatsApp │  │   SMS    │  │    Email     │ │  │
│  │  │Justifica │  │ Notif.   │  │ Alertas  │  │  Relatórios  │ │  │
│  │  │   tiva   │  │          │  │          │  │              │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           ▼                                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    DATA LAYER                                 │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │          Supabase PostgreSQL                            │  │  │
│  │  │  - cirurgias                                            │  │  │
│  │  │  - cirurgias_equipe                                     │  │  │
│  │  │  - cirurgias_produtos (kit)                             │  │  │
│  │  │  - cirurgias_consumo (intraop)                          │  │  │
│  │  │  - cirurgias_autorizacoes                               │  │  │
│  │  │  - cirurgias_rastreabilidade                            │  │  │
│  │  │  - cirurgias_faturamento                                │  │  │
│  │  │  - cirurgias_ocorrencias                                │  │  │
│  │  │  - portais_opme_config (NOVO)                           │  │  │
│  │  │  - portais_opme_palavras_chave (NOVO)                   │  │  │
│  │  │  - portais_opme_cotacoes (NOVO)                         │  │  │
│  │  │  - portais_opme_historico (NOVO)                        │  │  │
│  │  │  - portais_opme_cache (NOVO)                            │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2. Modelo de Dados Consolidado

```sql
-- ============================================
-- CIRURGIAS - TABELAS PRINCIPAIS
-- ============================================

-- Tabela Principal: Cirurgias
CREATE TABLE cirurgias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_cirurgia VARCHAR(50) UNIQUE NOT NULL,
  
  -- Referências
  paciente_id UUID REFERENCES pacientes(id) NOT NULL,
  medico_responsavel_id UUID REFERENCES medicos(id) NOT NULL,
  hospital_id UUID REFERENCES hospitais(id) NOT NULL,
  convenio_id UUID REFERENCES convenios(id),
  
  -- Dados da Cirurgia
  tipo_cirurgia VARCHAR(100) NOT NULL,
  especialidade VARCHAR(100) NOT NULL,
  procedimento_tuss VARCHAR(10),
  descricao_procedimento TEXT,
  
  -- Agendamento
  data_agendamento TIMESTAMP NOT NULL,
  hora_inicio TIME,
  hora_fim TIME,
  duracao_prevista INTEGER,
  duracao_real INTEGER,
  sala_cirurgica VARCHAR(50),
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'solicitada',
  urgencia VARCHAR(20) DEFAULT 'eletiva',
  
  -- Valores
  valor_honorarios DECIMAL(15, 2),
  valor_materiais DECIMAL(15, 2),
  valor_total DECIMAL(15, 2),
  
  -- Autorização
  numero_autorizacao VARCHAR(100),
  data_autorizacao TIMESTAMP,
  validade_autorizacao DATE,
  
  -- Observações
  observacoes TEXT,
  justificativa_medica TEXT,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id)
);

-- Equipe Cirúrgica
CREATE TABLE cirurgias_equipe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID REFERENCES cirurgias(id) ON DELETE CASCADE,
  medico_id UUID REFERENCES medicos(id),
  funcao VARCHAR(50) NOT NULL,
  ordem INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Kit Cirúrgico (Produtos Planejados)
CREATE TABLE cirurgias_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID REFERENCES cirurgias(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos_opme(id),
  
  quantidade_planejada INTEGER NOT NULL,
  quantidade_consumida INTEGER DEFAULT 0,
  quantidade_devolvida INTEGER DEFAULT 0,
  
  valor_unitario DECIMAL(15, 2),
  valor_total DECIMAL(15, 2),
  
  status VARCHAR(50) DEFAULT 'planejado',
  observacoes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Consumo Intraoperatório (Rastreabilidade)
CREATE TABLE cirurgias_consumo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID REFERENCES cirurgias(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos_opme(id),
  
  -- Rastreabilidade ANVISA
  lote VARCHAR(100) NOT NULL,
  serie VARCHAR(100),
  data_fabricacao DATE,
  data_validade DATE NOT NULL,
  
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(15, 2),
  
  data_consumo TIMESTAMP DEFAULT NOW(),
  registrado_por UUID REFERENCES usuarios(id),
  observacoes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Autorizações de Convênio
CREATE TABLE cirurgias_autorizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID REFERENCES cirurgias(id) ON DELETE CASCADE,
  
  numero_solicitacao VARCHAR(100),
  numero_autorizacao VARCHAR(100),
  
  data_solicitacao TIMESTAMP DEFAULT NOW(),
  data_resposta TIMESTAMP,
  data_validade DATE,
  
  status VARCHAR(50) DEFAULT 'pendente',
  valor_solicitado DECIMAL(15, 2),
  valor_autorizado DECIMAL(15, 2),
  
  justificativa_medica TEXT,
  documentos_anexados JSONB,
  motivo_negacao TEXT,
  responsavel_analise VARCHAR(200),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rastreabilidade (Histórico Completo)
CREATE TABLE cirurgias_rastreabilidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID REFERENCES cirurgias(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos_opme(id),
  
  codigo_anvisa VARCHAR(50),
  lote VARCHAR(100),
  serie VARCHAR(100),
  data_validade DATE,
  
  origem VARCHAR(50),
  destino VARCHAR(50),
  
  data_movimentacao TIMESTAMP DEFAULT NOW(),
  responsavel UUID REFERENCES usuarios(id),
  observacoes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PORTAIS OPME - TABELAS NOVAS
-- ============================================

-- Configuração de Portais
CREATE TABLE portais_opme_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  portal VARCHAR(50) NOT NULL UNIQUE,
  nome_exibicao VARCHAR(100) NOT NULL,
  url_base VARCHAR(255) NOT NULL,
  
  tipo_integracao VARCHAR(50) NOT NULL,
  api_endpoint VARCHAR(255),
  api_key TEXT,
  api_secret TEXT,
  
  scraping_enabled BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  proxy_enabled BOOLEAN DEFAULT FALSE,
  
  ativo BOOLEAN DEFAULT TRUE,
  rate_limit_por_minuto INTEGER DEFAULT 60,
  timeout_segundos INTEGER DEFAULT 30,
  retry_max INTEGER DEFAULT 3,
  
  total_requisicoes INTEGER DEFAULT 0,
  requisicoes_sucesso INTEGER DEFAULT 0,
  requisicoes_erro INTEGER DEFAULT 0,
  ultima_requisicao TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id)
);

-- Palavras-Chave para Busca
CREATE TABLE portais_opme_palavras_chave (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID REFERENCES produtos_opme(id),
  palavra_chave VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'principal',
  prioridade INTEGER DEFAULT 1,
  portal VARCHAR(50),
  
  total_buscas INTEGER DEFAULT 0,
  total_resultados INTEGER DEFAULT 0,
  taxa_sucesso DECIMAL(5, 2),
  
  sugerida_por_ia BOOLEAN DEFAULT FALSE,
  confianca_ia DECIMAL(5, 2),
  ativo BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  
  UNIQUE(produto_id, palavra_chave, portal)
);

-- Cotações Realizadas
CREATE TABLE portais_opme_cotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  produto_id UUID REFERENCES produtos_opme(id),
  cirurgia_id UUID REFERENCES cirurgias(id),
  
  palavra_chave VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'processando',
  
  total_portais_consultados INTEGER DEFAULT 0,
  total_ofertas_encontradas INTEGER DEFAULT 0,
  melhor_preco DECIMAL(15, 2),
  portal_melhor_preco VARCHAR(50),
  
  tempo_execucao_ms INTEGER,
  data_cotacao TIMESTAMP DEFAULT NOW(),
  realizado_por UUID REFERENCES usuarios(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Histórico Detalhado por Portal
CREATE TABLE portais_opme_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  cotacao_id UUID REFERENCES portais_opme_cotacoes(id) ON DELETE CASCADE,
  portal VARCHAR(50) NOT NULL,
  
  sucesso BOOLEAN DEFAULT FALSE,
  erro_mensagem TEXT,
  ofertas JSONB,
  total_ofertas INTEGER DEFAULT 0,
  
  tempo_resposta_ms INTEGER,
  data_consulta TIMESTAMP DEFAULT NOW(),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cache de Resultados
CREATE TABLE portais_opme_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  portal VARCHAR(50) NOT NULL,
  palavra_chave VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL,
  resultado JSONB NOT NULL,
  expira_em TIMESTAMP NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(portal, palavra_chave, quantidade)
);

-- Índices para Performance
CREATE INDEX idx_cirurgias_data ON cirurgias(data_agendamento);
CREATE INDEX idx_cirurgias_status ON cirurgias(status);
CREATE INDEX idx_cirurgias_medico ON cirurgias(medico_responsavel_id);
CREATE INDEX idx_cirurgias_hospital ON cirurgias(hospital_id);
CREATE INDEX idx_cirurgias_paciente ON cirurgias(paciente_id);
CREATE INDEX idx_consumo_lote ON cirurgias_consumo(lote);
CREATE INDEX idx_rastreabilidade_produto ON cirurgias_rastreabilidade(produto_id);
CREATE INDEX idx_palavras_chave_produto ON portais_opme_palavras_chave(produto_id);
CREATE INDEX idx_palavras_chave_ativo ON portais_opme_palavras_chave(ativo);
CREATE INDEX idx_cotacoes_data ON portais_opme_cotacoes(data_cotacao);
CREATE INDEX idx_cotacoes_produto ON portais_opme_cotacoes(produto_id);
CREATE INDEX idx_historico_cotacao ON portais_opme_historico(cotacao_id);
CREATE INDEX idx_cache_expiracao ON portais_opme_cache(expira_em);

-- Função SQL para atualizar estatísticas de palavra-chave
CREATE OR REPLACE FUNCTION atualizar_estatisticas_palavra_chave(
  p_palavra_chave_id UUID,
  p_total_resultados INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE portais_opme_palavras_chave
  SET 
    total_buscas = total_buscas + 1,
    total_resultados = total_resultados + p_total_resultados,
    taxa_sucesso = (
      (total_resultados + p_total_resultados)::DECIMAL / 
      (total_buscas + 1)::DECIMAL * 100
    )
  WHERE id = p_palavra_chave_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 3. SUB-MÓDULOS

### 3.1. Lista Completa de Sub-módulos

```typescript
/**
 * Sub-módulos da Gestão de Cirurgias (13 sub-módulos)
 */

interface SubModulosCirurgias {
  '3.1.1': 'Dashboard de Cirurgias',
  '3.1.2': 'Agendamento Cirúrgico',
  '3.1.3': 'Autorização de Convênios',
  '3.1.4': 'Gestão de Kit Cirúrgico',
  '3.1.5': 'Consumo Intraoperatório',
  '3.1.6': 'Rastreabilidade OPME',
  '3.1.7': 'Pós-Operatório',
  '3.1.8': 'Faturamento de Cirurgias',
  '3.1.9': 'Calendário de Cirurgias',
  '3.1.10': 'Relatórios e Analytics',
  '3.1.11': 'IA e Otimização',
  '3.1.12': 'Integrações Hospitalares',
  '3.1.13': 'Portais OPME (NOVO)'
}
```

---

## 4. DASHBOARD DE CIRURGIAS

### 4.1. KPIs Principais

```typescript
/**
 * Dashboard de Gestão de Cirurgias
 * 
 * KPIS PRINCIPAIS:
 * 1. Cirurgias do Mês
 * 2. Cirurgias Hoje
 * 3. Aguardando Autorização
 * 4. Taxa de Autorização (%)
 * 5. Valor Total Cirurgias (R$)
 * 6. Taxa de Glosas (%)
 * 7. Tempo Médio de Autorização
 * 8. Cirurgias Canceladas (%)
 * 9. Economia com Portais OPME (NOVO)
 * 10. Cotações Realizadas (NOVO)
 */

export const DashboardCirurgias: React.FC = () => {
  const { kpis, loading } = useCirurgiasKPIs();
  const { alertas } = useAlertasCirurgias();

  return (
    <div className="space-y-6">
      {/* KPIs Linha 1 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <KPICard
          label="Cirurgias do Mês"
          value={kpis.cirurgiasMes}
          icon={<Activity />}
          trend={{ 
            direction: kpis.cirurgiasMes > kpis.cirurgiasMesAnterior ? 'up' : 'down',
            percentage: ((kpis.cirurgiasMes / kpis.cirurgiasMesAnterior - 1) * 100).toFixed(1)
          }}
        />
        
        <KPICard
          label="Cirurgias Hoje"
          value={kpis.cirurgiasHoje}
          icon={<Clock />}
          subtitle={`${kpis.cirurgiasHojeEmAndamento} em andamento`}
        />
        
        <KPICard
          label="Aguardando Autorização"
          value={kpis.aguardandoAutorizacao}
          icon={<AlertCircle />}
          variant="warning"
        />
        
        <KPICard
          label="Taxa de Autorização"
          value={`${kpis.taxaAutorizacao}%`}
          icon={<CheckCircle />}
          trend={{ direction: 'up', percentage: 2.5 }}
        />
        
        <KPICard
          label="Economia Portais"
          value={formatCurrency(kpis.economiaPortaisOPME)}
          icon={<TrendingDown />}
          variant="success"
        />
      </div>

      {/* KPIs Linha 2 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <KPICard
          label="Valor Total (Mês)"
          value={formatCurrency(kpis.valorTotalMes)}
          icon={<DollarSign />}
        />
        
        <KPICard
          label="Taxa de Glosas"
          value={`${kpis.taxaGlosas}%`}
          icon={<TrendingDown />}
          variant={kpis.taxaGlosas > 10 ? 'destructive' : 'success'}
        />
        
        <KPICard
          label="Tempo Médio Autorização"
          value={`${kpis.tempoMedioAutorizacao}h`}
          icon={<Timer />}
        />
        
        <KPICard
          label="Taxa de Cancelamento"
          value={`${kpis.taxaCancelamento}%`}
          icon={<XCircle />}
          variant={kpis.taxaCancelamento > 5 ? 'warning' : 'success'}
        />
        
        <KPICard
          label="Cotações Realizadas"
          value={kpis.cotacoesPortais}
          icon={<Search />}
        />
      </div>

      {/* Alertas Críticos */}
      {alertas.length > 0 && (
        <Card title="Alertas Críticos" padding="md">
          <div className="space-y-3">
            {alertas.map((alerta, idx) => (
              <Alert key={idx} variant={alerta.severidade}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alerta.titulo}</AlertTitle>
                <AlertDescription>
                  {alerta.descricao}
                  <Button 
                    variant="link" 
                    className="ml-2"
                    onClick={() => handleVerCirurgia(alerta.cirurgiaId)}
                  >
                    Ver cirurgia →
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </Card>
      )}

      {/* Calendário de Cirurgias */}
      <Card title="Cirurgias - Próximos 7 Dias" padding="md">
        <CalendarioCirurgias data={kpis.proximasCirurgias} />
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Cirurgias por Especialidade" padding="md">
          <PieChart
            data={kpis.cirurgiasPorEspecialidade}
            label="especialidade"
            value="quantidade"
          />
        </Card>

        <Card title="Top 10 Médicos (Volume)" padding="md">
          <BarChart
            data={kpis.topMedicos}
            xAxis="medico"
            yAxis="quantidade"
            horizontal
          />
        </Card>

        <Card title="Cirurgias - Últimos 12 Meses" padding="md">
          <LineChart
            data={kpis.evolucaoMensal}
            xAxis="mes"
            yAxis="quantidade"
          />
        </Card>

        <Card title="Economia com Portais OPME" padding="md">
          <LineChart
            data={kpis.economiaPortaisMensal}
            xAxis="mes"
            yAxis="economia"
            color="#10b981"
          />
        </Card>
      </div>

      {/* IA Insights */}
      <Card 
        title="Insights de IA" 
        padding="md"
        icon={<Sparkles />}
      >
        <InsightsCirurgiasIA />
      </Card>
    </div>
  );
};
```

Vou continuar criando a parte 2 com Agendamento, Autorização, Kit Cirúrgico, etc. Devido ao limite de caracteres, vou criar em um segundo arquivo.

