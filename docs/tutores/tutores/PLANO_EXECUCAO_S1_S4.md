# 📋 PLANO DE EXECUÇÃO — FASE S1-S4 DETALHADO

**Data:** 2025-10-20  
**Equipe:** AGENTE_EQUIPE_ECONOMIA_AI_TUTORES  
**Status:** ✅ Respostas recebidas — EXECUÇÃO AUTORIZADA

---

## ✅ RESPOSTAS RECEBIDAS (5 Perguntas Estratégicas)

| Pergunta | Resposta | Implicação |
|----------|----------|------------|
| **1. Contratos OpenAI/Claude** | Sem lock-in/multas | ✅ Livre para substituir por Ollama |
| **2. Módulos Prioritários** | 15+ módulos (ver abaixo) | 📊 Plano de rollout em ondas |
| **3. SLOs Mínimos** | 95% (p95 UI/SQL) | 🎯 Meta clara para otimizações |
| **4. Documentação Regulatória** | Upload posterior | 📂 Preparar sistema de upload |
| **5. Feature Flags A/B** | Sim, A/B ready | ✅ Substituições seguras habilitadas |

---

## 🎯 MÓDULOS PRIORITÁRIOS PARA TUTORES IA (15 Módulos)

### **Onda 1: Compliance & Regulatório (CRÍTICO)** ⭐⭐⭐

| Módulo | Prioridade | Complexidade | Prazo |
|--------|-----------|--------------|-------|
| **PGR (Programa de Gerenciamento de Riscos)** | CRÍTICA | Alta | Semana 1-2 |
| **Compliance ANVISA** | CRÍTICA | Alta | Semana 1-2 |
| **Qualidade** | CRÍTICA | Média | Semana 2-3 |
| **Regulamentações** | CRÍTICA | Alta | Semana 2-3 |

**Justificativa**: 
- ANVISA = obrigação legal (multas de R$ 5k-200k)
- PGR = exigência regulatória
- Compliance = auditoria contínua necessária

**Funcionalidades do Tutor:**
- ✅ Upload de documentação atual (PDFs, DOCs)
- ✅ Análise automática de conformidade
- ✅ Detecção de mudanças legislativas (scraping RDCs ANVISA)
- ✅ Alertas de vencimento de documentos
- ✅ Checklist de auditoria interativo
- ✅ Geração de relatórios de compliance

### **Onda 2: Financeiro Avançado (IMPACTO DIRETO)** ⭐⭐⭐

| Módulo | Prioridade | Complexidade | Prazo |
|--------|-----------|--------------|-------|
| **Financeiro Avançado** | ALTA | Muito Alta | Semana 3-5 |
| **Auditor Contas Bancárias** | ALTA | Alta | Semana 4-5 |
| **Negociador de Tarifas** | ALTA | Média | Semana 5-6 |
| **Consultor de Crédito/Score** | ALTA | Média | Semana 5-6 |
| **Faturamento (Cobrança)** | ALTA | Alta | Semana 4-5 |
| **Gestão Plano de Contas** | ALTA | Média | Semana 6 |
| **Fiscal (Lucro Real)** | ALTA | Muito Alta | Semana 6-7 |
| **Auditor Contábil (Isenções)** | ALTA | Alta | Semana 7 |
| **DRE Inteligente** | ALTA | Alta | Semana 7-8 |

**Justificativa**:
- Impacto direto no fluxo de caixa
- Economia com negociação de tarifas (US$ 1k-5k/ano)
- Score de crédito = acesso a capital
- Fiscal complexo = alta probabilidade de erro humano

**Funcionalidades do Tutor:**
- 🤖 **Auditor bancário**: conciliação automática, detecção de tarifas abusivas
- 🤖 **Negociador**: análise de tarifas vs mercado, geração de cartas de negociação
- 🤖 **Score advisor**: análise de comportamento financeiro, recomendações de melhoria
- 🤖 **Fiscal expert**: cálculo de Lucro Real, identificação de isenções aplicáveis
- 🤖 **DRE inteligente**: análise de margens, projeções, insights de rentabilidade

### **Onda 3: Operacional (EFICIÊNCIA)** ⭐⭐

| Módulo | Prioridade | Complexidade | Prazo |
|--------|-----------|--------------|-------|
| **Cirurgias** | ALTA | Média | Semana 8 |
| **Estoque** | MÉDIA | Média | Semana 9 |
| **Compras** | MÉDIA | Média | Semana 9-10 |
| **Vendas (CRM)** | MÉDIA | Baixa | Semana 10 |
| **Logística** | MÉDIA | Baixa | Semana 10-11 |

**Funcionalidades do Tutor:**
- 📦 Otimização de pedidos (evitar ruptura)
- 🏥 Checklist pré-cirúrgico inteligente
- 💰 Negociação com fornecedores (benchmark de preços)
- 🚚 Otimização de rotas (economia de combustível)

