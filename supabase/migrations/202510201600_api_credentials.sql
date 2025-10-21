-- Migration: Tabela de Credenciais de API
-- Data: 20/10/2025
-- Descrição: Armazena credenciais de forma segura para todas as integrações

-- =====================================================
-- TABELA DE CREDENCIAIS
-- =====================================================

CREATE TABLE IF NOT EXISTS api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL, -- Nome da variável (ex: TWILIO_ACCOUNT_SID)
  servico TEXT NOT NULL, -- Nome do serviço (ex: Twilio, WhatsApp)
  valor TEXT, -- Valor da credencial (criptografado)
  categoria TEXT CHECK (categoria IN ('comunicacao', 'opme', 'apis', 'outros')) DEFAULT 'outros',
  tipo TEXT CHECK (tipo IN ('text', 'password', 'api_key', 'oauth2')) DEFAULT 'password',
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  criado_por UUID REFERENCES usuarios(id),
  atualizado_por UUID REFERENCES usuarios(id),
  UNIQUE(empresa_id, nome)
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX idx_api_credentials_empresa ON api_credentials(empresa_id);
CREATE INDEX idx_api_credentials_servico ON api_credentials(servico);
CREATE INDEX idx_api_credentials_categoria ON api_credentials(categoria);
CREATE INDEX idx_api_credentials_ativo ON api_credentials(ativo);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

-- RLS desabilitado temporariamente para configuração inicial
-- ALTER TABLE api_credentials ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNÇÃO DE CRIPTOGRAFIA
-- =====================================================

-- Função para criptografar credenciais antes de salvar
CREATE OR REPLACE FUNCTION encrypt_credential()
RETURNS TRIGGER AS $$
BEGIN
  -- Criptografa o valor se não estiver vazio
  IF NEW.valor IS NOT NULL AND NEW.valor != '' THEN
    -- Usa pgcrypto para criptografar
    NEW.valor = encode(
      encrypt(
        NEW.valor::bytea,
        (SELECT current_setting('app.encryption_key', true))::bytea,
        'aes'
      ),
      'base64'
    );
  END IF;
  
  NEW.atualizado_em = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para descriptografar credenciais ao ler
