-- ============================================================================
-- ICARUS v5.0 - INTEGRAÇÕES EXTERNAS
-- IoT/RFID/Blockchain + Fornecedores + Regulatório
-- Data: 2025-10-26
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Para hashing e criptografia

-- ============================================================================
-- 1. IOT_DEVICES - Dispositivos IoT/RFID
-- ============================================================================

CREATE TABLE IF NOT EXISTS iot_devices (
  device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificação do dispositivo
  device_uid TEXT NOT NULL UNIQUE, -- UID físico do dispositivo
  device_type VARCHAR(100) CHECK (device_type IN (
    'rfid_reader',
    'rfid_tag',
    'temperature_sensor',
    'humidity_sensor',
    'location_tracker',
    'barcode_scanner',
    'weighing_scale',
    'gateway',
    'beacon',
    'other'
  )),
  
  -- Informações do dispositivo
  manufacturer TEXT,
  model TEXT,
  firmware_version TEXT,
  serial_number TEXT,
  
  -- Localização
  location_name TEXT, -- Ex: "Centro Cirúrgico A", "Almoxarifado B"
  location_coordinates JSONB, -- {lat, lng}
  installation_site VARCHAR(200),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
    'active',
    'inactive',
    'maintenance',
    'calibration',
    'offline',
    'decommissioned'
  )),
  
  -- Conectividade
  ip_address INET,
  mac_address MACADDR,
  connection_type VARCHAR(50) CHECK (connection_type IN ('wifi', 'ethernet', 'lora', 'zigbee', 'bluetooth', 'cellular')),
  last_seen_at TIMESTAMP WITH TIME ZONE,
  
  -- Configuração
  config JSONB DEFAULT '{}'::jsonb,
  read_interval_seconds INTEGER DEFAULT 60,
  battery_level DECIMAL(5,2), -- Porcentagem
  signal_strength INTEGER, -- dBm
  
  -- Timestamps
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT
);

-- Índices
CREATE INDEX idx_iot_devices_org ON iot_devices(organization_id);
CREATE INDEX idx_iot_devices_type ON iot_devices(device_type);
CREATE INDEX idx_iot_devices_status ON iot_devices(status);
CREATE INDEX idx_iot_devices_location ON iot_devices(location_name);
CREATE INDEX idx_iot_devices_last_seen ON iot_devices(last_seen_at DESC);
CREATE INDEX idx_iot_devices_uid ON iot_devices(device_uid);

COMMENT ON TABLE iot_devices IS 'Cadastro de dispositivos IoT e leitores RFID';

-- ============================================================================
-- 2. IOT_READINGS - Leituras de Dispositivos IoT
-- ============================================================================

CREATE TABLE IF NOT EXISTS iot_readings (
  reading_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES iot_devices(device_id) ON DELETE CASCADE,
  
  -- Identificação da leitura
  reading_type VARCHAR(100) CHECK (reading_type IN (
    'rfid_tag_read',
    'temperature',
    'humidity',
    'location_update',
    'barcode_scan',
    'weight_measurement',
    'movement_detected',
    'battery_status',
    'alert_triggered',
    'other'
  )),
  
  -- Dados da leitura
  tag_uid TEXT, -- Para RFID
  value DECIMAL(20,4),
  unit VARCHAR(50),
  raw_data JSONB,
  
  -- Contexto
  location_coordinates JSONB,
  temperature_celsius DECIMAL(5,2),
  humidity_percent DECIMAL(5,2),
  
  -- Qualidade do sinal
  signal_strength INTEGER,
  read_confidence DECIMAL(3,2) CHECK (read_confidence >= 0 AND read_confidence <= 1),
  
  -- Associação com OPME (se aplicável)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  lote_id UUID REFERENCES lotes(id) ON DELETE SET NULL,
  material_id UUID, -- Pode referenciar consignacao_materiais ou similar
  
  -- Timestamps
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Processamento
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  processing_notes TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Blockchain reference (se aplicável)
  blockchain_tx_hash TEXT,
  blockchain_block_number BIGINT
);

