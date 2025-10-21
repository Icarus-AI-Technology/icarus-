-- ============================================
-- CHATBOT IA + NAVEGAÇÃO - SCHEMA PORTUGUÊS
-- Sistema: ICARUS v5.0
-- Versão: 1.0.0
-- Data: Outubro 2025
-- Compliance: LGPD
-- ============================================

-- ============================================
-- TABELAS DO CHATBOT IA
-- ============================================

-- Conversas do Chatbot
CREATE TABLE IF NOT EXISTS chatbot_conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_fim TIMESTAMP WITH TIME ZONE,
  
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'finalizada', 'abandonada')),
  
  total_mensagens INTEGER DEFAULT 0,
  satisfacao_usuario INTEGER CHECK (satisfacao_usuario BETWEEN 1 AND 5),
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mensagens do Chatbot
CREATE TABLE IF NOT EXISTS chatbot_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id UUID REFERENCES chatbot_conversas(id) ON DELETE CASCADE,
  
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('usuario', 'assistente', 'sistema')),
  conteudo TEXT NOT NULL,
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata de IA (intent, sentiment, confidence, entities)
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intenções do Chatbot (Intent Catalog)
CREATE TABLE IF NOT EXISTS chatbot_intencoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  nome VARCHAR(100) UNIQUE NOT NULL,
  categoria VARCHAR(50),
  
  padroes TEXT[] DEFAULT '{}', -- Padrões regex
  palavras_chave TEXT[] DEFAULT '{}',
  variacoes TEXT[] DEFAULT '{}',
  
  resposta_padrao TEXT,
  
  ativo BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs do Chatbot
CREATE TABLE IF NOT EXISTS chatbot_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  categoria VARCHAR(50),
  
  palavras_chave TEXT[] DEFAULT '{}',
  variacoes TEXT[] DEFAULT '{}',
  
  total_acessos INTEGER DEFAULT 0,
  ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  ativo BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treinamento do Chatbot
CREATE TABLE IF NOT EXISTS chatbot_treinamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  input TEXT NOT NULL,
  output_esperado TEXT NOT NULL,
  
  intencao VARCHAR(100),
  entidades JSONB DEFAULT '{}',
  
  usado_em_treino BOOLEAN DEFAULT FALSE,
  data_treino TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Métricas do Chatbot
CREATE TABLE IF NOT EXISTS chatbot_metricas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  data DATE NOT NULL,
  
  total_conversas INTEGER DEFAULT 0,
  total_mensagens INTEGER DEFAULT 0,
  
  tempo_medio_resposta_ms INTEGER,
  taxa_resolucao DECIMAL(5, 2),
  satisfacao_media DECIMAL(3, 2),
  
  intencoes_mais_comuns JSONB DEFAULT '{}',
  sentimento_medio DECIMAL(3, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(data)
);

-- Anexos do Chatbot
CREATE TABLE IF NOT EXISTS chatbot_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensagem_id UUID REFERENCES chatbot_mensagens(id) ON DELETE CASCADE,
  
  nome_arquivo VARCHAR(255) NOT NULL,
  tamanho INTEGER NOT NULL,
  tipo_mime VARCHAR(100),
  
  url TEXT, -- Supabase Storage URL
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback do Chatbot
CREATE TABLE IF NOT EXISTS chatbot_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensagem_id UUID REFERENCES chatbot_mensagens(id) ON DELETE CASCADE,
  
  tipo_feedback VARCHAR(20) NOT NULL CHECK (tipo_feedback IN ('positivo', 'negativo', 'neutro')),
  comentario TEXT,
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log do Chatbot (LGPD Compliant)
CREATE TABLE IF NOT EXISTS chatbot_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  usuario_id UUID,
  mensagem_id UUID,
  
  texto_mensagem TEXT,
  tipo_mensagem VARCHAR(20),
  
  texto_resposta TEXT,
  confianca_resposta DECIMAL(5, 4),
  
  intencao_detectada VARCHAR(100),
  confianca_intencao DECIMAL(5, 4),
  score_sentimento DECIMAL(5, 4),
  
  modelo_usado VARCHAR(50),
  tempo_processamento_ms INTEGER,
  tokens_usados INTEGER,
  
  data_retencao_ate DATE,
  anonimizado BOOLEAN DEFAULT FALSE,
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES DO CHATBOT
-- ============================================

CREATE INDEX IF NOT EXISTS idx_chatbot_conversas_usuario ON chatbot_conversas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversas_data ON chatbot_conversas(data_inicio);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversas_status ON chatbot_conversas(status);