### **Onda 4: Gestão & Analytics (ESTRATÉGICO)** ⭐

| Módulo | Prioridade | Complexidade | Prazo |
|--------|-----------|--------------|-------|
| **BI Analytics** | MÉDIA | Alta | Semana 11-12 |
| **Cadastros** | BAIXA | Baixa | Semana 12 |
| **RH** | BAIXA | Média | Semana 13 |

---

## 🏗️ ARQUITETURA DE UPLOAD E ANÁLISE DE DOCUMENTOS

### **Sistema de Upload Inteligente**

```typescript
// /src/components/tutores/DocumentUpload.tsx

interface DocumentAnalysis {
  tipo: 'PGR' | 'ANVISA' | 'FISCAL' | 'CONTABIL';
  status: 'conforme' | 'nao_conforme' | 'vencido' | 'proximo_vencimento';
  score: number; // 0-100
  problemas: string[];
  recomendacoes: string[];
  proximaRevisao: Date;
  legislacaoAplicavel: string[];
}

const DocumentUploadWidget = ({ modulo }: { modulo: string }) => {
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    
    // 1. Upload para Supabase Storage
    const { data: uploadData } = await supabase.storage
      .from('documentos-regulatorios')
      .upload(`${modulo}/${file.name}`, file);
    
    // 2. OCR (Tesseract local)
    const extractedText = await extractText(file);
    
    // 3. Análise com Ollama + RAG
    const analysis = await analyzeDocument({
      text: extractedText,
      tipo: modulo,
      referenceDate: new Date()
    });
    
    // 4. Verificar legislação atualizada (scraping ANVISA/RFB)
    const legislacao = await checkLegislacao(modulo);
    
    setAnalysis({
      ...analysis,
      legislacaoAplicavel: legislacao
    });
    
    setUploading(false);
  };

  return (
    <div className="document-upload">
      <Dropzone onDrop={handleUpload} />
      
      {uploading && <Spinner />}
      
      {analysis && (
        <AnalysisReport 
          score={analysis.score}
          problemas={analysis.problemas}
          recomendacoes={analysis.recomendacoes}
        />
      )}
    </div>
  );
};
```

### **Pipeline de Análise**

```
┌─────────────┐
│ Upload PDF  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ OCR Local   │ (Tesseract)
│ Extract Text│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Ollama+RAG  │ Análise de conformidade
│ Compliance  │ vs legislação armazenada
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Web Scraper │ Verifica atualizações
│ ANVISA/RFB  │ de legislação
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Report      │ Score + Problemas
│ Generation  │ + Recomendações
└─────────────┘
```

---

## 🔄 DETECÇÃO DE MUDANÇAS LEGISLATIVAS

### **Scraper ANVISA (Automatizado)**

```javascript
// /tools/compliance/scrape-anvisa.js

import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

const ANVISA_URLS = {
  rdcs: 'https://www.gov.br/anvisa/pt-br/assuntos/regulamentacao',
  opme: 'https://www.gov.br/anvisa/pt-br/assuntos/regulamentacao/dispositivos-medicos'
};

async function scrapeAnvisaUpdates() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(ANVISA_URLS.rdcs);
  
  // Extrair RDCs publicadas nos últimos 30 dias
  const rdcs = await page.evaluate(() => {
    const items = document.querySelectorAll('.rdc-item');
    return Array.from(items).map(item => ({
      numero: item.querySelector('.rdc-numero')?.textContent,
      titulo: item.querySelector('.rdc-titulo')?.textContent,
      dataPublicacao: item.querySelector('.rdc-data')?.textContent,
      url: item.querySelector('a')?.href
    }));
  });
  
  await browser.close();
  
  // Armazenar no banco
  await supabase.from('legislacao_updates').insert(
    rdcs.map(rdc => ({
      fonte: 'ANVISA',
      tipo: 'RDC',
      numero: rdc.numero,
      titulo: rdc.titulo,
      data_publicacao: new Date(rdc.dataPublicacao),
      url: rdc.url,
      processado: false
    }))
  );
  
  // Notificar usuários
  await notifyUsersOfLegislationChange(rdcs);
}

// Executar diariamente (cron)
```

### **Notificações de Mudanças**

