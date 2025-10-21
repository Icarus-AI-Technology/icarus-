# 🔄 MAPEAMENTO FE ↔ BD — ICARUS

**Versão:** 1.0  
**Data:** 2025-10-18  
**Padrão:** Frontend camelCase ↔ Backend snake_case

---

## 📋 CONVENÇÕES

### **Nomenclatura**

| Camada | Padrão | Exemplo |
|--------|--------|---------|
| **Frontend (TS/React)** | camelCase | `empresaId`, `nomeCompleto`, `dataCirurgia` |
| **Backend (Postgres)** | snake_case | `empresa_id`, `nome_completo`, `data_cirurgia` |
| **JSON API** | camelCase | `{ "empresaId": "...", "nomeCompleto": "..." }` |

### **Adapters (Transformação)**

Localização: `src/lib/adapters/`

```typescript
// adapter-db.ts
export const toDatabase = (data: Record<string, any>) => {
  // camelCase → snake_case
  return Object.entries(data).reduce((acc, [key, value]) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = value;
    return acc;
  }, {} as Record<string, any>);
};

export const fromDatabase = (data: Record<string, any>) => {
  // snake_case → camelCase
  return Object.entries(data).reduce((acc, [key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = value;
    return acc;
  }, {} as Record<string, any>);
};
```

---

## 🗂️ MAPEAMENTO DE ENTIDADES

### **1. EMPRESAS**

| Frontend (camelCase) | Backend (snake_case) | Tipo | Obrigatório | Descrição |
|----------------------|----------------------|------|-------------|-----------|
| `id` | `id` | UUID | ✅ | ID único |
| `nome` | `nome` | string | ✅ | Nome fantasia |
| `razaoSocial` | `razao_social` | string | ⬜ | Razão social |
| `cnpj` | `cnpj` | string | ✅ | CNPJ (único) |
| `inscricaoEstadual` | `inscricao_estadual` | string | ⬜ | IE |
| `licencaAnvisa` | `licenca_anvisa` | string | ⬜ | Licença ANVISA |
| `telefone` | `telefone` | string | ⬜ | Telefone |
| `email` | `email` | string | ⬜ | E-mail |
| `cidade` | `cidade` | string | ⬜ | Cidade |
| `estado` | `estado` | string | ⬜ | UF (2 chars) |
| `status` | `status` | enum | ✅ | `ativa \| inativa \| suspensa` |
| `criadoEm` | `criado_em` | Date | ✅ | Timestamp criação |
| `atualizadoEm` | `atualizado_em` | Date | ✅ | Timestamp atualização |
| `excluidoEm` | `excluido_em` | Date? | ⬜ | Soft delete |

---

### **2. USUÁRIOS**

| Frontend | Backend | Tipo | Obrigatório | Descrição |
|----------|---------|------|-------------|-----------|
| `id` | `id` | UUID | ✅ | auth.users.id |
| `empresaId` | `empresa_id` | UUID | ✅ | FK empresas |
| `email` | `email` | string | ✅ | E-mail (único) |
| `nomeCompleto` | `nome_completo` | string | ⬜ | Nome |
| `avatarUrl` | `avatar_url` | string | ⬜ | URL avatar |
| `perfil` | `perfil` | enum | ✅ | `admin \| operador \| comercial \| financeiro \| estoque` |
| `criadoEm` | `criado_em` | Date | ✅ | |
| `atualizadoEm` | `atualizado_em` | Date | ✅ | |
| `excluidoEm` | `excluido_em` | Date? | ⬜ | |

---

### **3. PRODUTOS**

| Frontend | Backend | Tipo | Obrigatório | Descrição |
|----------|---------|------|-------------|-----------|
| `id` | `id` | UUID | ✅ | |
| `empresaId` | `empresa_id` | UUID | ✅ | FK empresas |
| `codigoSku` | `codigo_sku` | string | ✅ | SKU (único por empresa) |
| `descricao` | `descricao` | string | ✅ | Descrição |
| `fabricante` | `fabricante` | string | ⬜ | Fabricante |
| `registroAnvisa` | `registro_anvisa` | string | ⬜ | Registro ANVISA (OBRIGATÓRIO p/ OPME) |
| `categoria` | `categoria` | string | ⬜ | Categoria |
| `subcategoria` | `subcategoria` | string | ⬜ | Subcategoria |
| `valorUnitario` | `valor_unitario` | number | ⬜ | Preço |
| `unidadeMedida` | `unidade_medida` | string | ✅ | UN, CX, etc (default: UN) |
| `status` | `status` | enum | ✅ | `ativo \| inativo \| descontinuado` |
| `criadoEm` | `criado_em` | Date | ✅ | |
| `atualizadoEm` | `atualizado_em` | Date | ✅ | |
| `excluidoEm` | `excluido_em` | Date? | ⬜ | |

