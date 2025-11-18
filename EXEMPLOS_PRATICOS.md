# Exemplos Práticos - Agentes IA e DRE Inteligente

Este documento contém exemplos práticos de uso do sistema de agentes e DRE Inteligente.

---

## 🎯 Cenário 1: Primeira Configuração da DRE

### Passo a Passo

```bash
# 1. Configure o ambiente
cat > .env << EOF
SUPABASE_URL=https://xyzproject.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...sua-chave-aqui
EOF

# 2. Copie o template de mapeamento
cp tools/finance/dre-inteligente/config/dre-mapping.example.json \
   tools/finance/dre-inteligente/config/dre-mapping.json

# 3. Visualize seu plano de contas
node tools/finance/dre-inteligente/mapear-plano-contas.js

# Saída esperada:
# === DRE INTELIGENTE :: MAPEAR PLANO DE CONTAS ===
# Tabela de plano de contas: plano_contas
# Total de contas encontradas: 150
# 
# ┌─────────┬──────────┬─────────────────────────────────┬──────────┐
# │ (index) │  codigo  │             nome                │   tipo   │
# ├─────────┼──────────┼─────────────────────────────────┼──────────┤
# │    0    │ '3.01.001'│ 'Receita OPME - Cardio'        │ 'receita'│
# │    1    │ '3.01.002'│ 'Receita OPME - Ortopedia'     │ 'receita'│
# │   ...   │   ...    │             ...                 │   ...    │
# └─────────┴──────────┴─────────────────────────────────┴──────────┘

# 4. Edite dre-mapping.json com os códigos corretos
vim tools/finance/dre-inteligente/config/dre-mapping.json
```

### Exemplo de Ajuste do Mapeamento

```json
{
  "estrutura_dre": [
    {
      "secao": "RECEITA BRUTA",
      "codigo": "1.0.0",
      "sinal": "+",
      "contas": ["3.01%", "3.02%", "3.03%"],
      "descricao": "Receitas de OPME Cardio, Ortopedia e Neurologia"
    },
    {
      "secao": "DEDUÇÕES DA RECEITA",
      "codigo": "1.1.0",
      "sinal": "-",
      "contas": ["3.09.001", "3.09.002", "3.10%"],
      "descricao": "Impostos, glosas e descontos"
    }
  ]
}
```

---

## 🎯 Cenário 2: Gerar DRE Mensal

### Novembro/2025

```bash
# Gerar DRE
node tools/finance/dre-inteligente/gerar-dre-inteligente.js \
  --inicio=2025-11-01 \
  --fim=2025-11-30

# Saída:
# === DRE INTELIGENTE :: GERADA COM SUCESSO ===
# Período: 2025-11-01 a 2025-11-30
# Arquivo: docs/dre_inteligente_raw.json

# Analisar DRE
node tools/finance/dre-inteligente/analisar-dre-inteligente.js

# Saída:
# === DRE INTELIGENTE :: ANÁLISE ===
# Período: 2025-11-01 a 2025-11-30
# Receita Líquida: 1850000
# Resultado Operacional: 277500
# Margem Bruta (%): 42.30
# Margem Operacional (%): 15.00
# 
# Insights:
# - Margem bruta saudável para o segmento OPME, mantendo competitividade.
# - Margem operacional coerente; manter disciplina de custos e monitorar crescimento.
# 
# Arquivo completo: docs/dre_inteligente_analise.json
```

### Arquivo JSON Gerado

```json
{
  "meta": {
    "periodo": "2025-11-01 a 2025-11-30",
    "geradoEm": "2025-11-17T14:30:00.000Z"
  },
  "secoes": [
    {
      "codigo": "1.0.0",
      "secao": "RECEITA BRUTA",
      "sinal": "+",
      "valor": 2150000,
      "detalhes": {}
    },
    {
      "codigo": "1.1.0",
      "secao": "DEDUÇÕES DA RECEITA",
      "sinal": "-",
      "valor": -300000,
      "detalhes": {}
    },
    {
      "codigo": "1.2.0",
      "secao": "RECEITA LÍQUIDA",
      "sinal": "=",
      "valor": 1850000,
      "detalhes": {}
    }
  ],
  "indicadores": {
    "receitaLiquida": 1850000,
    "lucroBruto": 782500,
    "resultadoOperacional": 277500,
    "margemBruta": 0.423,
    "margemOperacional": 0.15
  },
  "insights": [
    {
      "tipo": "margem",
      "chave": "margem_bruta",
      "valor": 0.423,
      "comentario": "Margem bruta saudável para o segmento OPME, mantendo competitividade."
    }
  ]
}
```