CREATE INDEX IF NOT EXISTS idx_chatbot_mensagens_conversa ON chatbot_mensagens(conversa_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_mensagens_timestamp ON chatbot_mensagens(timestamp);
CREATE INDEX IF NOT EXISTS idx_chatbot_mensagens_tipo ON chatbot_mensagens(tipo);

CREATE INDEX IF NOT EXISTS idx_chatbot_intencoes_nome ON chatbot_intencoes(nome);
CREATE INDEX IF NOT EXISTS idx_chatbot_intencoes_categoria ON chatbot_intencoes(categoria);
CREATE INDEX IF NOT EXISTS idx_chatbot_intencoes_ativo ON chatbot_intencoes(ativo);

CREATE INDEX IF NOT EXISTS idx_chatbot_faqs_categoria ON chatbot_faqs(categoria);
CREATE INDEX IF NOT EXISTS idx_chatbot_faqs_ativo ON chatbot_faqs(ativo);

CREATE INDEX IF NOT EXISTS idx_chatbot_metricas_data ON chatbot_metricas(data);

CREATE INDEX IF NOT EXISTS idx_chatbot_audit_usuario ON chatbot_audit_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_audit_timestamp ON chatbot_audit_log(timestamp);

-- ============================================
-- TRIGGERS E FUNÇÕES
-- ============================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chatbot_conversas_updated_at
  BEFORE UPDATE ON chatbot_conversas
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_chatbot_intencoes_updated_at
  BEFORE UPDATE ON chatbot_intencoes
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_updated_at();

-- Incrementar total_mensagens na conversa
CREATE OR REPLACE FUNCTION incrementar_total_mensagens()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chatbot_conversas
  SET total_mensagens = total_mensagens + 1
  WHERE id = NEW.conversa_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_incrementar_mensagens
  AFTER INSERT ON chatbot_mensagens
  FOR EACH ROW
  EXECUTE FUNCTION incrementar_total_mensagens();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE chatbot_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_intencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_treinamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_metricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança

-- Conversas: usuário só vê suas próprias conversas
CREATE POLICY politica_chatbot_conversas_select ON chatbot_conversas
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY politica_chatbot_conversas_insert ON chatbot_conversas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY politica_chatbot_conversas_update ON chatbot_conversas
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Mensagens: usuário só vê mensagens de suas conversas
CREATE POLICY politica_chatbot_mensagens_select ON chatbot_mensagens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chatbot_conversas
      WHERE chatbot_conversas.id = chatbot_mensagens.conversa_id
      AND chatbot_conversas.usuario_id = auth.uid()
    )
  );

CREATE POLICY politica_chatbot_mensagens_insert ON chatbot_mensagens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chatbot_conversas
      WHERE chatbot_conversas.id = chatbot_mensagens.conversa_id
      AND chatbot_conversas.usuario_id = auth.uid()
    )
  );

-- Intenções e FAQs: leitura pública, escrita apenas admin
CREATE POLICY politica_chatbot_intencoes_select ON chatbot_intencoes
  FOR SELECT USING (ativo = TRUE);

CREATE POLICY politica_chatbot_faqs_select ON chatbot_faqs
  FOR SELECT USING (ativo = TRUE);

-- Audit Log: apenas admin
CREATE POLICY politica_chatbot_audit_admin ON chatbot_audit_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.role = 'admin'
    )
  );

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Inserir intenções padrão
INSERT INTO chatbot_intencoes (nome, categoria, padroes, palavras_chave, resposta_padrao, ativo) VALUES
  ('saudacao', 'greeting', ARRAY['/(oi|olá|hey|bom dia)/i'], ARRAY['oi', 'olá', 'hey', 'bom dia'], '👋 Olá! Como posso ajudar você hoje?', TRUE),
  ('despedida', 'greeting', ARRAY['/(tchau|até logo|adeus)/i'], ARRAY['tchau', 'até logo', 'adeus'], 'Até logo! Fico à disposição para ajudar.', TRUE),
  ('consulta', 'question', ARRAY['/(consultar|verificar|ver|mostrar)/i'], ARRAY['consultar', 'verificar', 'ver', 'mostrar'], NULL, TRUE),
  ('status', 'question', ARRAY['/(status|situação|andamento)/i'], ARRAY['status', 'situação', 'andamento'], NULL, TRUE),
  ('ajuda', 'question', ARRAY['/(ajuda|help|socorro|dúvida)/i'], ARRAY['ajuda', 'help', 'socorro', 'dúvida'], 'Claro! Estou aqui para ajudar. O que você gostaria de saber?', TRUE),
  ('reclamacao', 'complaint', ARRAY['/(problema|erro|bug|falha)/i'], ARRAY['problema', 'erro', 'bug', 'falha'], 'Entendo sua preocupação. Vou escalar isso para nossa equipe.', TRUE),
  ('agendamento', 'command', ARRAY['/(agendar|marcar|reservar)/i'], ARRAY['agendar', 'marcar', 'reservar'], NULL, TRUE),
  ('financeiro', 'command', ARRAY['/(pagar|pagamento|boleto|fatura)/i'], ARRAY['pagar', 'pagamento', 'boleto', 'fatura'], NULL, TRUE)
