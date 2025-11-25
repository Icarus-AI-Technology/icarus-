# Sistema de Agentes IA e DRE Inteligente - ICARUS v5.0

## 📋 Visão Geral

Este documento descreve o sistema completo de agentes IA implementado no ICARUS v5.0, incluindo:

- **Orquestrador-ICARUS**: Agente principal que coordena todos os subagentes
- **Contador**: Especialista tributário e fiscal com DRE Inteligente
- **Advogado**: Compliance legal e regulatório (ANVISA/ANS/ISO)
- **Gestão Empresarial**: Análise estratégica e KPIs executivos
- **Tutor-Conselheiro**: Metatutor que orquestra todos os tutores de módulo

## 🎯 Arquitetura do Sistema

### Agentes Principais

```
Orquestrador-ICARUS (entry point)
├── Contador
│   ├── Fiscal-NFe
│   ├── Tributario-Lucro-Real
│   ├── Contabil-Fechamento
│   └── DRE-Inteligente
├── Advogado
│   ├── Compliance-ANVISA
│   ├── Compliance-ANS-TISS
│   └── LGPD-Juridico
├── Gestao-Empresarial
│   ├── BI-Analytics
│   ├── KPIs-Executivos
│   └── GapFit-Manager
└── Tutor-Conselheiro
    ├── Tutor-Financeiro
    ├── Tutor-OPME
    ├── Tutor-Compliance
    ├── Tutor-CRM
    ├── Tutor-Logistica
    ├── Tutor-Estoque
    ├── Tutor-Consignacao
    ├── Tutor-Cirurgias
    ├── Tutor-Faturamento-OPME
    └── ... (58+ módulos)
```

## 🤖 Tutores de IA por Módulo

O sistema implementa tutores especializados para cada um dos 58+ módulos do ICARUS, seguindo a convenção:

- **Padrão de nome**: `Tutor-<NomeModulo>`
- **Invocação via chatbot**: `@Tutor-<Modulo>:acao`
- **Roteamento**: Todo comando passa pelo `Tutor-Conselheiro` que orquestra as respostas

### Exemplos de Uso do Chatbot

```bash
# Diagnóstico global do sistema
@Tutor-Conselheiro:diagnosticar

# Consulta específica do módulo de cirurgias
@Tutor-Cirurgias:como-otimizar-agenda

# Diagnóstico de rejeições no faturamento OPME
@Tutor-Faturamento-OPME:diagnosticar-rejeicao

# Análise executiva com histórico do usuário
@Tutor-Conselheiro:obter-historico-usuario
@Tutor-Conselheiro:conselho-rapido

# Executar playbook de tutoria por módulo
@Tutor-Conselheiro run tutoria-modulo
```

## 📊 Sistema de Telemetria e Auditoria

### Rastreamento de Atividades

Toda ação relevante do usuário é registrada para:
- Personalização de tutores
- Recomendações contextuais
- Alertas preventivos
- Análise de padrões de uso

### Comandos de Telemetria

```bash
# Validar esquema de telemetria
@Tutor-Conselheiro:validar-esquema-telemetria

# Registrar atividade do usuário
@Tutor-Conselheiro:registrar-atividade-usuario

# Obter histórico de um usuário
@Tutor-Conselheiro:obter-historico-usuario
```

### Políticas de Privacidade

- ✅ Apenas metadados necessários expostos aos tutores
- ✅ Dados sensíveis anonimizados
- ✅ Compliance com LGPD
- ✅ Armazenamento no Supabase (schema de auditoria)

## 💰 DRE Inteligente

### Visão Geral

Sistema completo de Demonstração de Resultado do Exercício (DRE) com análise inteligente, integrado ao agente Contador.

### Estrutura de Arquivos

```
tools/finance/dre-inteligente/
├── config/
│   └── dre-mapping.example.json    # Configuração de mapeamento
├── lib/
│   ├── supabaseClient.js           # Cliente Supabase compartilhado
│   ├── fetchData.js                # Busca de dados (plano de contas + lançamentos)
│   ├── buildDRE.js                 # Construção da DRE
│   └── analyzeDRE.js               # Análise e insights
├── mapear-plano-contas.js          # Script 1: Mapear plano de contas
├── gerar-dre-inteligente.js        # Script 2: Gerar DRE
└── analisar-dre-inteligente.js     # Script 3: Analisar DRE
```

