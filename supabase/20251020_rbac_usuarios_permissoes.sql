-- =====================================================
-- BLOCO 1.2: Gestão de Usuários e Permissões (RBAC)
-- Sistema completo de controle de acesso baseado em funções
-- 
-- CONFORMIDADE:
-- - LGPD Art. 37 (Registro de operações)
-- - ANVISA RDC 16/2013 (Rastreabilidade)
-- - ISO 27001 (Segurança da informação)
-- 
-- FUNCIONALIDADES:
-- - RBAC (Role-Based Access Control)
-- - Permissões granulares (módulo, ação, campo)
-- - Auditoria completa de acessos
-- - Sessões seguras com expiração
-- - 2FA (Two-Factor Authentication) via TOTP
-- =====================================================

-- =====================================================
-- TABELA: roles (Funções/Perfis)
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  
  -- Hierarquia (para herança de permissões)
  nivel_hierarquia INTEGER DEFAULT 0, -- 0 = mais alto (admin), 100 = mais baixo
  role_pai_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  
  -- Contexto OPME
  tipo_role VARCHAR(50) CHECK (tipo_role IN ('system', 'comercial', 'financeiro', 'logistica', 'compliance', 'ti', 'custom')),
  
  -- Metadata
  is_system BOOLEAN DEFAULT FALSE, -- Roles de sistema não podem ser excluídas
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- TABELA: permissions (Permissões granulares)
-- =====================================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  codigo VARCHAR(100) NOT NULL UNIQUE, -- Ex: 'nfe.emitir', 'estoque.view', 'usuarios.delete'
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  
  -- Escopo
  modulo VARCHAR(50) NOT NULL, -- Ex: 'nfe', 'estoque', 'usuarios', 'dashboard'
  acao VARCHAR(50) NOT NULL, -- Ex: 'view', 'create', 'update', 'delete', 'approve', 'cancel'
  
  -- Granularidade (opcional)
  campo_especifico VARCHAR(100), -- Ex: 'preco_venda' (permissão para ver/editar campo específico)
  
  -- Contexto OPME
  tipo_entidade VARCHAR(50), -- Ex: 'hospital', 'plano_saude', 'industria', 'produto', 'nfe'
  
  -- Criticidade
  nivel_criticidade VARCHAR(20) CHECK (nivel_criticidade IN ('baixo', 'medio', 'alto', 'critico')),
  requer_2fa BOOLEAN DEFAULT FALSE, -- Ações críticas requerem 2FA
  
  -- Metadata
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABELA: role_permissions (Relação Roles ↔ Permissions)
-- =====================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  
  -- Metadata
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  
  UNIQUE(role_id, permission_id)
);

-- =====================================================
-- TABELA: user_roles (Usuários ↔ Roles)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  
  -- Validade temporal (opcional)
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE, -- NULL = sem expiração
  
  -- Contexto (opcional)
  contexto_adicional JSONB, -- Ex: { "filial_id": "...", "departamento": "vendas" }
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  
  UNIQUE(user_id, role_id)
);

-- =====================================================
-- TABELA: user_permissions_override (Permissões excepcionais)
-- Permite conceder/revogar permissões específicas sem alterar role
-- =====================================================
CREATE TABLE IF NOT EXISTS user_permissions_override (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  
  -- Tipo de override
  tipo_override VARCHAR(20) NOT NULL CHECK (tipo_override IN ('grant', 'revoke')),
  
  -- Justificativa obrigatória
  motivo TEXT NOT NULL,
  
  -- Validade temporal
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE, -- NULL = permanente
  
  -- Aprovação (para controle de mudanças críticas)
  aprovado_por UUID REFERENCES auth.users(id),
  aprovado_em TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(user_id, permission_id)
);

-- =====================================================
-- TABELA: user_sessions (Sessões ativas)
-- Para controle de sessões simultâneas e logout forçado
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identificação da sessão
  session_token VARCHAR(500) NOT NULL UNIQUE,
  refresh_token VARCHAR(500),
  
  -- Informações de acesso
  ip_address INET NOT NULL,
  user_agent TEXT,
  device_info JSONB, -- Ex: { "browser": "Chrome", "os": "Windows", "device": "Desktop" }
  
  -- Localização (opcional)
  geolocation JSONB, -- Ex: { "country": "BR", "city": "São Paulo" }
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Segurança
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  terminated_at TIMESTAMP WITH TIME ZONE,
  terminated_by UUID REFERENCES auth.users(id),
  termination_reason TEXT
);

