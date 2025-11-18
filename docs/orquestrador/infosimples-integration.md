# 🔐 INFOSIMPLES API - INTEGRAÇÃO OPCIONAL

**Data:** 19 de outubro de 2025  
**Orquestrador:** Agente Sênior  
**Tipo:** Alternativa comercial para validações avançadas  
**Link:** [https://api.infosimples.com/](https://api.infosimples.com/)

---

## 🎯 VISÃO GERAL

**Infosimples** é um provedor comercial brasileiro de APIs para consultas de dados públicos e privados, oferecendo alternativa **paga mas robusta** para validações que APIs governamentais gratuitas não cobrem adequadamente.

### Credenciais Fornecidas

```bash
# Token de API (armazenar em .env privado)
INFOSIMPLES_API_TOKEN=<seu-token-infosimples>
```

⚠️ **IMPORTANTE:** Token já adicionado ao `.env.example` (sem expor token real)

---

## 💰 ANÁLISE CUSTO-BENEFÍCIO

### Quando Usar Infosimples (vs APIs Gratuitas)

| Validação | API Gratuita | Infosimples | Recomendação |
|-----------|--------------|-------------|--------------|
| **CEP** | ✅ ViaCEP ($0) | Infosimples ($0.01) | ✅ **Usar ViaCEP** |
| **CNPJ básico** | ✅ Receita Federal ($0) | Infosimples ($0.10) | ✅ **Usar RF** |
| **CNPJ completo** | ⚠️ RF (lento) | ✅ Infosimples ($0.15) | ⚠️ **Considerar IS** |
| **CPF** | ❌ Indisponível | ✅ Infosimples ($0.10) | ✅ **Usar IS** |
| **Veículos** | ❌ Indisponível | ✅ Infosimples ($0.50) | ✅ **Se necessário** |
| **Processos** | ⚠️ Scraping | ✅ Infosimples ($0.30) | ✅ **Se necessário** |

---

## 🎯 ESTRATÉGIA RECOMENDADA

### Abordagem Híbrida (APIs Gratuitas + Infosimples)

```yaml
Prioridade 1 - APIs Gratuitas:
  CEP: ViaCEP (100% grátis)
  CNPJ básico: Receita Federal (grátis)
  
Prioridade 2 - Infosimples (Seletivo):
  CPF: Infosimples (única opção viável)
  CNPJ completo: Infosimples (dados ricos)
  
Prioridade 3 - Infosimples (Opcional):
  Veículos: Apenas se módulo Frota ativo
  Processos: Apenas se compliance exigir
```

---

## 💰 ESTIMATIVA DE CUSTOS

### Cenário Recomendado

```yaml
Validações/mês:
  CEP: 500 (ViaCEP grátis) = $0
  CNPJ básico: 200 (RF grátis) = $0
  CNPJ completo: 50 (Infosimples) = $7.50
  CPF: 300 (Infosimples) = $30.00
  
TOTAL MÊS: $37.50 ✅
```

### Com Cache (70-80% hit rate)

```yaml
Custo sem cache: $37.50/mês
Custo com cache: $10-15/mês ✅
ECONOMIA: 60-70%
```

---

## 🔐 CONFIGURAÇÃO

Token já adicionado ao `.env.example`:

```bash
# Infosimples API (opcional - validações avançadas)
INFOSIMPLES_API_TOKEN=seu_token_aqui
INFOSIMPLES_API_URL=https://api.infosimples.com/api/v2
INFOSIMPLES_TIMEOUT=300
```

---

## 🏆 RECOMENDAÇÃO FINAL

**Infosimples** é **opcional** mas **estratégico**:

✅ **USAR PARA:**
- CPF (única opção viável)
- CNPJ completo (dados ricos)
- Cadastros críticos

❌ **NÃO USAR PARA:**
- CEP (ViaCEP grátis perfeito)
- CNPJ básico (RF suficiente)
- Consultas exploratórias

**🎯 META DE CUSTO:**
- Mês 1: $0 (só APIs gratuitas)
- Mês 2+: $10-40/mês (com cache otimizado)

---

**Referência:** [https://api.infosimples.com/](https://api.infosimples.com/)

**Gerado por:** Agente Orquestrador  
**Data:** 19 de outubro de 2025  
**Status:** ✅ DOCUMENTADO (opcional, não obrigatório)