### Configuração Inicial

1. **Variáveis de Ambiente**

```bash
# .env ou .env.local
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
```

2. **Configurar Mapeamento**

```bash
# Copiar exemplo e adaptar
cp tools/finance/dre-inteligente/config/dre-mapping.example.json \
   tools/finance/dre-inteligente/config/dre-mapping.json

# Editar dre-mapping.json para ajustar:
# - Nomes das tabelas do Supabase
# - Campos do plano de contas
# - Códigos de conta para cada seção da DRE
```

### Uso dos Comandos

#### 1. Mapear Plano de Contas

Lista o plano de contas atual para ajudar no mapeamento:

```bash
# Via terminal
node tools/finance/dre-inteligente/mapear-plano-contas.js

# Via agente Contador
@Contador:mapear-plano-contas-dre
```

**Saída**:
- Tabela com preview de 20 contas
- Códigos, nomes e tipos de conta
- Orientação para ajustar `dre-mapping.json`

#### 2. Gerar DRE Inteligente

Gera a DRE para um período específico:

```bash
# Via terminal (período específico)
node tools/finance/dre-inteligente/gerar-dre-inteligente.js \
  --inicio=2025-01-01 \
  --fim=2025-01-31 \
  --output=docs/dre_janeiro_2025.json

# Via terminal (período padrão)
node tools/finance/dre-inteligente/gerar-dre-inteligente.js

# Via agente Contador
@Contador:gerar-dre-inteligente
```

**Saída**:
- Arquivo JSON com DRE estruturada
- Seções: Receita Bruta, Deduções, Receita Líquida, Custos, Lucro Bruto, Despesas, Resultado Operacional
- Valores calculados por seção

#### 3. Analisar DRE Inteligente

Gera insights e indicadores sobre a DRE:

```bash
# Via terminal
node tools/finance/dre-inteligente/analisar-dre-inteligente.js \
  --input=docs/dre_inteligente_raw.json \
  --output=docs/dre_analise.json

# Via agente Contador
@Contador:analisar-dre-inteligente
```

**Saída**:
- Indicadores: Margem Bruta, Margem Operacional
- Insights automáticos sobre performance
- Recomendações de ação

### Playbook Completo - DRE Mensal

Execute o fluxo completo via agente:

```bash
# Via agente Contador
@Contador run dre-inteligente-mensal
```

Este playbook executa:
1. `mapear-plano-contas-dre`
2. `gerar-dre-inteligente`
3. `analisar-dre-inteligente`
4. `@Tutor-Financeiro:interpretar-dre`
5. `@Tutor-Conselheiro:sumarizar-executivo`

**Deliverables**:
- `docs/dre_inteligente_resumo.md`
- `docs/dre_inteligente_detalhada.md`

### Estrutura do Mapeamento

O arquivo `dre-mapping.json` define:

```json
{
  "origem": {
    "tabela_plano_contas": "plano_contas",
    "tabela_lancamentos": "lancamentos",
    "campo_conta_codigo": "codigo",
    "campo_lanc_valor": "valor",
    ...
  },
  "estrutura_dre": [
    {
      "secao": "RECEITA BRUTA",
      "codigo": "1.0.0",
      "sinal": "+",
      "contas": ["3.01%", "3.02%"]
    },
    {
      "secao": "RECEITA LÍQUIDA",
      "codigo": "1.2.0",
      "sinal": "=",
      "formula": "RECEITA BRUTA - DEDUÇÕES DA RECEITA"
    }
  ],
  "dimensoes_analiticas": {
    "centro_custo": true,
    "medico": true,
    "convenio": true
  }
}
```

### Análise Inteligente

O sistema gera automaticamente:

#### Indicadores
- **Receita Líquida**: Total após deduções
- **Lucro Bruto**: Receita Líquida - Custos
- **Resultado Operacional**: Lucro Bruto - Despesas
- **Margem Bruta (%)**: Lucro Bruto / Receita Líquida
- **Margem Operacional (%)**: Resultado Operacional / Receita Líquida

#### Insights Automáticos