-- Índices
CREATE INDEX idx_iot_readings_device ON iot_readings(device_id);
CREATE INDEX idx_iot_readings_type ON iot_readings(reading_type);
CREATE INDEX idx_iot_readings_tag ON iot_readings(tag_uid) WHERE tag_uid IS NOT NULL;
CREATE INDEX idx_iot_readings_read_at ON iot_readings(read_at DESC);
CREATE INDEX idx_iot_readings_product ON iot_readings(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_iot_readings_processed ON iot_readings(processed, read_at) WHERE processed = false;
CREATE INDEX idx_iot_readings_blockchain ON iot_readings(blockchain_tx_hash) WHERE blockchain_tx_hash IS NOT NULL;

-- Particionamento por data (para grande volume)
-- CREATE INDEX idx_iot_readings_read_at_brin ON iot_readings USING BRIN(read_at);

COMMENT ON TABLE iot_readings IS 'Leituras de dispositivos IoT e tags RFID para rastreabilidade';

-- ============================================================================
-- 3. BLOCKCHAIN_TRANSACTIONS - Registro Blockchain
-- ============================================================================

CREATE TABLE IF NOT EXISTS blockchain_transactions (
  tx_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificação blockchain
  tx_hash TEXT NOT NULL UNIQUE,
  block_number BIGINT,
  block_hash TEXT,
  chain_name VARCHAR(100) DEFAULT 'hyperledger-fabric' CHECK (chain_name IN (
    'hyperledger-fabric',
    'ethereum',
    'polygon',
    'binance-smart-chain',
    'private-chain'
  )),
  
  -- Tipo de transação
  tx_type VARCHAR(100) CHECK (tx_type IN (
    'material_registration',
    'material_transfer',
    'material_usage',
    'material_disposal',
    'quality_certification',
    'audit_record',
    'compliance_validation',
    'ownership_change',
    'batch_creation',
    'other'
  )),
  
  -- Dados da transação
  from_address TEXT,
  to_address TEXT,
  contract_address TEXT,
  
  -- Payload
  tx_data JSONB NOT NULL,
  tx_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Vinculação com sistema interno
  related_entity_type VARCHAR(100), -- 'product', 'lote', 'material', 'cirurgia'
  related_entity_id UUID,
  
  -- Status
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN (
    'pending',
    'confirmed',
    'failed',
    'rolled_back'
  )),
  confirmations INTEGER DEFAULT 0,
  
  -- Custos (se aplicável)
  gas_used BIGINT,
  gas_price TEXT, -- Wei
  transaction_fee TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  -- Assinaturas
  signature TEXT,
  signer_address TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX idx_blockchain_tx_org ON blockchain_transactions(organization_id);
CREATE INDEX idx_blockchain_tx_hash ON blockchain_transactions(tx_hash);
CREATE INDEX idx_blockchain_tx_type ON blockchain_transactions(tx_type);
CREATE INDEX idx_blockchain_tx_status ON blockchain_transactions(status);
CREATE INDEX idx_blockchain_tx_confirmed ON blockchain_transactions(confirmed_at DESC);
CREATE INDEX idx_blockchain_tx_entity ON blockchain_transactions(related_entity_type, related_entity_id);
CREATE INDEX idx_blockchain_tx_block ON blockchain_transactions(block_number DESC);

COMMENT ON TABLE blockchain_transactions IS 'Registro de transações blockchain para rastreabilidade imutável';

-- ============================================================================
-- 4. SUPPLIER_INTEGRATIONS - Integrações com Fornecedores
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplier_integrations (
  integration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Configuração da integração
  integration_type VARCHAR(100) CHECK (integration_type IN (
    'api_rest',
    'api_graphql',
    'soap',
    'edi',
    'ftp',
    'sftp',
    'webhook',
    'email',
    'manual'
  )),
  
  -- Endpoint/Conexão
  base_url TEXT,
  api_version VARCHAR(50),
  
  -- Autenticação
  auth_type VARCHAR(50) CHECK (auth_type IN ('none', 'basic', 'bearer', 'oauth2', 'api_key', 'mtls')),
  auth_config JSONB, -- Armazena configurações de autenticação (criptografadas)
  api_key_encrypted TEXT,
  
  -- Capacidades
  capabilities JSONB DEFAULT '[]'::jsonb, -- ['catalog', 'pricing', 'availability', 'orders', 'tracking']
  data_format VARCHAR(50) CHECK (data_format IN ('json', 'xml', 'csv', 'edi', 'custom')),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
    'active',
    'inactive',
    'testing',
    'error',
    'deprecated'
  )),
  
  -- Rate limiting
  rate_limit_per_minute INTEGER,
  rate_limit_per_hour INTEGER,
  rate_limit_per_day INTEGER,
  
  -- Sincronização
  sync_enabled BOOLEAN DEFAULT true,
  sync_frequency_minutes INTEGER DEFAULT 60,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status VARCHAR(50),
  last_sync_error TEXT,
  next_sync_at TIMESTAMP WITH TIME ZONE,
  
  -- Health check
  health_check_enabled BOOLEAN DEFAULT true,
  health_check_url TEXT,
  last_health_check_at TIMESTAMP WITH TIME ZONE,
  health_status VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  deactivated_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT
);

