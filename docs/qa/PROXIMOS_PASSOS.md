# 🚀 PRÓXIMAS AÇÕES PRIORITÁRIAS - ICARUS V5.0

**Data**: 18 de Novembro de 2025  
**Status**: QA Completo - 82% Ready  
**Objetivo**: 100% Production Ready em 15-30 dias

---

## 🔴 **CRÍTICO - BLOQUEANTES PARA PRODUÇÃO (15 dias)**

### 1. Nomear DPO (Data Protection Officer)
**Prazo**: IMEDIATO (1 dia)  
**Custo**: R$ 0 (interno) ou R$ 3-8k/mês (externo)  
**Responsável**: Gestão / Jurídico

#### Ações:
```sql
-- 1. Atualizar tabela empresas
UPDATE empresas 
SET 
  dpo_nome = 'Nome do Encarregado',
  dpo_email = 'dpo@empresa.com.br',
  dpo_telefone = '+55 11 99999-9999',
  dpo_nomeado_em = NOW()
WHERE id = '[EMPRESA_ID]';
```

```markdown
-- 2. Publicar no site
📧 **Contato DPO**: dpo@empresa.com.br  
📞 **Telefone**: +55 11 99999-9999

-- 3. Criar email funcional
Configurar: dpo@empresa.com.br
Encaminhar para: responsável designado
```

#### Checklist:
- [ ] Definir pessoa responsável (pode ser interno)
- [ ] Registrar em `empresas.dpo_*`
- [ ] Criar email dpo@empresa.com.br
- [ ] Publicar contato no site
- [ ] Documentar em `docs/lgpd/termo_designacao_dpo.md`

---

### 2. Criar Política de Privacidade
**Prazo**: 3 dias  
**Custo**: R$ 5-15k (consultoria jurídica)  
**Responsável**: Jurídico + Dev