- **Margem < 30%**: "Margem bruta baixa; revisar custos diretos (OPMEs, materiais, equipe técnica)"
- **Margem ≥ 30%**: "Margem bruta saudável para o segmento OPME"
- **Margem Operacional < 10%**: "Margem operacional muito comprimida; revisar despesas"
- **Margem Operacional ≥ 10%**: "Margem operacional coerente; manter disciplina"

## 🎮 Playbooks Disponíveis

### Orquestrador-ICARUS

#### benchmark-erp-opme
Pesquisa e comparação dos 3 melhores ERPs OPME.

```bash
@Orquestrador-ICARUS run benchmark-erp-opme
```

**Deliverables**:
- `docs/benchmark_erp_opme.md`
- `docs/roadmap_gap_fit.md`

#### priorizar-funcionalidades
Identifica gaps e ranqueia funcionalidades.

```bash
@Orquestrador-ICARUS run priorizar-funcionalidades
```

**Deliverables**:
- `docs/backlog_priorizado.md`

#### rollout-tutores-ia
Cria/liga tutores de IA para todos os 58+ módulos.

```bash
@Orquestrador-ICARUS run rollout-tutores-ia
```

**Deliverables**:
- `docs/tutores_ia_por_modulo.md`
- `docs/mapeamento_telemetria_por_modulo.md`

#### auditoria-telemetria-usuarios
Valida rastreamento de ações dos usuários.

```bash
@Orquestrador-ICARUS run auditoria-telemetria-usuarios
```

**Deliverables**:
- `docs/auditoria_telemetria_usuarios.md`

### Contador

#### compliance-fiscal-continuo
Monitora compliance fiscal e gera alertas.

```bash
@Contador run compliance-fiscal-continuo
```

#### dre-inteligente-mensal
Gera e analisa DRE completa (descrito acima).

```bash
@Contador run dre-inteligente-mensal
```

### Advogado

#### conformidade-regulatoria
Monitora ANVISA, ANS e emite parecer.

```bash
@Advogado run conformidade-regulatoria
```

**Deliverables**:
- `docs/parecer_conformidade.md`

### Gestão Empresarial

#### relatorio-estrategico
Gera relatório executivo para CEO.

```bash
@Gestao-Empresarial run relatorio-estrategico
```

**Deliverables**:
- `docs/relatorio_ceo_icarius_v5.md`

### Tutor-Conselheiro

#### conselho-rapido
Diagnóstico rápido e classificação de gaps.

```bash
@Tutor-Conselheiro run conselho-rapido
```

#### tutoria-modulo
Tutoria personalizada usando histórico do usuário.

```bash
@Tutor-Conselheiro run tutoria-modulo
```

#### observabilidade-usuario
Registra e valida telemetria de usuários.

```bash
@Tutor-Conselheiro run observabilidade-usuario
```

#### sync-tutores-58-modulos
Sincroniza todos os tutores com inventário de módulos.

```bash
@Tutor-Conselheiro run sync-tutores-58-modulos
```

**Deliverables**:
- `docs/tutores_ia_por_modulo.md`

## 🔧 Comandos Disponíveis

### Orquestrador-ICARUS
- Apenas playbooks (nenhum comando direto)

### Contador
- `check-fiscal-erp`: Verifica compliance fiscal do ERP
- `mapear-obrigacoes`: Lista obrigações acessórias
- `simular-lucro-real`: Simula cenários de Lucro Real
- `gerar-alertas-legais`: Gera alertas sobre mudanças legais
- `mapear-plano-contas-dre`: Mapeia plano de contas para DRE
- `gerar-dre-inteligente`: Gera DRE para período
- `analisar-dre-inteligente`: Analisa DRE e gera insights

### Advogado
- `check-compliance-erp`: Verifica compliance legal
- `auditar-contratos`: Audita contratos vigentes
- `monitor-anvisa-ans`: Monitora mudanças regulatórias

### Gestão Empresarial
- `mapear-kpis-ceo`: Mapeia KPIs executivos
- `auditar-modulos`: Audita 58+ módulos
- `sugerir-melhorias`: Sugere melhorias prioritárias