```sql
-- Tabela de legislação
CREATE TABLE legislacao_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fonte TEXT NOT NULL, -- 'ANVISA', 'RFB', 'CFM'
  tipo TEXT NOT NULL, -- 'RDC', 'IN', 'Portaria'
  numero TEXT NOT NULL,
  titulo TEXT NOT NULL,
  data_publicacao DATE NOT NULL,
  url TEXT,
  resumo TEXT,
  impacto TEXT[], -- ['estoque', 'cirurgias', 'compliance']
  processado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Notificações aos usuários
CREATE TABLE notificacoes_legislacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legislacao_id UUID REFERENCES legislacao_updates(id),
  usuario_id UUID REFERENCES auth.users(id),
  modulo TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 CRONOGRAMA DE EXECUÇÃO (13 Semanas)

### **Semana 1-2: Compliance & Regulatório (Onda 1)** 🔴 CRÍTICO

- [ ] Configurar Ollama (Llama 3.1 8B)
- [ ] Implementar sistema de upload de documentos
- [ ] Criar Tutor de PGR (Programa Gerenciamento Riscos)
- [ ] Criar Tutor de Compliance ANVISA
- [ ] Pipeline de OCR (Tesseract)
- [ ] RAG para documentação ANVISA

**Entregáveis:**
- ✅ Upload funcional + OCR
- ✅ Análise de conformidade PGR
- ✅ Checklist ANVISA interativo
- ✅ Score de compliance (0-100)

### **Semana 3-5: Financeiro Core (Onda 2 - Parte 1)** 🟡 ALTA

- [ ] Tutor Financeiro Avançado
- [ ] Auditor de Contas Bancárias (conciliação)
- [ ] Faturamento/Cobrança IA
- [ ] Integração com APIs bancárias (Pluggy)

**Entregáveis:**
- ✅ Conciliação automática bancária
- ✅ Detecção de tarifas abusivas
- ✅ Insights de cobrança (inadimplência)

### **Semana 6-8: Financeiro Avançado + Fiscal (Onda 2 - Parte 2)** 🟡 ALTA

- [ ] Negociador de Tarifas IA
- [ ] Consultor de Score de Crédito
- [ ] Plano de Contas Inteligente
- [ ] Fiscal Lucro Real (ULTRA complexo)
- [ ] Auditor Contábil (Isenções)
- [ ] DRE Inteligente

**Entregáveis:**
- ✅ Cartas de negociação auto-geradas
- ✅ Recomendações de melhoria de score
- ✅ Cálculo de Lucro Real automatizado
- ✅ Identificação de isenções aplicáveis
- ✅ DRE com insights de IA

### **Semana 8-11: Operacional (Onda 3)** 🟢 MÉDIA

- [ ] Tutor Cirurgias (checklist pré-cirúrgico)
- [ ] Tutor Estoque (otimização)
- [ ] Tutor Compras (negociação fornecedores)
- [ ] Tutor Vendas/CRM (pipeline)
- [ ] Tutor Logística (rotas)

### **Semana 11-13: Analytics & Gestão (Onda 4)** 🔵 BAIXA

- [ ] Tutor BI Analytics
- [ ] Tutor Cadastros
- [ ] Tutor RH

---

## 🎯 SLOs CONFIRMADOS

| Métrica | SLO | Como Medir |
|---------|-----|------------|
| **p95 UI** | ≥95% < 1s | Lighthouse + RUM |
| **p95 SQL** | ≥95% < 200ms | pg_stat_statements |
| **Cache Hit Ratio** | >99% | PostgreSQL stats |
| **Uptime** | 99.9% | UptimeRobot |
| **Error Rate** | <1% | Sentry |
| **Satisfação Tutor** | ≥4.0/5.0 | Feedback in-app |

---

## 🔧 FEATURE FLAGS (A/B Testing)

### **Sistema de Feature Flags**

```typescript
// /src/lib/feature-flags.ts

interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  userSegments?: string[]; // ['admin', 'beta_testers']
}

const FLAGS = {
  // Substituições OSS
  ollama_enabled: { enabled: false, rolloutPercentage: 0 },
  meilisearch_enabled: { enabled: false, rolloutPercentage: 0 },
  tesseract_ocr: { enabled: false, rolloutPercentage: 0 },
  
  // Tutores IA por módulo
  tutor_pgr: { enabled: false, rolloutPercentage: 0 },
  tutor_anvisa: { enabled: false, rolloutPercentage: 0 },
  tutor_financeiro: { enabled: false, rolloutPercentage: 0 },
  tutor_fiscal: { enabled: false, rolloutPercentage: 0 },
  
  // Features experimentais
  auto_compliance_check: { enabled: false, rolloutPercentage: 0 },
  smart_tarifas_negotiation: { enabled: false, rolloutPercentage: 0 }
};

export function useFeatureFlag(flagName: string): boolean {
  const user = useAuth();
  const flag = FLAGS[flagName];
  
  if (!flag) return false;
  
  // Admin sempre tem acesso
  if (user?.role === 'admin') return true;
  
  // Rollout gradual
  if (flag.rolloutPercentage === 100) return flag.enabled;
  if (flag.rolloutPercentage === 0) return false;
  
  // Hash do user ID para consistência
  const userHash = hashCode(user.id) % 100;
  return userHash < flag.rolloutPercentage;
}