---

### **4. LOTES**

| Frontend | Backend | Tipo | Obrigatório | Descrição |
|----------|---------|------|-------------|-----------|
| `id` | `id` | UUID | ✅ | |
| `produtoId` | `produto_id` | UUID | ✅ | FK produtos |
| `numeroLote` | `numero_lote` | string | ✅ | Número do lote |
| `numeroSerie` | `numero_serie` | string | ⬜ | Número de série (implantes) |
| `dataFabricacao` | `data_fabricacao` | Date | ⬜ | Data fabricação |
| `dataValidade` | `data_validade` | Date | ✅ | **Validade (ANVISA)** |
| `quantidadeInicial` | `quantidade_inicial` | number | ✅ | Qtd inicial |
| `quantidadeDisponivel` | `quantidade_disponivel` | number | ✅ | Qtd disponível |
| `registroAnvisa` | `registro_anvisa` | string | ⬜ | Pode diferir do produto |
| `status` | `status` | enum | ✅ | `disponivel \| reservado \| consumido \| vencido \| bloqueado` |
| `criadoEm` | `criado_em` | Date | ✅ | |
| `atualizadoEm` | `atualizado_em` | Date | ✅ | |
| `excluidoEm` | `excluido_em` | Date? | ⬜ | |

---

### **5. MÉDICOS**

| Frontend | Backend | Tipo | Obrigatório | Descrição |
|----------|---------|------|-------------|-----------|
| `id` | `id` | UUID | ✅ | |
| `empresaId` | `empresa_id` | UUID | ✅ | FK empresas |
| `usuarioId` | `usuario_id` | UUID | ⬜ | FK usuarios (se cadastrado) |
| `nome` | `nome` | string | ✅ | Nome completo |
| `crm` | `crm` | string | ✅ | CRM |
| `crmUf` | `crm_uf` | string | ✅ | UF do CRM (2 chars) |
| `especialidade` | `especialidade` | string | ✅ | Especialidade |
| `telefone` | `telefone` | string | ⬜ | |
| `email` | `email` | string | ⬜ | |
| `hospitalPrincipal` | `hospital_principal` | string | ⬜ | |
| `volumeAnualEstimado` | `volume_anual_estimado` | number | ⬜ | Faturamento anual |
| `cirurgiasRealizadas` | `cirurgias_realizadas` | number | ✅ | Total cirurgias (default: 0) |
| `status` | `status` | enum | ✅ | `ativo \| inativo \| suspenso` |
| `criadoEm` | `criado_em` | Date | ✅ | |
| `atualizadoEm` | `atualizado_em` | Date | ✅ | |
| `excluidoEm` | `excluido_em` | Date? | ⬜ | |

---

### **6. HOSPITAIS**

| Frontend | Backend | Tipo | Obrigatório | Descrição |
|----------|---------|------|-------------|-----------|
| `id` | `id` | UUID | ✅ | |
| `empresaId` | `empresa_id` | UUID | ✅ | FK empresas |
| `nome` | `nome` | string | ✅ | Nome |
| `cnpj` | `cnpj` | string | ⬜ | CNPJ (único por empresa) |
| `telefone` | `telefone` | string | ⬜ | |
| `email` | `email` | string | ⬜ | |
| `cidade` | `cidade` | string | ⬜ | |
| `estado` | `estado` | string | ⬜ | UF (2 chars) |
| `tipo` | `tipo` | enum | ✅ | `hospital \| clinica \| centro_cirurgico` |
| `status` | `status` | enum | ✅ | `ativo \| inativo` |
| `criadoEm` | `criado_em` | Date | ✅ | |
| `atualizadoEm` | `atualizado_em` | Date | ✅ | |
| `excluidoEm` | `excluido_em` | Date? | ⬜ | |

---

### **7. CIRURGIAS**