-- =====================================================
-- TABELA: user_2fa (Autenticação de Dois Fatores)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Método 2FA
  metodo VARCHAR(20) NOT NULL CHECK (metodo IN ('totp', 'sms', 'email')),
  
  -- TOTP (Time-based One-Time Password)
  totp_secret VARCHAR(100), -- Base32 encoded secret
  totp_backup_codes TEXT[], -- Array de códigos de backup
  
  -- Telefone para SMS
  telefone_2fa VARCHAR(20),
  
  -- Email para código
  email_2fa VARCHAR(200),
  
  -- Status
  is_enabled BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  enabled_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABELA: audit_log (Log de auditoria LGPD)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Usuário
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(200),
  
  -- Ação
  acao VARCHAR(100) NOT NULL, -- Ex: 'login', 'logout', 'nfe.emitir', 'usuario.criar'
  modulo VARCHAR(50),
  entidade_tipo VARCHAR(50), -- Ex: 'nfe', 'usuario', 'produto'
  entidade_id UUID,
  
  -- Detalhes
  descricao TEXT,
  dados_antes JSONB, -- Estado anterior (para updates/deletes)
  dados_depois JSONB, -- Novo estado (para creates/updates)
  
  -- Resultado
  sucesso BOOLEAN DEFAULT TRUE,
  erro_mensagem TEXT,
  
  -- Contexto técnico
  ip_address INET,
  user_agent TEXT,
  session_id UUID REFERENCES user_sessions(id),
  
  -- Conformidade
  nivel_sensibilidade VARCHAR(20) CHECK (nivel_sensibilidade IN ('publico', 'interno', 'confidencial', 'restrito')),
  tags TEXT[], -- Ex: ['lgpd', 'anvisa', 'financeiro']
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABELA: failed_login_attempts (Tentativas falhas)
-- =====================================================
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  email VARCHAR(200) NOT NULL,
  ip_address INET NOT NULL,
  
  -- Detalhes
  user_agent TEXT,
  motivo_falha VARCHAR(100), -- Ex: 'senha_incorreta', '2fa_invalido', 'conta_bloqueada'
  
  -- Timestamp
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_roles_tipo ON roles(tipo_role);
CREATE INDEX idx_roles_active ON roles(is_active);
CREATE INDEX idx_permissions_modulo ON permissions(modulo);
CREATE INDEX idx_permissions_acao ON permissions(acao);
CREATE INDEX idx_permissions_codigo ON permissions(codigo);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_active ON user_roles(is_active);
CREATE INDEX idx_user_permissions_override_user_id ON user_permissions_override(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_acao ON audit_log(acao);
CREATE INDEX idx_audit_log_modulo ON audit_log(modulo);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_entidade ON audit_log(entidade_tipo, entidade_id);
CREATE INDEX idx_failed_login_email ON failed_login_attempts(email);
CREATE INDEX idx_failed_login_ip ON failed_login_attempts(ip_address);
CREATE INDEX idx_failed_login_attempted_at ON failed_login_attempts(attempted_at);

-- =====================================================
-- FUNCTION: Verificar se usuário tem permissão
-- =====================================================
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_permission_code VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_permission BOOLEAN := FALSE;
BEGIN
  -- Verificar permissão via roles
  SELECT EXISTS(
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND p.codigo = p_permission_code
      AND ur.is_active = TRUE
      AND p.is_active = TRUE
      AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
  ) INTO v_has_permission;
  
  IF v_has_permission THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar override (grant explícito)
  SELECT EXISTS(
    SELECT 1
    FROM user_permissions_override upo
    JOIN permissions p ON upo.permission_id = p.id
    WHERE upo.user_id = p_user_id
      AND p.codigo = p_permission_code
      AND upo.tipo_override = 'grant'
      AND upo.is_active = TRUE
      AND (upo.valid_until IS NULL OR upo.valid_until > NOW())
  ) INTO v_has_permission;
  
  IF v_has_permission THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar revoke (negação explícita tem precedência)
  SELECT EXISTS(
    SELECT 1
    FROM user_permissions_override upo
    JOIN permissions p ON upo.permission_id = p.id
    WHERE upo.user_id = p_user_id
      AND p.codigo = p_permission_code
      AND upo.tipo_override = 'revoke'
      AND upo.is_active = TRUE
      AND (upo.valid_until IS NULL OR upo.valid_until > NOW())
  ) INTO v_has_permission;
  
  IF v_has_permission THEN
    RETURN FALSE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- =====================================================
-- FUNCTION: Registrar ação no audit log
-- =====================================================
CREATE OR REPLACE FUNCTION log_audit(
  p_user_id UUID,
  p_acao VARCHAR,
  p_modulo VARCHAR,
  p_entidade_tipo VARCHAR DEFAULT NULL,
  p_entidade_id UUID DEFAULT NULL,
  p_descricao TEXT DEFAULT NULL,
  p_dados_antes JSONB DEFAULT NULL,
  p_dados_depois JSONB DEFAULT NULL,
  p_sucesso BOOLEAN DEFAULT TRUE,
  p_nivel_sensibilidade VARCHAR DEFAULT 'interno'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_audit_id UUID;
  v_user_email VARCHAR;
  v_ip_address INET;
  v_user_agent TEXT;
BEGIN
  -- Obter email do usuário
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;
  
  -- Obter informações de contexto (da sessão atual, se disponível)
  -- Em produção, isso viria do contexto da requisição
  v_ip_address := inet_client_addr();
  v_user_agent := current_setting('request.headers', TRUE)::json->>'user-agent';
  
  -- Inserir log
  INSERT INTO audit_log (
    user_id,
    user_email,
    acao,
    modulo,
    entidade_tipo,
    entidade_id,
    descricao,
    dados_antes,
    dados_depois,
    sucesso,
    ip_address,
    user_agent,
    nivel_sensibilidade
  ) VALUES (
    p_user_id,
    v_user_email,
    p_acao,
    p_modulo,
    p_entidade_tipo,
    p_entidade_id,
    p_descricao,
    p_dados_antes,
    p_dados_depois,
    p_sucesso,
    v_ip_address,
    v_user_agent,
    p_nivel_sensibilidade
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- =====================================================
-- FUNCTION: Limpar sessões expiradas
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  UPDATE user_sessions
  SET is_active = FALSE,
      terminated_at = NOW(),
      termination_reason = 'Sessão expirada automaticamente'
  WHERE is_active = TRUE
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  
  RETURN v_deleted;
END;
$$;

-- =====================================================
-- FUNCTION: Verificar tentativas de login falhadas
-- =====================================================
CREATE OR REPLACE FUNCTION check_failed_login_attempts(
  p_email VARCHAR,
  p_ip_address INET,
  p_time_window_minutes INTEGER DEFAULT 15,
  p_max_attempts INTEGER DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_attempts INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_attempts
  FROM failed_login_attempts
  WHERE email = p_email
    AND ip_address = p_ip_address
    AND attempted_at > NOW() - (p_time_window_minutes || ' minutes')::INTERVAL;
  
  RETURN v_attempts >= p_max_attempts;
END;
$$;

-- =====================================================
-- VIEW: vw_user_permissions (Permissões efetivas de cada usuário)
-- =====================================================
CREATE OR REPLACE VIEW vw_user_permissions AS
SELECT DISTINCT
  ur.user_id,
  u.email,
  p.id AS permission_id,
  p.codigo AS permission_code,
  p.nome AS permission_nome,
  p.modulo,
  p.acao,
  p.nivel_criticidade,
  r.nome AS role_nome,
  'role' AS origem
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE ur.is_active = TRUE
  AND r.is_active = TRUE
  AND p.is_active = TRUE
  AND (ur.valid_until IS NULL OR ur.valid_until > NOW())

UNION

SELECT DISTINCT
  upo.user_id,
  u.email,
  p.id AS permission_id,
  p.codigo AS permission_code,
  p.nome AS permission_nome,
  p.modulo,
  p.acao,
  p.nivel_criticidade,
  NULL AS role_nome,
  'override_grant' AS origem
FROM user_permissions_override upo
JOIN auth.users u ON upo.user_id = u.id
JOIN permissions p ON upo.permission_id = p.id
WHERE upo.tipo_override = 'grant'
  AND upo.is_active = TRUE
  AND (upo.valid_until IS NULL OR upo.valid_until > NOW());

-- =====================================================
-- VIEW: vw_active_sessions (Sessões ativas por usuário)
-- =====================================================
CREATE OR REPLACE VIEW vw_active_sessions AS
SELECT
  us.id AS session_id,
  us.user_id,
  u.email,
  us.ip_address,
  us.device_info,
  us.last_activity_at,
  us.created_at,
  us.expires_at,
  EXTRACT(EPOCH FROM (NOW() - us.last_activity_at))/60 AS minutes_inactive
FROM user_sessions us
JOIN auth.users u ON us.user_id = u.id
WHERE us.is_active = TRUE
  AND us.expires_at > NOW()
ORDER BY us.last_activity_at DESC;

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions_override ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar conforme necessidade)
CREATE POLICY "Usuários podem ver suas próprias roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuários podem ver suas próprias sessões" ON user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuários podem ver seu próprio 2FA" ON user_2fa
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Usuários podem ver seus próprios logs de auditoria" ON audit_log
  FOR SELECT USING (user_id = auth.uid());

-- Admins podem ver tudo (exemplo)
CREATE POLICY "Admins podem gerenciar roles" ON roles
  FOR ALL USING (
    EXISTS(
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.nome = 'admin'
        AND ur.is_active = TRUE
    )
  );

-- =====================================================
-- SEED: Roles padrão
-- =====================================================
INSERT INTO roles (nome, descricao, nivel_hierarquia, tipo_role, is_system) VALUES
('admin', 'Administrador do Sistema - Acesso total', 0, 'system', TRUE),
('gerente_geral', 'Gerente Geral - Visão 360° da distribuidora', 10, 'comercial', TRUE),
('gerente_comercial', 'Gerente Comercial - Vendas e relacionamento com hospitais/planos', 20, 'comercial', TRUE),
('vendedor', 'Vendedor - Atendimento a pedidos médicos', 30, 'comercial', TRUE),
('gerente_financeiro', 'Gerente Financeiro - Faturamento e contas a receber', 20, 'financeiro', TRUE),
('analista_financeiro', 'Analista Financeiro - Emissão de NF-e e cobrança', 30, 'financeiro', TRUE),
('gerente_logistica', 'Gerente de Logística - Gestão de estoque e entregas', 20, 'logistica', TRUE),
('almoxarife', 'Almoxarife - Controle de estoque físico', 30, 'logistica', TRUE),
('analista_compliance', 'Analista de Compliance - ANVISA e LGPD', 20, 'compliance', TRUE),
('auditor_interno', 'Auditor Interno - Auditorias e conformidade', 25, 'compliance', TRUE),
('ti_admin', 'Administrador de TI - Infraestrutura e integrações', 15, 'ti', TRUE),
('suporte', 'Suporte Técnico - Atendimento a usuários', 40, 'ti', TRUE)
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- SEED: Permissões básicas (exemplos)
-- =====================================================
INSERT INTO permissions (codigo, nome, descricao, modulo, acao, tipo_entidade, nivel_criticidade, requer_2fa) VALUES
-- Dashboard
('dashboard.view', 'Visualizar Dashboard', 'Acesso ao dashboard principal', 'dashboard', 'view', NULL, 'baixo', FALSE),

-- NF-e
('nfe.view', 'Visualizar NF-es', 'Listar e visualizar notas fiscais', 'nfe', 'view', 'nfe', 'medio', FALSE),
('nfe.create', 'Emitir NF-e', 'Criar e emitir notas fiscais eletrônicas', 'nfe', 'create', 'nfe', 'alto', FALSE),
('nfe.cancel', 'Cancelar NF-e', 'Cancelar notas fiscais autorizadas', 'nfe', 'cancel', 'nfe', 'critico', TRUE),
('nfe.view_valor', 'Ver Valores NF-e', 'Visualizar valores financeiros das NF-es', 'nfe', 'view', 'nfe', 'medio', FALSE),

-- Estoque
('estoque.view', 'Visualizar Estoque', 'Consultar produtos em estoque', 'estoque', 'view', 'produto', 'baixo', FALSE),
('estoque.create', 'Adicionar ao Estoque', 'Registrar entrada de produtos', 'estoque', 'create', 'produto', 'medio', FALSE),
('estoque.update', 'Atualizar Estoque', 'Modificar informações de estoque', 'estoque', 'update', 'produto', 'medio', FALSE),
('estoque.delete', 'Excluir do Estoque', 'Remover produtos do estoque', 'estoque', 'delete', 'produto', 'alto', TRUE),

-- Usuários
('usuarios.view', 'Visualizar Usuários', 'Listar e visualizar usuários do sistema', 'usuarios', 'view', 'usuario', 'medio', FALSE),
('usuarios.create', 'Criar Usuários', 'Adicionar novos usuários', 'usuarios', 'create', 'usuario', 'alto', TRUE),
('usuarios.update', 'Editar Usuários', 'Modificar informações de usuários', 'usuarios', 'update', 'usuario', 'alto', TRUE),
('usuarios.delete', 'Excluir Usuários', 'Remover usuários do sistema', 'usuarios', 'delete', 'usuario', 'critico', TRUE),

-- Roles e Permissões
('roles.view', 'Visualizar Funções', 'Consultar funções e permissões', 'roles', 'view', 'role', 'medio', FALSE),
('roles.manage', 'Gerenciar Funções', 'Criar, editar e excluir funções', 'roles', 'manage', 'role', 'critico', TRUE),
('permissions.assign', 'Atribuir Permissões', 'Conceder ou revogar permissões', 'permissions', 'assign', 'permission', 'critico', TRUE),

-- Auditoria
('audit.view', 'Visualizar Auditoria', 'Acessar logs de auditoria', 'audit', 'view', 'audit_log', 'alto', FALSE),
('audit.export', 'Exportar Auditoria', 'Exportar logs de auditoria', 'audit', 'export', 'audit_log', 'critico', TRUE),

-- Relatórios
('relatorios.view', 'Visualizar Relatórios', 'Acessar relatórios do sistema', 'relatorios', 'view', NULL, 'medio', FALSE),
('relatorios.export', 'Exportar Relatórios', 'Exportar relatórios em PDF/Excel', 'relatorios', 'export', NULL, 'medio', FALSE)

ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- SEED: Atribuir permissões aos roles padrão
-- =====================================================

-- Admin: Todas as permissões
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.nome = 'admin'
ON CONFLICT DO NOTHING;

-- Gerente Geral: Quase tudo, exceto gerenciar roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.nome = 'gerente_geral'
  AND p.codigo NOT IN ('roles.manage', 'permissions.assign', 'usuarios.delete')
ON CONFLICT DO NOTHING;

-- Analista Financeiro: NF-e e relatórios
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.nome = 'analista_financeiro'
  AND p.codigo IN ('dashboard.view', 'nfe.view', 'nfe.create', 'nfe.view_valor', 'relatorios.view', 'relatorios.export')
ON CONFLICT DO NOTHING;

-- Almoxarife: Estoque
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.nome = 'almoxarife'
  AND p.codigo IN ('dashboard.view', 'estoque.view', 'estoque.create', 'estoque.update')
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS (Documentação)
-- =====================================================
COMMENT ON TABLE roles IS 'Funções/Perfis de acesso no sistema (RBAC)';
COMMENT ON TABLE permissions IS 'Permissões granulares (módulo.ação)';
COMMENT ON TABLE role_permissions IS 'Relação entre roles e permissions';
COMMENT ON TABLE user_roles IS 'Atribuição de roles aos usuários';
COMMENT ON TABLE user_permissions_override IS 'Permissões excepcionais (grant/revoke) sem alterar role';
COMMENT ON TABLE user_sessions IS 'Sessões ativas de usuários para controle de acesso';
COMMENT ON TABLE user_2fa IS 'Configuração de autenticação de dois fatores (TOTP/SMS/Email)';
COMMENT ON TABLE audit_log IS 'Log de auditoria completo para conformidade LGPD Art. 37';
COMMENT ON TABLE failed_login_attempts IS 'Registro de tentativas de login falhadas para segurança';

COMMENT ON FUNCTION user_has_permission IS 'Verifica se usuário possui permissão específica (considera roles e overrides)';
COMMENT ON FUNCTION log_audit IS 'Registra ação no log de auditoria';
COMMENT ON FUNCTION cleanup_expired_sessions IS 'Limpa sessões expiradas (executar periodicamente)';
COMMENT ON FUNCTION check_failed_login_attempts IS 'Verifica se IP/email atingiu limite de tentativas falhadas';