-- Índices
CREATE INDEX idx_supplier_integrations_supplier ON supplier_integrations(supplier_id);
CREATE INDEX idx_supplier_integrations_org ON supplier_integrations(organization_id);
CREATE INDEX idx_supplier_integrations_status ON supplier_integrations(status);
CREATE INDEX idx_supplier_integrations_type ON supplier_integrations(integration_type);
CREATE INDEX idx_supplier_integrations_sync ON supplier_integrations(next_sync_at) WHERE sync_enabled = true;

COMMENT ON TABLE supplier_integrations IS 'Configuração de integrações com APIs de fornecedores OPME';

-- ============================================================================
-- 5. SUPPLIER_API_LOGS - Logs de Chamadas API
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplier_api_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES supplier_integrations(integration_id) ON DELETE CASCADE,
  
  -- Request
  request_method VARCHAR(10) CHECK (request_method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  request_url TEXT NOT NULL,
  request_headers JSONB,
  request_body JSONB,
  
  -- Response
  response_status INTEGER,
  response_headers JSONB,
  response_body JSONB,
  response_time_ms INTEGER,
  
  -- Status
  success BOOLEAN,
  error_message TEXT,
  error_code VARCHAR(100),
  
  -- Rate limiting
  rate_limit_remaining INTEGER,
  rate_limit_reset_at TIMESTAMP WITH TIME ZONE,
  
  -- Retry
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX idx_supplier_api_logs_integration ON supplier_api_logs(integration_id);
CREATE INDEX idx_supplier_api_logs_created ON supplier_api_logs(created_at DESC);
CREATE INDEX idx_supplier_api_logs_success ON supplier_api_logs(success) WHERE success = false;
CREATE INDEX idx_supplier_api_logs_status ON supplier_api_logs(response_status);

COMMENT ON TABLE supplier_api_logs IS 'Logs de chamadas a APIs de fornecedores para debug e auditoria';

-- ============================================================================
-- 6. EXTERNAL_PRODUCT_CATALOG - Catálogo Externo de Produtos
-- ============================================================================

CREATE TABLE IF NOT EXISTS external_product_catalog (
  external_product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES supplier_integrations(integration_id) ON DELETE SET NULL,
  
  -- Identificação externa
  external_id TEXT NOT NULL,
  external_sku TEXT,
  
  -- Mapeamento interno
  internal_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  mapping_status VARCHAR(50) DEFAULT 'pending' CHECK (mapping_status IN (
    'pending',
    'mapped',
    'conflict',
    'ignored',
    'archived'
  )),
  mapping_confidence DECIMAL(3,2),
  
  -- Informações do produto
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  manufacturer TEXT,
  brand TEXT,
  
  -- Códigos
  gtin TEXT,
  upc TEXT,
  ean TEXT,
  anvisa_registration TEXT,
  
  -- Preço e disponibilidade
  price DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'BRL',
  availability VARCHAR(50),
  stock_quantity INTEGER,
  lead_time_days INTEGER,
  
  -- Dados brutos do fornecedor
  raw_data JSONB,
  
  -- Sincronização
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_hash TEXT, -- Hash dos dados para detectar mudanças
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(supplier_id, external_id)
);

-- Índices
CREATE INDEX idx_external_catalog_supplier ON external_product_catalog(supplier_id);
CREATE INDEX idx_external_catalog_integration ON external_product_catalog(integration_id);
CREATE INDEX idx_external_catalog_internal ON external_product_catalog(internal_product_id);
CREATE INDEX idx_external_catalog_mapping ON external_product_catalog(mapping_status);
CREATE INDEX idx_external_catalog_synced ON external_product_catalog(last_synced_at DESC);
CREATE INDEX idx_external_catalog_active ON external_product_catalog(is_active) WHERE is_active = true;
CREATE INDEX idx_external_catalog_gtin ON external_product_catalog(gtin) WHERE gtin IS NOT NULL;

COMMENT ON TABLE external_product_catalog IS 'Catálogo de produtos sincronizado de fornecedores externos';

-- ============================================================================
-- 7. ANVISA_VALIDATIONS - Validações ANVISA
-- ============================================================================

CREATE TABLE IF NOT EXISTS anvisa_validations (
  validation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Entidade validada
  entity_type VARCHAR(100) CHECK (entity_type IN (
    'product',
    'batch',
    'supplier',
    'manufacturer',
    'medical_device',
    'implant'
  )),
  entity_id UUID,
  
  -- Tipo de validação
  validation_type VARCHAR(100) CHECK (validation_type IN (
    'registration_number',
    'udi_validation',
    'rdc_925_compliance',
    'recall_check',
    'expiration_check',
    'batch_verification',
    'manufacturer_validation'
  )),
  
  -- Dados ANVISA
  registration_number TEXT,
  udi_di TEXT, -- Device Identifier
  udi_pi TEXT, -- Production Identifier
  process_number TEXT,
  
  -- Resultado da validação
  validation_status VARCHAR(50) CHECK (validation_status IN (
    'valid',
    'invalid',
    'expired',
    'recalled',
    'suspended',
    'pending',
    'error'
  )),
  
  -- Detalhes
  validation_details JSONB,
  anvisa_response JSONB,
  error_message TEXT,
  
  -- Datas
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiration_date DATE,
  recall_date DATE,
  
  -- Cache
  cache_expires_at TIMESTAMP WITH TIME ZONE,
  revalidate BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX idx_anvisa_validations_org ON anvisa_validations(organization_id);
CREATE INDEX idx_anvisa_validations_entity ON anvisa_validations(entity_type, entity_id);
CREATE INDEX idx_anvisa_validations_type ON anvisa_validations(validation_type);
CREATE INDEX idx_anvisa_validations_status ON anvisa_validations(validation_status);
CREATE INDEX idx_anvisa_validations_registration ON anvisa_validations(registration_number);
CREATE INDEX idx_anvisa_validations_udi ON anvisa_validations(udi_di);
CREATE INDEX idx_anvisa_validations_cache ON anvisa_validations(cache_expires_at) WHERE revalidate = true;

COMMENT ON TABLE anvisa_validations IS 'Validações e consultas à ANVISA para compliance regulatório';

-- ============================================================================
-- 8. TRIGGERS E FUNÇÕES
-- ============================================================================

-- Atualizar updated_at
CREATE TRIGGER update_iot_devices_updated_at
  BEFORE UPDATE ON iot_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_integrations_updated_at
  BEFORE UPDATE ON supplier_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_product_catalog_updated_at
  BEFORE UPDATE ON external_product_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anvisa_validations_updated_at
  BEFORE UPDATE ON anvisa_validations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Atualizar last_seen_at quando device envia leitura
CREATE OR REPLACE FUNCTION update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE iot_devices
  SET last_seen_at = NEW.read_at
  WHERE device_id = NEW.device_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_device_last_seen_trigger
  AFTER INSERT ON iot_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_device_last_seen();

-- Validar hash de sincronização
CREATE OR REPLACE FUNCTION calculate_sync_hash(p_data JSONB)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(p_data::text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 9. FUNÇÕES DE UTILIDADE
-- ============================================================================

-- Registrar leitura IoT
CREATE OR REPLACE FUNCTION register_iot_reading(
  p_device_uid TEXT,
  p_reading_type VARCHAR(100),
  p_tag_uid TEXT DEFAULT NULL,
  p_value DECIMAL DEFAULT NULL,
  p_raw_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_device_id UUID;
  v_reading_id UUID;
BEGIN
  -- Encontrar device
  SELECT device_id INTO v_device_id
  FROM iot_devices
  WHERE device_uid = p_device_uid AND status = 'active';
  
  IF v_device_id IS NULL THEN
    RAISE EXCEPTION 'Device not found or inactive: %', p_device_uid;
  END IF;
  
  -- Inserir leitura
  INSERT INTO iot_readings (
    device_id,
    reading_type,
    tag_uid,
    value,
    raw_data,
    read_at
  ) VALUES (
    v_device_id,
    p_reading_type,
    p_tag_uid,
    p_value,
    p_raw_data,
    NOW()
  )
  RETURNING reading_id INTO v_reading_id;
  
  RETURN v_reading_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validar registro ANVISA
CREATE OR REPLACE FUNCTION validate_anvisa_registration(
  p_registration_number TEXT,
  p_entity_type VARCHAR(100),
  p_entity_id UUID,
  p_organization_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_validation_id UUID;
  v_cached_validation UUID;
BEGIN
  -- Verificar se já existe validação em cache válida
  SELECT validation_id INTO v_cached_validation
  FROM anvisa_validations
  WHERE registration_number = p_registration_number
    AND cache_expires_at > NOW()
    AND validation_status = 'valid'
  LIMIT 1;
  
  IF v_cached_validation IS NOT NULL THEN
    RETURN v_cached_validation;
  END IF;
  
  -- Criar nova validação (será processada por job assíncrono)
  INSERT INTO anvisa_validations (
    organization_id,
    entity_type,
    entity_id,
    validation_type,
    registration_number,
    validation_status,
    cache_expires_at
  ) VALUES (
    p_organization_id,
    p_entity_type,
    p_entity_id,
    'registration_number',
    p_registration_number,
    'pending',
    NOW() + INTERVAL '7 days'
  )
  RETURNING validation_id INTO v_validation_id;
  
  RETURN v_validation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. ROW LEVEL SECURITY
-- ============================================================================

-- Habilitar RLS
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_validations ENABLE ROW LEVEL SECURITY;

-- Policies (exemplo para iot_devices, replicar para outras tabelas)
CREATE POLICY "Users can view devices from their organizations"
  ON iot_devices FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

-- Policies para iot_readings
CREATE POLICY "Users can view readings from their organization's devices"
  ON iot_readings FOR SELECT
  USING (
    device_id IN (
      SELECT device_id FROM iot_devices WHERE organization_id IN (
        SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- 11. GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON iot_devices TO authenticated;
GRANT SELECT, INSERT ON iot_readings TO authenticated;
GRANT SELECT ON blockchain_transactions TO authenticated;
GRANT SELECT ON supplier_integrations TO authenticated;
GRANT SELECT ON supplier_api_logs TO authenticated;
GRANT SELECT ON external_product_catalog TO authenticated;
GRANT SELECT ON anvisa_validations TO authenticated;

GRANT EXECUTE ON FUNCTION register_iot_reading TO authenticated;
GRANT EXECUTE ON FUNCTION validate_anvisa_registration TO authenticated;

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================