---

## 🎯 Cenário 3: Usar Via Chatbot

### Diagnóstico Global

```bash
@Tutor-Conselheiro:diagnosticar
```

**Resposta esperada**:
> Analisando todos os módulos do ICARUS v5.0...
> 
> ✅ **Financeiro**: Operacional, últimas DREs geradas
> ✅ **Faturamento OPME**: 15 guias pendentes de envio
> ⚠️ **Estoque**: 3 itens abaixo do estoque mínimo
> ⚠️ **Cirurgias**: 5 agendamentos em conflito para amanhã
> 
> **Recomendações**:
> 1. [CRÍTICO] Resolver conflitos de agenda - @Tutor-Cirurgias:resolver-conflitos
> 2. [MÉDIO] Revisar estoque mínimo - @Tutor-Estoque:sugerir-compras
> 3. [BAIXO] Enviar guias pendentes - @Tutor-Faturamento-OPME:processar-lote

### Consulta Específica - Faturamento

```bash
@Tutor-Faturamento-OPME:diagnosticar-rejeicao
```

**Resposta esperada**:
> Analisando rejeições de guias nos últimos 30 dias...
> 
> **Top 3 Motivos de Rejeição**:
> 1. Erro de cadastro do beneficiário (35%)
> 2. Data de validade da senha expirada (28%)
> 3. Código TUSS inválido (18%)
> 
> **Ações Recomendadas**:
> - Validar cadastro de beneficiários antes do envio
> - Implementar alerta 5 dias antes do vencimento da senha
> - Atualizar tabela TUSS para versão mais recente

### Executar Playbook Completo

```bash
@Contador run dre-inteligente-mensal
```

**Fluxo executado**:
1. Mapeamento do plano de contas ✓
2. Geração da DRE ✓
3. Análise de indicadores ✓
4. @Tutor-Financeiro interpreta resultados ✓
5. @Tutor-Conselheiro gera sumário executivo ✓

**Deliverables gerados**:
- `docs/dre_inteligente_resumo.md`
- `docs/dre_inteligente_detalhada.md`

---

## 🎯 Cenário 4: Benchmark de ERPs

### Executar Benchmark

```bash
@Orquestrador-ICARUS run benchmark-erp-opme
```

**Fluxo executado**:

1. **@Gestao-Empresarial:mapear-kpis-ceo**
   - Identifica KPIs críticos para o negócio

2. **@Advogado:check-compliance-erp**
   - Verifica requisitos legais (ANVISA/ANS/LGPD)

3. **@Contador:check-fiscal-erp**
   - Valida recursos fiscais (NF-e/SPED/EFD)

4. **@Tutor-Conselheiro:sintetizar-recomendacao**
   - Consolida análise e gera recomendação

**Resultado**:

