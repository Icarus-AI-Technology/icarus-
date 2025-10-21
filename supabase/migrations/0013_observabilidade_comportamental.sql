-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📊 MIGRAÇÃO 0013 — OBSERVABILIDADE & INTELIGÊNCIA COMPORTAMENTAL
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Data: 2025-10-20
-- Objetivo: Sistema completo de treinamento, análise comportamental e alertas
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Ativar extensão necessária para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 1. ATIVIDADES DE USUÁRIOS (LOG COMPLETO)
-- ============================================

CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  acao TEXT NOT NULL,
  modulo TEXT NOT NULL,
  sub_modulo TEXT,
  rota TEXT,
  metodo TEXT CHECK (metodo IN ('CREATE', 'READ', 'UPDATE', 'DELETE', 'NAVIGATE', 'SEARCH', 'EXPORT', 'IMPORT')),
  dados_entrada JSONB,
  dados_saida JSONB,
  tempo_execucao INTEGER,
  sucesso BOOLEAN DEFAULT true,
  erro_mensagem TEXT,
  erro_stack TEXT,
  ip_address INET,
  user_agent TEXT,
  dispositivo TEXT,
  localizacao TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activities_usuario ON user_activities(usuario_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_modulo ON user_activities(modulo);
CREATE INDEX IF NOT EXISTS idx_user_activities_criado ON user_activities(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_sucesso ON user_activities(sucesso) WHERE sucesso = false;

COMMENT ON TABLE user_activities IS 'Log completo de todas atividades dos usuários no sistema';

-- ============================================
-- 2. PERFIL COMPORTAMENTAL DO USUÁRIO
-- ============================================

CREATE TABLE IF NOT EXISTS user_behavior_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  modulos_mais_usados JSONB,
  acoes_mais_frequentes JSONB,
  horarios_ativos JSONB,
  dias_semana_ativos JSONB,
  tempo_medio_por_modulo JSONB,
  funcionalidades_dominadas TEXT[],
  funcionalidades_com_dificuldade TEXT[],
  taxa_erro_geral REAL DEFAULT 0,
  total_atividades INTEGER DEFAULT 0,
  total_erros INTEGER DEFAULT 0,
  ultima_atividade TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_behavior_usuario ON user_behavior_profile(usuario_id);

COMMENT ON TABLE user_behavior_profile IS 'Perfil comportamental agregado de cada usuário';

-- ============================================
-- 3. TRANSFERÊNCIA DE RESPONSABILIDADES
-- ============================================

CREATE TABLE IF NOT EXISTS user_handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_sainte_id UUID REFERENCES auth.users(id),
  usuario_substituto_id UUID REFERENCES auth.users(id),
  motivo TEXT NOT NULL CHECK (motivo IN ('ferias', 'licenca', 'demissao', 'transferencia', 'outro')),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  responsabilidades_transferidas TEXT[],
  modulos_transferidos TEXT[],
  instrucoes_especiais TEXT,
  documentacao_gerada_url TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handovers_sainte ON user_handovers(usuario_sainte_id);
CREATE INDEX IF NOT EXISTS idx_handovers_substituto ON user_handovers(usuario_substituto_id);
CREATE INDEX IF NOT EXISTS idx_handovers_status ON user_handovers(status);

COMMENT ON TABLE user_handovers IS 'Registro de transferências de responsabilidades entre usuários';

-- ============================================
-- 4. ERROS E ALERTAS
-- ============================================

CREATE TABLE IF NOT EXISTS system_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('erro_aplicacao', 'erro_validacao', 'erro_permissao', 'erro_rede', 'erro_banco', 'erro_integracao')),
  severidade TEXT NOT NULL CHECK (severidade IN ('baixa', 'media', 'alta', 'critica')),
  modulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  stack_trace TEXT,
  contexto JSONB,
  impacto TEXT,
  solucao_sugerida TEXT,
  notificado_admin BOOLEAN DEFAULT false,
  notificado_ceo BOOLEAN DEFAULT false,
  resolvido BOOLEAN DEFAULT false,
  resolvido_por UUID REFERENCES auth.users(id),
  resolvido_em TIMESTAMPTZ,
  notas_resolucao TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_errors_usuario ON system_errors(usuario_id);
CREATE INDEX IF NOT EXISTS idx_errors_severidade ON system_errors(severidade);
CREATE INDEX IF NOT EXISTS idx_errors_resolvido ON system_errors(resolvido) WHERE resolvido = false;
CREATE INDEX IF NOT EXISTS idx_errors_criado ON system_errors(criado_em DESC);

COMMENT ON TABLE system_errors IS 'Registro centralizado de todos erros do sistema';

-- ============================================
-- 5. ALERTAS E PREDIÇÕES
-- ============================================

CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('prazo_vencendo', 'erro_recorrente', 'comportamento_anomalo', 'performance_baixa', 'tentativa_acesso_nao_autorizado', 'predicao_erro', 'autocorrecao')),
  severidade TEXT NOT NULL CHECK (severidade IN ('info', 'atencao', 'urgente', 'critico')),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  usuario_afetado_id UUID REFERENCES auth.users(id),
  modulo TEXT,
  dados JSONB,
  acao_sugerida TEXT,
  destinatarios TEXT[] DEFAULT ARRAY['admin', 'ceo'],
  notificado BOOLEAN DEFAULT false,
  lido BOOLEAN DEFAULT false,
  resolvido BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_tipo ON system_alerts(tipo);
