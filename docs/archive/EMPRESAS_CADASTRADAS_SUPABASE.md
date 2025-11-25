# 🏢 EMPRESAS MOCKADAS - SISTEMA ICARUS

## 📊 Consulta Realizada via Supabase MCP

**Data:** $(date '+%Y-%m-%d %H:%M:%S')  
**Projeto:** gvbkviozlhxorjoavmky (ICARUS)  
**Região:** sa-east-1 (São Paulo)  
**Status:** ACTIVE_HEALTHY ✅

---

## 🏢 EMPRESAS CADASTRADAS (4 registros)

### 1️⃣ **NEW ORTHO** (Empresa Principal) ⭐

**Identificação:**
- **ID:** `a0000000-0000-0000-0000-000000000001`
- **Nome Fantasia:** NEW ORTHO
- **Razão Social:** NEW ORTHO COMERCIO DE PRODUTOS MEDICOS LTDA
- **CNPJ:** 00.000.000/0001-00

**Contato:**
- **Email:** contato@newortho.com.br
- **Telefone:** (11) 99999-9999

**Localização:**
- **Cidade:** (não informado)
- **Estado:** (não informado)

**Status:**
- **Situação:** ✅ ATIVA
- **Cadastrado em:** 18/11/2025 às 15:21

**Observações:**
- **Empresa principal do sistema**
- ID especial (padrão UUID com prefixo `a0000000`)
- Associada ao usuário admin `dax@newortho.com.br`

---

### 2️⃣ **ICARUS Distribuidora OPME**

**Identificação:**
- **ID:** `11111111-1111-1111-1111-111111111111`
- **Nome Fantasia:** ICARUS Distribuidora OPME
- **Razão Social:** ICARUS Distribuidora de Materiais OPME Ltda
- **CNPJ:** 12.345.678/0001-90

**Contato:**
- **Email:** contato@icarus-opme.com.br
- **Telefone:** (11) 3456-7890

**Localização:**
- **Cidade:** São Paulo
- **Estado:** SP

**Status:**
- **Situação:** ✅ ATIVA
- **Cadastrado em:** 18/11/2025 às 14:02

**Observações:**
- Distribuidora especializada em OPME
- ID mockado (padrão `11111111...`)

---

### 3️⃣ **Empresa Teste B**

**Identificação:**
- **ID:** `fb82ae40-a24e-49f2-a3e4-ef3160fe22e5`
- **Nome Fantasia:** Empresa Teste B
- **Razão Social:** (não informado)
- **CNPJ:** 22.222.222/0001-22

**Contato:**
- **Email:** (não informado)
- **Telefone:** (não informado)

**Localização:**
- **Cidade:** (não informado)
- **Estado:** (não informado)

**Status:**
- **Situação:** ✅ ATIVA
- **Cadastrado em:** 18/11/2025 às 11:25

**Observações:**
- Empresa de testes
- Dados mínimos cadastrados

---

### 4️⃣ **Icarus Vascular Hub**

**Identificação:**
- **ID:** `2d7cd504-5e4f-4e95-a7ab-fca6a4d61e39`
- **Nome Fantasia:** Icarus Vascular Hub
- **Razão Social:** Icarus Vascular Hub Ltda
- **CNPJ:** 45.123.678/0001-95

**Contato:**
- **Email:** contato@icarusvascular.com.br
- **Telefone:** (11) 4002-8922

**Localização:**
- **Cidade:** São Paulo
- **Estado:** SP

**Status:**
- **Situação:** ✅ ATIVA
- **Cadastrado em:** 17/11/2025 às 23:50

**Observações:**
- Hub especializado em cirurgias vasculares
- Primeira empresa cadastrada no sistema

---

## 📊 ESTATÍSTICAS

| Métrica | Valor |
|---------|-------|
| **Total de Empresas** | 4 |
| **Empresas Ativas** | 4 (100%) |
| **Empresas em SP** | 2 (50%) |
| **Dados Completos** | 2 (50%) |
| **Empresa Principal** | NEW ORTHO |

---

## 🎯 EMPRESA MOCKADA PRINCIPAL

### **NEW ORTHO** é a empresa principal do sistema ICARUS:

✅ **Características:**
- ID especial para identificação única
- Associada ao usuário admin `dax@newortho.com.br`
- Usada como empresa padrão nos testes
- Criada mais recentemente (18/11)

