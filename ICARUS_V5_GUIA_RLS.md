# 🔒 Guia de Revisão - Migração RLS (Row Level Security)

**Arquivo**: `supabase/migrations/20251027013614_enable_rls_critical_tables.sql`  
**Data**: 27 de Outubro de 2025  
**Tabelas**: 20 tabelas críticas

---

## 📋 Checklist de Revisão

### ✅ 1. Estrutura da Migração

- ✅ RLS habilitado para cada tabela
- ✅ 4 políticas por tabela (SELECT, INSERT, UPDATE, DELETE)
- ✅ Índices criados para performance
- ✅ Comentários descritivos

### 🔍 2. Políticas Implementadas

#### SELECT Policy (Leitura)

```sql
-- Usuários podem ler:
-- 1. Suas próprias linhas (user_id = auth.uid())
-- 2. Linhas que criaram (created_by = auth.uid())
-- 3. Admins/Super_admins podem ler tudo
```

#### INSERT Policy (Criação)

```sql
-- Usuários autenticados podem inserir
-- Verificação: user_id ou created_by = auth.uid()
```

#### UPDATE Policy (Atualização)

```sql
-- Usuários podem atualizar suas próprias linhas
-- Admins podem atualizar qualquer linha
```

#### DELETE Policy (Exclusão)

```sql
-- APENAS admins e super_admins podem deletar
```

---

## ⚠️ Ajustes Necessários

### 1. Verificar Colunas de Controle

As políticas assumem que as tabelas têm as colunas:

- `user_id` - ID do usuário dono do registro
- `created_by` - ID do usuário que criou

**Ação**: Verificar se todas as tabelas têm essas colunas ou ajustar as políticas.

### 2. Tabelas com Estrutura Diferente

Algumas tabelas podem ter estrutura diferente:

```sql
-- Se a tabela usa 'medico_id' em vez de 'user_id':
CREATE POLICY "nome_policy"
  USING (auth.uid() = medico_id) -- Ajustar aqui
```

### 3. Regras de Negócio Específicas

**Exemplos de ajustes necessários**:

#### Pacientes

- Pacientes devem ser visíveis apenas para:
  - Médicos autorizados
  - Equipe do hospital
  - O próprio paciente (se tiver login)

```sql
-- Ajuste sugerido para pacientes:
CREATE POLICY "pacientes_select_policy"
  ON public.pacientes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT medico_id FROM medico_paciente
      WHERE paciente_id = pacientes.id
    )
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND role IN ('admin', 'enfermeiro')
    )
  );
```

#### Transações Financeiras

- Apenas financeiro e admins

```sql
CREATE POLICY "transacoes_select_policy"
  ON public.transacoes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND role IN ('admin', 'financeiro', 'super_admin')
    )
  );
```

#### Cirurgias

- Médico responsável + equipe cirúrgica + admins

```sql
CREATE POLICY "cirurgias_select_policy"
  ON public.cirurgias
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = medico_id
    OR auth.uid() IN (
      SELECT usuario_id FROM equipe_cirurgica
      WHERE cirurgia_id = cirurgias.id
    )
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 🧪 Testes Recomendados

### 1. Teste com Usuário Normal

```sql
-- Login como usuário normal
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO 'user-uuid-here';

-- Deve ver apenas seus próprios registros
SELECT * FROM usuarios;
```

### 2. Teste com Admin

```sql
-- Login como admin
SET LOCAL request.jwt.claim.sub TO 'admin-uuid-here';

-- Deve ver todos os registros
SELECT * FROM usuarios;
```

### 3. Teste de INSERT

```sql
-- Tentar inserir registro de outro usuário
INSERT INTO pacientes (nome, user_id)
VALUES ('Teste', 'outro-user-id');
-- Deve falhar
```

### 4. Teste de DELETE

```sql
-- Usuário normal tenta deletar
DELETE FROM cirurgias WHERE id = 'any-id';
-- Deve falhar (apenas admins)
```

---

## 📝 Comandos para Aplicar

### 1. Backup Antes de Aplicar

```bash
# Fazer backup do banco
supabase db dump > backup_before_rls_$(date +%Y%m%d).sql
```

### 2. Aplicar em Desenvolvimento (Local)

```bash
# Aplicar migração localmente primeiro
supabase migration up

# Ou se usar db push
supabase db push
```

### 3. Testar Localmente

```bash
# Executar testes
npm run test:e2e

# Testar acesso com diferentes usuários
# (usar interface ou scripts)
```

### 4. Aplicar em Produção

```bash
# APÓS TESTES E APROVAÇÃO
supabase db push --project-ref <seu-projeto-id>

# Ou via dashboard Supabase
# SQL Editor → Colar migração → Run
```

---

## 🚨 Checklist Pré-Aplicação

- [ ] ✅ Backup do banco de dados criado
- [ ] 📝 Políticas revisadas e ajustadas
- [ ] 🔍 Colunas user_id/created_by verificadas
- [ ] 🧪 Testado localmente
- [ ] 👥 Testado com diferentes tipos de usuários
- [ ] 📊 Performance verificada (índices)
- [ ] 🔔 Equipe notificada sobre a mudança
- [ ] 📖 Documentação atualizada
- [ ] ⏰ Janela de manutenção agendada
- [ ] 🔄 Plano de rollback preparado

---

## 🔄 Plano de Rollback

Se algo der errado:

```sql
-- Desabilitar RLS (EMERGÊNCIA)
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos DISABLE ROW LEVEL SECURITY;
-- ... para todas as tabelas

-- Ou restaurar backup
psql < backup_before_rls_YYYYMMDD.sql
```

---

## 📊 Monitoramento Pós-Aplicação

### Métricas para Observar:

1. **Tempo de resposta** das queries
2. **Erros de permissão** nos logs
3. **Usuários bloqueados** incorretamente
4. **Performance** das políticas RLS

### Logs do Supabase:

```bash
# Ver logs de acesso negado
supabase logs --type database | grep "permission denied"

# Ver queries lentas
supabase logs --type database | grep "slow query"
```

---

## 💡 Dicas de Performance

### 1. Índices nas Colunas de RLS

✅ Já incluído na migração:

```sql
CREATE INDEX idx_usuarios_user_id ON public.usuarios(user_id);
CREATE INDEX idx_usuarios_created_by ON public.usuarios(created_by);
```

### 2. Evitar Subqueries Pesadas

Se uma política fica lenta, considerar:

- Views materializadas
- Tabelas de cache
- Desnormalização controlada

### 3. Monitorar Query Plan

```sql
EXPLAIN ANALYZE
SELECT * FROM usuarios
WHERE user_id = current_setting('request.jwt.claim.sub')::uuid;
```

---

## 📚 Recursos Adicionais

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)

---

## ✅ Próximos Passos

1. **Revisar políticas** específicas de cada tabela
2. **Ajustar regras de negócio** conforme necessário
3. **Testar localmente** com diferentes usuários
4. **Aplicar em staging** (se disponível)
5. **Aplicar em produção** com monitoramento
6. **Documentar** mudanças e comportamentos

---

**Status**: ✅ Pronto para revisão  
**Aprovação necessária**: Sim (antes de aplicar em produção)  
**Risco**: Médio (pode bloquear acessos se mal configurado)  
**Impacto**: Alto (segurança de dados)