| Frontend | Backend | Tipo | Obrigatório | Descrição |
|----------|---------|------|-------------|-----------|
| `id` | `id` | UUID | ✅ | |
| `empresaId` | `empresa_id` | UUID | ✅ | FK empresas |
| `codigoInterno` | `codigo_interno` | string | ⬜ | ID interno da empresa |
| `medicoId` | `medico_id` | UUID | ⬜ | FK medicos |
| `hospitalId` | `hospital_id` | UUID | ⬜ | FK hospitais |
| `pacienteIniciais` | `paciente_iniciais` | string | ✅ | **Iniciais (LGPD)** ex: "J.S." |
| `procedimento` | `procedimento` | string | ✅ | Tipo de cirurgia |
| `dataCirurgia` | `data_cirurgia` | Date | ✅ | Data |
| `horaCirurgia` | `hora_cirurgia` | Time | ✅ | Hora |
| `sala` | `sala` | string | ⬜ | Sala cirúrgica |
| `status` | `status` | enum | ✅ | `agendada \| confirmada \| preparacao \| andamento \| recuperacao \| concluida \| cancelada` |
| `prioridade` | `prioridade` | enum | ✅ | `baixa \| media \| alta \| urgente` |
| `observacoes` | `observacoes` | string | ⬜ | Observações |
| `valorEstimado` | `valor_estimado` | number | ⬜ | Valor estimado |
| `criadoEm` | `criado_em` | Date | ✅ | |
| `atualizadoEm` | `atualizado_em` | Date | ✅ | |
| `excluidoEm` | `excluido_em` | Date? | ⬜ | |

---

### **8. KITS**

| Frontend | Backend | Tipo | Obrigatório | Descrição |
|----------|---------|------|-------------|-----------|
| `id` | `id` | UUID | ✅ | |
| `empresaId` | `empresa_id` | UUID | ✅ | FK empresas |
| `cirurgiaId` | `cirurgia_id` | UUID | ⬜ | FK cirurgias |
| `nome` | `nome` | string | ✅ | Nome do kit |
| `descricao` | `descricao` | string | ⬜ | Descrição |
| `status` | `status` | enum | ✅ | `planejamento \| reservado \| montado \| despachado \| consumido \| devolvido \| cancelado` |
| `dataMontagem` | `data_montagem` | Date | ⬜ | Quando foi montado |
| `dataConsumo` | `data_consumo` | Date | ⬜ | Quando foi consumido |
| `criadoEm` | `criado_em` | Date | ✅ | |
| `atualizadoEm` | `atualizado_em` | Date | ✅ | |
| `excluidoEm` | `excluido_em` | Date? | ⬜ | |

---

### **9. ITENS_KIT**

| Frontend | Backend | Tipo | Obrigatório | Descrição |
|----------|---------|------|-------------|-----------|
| `id` | `id` | UUID | ✅ | |
| `kitId` | `kit_id` | UUID | ✅ | FK kits |
| `produtoId` | `produto_id` | UUID | ✅ | FK produtos |
| `loteId` | `lote_id` | UUID | ⬜ | FK lotes |
| `quantidade` | `quantidade` | number | ✅ | Quantidade |
| `quantidadeConsumida` | `quantidade_consumida` | number | ✅ | Qtd consumida (default: 0) |
| `criadoEm` | `criado_em` | Date | ✅ | |
| `atualizadoEm` | `atualizado_em` | Date | ✅ | |

---

### **10. LEADS**

| Frontend | Backend | Tipo | Obrigatório | Descrição |
|----------|---------|------|-------------|-----------|
| `id` | `id` | UUID | ✅ | |
| `empresaId` | `empresa_id` | UUID | ✅ | FK empresas |
| `nome` | `nome` | string | ✅ | Nome do lead |
| `empresaOrigem` | `empresa_origem` | string | ⬜ | Empresa do lead |
| `cargo` | `cargo` | string | ⬜ | Cargo |
| `email` | `email` | string | ⬜ | E-mail |
| `telefone` | `telefone` | string | ⬜ | Telefone |
| `valorEstimado` | `valor_estimado` | number | ⬜ | Valor estimado |
| `estagio` | `estagio` | enum | ✅ | `prospeccao \| qualificacao \| proposta \| negociacao \| fechamento \| perdido` |
| `probabilidade` | `probabilidade` | number | ✅ | 0-100 (default: 50) |
| `rating` | `rating` | number | ⬜ | 1-5 estrelas |
| `proximaAcao` | `proxima_acao` | string | ⬜ | Próxima ação |
| `dataUltimoContato` | `data_ultimo_contato` | Date | ⬜ | Último contato |
| `responsavelId` | `responsavel_id` | UUID | ⬜ | FK usuarios |
| `criadoEm` | `criado_em` | Date | ✅ | |
| `atualizadoEm` | `atualizado_em` | Date | ✅ | |
| `excluidoEm` | `excluido_em` | Date? | ⬜ | |

---

### **11. TRANSAÇÕES**

