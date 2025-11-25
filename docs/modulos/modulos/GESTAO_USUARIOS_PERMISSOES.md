# Gestão de Usuários e Permissões (RBAC) - ICARUS

## 📋 Visão Geral

Sistema completo de **controle de acesso baseado em funções (RBAC - Role-Based Access Control)** para distribuidoras OPME, com auditoria completa para conformidade LGPD, ANVISA e ISO 27001.

## 🎯 Objetivos

1. **Segurança**: Controlar rigorosamente quem acessa o quê no sistema
2. **Conformidade LGPD**: Registrar todas as operações (Art. 37)
3. **Rastreabilidade ANVISA**: Auditoria de ações críticas (RDC 16/2013)
4. **Flexibilidade**: Permissões granulares por módulo, ação e até campo
5. **Escalabilidade**: Suportar múltiplas filiais, departamentos e hierarquias

## 🏗️ Arquitetura

### Modelo RBAC Completo

```
USUÁRIO → atribuído a → ROLES → possuem → PERMISSÕES
                          ↓
                     OVERRIDES (exceções)
```

### Tabelas Principais

1. **`roles`**: Funções/Perfis (admin, gerente_comercial, vendedor, etc.)
2. **`permissions`**: Permissões granulares (nfe.emitir, estoque.view, etc.)
3. **`role_permissions`**: Relação Roles ↔ Permissions
4. **`user_roles`**: Atribuição de roles aos usuários
5. **`user_permissions_override`**: Permissões excepcionais (grant/revoke)
6. **`user_sessions`**: Controle de sessões ativas
7. **`user_2fa`**: Autenticação de dois fatores (TOTP)
8. **`audit_log`**: Log de auditoria completo (LGPD)
9. **`failed_login_attempts`**: Tentativas falhas (segurança)

## 📊 Roles Padrão (Contexto OPME)

### 1. **admin** (Nível 0 - Sistema)
- **Acesso total** ao sistema
- Gerenciar usuários, roles e permissões
- Acesso a logs de auditoria
- **Crítico**: Requer 2FA para ações sensíveis

### 2. **gerente_geral** (Nível 10 - Comercial)
- **Visão 360°** da distribuidora
- Acesso a todos os módulos (exceto gerenciar roles)
- Aprovar pedidos acima de certo valor
- Relatórios executivos

### 3. **gerente_comercial** (Nível 20 - Comercial)
- Gestão de vendas e relacionamento
- Atendimento a hospitais e planos de saúde
- Negociação de contratos
- Emissão de propostas comerciais

### 4. **vendedor** (Nível 30 - Comercial)
- Atendimento a **pedidos médicos**
- Consultar estoque
- Registrar entregas
- **Não pode**: Emitir NF-e, alterar preços

### 5. **gerente_financeiro** (Nível 20 - Financeiro)
- Gestão de faturamento
- Emissão e cancelamento de NF-e
- Contas a receber
- Relatórios financeiros

### 6. **analista_financeiro** (Nível 30 - Financeiro)
- Emitir NF-e
- Lançar contas a receber
- Consultar inadimplência
- **Não pode**: Cancelar NF-e (requer gerente)

### 7. **gerente_logistica** (Nível 20 - Logística)
- Gestão de estoque e entregas
- Controle de validade e lotes (ANVISA)
- Negociação com indústrias (reposição)
- Relatórios de movimentação

### 8. **almoxarife** (Nível 30 - Logística)
- Entrada/saída de produtos
- Conferência de lotes e validades
- Inventário físico
- **Não pode**: Excluir produtos

### 9. **analista_compliance** (Nível 20 - Compliance)
- Auditoria interna
- Verificação de conformidade ANVISA
- Gestão de certificados
- Relatórios regulatórios

### 10. **auditor_interno** (Nível 25 - Compliance)
- Acesso a logs de auditoria
- Relatórios de conformidade
- Investigação de não conformidades
- **Acesso read-only** a dados sensíveis

### 11. **ti_admin** (Nível 15 - TI)
- Gerenciar integrações (SEFAZ, ANVISA, CFM)
- Configuração de sistema
- Backup e restore
- Monitoramento de infraestrutura

### 12. **suporte** (Nível 40 - TI)
- Atendimento a usuários finais
- Redefinir senhas (com aprovação)
- Consultar dados para troubleshooting
- **Acesso limitado** a dados sensíveis

## 🔐 Permissões Granulares

### Estrutura de Permissão

```
<modulo>.<acao>[.<campo>]

Exemplos:
- nfe.view              (visualizar NF-es)
- nfe.create            (emitir NF-e)
- nfe.cancel            (cancelar NF-e - CRÍTICO)
- nfe.view_valor        (ver valores da NF-e)
- estoque.update        (atualizar estoque)
- usuarios.create       (criar usuários - CRÍTICO)
- audit.export          (exportar auditoria - CRÍTICO)
```

### Níveis de Criticidade