#### Template Base:
```markdown
# POLÍTICA DE PRIVACIDADE - ICARUS

## 1. QUEM SOMOS
[RAZÃO SOCIAL], CNPJ [XX.XXX.XXX/0001-XX], inscrita no endereço [ENDEREÇO],
doravante denominada "ICARUS" ou "nós", é a controladora dos dados pessoais 
coletados e tratados por meio da plataforma ICARUS v5.0.

## 2. DADOS QUE COLETAMOS

### 2.1. Usuários da Plataforma
- Nome completo
- E-mail corporativo
- Telefone
- Cargo/função
**Base Legal**: Execução de contrato (Art. 7º, V, LGPD)

### 2.2. Médicos e Profissionais
- Nome completo
- CRM e UF
- Especialidade
- Telefone e e-mail
**Base Legal**: Execução de contrato (Art. 7º, V, LGPD)

### 2.3. Pacientes (MINIMIZADO)
- APENAS iniciais (ex: "J.S.")
- Data do procedimento
**Base Legal**: Legítimo interesse + Obrigação legal (Art. 7º, IX e II, LGPD)
**Justificativa**: Rastreabilidade exigida pela ANVISA (RDC 36/2015)

### 2.4. Dados NÃO Coletados
❌ Nome completo de paciente
❌ CPF de paciente
❌ Diagnóstico médico
❌ Prontuário
❌ Dados sensíveis de saúde

## 3. FINALIDADE DO TRATAMENTO
Os dados são tratados exclusivamente para:
- Gestão de operações de distribuidora OPME
- Rastreabilidade de materiais (obrigação legal ANVISA)
- Faturamento e emissão de NF-e
- Cumprimento de obrigações fiscais e regulatórias

## 4. COMPARTILHAMENTO DE DADOS
❌ NÃO compartilhamos dados com terceiros para marketing
❌ NÃO vendemos dados pessoais
✅ Compartilhamento APENAS quando exigido por lei:
   - ANVISA (rastreabilidade de materiais)
   - Receita Federal (obrigações fiscais)
   - Poder Judiciário (ordem judicial)

## 5. ARMAZENAMENTO E SEGURANÇA

### 5.1. Localização dos Dados
✅ **Dados hospedados no Brasil**
- Servidor: AWS South America (São Paulo) - sa-east-1
- Supabase PostgreSQL 15.x
- Sem transferência internacional de dados

### 5.2. Medidas de Segurança
- ✅ Criptografia TLS 1.3 (dados em trânsito)
- ✅ Criptografia AES-256 (dados em repouso)
- ✅ Isolamento multi-tenant (Row Level Security)
- ✅ Audit log imutável (blockchain-like)
- ✅ Backup diário automatizado
- ✅ Autenticação JWT com refresh tokens

### 5.3. Controle de Acesso
- ✅ Acesso restrito por perfil (RBAC)
- ✅ Logs de todas as operações
- ✅ Revisão periódica de permissões

## 6. SEUS DIREITOS (Art. 18, LGPD)

Você tem direito a:

### 6.1. Confirmação e Acesso
- Confirmar se tratamos seus dados
- Acessar seus dados pessoais

### 6.2. Correção
- Corrigir dados incompletos, inexatos ou desatualizados

### 6.3. Anonimização ou Bloqueio
- Solicitar anonimização de dados desnecessários
- Bloquear dados tratados em desacordo

### 6.4. Eliminação
- Solicitar eliminação de dados tratados com consentimento
- Exceção: dados obrigatórios por lei (prazo de 5 anos)

### 6.5. Portabilidade
- Receber seus dados em formato estruturado (JSON)
- Transferir para outro fornecedor

### 6.6. Revogação de Consentimento
- Revogar consentimento a qualquer momento

**Como exercer seus direitos:**
📧 Email: dpo@empresa.com.br
📞 Telefone: +55 11 99999-9999
⏱️ Prazo de resposta: até 15 dias

## 7. RETENÇÃO DE DADOS

### 7.1. Dados Operacionais
- Enquanto a conta estiver ativa
- Após exclusão: 30 dias para backup

### 7.2. Dados Fiscais e Regulatórios
- 5 anos (prazo legal Receita Federal)
- Não podem ser eliminados antes do prazo

### 7.3. Audit Logs
- 5 anos (compliance e segurança)
- Anonimizados após o prazo

## 8. COOKIES E TECNOLOGIAS SIMILARES
- ✅ Cookies essenciais (autenticação, sessão)
- ✅ Cookies analíticos (performance, opcional)
- ❌ NÃO usamos cookies de marketing/publicidade

**Gerenciar cookies**: Configurações do navegador

## 9. ALTERAÇÕES NESTA POLÍTICA
Esta política pode ser alterada periodicamente. 
A versão atualizada estará sempre disponível em:
🔗 https://[dominio]/politica-privacidade

**Última atualização**: [DATA]
**Versão**: 1.0

## 10. CONTATO

**Encarregado de Dados (DPO)**:
📧 Email: dpo@empresa.com.br
📞 Telefone: +55 11 99999-9999
📍 Endereço: [ENDEREÇO COMPLETO]

**Controlador**:
[RAZÃO SOCIAL]
CNPJ: [XX.XXX.XXX/0001-XX]
📧 contato@empresa.com.br

---

**Última revisão**: [DATA]  
**Próxima revisão**: [DATA + 12 meses]
```

#### Ações:
- [ ] Adaptar template acima com dados reais da empresa
- [ ] Revisar com advogado especialista LGPD
- [ ] Publicar em: `/politica-privacidade` (rota pública)
- [ ] Link no footer: "Política de Privacidade"
- [ ] Versionar documento (v1.0, v1.1, etc)

---

### 3. Implementar Registro de Consentimento
**Prazo**: 1 sprint (5-10 dias)  
**Custo**: 40h desenvolvimento  
**Responsável**: Backend + Frontend