| Frontend | Backend | Tipo | Obrigatório | Descrição |
|----------|---------|------|-------------|-----------|
| `id` | `id` | UUID | ✅ | |
| `empresaId` | `empresa_id` | UUID | ✅ | FK empresas |
| `tipo` | `tipo` | enum | ✅ | `receita \| despesa` |
| `categoria` | `categoria` | string | ✅ | Categoria |
| `descricao` | `descricao` | string | ✅ | Descrição |
| `valor` | `valor` | number | ✅ | Valor |
| `dataVencimento` | `data_vencimento` | Date | ✅ | Vencimento |
| `dataPagamento` | `data_pagamento` | Date | ⬜ | Pagamento |
| `status` | `status` | enum | ✅ | `pendente \| pago \| vencido \| cancelado` |
| `formaPagamento` | `forma_pagamento` | string | ⬜ | Forma de pagamento |
| `observacoes` | `observacoes` | string | ⬜ | Observações |
| `criadoEm` | `criado_em` | Date | ✅ | |
| `atualizadoEm` | `atualizado_em` | Date | ✅ | |
| `excluidoEm` | `excluido_em` | Date? | ⬜ | |

---

### **12. FORNECEDORES**

| Frontend | Backend | Tipo | Obrigatório | Descrição |
|----------|---------|------|-------------|-----------|
| `id` | `id` | UUID | ✅ | |
| `empresaId` | `empresa_id` | UUID | ✅ | FK empresas |
| `nome` | `nome` | string | ✅ | Nome |
| `cnpj` | `cnpj` | string | ⬜ | CNPJ |
| `email` | `email` | string | ⬜ | E-mail |
| `telefone` | `telefone` | string | ⬜ | Telefone |
| `endereco` | `endereco` | string | ⬜ | Endereço |
| `categoria` | `categoria` | string | ⬜ | Categoria |
| `rating` | `rating` | number | ⬜ | 0-5 (rating) |
| `volumeCompras` | `volume_compras` | number | ✅ | Total comprado (default: 0) |
| `status` | `status` | enum | ✅ | `ativo \| inativo \| bloqueado` |
| `criadoEm` | `criado_em` | Date | ✅ | |
| `atualizadoEm` | `atualizado_em` | Date | ✅ | |
| `excluidoEm` | `excluido_em` | Date? | ⬜ | |

---

### **13. PEDIDOS_COMPRA**

| Frontend | Backend | Tipo | Obrigatório | Descrição |
|----------|---------|------|-------------|-----------|
| `id` | `id` | UUID | ✅ | |
| `empresaId` | `empresa_id` | UUID | ✅ | FK empresas |
| `numero` | `numero` | string | ✅ | Número do pedido (único) |
| `fornecedorId` | `fornecedor_id` | UUID | ⬜ | FK fornecedores |
| `valorTotal` | `valor_total` | number | ✅ | Valor total |
| `status` | `status` | enum | ✅ | `rascunho \| aguardando \| aprovado \| processando \| entregue \| cancelado` |
| `urgencia` | `urgencia` | enum | ✅ | `normal \| urgente \| critico` |
| `dataPedido` | `data_pedido` | Date | ✅ | Data do pedido (default: hoje) |
| `dataEntregaPrevista` | `data_entrega_prevista` | Date | ⬜ | Previsão entrega |
| `observacoes` | `observacoes` | string | ⬜ | Observações |
| `criadoEm` | `criado_em` | Date | ✅ | |
| `atualizadoEm` | `atualizado_em` | Date | ✅ | |
| `excluidoEm` | `excluido_em` | Date? | ⬜ | |

---

### **14. FATURAS**

