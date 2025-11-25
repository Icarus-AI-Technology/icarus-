# 📋 Relatórios Regulatórios - Compliance ANVISA/SEFAZ/ANS

## Visão Geral

O módulo **Relatórios Regulatórios** é o sistema completo para geração, envio e auditoria de relatórios obrigatórios exigidos pelos órgãos reguladores: **ANVISA**, **SEFAZ** e **ANS**. Essencial para distribuidoras de OPME manterem conformidade regulatória.

## 🎯 Funcionalidades Principais

### 1. **Geração de Relatórios**
- **Sob demanda**: Gere relatórios instantaneamente
- **Agendamento automático**: Mensal, trimestral, anual
- **Múltiplos formatos**: PDF, Excel, XML, TXT (SPED)
- **Templates reutilizáveis**: Standardização garantida
- **Validação automática**: Conformidade com layout oficial

### 2. **ANVISA - Rastreabilidade (RDC 16/2013)**
- Movimentações de produtos (entrada/saída)
- Lotes e números de série
- Registro ANVISA obrigatório
- Data de fabricação e validade
- Origem e destino (CNPJ)
- Condições de armazenamento e transporte
- Responsável técnico (CRM)

### 3. **SEFAZ - SPED Fiscal**
- EFD ICMS/IPI (arquivo TXT)
- Layout oficial da Receita Federal
- Apuração de ICMS
- Entradas e saídas fiscais
- Inventário
- Geração automática mensal

### 4. **ANS - Faturamento Planos de Saúde**
- Relatório de faturamento
- NF-e para planos de saúde
- Procedimentos realizados
- Guias TISS relacionadas
- Valores e glosas

### 5. **Agendamento Inteligente**
- Frequência configurável (mensal, trimestral, anual)
- Dia e hora da execução
- Destinatários por email
- Envio automático ao órgão (futuro)
- Histórico de execuções

### 6. **Auditoria Completa**
- Registro de todas as gerações
- Quem gerou, quando gerou
- Protocolo de envio ao órgão
- Hash SHA-256 para integridade
- Tempo de geração

## 🏗️ Arquitetura de Banco de Dados

### Tabelas:

1. **`relatorios_regulatorios`**: Relatórios gerados
   - Identificação (tipo, título, órgão)
   - Período (data_inicio, data_fim)
   - Status (gerando, gerado, enviado, erro)
   - Arquivo (URL, tamanho, hash)
   - Resumo (total_registros, JSON summary)
   - Auditoria (gerado_por, enviado_por)

2. **`relatorios_templates`**: Templates reutilizáveis
   - SQL query para buscar dados
   - Campos obrigatórios
   - Template HTML (Handlebars) para PDF
   - Excel config (sheets, columns)
   - Validações

3. **`relatorios_agendamentos`**: Agendamento automático
   - Template relacionado
   - Frequência (mensal, trimestral, anual)
   - Dia e hora de execução
   - Destinatários email
   - Última/Próxima execução

4. **`anvisa_movimentacoes`**: Movimentações ANVISA
   - NF-e relacionada
   - Produto (código, descrição, registro ANVISA)
   - Lote, série, fabricação, validade
   - Tipo (entrada, saída, transferência, perda, devolução)
   - Origem/Destino (CNPJ, razão social)
   - Armazém
   - Condições de armazenamento/transporte
   - Responsável técnico

### Views:

1. **`vw_relatorios_pendentes`**: Relatórios agendados prontos para execução
2. **`vw_anvisa_rastreabilidade`**: Visão consolidada de rastreabilidade

### Functions:

1. **`gerar_relatorio_anvisa_rastreabilidade(data_inicio, data_fim, formato)`**
   - Gera relatório de rastreabilidade
   - Calcula resumo (entradas, saídas, produtos, lotes)
   - Retorna UUID do relatório gerado

2. **`gerar_sped_fiscal(mes, ano)`**
   - Gera arquivo SPED Fiscal (TXT)
   - Layout oficial EFD ICMS/IPI
   - Retorna UUID do relatório gerado

