# 🧪 Testes do Sistema de Observabilidade

## Script SQL para Testar no Supabase Dashboard

Execute os comandos abaixo no **SQL Editor** do Supabase:

### 1️⃣ Verificar Tabelas Criadas

```sql
-- Verificar se todas as 7 tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_activities',
  'user_behavior_profile',
  'user_handovers',
  'system_errors',
  'system_alerts',
  'user_training',
  'user_sessions'
)
ORDER BY table_name;

-- Resultado esperado: 7 tabelas
```

### 2️⃣ Verificar Funções SQL

```sql
-- Verificar se as 5 funções foram criadas
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'atualizar_perfil_comportamental',
  'criar_alerta_erro_critico',
  'buscar_atividades_usuario',
  'comparar_usuarios_handover',
  'detectar_comportamento_anomalo'
)
ORDER BY routine_name;

-- Resultado esperado: 5 funções
```

### 3️⃣ Verificar Triggers

```sql
-- Verificar se os 2 triggers foram criados
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN (
  'trigger_atualizar_perfil',
  'trigger_alerta_erro'
)
ORDER BY trigger_name;

-- Resultado esperado: 2 triggers
```

### 4️⃣ Inserir Atividade de Teste

```sql
-- Inserir uma atividade de teste
INSERT INTO user_activities (
  usuario_id,
  acao,
  modulo,
  metodo,
  sucesso
) VALUES (
  (SELECT auth.uid()), -- Seu ID de usuário
  'teste_sistema',
  'observabilidade',
  'CREATE',
  true
);

-- Verificar se foi inserida
SELECT * FROM user_activities 
ORDER BY criado_em DESC 
LIMIT 1;
```

### 5️⃣ Verificar Perfil Comportamental (Trigger Automático)

```sql
-- Verificar se o perfil foi atualizado automaticamente
SELECT * FROM user_behavior_profile 
WHERE usuario_id = (SELECT auth.uid());

-- Deve mostrar:
-- - total_atividades: 1
-- - total_erros: 0
-- - taxa_erro_geral: 0
-- - modulos_mais_usados: {"observabilidade": 1}
```

### 6️⃣ Inserir Erro Crítico (Testa Trigger de Alerta)

```sql
-- Inserir um erro crítico
INSERT INTO system_errors (
  usuario_id,
  tipo,
  severidade,
  modulo,
  mensagem
) VALUES (
  (SELECT auth.uid()),
  'erro_aplicacao',
  'critica',
  'teste',
  'Erro de teste para validar trigger de alertas'
);

-- Verificar se o alerta foi criado automaticamente
SELECT * FROM system_alerts 
WHERE tipo = 'erro_recorrente'
ORDER BY criado_em DESC 
LIMIT 1;

-- Deve ter criado um alerta automaticamente!
```

### 7️⃣ Buscar Atividades de Usuário

```sql
-- Buscar atividades do usuário atual (últimos 30 dias)
SELECT * FROM buscar_atividades_usuario(
  (SELECT email FROM auth.users WHERE id = auth.uid()),
  30
);

-- Resultado esperado:
-- - modulo: 'observabilidade' ou 'teste'
-- - total_acoes: >= 1
-- - taxa_sucesso: 100 (se não houve erros)
```

### 8️⃣ Detectar Comportamentos Anômalos

```sql
-- Detectar usuários com comportamento anômalo
SELECT * FROM detectar_comportamento_anomalo();

-- Se você tiver taxa de erro > 30% ou inatividade > 7 dias,
-- o sistema detectará automaticamente
```

### 9️⃣ Comparar Usuários para Handover

```sql
-- Primeiro, vamos criar um segundo usuário fictício para teste
INSERT INTO user_activities (
  usuario_id,
  acao,
  modulo,
  metodo,
  sucesso
) VALUES (
  gen_random_uuid(), -- ID fictício
  'teste_usuario_2',
  'cadastros',
  'READ',
  true
);

-- Agora comparar dois usuários (substitua pelos emails reais)
SELECT * FROM comparar_usuarios_handover(
  'usuario1@empresa.com',
  'usuario2@empresa.com'
);

-- Resultado:
-- - Lista de módulos com diferença de experiência
-- - precisa_treinamento: true/false
```

### 🔟 Consulta Completa de Métricas

```sql
-- Estatísticas gerais do sistema
SELECT 
  COUNT(DISTINCT usuario_id) as total_usuarios,
  COUNT(*) as total_atividades,
  SUM(CASE WHEN sucesso = false THEN 1 ELSE 0 END) as total_erros,
  ROUND(
    (SUM(CASE WHEN sucesso = false THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100,
    2
  ) as taxa_erro_percentual
FROM user_activities;

-- Alertas pendentes
SELECT 
  severidade,
  COUNT(*) as total
FROM system_alerts
WHERE resolvido = false
GROUP BY severidade
ORDER BY 
  CASE severidade
    WHEN 'critico' THEN 1
    WHEN 'urgente' THEN 2
    WHEN 'atencao' THEN 3
    ELSE 4
  END;

-- Top 5 módulos mais usados
SELECT 
  modulo,
  COUNT(*) as total_acessos,
  ROUND(AVG(tempo_execucao), 2) as tempo_medio_ms
FROM user_activities
WHERE tempo_execucao IS NOT NULL
GROUP BY modulo
ORDER BY total_acessos DESC
LIMIT 5;
```

