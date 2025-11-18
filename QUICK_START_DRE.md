# 🚀 Quick Start - DRE Inteligente

## ⚡ Setup Rápido (5 minutos)

### 1. Configure as Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 2. Configure o Mapeamento

```bash
# Copie o arquivo de exemplo
cp tools/finance/dre-inteligente/config/dre-mapping.example.json \
   tools/finance/dre-inteligente/config/dre-mapping.json
```

Edite `dre-mapping.json` e ajuste:
- Nomes das tabelas do seu Supabase
- Campos do plano de contas
- Códigos de conta de cada seção da DRE

### 3. Teste a Conexão

```bash
node tools/finance/dre-inteligente/mapear-plano-contas.js
```

Se aparecer uma tabela com suas contas, está funcionando! ✅

### 4. Gere Sua Primeira DRE

```bash
# DRE de Janeiro/2025
node tools/finance/dre-inteligente/gerar-dre-inteligente.js \
  --inicio=2025-01-01 \
  --fim=2025-01-31
```

Arquivo gerado: `docs/dre_inteligente_raw.json`

### 5. Analise a DRE

```bash
node tools/finance/dre-inteligente/analisar-dre-inteligente.js
```

Arquivo gerado: `docs/dre_inteligente_analise.json`

Você verá no terminal:
- Receita Líquida
- Resultado Operacional
- Margem Bruta (%)
- Margem Operacional (%)
- Insights automáticos

## 🤖 Usando Via Chatbot

### Gerar DRE via Agente Contador

```bash
@Contador:gerar-dre-inteligente
```

### Executar Playbook Completo

```bash
@Contador run dre-inteligente-mensal
```

Este comando executa todo o fluxo:
1. Mapeia plano de contas
2. Gera DRE
3. Analisa DRE
4. Tutor Financeiro interpreta
5. Tutor Conselheiro resume executivamente

## 📋 Exemplos Práticos

### Gerar DRE de Múltiplos Períodos

```bash
# Novembro/2025
node tools/finance/dre-inteligente/gerar-dre-inteligente.js \
  --inicio=2025-11-01 \
  --fim=2025-11-30 \
  --output=docs/dre_nov_2025.json

# Dezembro/2025
node tools/finance/dre-inteligente/gerar-dre-inteligente.js \
  --inicio=2025-12-01 \
  --fim=2025-12-31 \
  --output=docs/dre_dez_2025.json
```

### Analisar DRE Específica

```bash
node tools/finance/dre-inteligente/analisar-dre-inteligente.js \
  --input=docs/dre_nov_2025.json \
  --output=docs/analise_nov_2025.json
```

## 🎯 Estrutura do Mapeamento (Resumo)

```json
{
  "origem": {
    "tabela_plano_contas": "plano_contas",      // ← Ajuste aqui
    "tabela_lancamentos": "lancamentos",         // ← Ajuste aqui
    "campo_conta_codigo": "codigo",              // ← Ajuste aqui
    "campo_lanc_valor": "valor"                  // ← Ajuste aqui
  },
  "estrutura_dre": [
    {
      "secao": "RECEITA BRUTA",
      "contas": ["3.01%", "3.02%"]              // ← Prefixos de contas
    },
    {
      "secao": "RECEITA LÍQUIDA",
      "formula": "RECEITA BRUTA - DEDUÇÕES DA RECEITA"  // ← Cálculo
    }
  ]
}
```

### Uso de Prefixos

- `"3.01%"` = Todas as contas que começam com `3.01` (ex: 3.01.001, 3.01.002, 3.01.999)
- `"3.01.001"` = Apenas a conta exata `3.01.001`

## 🔍 O Que a Análise Retorna

### Indicadores Calculados
- Receita Líquida
- Lucro Bruto
- Resultado Operacional
- Margem Bruta (%)
- Margem Operacional (%)

### Insights Automáticos

**Se Margem Bruta < 30%:**
> "Margem bruta baixa; revisar custos diretos (OPMEs, materiais, equipe técnica)."

**Se Margem Operacional < 10%:**
> "Margem operacional muito comprimida; revisar despesas operacionais e eficiência administrativa."

## 🐛 Problemas Comuns

### ❌ "Variáveis de ambiente não configuradas"
**Solução:** Configure `SUPABASE_URL` e `SUPABASE_ANON_KEY` no arquivo `.env`

### ❌ "Arquivo de DRE não encontrado"
**Solução:** Execute `gerar-dre-inteligente.js` antes de `analisar-dre-inteligente.js`

### ❌ "Erro ao carregar plano de contas"
**Solução:** Verifique o nome da tabela em `dre-mapping.json` → `origem.tabela_plano_contas`

### ❌ "Valores todos zerados"
**Solução:** Ajuste os códigos de conta em `estrutura_dre` para corresponder ao seu plano de contas

## 📚 Próximos Passos

1. ✅ Gere a DRE do mês atual
2. ✅ Compare com meses anteriores
3. ✅ Use o chatbot para análises executivas: `@Tutor-Financeiro:interpretar-dre`
4. ✅ Explore outros agentes: `@Tutor-Conselheiro:diagnosticar`

## 🎓 Documentação Completa

Veja: [`docs/AGENTES_IA_E_DRE_INTELIGENTE.md`](./AGENTES_IA_E_DRE_INTELIGENTE.md)

---

**Pronto para começar?** Execute o comando abaixo:

```bash
node tools/finance/dre-inteligente/mapear-plano-contas.js
```

✨ Boa análise!