### Tutor-Conselheiro
- `diagnosticar`: Diagnóstico completo do sistema
- `sumarizar-executivo`: Sumário executivo
- `emitir-parecer`: Parecer de compliance
- `classificar-gaps`: Classifica gaps (crítico/médio/baixo)
- `gerar-tutores`: Gera tutores por módulo
- `sync-tutores-modulos`: Sincroniza tutores com módulos
- `registrar-atividade-usuario`: Registra ação do usuário
- `obter-historico-usuario`: Obtém histórico de usuário
- `consolidar-orientacoes`: Consolida orientações de múltiplos tutores
- `validar-esquema-telemetria`: Valida schema de auditoria
- `resumo-executivo`: Resumo executivo geral
- `sintetizar-recomendacao`: Sintetiza recomendação final

## 🚀 Primeiros Passos

### 1. Configurar Variáveis de Ambiente

```bash
# .env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-aqui
```

### 2. Ajustar Mapeamento da DRE

```bash
# Copiar exemplo
cp tools/finance/dre-inteligente/config/dre-mapping.example.json \
   tools/finance/dre-inteligente/config/dre-mapping.json

# Editar e ajustar para seu banco de dados
vim tools/finance/dre-inteligente/config/dre-mapping.json
```

### 3. Testar Conexão

```bash
# Mapear plano de contas (testa conexão)
node tools/finance/dre-inteligente/mapear-plano-contas.js
```

### 4. Gerar Primeira DRE

```bash
# Gerar DRE do mês corrente
node tools/finance/dre-inteligente/gerar-dre-inteligente.js \
  --inicio=2025-11-01 \
  --fim=2025-11-30

# Analisar DRE gerada
node tools/finance/dre-inteligente/analisar-dre-inteligente.js
```

### 5. Explorar Via Chatbot

```bash
# Diagnóstico geral
@Tutor-Conselheiro:diagnosticar

# Conselho específico de módulo
@Tutor-Faturamento-OPME:diagnosticar-rejeicao

# Rodar playbook completo
@Contador run dre-inteligente-mensal
```

## 📚 Referências de Contexto

Os agentes consultam automaticamente:

- `docs/ICARUS_V5_SPEC_COMPLETO.md` - Especificação completa v5.0
- `docs/INVENTARIO_58_MODULOS_COMPLETO.md` - Inventário de módulos
- `docs/AUDITORIA_ORACLUSX_DS.md` - Schema de auditoria

## 🔐 Políticas de Segurança

### Filesystem
- **DevRoot**: `/users/daxmenghel/icarus-make/`
- **ProdRoot**: `/users/daxmenghel/icarus-v5.0/`
- **DenyWrite**: `.git`, `node_modules`

### Telemetria
- Anonimização de dados sensíveis
- Exposição apenas de metadados aos tutores
- Storage no Supabase (schema de auditoria)

### Compliance
- LGPD compliant
- ANVISA/ANS monitoring
- ISO 13485 tracking

## 🎯 Roadmap

- [ ] Expandir dimensões analíticas da DRE (centro de custo, médico, convênio)
- [ ] Implementar IA para insights avançados de DRE
- [ ] Criar dashboards executivos integrados
- [ ] Integrar telemetria com todos os 58+ módulos
- [ ] Benchmark contínuo com 3 principais ERPs OPME
- [ ] Alertas automáticos de mudanças legislativas (SEFAZ/ANS/ANVISA)

## 🐛 Troubleshooting

### Erro: "Variáveis de ambiente do Supabase não configuradas"

**Solução**: Configure `SUPABASE_URL` e `SUPABASE_ANON_KEY` no `.env`

### Erro: "Arquivo de DRE não encontrado"

**Solução**: Execute `gerar-dre-inteligente.js` antes de `analisar-dre-inteligente.js`

### Erro: "Tabela não encontrada"

**Solução**: Verifique nomes de tabelas em `dre-mapping.json` contra seu schema do Supabase

### Chatbot não responde

**Solução**: Certifique-se de usar o padrão `@Agente:comando` ou `@Agente run playbook`

## 📞 Suporte

Para questões sobre agentes ou DRE Inteligente:

1. Consulte a documentação em `docs/`
2. Use `@Tutor-Conselheiro:diagnosticar` para debug
3. Execute playbook `auditoria-telemetria-usuarios` para validar sistema

---

**ICARUS v5.0** - Sistema Inteligente de Gestão OPME
© 2025 - Todos os direitos reservados

