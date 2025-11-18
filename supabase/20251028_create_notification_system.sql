-- ============================================
-- ICARUS v5.0.1 - NOTIFICATION SYSTEM
-- ============================================
-- Sistema de notificações automáticas
-- Data: 28 de Outubro de 2025
-- ============================================

-- ============================================
-- 1. TABELAS DE NOTIFICAÇÕES
-- ============================================

-- Tabela de templates de notificações
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp', 'push', 'in_app'
    assunto TEXT,
    corpo TEXT NOT NULL,
    variaveis JSONB DEFAULT '[]'::jsonb,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT now(),
    atualizado_em TIMESTAMP DEFAULT now()
);

-- Tabela de notificações enviadas
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id),
    usuario_id UUID REFERENCES public.usuarios(id),
    template_id UUID REFERENCES public.notification_templates(id),
    tipo VARCHAR(50) NOT NULL,
    canal VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp', 'push'
    destinatario TEXT NOT NULL,
    assunto TEXT,
    mensagem TEXT NOT NULL,
    dados_extras JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'read'
    erro TEXT,
    enviado_em TIMESTAMP,
    lido_em TIMESTAMP,
    prioridade VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de configurações de notificações por usuário
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id),
    tipo_notificacao VARCHAR(100) NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    whatsapp_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    horario_inicio TIME DEFAULT '08:00:00',
    horario_fim TIME DEFAULT '22:00:00',
    dias_semana INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7],
    criado_em TIMESTAMP DEFAULT now(),
    atualizado_em TIMESTAMP DEFAULT now(),
    UNIQUE(usuario_id, tipo_notificacao)
);

-- Tabela de agendamento de notificações
CREATE TABLE IF NOT EXISTS public.notification_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id),
    nome VARCHAR(200) NOT NULL,
    template_id UUID REFERENCES public.notification_templates(id),
    tipo_agendamento VARCHAR(50) NOT NULL, -- 'once', 'daily', 'weekly', 'monthly', 'cron'
    cron_expression VARCHAR(100),
    proxima_execucao TIMESTAMP,
    ultima_execucao TIMESTAMP,
    destinatarios JSONB NOT NULL, -- [{usuario_id, email, telefone}]
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT now(),
    atualizado_em TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_empresa ON public.notifications(empresa_id);
