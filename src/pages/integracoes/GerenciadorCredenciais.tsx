/**
 * Gerenciador de Credenciais - API Gateway
 * 
 * Interface para gerenciar todas as credenciais das integrações:
 * - 4 Serviços de Comunicação
 * - 5 Fabricantes OPME
 * - Outras integrações (InfoSimples, etc)
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Save, TestTube, CheckCircle, XCircle, AlertTriangle, Lock } from 'lucide-react';

interface Credencial {
  id: string;
  servico: string;
  nome: string;
  tipo: 'text' | 'password' | 'api_key' | 'oauth2';
  valor?: string;
  descricao: string;
  obrigatorio: boolean;
  categoria: 'comunicacao' | 'opme' | 'apis' | 'outros';
  testavel: boolean;
  status?: 'configurado' | 'pendente' | 'invalido';
}

const CREDENCIAIS_TEMPLATE: Credencial[] = [
  // === COMUNICAÇÃO ===
  {
    id: 'twilio_account_sid',
    servico: 'Twilio',
    nome: 'TWILIO_ACCOUNT_SID',
    tipo: 'text',
    descricao: 'Account SID da conta Twilio (inicia com AC)',
    obrigatorio: true,
    categoria: 'comunicacao',
    testavel: true
  },
  {
    id: 'twilio_auth_token',
    servico: 'Twilio',
    nome: 'TWILIO_AUTH_TOKEN',
    tipo: 'password',
    descricao: 'Auth Token da conta Twilio',
    obrigatorio: true,
    categoria: 'comunicacao',
    testavel: true
  },
  {
    id: 'twilio_phone_number',
    servico: 'Twilio',
    nome: 'TWILIO_PHONE_NUMBER',
    tipo: 'text',
    descricao: 'Número de telefone Twilio (formato: +5511999999999)',
    obrigatorio: true,
    categoria: 'comunicacao',
    testavel: false
  },
  {
    id: 'whatsapp_access_token',
    servico: 'WhatsApp',
    nome: 'WHATSAPP_ACCESS_TOKEN',
    tipo: 'password',
    descricao: 'Access Token do WhatsApp Business API',
    obrigatorio: true,
    categoria: 'comunicacao',
    testavel: true
  },
  {
    id: 'sendgrid_api_key',
    servico: 'SendGrid',
    nome: 'SENDGRID_API_KEY',
    tipo: 'api_key',
    descricao: 'API Key do SendGrid (inicia com SG.)',
    obrigatorio: true,
    categoria: 'comunicacao',
    testavel: true
  },
  {
    id: 'sendgrid_from_email',
    servico: 'SendGrid',
    nome: 'SENDGRID_FROM_EMAIL',
    tipo: 'text',
    descricao: 'Email remetente verificado no SendGrid',
    obrigatorio: true,
    categoria: 'comunicacao',
    testavel: false
  },
  {
    id: 'mailchimp_api_key',
    servico: 'Mailchimp',
    nome: 'MAILCHIMP_API_KEY',
    tipo: 'api_key',
    descricao: 'API Key do Mailchimp (formato: key-dc)',
    obrigatorio: true,
    categoria: 'comunicacao',
    testavel: true
  },
  {
    id: 'mailchimp_dc',
    servico: 'Mailchimp',
    nome: 'MAILCHIMP_DC',
    tipo: 'text',
    descricao: 'Data Center do Mailchimp (ex: us1, us2)',
    obrigatorio: true,
    categoria: 'comunicacao',
    testavel: false
  },

  // === FABRICANTES OPME ===
  {
    id: 'abbott_api_key',
    servico: 'Abbott',
    nome: 'ABBOTT_API_KEY',
    tipo: 'api_key',
    descricao: 'API Key do Abbott Track&Trace',
    obrigatorio: true,
    categoria: 'opme',
    testavel: true
  },
  {
    id: 'medtronic_client_id',
    servico: 'Medtronic',
    nome: 'MEDTRONIC_CLIENT_ID',
    tipo: 'text',
    descricao: 'Client ID do Medtronic VISION',
    obrigatorio: true,
    categoria: 'opme',
    testavel: true
  },
  {
    id: 'medtronic_client_secret',
    servico: 'Medtronic',
    nome: 'MEDTRONIC_CLIENT_SECRET',
    tipo: 'password',
    descricao: 'Client Secret do Medtronic VISION',
    obrigatorio: true,
    categoria: 'opme',
    testavel: true
  },
  {
    id: 'jj_tracelink_token',
    servico: 'J&J',
    nome: 'JJ_TRACELINK_TOKEN',
    tipo: 'api_key',
    descricao: 'Token de acesso ao J&J TraceLink',
    obrigatorio: true,
    categoria: 'opme',
    testavel: true
  },
  {
    id: 'stryker_api_key',
    servico: 'Stryker',
    nome: 'STRYKER_API_KEY',
    tipo: 'api_key',
    descricao: 'API Key do Stryker Connect',
    obrigatorio: true,
    categoria: 'opme',
    testavel: true
  },
  {
    id: 'boston_scientific_token',
    servico: 'Boston Scientific',
    nome: 'BOSTON_SCIENTIFIC_TOKEN',
    tipo: 'api_key',
    descricao: 'Token do Boston Scientific iTrace',
    obrigatorio: true,
    categoria: 'opme',
    testavel: true
  },

  // === OUTRAS APIS ===
  {
    id: 'infosimples_token',
    servico: 'InfoSimples',
    nome: 'INFOSIMPLES_TOKEN',
    tipo: 'api_key',
    descricao: 'Token InfoSimples para APIs agregadas',
    obrigatorio: false,
    categoria: 'apis',
    testavel: true
  }
];

export default function GerenciadorCredenciais() {
  const [credenciais, setCredenciais] = useState<Credencial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [categoria, setCategoria] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');

  useEffect(() => {
    carregarCredenciais();
  }, []);

  const carregarCredenciais = async () => {
    try {
      setLoading(true);

      // Buscar credenciais do Supabase
      const { data: configData, error } = await supabase
        .from('api_credentials')
        .select('*')
        .order('servico');

      if (error) throw error;

      // Mapear credenciais existentes com template
      const credenciaisMap = new Map(configData?.map(c => [c.nome, c.valor]) || []);

      const credenciaisCompletas = CREDENCIAIS_TEMPLATE.map(cred => ({
        ...cred,
        valor: credenciaisMap.get(cred.nome) || '',
        status: credenciaisMap.has(cred.nome) && credenciaisMap.get(cred.nome) 
          ? 'configurado' 
          : 'pendente'
      })) as Credencial[];

      setCredenciais(credenciaisCompletas);
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao carregar credenciais:', err);
    } finally {
      setLoading(false);
    }
  };

  const salvarCredencial = async (credencial: Credencial) => {
    try {
      setSaving(true);

      // Upsert na tabela api_credentials
      const { error } = await supabase
        .from('api_credentials')
        .upsert({
          nome: credencial.nome,
          servico: credencial.servico,
          valor: credencial.valor,
          categoria: credencial.categoria,
          tipo: credencial.tipo,
          atualizado_em: new Date().toISOString()
        }, {
          onConflict: 'nome'
        });

      if (error) throw error;

      // Atualizar status local
      setCredenciais(prev => 
        prev.map(c => 
          c.id === credencial.id 
            ? { ...c, status: c.valor ? 'configurado' : 'pendente' }
            : c
        )
      );

      alert('✅ Credencial salva com sucesso!');
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao salvar credencial:', err);
      alert('❌ Erro ao salvar credencial');
    } finally {
      setSaving(false);
    }
  };

  const testarCredencial = async (credencial: Credencial) => {
    try {
      setTesting(credencial.id);

      // Chamar endpoint de teste
      const { data, error } = await supabase.functions.invoke('test-credential', {
        body: {
          servico: credencial.servico,
          nome: credencial.nome,
          valor: credencial.valor
        }
      });

      if (error) throw error;

      if (data?.success) {
        setCredenciais(prev => 
          prev.map(c => 
            c.id === credencial.id ? { ...c, status: 'configurado' } : c
          )
        );
        alert('✅ Credencial válida!');
      } else {
        setCredenciais(prev => 
          prev.map(c => 
            c.id === credencial.id ? { ...c, status: 'invalido' } : c
          )
        );
        alert('❌ Credencial inválida');
      }
    } catch (error) {
   const err = error as Error;
      console.error('Erro ao testar credencial:', err);
      alert('⚠️ Erro ao testar credencial');
    } finally {
      setTesting(null);
    }
  };

  const atualizarValor = (id: string, valor: string) => {
    setCredenciais(prev => 
      prev.map(c => c.id === id ? { ...c, valor } : c)
    );
  };

  const toggleShowPassword = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const credenciaisFiltradas = credenciais.filter(c => {
    const matchCategoria = categoria === 'todas' || c.categoria === categoria;
    const matchStatus = filtroStatus === 'todas' || c.status === filtroStatus;
    return matchCategoria && matchStatus;
  });

  const estatisticas = {
    total: credenciais.length,
    configuradas: credenciais.filter(c => c.status === 'configurado').length,
    pendentes: credenciais.filter(c => c.status === 'pendente').length,
    invalidas: credenciais.filter(c => c.status === 'invalido').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando credenciais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="neumorphic-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Gerenciador de Credenciais
            </h1>
            <p className="text-sm" style={{ color: 'var(--orx-text-secondary)' }}>
              Configure todas as credenciais das integrações do sistema
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="neumorphic-inset p-4 rounded-lg">
            <div className="text-sm" style={{ color: 'var(--orx-text-secondary)' }}>Total</div>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
          </div>
          <div className="neumorphic-inset p-4 rounded-lg">
            <div className="text-sm" style={{ color: 'var(--orx-success)' }}>Configuradas</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--orx-success)' }}>
              {estatisticas.configuradas}
            </div>
          </div>
          <div className="neumorphic-inset p-4 rounded-lg">
            <div className="text-sm" style={{ color: 'var(--orx-warning)' }}>Pendentes</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--orx-warning)' }}>
              {estatisticas.pendentes}
            </div>
          </div>
          <div className="neumorphic-inset p-4 rounded-lg">
            <div className="text-sm" style={{ color: 'var(--orx-danger)' }}>Inválidas</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--orx-danger)' }}>
              {estatisticas.invalidas}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="neumorphic-card p-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm mb-2">Categoria</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="neumorphic-inset w-full px-4 py-2 rounded-lg"
          >
            <option value="todas">Todas</option>
            <option value="comunicacao">📱 Comunicação (4)</option>
            <option value="opme">🏥 OPME (5)</option>
            <option value="apis">🔗 APIs (1+)</option>
            <option value="outros">⚙️ Outros</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-2">Status</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="neumorphic-inset w-full px-4 py-2 rounded-lg"
          >
            <option value="todas">Todas</option>
            <option value="configurado">✅ Configuradas</option>
            <option value="pendente">⏳ Pendentes</option>
            <option value="invalido">❌ Inválidas</option>
          </select>
        </div>
      </div>

      {/* Lista de Credenciais */}
      <div className="space-y-4">
        {credenciaisFiltradas.map((cred) => (
          <div key={cred.id} className="neumorphic-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{cred.servico}</h3>
                  {cred.status === 'configurado' && (
                    <CheckCircle className="w-5 h-5" style={{ color: 'var(--orx-success)' }} />
                  )}
                  {cred.status === 'pendente' && (
                    <AlertTriangle className="w-5 h-5" style={{ color: 'var(--orx-warning)' }} />
                  )}
                  {cred.status === 'invalido' && (
                    <XCircle className="w-5 h-5" style={{ color: 'var(--orx-danger)' }} />
                  )}
                  {cred.obrigatorio && (
                    <span className="text-xs px-2 py-1 rounded" style={{ 
                      background: 'var(--orx-danger)',
                      color: 'white'
                    }}>
                      Obrigatório
                    </span>
                  )}
                </div>
                <p className="text-sm font-mono" style={{ color: 'var(--orx-text-secondary)' }}>
                  {cred.nome}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--orx-text-secondary)' }}>
                  {cred.descricao}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type={showPassword[cred.id] || cred.tipo === 'text' ? 'text' : 'password'}
                  value={cred.valor || ''}
                  onChange={(e) => atualizarValor(cred.id, e.target.value)}
                  placeholder={`Digite ${cred.nome}...`}
                  className="neumorphic-inset w-full px-4 py-3 rounded-lg pr-12"
                />
                {(cred.tipo === 'password' || cred.tipo === 'api_key') && (
                  <button
                    type="button"
                    onClick={() => toggleShowPassword(cred.id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword[cred.id] ? (
                      <EyeOff className="w-5 h-5" style={{ color: 'var(--orx-text-secondary)' }} />
                    ) : (
                      <Eye className="w-5 h-5" style={{ color: 'var(--orx-text-secondary)' }} />
                    )}
                  </button>
                )}
              </div>

              <button
                onClick={() => salvarCredencial(cred)}
                disabled={saving || !cred.valor}
                className="neumorphic-button px-6 py-3 rounded-lg flex items-center gap-2"
                style={{
                  opacity: saving || !cred.valor ? 0.5 : 1,
                  cursor: saving || !cred.valor ? 'not-allowed' : 'pointer'
                }}
              >
                <Save className="w-5 h-5" />
                Salvar
              </button>

              {cred.testavel && (
                <button
                  onClick={() => testarCredencial(cred)}
                  disabled={testing === cred.id || !cred.valor}
                  className="neumorphic-button px-6 py-3 rounded-lg flex items-center gap-2"
                  style={{
                    opacity: testing === cred.id || !cred.valor ? 0.5 : 1,
                    cursor: testing === cred.id || !cred.valor ? 'not-allowed' : 'pointer'
                  }}
                >
                  <TestTube className="w-5 h-5" />
                  {testing === cred.id ? 'Testando...' : 'Testar'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {credenciaisFiltradas.length === 0 && (
        <div className="neumorphic-card p-12 text-center">
          <p style={{ color: 'var(--orx-text-secondary)' }}>
            Nenhuma credencial encontrada com os filtros selecionados.
          </p>
        </div>
      )}
    </div>
  );
}