#### Migration SQL:
```sql
-- Arquivo: supabase/migrations/0007_consentimentos.sql

CREATE TABLE IF NOT EXISTS public.consentimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'termos_uso',
    'politica_privacidade',
    'coleta_dados',
    'marketing'
  )),
  versao TEXT NOT NULL, -- ex: '1.0', '1.1', '2.0'
  aceito_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revogado_em TIMESTAMPTZ,
  ip_origem TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  consentimento_texto TEXT NOT NULL, -- texto exato aceito
  metadados JSONB DEFAULT '{}',
  
  -- Índices
  CONSTRAINT unique_consentimento_ativo UNIQUE(usuario_id, tipo, versao)
);

-- RLS
ALTER TABLE public.consentimentos ENABLE ROW LEVEL SECURITY;

-- Policy: usuário vê apenas próprios consentimentos
CREATE POLICY pol_consentimentos_select ON public.consentimentos
  FOR SELECT
  USING (usuario_id = auth.uid());

-- Policy: usuário pode inserir próprios consentimentos
CREATE POLICY pol_consentimentos_insert ON public.consentimentos
  FOR INSERT
  WITH CHECK (usuario_id = auth.uid());

-- Policy: usuário pode revogar próprios consentimentos
CREATE POLICY pol_consentimentos_update ON public.consentimentos
  FOR UPDATE
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- Índices de performance
CREATE INDEX idx_consentimentos_usuario ON public.consentimentos(usuario_id);
CREATE INDEX idx_consentimentos_tipo ON public.consentimentos(tipo);
CREATE INDEX idx_consentimentos_versao ON public.consentimentos(versao);
CREATE INDEX idx_consentimentos_ativo ON public.consentimentos(usuario_id, tipo) 
  WHERE revogado_em IS NULL;

-- Comentários
COMMENT ON TABLE public.consentimentos IS 'Registro de consentimentos LGPD Art. 8º';
COMMENT ON COLUMN public.consentimentos.consentimento_texto IS 'Texto exato apresentado ao usuário';
COMMENT ON COLUMN public.consentimentos.versao IS 'Versão do documento aceito (rastreabilidade)';

-- Grant
GRANT SELECT, INSERT, UPDATE ON public.consentimentos TO authenticated;
```

#### Frontend - Tela de Aceite:
```tsx
// src/components/auth/ConsentimentoModal.tsx

import { useState } from 'react';
import { Dialog } from '@/components/oraclusx-ds/Dialog';
import { Checkbox } from '@/components/oraclusx-ds/Checkbox';
import { Button } from '@/components/oraclusx-ds/Button';
import { supabase } from '@/lib/supabase';

interface ConsentimentoModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export const ConsentimentoModal = ({ isOpen, onAccept, onReject }: ConsentimentoModalProps) => {
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [politicaAceita, setPoliticaAceita] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!termosAceitos || !politicaAceita) {
      alert('Você precisa aceitar todos os termos para continuar.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Capturar informações do navegador
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();
      const userAgent = navigator.userAgent;

      // Registrar consentimentos
      const consentimentos = [
        {
          usuario_id: user.id,
          tipo: 'termos_uso',
          versao: '1.0',
          ip_origem: ip,
          user_agent: userAgent,
          consentimento_texto: 'Aceito os Termos de Uso do ICARUS v5.0'
        },
        {
          usuario_id: user.id,
          tipo: 'politica_privacidade',
          versao: '1.0',
          ip_origem: ip,
          user_agent: userAgent,
          consentimento_texto: 'Aceito a Política de Privacidade do ICARUS v5.0'
        }
      ];

      const { error } = await supabase
        .from('consentimentos')
        .insert(consentimentos);

      if (error) throw error;

      onAccept();
    } catch (error) {
      console.error('Erro ao registrar consentimento:', error);
      alert('Erro ao registrar consentimento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onReject}
      title="Termos de Uso e Política de Privacidade"
      confirmText="Aceitar e Continuar"
      cancelText="Recusar"
      onConfirm={handleAccept}
      onCancel={onReject}
      showCancel
    >
      <div className="space-y-4">
        <p className="text-sm text-secondary">
          Para utilizar o ICARUS v5.0, você precisa aceitar nossos Termos de Uso e Política de Privacidade.
        </p>

        <div className="space-y-3 max-h-[300px] overflow-y-auto p-4 bg-surface rounded-lg">
          <div>
            <h3 className="font-medium mb-2">Termos de Uso</h3>
            <p className="text-sm text-secondary">
              [Resumo dos termos de uso...]
              <a href="/termos-uso" target="_blank" className="text-primary underline ml-1">
                Ler completo
              </a>
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Política de Privacidade</h3>
            <p className="text-sm text-secondary">
              [Resumo da política de privacidade...]
              <a href="/politica-privacidade" target="_blank" className="text-primary underline ml-1">
                Ler completo
              </a>
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Checkbox
            checked={termosAceitos}
            onChange={setTermosAceitos}
            label="Li e aceito os Termos de Uso"
          />
          <Checkbox
            checked={politicaAceita}
            onChange={setPoliticaAceita}
            label="Li e aceito a Política de Privacidade"
          />
        </div>

        <p className="text-xs text-secondary">
          Ao aceitar, você concorda com o tratamento dos seus dados conforme descrito na nossa 
          Política de Privacidade. Você pode revogar seu consentimento a qualquer momento 
          entrando em contato com nosso DPO em: dpo@empresa.com.br
        </p>
      </div>
    </Dialog>
  );
};
```