✅ **Relacionamentos:**
- Usuário admin: `dax@newortho.com.br`
- Perfil: Administrador do sistema
- Acesso total aos módulos

---

## 🔍 QUERY SQL UTILIZADA

\`\`\`sql
SELECT 
  id, 
  nome, 
  cnpj, 
  razao_social, 
  email, 
  telefone, 
  cidade, 
  estado, 
  status, 
  criado_em 
FROM empresas 
ORDER BY criado_em DESC 
LIMIT 10;
\`\`\`

---

## 📝 RECOMENDAÇÕES

### Para Testes:
1. ✅ Usar **NEW ORTHO** como empresa padrão
2. ✅ ID: `a0000000-0000-0000-0000-000000000001`
3. ✅ Usuário: `dax@newortho.com.br`

### Para Dados Demo:
1. **ICARUS Distribuidora OPME** - Distribuidora completa
2. **Icarus Vascular Hub** - Hospital/Centro cirúrgico

### Para Cleanup:
- **Empresa Teste B** pode ser removida (dados incompletos)

---

**Gerado por:** Sistema ICARUS via Supabase MCP  
**Projeto:** gvbkviozlhxorjoavmky  
**Região:** South America (São Paulo)


---

## 📊 DETALHES COMPLETOS DA NEW ORTHO

### Dados Corporativos Completos:
```json
{
  "id": "a0000000-0000-0000-0000-000000000001",
  "nome": "NEW ORTHO",
  "razao_social": "NEW ORTHO COMERCIO DE PRODUTOS MEDICOS LTDA",
  "cnpj": "00.000.000/0001-00",
  "inscricao_estadual": null,
  "licenca_anvisa": null,
  "dpo_tipo": "interno"
}
```

### Estatísticas de Uso:
- **Total de Usuários:** 1
- **Total de Produtos OPME:** 0
- **Total de Cirurgias:** 0

### Status:
- ✅ **Empresa Ativa**
- 📧 Email verificado: contato@newortho.com.br
- 📞 Telefone: (11) 99999-9999

### Observações Importantes:
- Empresa criada como **seed data** para testes
- **Única empresa com usuário cadastrado** (dax@newortho.com.br)
- Dados mínimos para funcionamento do sistema
- Pronta para cadastro de produtos e cirurgias


---

## 👤 USUÁRIO ADMINISTRADOR

### Dax Meneghel (Admin Principal)

**Identificação:**
- **ID:** `c0000000-0000-0000-0000-000000000001`
- **Email:** dax@newortho.com.br
- **Nome Completo:** Dax Meneghel
- **Empresa:** NEW ORTHO

**Perfil de Acesso:**
- **Perfil:** Admin (Administrador Total)
- **Role:** (não definido)
- **Status:** ✅ ATIVO

**Datas:**
- **Cadastrado em:** 18/11/2025 às 15:21
- **Criado simultaneamente com a empresa NEW ORTHO**

**Permissões:**
- ✅ Acesso total ao sistema
- ✅ Gestão de todas as empresas
- ✅ Configurações globais
- ✅ Usuários e permissões
- ✅ Todos os módulos (OPME, Cirurgias, Financeiro, etc)

---

## 🎯 RESUMO EXECUTIVO

### Empresa Mockada Principal: **NEW ORTHO**

✅ **Configuração Completa:**
```
Empresa:    NEW ORTHO (a0000000-0000-0000-0000-000000000001)
Admin:      Dax Meneghel (dax@newortho.com.br)
CNPJ:       00.000.000/0001-00
Status:     ATIVA ✅
Usuários:   1 (admin)
Produtos:   0 (pronto para cadastro)
Cirurgias:  0 (pronto para cadastro)
```

✅ **Uso Recomendado:**
- Login: `dax@newortho.com.br`
- Empresa padrão para desenvolvimento e testes
- Seed data para ambiente de staging/QA
- Base para demonstrações do sistema

---

## 📁 ARQUIVO GERADO

**Localização:** `/Users/daxmeneghel/icarus-make/EMPRESAS_CADASTRADAS_SUPABASE.md`

**Conteúdo:**
- 4 empresas mockadas detalhadas
- Usuário administrador completo
- Estatísticas e métricas
- Recomendações de uso

---

✅ **Consulta concluída com sucesso!**