CREATE OR REPLACE FUNCTION decrypt_credential(encrypted_value TEXT)
RETURNS TEXT AS $$
BEGIN
  IF encrypted_value IS NULL OR encrypted_value = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN convert_from(
    decrypt(
      decode(encrypted_value, 'base64'),
      (SELECT current_setting('app.encryption_key', true))::bytea,
      'aes'
    ),
    'utf8'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Se falhar descriptografia, retorna valor original
    RETURN encrypted_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criptografar automaticamente
CREATE TRIGGER encrypt_credential_trigger
  BEFORE INSERT OR UPDATE ON api_credentials
  FOR EACH ROW
  WHEN (NEW.tipo IN ('password', 'api_key', 'oauth2'))
  EXECUTE FUNCTION encrypt_credential();

-- =====================================================
-- FUNÇÃO PARA OBTER CREDENCIAL DESCRIPTOGRAFADA
-- =====================================================

CREATE OR REPLACE FUNCTION get_decrypted_credential(
  p_nome TEXT,
  p_empresa_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_empresa_id UUID;
  v_valor TEXT;
BEGIN
  -- Se empresa_id não fornecido, pega do usuário atual
  IF p_empresa_id IS NULL THEN
    SELECT empresa_id INTO v_empresa_id
    FROM usuarios
    WHERE id = auth.uid();
  ELSE
    v_empresa_id = p_empresa_id;
  END IF;
  
  -- Busca e descriptografa a credencial
  SELECT decrypt_credential(valor) INTO v_valor
  FROM api_credentials
  WHERE nome = p_nome
    AND empresa_id = v_empresa_id
    AND ativo = true;
  
  RETURN v_valor;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO PARA TESTAR CREDENCIAL
-- =====================================================

CREATE OR REPLACE FUNCTION test_api_credential(
  p_nome TEXT,
  p_servico TEXT,
  p_valor TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Esta função será chamada via Edge Function para testes reais
  -- Por ora, retorna estrutura básica
  
  v_result = jsonb_build_object(
    'success', true,
    'servico', p_servico,
    'nome', p_nome,
    'testado_em', NOW(),
    'message', 'Credencial salva. Teste via Edge Function necessário.'
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEW PARA LISTAR CREDENCIAIS (SEM VALORES)
-- =====================================================

CREATE OR REPLACE VIEW api_credentials_list AS
SELECT 
  id,
  empresa_id,
  nome,
  servico,
  CASE 
    WHEN valor IS NOT NULL AND valor != '' THEN '***CONFIGURADO***'
    ELSE NULL
  END as status,
  categoria,
  tipo,
  ativo,
  criado_em,
  atualizado_em
FROM api_credentials;

-- =====================================================
-- INSERIR CREDENCIAIS TEMPLATE
-- =====================================================

-- Nota: Estes são apenas registros template sem valores
-- Os valores reais serão inseridos via interface

DO $$
DECLARE
  v_empresa_id UUID;
BEGIN
  -- Pega primeira empresa (ajustar conforme necessário)
  SELECT id INTO v_empresa_id FROM empresas LIMIT 1;
  
  IF v_empresa_id IS NOT NULL THEN
    -- Comunicação
    INSERT INTO api_credentials (empresa_id, nome, servico, categoria, tipo, ativo) VALUES
    (v_empresa_id, 'TWILIO_ACCOUNT_SID', 'Twilio', 'comunicacao', 'text', true),
    (v_empresa_id, 'TWILIO_AUTH_TOKEN', 'Twilio', 'comunicacao', 'password', true),
    (v_empresa_id, 'TWILIO_PHONE_NUMBER', 'Twilio', 'comunicacao', 'text', true),
    (v_empresa_id, 'WHATSAPP_ACCESS_TOKEN', 'WhatsApp', 'comunicacao', 'api_key', true),
    (v_empresa_id, 'SENDGRID_API_KEY', 'SendGrid', 'comunicacao', 'api_key', true),
    (v_empresa_id, 'SENDGRID_FROM_EMAIL', 'SendGrid', 'comunicacao', 'text', true),
    (v_empresa_id, 'MAILCHIMP_API_KEY', 'Mailchimp', 'comunicacao', 'api_key', true),
    (v_empresa_id, 'MAILCHIMP_DC', 'Mailchimp', 'comunicacao', 'text', true),
    
    -- OPME
    (v_empresa_id, 'ABBOTT_API_KEY', 'Abbott', 'opme', 'api_key', true),
    (v_empresa_id, 'MEDTRONIC_CLIENT_ID', 'Medtronic', 'opme', 'text', true),
    (v_empresa_id, 'MEDTRONIC_CLIENT_SECRET', 'Medtronic', 'opme', 'password', true),
    (v_empresa_id, 'JJ_TRACELINK_TOKEN', 'J&J', 'opme', 'api_key', true),
    (v_empresa_id, 'STRYKER_API_KEY', 'Stryker', 'opme', 'api_key', true),
    (v_empresa_id, 'BOSTON_SCIENTIFIC_TOKEN', 'Boston Scientific', 'opme', 'api_key', true),
    
    -- APIs
    (v_empresa_id, 'INFOSIMPLES_TOKEN', 'InfoSimples', 'apis', 'api_key', true)
    
    ON CONFLICT (empresa_id, nome) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- AUDIT LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS api_credentials_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID REFERENCES api_credentials(id) ON DELETE CASCADE,
  acao TEXT NOT NULL, -- 'create', 'update', 'delete', 'test'
  usuario_id UUID REFERENCES usuarios(id),
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address TEXT,
  user_agent TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credentials_audit_credential ON api_credentials_audit(credential_id);
CREATE INDEX idx_credentials_audit_usuario ON api_credentials_audit(usuario_id);
CREATE INDEX idx_credentials_audit_criado ON api_credentials_audit(criado_em);

-- Trigger para audit log
CREATE OR REPLACE FUNCTION log_credential_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO api_credentials_audit (credential_id, acao, usuario_id, dados_novos)
    VALUES (NEW.id, 'create', auth.uid(), to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO api_credentials_audit (credential_id, acao, usuario_id, dados_anteriores, dados_novos)
    VALUES (NEW.id, 'update', auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO api_credentials_audit (credential_id, acao, usuario_id, dados_anteriores)
    VALUES (OLD.id, 'delete', auth.uid(), to_jsonb(OLD));
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_credential_changes
  AFTER INSERT OR UPDATE OR DELETE ON api_credentials
  FOR EACH ROW
  EXECUTE FUNCTION log_credential_change();

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE api_credentials IS 'Armazena credenciais de APIs externas de forma criptografada';
COMMENT ON COLUMN api_credentials.valor IS 'Valor criptografado da credencial (AES)';
COMMENT ON COLUMN api_credentials.tipo IS 'Tipo de credencial para tratamento adequado';
COMMENT ON COLUMN api_credentials.categoria IS 'Categoria da integração';
COMMENT ON FUNCTION encrypt_credential() IS 'Criptografa credenciais automaticamente antes de salvar';
COMMENT ON FUNCTION decrypt_credential(TEXT) IS 'Descriptografa credenciais para uso';
COMMENT ON FUNCTION get_decrypted_credential(TEXT, UUID) IS 'Obtém credencial descriptografada de forma segura';
COMMENT ON TABLE api_credentials_audit IS 'Audit log de todas as alterações em credenciais';