---

## 🎯 Testes Frontend

### 1. Testar Rastreamento de Navegação

1. Abra o navegador: `http://localhost:5173/`
2. Navegue entre páginas:
   - `/dashboard`
   - `/cadastros`
   - `/compras`
3. No Supabase, execute:

```sql
SELECT modulo, sub_modulo, COUNT(*) as total
FROM user_activities
WHERE acao = 'visualizar_pagina'
GROUP BY modulo, sub_modulo
ORDER BY total DESC;
```

**Resultado esperado:** Ver registros de cada página visitada

### 2. Testar CRUD com Rastreamento

1. Vá para `/cadastros/medicos`
2. Cadastre um novo médico
3. Execute no Supabase:

```sql
SELECT acao, modulo, sucesso, dados_entrada
FROM user_activities
WHERE modulo = 'cadastros/medicos'
ORDER BY criado_em DESC
LIMIT 5;
```

**Resultado esperado:** Ver registro de CREATE com dados do médico

### 3. Testar Chatbot - Consulta de Atividades

1. Abra o chatbot (ícone flutuante)
2. Digite: "O que eu fiz no sistema?"
3. Deve mostrar suas atividades recentes
4. Digite: "Comparar [usuário1] com [usuário2]"
5. Deve mostrar análise para handover

### 4. Testar Dashboard de Observabilidade

1. Acesse: `http://localhost:5173/observability/dashboard`
2. Deve mostrar:
   - Cards com estatísticas (usuários ativos, alertas, anomalias)
   - Lista de perfis comportamentais
   - Alertas pendentes
   - Anomalias detectadas
3. Clique em "Resolver" em um alerta
4. Deve sumir da lista

### 5. Testar Notificações em Tempo Real

1. Abra o navegador em duas abas
2. Na **Aba 1**: Mantenha aberta em qualquer página
3. Na **Aba 2**: Execute no Supabase:

```sql
INSERT INTO system_alerts (
  tipo,
  severidade,
  titulo,
  descricao,
  destinatarios
) VALUES (
  'teste',
  'urgente',
  'Teste de Notificação',
  'Esta é uma notificação de teste em tempo real',
  ARRAY['admin', 'user']
);
```

4. Na **Aba 1**: Deve aparecer notificação automaticamente no sino 🔔

### 6. Testar Relatórios de Treinamento

1. Acesse: `http://localhost:5173/training/reports`
2. Deve mostrar:
   - Estatísticas gerais (total de lições, concluídas, pontuação)
   - Progresso por módulo
   - Atividade recente

---

## 🐛 Troubleshooting

### Erro: "column does not exist"
- **Causa:** Migração não foi aplicada corretamente
- **Solução:** Reaplique `0013_observabilidade_comportamental.sql`

### Notificações não aparecem
- **Causa:** Realtime não habilitado ou permissão negada
- **Solução 1:** Habilitar Realtime no Supabase Dashboard
- **Solução 2:** Permitir notificações no navegador

### Perfil não atualiza
- **Causa:** Trigger desabilitado
- **Solução:** Verificar se trigger existe:

```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_atualizar_perfil';
```

### Alertas não são criados
- **Causa:** Trigger de alertas não funciona
- **Solução:** Recriar trigger:

```sql
DROP TRIGGER IF EXISTS trigger_alerta_erro ON system_errors;

CREATE TRIGGER trigger_alerta_erro
  AFTER INSERT ON system_errors
  FOR EACH ROW
  WHEN (NEW.severidade IN ('alta', 'critica'))
  EXECUTE FUNCTION criar_alerta_erro_critico();
```

---

## ✅ Checklist de Validação

- [ ] 7 tabelas criadas no Supabase
- [ ] 5 funções SQL funcionando
- [ ] 2 triggers automáticos ativos
- [ ] Atividades sendo registradas automaticamente
- [ ] Perfil comportamental atualizando
- [ ] Alertas sendo criados para erros críticos
- [ ] Chatbot respondendo "O que [usuário] fez?"
- [ ] Dashboard de observabilidade carregando dados
- [ ] Notificações em tempo real funcionando
- [ ] Relatórios de treinamento exibindo progresso

---

## 📊 Métricas de Sucesso

Após 1 semana de uso, você deve ter:

1. **Rastreamento:**
   - Pelo menos 100 atividades registradas
   - Média de 10-20 atividades por usuário/dia

2. **Perfis:**
   - Perfil comportamental para cada usuário
   - Taxa de erro geral < 10%

3. **Alertas:**
   - 0-5 alertas pendentes (idealmente 0)
   - Tempo médio de resolução < 24h

4. **Treinamento:**
   - Pelo menos 1 módulo por usuário iniciado
   - Taxa de conclusão > 50%

---

**Versão:** 1.0  
**Data:** 2025-10-21  
**Status:** ✅ Pronto para testes