// Exemplo de uso
const OllamaChat = () => {
  const ollamaEnabled = useFeatureFlag('ollama_enabled');
  
  if (ollamaEnabled) {
    return <OllamaChatWidget />;
  } else {
    return <OpenAIChatWidget />;
  }
};
```

### **Tabela de Feature Flags (DB)**

```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  user_segments TEXT[],
  created_by UUID REFERENCES auth.users(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Logs de ativação/desativação
CREATE TABLE feature_flags_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_id UUID REFERENCES feature_flags(id),
  action TEXT NOT NULL, -- 'enabled', 'disabled', 'rollout_changed'
  old_value JSONB,
  new_value JSONB,
  changed_by UUID REFERENCES auth.users(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📦 PREPARAÇÃO PARA UPLOAD DE DOCUMENTAÇÃO

### **Storage Buckets (Supabase)**

```sql
-- Buckets para documentos regulatórios
INSERT INTO storage.buckets (id, name, public) VALUES
  ('documentos-pgr', 'documentos-pgr', false),
  ('documentos-anvisa', 'documentos-anvisa', false),
  ('documentos-fiscais', 'documentos-fiscais', false),
  ('documentos-contabeis', 'documentos-contabeis', false);

-- Policies (RLS)
CREATE POLICY "Usuários autenticados podem fazer upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('documentos-pgr', 'documentos-anvisa', 'documentos-fiscais', 'documentos-contabeis'));

CREATE POLICY "Usuários podem ler seus documentos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id IN ('documentos-pgr', 'documentos-anvisa', 'documentos-fiscais', 'documentos-contabeis'));
```

### **Interface de Upload**

```tsx
// /src/components/compliance/DocumentManager.tsx

const DocumentManager = ({ categoria }: { categoria: 'PGR' | 'ANVISA' | 'FISCAL' }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const handleUpload = async (files: FileList) => {
    for (const file of files) {
      // 1. Upload
      const { data } = await supabase.storage
        .from(`documentos-${categoria.toLowerCase()}`)
        .upload(`${Date.now()}-${file.name}`, file);
      
      // 2. Processar (OCR + Análise)
      const analysis = await processDocument(file, categoria);
      
      // 3. Salvar metadados
      await supabase.from('documentos_regulatorios').insert({
        categoria,
        nome: file.name,
        url: data.path,
        status: analysis.conforme ? 'conforme' : 'nao_conforme',
        score: analysis.score,
        problemas: analysis.problemas,
        validade: analysis.dataValidade
      });
      
      // 4. Notificar se não conforme
      if (!analysis.conforme) {
        await createNotification({
          tipo: 'compliance_issue',
          titulo: `Documento ${file.name} não conforme`,
          descricao: analysis.problemas.join('; ')
        });
      }
    }
    
    // Recarregar lista
    loadDocuments();
  };
  
  return (
    <div className="document-manager">
      <Dropzone onDrop={handleUpload} accept=".pdf,.doc,.docx" />
      
      <DocumentList documents={documents} />
      
      <ComplianceScore score={calculateOverallScore(documents)} />
    </div>
  );
};
```

---

## 🎯 METAS DE ECONOMIA (Atualizadas)

Com os módulos prioritários definidos:

| Categoria | Economia Estimada/ano |
|-----------|----------------------|
| **Ollama vs OpenAI** (15 tutores) | US$ 1.2k - 4k |
| **Meilisearch** (busca OSS) | US$ 600 - 2k |
| **Tesseract OCR** (análise docs) | US$ 400 - 2k |
| **Analytics OSS** (PostHog) | US$ 300 - 1k |
| **Negociador Tarifas** (redução tarifas) | US$ 1k - 5k |
| **Fiscal IA** (evitar multas) | US$ 2k - 10k |
| **TOTAL** | **US$ 5.5k - 24k/ano** 🎯 |

**Meta original:** US$ 3k-9k/ano ✅ **SUPERADA!**

---

## ✅ PRÓXIMAS AÇÕES IMEDIATAS

### **Esta Semana (Semana 1):**

1. [ ] Instalar e configurar Ollama
2. [ ] Criar tabela `conhecimento_base` (pgvector)
3. [ ] Implementar sistema de upload (Supabase Storage)
4. [ ] Criar Tutor PGR (piloto)
5. [ ] Setup de feature flags

### **Comando para iniciar:**

```bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Baixar modelo
ollama pull llama3.1:8b

# Criar estrutura DB
npm run db:migrate -- compliance

# Iniciar monitoramento
pm2 start ecosystem.economia.config.js
```

---

**© 2025 ICARUS v5.0 — Pronto para Fase S1!** 🚀

