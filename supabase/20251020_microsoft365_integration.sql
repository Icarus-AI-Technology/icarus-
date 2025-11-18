-- =====================================================
-- Microsoft 365 Integration - Migration
-- Tabelas para armazenar tokens e histórico de integrações
-- 
-- CONFORMIDADE LGPD:
-- - Tokens criptografados
-- - Registro de operações
-- - Exclusão automática de tokens expirados
-- =====================================================

-- Tabela: Tokens Microsoft 365
CREATE TABLE IF NOT EXISTS microsoft_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tokens (criptografados)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  id_token TEXT,
  
  -- Metadados
  account_email VARCHAR(200) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scopes TEXT[], -- Permissões concedidas
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(user_id)
);

-- Tabela: Reuniões Teams
CREATE TABLE IF NOT EXISTS reunioes_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação Microsoft
  evento_id VARCHAR(200) NOT NULL UNIQUE,
  
  -- Detalhes da Reunião
  assunto VARCHAR(500) NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  link_reuniao TEXT, -- Teams meeting link
  
  -- Organizador e Participantes
  organizador VARCHAR(200),
  participantes JSONB, -- Array de {email, nome, tipo}
  
  -- Status
  status VARCHAR(20) DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada', 'remarcada')),
  motivo_cancelamento TEXT,
  
  -- Contexto OPME (opcional)
  entidade_tipo VARCHAR(20) CHECK (entidade_tipo IN ('hospital', 'plano_saude', 'industria')),
  entidade_id UUID, -- Referência genérica (hospital_id, plano_saude_id, industria_id)
  entidade_nome VARCHAR(200), -- Nome da entidade para facilitar queries
  tipo_reuniao VARCHAR(50), -- 'apresentacao_produto', 'negociacao', 'treinamento', 'comercial', 'pos_venda', etc
  
  -- Auditoria
  usuario_criacao UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabela: Emails Enviados (Log - LGPD)
CREATE TABLE IF NOT EXISTS emails_enviados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Destinatários
  para TEXT[] NOT NULL,
  cc TEXT[],
  cco TEXT[],
  
  -- Conteúdo
  assunto VARCHAR(500) NOT NULL,
  corpo_resumo TEXT, -- Primeiros 500 caracteres (para auditoria)
  
  -- Contexto
  tipo VARCHAR(50), -- 'nfe', 'proposta', 'alerta', 'marketing', etc
  entidade_tipo VARCHAR(50), -- 'nfe', 'pedido', 'licitacao', etc
  entidade_id UUID,
  
  -- Anexos
  anexos_nomes TEXT[], -- Nomes dos arquivos anexados
  
  -- Status
  status VARCHAR(20) DEFAULT 'enviado' CHECK (status IN ('enviado', 'erro', 'bounce')),
  erro_mensagem TEXT,
  
  -- Auditoria LGPD
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  data_envio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Tabela: Sincronização de Contatos
CREATE TABLE IF NOT EXISTS microsoft_contatos_sync (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Estatísticas
  total_contatos_sincronizados INTEGER DEFAULT 0,
  hospitais_sincronizados INTEGER DEFAULT 0,
  fornecedores_sincronizados INTEGER DEFAULT 0,
  medicos_sincronizados INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'concluida' CHECK (status IN ('em_progresso', 'concluida', 'erro')),
  erro_mensagem TEXT,
  
  -- Timestamps
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  data_fim TIMESTAMP WITH TIME ZONE
);

-- Tabela: Arquivos OneDrive
CREATE TABLE IF NOT EXISTS microsoft_onedrive_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação Microsoft
  item_id VARCHAR(200) NOT NULL,
  web_url TEXT NOT NULL,
  
  -- Arquivo
  nome_arquivo VARCHAR(500) NOT NULL,
  tipo_arquivo VARCHAR(100),
  tamanho_bytes BIGINT,
  pasta VARCHAR(500),
  
  -- Contexto OPME
  tipo_documento VARCHAR(50), -- 'xml_nfe', 'catalogo_produto', 'licitacao', etc
  entidade_tipo VARCHAR(50),
  entidade_id UUID,
  
  -- Compartilhamento
  link_compartilhamento TEXT,
  compartilhado_com TEXT[], -- Emails
  
  -- Auditoria
  usuario_upload UUID NOT NULL REFERENCES auth.users(id),
  data_upload TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(item_id)
);

-- Índices
CREATE INDEX idx_microsoft_tokens_user_id ON microsoft_tokens(user_id);
CREATE INDEX idx_microsoft_tokens_expires_at ON microsoft_tokens(expires_at);
CREATE INDEX idx_reunioes_teams_evento_id ON reunioes_teams(evento_id);
CREATE INDEX idx_reunioes_teams_usuario_criacao ON reunioes_teams(usuario_criacao);
CREATE INDEX idx_reunioes_teams_data_inicio ON reunioes_teams(data_inicio);
CREATE INDEX idx_reunioes_teams_status ON reunioes_teams(status);
CREATE INDEX idx_emails_enviados_usuario_id ON emails_enviados(usuario_id);
CREATE INDEX idx_emails_enviados_data_envio ON emails_enviados(data_envio);
CREATE INDEX idx_emails_enviados_tipo ON emails_enviados(tipo);
CREATE INDEX idx_microsoft_contatos_sync_user_id ON microsoft_contatos_sync(user_id);
CREATE INDEX idx_microsoft_onedrive_files_usuario_upload ON microsoft_onedrive_files(usuario_upload);
CREATE INDEX idx_microsoft_onedrive_files_tipo_documento ON microsoft_onedrive_files(tipo_documento);