CREATE INDEX IF NOT EXISTS idx_alerts_severidade ON system_alerts(severidade);
CREATE INDEX IF NOT EXISTS idx_alerts_resolvido ON system_alerts(resolvido) WHERE resolvido = false;
CREATE INDEX IF NOT EXISTS idx_alerts_criado ON system_alerts(criado_em DESC);

COMMENT ON TABLE system_alerts IS 'Alertas inteligentes e predições do sistema';

-- ============================================
-- 6. TREINAMENTO E ONBOARDING
-- ============================================

CREATE TABLE IF NOT EXISTS user_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  modulo TEXT NOT NULL,
  licao TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('tutorial', 'video', 'documentacao', 'quiz', 'pratico')),
  concluido BOOLEAN DEFAULT false,
  pontuacao INTEGER,
  tempo_gasto INTEGER,
  tentativas INTEGER DEFAULT 0,
  ultima_tentativa TIMESTAMPTZ,
  concluido_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_usuario ON user_training(usuario_id);
CREATE INDEX IF NOT EXISTS idx_training_modulo ON user_training(modulo);
CREATE INDEX IF NOT EXISTS idx_training_concluido ON user_training(concluido);

COMMENT ON TABLE user_training IS 'Progresso de treinamento dos usuários';

-- ============================================
-- 7. HISTÓRICO DE SESSÕES
-- ============================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT,
  ip_address INET,
  user_agent TEXT,
  dispositivo TEXT,
  navegador TEXT,
  sistema_operacional TEXT,
  localizacao TEXT,
  duracao INTEGER,
  paginas_visitadas INTEGER DEFAULT 0,
  acoes_realizadas INTEGER DEFAULT 0,
  inicio_em TIMESTAMPTZ DEFAULT NOW(),
  termino_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_usuario ON user_sessions(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessions_inicio ON user_sessions(inicio_em DESC);

COMMENT ON TABLE user_sessions IS 'Histórico de sessões de usuários';

-- ============================================
-- 8. FUNÇÃO: ATUALIZAR PERFIL COMPORTAMENTAL
-- ============================================

CREATE OR REPLACE FUNCTION atualizar_perfil_comportamental()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_behavior_profile (
    usuario_id,
    total_atividades,
    total_erros,
    taxa_erro_geral,
    ultima_atividade
  )
  VALUES (
    NEW.usuario_id,
    1,
    CASE WHEN NEW.sucesso = false THEN 1 ELSE 0 END,
    CASE WHEN NEW.sucesso = false THEN 1.0 ELSE 0.0 END,
    NEW.criado_em
  )
  ON CONFLICT (usuario_id) DO UPDATE SET
    total_atividades = user_behavior_profile.total_atividades + 1,
    total_erros = user_behavior_profile.total_erros + CASE WHEN NEW.sucesso = false THEN 1 ELSE 0 END,
    taxa_erro_geral = (user_behavior_profile.total_erros::REAL + CASE WHEN NEW.sucesso = false THEN 1 ELSE 0 END::REAL) / 
                      (user_behavior_profile.total_atividades::REAL + 1),
    ultima_atividade = NEW.criado_em,
    atualizado_em = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_perfil ON user_activities;
CREATE TRIGGER trigger_atualizar_perfil
  AFTER INSERT ON user_activities
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_perfil_comportamental();

-- ============================================
-- 9. FUNÇÃO: CRIAR ALERTA DE ERRO CRÍTICO
-- ============================================

CREATE OR REPLACE FUNCTION criar_alerta_erro_critico()
RETURNS TRIGGER AS $$
DECLARE
  v_alert_severidade TEXT;
  v_titulo TEXT;
BEGIN
  IF NEW.severidade IN ('alta', 'critica') THEN
    v_alert_severidade := CASE 
      WHEN NEW.severidade = 'critica' THEN 'critico'
      WHEN NEW.severidade = 'alta' THEN 'urgente'
      ELSE 'atencao'
    END;
    
    v_titulo := 'Erro ' || NEW.severidade || ' detectado';
    
    INSERT INTO system_alerts (
      tipo,
      severidade,
      titulo,
      descricao,
      usuario_afetado_id,
      modulo,
      dados,
      acao_sugerida,
      destinatarios
    ) VALUES (
      'erro_recorrente',
      v_alert_severidade,
      v_titulo,
      NEW.mensagem,
      NEW.usuario_id,
      NEW.modulo,
      jsonb_build_object(
        'erro_id', NEW.id,
        'tipo', NEW.tipo,
        'stack_trace', NEW.stack_trace
      ),
      NEW.solucao_sugerida,
      CASE 
        WHEN NEW.severidade = 'critica' THEN ARRAY['admin', 'ceo', 'devops']
        ELSE ARRAY['admin']
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_alerta_erro ON system_errors;
CREATE TRIGGER trigger_alerta_erro
  AFTER INSERT ON system_errors
  FOR EACH ROW
  EXECUTE FUNCTION criar_alerta_erro_critico();

-- ============================================
-- 10. FUNÇÃO: BUSCAR ATIVIDADES DO USUÁRIO
-- ============================================

CREATE OR REPLACE FUNCTION buscar_atividades_usuario(
  p_usuario_email TEXT,
  p_dias_historico INTEGER DEFAULT 90
)
RETURNS TABLE (
  modulo TEXT,
  total_acoes BIGINT,
  acoes_unicas TEXT[],
  tempo_medio_ms NUMERIC,
  taxa_sucesso NUMERIC,
  periodo TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.modulo,
    COUNT(*) as total_acoes,
    array_agg(DISTINCT ua.acao) as acoes_unicas,
    ROUND(AVG(ua.tempo_execucao)::NUMERIC, 2) as tempo_medio_ms,
    ROUND((COUNT(*) FILTER (WHERE ua.sucesso = true)::NUMERIC / COUNT(*)::NUMERIC * 100), 2) as taxa_sucesso,
    ('Ultimos ' || p_dias_historico || ' dias')::TEXT as periodo
  FROM user_activities ua
  JOIN auth.users u ON u.id = ua.usuario_id
  WHERE u.email = p_usuario_email
    AND ua.criado_em >= NOW() - (p_dias_historico || ' days')::INTERVAL
  GROUP BY ua.modulo
  ORDER BY total_acoes DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION buscar_atividades_usuario IS 'Busca resumo de atividades de um usuario por email';

-- ============================================
-- 11. FUNÇÃO: COMPARAR USUÁRIOS (HANDOVER)
-- ============================================

CREATE OR REPLACE FUNCTION comparar_usuarios_handover(
  p_usuario_sainte_email TEXT,
  p_usuario_substituto_email TEXT
)
RETURNS TABLE (
  modulo TEXT,
  experiencia_sainte BIGINT,
  experiencia_substituto BIGINT,
  diferenca_experiencia BIGINT,
  precisa_treinamento BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH sainte_stats AS (
    SELECT ua.modulo, COUNT(*) as total
    FROM user_activities ua
    JOIN auth.users u ON u.id = ua.usuario_id
    WHERE u.email = p_usuario_sainte_email
      AND ua.criado_em >= NOW() - INTERVAL '90 days'
    GROUP BY ua.modulo
  ),
  substituto_stats AS (
    SELECT ua.modulo, COUNT(*) as total
    FROM user_activities ua
    JOIN auth.users u ON u.id = ua.usuario_id
    WHERE u.email = p_usuario_substituto_email
      AND ua.criado_em >= NOW() - INTERVAL '90 days'
    GROUP BY ua.modulo
  )
  SELECT 
    COALESCE(s.modulo, sub.modulo) as modulo,
    COALESCE(s.total, 0) as experiencia_sainte,
    COALESCE(sub.total, 0) as experiencia_substituto,
    COALESCE(s.total, 0) - COALESCE(sub.total, 0) as diferenca_experiencia,
    CASE 
      WHEN COALESCE(sub.total, 0) < (COALESCE(s.total, 0) * 0.3) THEN true
      ELSE false
    END as precisa_treinamento
  FROM sainte_stats s
  FULL OUTER JOIN substituto_stats sub ON s.modulo = sub.modulo
  ORDER BY COALESCE(s.total, 0) DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION comparar_usuarios_handover IS 'Compara experiencia entre usuario que sai e substituto';

-- ============================================
-- 12. FUNÇÃO: DETECTAR COMPORTAMENTO ANÔMALO
-- ============================================

CREATE OR REPLACE FUNCTION detectar_comportamento_anomalo()
RETURNS TABLE (
  usuario_id UUID,
  anomalia TEXT,
  detalhes TEXT,
  severidade TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ubp.usuario_id,
    'taxa_erro_alta'::TEXT as anomalia,
    'Taxa de erro de ' || ROUND((ubp.taxa_erro_geral * 100)::NUMERIC, 2)::TEXT || '% esta acima do normal' as detalhes,
    'atencao'::TEXT as severidade
  FROM user_behavior_profile ubp
  WHERE ubp.taxa_erro_geral > 0.3
    AND ubp.total_atividades > 10
  
  UNION ALL
  
  SELECT 
    ubp.usuario_id,
    'inatividade_prolongada'::TEXT as anomalia,
    'Sem atividade ha ' || EXTRACT(day FROM (NOW() - ubp.ultima_atividade))::INTEGER::TEXT || ' dias' as detalhes,
    'info'::TEXT as severidade
  FROM user_behavior_profile ubp
  WHERE ubp.ultima_atividade < NOW() - INTERVAL '7 days'
    AND ubp.total_atividades > 10;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION detectar_comportamento_anomalo IS 'Detecta padroes anomalos de comportamento';

-- ============================================
-- ✅ MIGRAÇÃO CONCLUÍDA
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
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
    );
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ MIGRACAO 0013 CONCLUIDA!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tabelas criadas: %', table_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Recursos implementados:';
  RAISE NOTICE '  ✅ Log completo de atividades';
  RAISE NOTICE '  ✅ Perfil comportamental';
  RAISE NOTICE '  ✅ Transferencia de responsabilidades';
  RAISE NOTICE '  ✅ Sistema de erros e alertas';
  RAISE NOTICE '  ✅ Alertas inteligentes e predicoes';
  RAISE NOTICE '  ✅ Sistema de treinamento';
  RAISE NOTICE '  ✅ Historico de sessoes';
  RAISE NOTICE '  ✅ Funcoes de analise comportamental';
  RAISE NOTICE '  ✅ Triggers automaticos';
  RAISE NOTICE '';
  RAISE NOTICE '🤖 Pronto para IA comportamental!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