```markdown
# Benchmark ERPs OPME - Top 3

## 1. ERP Alpha OPME
- **Score**: 8.5/10
- **Prós**: Integração TISS completa, rastreabilidade GS1
- **Contras**: Interface datada, curva de aprendizado alta
- **Compliance**: ✅ ANVISA, ✅ ANS, ⚠️ LGPD (parcial)
- **Custo**: R$ 2.500/mês

## 2. SistemaXYZ
- **Score**: 8.0/10
- **Prós**: UI moderna, mobile-first
- **Contras**: Sem módulo de consignação avançada
- **Compliance**: ✅ ANVISA, ✅ ANS, ✅ LGPD
- **Custo**: R$ 1.800/mês

## 3. OPME Manager Pro
- **Score**: 7.5/10
- **Prós**: Custo-benefício, suporte 24/7
- **Contras**: Sem integração com distribuidores
- **Compliance**: ⚠️ ANVISA (parcial), ✅ ANS, ✅ LGPD
- **Custo**: R$ 1.200/mês

## Recomendação ICARUS
**Gap Analysis**: ICARUS v5.0 tem recursos comparáveis ao líder (Alpha),
mas com UI superior ao SistemaXYZ e custo competitivo com OPME Manager Pro.

**Funcionalidades a adicionar (CRÍTICO)**:
1. Rastreabilidade GS1 avançada (como Alpha)
2. App mobile nativo (como SistemaXYZ)
3. Integração EDI com distribuidores (diferencial competitivo)
```

---

## 🎯 Cenário 5: Telemetria de Usuário

### Registrar Atividade

```bash
# Backend: registrar ação do usuário
@Tutor-Conselheiro:registrar-atividade-usuario \
  --usuario_id=123 \
  --modulo="Cirurgias" \
  --acao="Agendamento criado" \
  --detalhes='{"cirurgia_id": 456, "medico_id": 78}'
```

### Obter Histórico

```bash
@Tutor-Conselheiro:obter-historico-usuario --usuario_id=123
```

**Resposta**:
```json
{
  "usuario_id": 123,
  "nome": "Dr. João Silva",
  "perfil": "Médico",
  "periodo_analise": "últimos 30 dias",
  "resumo": {
    "total_acessos": 247,
    "modulos_mais_usados": [
      {"modulo": "Cirurgias", "acessos": 98},
      {"modulo": "Faturamento OPME", "acessos": 65},
      {"modulo": "Estoque", "acessos": 42}
    ],
    "acoes_recorrentes": [
      "Agendamento de cirurgias (98x)",
      "Consulta de materiais (65x)",
      "Impressão de guias (42x)"
    ],
    "erros_encontrados": [
      {"erro": "Material não encontrado", "ocorrencias": 5},
      {"erro": "Senha TISS expirada", "ocorrencias": 3}
    ]
  },
  "insights_tutor": [
    "Usuário trabalha principalmente com cirurgias ortopédicas",
    "Enfrenta dificuldades recorrentes com disponibilidade de materiais",
    "Recomendação: ativar alertas de estoque baixo para itens de ortopedia"
  ]
}
```

### Tutoria Personalizada

```bash
@Tutor-Conselheiro run tutoria-modulo --modulo="Cirurgias" --usuario_id=123
```

**Fluxo**:
1. Obtém histórico do usuário ✓
2. Identifica padrões de uso ✓
3. Aciona Tutor-Cirurgias com contexto ✓
4. Gera recomendações personalizadas ✓

**Resultado**:
> **Análise Personalizada - Dr. João Silva**
>
> Com base no seu histórico, identificamos oportunidades de otimização:
>
> **Padrões Detectados**:
> - Você agenda em média 4-5 cirurgias/dia
> - 80% são ortopedia (prótese de quadril/joelho)
> - Picos de agendamento: terças e quintas
>
> **Recomendações**:
> 1. ⚡ Criar template de cirurgia "Prótese Quadril" (economiza 2 min/agenda)
> 2. 📦 Ativar alerta automático de estoque para materiais ortopédicos
> 3. 📅 Bloquear terças/quintas pela manhã para concentrar cirurgias
> 4. 🤝 Integrar com fornecedor XYZ para reposição automática
>
> **Próximos Passos**:
> - @Tutor-Cirurgias:criar-template --tipo="protese-quadril"
> - @Tutor-Estoque:configurar-alertas --categoria="ortopedia"

---

## 🎯 Cenário 6: Comparação de Períodos

### Gerar DREs de Múltiplos Meses