#### Integração no Signup:
```tsx
// src/pages/Signup.tsx

// ... imports

const [showConsentimento, setShowConsentimento] = useState(false);

const handleSignup = async (formData) => {
  // ... código de signup existente
  
  // Após signup bem-sucedido:
  setShowConsentimento(true);
};

return (
  <div>
    {/* Formulário de signup */}
    
    <ConsentimentoModal
      isOpen={showConsentimento}
      onAccept={() => {
        setShowConsentimento(false);
        navigate('/dashboard');
      }}
      onReject={() => {
        // Fazer logout e voltar para login
        supabase.auth.signOut();
        navigate('/login');
      }}
    />
  </div>
);
```

#### Checklist:
- [ ] Aplicar migration `0007_consentimentos.sql`
- [ ] Criar componente `ConsentimentoModal.tsx`
- [ ] Integrar no fluxo de signup
- [ ] Capturar IP via API (ipify.org ou alternativa)
- [ ] Registrar User-Agent
- [ ] Salvar texto exato aceito
- [ ] Versionar documentos (v1.0, v1.1...)
- [ ] Testar fluxo completo

---

## 🟡 **IMPORTANTE - RECOMENDADO (30 dias)**

### 4. Elaborar RIPD (Relatório de Impacto)
**Prazo**: 2 semanas  
**Custo**: R$ 10-20k (consultoria)  
**Responsável**: DPO + Jurídico

Ver template em: `supabase/validacao_lgpd_brasil.md`

---

### 5. Documentar Base Legal
**Prazo**: 1 semana  
**Custo**: Interno  
**Responsável**: DPO

Ver template em: `supabase/validacao_lgpd_brasil.md`

---

### 6. Criar Plano de Resposta a Incidentes
**Prazo**: 1 semana  
**Custo**: Interno  
**Responsável**: TI + DPO

Ver template em: `supabase/validacao_lgpd_brasil.md`

---

## 📊 **TRACKING DE PROGRESSO**

| Item | Status | Prazo | Responsável |
|------|--------|-------|-------------|
| 1. Nomear DPO | ⏳ TODO | IMEDIATO | Gestão |
| 2. Política Privacidade | ⏳ TODO | 3 dias | Jurídico |
| 3. Registro Consentimento | ⏳ TODO | 1 sprint | Dev Team |
| 4. RIPD | ⏳ TODO | 2 semanas | DPO |
| 5. Base Legal | ⏳ TODO | 1 semana | DPO |
| 6. Plano Incidentes | ⏳ TODO | 1 semana | TI |

**Legenda:**
- ⏳ TODO - Não iniciado
- 🏗️ IN PROGRESS - Em andamento
- ✅ DONE - Concluído
- ❌ BLOCKED - Bloqueado

---

## 🎯 **META: PRODUÇÃO EM 15-30 DIAS**

**Condição Mínima (15 dias):**
✅ DPO nomeado  
✅ Política de Privacidade publicada  
✅ Registro de consentimento funcionando

**Condição Ideal (30 dias):**
✅ Itens acima  
✅ RIPD elaborado  
✅ Base Legal documentada  
✅ Plano de Incidentes formal

---

**Status Atual**: 🟡 82% Ready  
**Status Meta**: 🟢 100% Production Ready  
**Gap**: 3 itens críticos (LGPD formal)

---

📧 **Contato**: Agente MCP Senior Full Stack  
📅 **Data**: 18/11/2025  
🔄 **Próxima Revisão**: Após conclusão dos 3 itens críticos