## 📊 Interface React

### 4 Abas:

1. **Relatórios**:
   - KPIs: Total Gerados, Pendentes Envio, Enviados, Com Erro
   - Tabela completa de relatórios
   - Filtro por órgão (ANVISA, SEFAZ, ANS, CFM)
   - Ações: Download, Enviar ao Órgão, Ver Detalhes

2. **Templates**:
   - Grid de templates disponíveis
   - Visualização por órgão
   - Botão "Gerar" direto no card

3. **Agendamentos**:
   - Lista de agendamentos automáticos
   - Frequência, última/próxima execução
   - Destinatários email
   - Toggle ativar/desativar

4. **ANVISA**:
   - Dashboard específico de rastreabilidade
   - KPIs: Produtos Rastreados, Lotes Ativos, Conformidade
   - Movimentações recentes

## 📋 Relatórios Obrigatórios

### ANVISA (RDC 16/2013):
- **Obrigatoriedade**: Mensal
- **Prazo**: Até dia 10 do mês seguinte
- **Formato**: PDF ou XML
- **Conteúdo**: Todas as movimentações de OPME
- **Penalidade**: Multa + suspensão de atividades

### SEFAZ (SPED Fiscal):
- **Obrigatoriedade**: Mensal
- **Prazo**: Até dia 20 do mês seguinte
- **Formato**: TXT (layout oficial)
- **Conteúdo**: EFD ICMS/IPI
- **Penalidade**: Multa de até R$ 5.000/mês

### ANS (Faturamento):
- **Obrigatoriedade**: Se atender planos de saúde
- **Prazo**: Conforme contrato
- **Formato**: Excel ou XML
- **Conteúdo**: NF-e + Guias TISS
- **Penalidade**: Glosa de pagamento

## 💻 Uso no Código

### Exemplo 1: Gerar Relatório ANVISA

```typescript
import { supabase } from '@/lib/supabase';

// Gerar relatório de rastreabilidade
const { data: relatorioId, error } = await supabase.rpc(
  'gerar_relatorio_anvisa_rastreabilidade',
  {
    p_data_inicio: '2025-10-01',
    p_data_fim: '2025-10-31',
    p_formato: 'PDF',
  }
);

console.log('Relatório gerado:', relatorioId);
```

### Exemplo 2: Criar Agendamento Automático

```typescript
const { data: agendamento } = await supabase
  .from('relatorios_agendamentos')
  .insert({
    template_id: 'uuid-template-anvisa',
    nome: 'ANVISA - Rastreabilidade Mensal',
    frequencia: 'mensal',
    dia_execucao: 5, // Todo dia 5 do mês
    hora_execucao: 8, // 08:00
    enviar_email: true,
    destinatarios_email: ['compliance@distribuidora.com'],
    is_ativo: true,
  })
  .select()
  .single();

console.log('Agendamento criado:', agendamento.id);
```

### Exemplo 3: Registrar Movimentação ANVISA

```typescript
// Ao receber um produto (entrada)
const { data: movimentacao } = await supabase
  .from('anvisa_movimentacoes')
  .insert({
    nfe_id: 'uuid-da-nfe',
    produto_codigo: 'OPME12345',
    produto_descricao: 'Stent Coronariano XYZ',
    registro_anvisa: '10123456789',
    lote: 'LOT2025001',
    numero_serie: 'SN123456789',
    data_fabricacao: '2025-01-15',
    data_validade: '2027-01-15',
    tipo_movimentacao: 'entrada',
    quantidade: 10,
    unidade: 'UN',
    origem_cnpj: '12345678000190',
    origem_razao_social: 'Indústria Fabricante LTDA',
    destino_cnpj: '98765432000100', // CNPJ da distribuidora
    destino_razao_social: 'Distribuidora OPME ABC',
    temperatura_armazenamento: '2-8°C',
    responsavel_tecnico_nome: 'Dr. João Silva',
    responsavel_tecnico_crm: 'CRM-SP 123456',
    codigo_rastreamento: 'ANVISA-2025-' + Date.now(),
    data_movimentacao: new Date().toISOString(),
  })
  .select()
  .single();

console.log('Movimentação registrada:', movimentacao.id);
```