```bash
# Outubro
node tools/finance/dre-inteligente/gerar-dre-inteligente.js \
  --inicio=2025-10-01 --fim=2025-10-31 \
  --output=docs/dre_out_2025.json

# Novembro
node tools/finance/dre-inteligente/gerar-dre-inteligente.js \
  --inicio=2025-11-01 --fim=2025-11-30 \
  --output=docs/dre_nov_2025.json

# Dezembro
node tools/finance/dre-inteligente/gerar-dre-inteligente.js \
  --inicio=2025-12-01 --fim=2025-12-31 \
  --output=docs/dre_dez_2025.json
```

### Análise Comparativa (Script Customizado)

```javascript
// tools/finance/comparar-dres.js
import fs from 'fs';

const out = JSON.parse(fs.readFileSync('docs/dre_out_2025.json'));
const nov = JSON.parse(fs.readFileSync('docs/dre_nov_2025.json'));
const dez = JSON.parse(fs.readFileSync('docs/dre_dez_2025.json'));

console.log('=== COMPARAÇÃO TRIMESTRAL ===\n');
console.log('Receita Líquida:');
console.log(`  Out: R$ ${out.indicadores.receitaLiquida.toLocaleString()}`);
console.log(`  Nov: R$ ${nov.indicadores.receitaLiquida.toLocaleString()}`);
console.log(`  Dez: R$ ${dez.indicadores.receitaLiquida.toLocaleString()}`);

const crescimentoNov = ((nov.indicadores.receitaLiquida / out.indicadores.receitaLiquida - 1) * 100).toFixed(2);
const crescimentoDez = ((dez.indicadores.receitaLiquida / nov.indicadores.receitaLiquida - 1) * 100).toFixed(2);

console.log(`\nCrescimento Nov/Out: ${crescimentoNov}%`);
console.log(`Crescimento Dez/Nov: ${crescimentoDez}%`);
```

**Saída**:
```
=== COMPARAÇÃO TRIMESTRAL ===

Receita Líquida:
  Out: R$ 1.650.000
  Nov: R$ 1.850.000
  Dez: R$ 2.100.000

Crescimento Nov/Out: 12.12%
Crescimento Dez/Nov: 13.51%
```

---

## 🎯 Cenário 7: Sync de Tutores com Módulos

### Sincronizar Todos os Tutores

```bash
@Tutor-Conselheiro run sync-tutores-58-modulos
```

**Fluxo**:
1. Lê `docs/INVENTARIO_58_MODULOS_COMPLETO.md` ✓
2. Identifica módulos sem tutor ✓
3. Gera definição de cada tutor ✓
4. Atualiza `.cursor/agents.json` ✓
5. Cria documentação `docs/tutores_ia_por_modulo.md` ✓

**Resultado**:
```markdown
# Tutores IA por Módulo - ICARUS v5.0

## Tutores Criados (58)

1. ✅ Tutor-Cirurgias
2. ✅ Tutor-Faturamento-OPME
3. ✅ Tutor-Estoque-Inteligente
4. ✅ Tutor-Consignacao-Avancada
5. ✅ Tutor-Logistica-Avancada
... (54 mais)

## Exemplo de Invocação

@Tutor-Cirurgias:diagnosticar-agenda
@Tutor-Estoque:sugerir-contagem-ciclica
@Tutor-CRM:priorizar-leads
```

---

## 📚 Resumo dos Exemplos

| Cenário | Comando | Resultado |
|---------|---------|-----------|
| 1. Setup DRE | `mapear-plano-contas.js` | Lista plano de contas |
| 2. DRE Mensal | `gerar-dre-inteligente.js` | JSON com DRE estruturada |
| 3. Chatbot | `@Tutor-Conselheiro:diagnosticar` | Diagnóstico global |
| 4. Benchmark | `@Orquestrador-ICARUS run benchmark-erp-opme` | Análise comparativa ERPs |
| 5. Telemetria | `@Tutor-Conselheiro:obter-historico-usuario` | Histórico personalizado |
| 6. Comparação | Scripts customizados | Análise de períodos |
| 7. Sync Tutores | `@Tutor-Conselheiro run sync-tutores-58-modulos` | Tutores atualizados |

---

**Explore mais**: Leia `docs/AGENTES_IA_E_DRE_INTELIGENTE.md` para detalhes completos!