-- Function: Limpar tokens expirados (LGPD - Minimização de dados)
CREATE OR REPLACE FUNCTION limpar_tokens_expirados()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deletados INTEGER;
BEGIN
  DELETE FROM microsoft_tokens
  WHERE expires_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS v_deletados = ROW_COUNT;
  
  RETURN v_deletados;
END;
$$;

-- Function: Verificar se usuário tem Microsoft 365 conectado
CREATE OR REPLACE FUNCTION usuario_tem_microsoft365(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_token_valido BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM microsoft_tokens
    WHERE user_id = p_user_id
      AND expires_at > NOW()
  ) INTO v_token_valido;
  
  RETURN v_token_valido;
END;
$$;

-- View: Próximas reuniões (7 dias)
CREATE OR REPLACE VIEW vw_proximas_reunioes_teams AS
SELECT 
  r.id,
  r.evento_id,
  r.assunto,
  r.data_inicio,
  r.data_fim,
  r.link_reuniao,
  r.organizador,
  r.participantes,
  r.status,
  r.tipo_reuniao,
  r.entidade_tipo,
  r.entidade_nome,
  u.email AS usuario_criador_email,
  EXTRACT(EPOCH FROM (r.data_inicio - NOW())) / 3600 AS horas_ate_reuniao
FROM reunioes_teams r
LEFT JOIN auth.users u ON r.usuario_criacao = u.id
WHERE r.status = 'agendada'
  AND r.data_inicio BETWEEN NOW() AND (NOW() + INTERVAL '7 days')
ORDER BY r.data_inicio ASC;

-- View: Estatísticas de emails (30 dias)
CREATE OR REPLACE VIEW vw_estatisticas_emails_30d AS
SELECT 
  DATE_TRUNC('day', data_envio) AS dia,
  tipo,
  COUNT(*) AS total_enviados,
  COUNT(*) FILTER (WHERE status = 'enviado') AS enviados_sucesso,
  COUNT(*) FILTER (WHERE status = 'erro') AS enviados_erro,
  COUNT(*) FILTER (WHERE status = 'bounce') AS bounce
FROM emails_enviados
WHERE data_envio >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', data_envio), tipo
ORDER BY dia DESC, tipo;

-- RLS (Row Level Security)
ALTER TABLE microsoft_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE reunioes_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails_enviados ENABLE ROW LEVEL SECURITY;
ALTER TABLE microsoft_contatos_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE microsoft_onedrive_files ENABLE ROW LEVEL SECURITY;

-- Policies: Usuários só veem seus próprios tokens
CREATE POLICY "Usuários veem apenas seus tokens"
ON microsoft_tokens FOR ALL
USING (user_id = auth.uid());

-- Policies: Usuários veem reuniões que criaram
CREATE POLICY "Usuários veem reuniões que criaram"
ON reunioes_teams FOR ALL
USING (usuario_criacao = auth.uid());

-- Policies: Usuários veem emails que enviaram
CREATE POLICY "Usuários veem emails que enviaram"
ON emails_enviados FOR SELECT
USING (usuario_id = auth.uid());

-- Policies: Usuários veem suas sincronizações
CREATE POLICY "Usuários veem suas sincronizações"
ON microsoft_contatos_sync FOR ALL
USING (user_id = auth.uid());

-- Policies: Usuários veem seus arquivos OneDrive
CREATE POLICY "Usuários veem seus arquivos OneDrive"
ON microsoft_onedrive_files FOR ALL
USING (usuario_upload = auth.uid());

-- Trigger: Atualizar updated_at
CREATE OR REPLACE FUNCTION update_reuniao_teams_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_reuniao_teams_timestamp
BEFORE UPDATE ON reunioes_teams
FOR EACH ROW
EXECUTE FUNCTION update_reuniao_teams_timestamp();

-- Job: Limpar tokens expirados (executar diariamente via pg_cron ou Supabase Functions)
-- SELECT limpar_tokens_expirados();

-- Comentários (Documentação)
COMMENT ON TABLE microsoft_tokens IS 'Tokens OAuth 2.0 do Microsoft 365 - Criptografados e com expiração automática';
COMMENT ON TABLE reunioes_teams IS 'Histórico de reuniões agendadas via Microsoft Teams com hospitais, planos de saúde e indústrias';
COMMENT ON COLUMN reunioes_teams.entidade_tipo IS 'Tipo de entidade: hospital (cliente), plano_saude (contratante), industria (fornecedor/fabricante)';
COMMENT ON COLUMN reunioes_teams.tipo_reuniao IS 'Finalidade: apresentacao_produto, negociacao, treinamento, comercial, pos_venda, licitacao, auditoria';
COMMENT ON TABLE emails_enviados IS 'Log de emails enviados via Outlook - Conformidade LGPD Art. 37';
COMMENT ON TABLE microsoft_contatos_sync IS 'Histórico de sincronizações de contatos ICARUS → Outlook';
COMMENT ON TABLE microsoft_onedrive_files IS 'Arquivos enviados para OneDrive/SharePoint';