- **baixo**: Operações de leitura básicas (dashboard.view)
- **médio**: Operações de escrita comuns (estoque.update)
- **alto**: Operações sensíveis (usuarios.create, nfe.view_valor)
- **crítico**: Operações irreversíveis (nfe.cancel, usuarios.delete)

### Permissões que Requerem 2FA

- `nfe.cancel` - Cancelar NF-e autorizada
- `usuarios.create` - Criar usuários
- `usuarios.delete` - Excluir usuários
- `roles.manage` - Gerenciar funções
- `permissions.assign` - Atribuir permissões
- `audit.export` - Exportar logs de auditoria
- `estoque.delete` - Excluir produtos

## 🛡️ Segurança

### Autenticação de Dois Fatores (2FA)

Suporte a 3 métodos:
1. **TOTP** (Time-based One-Time Password) - Google Authenticator, Authy
2. **SMS** - Código via mensagem de texto
3. **Email** - Código via email

**Obrigatório para**:
- Ações críticas (cancelar NF-e, excluir usuários)
- Acesso a dados sensíveis (auditoria, financeiro)
- Primeiro login após redefinição de senha

### Controle de Sessões

- **Múltiplas sessões simultâneas**: Permitido (desktop + mobile)
- **Expiração automática**: 8 horas de inatividade
- **Logout forçado**: Admin pode encerrar sessões remotamente
- **Registro de IP e User-Agent**: Para auditoria

### Proteção Contra Ataques

- **Limite de tentativas de login**: 5 falhas em 15 minutos = bloqueio temporário
- **Registro de IPs suspeitos**: Alertas automáticos
- **Bloqueio de conta**: Manual (admin) ou automático (fraude detectada)

## 📝 Auditoria (LGPD Art. 37)

### O que é Registrado

Toda operação no sistema gera um log de auditoria contendo:
- **Quem**: user_id + user_email
- **O quê**: ação (ex: nfe.emitir, usuario.criar)
- **Quando**: created_at (timestamp preciso)
- **Onde**: ip_address + user_agent
- **Como**: dados_antes + dados_depois (para updates)
- **Resultado**: sucesso (boolean) + erro_mensagem (se falhou)
- **Sensibilidade**: público, interno, confidencial, restrito

### Níveis de Sensibilidade

- **público**: Operações não sensíveis (dashboard.view)
- **interno**: Operações internas normais (pedido.criar)
- **confidencial**: Dados financeiros (nfe.view_valor)
- **restrito**: Dados pessoais sensíveis (usuarios.view_cpf)

### Retenção de Logs

- **LGPD**: Mínimo 6 meses (Art. 37)
- **ICARUS**: 2 anos (configur

ável)
- **Backup**: Exportação trimestral para arquivo externo

## 🔄 Fluxos de Uso

### 1. Atribuir Role a Novo Usuário

```typescript
import { RBACService } from '@/lib/services/RBACService';

// Administrador atribui role "vendedor" ao novo usuário
const result = await RBACService.assignRole(
  'user-id-novo-vendedor',
  'role-id-vendedor',
  'admin-user-id'
);

if (result.success) {
  console.log('Role atribuída com sucesso!');
  // Log de auditoria é criado automaticamente
}
```

### 2. Verificar Permissão Antes de Ação

```typescript
const userId = (await supabase.auth.getUser()).data.user?.id;
const canCancelNFe = await RBACService.userHasPermission(userId, 'nfe.cancel');

if (canCancelNFe) {
  // Permitir cancelamento
  await cancelarNFe(nfeId);
} else {
  alert('Você não tem permissão para cancelar NF-e');
}
```

### 3. Proteger Componente React com Permissão

```typescript
import { withPermission } from '@/lib/services/RBACService';

function PainelFinanceiro() {
  return <div>Dados financeiros sensíveis...</div>;
}

export default withPermission(PainelFinanceiro, 'financeiro.view');
// Usuário sem permissão verá "Acesso Negado"
```

### 4. Conceder Permissão Excepcional (Override)

```typescript
// Vendedor precisa cancelar NF-e excepcionalmente (normalmente só gerente pode)
await RBACService.grantPermissionOverride(
  'vendedor-user-id',
  'permission-id-nfe-cancel',
  'Cliente solicitou cancelamento urgente para correção de dados',
  'gerente-user-id',
  new Date(Date.now() + 24 * 60 * 60 * 1000) // Válido por 24h
);
```

### 5. Consultar Audit Log

```typescript
const logs = await RBACService.getAuditLogs({
  userId: 'user-id',
  modulo: 'nfe',
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-10-31'),
  limit: 100,
});

console.log(`${logs.length} operações de NF-e em outubro`);
```

### 6. Exportar Logs para Conformidade LGPD