CREATE INDEX IF NOT EXISTS idx_notifications_usuario ON public.notifications(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_criado_em ON public.notifications(criado_em);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_usuario ON public.notification_preferences(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notification_schedules_proxima_execucao ON public.notification_schedules(proxima_execucao);

-- ============================================
-- 2. TEMPLATES PADRÃO DE NOTIFICAÇÕES
-- ============================================

-- Template: Nova cirurgia agendada
INSERT INTO public.notification_templates (nome, tipo, assunto, corpo, variaveis) VALUES
('cirurgia_agendada', 'email', 
'Nova Cirurgia Agendada - {{procedimento}}',
'<h2>Nova Cirurgia Agendada</h2>
<p>Olá {{medico_nome}},</p>
<p>Uma nova cirurgia foi agendada:</p>
<ul>
  <li><strong>Procedimento:</strong> {{procedimento}}</li>
  <li><strong>Paciente:</strong> {{paciente_nome}}</li>
  <li><strong>Data/Hora:</strong> {{data_hora}}</li>
  <li><strong>Hospital:</strong> {{hospital_nome}}</li>
</ul>
<p>Acesse o sistema para mais detalhes.</p>',
'["medico_nome", "procedimento", "paciente_nome", "data_hora", "hospital_nome"]'::jsonb)
ON CONFLICT (nome) DO NOTHING;

-- Template: Vencimento de conta
INSERT INTO public.notification_templates (nome, tipo, assunto, corpo, variaveis) VALUES
('conta_vencer', 'email',
'Atenção: Conta a Vencer - {{numero_documento}}',
'<h2>Atenção: Conta Próxima do Vencimento</h2>
<p>Olá {{responsavel}},</p>
<p>A conta <strong>{{numero_documento}}</strong> vence em <strong>{{dias}} dias</strong>.</p>
<ul>
  <li><strong>Valor:</strong> R$ {{valor}}</li>
  <li><strong>Vencimento:</strong> {{data_vencimento}}</li>
  <li><strong>Fornecedor:</strong> {{fornecedor}}</li>
</ul>
<p>Acesse o módulo financeiro para realizar o pagamento.</p>',
'["responsavel", "numero_documento", "dias", "valor", "data_vencimento", "fornecedor"]'::jsonb)
ON CONFLICT (nome) DO NOTHING;

-- Template: Estoque baixo
INSERT INTO public.notification_templates (nome, tipo, assunto, corpo, variaveis) VALUES
('estoque_baixo', 'whatsapp',
'🚨 Alerta: Estoque Baixo',
'*Alerta de Estoque!*

Produto: {{produto_nome}}
Quantidade atual: {{quantidade_atual}}
Estoque mínimo: {{quantidade_minima}}
Hospital: {{hospital_nome}}

⚠️ Realize a reposição imediatamente!',
'["produto_nome", "quantidade_atual", "quantidade_minima", "hospital_nome"]'::jsonb)
ON CONFLICT (nome) DO NOTHING;

-- Template: Alta inadimplência
INSERT INTO public.notification_templates (nome, tipo, assunto, corpo, variaveis) VALUES
('alerta_inadimplencia', 'email',
'⚠️ Alerta: Cliente com Alto Risco de Inadimplência',
'<h2>⚠️ Alerta de Inadimplência</h2>
<p>Olá {{responsavel}},</p>
<p>O cliente <strong>{{cliente_nome}}</strong> foi classificado com <strong>ALTO RISCO</strong> de inadimplência pela IA.</p>
<ul>
  <li><strong>Score de Risco:</strong> {{score}}%</li>
  <li><strong>Valor em Aberto:</strong> R$ {{valor_aberto}}</li>
  <li><strong>Dias em Atraso:</strong> {{dias_atraso}}</li>
</ul>
<p><strong>Ação Recomendada:</strong> Entrar em contato imediatamente para negociação.</p>',
'["responsavel", "cliente_nome", "score", "valor_aberto", "dias_atraso"]'::jsonb)
ON CONFLICT (nome) DO NOTHING;

-- Template: Risco de glosa
INSERT INTO public.notification_templates (nome, tipo, assunto, corpo, variaveis) VALUES
('alerta_glosa', 'sms',
'Alerta GLOSA: Cirurgia {{cirurgia_id}} - Risco {{risco}}%',
'ALERTA! Cirurgia #{{cirurgia_id}} tem {{risco}}% de chance de glosa. Revise documentacao urgente. - ICARUS',
'["cirurgia_id", "risco"]'::jsonb)
ON CONFLICT (nome) DO NOTHING;

-- ============================================
-- 3. FUNÇÕES DE NOTIFICAÇÃO
-- ============================================

-- Função para criar notificação
CREATE OR REPLACE FUNCTION public.create_notification(
    p_empresa_id UUID,
    p_usuario_id UUID,
    p_template_nome VARCHAR,
    p_destinatario TEXT,
    p_canal VARCHAR,
    p_variaveis JSONB DEFAULT '{}'::jsonb,
    p_prioridade VARCHAR DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
    v_template RECORD;
    v_mensagem TEXT;
    v_assunto TEXT;
BEGIN
    -- Buscar template
    SELECT * INTO v_template 
    FROM public.notification_templates 
    WHERE nome = p_template_nome AND ativo = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template % não encontrado', p_template_nome;
    END IF;
    
    -- Substituir variáveis na mensagem
    v_mensagem := v_template.corpo;
    v_assunto := v_template.assunto;
    
    -- Criar notificação
    INSERT INTO public.notifications (
        empresa_id,
        usuario_id,
        template_id,
        tipo,
        canal,
        destinatario,
        assunto,
        mensagem,
        dados_extras,
        prioridade
    ) VALUES (
        p_empresa_id,
        p_usuario_id,
        v_template.id,
        v_template.tipo,
        p_canal,
        p_destinatario,
        v_assunto,
        v_mensagem,
        p_variaveis,
        p_prioridade
    ) RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar notificação como enviada
CREATE OR REPLACE FUNCTION public.mark_notification_sent(
    p_notification_id UUID,
    p_status VARCHAR DEFAULT 'sent',
    p_erro TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notifications
    SET 
        status = p_status,
        enviado_em = CASE WHEN p_status = 'sent' THEN now() ELSE enviado_em END,
        erro = p_erro
    WHERE id = p_notification_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION public.mark_notification_read(
    p_notification_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notifications
    SET 
        status = 'read',
        lido_em = now()
    WHERE id = p_notification_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. TRIGGERS AUTOMÁTICOS
-- ============================================

-- Trigger: Notificar vencimento de conta (3 dias antes)
CREATE OR REPLACE FUNCTION public.notify_conta_vencer()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a conta vence em 3 dias e ainda não foi paga
    IF NEW.data_vencimento = CURRENT_DATE + INTERVAL '3 days' 
       AND NEW.status != 'PAGO' THEN
        
        PERFORM public.create_notification(
            NEW.empresa_id,
            NULL, -- Enviar para todos os responsáveis financeiros
            'conta_vencer',
            'financeiro@empresa.com', -- TODO: Buscar do cadastro
            'email',
            jsonb_build_object(
                'numero_documento', NEW.numero_documento,
                'dias', 3,
                'valor', NEW.valor,
                'data_vencimento', NEW.data_vencimento::text,
                'fornecedor', 'Fornecedor XYZ'
            ),
            'high'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Notificar estoque baixo
CREATE OR REPLACE FUNCTION public.notify_estoque_baixo()
RETURNS TRIGGER AS $$
BEGIN
    -- Se quantidade atual caiu abaixo do mínimo
    IF NEW.quantidade_atual < NEW.quantidade_minima 
       AND OLD.quantidade_atual >= OLD.quantidade_minima THEN
        
        PERFORM public.create_notification(
            NEW.empresa_id,
            NULL,
            'estoque_baixo',
            '+5511999999999', -- TODO: Buscar do cadastro
            'whatsapp',
            jsonb_build_object(
                'produto_nome', 'Produto ABC',
                'quantidade_atual', NEW.quantidade_atual,
                'quantidade_minima', NEW.quantidade_minima,
                'hospital_nome', 'Hospital XYZ'
            ),
            'urgent'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. RLS (ROW LEVEL SECURITY)
-- ============================================

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_schedules ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ler suas notificações
CREATE POLICY "Usuarios veem suas notificacoes" 
    ON public.notifications FOR SELECT
    USING (usuario_id = auth.uid() OR empresa_id IN (
        SELECT empresa_id FROM public.usuarios WHERE id = auth.uid()
    ));

-- Policy: Sistema pode criar notificações
CREATE POLICY "Sistema cria notificacoes" 
    ON public.notifications FOR INSERT
    WITH CHECK (TRUE);

-- Policy: Usuários podem atualizar suas notificações (marcar como lida)
CREATE POLICY "Usuarios atualizam suas notificacoes" 
    ON public.notifications FOR UPDATE
    USING (usuario_id = auth.uid());

-- ============================================
-- 6. LOGS E AUDITORIA
-- ============================================

COMMENT ON TABLE public.notifications IS 'Armazena todas as notificações enviadas pelo sistema';
COMMENT ON TABLE public.notification_templates IS 'Templates reutilizáveis de notificações';
COMMENT ON TABLE public.notification_preferences IS 'Preferências de notificação por usuário';
COMMENT ON TABLE public.notification_schedules IS 'Agendamentos de notificações recorrentes';

-- ============================================
-- FIM DO SCRIPT
-- ============================================