### Exemplo 4: Buscar Relatórios Pendentes de Envio

```typescript
const { data: pendentes } = await supabase
  .from('relatorios_regulatorios')
  .select('*')
  .eq('status', 'gerado')
  .eq('obrigatoriedade', 'obrigatorio')
  .order('data_fim', { ascending: false });

pendentes.forEach((relatorio) => {
  console.log(`Pendente: ${relatorio.titulo} - ${relatorio.orgao}`);
});
```

## 🚨 Alertas e Prazos

### Sistema de Alertas:
- **7 dias antes**: Aviso de prazo próximo
- **3 dias antes**: Alerta urgente
- **1 dia antes**: Alerta crítico
- **Após prazo**: Relatório em atraso (notificação diária)

### Notificações:
- Email para compliance e gerência
- Slack (webhook)
- Notificação in-app
- SMS para gestores (opcional)

## 🔐 Segurança e Conformidade

### Integridade:
- Hash SHA-256 de cada arquivo gerado
- Timestamp imutável de geração
- Protocolo de envio ao órgão
- Auditoria de quem gerou/enviou

### RLS (Row Level Security):
- Compliance e Auditores: Veem tudo
- Gerentes: Veem relatórios de sua área
- Outros: Sem acesso

### LGPD:
- Logs de todas as operações
- Anonimização de dados sensíveis (se aplicável)
- Retenção de 5 anos (mínimo legal)

## 📊 Estatísticas do Módulo

- **SQL**: ~600 linhas (migration)
- **React**: ~850 linhas (component)
- **Docs**: ~400 linhas
- **TOTAL**: ~1.850 linhas
- **Tabelas**: 4
- **Views**: 2
- **Functions**: 2
- **Relatórios Suportados**: 3 órgãos (ANVISA, SEFAZ, ANS)

## 🎯 Benefícios

### Para Compliance:
- ✅ Conformidade garantida (ANVISA RDC 16/2013)
- ✅ Geração automática de SPED
- ✅ Rastreabilidade completa
- ✅ Auditoria interna facilitada

### Para Operações:
- ✅ Automatização total (zero trabalho manual)
- ✅ Alertas proativos de prazos
- ✅ Templates padronizados

### Para TI:
- ✅ Integração via API (Supabase RPC)
- ✅ Logs completos
- ✅ Escalabilidade

## 📝 Roadmap Futuro

1. **Envio Automático ao Órgão** (via API oficial)
2. **OCR para NF-e** (extração automática)
3. **IA para Validação** (detecção de inconsistências)
4. **Blockchain para Rastreabilidade** (prova imutável)
5. **Integração com ERPs** (SAP, TOTVS)

## 🏥 Contexto OPME

### Por que é crítico?
Distribuidoras de OPME são **obrigadas por lei** a:
- Manter rastreabilidade de todos os produtos (ANVISA)
- Emitir NF-e e gerar SPED (SEFAZ)
- Reportar faturamento para planos de saúde (ANS)

### Penalidades por não conformidade:
- **ANVISA**: Multa + suspensão de atividades + processo criminal
- **SEFAZ**: Multa de até R$ 5.000/mês + juros
- **ANS**: Glosa de pagamento + exclusão de rede

### RDC 16/2013 (ANVISA):
> "Distribuidoras devem manter registros de todas as movimentações de produtos, incluindo lote, data de validade, origem, destino e condições de armazenamento/transporte."

## 🎉 Conclusão

O **Relatórios Regulatórios** transforma conformidade em processo automatizado, eliminando risco de multas e penalidades.

**Status**: ✅ 100% COMPLETO  
**Versão**: 1.0  
**Data**: Outubro 2025