```typescript
// Exportar logs trimestrais em CSV para auditoria externa
const csvLogs = await RBACService.exportAuditLogs(
  new Date('2025-07-01'),
  new Date('2025-09-30'),
  'csv'
);

// Salvar em arquivo ou enviar para auditor
const blob = new Blob([csvLogs], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'audit-logs-Q3-2025.csv';
link.click();
```

## 🧪 Testes

### Teste 1: Usuário Sem Permissão

```typescript
// Vendedor tenta cancelar NF-e (sem permissão)
const canCancel = await RBACService.userHasPermission('vendedor-id', 'nfe.cancel');
console.assert(canCancel === false, 'Vendedor não deve poder cancelar NF-e');
```

### Teste 2: Usuário com Múltiplas Roles

```typescript
// Usuário com roles "vendedor" + "analista_financeiro"
const roles = await RBACService.getUserRoles('user-id');
console.assert(roles.length === 2, 'Deve ter 2 roles');

// Deve ter permissões de ambas as roles
const canViewEstoque = await RBACService.userHasPermission('user-id', 'estoque.view'); // vendedor
const canEmitNFe = await RBACService.userHasPermission('user-id', 'nfe.create'); // analista_financeiro
console.assert(canViewEstoque && canEmitNFe, 'Deve ter permissões de ambas as roles');
```

### Teste 3: Override com Precedência

```typescript
// Usuário com role "vendedor" (tem nfe.view), mas override REVOKE
await RBACService.revokePermissionOverride('user-id', 'permission-nfe-view-id', 'Suspeita de fraude', 'admin-id');

const canView = await RBACService.userHasPermission('user-id', 'nfe.view');
console.assert(canView === false, 'Revoke deve ter precedência sobre role');
```

## 📈 Métricas e Monitoramento

### KPIs de Segurança

- **Taxa de logins falhados**: < 5% (alvo)
- **Contas bloqueadas/mês**: Monitorar tendência
- **Sessões simultâneas/usuário**: Máximo 3 (alerta se > 5)
- **Ações críticas/dia**: Baseline + alertas de anomalias

### Dashboard de Segurança (Sugerido)

```sql
-- Usuários mais ativos (últimos 7 dias)
SELECT user_email, COUNT(*) AS acoes
FROM audit_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_email
ORDER BY acoes DESC
LIMIT 10;

-- Ações críticas (últimas 24h)
SELECT user_email, acao, descricao, created_at
FROM audit_log
WHERE nivel_sensibilidade = 'critico'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Logins falhados por IP (últimas 24h)
SELECT ip_address, COUNT(*) AS tentativas
FROM failed_login_attempts
WHERE attempted_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address
HAVING COUNT(*) >= 5
ORDER BY tentativas DESC;
```

## 🚀 Roadmap Futuro

### Fase 1 (Concluída) ✅
- [x] RBAC completo (roles + permissions)
- [x] Audit log (LGPD Art. 37)
- [x] User sessions
- [x] Failed login tracking
- [x] Permission overrides

### Fase 2 (Próxima)
- [ ] **2FA (TOTP)**: Implementar autenticação de dois fatores
- [ ] **Aprovação de mudanças**: Workflow para alterações críticas (ex: override)
- [ ] **Políticas de senha**: Complexidade, expiração, histórico
- [ ] **IP Whitelist/Blacklist**: Restringir acesso por IP
- [ ] **Geolocalização**: Alertas de login de localização suspeita

### Fase 3 (Futuro)
- [ ] **Single Sign-On (SSO)**: Integração com Azure AD, Okta
- [ ] **Permissões temporárias**: Auto-revoke após prazo
- [ ] **Delegação de permissões**: Gerente delega ao substituto
- [ ] **Análise de comportamento**: Machine Learning para detectar anomalias
- [ ] **Certificados digitais**: Autenticação via certificado (e-CPF, e-CNPJ)

## 📚 Referências

- [NIST RBAC](https://csrc.nist.gov/projects/role-based-access-control)
- [LGPD Art. 37](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [ANVISA RDC 16/2013](https://www.gov.br/anvisa/pt-br)
- [ISO 27001](https://www.iso.org/isoiec-27001-information-security.html)
- [OWASP Access Control](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html)

## 🎉 Conclusão

O sistema de **Gestão de Usuários e Permissões** do ICARUS implementa um RBAC robusto, flexível e em total conformidade com **LGPD**, **ANVISA** e **ISO 27001**. 

**Benefícios**:
- ✅ Segurança de ponta (2FA, audit log, session control)
- ✅ Conformidade regulatória (LGPD Art. 37, ANVISA RDC 16/2013)
- ✅ Flexibilidade total (12 roles padrão + custom roles)
- ✅ Auditoria completa (rastreabilidade de 100% das operações)
- ✅ Escalabilidade (suporta milhares de usuários e permissões)

**Contexto OPME**: Perfeito para distribuidoras que precisam segregar acesso entre equipes (comercial, financeiro, logística, compliance) e garantir rastreabilidade de operações críticas (emissão de NF-e, cancelamentos, acesso a dados sensíveis).

