# DRE Inteligente - ICARUS v5.0

Sistema de Demonstração de Resultado do Exercício com análise inteligente e insights automáticos.

## 📦 O Que Foi Implementado

### ✅ Arquivos Criados

```
tools/finance/dre-inteligente/
├── config/
│   └── dre-mapping.example.json    # Template de configuração
├── lib/
│   ├── supabaseClient.js           # Cliente Supabase
│   ├── fetchData.js                # Busca plano de contas + lançamentos
│   ├── buildDRE.js                 # Construção da DRE estruturada
│   └── analyzeDRE.js               # Análise e geração de insights
├── mapear-plano-contas.js          # Script 1 (executável)
├── gerar-dre-inteligente.js        # Script 2 (executável)
└── analisar-dre-inteligente.js     # Script 3 (executável)
```

### ✅ Agente Contador Atualizado

Novo comando adicionado ao agente `Contador` em `.cursor/agents.json`:

- `mapear-plano-contas-dre`
- `gerar-dre-inteligente`
- `analisar-dre-inteligente`

### ✅ Novo Playbook

**dre-inteligente-mensal**: Fluxo completo de geração e análise

## 🚀 Como Usar

### Via Terminal

```bash
# 1. Mapear plano de contas (primeiro uso)
node tools/finance/dre-inteligente/mapear-plano-contas.js

# 2. Gerar DRE
node tools/finance/dre-inteligente/gerar-dre-inteligente.js \
  --inicio=2025-11-01 \
  --fim=2025-11-30

# 3. Analisar DRE
node tools/finance/dre-inteligente/analisar-dre-inteligente.js
```

### Via Agente Contador

```bash
# Comandos individuais
@Contador:mapear-plano-contas-dre
@Contador:gerar-dre-inteligente
@Contador:analisar-dre-inteligente

# Playbook completo
@Contador run dre-inteligente-mensal
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie `.env` na raiz do projeto:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
```

### 2. Mapeamento

```bash
# Copiar template
cp tools/finance/dre-inteligente/config/dre-mapping.example.json \
   tools/finance/dre-inteligente/config/dre-mapping.json

# Editar e ajustar tabelas/campos
```

Ajuste em `dre-mapping.json`:

- **origem**: Nomes de tabelas e campos do Supabase
- **estrutura_dre**: Códigos de conta para cada seção
- **dimensoes_analiticas**: Dimensões de análise (centro de custo, médico, convênio)

## 📊 Estrutura da DRE

### Seções Implementadas

1. **RECEITA BRUTA** (código 1.0.0)
2. **DEDUÇÕES DA RECEITA** (código 1.1.0)
3. **RECEITA LÍQUIDA** (código 1.2.0) = 1 - 2
4. **CUSTO DOS SERVIÇOS** (código 2.0.0)
5. **LUCRO BRUTO** (código 2.1.0) = 3 - 4
6. **DESPESAS OPERACIONAIS** (código 3.0.0)
7. **RESULTADO OPERACIONAL** (código 3.1.0) = 5 - 6

### Indicadores Calculados

- Margem Bruta (%) = Lucro Bruto / Receita Líquida
- Margem Operacional (%) = Resultado Operacional / Receita Líquida

### Insights Automáticos

- ✅ Alertas sobre margens baixas
- ✅ Recomendações de revisão de custos
- ✅ Análise de eficiência operacional

## 🎯 Dimensões Analíticas (Roadmap)

Preparado para análise por:

- 📍 Centro de Custo
- 👨‍⚕️ Médico
- 🏥 Convênio
- 📅 Periodicidade (mensal, trimestral, anual)

## 📖 Documentação

- **[Documentação Completa](../../docs/AGENTES_IA_E_DRE_INTELIGENTE.md)** - Guia detalhado de agentes e DRE
- **[Quick Start](../../docs/QUICK_START_DRE.md)** - Setup em 5 minutos

## 🧪 Exemplo de Saída

### Console

```
=== DRE INTELIGENTE :: ANÁLISE ===
Período: 2025-11-01 a 2025-11-30
Receita Líquida: 1500000
Resultado Operacional: 225000
Margem Bruta (%): 45.50
Margem Operacional (%): 15.00

Insights:
- Margem bruta saudável para o segmento OPME, mantendo competitividade.
- Margem operacional coerente; manter disciplina de custos e monitorar crescimento.

Arquivo completo: docs/dre_inteligente_analise.json
```

### JSON Gerado

```json
{
  "meta": {
    "periodo": "2025-11-01 a 2025-11-30",
    "geradoEm": "2025-11-17T10:30:00Z"
  },
  "indicadores": {
    "receitaLiquida": 1500000,
    "lucroBruto": 682500,
    "resultadoOperacional": 225000,
    "margemBruta": 0.455,
    "margemOperacional": 0.15
  },
  "insights": [
    {
      "tipo": "margem",
      "chave": "margem_bruta",
      "valor": 0.455,
      "comentario": "Margem bruta saudável para o segmento OPME..."
    }
  ]
}
```

## 🔧 Troubleshooting

### Erro de Conexão
```
[DRE-INTELIGENTE] Variáveis de ambiente não configuradas
```
**Solução**: Configure `SUPABASE_URL` e `SUPABASE_ANON_KEY` no `.env`

### Valores Zerados
```
Todas as seções aparecem com valor 0
```
**Solução**: Ajuste os códigos de conta em `dre-mapping.json` → `estrutura_dre[].contas`

### Tabela Não Encontrada
```
Erro ao carregar plano de contas: relation "..." does not exist
```
**Solução**: Corrija `origem.tabela_plano_contas` em `dre-mapping.json`

## 🚀 Próximos Passos

1. Implementar análise por centro de custo
2. Adicionar comparação entre períodos
3. Gerar gráficos visuais
4. Exportar para PDF executivo
5. Integrar com IA para insights avançados

## 📞 Suporte

Para questões técnicas:

1. Consulte a [documentação completa](../../docs/AGENTES_IA_E_DRE_INTELIGENTE.md)
2. Use `@Tutor-Conselheiro:diagnosticar`
3. Execute `@Contador run dre-inteligente-mensal` para teste completo

---

**ICARUS v5.0** - DRE Inteligente
Desenvolvido por: Agente Contador + DRE-Inteligente