ON CONFLICT (nome) DO NOTHING;

-- Inserir FAQs padrão (Top 10)
INSERT INTO chatbot_faqs (pergunta, resposta, categoria, palavras_chave, variacoes, ativo) VALUES
  (
    'Como consultar status de cirurgia?',
    'Para consultar o status de uma cirurgia, acesse o módulo **Cirurgias & Procedimentos** > **Acompanhamento**. Você pode filtrar por paciente, médico ou data.',
    'cirurgias',
    ARRAY['status', 'cirurgia', 'consultar'],
    ARRAY['ver andamento cirurgia', 'situação procedimento'],
    TRUE
  ),
  (
    'Como emitir NF-e?',
    'Acesse **Faturamento** > **NF-e Automática** > clique em **Nova NF-e**. O sistema preenche automaticamente os dados da cirurgia.',
    'faturamento',
    ARRAY['nfe', 'nota fiscal', 'emitir'],
    ARRAY['criar nota fiscal', 'gerar nfe'],
    TRUE
  ),
  (
    'Como rastrear entrega?',
    'Vá para **Logística Avançada** > **Rastreamento Real-time**. Digite o código de rastreio ou selecione a entrega na lista.',
    'logistica',
    ARRAY['rastreamento', 'entrega', 'rastrear'],
    ARRAY['tracking', 'localizar entrega'],
    TRUE
  ),
  (
    'Como verificar estoque de materiais?',
    'Acesse **Estoque IA** > **Dashboard**. O sistema mostra em tempo real a quantidade de cada material OPME.',
    'estoque',
    ARRAY['estoque', 'materiais', 'verificar'],
    ARRAY['consultar estoque', 'quantidade materiais'],
    TRUE
  ),
  (
    'Como cadastrar novo médico?',
    'Vá para **Cadastros Inteligentes** > **Cadastro Médicos** > **Novo Cadastro**. O sistema valida automaticamente o CRM.',
    'cadastros',
    ARRAY['cadastrar', 'médico', 'novo'],
    ARRAY['adicionar médico', 'registrar médico'],
    TRUE
  ),
  (
    'Como gerar relatório financeiro?',
    'Acesse **Financeiro Avançado** > **Relatórios Financeiros**. Selecione o período e clique em **Gerar Relatório**.',
    'financeiro',
    ARRAY['relatório', 'financeiro', 'gerar'],
    ARRAY['criar relatório', 'exportar relatório'],
    TRUE
  ),
  (
    'Como fazer cotação com fornecedores?',
    'Entre em **Compras & Fornecedores** > **Cotações Automáticas**. O sistema envia automaticamente para os fornecedores cadastrados.',
    'compras',
    ARRAY['cotação', 'fornecedores', 'fazer'],
    ARRAY['solicitar cotação', 'pedir orçamento'],
    TRUE
  ),
  (
    'Como ver pendências de pagamento?',
    'Acesse **Financeiro Avançado** > **Contas a Pagar**. Filtre por status "Pendente" para ver todas as pendências.',
    'financeiro',
    ARRAY['pendências', 'pagamento', 'ver'],
    ARRAY['contas pendentes', 'a pagar'],
    TRUE
  ),
  (
    'Como configurar alertas de estoque?',
    'Vá para **Estoque IA** > **Configurações** > **Alertas**. Defina a quantidade mínima para cada material.',
    'estoque',
    ARRAY['alertas', 'estoque', 'configurar'],
    ARRAY['notificações estoque', 'avisos estoque'],
    TRUE
  ),
  (
    'Como exportar dados de cirurgias?',
    'Entre em **Cirurgias & Procedimentos** > **Relatórios** > **Exportar Dados**. Escolha o formato (Excel, PDF ou CSV).',
    'cirurgias',
    ARRAY['exportar', 'dados', 'cirurgias'],
    ARRAY['baixar dados', 'extrair dados'],
    TRUE
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================

COMMENT ON TABLE chatbot_conversas IS 'Conversas do chatbot IA - ICARUS v5.0';
COMMENT ON TABLE chatbot_mensagens IS 'Mensagens das conversas do chatbot';
COMMENT ON TABLE chatbot_intencoes IS 'Catálogo de intenções para reconhecimento NLP';
COMMENT ON TABLE chatbot_faqs IS 'Base de conhecimento de perguntas frequentes';
COMMENT ON TABLE chatbot_treinamento IS 'Dados para treinamento contínuo do modelo';
COMMENT ON TABLE chatbot_metricas IS 'Métricas diárias de performance do chatbot';
COMMENT ON TABLE chatbot_anexos IS 'Anexos de arquivos nas conversas';
COMMENT ON TABLE chatbot_feedback IS 'Feedback dos usuários sobre as respostas';
COMMENT ON TABLE chatbot_audit_log IS 'Log de auditoria LGPD compliant';

