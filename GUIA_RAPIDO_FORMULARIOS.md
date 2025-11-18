# 🚀 Guia Rápido - Sistema de Formulários ICARUS V5

**Versão:** 1.0.0  
**Data:** 29/10/2025  
**Status:** ✅ Operacional

---

## 📋 ÍNDICE RÁPIDO

### Cadastros
1. [Médicos](#1-formulário-de-médicos) - `/cadastros/medicos/novo`
2. [Hospitais](#2-formulário-de-hospitais) - `/cadastros/hospitais/novo`
3. [Pacientes](#3-formulário-de-pacientes) - `/cadastros/pacientes/novo`
4. [Fornecedores](#4-formulário-de-fornecedores) - `/cadastros/fornecedores/novo`
5. [Produtos OPME](#5-formulário-de-produtos) - `/cadastros/produtos/novo`
6. [Convênios](#6-formulário-de-convênios) - `/cadastros/convenios/novo`
7. [Equipes Médicas](#7-formulário-de-equipes) - `/cadastros/equipes/novo`
8. [Transportadoras](#8-formulário-de-transportadoras) - `/cadastros/transportadoras/novo`

### Operacionais
9. [Cirurgias](#9-formulário-de-cirurgias) - `/cirurgias/novo`
10. [Pedidos de Compra](#10-formulário-de-pedidos) - `/compras/pedidos/novo`
11. [Remessas Consignação](#11-formulário-de-remessas) - `/consignacao/remessas/novo`
12. [Estoque](#12-formulário-de-estoque) - `/estoque/movimentacoes/novo`
13. [Entregas](#13-formulário-de-entregas) - `/logistica/entregas/novo`
14. [Cotações](#14-formulário-de-cotações) - `/compras/cotacoes/novo`

### Financeiros
15. [Contas a Receber](#15-formulário-de-contas-a-receber) - `/financeiro/contas-receber/novo`
16. [Contas a Pagar](#16-formulário-de-contas-a-pagar) - `/financeiro/contas-pagar/novo`
17. [Notas Fiscais](#17-formulário-de-notas-fiscais) - `/faturamento/notas/novo`

### Visualizações
18. [Kanban de Cirurgias](#18-kanban-de-cirurgias) - `/cirurgias/kanban`

---

## 🎨 PADRÃO VISUAL

Todos os formulários seguem o **OraclusX DS Neumorphic 3D**:

### Background
- Gradiente suave: `#E8EAF6` → `#F3E5F5`

### Seções
- Cards neumórficos brancos
- Sombras duplas (inset + outset)
- Ícone colorido no cabeçalho
- Numeração de seções (1, 2, 3...)

### Inputs
- Sombra inset (pressionado)
- Focus com borda purple
- Loading spinner quando necessário
- Mensagens de erro inline

### Botões
- **Cancelar:** Cinza, sombra raised
- **Salvar:** Purple gradient, elevation
- **Ajuda:** FAB purple, bottom-right

---

## 📝 CAMPOS OBRIGATÓRIOS

### 1. Formulário de Médicos
**Obrigatórios:**
- Nome Completo
- CRM
- UF do CRM
- Especialidade

**Validações Automáticas:**
- CRM → Consulta CFM
- CEP → Busca ViaCEP
- CPF → Formato (opcional)

---

### 2. Formulário de Hospitais
**Obrigatórios:**
- Nome do Hospital

**Validações Automáticas:**
- CNPJ → Formato
- CEP → Busca ViaCEP

---

### 3. Formulário de Pacientes
**Obrigatórios:**
- Nome Completo
- **Consentimento LGPD** (checkbox)

**Validações Automáticas:**
- CPF → Formato (opcional)
- CEP → Busca ViaCEP
- LGPD → Obrigatório

**IMPORTANTE:** Pacientes usam **iniciais** nas cirurgias (minimização LGPD).

---

### 4. Formulário de Fornecedores
**Obrigatórios:**
- Nome/Razão Social

**Validações Automáticas:**
- CNPJ → Formato
- Rating → 0-5

---

### 5. Formulário de Produtos OPME
**Obrigatórios:**
- Código SKU
- Descrição

**Campos Importantes:**
- Registro ANVISA
- Categoria
- Fabricante

---

### 6. Formulário de Convênios
**Obrigatórios:**
- Nome do Convênio

**Campos Comerciais:**
- Prazo de Pagamento (padrão: 30 dias)
- Percentual de Desconto
- Registro ANS

---

### 9. Formulário de Cirurgias
**Obrigatórios:**
- Paciente (iniciais - LGPD)
- Procedimento
- Data da Cirurgia

**Campos Importantes:**
- Médico Responsável
- Hospital
- Sala
- Prioridade
- Valor Estimado

---

### 15. Formulário de Contas a Receber
**Obrigatórios:**
- Número do Documento
- Descrição
- Cliente
- Valor Original
- Data de Emissão
- Data de Vencimento

**Cálculos Automáticos:**
- Valor Saldo = (Valor Original + Juros - Desconto - Valor Recebido)

---

### 16. Formulário de Contas a Pagar
**Obrigatórios:**
- Número do Documento
- Descrição
- Valor Original
- Data de Emissão
- Data de Vencimento

**Cálculos Automáticos:**
- Valor Saldo = (Valor Original + Juros + Multa - Desconto - Valor Pago)

---

### 17. Formulário de Notas Fiscais
**Obrigatórios:**
- Tipo (Entrada/Saída/Devolução)
- Número
- Data de Emissão
- Valor dos Produtos
- Valor Total

**Validações Fiscais:**
- Chave de Acesso (44 dígitos)
- CFOP
- Impostos (ICMS, IPI, PIS, COFINS)

---

## 🎯 ATALHOS DE TECLADO

- **Tab:** Navegar entre campos
- **Shift + Tab:** Navegar backwards
- **Enter:** Submeter formulário (se focus no botão)
- **Esc:** Cancelar (quando implementado)

---

## 🔧 INTEGRAÇÕES EXTERNAS

### ViaCEP (Busca de Endereço)
**Formulários:** Médicos, Hospitais, Pacientes, Fornecedores, Transportadoras  
**Trigger:** Blur no campo CEP (8 dígitos)  
**Auto-preenche:** Logradouro, Bairro, Cidade, Estado

### CFM (Validação de CRM)
**Formulário:** Médicos  
**Trigger:** Blur no CRM + UF preenchidos  
**Valida:** CRM ativo  
**Auto-preenche:** Nome, Especialidade (se disponível)

### Receita Federal (Validação CNPJ)
**Formulários:** Hospitais, Fornecedores, Convênios  
**Trigger:** Manual (botão validar)  
**Valida:** CNPJ ativo  
**Retorna:** Razão Social, Situação Cadastral

---

## 🎨 RESPONSIVIDADE

### Desktop (1024px+)
- Grid de 3-4 colunas
- Sidebar visível
- Padding 8 (32px)

### Tablet (768-1023px)
- Grid de 2 colunas
- Sidebar colapsada
- Padding 6 (24px)

### Mobile (<768px)
- Grid de 1 coluna
- Sidebar oculta
- Padding 4 (16px)

---

## ♿ ACESSIBILIDADE

### Navegação por Teclado
✅ Tab order lógico  
✅ Focus visível (ring purple)  
✅ Enter submete formulário  
✅ Esc cancela (planejado)

### Screen Readers
✅ Labels conectados  
✅ ARIA attributes  
✅ Mensagens de erro anunciadas  
✅ Estados de loading informados

### Contraste
✅ Textos: 4.5:1 mínimo  
✅ Botões: 3:1 mínimo  
✅ Estados disabled identificáveis

---

## 🐛 TROUBLESHOOTING

### Erro: "Campo obrigatório"
**Solução:** Preencha todos os campos marcados com (*)

### Erro: "CPF inválido"
**Solução:** Use formato `000.000.000-00`

### Erro: "CNPJ inválido"
**Solução:** Use formato `00.000.000/0000-00`

### Erro: "CEP não encontrado"
**Solução:** Verifique o CEP ou preencha manualmente

### Erro: "CRM não encontrado"
**Solução:** Verifique CRM e UF, ou preencha manualmente

### Erro: "Consentimento LGPD obrigatório"
**Solução:** Marque o checkbox de consentimento (Pacientes)

---

## 📞 SUPORTE

Para dúvidas sobre formulários:
- **Documentação Completa:** `docs/FORMULARIOS_PADRAO_COMPLETO.md`
- **Exemplos:** Cada formulário tem comentários inline
- **Email:** suporte@icarus.com
- **Slack:** #icarus-forms

---

**Guia Rápido - Sistema de Formulários ICARUS V5**  
**Todos os formulários seguem o padrão OraclusX DS Neumorphic 3D Premium** ✨