| Frontend | Backend | Tipo | Obrigatório | Descrição |
|----------|---------|------|-------------|-----------|
| `id` | `id` | UUID | ✅ | |
| `empresaId` | `empresa_id` | UUID | ✅ | FK empresas |
| `numeroNfe` | `numero_nfe` | string | ✅ | Número NF-e |
| `serie` | `serie` | string | ✅ | Série |
| `tipo` | `tipo` | enum | ✅ | `nfe \| nfse \| cte \| mdfe` |
| `clienteTipo` | `cliente_tipo` | enum | ⬜ | `medico \| hospital \| outro` |
| `clienteId` | `cliente_id` | UUID | ⬜ | FK (medico/hospital) |
| `clienteNome` | `cliente_nome` | string | ✅ | Nome cliente |
| `clienteCpfCnpj` | `cliente_cpf_cnpj` | string | ✅ | CPF/CNPJ |
| `dataEmissao` | `data_emissao` | Date | ✅ | Emissão |
| `dataVencimento` | `data_vencimento` | Date | ⬜ | Vencimento |
| `dataPagamento` | `data_pagamento` | Date | ⬜ | Pagamento |
| `valorProdutos` | `valor_produtos` | number | ✅ | Valor produtos |
| `valorDesconto` | `valor_desconto` | number | ✅ | Desconto (default: 0) |
| `valorFrete` | `valor_frete` | number | ✅ | Frete (default: 0) |
| `valorImpostos` | `valor_impostos` | number | ✅ | Impostos (default: 0) |
| `valorTotal` | `valor_total` | number | ✅ | Total |
| `status` | `status` | enum | ✅ | `rascunho \| pendente \| emitida \| autorizada \| cancelada \| paga` |
| `statusSefaz` | `status_sefaz` | string | ⬜ | Status SEFAZ |
| `chaveAcesso` | `chave_acesso` | string | ⬜ | Chave 44 dígitos |
| `protocoloAutorizacao` | `protocolo_autorizacao` | string | ⬜ | Protocolo |
| `pedidoId` | `pedido_id` | UUID | ⬜ | FK pedidos_compra |
| `cirurgiaId` | `cirurgia_id` | UUID | ⬜ | FK cirurgias |
| `naturezaOperacao` | `natureza_operacao` | string | ⬜ | Natureza |
| `cfop` | `cfop` | string | ⬜ | CFOP |
| `formaPagamento` | `forma_pagamento` | string | ⬜ | Forma pagamento |
| `xmlNfe` | `xml_nfe` | string | ⬜ | XML NF-e |
| `pdfUrl` | `pdf_url` | string | ⬜ | URL PDF |
| `observacoes` | `observacoes` | string | ⬜ | Observações |
| `observacoesInternas` | `observacoes_internas` | string | ⬜ | Obs internas |
| `emitidaPor` | `emitida_por` | UUID | ⬜ | FK usuarios |
| `canceladaPor` | `cancelada_por` | UUID | ⬜ | FK usuarios |
| `motivoCancelamento` | `motivo_cancelamento` | string | ⬜ | Motivo |
| `dataCancelamento` | `data_cancelamento` | Date | ⬜ | Data cancelamento |
| `criadoEm` | `criado_em` | Date | ✅ | |
| `atualizadoEm` | `atualizado_em` | Date | ✅ | |
| `excluidoEm` | `excluido_em` | Date? | ⬜ | |

---

### **15. AUDIT_LOG** (somente leitura)

| Frontend | Backend | Tipo | Descrição |
|----------|---------|------|-----------|
| `id` | `id` | UUID | ID único |
| `empresaId` | `empresa_id` | UUID | FK empresas |
| `usuarioId` | `usuario_id` | UUID | FK usuarios |
| `tabela` | `tabela` | string | Nome da tabela |
| `registroId` | `registro_id` | UUID | ID do registro auditado |
| `acao` | `acao` | enum | `INSERT \| UPDATE \| DELETE \| SELECT` |
| `dadosAntes` | `dados_antes` | JSON | Estado anterior |
| `dadosDepois` | `dados_depois` | JSON | Estado posterior |
| `hashAnterior` | `hash_anterior` | string | Hash do registro anterior |
| `hashAtual` | `hash_atual` | string | Hash deste registro (SHA-256) |
| `criadoEm` | `criado_em` | Date | Timestamp |

---

## 🔧 EXEMPLO DE USO (Adapters)

### **Frontend → Backend**

```typescript
// Enviar cirurgia para API
const cirurgia = {
  empresaId: '123...',
  codigoInterno: 'CIR-001',
  medicoId: '456...',
  pacienteIniciais: 'J.S.',
  dataCirurgia: new Date('2025-10-20'),
  horaCirurgia: '08:00',
  status: 'agendada'
};

// Transformar para snake_case
const payload = toDatabase(cirurgia);
// { empresa_id: '123...', codigo_interno: 'CIR-001', ... }

await supabase.from('cirurgias').insert(payload);
```

### **Backend → Frontend**

```typescript
// Receber cirurgia da API
const { data } = await supabase.from('cirurgias').select('*');

// Transformar para camelCase
const cirurgias = data.map(fromDatabase);
// [{ empresaId: '123...', codigoInterno: 'CIR-001', ... }]
```

---

## 📝 NOTAS IMPORTANTES

1. **Soft delete:** Sempre verificar `excluido_em IS NULL` nas queries
2. **Multi-tenant:** Sempre filtrar por `empresa_id = auth.current_empresa()`
3. **Datas:** Usar ISO 8601 no JSON; PostgreSQL timestamptz
4. **Enums:** Validar no frontend antes de enviar
5. **UUIDs:** Sempre v4 (gen_random_uuid())
6. **LGPD:** Nunca enviar nome completo de paciente; usar iniciais

---

**Responsável:** Agente Sênior BD  
**Última atualização:** 2025-10-18

